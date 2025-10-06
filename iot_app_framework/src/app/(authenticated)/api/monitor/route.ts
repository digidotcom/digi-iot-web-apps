import { MONITORS_INVENTORY } from "@services/drm/api-constants";
import { PARAM_MONITOR_DEF_ID, PARAM_MONITOR_ID } from "@services/drm/monitors";
import appLog from "@utils/log-utils";
import { Mutex } from "async-mutex";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import RemoteManagerMonitorTCPClient from "./monitor-tcp-client";

/**
 * Interface representing a monitor stream, with a readable for the client to
 * read data from and a writer used in this API where the monitor incoming
 * traffic is written to.
 */
interface MonitorStream {
    readable: ReadableStream;
    writer: WritableStreamDefaultWriter;
}

/**
 * Interface representing a monitor.
 */
interface Monitor {
    monitorId: number;
    monitorDefId: string;
    apiAuth: string;
    stream: MonitorStream[];
    tcpClient?: RemoteManagerMonitorTCPClient;
}

const log = appLog.getLogger("monitor-handler");

const platform = process.env.DRM_ADDRESS || "https://rm.digi.com";
const { hostname } = new URL(platform);

// Map with all monitors for each customer.
const monitorsMap = new Map<number, Monitor[]>();

// Mutex for safe concurrent access.
const mutex = new Mutex();

// Monitor keepalive in seconds. If the env variable is not defined or is 0, no keepalives will be sent.
const keepaliveInterval = Number(process.env.MONITOR_KEEPALIVE_INTERVAL || "0");

/**
 * This method is executed when doing a GET to `/api/monitor`.
 * 
 * Checks if there exists a monitor for the given monitor definition ID in
 * the DRM customer account and returns the monitor ID if so.
 */
export const GET: (req: Request) => Promise<Response> = withAuth(async (req) => {
    // Get the access token to obtain the customer ID.
    const { token } = req.nextauth;
    if (!token) {
        return NextResponse.json({ error: "Requires Authentication" }, { status: 401 });
    }
    const customerId = token.customerId as number;

    // Get the monitor definition ID from the URL parameters.
    const monDefId = req.nextUrl.searchParams.get(PARAM_MONITOR_DEF_ID);
    if (!monDefId) {
        return NextResponse.json({ error: 'Monitor definition ID required' }, { status: 400 });
    }

    // Check if the given customer has a monitor with the given definition ID.
    let monitorID;
    await mutex.runExclusive(() => {
        const monitor = monitorsMap.get(customerId)?.find(mon => mon.monitorDefId === monDefId);
        if (monitor) {
            monitorID = monitor.monitorId;
        }
    });
    return NextResponse.json({ id: monitorID });
}) as (req: Request) => Promise<Response>;

/**
 * This method is executed when doing a POST to `/api/monitor`.
 * 
 * Creates and runs a TCP client for the monitor with the given ID in the
 * customer account and returns a readable to read from the monitor stream.
 * If there is a TCP client already created for the same monitor definition ID,
 * it just returns a new readable without creating a new TCP client.
 */
export const POST: (req: Request) => Promise<Response> = withAuth(async (req) => {
    // Get the access token and create the auth header.
    const { token } = req.nextauth;
    if (!token) {
        return NextResponse.json({ error: "Requires Authentication" }, { status: 401 });
    }
    const apiAuth = token.apiAuth as string;
    const customerId = token.customerId as number;

    // Get the monitor ID from the URL parameters.
    const monId = req.nextUrl.searchParams.get(PARAM_MONITOR_ID);
    if (!monId) {
        return NextResponse.json({ error: 'Monitor ID required' }, { status: 400 });
    }
    let monitorId = Number(monId);

    // Get the monitor definition ID from the URL parameters.
    const monDefId = req.nextUrl.searchParams.get(PARAM_MONITOR_DEF_ID);
    if (!monDefId) {
        return NextResponse.json({ error: 'Monitor definition ID required' }, { status: 400 });
    }

    return await mutex.runExclusive(async () => {
        // Double check there is not a monitor for the given monitor definition ID but with other monitor ID.
        // If so, delete the more recent monitor and re-use the existing one.
        const existingMonitor = monitorsMap.get(customerId)?.find(mon => mon.monitorDefId === monDefId && mon.monitorId != monitorId);
        if (existingMonitor) {
            log.warn(formatLogMsg(`There is already a monitor for '${monDefId}' with ID '${existingMonitor.monitorId}'`, customerId, monitorId));
            await deleteDRMMonitor(monitorId, customerId, apiAuth);
            monitorId = existingMonitor.monitorId;
        }

        // Create a transform stream to return the reader.
        const { readable, writable } = new TransformStream({
            transform(chunk, controller) {
                if (typeof chunk === "string") {
                    controller.enqueue(`${chunk}\r\n`);
                }
            },
            flush(controller) {
                try {
                    controller.terminate();
                } catch (error) {
                    log.error(formatLogMsg(`TransformStream flush error: ${error}`, customerId, monitorId));
                }
            }
        });
        const writer = writable.getWriter();
        const monitorStream = { readable, writer } as MonitorStream;

        // When the writer is closed, call the corresponding method to remove the stream from the list.
        writer.closed.then(() => onWriterClosed(customerId, monitorId, monitorStream));

        // When the client disconnects, close the writer.
        req.signal.onabort = () => writer.close();

        // Add the just created streams to the list for this customer ID and monitor ID.
        const monitor = addStream(customerId, monitorId, monDefId, apiAuth, monitorStream);
        // If the monitor already has a TCP client, it means that other clients are using the same monitor,
        // so initialize the writer and return the corresponding reader to the client.
        if (monitor.tcpClient) {
            log.info(formatLogMsg("TCP client already exists", customerId, monitorId));
            writer.write("");
            return new NextResponse(readable);
        }

        try {
            log.info(formatLogMsg("Create TCP client", customerId, monitorId));

            // Create a TCP client with the provided monitor ID.
            const tcpClient = new RemoteManagerMonitorTCPClient({ hostname, headers: { Authorization: `Basic ${apiAuth}` } }, monitorId, true);

            // Subscribe to different TCP client events.
            tcpClient.on("connected", () => {
                log.debug(formatLogMsg("Monitor connected", customerId, monitorId));
            });
            tcpClient.on("disconnected", () => {
                log.debug(formatLogMsg("Monitor disconnected", customerId, monitorId));
                // Close all writers.
                getWriters(customerId, monitorId).forEach(writer => writer.close());
            });
            tcpClient.on("connect_response", (status) => {
                log.debug(formatLogMsg(`Monitor connect response: ${status}`, customerId, monitorId));
                // Check status response.
                if (status < 200 || status >= 300) {
                    const errorMessage = "Error connecting monitor " + monId + ": " + status;
                    log.error(formatLogMsg(errorMessage, customerId, monitorId));
                    // Write the error message to all writers.
                    getWriters(customerId, monitorId).forEach(writer => writer.write(JSON.stringify({error: errorMessage})));
                } else {
                    // Initialize the writers.
                    getWriters(customerId, monitorId).forEach(writer => writer.write(""));
                    // Send keepalives at the configured interval.
                    if (keepaliveInterval > 0) {
                        sendKeepalive(customerId, monitorId, tcpClient);
                    }
                }
            });
            tcpClient.on("uncompressed_data", async (data: Buffer) => {
                const decoded = new TextDecoder().decode(data);
                log.trace(formatLogMsg(`Monitor data: ${decoded}`, customerId, monitorId));
                // Write the received data to all writers.
                getWriters(customerId, monitorId).forEach(writer => writer.write(decoded));
            });

            // Save the instance of the TCP client.
            monitor.tcpClient = tcpClient;

            // Start the TCP client.
            tcpClient.start();

            log.info(formatLogMsg("TCP client started", customerId, monitorId));

            // Return the stream readable to the client.
            return new NextResponse(readable);
        } catch (error) {
            log.error(formatLogMsg(`Monitor error: ${error}`, customerId, monitorId));
            writer.close();
            return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
        }
    });
}) as (req: Request) => Promise<Response>;

/**
 * Adds the given stream to the list of streams for the monitor with the given
 * ID and returns the monitor object.
 * 
 * @param customerId Customer ID.
 * @param monitorId Monitor ID.
 * @param monitorDefId Monitor definition ID.
 * @param apiAuth API authentication token.
 * @param stream Stream to add.
 * 
 * @returns The monitor object (new or existing one).
 */
const addStream = (customerId: number, monitorId: number, monitorDefId: string, apiAuth: string, stream: MonitorStream) => {
    // Check if the customer has any monitor.
    let monitors = monitorsMap.get(customerId);
    if (!monitors) {
        monitors = [];
        monitorsMap.set(customerId, monitors);
    }
    // Check if there is already a monitor for the given monitor ID.
    let monitor = monitors.find(mon => mon.monitorId === monitorId);
    if (!monitor) {
        // Not yet, so create it.
        monitor = {
            monitorId,
            monitorDefId,
            apiAuth,
            stream: [stream]
        };
        monitors.push(monitor);
    } else {
        // It already existed, so add the stream.
        monitor.stream.push(stream);
    }
    return monitor;
};

/**
 * Returns the list of writers of the monitor with the given ID registered in
 * the given customer ID account.
 * 
 * @param customerId Customer ID.
 * @param monitorId Monitor ID.
 * 
 * @returns The list of writers (possibly empty).
 */
const getWriters = (customerId: number, monitorId: number) => {
    const monitor = monitorsMap.get(customerId)?.find(mon => mon.monitorId === monitorId);
    if (monitor) {
        return monitor.stream.map(s => s.writer);
    }
    return [];
};

/**
 * Handles what happens when the writer of the given stream is closed.
 * 
 * Removes the stream from the list of streams for the monitor with the given
 * ID. If it was the last one, stops the associated TCP client and deletes
 * the monitor from DRM.
 * 
 * @param customerId Customer ID.
 * @param monitorId Monitor ID.
 * @param stream Monitor stream whose writer has been closed.
 */
const onWriterClosed = async (customerId: number, monitorId: number, stream: MonitorStream) => {
    const monitors = monitorsMap.get(customerId);
    // Sanity checks.
    if (monitors === undefined || monitors.length == 0) { 
        return;
    }
    const monitor = monitors.find(mon => mon.monitorId === monitorId);
    if (monitor === undefined) {
        return;
    }
    // Remove the stream from the list of streams.
    let index = monitor.stream.findIndex(s => s === stream);
    if (index != -1) {
        monitor.stream.splice(index, 1);
    }
    // If no more clients are subscribed to this monitor, stop the TCP client and delete the monitor.
    if (monitor.stream.length == 0) {
        // Stop the TCP client.
        monitor.tcpClient?.stop();
        // Delete the DRM monitor.
        deleteDRMMonitor(monitorId, customerId, monitor.apiAuth);
        // Remove the monitor from the list of monitors for this customer.
        monitors.splice(monitors.findIndex(mon => mon.monitorId === monitor.monitorId), 1);
    }
};

/**
 * Deletes the DRM monitor with the given ID.
 * 
 * @param monitorId ID of the monitor to delete.
 * @param customerId Customer ID.
 * @param apiAuth API authorization token.
 */
const deleteDRMMonitor = async (monitorId: number, customerId: number, apiAuth: string) => {
    log.info(formatLogMsg("Delete DRM monitor", customerId, monitorId));
    await fetch(`${platform}${MONITORS_INVENTORY}/${monitorId}`, {
        method: "DELETE",
        headers: new Headers({ Authorization: `Basic ${apiAuth}` }),
    }).then(() => {
        log.info(formatLogMsg("Monitor deleted", customerId,  monitorId));
    }, (error) => {
        log.error(formatLogMsg(`Monitor delete error: ${error}`, customerId, monitorId));
    });
};

/**
 * Formats the given log message with the given parameters.
 * 
 * @param message Log message.
 * @param customerId Customer ID.
 * @param monitorId Monitor ID.
 * 
 * @returns The formatted log message.
 */
const formatLogMsg = (message: string, customerId: number, monitorId?: number) => {
    return `${message}, customerId=${customerId}${monitorId !== undefined ? `, monitorId=${monitorId}` : ''}`;
};

/**
 * Sends a keepalive every configured interval to all writers of the given TCP 
 * client so that the connection is not closed due to inactivity.
 * 
 * This can happen in Nginx servers, where the default read timeout is 60
 * seconds.
 * 
 * @param customerId Customer ID.
 * @param monitorId Monitor ID.
 * @param tcpClient TCP client.
 */
const sendKeepalive = (customerId: number, monitorId: number, tcpClient: RemoteManagerMonitorTCPClient) => {
    setTimeout(() => {
        // Make sure the TCP client is still started.
        if (tcpClient.connection == null) {
            return;
        }
        // Send an empty message to all writers.
        log.debug(formatLogMsg("Send monitor keepalive", customerId, monitorId));
        getWriters(customerId, monitorId).forEach(writer => writer.write(""));
        // Schedule a new keepalive.
        sendKeepalive(customerId, monitorId, tcpClient);
    }, keepaliveInterval * 1000);
};
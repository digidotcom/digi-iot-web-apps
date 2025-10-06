import EventEmitter from 'events';
import net from 'node:net';
import tls from 'node:tls';
import zlib from 'zlib';

import appLog from '@utils/log-utils';

const log = appLog.getLogger('monitor-tcp-client');
const debug = (...msg: unknown[]) => log.debug(msg);

const UNSECURE_PORT = 3200;
const SECURE_PORT = 3201;
const HEADER_SIZE = 6;
const TYPE_CONNECT_REQUEST = 0x01;
const TYPE_CONNECT_RESPONSE = 0x02;
const TYPE_PUBLISH_MESSAGE = 0x03;
const TYPE_PUBLISH_MESSAGE_RECEIVED = 0x04;
const COMPRESSION_NONE = 0x00;
const COMPRESSION_ZLIB = 0x01;

/*
 * Device Cloud Monitor TCP Client.
 *
 * This class creates a TCP Monitor Client to connect to Digi Remote Manager.
 */
class RemoteManagerMonitorTCPClient extends EventEmitter {
    proxy_options: { hostname: string; headers: { Authorization: string } };
    monitorID: number;
    secure: boolean;
    connection: net.Socket | null;
    receive_buffer: Buffer | null;
    stopping: boolean;
    disconnectNotified: boolean;

    constructor(proxyOptions: { hostname: string, headers: { Authorization: string } }, monitorID: number, secure = true) {
        super();
        this.proxy_options = proxyOptions;
        this.monitorID = monitorID;
        this.secure = secure;
        this.connection = null;
        this.receive_buffer = null;
        this.stopping = false;
        this.disconnectNotified = false;
    }

    start() {
        if (this.secure === true) {
            debug(`Starting Device Cloud Monitor TCP TLS Client... monId=${this.monitorID} on host: ${this.proxy_options.hostname}`);
            this.connection = tls.connect(
                SECURE_PORT,
                {
                    host: this.proxy_options.hostname,
                },
                () => {
                    this._handleSocketConnected();
                }
            );
        } else {
            debug(`Starting Device Cloud Monitor TCP Client... monId=${this.monitorID} on host: ${this.proxy_options.hostname}:${UNSECURE_PORT}`);
            this.connection = net.createConnection(
                UNSECURE_PORT,
                this.proxy_options.hostname,
                () => {
                    this._handleSocketConnected();
                }
            );
        }

        /*
         * Emitted when data is received.
         * The argument data will be a Buffer or String
         */
        this.connection.on('data', (data) => {
            this._handleSocketData(data);
        });

        /*
         * Emitted when the other end of the socket sends a FIN packet.
         */
        this.connection.on('end', () => {
            this._handleSocketEnd();
        });

        /*
         * Emitted if the socket times out from inactivity.
         * This is only to notify that the socket has been idle.
         * The user must manually close the connection.
         */
        this.connection.on('timeout', () => {
            this._handleSocketTimeout();
        });

        /*
         * Emitted when an error occurs.
         * The 'close' event will be called directly following this event.
         */
        this.connection.on('error', (error) => {
            this._handleSocketError(error);
        });

        /*
         * Emitted once the socket is fully closed.
         * The argument had_error is a boolean which says if the socket
         * was closed due to a transmission error.
         */
        this.connection.on('close', () => {
            this._handleSocketClose();
        });
    }

    stop() {
        debug(`stopping the client monitor socket connection monId=${this.monitorID}`);

        // If we already stopping, don't run this again.
        if (this.stopping === true) {
            return;
        }

        // Mark that we are stopping.
        this.stopping = true;

        // If connection is already unallocated, return early.
        if (this.connection === null) {
            return;
        }

        // Remove all our connection listeners.
        debug(`removing the client monitor socket listeners monId=${this.monitorID}`);
        this.connection.removeAllListeners();
        this.removeAllListeners();

        // End the connection.
        this.connection.end();
        this.connection.destroy();
        this.connection = null;
        debug(`stopped the client monitor socket connection monId=${this.monitorID}`);
    }

    private _handleSocketConnected() {
        this.emit('connected');
        debug(`Device Cloud Monitor TCP Client socket connected.  Sending connect_request. monId=${this.monitorID}`);
        this._sendConnectRequest();
    }

    private _handleSocketData(buffer: Buffer) {
        // Append to existing data.
        if (this.receive_buffer !== null) {
            // @ts-ignore
            this.receive_buffer = Buffer.concat([this.receive_buffer, buffer]);
        } else {
            this.receive_buffer = buffer;
        }

        // Ensure we have enough data to read the header.
        const len = this.receive_buffer.length;
        if (len < HEADER_SIZE) {
            return;
        }

        // Extract the type and size.
        const type = this.receive_buffer.readUInt16BE(0);
        const dataSize = this.receive_buffer.readUInt32BE(2);
        debug(`Handle Socket Data=${this.monitorID} ${type} ${dataSize} ${len}`);

        // Ensure we have enough data to complete the response.
        const fullSize = dataSize + HEADER_SIZE;
        if (len < (fullSize)) {
            return;
        }

        // Determine what type of message we got.
        const dataBuffer = this.receive_buffer.slice(HEADER_SIZE, fullSize);
        switch (type) {
            case TYPE_CONNECT_RESPONSE:
                this._parseConnectResponse(dataBuffer);
                break;
            case TYPE_PUBLISH_MESSAGE:
                this._parsePublishMessage(dataBuffer);
                break;
            default: break;
        }
        const nextBuffer = len > fullSize ? this.receive_buffer.slice(fullSize) : null;
        this.receive_buffer = null;
        if (nextBuffer !== null) {
            this._handleSocketData(nextBuffer);
        }
    }

    private _handleSocketEnd() {
        debug(`Socket End monId=${this.monitorID}`);
        if (!this.disconnectNotified) {
            this.disconnectNotified = true;
            this.emit('disconnected', null);
        }
    }

    private _handleSocketTimeout() {
        debug(`Socket Timeout monId=${this.monitorID}`);
        if (!this.disconnectNotified) {
            this.disconnectNotified = true;
            this.emit('disconnected', null);
        }
    }

    private _handleSocketError(error: Error) {
        debug(`Socket Error: ${error}, monId=${this.monitorID}`);
        if (!this.disconnectNotified) {
            this.disconnectNotified = true;
            this.emit('disconnected', error);
        }
    }

    private _handleSocketClose() {
        debug(`Socket Close monId=${this.monitorID}`);
        if (!this.disconnectNotified) {
            this.disconnectNotified = true;
            this.emit('disconnected', null);
        }
    }

    /*
     * Send Connect Request:
     *
     * To initiate a new monitor connection, send a ConnectRequest message
     * from the client application to Device Cloud.
     * This is the first message sent upon connect and will
     * authenticate and activate the monitor.
     *
     * Header [6 Bytes] Type=0x0001
     * Payload:
     *
     *    ProtocolVersion: [2 Bytes] - indicates what version of push protocol is being used.
     *                                 The current version is 0x0001.
     *    UserNameLen [2 Bytes] - length of UserName payload
     *    UserName: [UTF-8 encoded byte array] - the username to authenticate connection
     *    PasswordLen [2 Bytes] - length of Password payload
     *    Password: [UTF-8 encoded byte array] - the password to authenticate connection
     *    MonitorId: [4 Bytes] - the ID of the monitor for this connect
     */
    private _sendConnectRequest() {
        let buffer = Buffer.alloc(1000);
        let pointer = 0;
        let len = 0;

        // Zero out the buffer.
        buffer.fill(0);

        buffer.writeUInt16BE(0x0001, pointer);
        pointer += 2;

        const authorization = this.proxy_options.headers.Authorization;
        let username = '';
        let password = '';

        const basicTokens = authorization.match(/Basic (.+)/);
        if (basicTokens !== null) { // for Basic authentication, decode and send the raw username/password.
            const creds = Buffer.from(basicTokens[1], 'base64').toString().split(':');
            [username, password] = creds;
        } else {
            username = authorization; // else just use the authorization token itself.
        }

        buffer.writeUInt16BE(username.length, pointer);
        pointer += 2;

        len = buffer.write(
            username,
            pointer,
            username.length,
            'utf8'
        );
        pointer += len;

        buffer.writeUInt16BE(password.length, pointer);
        pointer += 2;

        len = buffer.write(
            password,
            pointer,
            password.length,
            'utf8'
        );
        pointer += len;

        buffer.writeUInt32BE(this.monitorID, pointer);
        pointer += 4;

        buffer = buffer.slice(0, pointer);
        this._sendRequest(TYPE_CONNECT_REQUEST, buffer);
    }

    private _sendPublishMessageReceived(dataBlockId: number, status: number) {
        const buffer = Buffer.alloc(4);
        buffer.writeUInt16BE(dataBlockId, 0);
        buffer.writeUInt16BE(status, 2);
        this._sendRequest(TYPE_PUBLISH_MESSAGE_RECEIVED, buffer);
    }

    private _sendRequest(type: number, buffer: Buffer) {
        if (this.connection === null) {
            debug('Error sending request, connection is null');
            return false;
        }
        let ret = false;
        const buffer2 = Buffer.alloc(buffer.length + HEADER_SIZE);

        buffer2.writeUInt16BE(type, 0);
        buffer2.writeUInt32BE(buffer.length, 2);
        // @ts-ignore
        buffer.copy(buffer2, HEADER_SIZE);
        // @ts-ignore
        ret = this.connection.write(buffer2, (error) => {
            if (error) {
                debug(`Error sending request with buffer2: ${error}, ${buffer2}`);
            }
        });
        return ret;
    }

    private _parseConnectResponse(buffer: Buffer) {
        if (this.connection === null) {
            debug('Error sending request, connection is null');
            return;
        }
        const status = buffer.readUInt16BE(0);
        this.emit('connect_response', status);
        if (status < 200 || status >= 300) {
            debug(`Device Monitor TCP client connect request failed with status: ${status} for monId=${this.monitorID}`);
            this.connection.destroy();
        } else {
            debug(`Device Cloud Monitor TCP Client connected. monId=${this.monitorID}`, status, buffer);
        }
    }

    private _parsePublishMessage(buffer: Buffer) {
        const dataBlockId = buffer.readUInt16BE(0);
        const count = buffer.readUInt16BE(2);
        const compression = buffer.readUInt8(4);
        const format = buffer.readUInt8(5);
        const payloadSize = buffer.readUInt32BE(6);
        const payloadData = buffer.slice(10, buffer.length);

        debug(`PEM received: monId=${this.monitorID}, datablockId=${dataBlockId}, count=${count}, compression=${compression}, format=${format}, data.len=${payloadSize}`);
        //  Deal with compression, if needed.
        switch (compression) {
            case COMPRESSION_ZLIB:
                //  Tell any listeners that we got some compressed data.
                zlib.inflate(payloadData, (error, uncompressedBuffer) => {
                    if (error) {
                        debug(`ERROR: ${error}`);
                        return;
                    }

                    this.emit('uncompressed_data', uncompressedBuffer);
                });
                break;

            case COMPRESSION_NONE:
                //  Tell any listeners that we got some uncompressed data.
                this.emit('uncompressed_data', payloadData);
                break;

            default:
                break;
        }

        // Acknowledge the block.
        this._sendPublishMessageReceived(dataBlockId, 200);
    }
}

export default RemoteManagerMonitorTCPClient;

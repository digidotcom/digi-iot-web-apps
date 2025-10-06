import { DeviceRequest } from "@customTypes/sci-types";

function DataService<TBase extends new (...args: any[]) => {}>(Base: TBase) {
    return class extends Base {
        async deviceRequests(deviceIds: string | string[], requests: DeviceRequest[], source: string) {
        let requestList = '';
        requests.forEach((request) => {
            const { payload, targetName } = request;
            if (payload) {
            requestList += `<device_request target_name="${targetName}">${JSON.stringify(payload)}</device_request>`;
            } else {
            requestList += `<device_request target_name="${targetName}" />`;
            }
        });

        const sciResult = await (this as any).sendSCI(
            'data_service',
            deviceIds,
            `<requests>
            ${requestList}
            </requests>`,
            undefined,
            source
        );

        const { sci_reply: { data_service: { device } } } = sciResult;
        const devices = Array.isArray(device) ? device : [device];
        return devices;
        }
    };
}

export default DataService;
  
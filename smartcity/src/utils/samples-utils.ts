import { IoTDeviceProperty } from '@customTypes/device-types';
import { IDataPoint } from '@customTypes/stream-types';
import { AppError } from '@models/AppError';
import { getDataPoints } from '@services/drm/streams';
import appLog from '@utils/log-utils';

const log = appLog.getLogger("samples-helper-functions");

/**
 * Fills the given IoTProperty historic samples.
 * 
 * @param property The IoTProperty to load its hitoric samples.
 * @param size The number of samples to read.
 * 
 * @throws An {@link AppError} if there is any error loading the samples.
 */
export const loadSamples = async (property: IoTDeviceProperty, size: number) => {
    const dataPoints: IDataPoint[] = await getDataPoints(property.stream, size);
    if (dataPoints) {
        property.samplesHistory = dataPoints.map(dataPoint => (
            {
                value: dataPoint.value,
                timeStamp: dataPoint.timestamp
            }
        ));
        property.samplesHistoryRead = true;
    }
};
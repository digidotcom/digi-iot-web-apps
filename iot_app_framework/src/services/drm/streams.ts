import { IDataPoint, IStream } from '@customTypes/stream-types';
import { AppError } from '@models/AppError';
import { STREAMS_HISTORY, STREAMS_INVENTORY } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';

const log = logLevel.getLogger('streams');

/**
 * Returns the Digi Remote Manager data stream with the given ID.
 * 
 * @param streamID ID of the data stream to retrieve.
 * 
 * @returns The {@link IStream} with the given ID.
 * 
 * @throws An {@link AppError} if there is any error reading the stream.
 */
export const getStream = async (streamID: string) => {
    try {
        const res = await DRMRest.get({
            url: `${STREAMS_INVENTORY}/${streamID}`
        });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const stream: IStream = await res.body(true);
        return stream;
    } catch (e) {
        const appError = newAppError(`Error reading stream ${streamID}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Returns the Digi Remote Manager data streams using the given query.
 * 
 * @param query Query to execute in order to get the streams.
 * 
 * @returns The list of requested {@link IStream}s.
 * 
 * @throws An {@link AppError} if there is any error retrieving the streams.
 */
export const getStreams = async (query?: string) => {
    const queryParams = {
        ...(query && { query: query })
    };
    try {
        const res = await DRMRest.get({
            url: `${STREAMS_INVENTORY}`,
            params: queryParams
        });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: IStream[] } = await res.body(true);
        return list;
    } catch (e) {
        const appError = newAppError(`Error reading streams`, e as any);
        log.error(appError.message);
        throw appError;
    }
};

/**
 * Reads and returns an array of data points from the stream with the given ID.
 * 
 * @param streamID ID of the data stream to read data points from.
 * @param size The number of data points to read.
 * 
 * @returns The array of {@link IDataPoint} read.
 * 
 * @throws An {@link AppError} if there is any error reading the data points.
 */
export const getDataPoints = async (streamID: string, size?: number) => {
    try {
        const res = await DRMRest.get({
            url: `${STREAMS_HISTORY}/${streamID}`,
            params: {
                size: size?? 1,
                order: "desc"
            }
        });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        const { list }: { list: IDataPoint[] } = await res.body(true);
        return list;
    } catch (e) {
        const appError = newAppError(`Error reading datapoints from ${streamID}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};
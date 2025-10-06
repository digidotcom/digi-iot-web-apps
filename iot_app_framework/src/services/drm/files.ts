import { IFile } from '@customTypes/file-types';
import { AppError } from '@models/AppError';
import { FILES_INVENTORY } from '@services/drm/api-constants';
import DRMRest from '@services/drm/drm-rest';
import { ERROR_BODY_UNDEFINED, newAppError } from '@utils/error-utils';
import logLevel from '@utils/log-utils';
import JSZip from 'jszip';

const log = logLevel.getLogger("files-functions");

/**
 * Uploads the contents of the given ZIP file to the given fileset.
 * 
 * @param zipFile ZIP file containing the files and dirs to upload.
 * @param fileset Fileset name where the files will be uploaded.
 * 
 * @throws An {@link AppError} if there is any error uploading the files.
 */
export const uploadFileSystem = async (zipFile: File, fileset: string) => {
    // Sanity check.
    if (!zipFile.name.endsWith(".zip")) {
        throw newAppError("File to upload must be a ZIP file");
    }
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);

    // Get all files and directories of the ZIP file.
    for (const relativePath in zipContent.files) {
        const zipEntry = zipContent.files[relativePath];
        // Only process files, not directories.
        if (!zipEntry.dir) {
            const fileContent = await zipEntry.async("nodebuffer");
            await uploadFile(fileContent, fileset, relativePath);
        }
    }
};

/**
 * Uploads the file with the given content to the given fileset and path.
 * 
 * @param content Content of the file to upload.
 * @param fileset Fileset name where the file will be uploaded.
 * @param path Path of the file, including the file name and extension.
 * 
 * @returns The metadata of the uploaded file.
 * 
 * @throws An {@link AppError} if there is any error uploading the file.
 */
export const uploadFile = async (content: Buffer, fileset: string, path: string) => {
    try {
        const res = await DRMRest.post({
            url: `${FILES_INVENTORY}/${fileset}/${path}`,
            headers: { "content-type": "application/octet-stream" },
            body: content
        });
        if (!res.body) {
            throw new Error(ERROR_BODY_UNDEFINED);
        }
        return await res.body(true) as IFile;
    } catch (e) {
        const appError = newAppError(`Error uploading file ${path}`, e as any);
        log.error(appError.message);
        throw appError;
    }
};
/**
 * Interface representing a File in the v1/files APIs.
 */
export interface IFile {
    fileset: string;
    name: string;
    link: string;
    created: string;
    last_modified: string;
    content_type: string;
    size: number;
    md5: string;
    'sha-512': string;
    'sha3-512': string;
    crc32: string;
    listing: {[string: string]: IFile};
    customer_id: number;
}
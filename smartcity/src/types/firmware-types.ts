/**
 * Interface representing a Firmware in the v1/firmware APIs.
 */
export interface IFirmware {
    id: number;
    firmware_version: string;
    sha_512?: string;
    sha3_512?: string;
    information_link?: string;
    security_related?: string;
    production?: boolean;
    deprecated?: boolean;
    file_size?: number;
    artifact_id?: string;
    customer_id?: number;
    type: string;
    vendor_id: number;
    update_time?: Date;
    location: string;
}

/**
 * Interface representing a new Firmware in the v1/firmware APIs.
 */
export interface INewFirmware {
    vendor_id: number;
    type: string;
    firmware_version: string;
    information_link: string;
    security_related: string;
    file: File;
}
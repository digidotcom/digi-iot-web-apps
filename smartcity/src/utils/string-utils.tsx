/**
 * Compares two strings in natural order, considering numeric substrings.
 * 
 * Useful for sorting strings like filenames or version numbers where
 * "file10" should come after "file2".
 * 
 * @param a First string to compare.
 * @param b Second string to compare.
 * 
 * @returns Negative if `a` < `b`, positive if `a` > `b`, or `0` if equal.
 */
export const naturalCompare = (a: string, b: string) => {
    const regex = /(\d+)|(\D+)/g;
    const aParts = a.match(regex) ?? [];
    const bParts = b.match(regex) ?? [];

    for (let i = 0; i < Math.min(aParts!.length, bParts!.length); i++) {
        const aPart = aParts![i];
        const bPart = bParts![i];

        if (aPart !== bPart) {
            const aIsNumber = !isNaN(parseInt(aPart));
            const bIsNumber = !isNaN(parseInt(bPart));

            if (aIsNumber && bIsNumber) {
                return parseInt(aPart) - parseInt(bPart);
            }
            return aPart.localeCompare(bPart);
        }
    }

    return aParts!.length - bParts!.length;
};

/**
 * Compares the given two firmware versions with format `X.X.X.X`.
 * 
 * @param version1 Version 1 to compare.
 * @param version2 Version 2 to compare.
 * 
 * @returns 1 if version 1 is greater than version 2, -1 if version 1 is lower than version 2, or 0 if they are equal.
 */
export const compareFirmwareVersions = (version1: string, version2: string) => {
    // Sanity check.
    const isValid1 = isValidFirmwareVersion(version1);
    const isValid2 = isValidFirmwareVersion(version2);
    if (isValid1 && !isValid2) {
        return 1;
    } else if (!isValid1 && isValid2) {
        return -1;
    } else if (!isValid1 && !isValid2) {
        return 0;
    }
    // Both versions are valid, compare them.
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);
    for (let i = 0; i < 4; i++) {
        if (v1[i] > v2[i]) {
            return 1;
        } else if (v1[i] < v2[i]) {
            return -1;
        }
    }
    return 0;
};

/**
 * Returns the given number as a hexadecimal string.
 * 
 * @param value Number to convert.
 * 
 * @returns The hex string representation.
 */
export const toHexString = (value: number) => {
    return value.toString(16).toUpperCase();
};

/**
 * Returns whether the given text is a valid firmware version (`X.X.X.X`) or not.
 * 
 * @param version Text to check.
 * 
 * @returns `true` if is a valid firmware version, `false` otherwise.
 */
export const isValidFirmwareVersion = (version: string) => {
    const pattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i;
    return pattern.test(version);
};

/**
 * Returns whether the given text is a valid URL or not.
 * 
 * @param url Text to check.
 * 
 * @returns `true` if is a valid URL, `false` otherwise.
 */
export const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
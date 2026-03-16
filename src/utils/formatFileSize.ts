/**
 * Converts a file size in bytes to a human-readable string with appropriate units (KB, MB, GB, TB, etc.).
 *
 * @param bytes The file size in bytes. Must be a non-negative number.
 * @returns {string} The formatted file size with unit (e.g., "1.2 MB").
 * @throws {TypeError} If bytes is not a number or is negative.
 */
export function formatFileSize(bytes: number): string {
    if (isNaN(bytes)) {
        throw new TypeError('Input must be a number');
    }
    if (bytes < 0) {
        throw new TypeError('File size cannot be negative');
    }
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const exponent = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, exponent);
    return `${size.toFixed(2)} ${units[exponent]}`;
}


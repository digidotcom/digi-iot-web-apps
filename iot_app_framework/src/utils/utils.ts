/**
 * Copies the given text to the clipboard.
 * 
 * @param content Text to copy to the clipboard.
 */
export const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
}
// Shared with client components — printFiles.ts itself pulls in the DB pool
// and Node crypto, so it can't be imported from the browser bundle.
export const MAX_QUANTITY = 500;
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

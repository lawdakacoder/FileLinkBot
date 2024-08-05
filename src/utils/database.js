/**
Save file info with message id.
**/
export async function saveFileInfo({ id, fileName, fileId, secret, sender }) {
    const fileData = { fileName, fileId, secret, sender };
    await files_data.put(id.toString(), JSON.stringify(fileData));
}

/**
Get file info with message id.
**/
export async function getFileInfo(id) {
    const fileData = await files_data.get(id.toString());

    return JSON.parse(fileData);
}

/**
Delete file info with message id.
**/
export async function deleteFileInfo(id) {
    await files_data.delete(id.toString());
}
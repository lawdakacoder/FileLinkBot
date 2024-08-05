import { getFile, getFileMetaData } from "../telegram/api";

const inlineMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/bmp',
    'image/webp',
    'video/mp4',
    'video/x-msvideo',
    'video/x-matroska',
    'video/quicktime',
    'audio/mpeg', 
    'audio/wav',
    'text/html'
];

function getMimeType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'mov': 'video/quicktime',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'html': 'text/html',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'zip': 'application/zip',
        'rar': 'application/vnd.rar',
        '7z': 'application/x-7z-compressed',
        'json': 'application/json'
    };

    return mimeTypes[extension] || 'application/octet-stream';
}

function parseRangeHeader(rangeHeader, fileSize) {
    const matches = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
    if (!matches) {
      return null;
    }
    const start = matches[1] ? parseInt(matches[1], 10) : 0;
    const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;
  
    if (start >= fileSize || end >= fileSize || start > end) {
      return null;
    }
  
    return { start, end };
}

export async function handleDownload(request, {fileId, fileName}) {
    const fileHeaders = new Headers();
    const fileMimeType = getMimeType(fileName);
    const contentDispositionType = inlineMimeTypes.includes(fileMimeType) ? 'inline' : 'attachment';

    fileHeaders.set('Content-Disposition', `${contentDispositionType}; filename="${fileName}"`);
    fileHeaders.set('Content-Type', fileMimeType);
    fileHeaders.set('Accept-Ranges', 'bytes');

    const fileMetaData = await getFileMetaData(fileId);
    const fileSize = fileMetaData.result.file_size || 0;
    const fileDownloadPath = fileMetaData.result.file_path;

    fileHeaders.set('Content-Length', fileSize);

    const fileResponse = await getFile(fileDownloadPath);
    const fileBuffer = await fileResponse.arrayBuffer();

    const rangeHeader = request.headers.get('Range');
    if (rangeHeader) {
        const range = parseRangeHeader(rangeHeader, fileSize);
        if (!range) {
            fileHeaders.set('Content-Range', `bytes */${fileSize}`);
            return new Response('Requested Range Not Satisfiable', {
                status: 416,
                headers: fileHeaders
            });
        }

        const chunk = fileBuffer.slice(range.start, range.end + 1);
        fileHeaders.set('Content-Range', `bytes ${range.start}-${range.end}/${fileSize}`);
        fileHeaders.set('Content-Length', chunk.byteLength);
        return new Response(chunk, {
            status: 206,
            headers: fileHeaders
        });
    }

    return new Response(fileBuffer, {
        headers: fileHeaders,
        status: 200
    });
}

import { config } from "../config";
import { sendMessage } from "../telegram/api";
import { saveFileInfo } from "../utils/database";
import { generateFileName, generateUrlSafeToken } from "../utils/misc";
import { Texts } from "../utils/static";
import { handleCommand } from "./commandHandler";

function extractFileInfo(message) {
    const fileTypes = [
        { type: 'document', getFileId: msg => msg.document.file_id, getFileName: msg => msg.document.file_name, getFileSize: msg => msg.document.file_size },
        { type: 'photo', getFileId: msg => msg.photo[msg.photo.length - 1].file_id, getFileName: msg => generateFileName('jpg'), getFileSize: msg => msg.photo[msg.photo.length - 1].file_size },
        { type: 'video', getFileId: msg => msg.video.file_id, getFileName: msg => msg.video.file_name || generateFileName('mp4'), getFileSize: msg => msg.video.file_size }
    ];
  
    for (const fileType of fileTypes) {

        if (message[fileType.type]) {
            return {
                type: fileType.type,
                name: fileType.getFileName(message),
                id: fileType.getFileId(message),
                size: fileType.getFileSize(message) ?? 0
            };
        }
    }   
  
    return null;
}

async function sendFileLinkMessage(message, fileData) {
    const { chat } = message;
    const fileLink = `${config.worker.URL}/dl/${message.message_id}?s=${fileData.secret}`;
    const messageText = Texts.fileLinkGenerated
    .replace('{file_id}', message.message_id)
    .replace('{file_link}', fileLink);
    const replyMarkup = {
        inline_keyboard: [
            [{ text: 'Open Link', url: fileLink }],
            [{ text: 'Revoke Link', callback_data: `revokeLink/${fileData.id}`}]
        ]
    };

    await sendMessage(chat.id, messageText, message.message_id, replyMarkup);
}

async function handleUserFile(message, file) {
    const { from: user } = message;
    const fileData = {
        id: message.message_id,
        fileName: file.name,
        fileId: file.id,
        secret: generateUrlSafeToken(16),
        sender: user.id
    };

    await saveFileInfo(fileData);
    await sendFileLinkMessage(message, fileData);
}

export async function handleMessage(message) {
    const { chat, text } = message;
    
    if (text?.startsWith('/')) {
        await handleCommand(message);
        return;
    } else if (chat.type !== 'private') {
        return;
    }

    const file = extractFileInfo(message);

    if (file?.size <= config.telegram.MAX_FILE_SIZE) {
        await handleUserFile(message, file);
    } else if (file?.size > config.telegram.MAX_FILE_SIZE) {
        await sendMessage(chat.id, Texts.fileTooBig, message.message_id);
    }
}
import { config } from "../config";

/**
Send request to Bot API.
**/
async function sendRequest(
    method,
    payload,
    isFormData = false
) {
    const url = `${config.telegram.API}/bot${config.bot.TOKEN}/${method}`;
    const options = {
        method: 'POST',
        headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
        body: isFormData ? payload : JSON.stringify(payload)
    };
    const response = await fetch(url, options);

    return await response.json();
}

/**
Send message to Telegram.
**/
export async function sendMessage(
    chatId,
    text,
    replyToMessageId = null,
    replyMarkup = null
) {
    const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
    };

    if (replyToMessageId) {
        payload.reply_parameters = {message_id: replyToMessageId};
    }

    if (replyMarkup) {
        payload.reply_markup = replyMarkup;
    }

    return await sendRequest('sendMessage', payload);
}

/**
Answer callback query.
**/
export async function answerCallbackQuery(
    id,
    text,
    showAlert = false
) {
    const payload = {
        callback_query_id: id,
        text: text,
        show_alert: showAlert
    };

    return await sendRequest('answerCallbackQuery', payload);
}

/**
Get Telegram file's metadata.
**/
export async function getFileMetaData(fileId) {
    const payload = {
        file_id: fileId
    };

    return await sendRequest('getFile', payload);
}

/**
Get Telegram file.
**/
export async function getFile(filePath) {
    const fileUrl = `${config.telegram.API}/file/bot${config.bot.TOKEN}/${filePath}`;

    return await fetch(fileUrl);
}
import { sendMessage } from "../telegram/api";
import { deleteFileInfo, getFileInfo } from "../utils/database";
import { isPositiveIntegerString } from "../utils/logic";
import { Texts } from "../utils/static";

async function startCommand(message, args) {
    if (args.length !== 0) {
        // to do
    }

    const { from: user, chat } = message;
    const messageText = Texts.startCommand.replace('{first_name}', user.first_name);
    const replyMarkup = { 
        inline_keyboard: [[{ text: 'Source Code', url: 'https://github.com/lawdakacoder/FileLinkBot' }]]
    };
    
    await sendMessage(chat.id, messageText, message.message_id, replyMarkup);
}

async function helpCommand(message) {
    const { chat } = message;
    const messageText = Texts.helpCommand;

    await sendMessage(chat.id, messageText, message.message_id);
}

export async function deleteCommand(message, args) {
    const { chat } = message;

    if (args.length === 0) {
        await sendMessage(chat.id, Texts.deleteCommand, message.message_id);
        return;
    }

    const fileId = isPositiveIntegerString(args[0])

    if (!fileId) {
        await sendMessage(chat.id, Texts.invalidArgument, message.message_id);
        return;
    }

    const fileData = await getFileInfo(fileId);

    if (!fileData) {
        await sendMessage(chat.id, Texts.fileIdInvalid, message.message_id);
        return;
    } else if (fileData.sender !== chat.id) {
        await sendMessage(chat.id, Texts.userNotFileOwner, message.message_id);
        return;
    } else {
        await deleteFileInfo(fileId);
        await sendMessage(chat.id, Texts.fileLinkRevoked, message.message_id);
    }
}

async function unknownCommand(message) {
    const { chat } = message;
    const messageText = Texts.unknownCommand;

    await sendMessage(chat.id, messageText, message.message_id);
}

export async function handleCommand(message) {
    const { text } = message;
    const [command, ...args] = text.split(' ');

    switch (command) {
        case '/start':
            await startCommand(message, args);
            break;
        case '/help':
            await helpCommand(message);
            break;
        case '/del':
            await deleteCommand(message, args);
            break;
        default:
            await unknownCommand(message);
    }
}
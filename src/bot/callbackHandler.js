import { answerCallbackQuery } from "../telegram/api";
import { Texts } from "../utils/static";
import { deleteCommand } from "./commandHandler";

export async function handleCallbackQuery(callbackQuery) {
    const { id, data: text } = callbackQuery;
    const [query, ...args] = text.split('/');

    switch (query) {
        case 'revokeLink':
            await deleteCommand(callbackQuery.message, args);
            await answerCallbackQuery(id, Texts.queryExecuted);
            break;
        default:
            await answerCallbackQuery(id, Texts.queryDataInvalid, true);
    }
}
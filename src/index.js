import { handleCallbackQuery } from "./bot/callbackHandler";
import { handleDownload } from "./bot/downloadHandler";
import { handleMessage } from "./bot/messageHandler";
import { config } from "./config";
import { getFileInfo } from "./utils/database";

async function handleRequest(request) {
	const url = new URL(request.url);

	if (url.pathname === '/wk' ) {
		const secret_token = request.headers.get('X-Telegram-Bot-Api-Secret-Token');

		if (secret_token !== config.worker.SECRET_TOKEN) {
			return new Response('Authentication Failed.', { status: 403 });
		}

		const data = await request.json();

		if (data.message) {
			await handleMessage(data.message);
		} else if (data.callback_query) {
			await handleCallbackQuery(data.callback_query);
		}

		return new Response('OK', { status: 200 });
	} else if (url.pathname.startsWith('/dl/')) {
		const fileId = url.pathname.split('/dl/')[1];
		const fileSecret = url.searchParams.get('s');

		if (!fileId || !fileSecret) {
			return new Response('Invalid file link.', { status: 404 });
		}

		const fileData = await getFileInfo(fileId);

		if (!fileData) {
			return new Response('File has been deleted by owner.', { status: 404 });
		} else if (fileData.secret !== fileSecret) {
			return new Response('Invalid file link.', { status: 404 });
		}
		
		return await handleDownload(request, fileData);
	}
	
	return Response.redirect('https://github.com/lawdakacoder/FileLinkBot', 302);
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
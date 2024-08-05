// This file is auto generated and directly
// deployable to cloudflare workers from
// user dashboard.

(() => {
    // src/config.js
    var config = {
      telegram: {
        // Bot API server to use.
        API: "https://api.telegram.org",
        // In bytes (20 MB)
        MAX_FILE_SIZE: 20 * 1024 * 1024
      },
      bot: {
        // Telegram bot token.
        TOKEN: ""
      },
      worker: {
        // Worker's root url.
        URL: "https://example.workers.dev",
        // Random string to prevent unauthorized execution of worker.
        SECRET_TOKEN: ""
      }
    };
  
    // src/telegram/api.js
    async function sendRequest(method, payload, isFormData = false) {
      const url = `${config.telegram.API}/bot${config.bot.TOKEN}/${method}`;
      const options = {
        method: "POST",
        headers: isFormData ? void 0 : { "Content-Type": "application/json" },
        body: isFormData ? payload : JSON.stringify(payload)
      };
      const response = await fetch(url, options);
      return await response.json();
    }
    async function sendMessage(chatId, text, replyToMessageId = null, replyMarkup = null) {
      const payload = {
        chat_id: chatId,
        text,
        parse_mode: "HTML"
      };
      if (replyToMessageId) {
        payload.reply_parameters = { message_id: replyToMessageId };
      }
      if (replyMarkup) {
        payload.reply_markup = replyMarkup;
      }
      return await sendRequest("sendMessage", payload);
    }
    async function answerCallbackQuery(id, text, showAlert = false) {
      const payload = {
        callback_query_id: id,
        text,
        show_alert: showAlert
      };
      return await sendRequest("answerCallbackQuery", payload);
    }
    async function getFileMetaData(fileId) {
      const payload = {
        file_id: fileId
      };
      return await sendRequest("getFile", payload);
    }
    async function getFile(filePath) {
      const fileUrl = `${config.telegram.API}/file/bot${config.bot.TOKEN}/${filePath}`;
      return await fetch(fileUrl);
    }
  
    // src/utils/static.js
    var Texts = {
      startCommand: `
  Hi there, <b>{first_name}</b>! Send me any file, and I will generate its download link (up to 20MB).
  
  Feel free to generate links for any files, as the bot follows a zero-log policy. However, you will be responsible for your actions.
      `,
      helpCommand: `
  <b>Avilable Commands:</b>
  <code>/start</code> - Ping the bot.
  <code>/del</code> - Revoke the link.
  <code>/help</code> - Get help text.
      `,
      deleteCommand: `
  Send <code>/del</code> with file id to revoke its link.
  
  <b>Example:</b>
  <code>/del 127</code>
      `,
      unknownCommand: "Unknown command! Send <code>/help</code> to get list of available commands.",
      fileLinkGenerated: `
  <b>File link has been generated!</b>
  
  File ID:
  <code>{file_id}</code>
  File Link:
  <code>{file_link}</code>
      `,
      fileTooBig: "This file is too large to handle! I only support files up to 20 MB.",
      invalidArgument: "The provided argument is invalid.",
      fileIdInvalid: "The provided file id is invalid.",
      userNotFileOwner: "You are not the owner of this file.",
      fileLinkRevoked: "The file link has been revoked with immediate effect.",
      queryExecuted: "The query has been executed.",
      queryDataInvalid: "Query data is invalid."
    };
  
    // src/utils/database.js
    async function saveFileInfo({ id, fileName, fileId, secret, sender }) {
      const fileData = { fileName, fileId, secret, sender };
      await files_data.put(id.toString(), JSON.stringify(fileData));
    }
    async function getFileInfo(id) {
      const fileData = await files_data.get(id.toString());
      return JSON.parse(fileData);
    }
    async function deleteFileInfo(id) {
      await files_data.delete(id.toString());
    }
  
    // src/utils/logic.js
    function isPositiveIntegerString(str) {
      const integerRegex = /^\d+$/;
      if (integerRegex.test(str)) {
        return parseInt(str, 10);
      }
      return null;
    }
  
    // src/bot/commandHandler.js
    async function startCommand(message, args) {
      if (args.length !== 0) {
      }
      const { from: user, chat } = message;
      const messageText = Texts.startCommand.replace("{first_name}", user.first_name);
      const replyMarkup = {
        inline_keyboard: [[{ text: "Source Code", url: "https://github.com/lawdakacoder/FileLinkBot" }]]
      };
      await sendMessage(chat.id, messageText, message.message_id, replyMarkup);
    }
    async function helpCommand(message) {
      const { chat } = message;
      const messageText = Texts.helpCommand;
      await sendMessage(chat.id, messageText, message.message_id);
    }
    async function deleteCommand(message, args) {
      const { chat } = message;
      if (args.length === 0) {
        await sendMessage(chat.id, Texts.deleteCommand, message.message_id);
        return;
      }
      const fileId = isPositiveIntegerString(args[0]);
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
    async function handleCommand(message) {
      const { text } = message;
      const [command, ...args] = text.split(" ");
      switch (command) {
        case "/start":
          await startCommand(message, args);
          break;
        case "/help":
          await helpCommand(message);
          break;
        case "/del":
          await deleteCommand(message, args);
          break;
        default:
          await unknownCommand(message);
      }
    }
  
    // src/bot/callbackHandler.js
    async function handleCallbackQuery(callbackQuery) {
      const { id, data: text } = callbackQuery;
      const [query, ...args] = text.split("/");
      switch (query) {
        case "revokeLink":
          await deleteCommand(callbackQuery.message, args);
          await answerCallbackQuery(id, Texts.queryExecuted);
          break;
        default:
          await answerCallbackQuery(id, Texts.queryDataInvalid, true);
      }
    }
  
    // src/bot/downloadHandler.js
    var inlineMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "video/mp4",
      "video/x-msvideo",
      "video/x-matroska",
      "video/quicktime",
      "audio/mpeg",
      "audio/wav",
      "text/html"
    ];
    function getMimeType(filename) {
      const extension = filename.split(".").pop().toLowerCase();
      const mimeTypes = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "bmp": "image/bmp",
        "webp": "image/webp",
        "mp4": "video/mp4",
        "avi": "video/x-msvideo",
        "mkv": "video/x-matroska",
        "mov": "video/quicktime",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "pdf": "application/pdf",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "ppt": "application/vnd.ms-powerpoint",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "html": "text/html",
        "txt": "text/plain",
        "csv": "text/csv",
        "zip": "application/zip",
        "rar": "application/vnd.rar",
        "7z": "application/x-7z-compressed",
        "json": "application/json"
      };
      return mimeTypes[extension] || "application/octet-stream";
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
    async function handleDownload(request, { fileId, fileName }) {
      const fileHeaders = new Headers();
      const fileMimeType = getMimeType(fileName);
      const contentDispositionType = inlineMimeTypes.includes(fileMimeType) ? "inline" : "attachment";
      fileHeaders.set("Content-Disposition", `${contentDispositionType}; filename="${fileName}"`);
      fileHeaders.set("Content-Type", fileMimeType);
      fileHeaders.set("Accept-Ranges", "bytes");
      const fileMetaData = await getFileMetaData(fileId);
      const fileSize = fileMetaData.result.file_size || 0;
      const fileDownloadPath = fileMetaData.result.file_path;
      fileHeaders.set("Content-Length", fileSize);
      const fileResponse = await getFile(fileDownloadPath);
      const fileBuffer = await fileResponse.arrayBuffer();
      const rangeHeader = request.headers.get("Range");
      if (rangeHeader) {
        const range = parseRangeHeader(rangeHeader, fileSize);
        if (!range) {
          fileHeaders.set("Content-Range", `bytes */${fileSize}`);
          return new Response("Requested Range Not Satisfiable", {
            status: 416,
            headers: fileHeaders
          });
        }
        const chunk = fileBuffer.slice(range.start, range.end + 1);
        fileHeaders.set("Content-Range", `bytes ${range.start}-${range.end}/${fileSize}`);
        fileHeaders.set("Content-Length", chunk.byteLength);
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
  
    // src/utils/misc.js
    function generateFileName(ext) {
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}${month}${day}_${hours}${minutes}${seconds}.${ext}`;
    }
    function generateUrlSafeToken(len) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  
    // src/bot/messageHandler.js
    function extractFileInfo(message) {
      const fileTypes = [
        { type: "document", getFileId: (msg) => msg.document.file_id, getFileName: (msg) => msg.document.file_name, getFileSize: (msg) => msg.document.file_size },
        { type: "photo", getFileId: (msg) => msg.photo[msg.photo.length - 1].file_id, getFileName: (msg) => generateFileName("jpg"), getFileSize: (msg) => msg.photo[msg.photo.length - 1].file_size },
        { type: "video", getFileId: (msg) => msg.video.file_id, getFileName: (msg) => msg.video.file_name || generateFileName("mp4"), getFileSize: (msg) => msg.video.file_size }
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
      const messageText = Texts.fileLinkGenerated.replace("{file_id}", message.message_id).replace("{file_link}", fileLink);
      const replyMarkup = {
        inline_keyboard: [
          [{ text: "Open Link", url: fileLink }],
          [{ text: "Revoke Link", callback_data: `revokeLink/${fileData.id}` }]
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
    async function handleMessage(message) {
      const { chat, text } = message;
      if (text?.startsWith("/")) {
        await handleCommand(message);
        return;
      } else if (chat.type !== "private") {
        return;
      }
      const file = extractFileInfo(message);
      if (file?.size <= config.telegram.MAX_FILE_SIZE) {
        await handleUserFile(message, file);
      } else if (file?.size > config.telegram.MAX_FILE_SIZE) {
        await sendMessage(chat.id, Texts.fileTooBig, message.message_id);
      }
    }
  
    // src/index.js
    async function handleRequest(request) {
      const url = new URL(request.url);
      if (url.pathname === "/wk") {
        const secret_token = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
        if (secret_token !== config.worker.SECRET_TOKEN) {
          return new Response("Authentication Failed.", { status: 403 });
        }
        const data = await request.json();
        if (data.message) {
          await handleMessage(data.message);
        } else if (data.callback_query) {
          await handleCallbackQuery(data.callback_query);
        }
        return new Response("OK", { status: 200 });
      } else if (url.pathname.startsWith("/dl/")) {
        const fileId = url.pathname.split("/dl/")[1];
        const fileSecret = url.searchParams.get("s");
        if (!fileId || !fileSecret) {
          return new Response("Invalid file link.", { status: 404 });
        }
        const fileData = await getFileInfo(fileId);
        if (!fileData) {
          return new Response("File has been deleted by owner.", { status: 404 });
        } else if (fileData.secret !== fileSecret) {
          return new Response("Invalid file link.", { status: 404 });
        }
        return await handleDownload(request, fileData);
      }
      return Response.redirect("https://github.com/lawdakacoder/FileLinkBot", 302);
    }
    addEventListener("fetch", (event) => {
      event.respondWith(handleRequest(event.request));
    });
  })();
  //# sourceMappingURL=index.js.map
  
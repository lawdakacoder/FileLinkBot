export const Texts = {
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
    unknownCommand: 'Unknown command! Send <code>/help</code> to get list of available commands.',
    fileLinkGenerated: `
<b>File link has been generated!</b>

File ID:
<code>{file_id}</code>
File Link:
<code>{file_link}</code>
    `,
    fileTooBig: 'This file is too large to handle! I only support files up to 20 MB.',
    invalidArgument: 'The provided argument is invalid.',
    fileIdInvalid: 'The provided file id is invalid.',
    userNotFileOwner: 'You are not the owner of this file.',
    fileLinkRevoked: 'The file link has been revoked with immediate effect.',
    queryExecuted: 'The query has been executed.',
    queryDataInvalid: 'Query data is invalid.'
}
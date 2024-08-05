<div align="center"><h1>File Share Bot</h1>
<b>An open-source JavaScript Telegram bot that allows you to generate HTTP download links for Telegram files up to 20MB.</b>

<a href="https://t.me/AdasLinkBot"><b>Demo Bot</b></a>
</div><br>

## **📑 INDEX**
* [**🕹 Direct Deployment**](#direct-deployment)
* [**🛠️ Deploy from Source**](#deploy-from-source)
* [**🪝 Webhook**](#webhook)
* [**🤖 Commands**](#commands)
* [**❤️ Credits**](#credits)

<a name="direct-deployment"></a>

## **🕹 Direct Deployment**

1.Login to your [Cloudflare Dashboard](https://dash.cloudflare.com/).

2.Navigate to "Workers & Pages" > "Create" and create new worker.

3.Copy the content of [worker.js](https://github.com/lawdakacoder/FileLinkBot/blob/main/worker.js) file.

4.Paste the code in worker's code editor and fill following variables then click deploy button:

  * **BOT_TOKEN**: API token of your Telegram bot, can be obtained from [BotFather](https://t.me/BotFather).

  * **WORKER_URL**: URL of Cloudflare worker without `/`.

  * **SECRET_TOKEN**: Random long url safe token to protect unauthorized execution of your Cloudflare worker.

      * Send `/secret 32` command to [DumpJsonBot](https://t.me/DumpJsonBot) to generate it.

      * Alternatively, it can be manually created by using alphabets, numbers and by not using any special character except `_` and `-`.

5.Navigate to "Workers & Pages" (drop-down menu) > "KV" > "Create a namespace" and create namespace called `files_data`.

6.Go back to Worker (created in 2nd step) > "Settings" > "Variables" > scroll down to "KV Namespace Bindings" and create variable `files_data` and bind it to same namespace (created in 5th step) > "Deploy".

7.Copy your worker's URL and set webhook as given [here](#webhook).

<a name="deploy-from-source"></a>

## **🛠️ Deploy from Source**

1.Install [Git](https://git-scm.com/downloads), [Node.JS](https://nodejs.org/en/download/package-manager) and [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

2.Clone repository:
```
git clone https://github.com/lawdakacoder/FileLinkBot.git
```

3.Change Directory:
```
cd FileLinkBot
```

4.Fill [config.js](https://github.com/lawdakacoder/FileLinkBot/blob/main/src/config.js) file.

5.Create [KV namespace](https://developers.cloudflare.com/kv/get-started/#2-create-a-kv-namespace) called `files_data` and add its id in [wrangler.toml](https://github.com/lawdakacoder/FileLinkBot/blob/main/wrangler.toml) file.

6.Setup Wrangler
  * Install wrangler

    ```
    npm install wrangler
    ```
  * Login in Wrangler

    ```
    npx wrangler login
    ```
  * Deploy to Cloudflare worker

    ```
    npx wrangler deploy
    ```

7.Setup webhook as given [here](#webhook).

<a name="webhook"></a>

## **🪝 Webhook**
You can set webhook using your browser until I make a script to do it more easily.

**1.Set webhook**:<br>
Replace `BOT_TOKEN`, `WORKER_URL` and `SECRET_TOKEN` with their original values which you generated above and then open link in browser:
```
https://api.telegram.org/botBOT_TOKEN/setWebhook?url=WORKER_URL/wk&allowed_updates=["message", "callback_query"]&secret_token=SECRET_TOKEN&drop_pending_updates=true
```

**2.Delete webhook**:<br>
Filled wrong info or need to update info? delete webhook and then you can set it again!
```
https://api.telegram.org/botBOT_TOKEN/deleteWebhook
```

<a name="commands"></a>

## **🤖 Commands**
List of commands that you can set in [BotFather](https://t.me/BotFather).

```
start - Ping the bot.
del - Revoke the link.
help - Get help text.
```

<a name="credits"></a>

## **❤️ Credits**
[**LawdaKaCoder**](https://github.com/lawdakacoder): Developer of FileLinkBot and for lawda.<br>
[**Cloudflare**](https://cloudflare.com): For workers, KV and great documentation that no one can understand.

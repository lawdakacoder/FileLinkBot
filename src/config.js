export const config = {
    telegram: {
        // Bot API server to use.
        API: 'https://api.telegram.org',
        // In bytes (20 MB)
        MAX_FILE_SIZE: 20 * 1024 * 1024
    },

    bot: {
        // Telegram bot token.
        TOKEN: ''
    },

    worker: {
        // Worker's root url.
        URL: 'https://example.workers.dev',
        // Random string to prevent unauthorized execution of worker.
        SECRET_TOKEN: ''
    }
}
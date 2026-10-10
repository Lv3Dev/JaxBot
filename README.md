# JaxBot

A small Discord bot for friends servers. It greets new members and answers a few prefix commands.

## Setup

### 1. Create a bot in the Discord Developer Portal

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create an application named **JaxBot**.
2. Open the **Bot** tab, add a bot, and copy the bot token.
3. Under **Privileged Gateway Intents**, enable:
   - **Server Members Intent** (welcome events and member counts)
   - **Message Content Intent** (prefix commands)
   - **Presence Intent** (online count in `!stats`)
4. Optional: on the **Application** page, paste public URLs to `TERMS_OF_SERVICE.md` and `PRIVACY_POLICY.md` from this repo (GitHub file URLs work once the repo is public).

### 2. Invite the bot

Invite the bot with the `bot` scope and these permissions:

- View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Mention Everyone (so the welcome ping can notify the new member)

Replace `YOUR_CLIENT_ID` with the application ID from the Developer Portal:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=248832&scope=bot
```

### 3. Configure the project

```bash
copy .env.example .env
```

On macOS or Linux, use `cp .env.example .env`.

Edit `.env`:

- `DISCORD_TOKEN` — the bot token from the Developer Portal
- `WELCOME_CHANNEL_ID` — the ID of the channel that should receive welcome messages

To copy a channel ID, enable **Developer Mode** in Discord (User Settings → Advanced), then right-click the channel and choose **Copy Channel ID**.

Replace `welcome.png` in this folder with your own welcome image. The bot attaches that file to every welcome message.

### 4. Install and run

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install
npm start
```

Keep the process running while you want the bot online.

## Commands

All commands use the `!` prefix.

| Command | What it does |
| --- | --- |
| `!stats` | Member count, online count (if Presence Intent is on), channel count, role count, boost count, and server creation date |
| `!userinfo` | Info about you |
| `!userinfo @user` or `!userinfo <user id>` | Username, display name, ID, account creation date, join date, and roles |
| `!userinfo @role` or `!userinfo <role id>` | Role name, ID, colour, member count, and creation date |
| `!serverinfo` | Server name, ID, owner, member count, channel counts, role count, boost level, and creation date |
| `!flip` | Heads or Tails |
| `!dice` | Roll 1–6 |
| `!dice 20` | Roll 1–20. Rejects non-numbers and values under 2 |

Unknown commands are ignored. If the bot is missing permission to speak in a channel, it stays quiet.

## Welcome messages

When someone joins, JaxBot posts in `WELCOME_CHANNEL_ID`, mentions them, and includes their username, account creation date, and that they just joined. It attaches `welcome.png` from this folder.

## Legal

- [Terms of Service](TERMS_OF_SERVICE.md)
- [Privacy Policy](PRIVACY_POLICY.md)

JaxBot is not affiliated with Discord Inc.

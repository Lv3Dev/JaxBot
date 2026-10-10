# JaxBot Privacy Policy

Last updated: 10 October 2026

This policy describes what JaxBot sees and what it does with that information. JaxBot is a small Discord bot for friends servers. **It is not affiliated with Discord Inc.**

## Short version

JaxBot stores no personal data beyond what Discord sends for commands and welcome events. It does not sell data. It does not build advertising profiles.

## What Discord sends to the bot

When the bot is in a server, Discord may send it:

- Server information (name, ID, owner, channels, roles, boost level, creation date)
- Member information needed for commands and welcomes (username, display name, user ID, avatar, account creation date, join date, roles, and online status when Presence Intent is enabled)
- Message content that starts with the `!` prefix, so the bot can run commands
- Join events, so the bot can post a welcome message

The bot only uses this information to reply to a command or to send a welcome message.

## What we store

JaxBot does **not** keep a database of users, messages, or members.

- There is no user account system for the bot itself.
- Command lookups happen in memory and are not written to disk.
- Welcome messages are posted in Discord and then forgotten by the bot.
- The only configuration kept on the machine that runs the bot is the bot token and the welcome channel ID in a local `.env` file. That file is for operating the bot, not for profiling people.

Logs, if any, are only whatever the host prints to the console (for example, that the bot logged in, or that a send failed). Those logs are not used for advertising or resale.

## What we do not do

- We do not sell, rent, or trade personal data.
- We do not share data with advertisers or data brokers.
- We do not use the data to train public AI models.
- We do not track you across other apps or websites.

## Who can see bot replies

Replies and welcome messages are sent into Discord channels. Anyone who can see that channel can see them. Channel permissions are controlled by the server’s admins, not by JaxBot.

## Third parties

The bot talks to Discord’s API. Discord’s own [Privacy Policy](https://discord.com/privacy) applies to data Discord holds. JaxBot does not send your data to other companies.

## Children

The bot is meant for use on Discord in line with Discord’s own age rules. Do not add it to a server in a way that breaks those rules.

## How to stop the bot from seeing your data

- Kick or ban the bot from the server.
- Do not use its commands.
- Ask a server admin to remove it or to take away its channel access.

Once the bot is removed, it no longer receives events from that server.

## Changes

This policy may be updated from time to time. The “Last updated” date at the top will change when it does.

## Contact

If you run this copy of JaxBot, you are the contact for privacy questions about your instance. You can also remove the bot from a server at any time.

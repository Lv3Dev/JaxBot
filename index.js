require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {
  AttachmentBuilder,
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  Partials,
} = require('discord.js');

const PREFIX = '!';
const ACCENT_COLOR = 0x5865f2;
const WELCOME_IMAGE_PATH = path.join(__dirname, 'welcome.png');
const WELCOME_IMAGE_NAME = 'welcome.png';

const token = process.env.DISCORD_TOKEN;
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;

if (!token) {
  console.error('Missing DISCORD_TOKEN. Copy .env.example to .env and fill in your bot token.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.GuildMember],
});

client.once('ready', () => {
  console.log(`JaxBot is online as ${client.user.tag}`);
  if (!welcomeChannelId) {
    console.warn('WELCOME_CHANNEL_ID is empty. Welcome messages will not be sent.');
  }
  if (!fs.existsSync(WELCOME_IMAGE_PATH)) {
    console.warn('welcome.png was not found. Welcome messages will be sent without an image.');
  }
});

client.on('guildMemberAdd', async (member) => {
  if (!welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel || !channel.isTextBased()) return;

  const createdAt = member.user.createdAt;
  const embed = new EmbedBuilder()
    .setColor(ACCENT_COLOR)
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(`${member} just joined the server.`)
    .addFields(
      { name: 'Username', value: member.user.username, inline: true },
      { name: 'Account created', value: formatDate(createdAt), inline: true },
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setTimestamp();

  const payload = {
    content: `Welcome ${member}!`,
    embeds: [embed],
  };

  if (fs.existsSync(WELCOME_IMAGE_PATH)) {
    payload.files = [
      new AttachmentBuilder(WELCOME_IMAGE_PATH, { name: WELCOME_IMAGE_NAME }),
    ];
    embed.setImage(`attachment://${WELCOME_IMAGE_NAME}`);
  }

  await sendQuietly(channel, payload);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const parts = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = parts.shift()?.toLowerCase();
  if (!command) return;

  try {
    switch (command) {
      case 'stats':
        await handleStats(message);
        break;
      case 'userinfo':
        await handleUserInfo(message, parts);
        break;
      case 'serverinfo':
        await handleServerInfo(message);
        break;
      case 'flip':
        await handleFlip(message);
        break;
      case 'dice':
        await handleDice(message, parts);
        break;
      default:
        break;
    }
  } catch (error) {
    if (isQuietError(error)) return;
    console.error(`Error running !${command}:`, error);
  }
});

async function handleStats(message) {
  const guild = message.guild;
  await guild.members.fetch().catch(() => {});

  const fields = [
    { name: 'Members', value: String(guild.memberCount), inline: true },
  ];

  const onlineCount = getOnlineCount(guild);
  if (onlineCount !== null) {
    fields.push({ name: 'Online', value: String(onlineCount), inline: true });
  }

  fields.push(
    { name: 'Channels', value: String(guild.channels.cache.size), inline: true },
    { name: 'Roles', value: String(guild.roles.cache.size), inline: true },
    {
      name: 'Boosts',
      value: String(guild.premiumSubscriptionCount ?? 0),
      inline: true,
    },
    { name: 'Created', value: formatDate(guild.createdAt), inline: false },
  );

  const embed = new EmbedBuilder()
    .setColor(ACCENT_COLOR)
    .setTitle(`${guild.name} stats`)
    .addFields(fields)
    .setThumbnail(guild.iconURL({ size: 256 }))
    .setTimestamp();

  await replyQuietly(message, { embeds: [embed] });
}

async function handleUserInfo(message, args) {
  const query = args.join(' ').trim();

  if (!query) {
    const member = await message.guild.members.fetch(message.author.id).catch(() => message.member);
    await replyQuietly(message, { embeds: [buildUserEmbed(member)] });
    return;
  }

  const role = await resolveRole(message.guild, query);
  if (role) {
    await replyQuietly(message, { embeds: [await buildRoleEmbed(message.guild, role)] });
    return;
  }

  const member = await resolveMember(message.guild, query);
  if (member) {
    await replyQuietly(message, { embeds: [buildUserEmbed(member)] });
    return;
  }

  await replyQuietly(message, { content: 'Could not find that user or role.' });
}

async function handleServerInfo(message) {
  const guild = message.guild;
  await guild.members.fetch().catch(() => {});

  const owner = await guild.fetchOwner().catch(() => null);
  const channels = guild.channels.cache;
  const textCount = channels.filter((channel) => channel.type === ChannelType.GuildText).size;
  const voiceCount = channels.filter((channel) => channel.isVoiceBased()).size;
  const categoryCount = channels.filter((channel) => channel.type === ChannelType.GuildCategory).size;
  const threadCount = channels.filter((channel) => channel.isThread()).size;
  const otherCount = channels.size - textCount - voiceCount - categoryCount - threadCount;

  const channelSummary = [
    `Text: ${textCount}`,
    `Voice: ${voiceCount}`,
    `Categories: ${categoryCount}`,
  ];
  if (threadCount) channelSummary.push(`Threads: ${threadCount}`);
  if (otherCount > 0) channelSummary.push(`Other: ${otherCount}`);

  const embed = new EmbedBuilder()
    .setColor(ACCENT_COLOR)
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL({ size: 256 }))
    .addFields(
      { name: 'Server ID', value: guild.id, inline: true },
      { name: 'Owner', value: owner ? `${owner.user.tag}` : 'Unknown', inline: true },
      { name: 'Members', value: String(guild.memberCount), inline: true },
      { name: 'Channels', value: `${channels.size}\n${channelSummary.join('\n')}`, inline: true },
      { name: 'Roles', value: String(guild.roles.cache.size), inline: true },
      { name: 'Boost level', value: `Level ${guild.premiumTier}`, inline: true },
      { name: 'Created', value: formatDate(guild.createdAt), inline: false },
    )
    .setTimestamp();

  await replyQuietly(message, { embeds: [embed] });
}

async function handleFlip(message) {
  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  await replyQuietly(message, { content: result });
}

async function handleDice(message, args) {
  let max = 6;

  if (args[0] !== undefined) {
    if (!/^\d+$/.test(args[0])) {
      await replyQuietly(message, { content: 'Please give a whole number of 2 or more.' });
      return;
    }

    max = Number.parseInt(args[0], 10);
    if (!Number.isSafeInteger(max) || max < 2) {
      await replyQuietly(message, { content: 'Please give a whole number of 2 or more.' });
      return;
    }
  }

  const roll = Math.floor(Math.random() * max) + 1;
  await replyQuietly(message, { content: `You rolled **${roll}** (1–${max}).` });
}

function buildUserEmbed(member) {
  const roles = member.roles.cache
    .filter((role) => role.id !== member.guild.id)
    .sort((a, b) => b.position - a.position)
    .map((role) => role.toString());

  const roleValue = roles.length ? roles.slice(0, 30).join(', ') : 'None';

  return new EmbedBuilder()
    .setColor(member.displayColor || ACCENT_COLOR)
    .setTitle(member.user.username)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: 'Username', value: member.user.username, inline: true },
      { name: 'Display name', value: member.displayName, inline: true },
      { name: 'ID', value: member.id, inline: true },
      { name: 'Account created', value: formatDate(member.user.createdAt), inline: false },
      {
        name: 'Joined server',
        value: member.joinedAt ? formatDate(member.joinedAt) : 'Unknown',
        inline: false,
      },
      { name: `Roles (${roles.length})`, value: truncate(roleValue, 1024), inline: false },
    )
    .setTimestamp();
}

async function buildRoleEmbed(guild, role) {
  await guild.members.fetch().catch(() => {});
  const memberCount = role.members.size;

  return new EmbedBuilder()
    .setColor(role.color || ACCENT_COLOR)
    .setTitle(role.name)
    .addFields(
      { name: 'Role name', value: role.name, inline: true },
      { name: 'ID', value: role.id, inline: true },
      { name: 'Colour', value: role.hexColor, inline: true },
      { name: 'Members', value: String(memberCount), inline: true },
      { name: 'Created', value: formatDate(role.createdAt), inline: false },
    )
    .setTimestamp();
}

async function resolveRole(guild, query) {
  const mention = query.match(/^<@&(\d+)>$/);
  if (mention) {
    return guild.roles.fetch(mention[1]).catch(() => null);
  }

  if (/^\d{17,20}$/.test(query)) {
    const role = await guild.roles.fetch(query).catch(() => null);
    if (role) return role;
  }

  const lowered = query.toLowerCase();
  return guild.roles.cache.find((role) => role.name.toLowerCase() === lowered) ?? null;
}

async function resolveMember(guild, query) {
  const mention = query.match(/^<@!?(\d+)>$/);
  if (mention) {
    return guild.members.fetch(mention[1]).catch(() => null);
  }

  if (/^\d{17,20}$/.test(query)) {
    return guild.members.fetch(query).catch(() => null);
  }

  await guild.members.fetch().catch(() => {});
  const lowered = query.toLowerCase();
  return (
    guild.members.cache.find(
      (member) =>
        member.user.username.toLowerCase() === lowered ||
        member.displayName.toLowerCase() === lowered,
    ) ?? null
  );
}

function getOnlineCount(guild) {
  if (!guild.client.options.intents.has(GatewayIntentBits.GuildPresences)) {
    return null;
  }

  return guild.members.cache.filter((member) => {
    const status = member.presence?.status;
    return status === 'online' || status === 'idle' || status === 'dnd';
  }).size;
}

function formatDate(date) {
  const unix = Math.floor(date.getTime() / 1000);
  return `<t:${unix}:F> (<t:${unix}:R>)`;
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function isQuietError(error) {
  return error.code === 50013 || error.code === 50001 || error.code === 10003;
}

async function replyQuietly(message, payload) {
  try {
    await message.reply(payload);
  } catch (error) {
    if (isQuietError(error)) return;
    throw error;
  }
}

async function sendQuietly(channel, payload) {
  try {
    await channel.send(payload);
  } catch (error) {
    if (isQuietError(error)) return;
    console.error('Failed to send welcome message:', error);
  }
}

client.login(token).catch((error) => {
  console.error('Failed to log in. Check DISCORD_TOKEN and privileged intents in the Developer Portal.');
  console.error(error.message);
  process.exit(1);
});

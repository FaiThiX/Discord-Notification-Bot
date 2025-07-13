/*
  Discord Bot zur Überwachung eines bestimmten Users und Benachrichtigung über Webhook bei Statusänderungen
  Anforderungen:
  - Prüfen, ob der User online ist (initial und bei Statusänderungen)
  - Wenn offline, in Intervallen weiter prüfen bis online
  - Beim Wechsel zu offline eine Embed-Nachricht an Webhook senden
  - Beim Wechsel zu online eine Embed-Nachricht an Webhook senden
  - Beide Embeds können über Konfigurationswerte angepasst werden
*/

import { Client, GatewayIntentBits, EmbedBuilder, Partials } from 'discord.js';
import { WebhookClient } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// --- Konfiguration über .env-Datei ---
// BOT_TOKEN: Token eures Discord-Bots
// GUILD_ID: ID des Servers, auf dem der User ist
// USER_ID: ID des zu überwachenden Users
// WEBHOOK_ID & WEBHOOK_TOKEN: Eure Webhook-Credentials
// CHECK_INTERVAL: Intervall (ms) für Polling, z.B. 30000 für 30 Sekunden

const {
	BOT_TOKEN,
	GUILD_ID,
	USER_ID,
	WEBHOOK_ID,
	WEBHOOK_TOKEN,
	CHECK_INTERVAL = 30000
} = process.env;

if (!BOT_TOKEN || !GUILD_ID || !USER_ID || !WEBHOOK_ID || !WEBHOOK_TOKEN) {
	console.error('Bitte alle notwendigen Umgebungsvariablen in der .env-Datei setzen.');
	process.exit(1);
}

// Discord-Client mit Presence-Intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMembers
	],
	partials: [Partials.User]
});

// Webhook-Client
const webhook = new WebhookClient({ id: WEBHOOK_ID, token: WEBHOOK_TOKEN });

let pollingInterval = null;
let lastStatus = null;

async function checkInitialStatus() {
	try {
		const guild = await client.guilds.fetch(GUILD_ID);
		const member = await guild.members.fetch(USER_ID);
		const status = member.presence ? member.presence.status : 'offline';
		lastStatus = status;

	console.log(`Initialer Status von User ${USER_ID}: ${status}`);

	if (status === 'offline') {
		startPolling();
	}
	} catch (err) {
		console.error('Fehler beim Initialstatus abfragen:', err);
	}
}

function startPolling() {
	if (pollingInterval) return;
	pollingInterval = setInterval(async () => {
		try {
		const guild = await client.guilds.fetch(GUILD_ID);
		const member = await guild.members.fetch(USER_ID);
		const status = member.presence ? member.presence.status : 'offline';

		if (status !== 'offline') {
			clearInterval(pollingInterval);
			pollingInterval = null;
			handleStatusChange('offline', status);
		}
		} catch (err) {
		console.error('Fehler beim Polling:', err);
		}
	}, Number(CHECK_INTERVAL));
	}

function handleStatusChange(oldStatus, newStatus) {
	lastStatus = newStatus;

  // Embed anpassen: Titel, Beschreibung und Felder nach Bedarf ändern
	const embed = new EmbedBuilder()
		.setTimestamp()
		.setFooter({ text: 'Status-Bot' });

if (oldStatus !== 'offline' && newStatus === 'offline') {
	embed
	.setTitle('User ist jetzt offline')
	.setDescription(`<@${USER_ID}> ist gerade offline gegangen.`)
	// Beispiel-Felder
	.addFields(
		{ name: 'Grund', value: 'Unbekannt', inline: true },
		{ name: 'Zeitpunkt', value: new Date().toLocaleString(), inline: true }
	);

} else if (oldStatus === 'offline' && newStatus !== 'offline') {
	embed
	.setTitle('User ist wieder online')
	.setDescription(`<@${USER_ID}> ist wieder online.`)
	.addFields(
		{ name: 'Aktueller Status', value: newStatus, inline: true },
		{ name: 'Zeitpunkt', value: new Date().toLocaleString(), inline: true }
	);
} else {
	return; // Kein interessanter Statuswechsel
}

	webhook.send({ embeds: [embed] })
		.then(() => console.log('Webhook-Nachricht gesendet'))
		.catch(console.error);
	}

client.once('ready', () => {
	console.log(`Bot eingeloggt als ${client.user.tag}`);
	checkInitialStatus();
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
	if (newPresence.userId !== USER_ID) return;

	const oldStatus = oldPresence?.status || 'offline';
	const newStatus = newPresence.status;

	if (oldStatus !== newStatus) {
		if (newStatus === 'offline' || oldStatus === 'offline') {
		handleStatusChange(oldStatus, newStatus);
		}
	}
});

client.login(BOT_TOKEN);

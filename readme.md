# Discord Status Monitor Bot

Dieses Projekt stellt einen Discord-Bot bereit, der den Online-/Offline-Status eines bestimmten Users überwacht und bei Statusänderungen an einen konfigurierten Webhook anpassbare Embed-Nachrichten sendet.

## Voraussetzungen

* Node.js v16 oder höher
* npm
* Ein Discord-Bot-Token
* Zugriff auf einen Discord-Server (Guild)
* Eine Discord-Webhook-URL

## Installation

1. **Repository klonen**:

   ```bash
   git clone https://github.com/FaiThiX/Discord-Notification-Bot.git
   cd Discord-Notification-Bot
   ```
2. **Abhängigkeiten installieren**:

   ```bash
   npm install
   ```

## Konfiguration

Bearbeite die `.env` im Projektverzeichnis:

```env
BOT_TOKEN=dein_bot_token
GUILD_ID=deine_guild_id
USER_ID=zu_überwachende_user_id
WEBHOOK_ID=deine_webhook_id
WEBHOOK_TOKEN=dein_webhook_token
CHECK_INTERVAL=30000
```

* `CHECK_INTERVAL` legt das Abfrageintervall in Millisekunden fest (Standard: `30000` = 30 Sekunden).

## Nutzung

Starte den Bot mit:

```bash
npm start
```

* Beim Start ermittelt der Bot den aktuellen Status des überwachten Users.
* Anschließend hört er auf Presence-Updates und sendet bei Offline-/Online-Wechsel Embed-Nachrichten über den Webhook.

## Anpassung

* **Embed-Inhalte**: Passe Titel, Beschreibung und Felder in der Funktion `handleStatusChange` in `discordBot.js` nach deinen Wünschen an.
* **Weitere Features**: Ergänze den Code gerne um zusätzliche Einstellungen, Befehle oder Funktionen.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Du kannst es frei nutzen, verändern und weiterverbreiten.

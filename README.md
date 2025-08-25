# JellyfinWhatsAppNotification
📢 WhatsApp Jellyfin/Jellyseerr Notification Bot

This Node.js script sends real-time notifications from Jellyfin directly into your WhatsApp groups.

It uses whatsapp-web.js to connect to WhatsApp via QR login, and a simple webhook endpoint to receive events from Jellyfin.

✨ Features
Sends movie and TV show activity notifications (new content, playback events, etc.) to one or more WhatsApp groups.
Automatically includes titles, year, overview, poster image.
Adds IMDb and TMDB links to content.
Supports multiple groups (define group IDs in the script).

Simple Express.js webhook (/newcontent) for Jellyfin/Jellyseerr integration.

📦 Requirements
Node.js 18+
A WhatsApp account that can be linked via WhatsApp Web
Jellyfin server with webhook support enabled

⚙️ Installation
git clone https://github.com/drlovesan/JellyfinWhatsAppNotification.git
cd JellyfinWhatsAppNotification

Install dependencies
npm install

Configure group IDs
Open index.js
Replace the GROUP_IDS array with your WhatsApp group IDs:

const GROUP_IDS = [
  "120363420391535352@g.us", // Group 1
  "120363421771197792@g.us"  // Group 2
];

💡 To find your group IDs, the script will print all chats with IDs in the console when you run it.
Run the bot
node index.js

Scan the QR code shown in your console with your WhatsApp app (Settings → Linked Devices → Link a Device).

🔗 Jellyfin Setup
Add a webhook notification in Jellyfin/Jellyseerr pointing to:

http://your-server-ip:3000/newcontent

Select the events you want to send (new content, playback started, etc.).

## Example Webhook JSON Template as follows:

{
  "Item": {
    "Name": "{{Name}}",
    "Type": "{{ItemType}}",
    "SeriesName": "{{SeriesName}}",
    "SeasonNumber": "{{SeasonNumber00}}",
    "EpisodeNumber": "{{EpisodeNumber00}}",
    "Year": "{{Year}}",
    "Overview": "{{Overview}}",
    "RunTime": "{{RunTime}}",
    "ServerUrl": "{{ServerUrl}}",
    "ItemId": "{{ItemId}}",
    "CommunityRating": "{{CommunityRating}}",
    "ProviderIds": {
      "Imdb": "{{Provider_imdb}}",
      "Tmdb": "{{Provider_tmdb}}"
    }
  },
  "EventType": "{{EventType}}"
}

## 🐳 Run with Docker

# Pull from GitHub Container Registry:

```bash
docker pull ghcr.io/drlovesan/jellyseerr-whatsapp-requester:latest

# Run with docker-compose.yml:
services:
  jellyseerr-whatsapp-bot:
    image: ghcr.io/drlovesan/jellyseerr-whatsapp-requester:latest
    container_name: jellyseerr-whatsapp-bot
    environment:
      JELLYSEERR_URL: http://host.docker.internal:5055
      API_KEY: YOUR_API_KEY
      TZ: Asia/Riyadh
      SESSION_DIR: /data/session
      CHROME_ARGS: --no-sandbox --disable-setuid-sandbox
    volumes:
      - ./data:/data
      - ./.env:/app/.env:ro
    restart: unless-stopped

# ✅ Usage

Whenever Jellyfin sends an event, the bot forwards it to your defined WhatsApp groups.

Notifications include title, release year, description, poster, and links to IMDb/TMDB.

## 🛠️ Notes

The bot must stay running (node index.js) and logged into WhatsApp to work.



To keep it running 24/7, use a process manager like PM2.
Group IDs are static — if you create new groups, update the GROUP_IDS array.

Developed fully using CHATGPT by Shahid Akram

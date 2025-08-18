const express = require('express');
const bodyParser = require('body-parser');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const app = express();
const port = 3000;

// WhatsApp group IDs
const groupId1 = 'XXXXXXXXXXXXXXXXXXXXXXXXXXX@g.us';
const groupId2 = 'XXXXXXXXXXXXXXXXXXXXXXXXXXX@g.us';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log("✅ WhatsApp client is ready and connected!");

    // Show all chats & IDs on startup
    const chats = await client.getChats();
    console.log("\n📋 Available Chats & Group IDs:");
    chats.forEach(chat => {
        console.log(`- ${chat.name || 'Unnamed'} | ID: ${chat.id._serialized}`);
    });
    console.log("\n");
});

client.initialize();

app.use(bodyParser.json({ type: '*/*' }));

app.post('/newcontent', async (req, res) => {
    const payload = req.body;

    console.log("🔔 Received payload:", JSON.stringify(payload, null, 2));

    if (!payload || !payload.Item) {
        console.warn("⚠ No valid Item data");
        return res.status(400).send("No valid item data");
    }

    const item = payload.Item;

    // Extract fields with fallback
    const name = item.Name || "N/A";
    const type = item.Type || "N/A";
    const seriesName = item.SeriesName || "";
    const seasonNumber = item.SeasonNumber || "";
    const episodeNumber = item.EpisodeNumber || "";
    const year = item.Year || "N/A";
    const overview = item.Overview || "";
    const runtime = item.RunTime || "N/A";
    const serverUrl = item.ServerUrl ? item.ServerUrl.replace(/\/$/, '') : "";
    const itemId = item.ItemId || "";
    const eventType = payload.EventType || "New Content Added";

    // Ratings & IDs
    const imdbId = item.ProviderIds?.Imdb || null;
    const tmdbId = item.ProviderIds?.Tmdb || null;
    const communityRating = item.CommunityRating || null;

    // Compose caption
    let caption = `🎬 *${name}* (${year})\n`;
    caption += `📅 Event: ${eventType}\n`;
    if (seriesName) caption += `📺 Series: ${seriesName}\n`;
    if (seasonNumber) caption += `🌿 Season: ${seasonNumber}\n`;
    if (episodeNumber) caption += `🎞 Episode: ${episodeNumber}\n`;
    if (runtime) caption += `⏱ Runtime: ${runtime}\n`;

    if (communityRating) {
        caption += `⭐ Community Rating: ${communityRating}\n`;
    }

    // Add clickable IMDb link if available
    if (imdbId) {
        caption += `🔗 IMDb: https://www.imdb.com/title/${imdbId}/\n`;
    }

    // Add clickable TMDb link if available
    if (tmdbId) {
        if (type.toLowerCase() === "series" || type.toLowerCase() === "season") {
            caption += `🔗 TMDb: https://www.themoviedb.org/tv/${tmdbId}/\n`;
        } else if (type.toLowerCase() === "movie") {
            caption += `🔗 TMDb: https://www.themoviedb.org/movie/${tmdbId}/\n`;
        }
    }

    if (overview) caption += `\n📝 ${overview}\n`;

    // Poster URL
    let posterUrl = null;
    if (itemId && serverUrl) {
        posterUrl = `${serverUrl}/Items/${itemId}/Images/Primary`;
    }

    // Jellyfin web link for item details
    const jellyfinLink = itemId && serverUrl
        ? `${serverUrl}/web/index.html#!/details?id=${itemId}`
        : "";

    if (jellyfinLink) {
        caption += `\n📺 Watch here: ${jellyfinLink}`;
    }

    try {
        if (posterUrl) {
            const media = await MessageMedia.fromUrl(posterUrl, { unsafeMime: true });
            await client.sendMessage(groupId1, media, { caption });
            await client.sendMessage(groupId2, media, { caption });
        } else {
            await client.sendMessage(groupId1, caption);
            await client.sendMessage(groupId2, caption);
        }
        console.log("✅ WhatsApp message sent to both groups!");
    } catch (error) {
        console.error("❌ Error sending message:", error);
    }

    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
});

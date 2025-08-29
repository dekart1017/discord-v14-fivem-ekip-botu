const puppeteer = require('puppeteer');
const { EmbedBuilder } = require('discord.js');
const config = require("../configs/config.json");

// --- YENİ EKLENEN PUPPETEER FONKSİYONU ---
// Bu fonksiyon, sunucudaki tüm oyuncuların listesini çeker.
async function fetchPlayersWithPuppeteer() {
    let browser = null;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
        
        await page.goto(`https://servers-frontend.fivem.net/api/servers/single/${config.ServerURL}`, { waitUntil: 'networkidle0' });

        const jsonDataString = await page.evaluate(() => document.querySelector('pre').innerText);
        const sunucuVerisi = JSON.parse(jsonDataString);

        return sunucuVerisi.Data.players; // Sadece oyuncu listesini döndürüyoruz

    } catch (error) {
        console.error("Puppeteer ile veri çekilirken hata oluştu:", error);
        return null; // Hata durumunda null döndür
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
// --- PUPPETEER FONKSİYONU SONU ---

module.exports = {
    conf: {
        aliases: ["hex"],
        name: "hex",
        enabled: true,
    },

    run: async (client, message, args) => {
        if (!args[0]) {
            return message.reply({ content: "Lütfen bir Steam Hex girin!" });
        }

        const waitMessage = await message.reply({ content: "Sunucudan veri çekiliyor, bu işlem 15-20 saniye sürebilir..." });

        try {
            // Puppeteer ile oyuncu listesini çekiyoruz
            const players = await fetchPlayersWithPuppeteer();
            
            if (players === null) {
                return waitMessage.edit("Sunucuya bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            }

            await waitMessage.delete();
            
            const steamHex = args[0].toLowerCase().replace("steam:", ""); // Kullanıcının "steam:" yazma ihtimaline karşı temizliyoruz
            
            // Oyuncuyu Steam Hex'ine göre buluyoruz
            const player = players.find(p => 
                p.identifiers.some(id => id.toLowerCase() === `steam:${steamHex}`)
            );

            if (!player) {
                return message.reply({ content: "Belirtilen Steam Hex'e sahip bir oyuncu sunucuda aktif değil!" });
            }

            // Oyuncu bilgilerini ayıklıyoruz
            const discordId = player.identifiers.find(id => id.startsWith("discord:"));
            
            // Embed'i oluşturup gönderiyoruz
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `${player.name} Adlı Oyuncunun Bilgileri`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setDescription(`
\`➥\` **Oyuncu Adı:** \`${player.name}\`
\`➥\` **Sunucu ID:** \`${player.id}\`
\`➥\` **SteamHex:** \`steam:${steamHex}\`
\`➥\` **Discord ID:** \`${discordId ? discordId.replace("discord:", "") : "Bulunamadı"}\`
                `);
            
            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Hex komutunda hata:", error);
            if (waitMessage) {
                await waitMessage.edit("Bilinmeyen bir hata oluştu. Lütfen geliştiriciye bildirin.");
            } else {
                message.reply("Bilinmeyen bir hata oluştu. Lütfen geliştiriciye bildirin.");
            }
        }
    },
};
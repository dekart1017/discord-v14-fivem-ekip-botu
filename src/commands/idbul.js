const puppeteer = require('puppeteer');
const { EmbedBuilder } = require('discord.js');
const config = require("../configs/config.json")
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
        aliases: ["id"],
        name: "id",
        enabled: true,
    },

    run: async (client, message, args) => {
        if (!args[0]) {
            return message.reply({ content: "Lütfen bir sunucu ID'si girin!" });
        }

        const waitMessage = await message.reply({ content: "Sunucudan veri çekiliyor, bu işlem 15-20 saniye sürebilir..." });

        try {
            // Puppeteer ile oyuncu listesini çekiyoruz
            const players = await fetchPlayersWithPuppeteer();
            
            // Veri çekme başarısız olursa kullanıcıyı bilgilendir
            if (players === null) {
                return waitMessage.edit("Sunucuya bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            }

            // Bekleme mesajını silebiliriz
            await waitMessage.delete();
            
            const arananID = Number(args[0]); // Girilen argümanı sayıya çevir
            
            // Oyuncuyu ID'sine göre buluyoruz
            const player = players.find(p => p.id === arananID);
        
            if (!player) {
                return message.reply({ content: "Belirtilen ID'ye sahip bir oyuncu sunucuda aktif değil!" });
            }

            // Oyuncu bilgilerini ayıklıyoruz
            const discordId = player.identifiers.find(id => id.startsWith("discord:"));
            const steamId = player.identifiers.find(id => id.startsWith("steam:"));

            // Embed'i oluşturup gönderiyoruz
            const embed = new EmbedBuilder()
                .setColor("Orange")
                .setAuthor({ name: `${player.name} Adlı Oyuncunun Bilgileri`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setDescription(`
\`➥\` **Oyuncu Adı:** \`${player.name}\`
\`➥\` **Sunucu ID:** \`${player.id}\`
\`➥\` **Steam Hex:** \`${steamId ? steamId.replace("steam:", "") : "Bulunamadı"}\`
\`➥\` **Discord ID:** \`${discordId ? discordId.replace("discord:", "") : "Bulunamadı"}\`
                `);
            
            return message.reply({ embeds: [embed] });
        } catch (error) {
            // Beklenmedik bir hata olursa yakala
            console.error("ID komutunda hata:", error);
            // Eğer waitMessage hala varsa, onu düzenle
            if (waitMessage) {
                await waitMessage.edit("Bilinmeyen bir hata oluştu. Lütfen geliştiriciye bildirin.");
            } else {
                message.reply("Bilinmeyen bir hata oluştu. Lütfen geliştiriciye bildirin.");
            }
        }
    },
};
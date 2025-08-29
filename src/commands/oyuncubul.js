// Gerekli kütüphaneler
const puppeteer = require('puppeteer'); // cfx-api yerine puppeteer kullanıyoruz
const config = require("../configs/config.json");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    conf: {
        aliases: ["oyuncular", "o"],
        name: "oyuncular",
        enabled: true
    },

    /**
     * @param { import("discord.js").Client } client 
     * @param { import("discord.js").Message } message 
     * @param { Array<String> } args 
     * @param { import("discord.js").EmbedBuilder } bankerEmbed 
     * @param { String<String> } prefix 
     */
    run: async (client, message, args, bankerEmbed, prefix) => {
        // --- YENİ EKLENEN PUPPETEER FONKSİYONU ---
        // Bu fonksiyon, oyuncu verilerini ve sunucu adını çeker.
        async function fetchServerDataWithPuppeteer() {
            let browser = null;
            try {
                browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');
                
                // jxdlkm ID'sini kullanarak doğru URL'ye gidiyoruz
                await page.goto(`https://servers-frontend.fivem.net/api/servers/single/${config.ServerURL}`, { waitUntil: 'networkidle0' });

                const jsonDataString = await page.evaluate(() => document.querySelector('pre').innerText);
                const sunucuVerisi = JSON.parse(jsonDataString);

                // Hem oyuncu listesini hem de sunucu adını döndürüyoruz
                return {
                    players: sunucuVerisi.Data.players,
                    hostname: sunucuVerisi.Data.hostname
                };
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
// Kullanıcının Yönetici yetkisi YOKSA VE gerekli staff rollerinden HİÇBİRİNE sahip DEĞİLSE komutu engelle.
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

        // Puppeteer işlemi zaman alacağı için kullanıcıya bir bekleme mesajı gönderiyoruz
        const waitMessage = await message.reply({ content: "Sunucudan oyuncu verileri çekiliyor, bu işlem 15-20 saniye sürebilir. Lütfen bekleyin..." });

        // Verileri Puppeteer ile çekiyoruz
        const serverData = await fetchServerDataWithPuppeteer();

        // Veri çekme başarısız olursa kullanıcıyı bilgilendirip komutu durduruyoruz
        if (!serverData) {
            return waitMessage.edit({ content: "Oyuncu verileri çekilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
        }

        // Bekleme mesajını siliyoruz çünkü artık veriler elimizde
        await waitMessage.delete();
        
        // Gelen verileri değişkenlere atıyoruz
        const players = serverData.players;
        const serverHostname = serverData.hostname;

        if (!args[0]) return message.reply({ content: "Lütfen ekip ismi girin" });

        // Normalizasyon fonksiyonu: aksanlı karakterleri kaldırır
        function normalizeString(str) {
            if (!str) return "";
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }

        // Arama terimini normalize edelim
        const searchTerm = normalizeString(args[0].toLowerCase());

        // Filtreleme işlemini tek seferde yapıyoruz
        const filteredPlayers = players.filter(player => 
            player.name && normalizeString(player.name.toLowerCase()).includes(searchTerm)
        );

        if (filteredPlayers.length === 0) return message.reply("Belirttiğin ekipte oyuncu yok!");

        // --- BURADAN SONRASI SİZİN MEVCUT KODUNUZ, SADECE 'server.hostname' YERİNE 'serverHostname' KULLANILDI ---

        // Gerekli verileri oluşturuyoruz
        const oyuncuIsimleri = filteredPlayers.map(player => player.name.replace(/`/g, ""));
        const oyuncuEndpoints = filteredPlayers.map(player => player.endpoint || "Endpoint yok").join("\n");
        const oyuncuIDs = filteredPlayers.map(player => player.id ? player.id : "ID bulunamadı");
        const oyuncuSteamHex = filteredPlayers.map(player => {
            if (!player.identifiers) return "SteamHex yok";
            const steamId = player.identifiers.find(id => id.startsWith("steam:"));
            return steamId ? steamId.replace("steam:", "") : "SteamHex bulunamadı";
        });
        const oyuncuDC = filteredPlayers.map(player => {
            if (!player.identifiers) return "DC bilgisi yok";
            const discordId = player.identifiers.find(id => id.startsWith("discord:"));
            return discordId ? discordId.replace("discord:", "") : "DC ID bulunamadı";
        });

        // Embed içerisine yerleştirilecek verileri birleştiriyoruz
        let oyuncuBilgileri = "";
        oyuncuIsimleri.forEach((oyuncu, index) => {
            oyuncuBilgileri += `
\`➥\` **Oyuncu:** \`[${oyuncu}] (${oyuncuIDs[index]})\`
\`➥\` **DC:** \`${oyuncuDC[index]}\`
\`➥\` **SteamHex:** \`${oyuncuSteamHex[index]}\`
`;
        });

        if (!oyuncuBilgileri.trim()) return message.reply({ content: "Belirttiğin tagda üye yok!" });

        // Fonksiyon: Mesajı belirli bir anahtar kelimeye göre parçalara ayırır
        function splitMessageByKeyword(messageArray, keyword, countPerPage = 10) {
            const parts = [];
            let tempArray = [];
            let keywordCount = 0;

            for (const line of messageArray) {
                tempArray.push(line);
                if (line.includes(keyword)) {
                    keywordCount++;
                }

                if (keywordCount >= countPerPage) {
                    parts.push(tempArray.join('\n'));
                    tempArray = [];
                    keywordCount = 0;
                }
            }

            if (tempArray.length > 0) {
                parts.push(tempArray.join('\n'));
            }

            return parts;
        }

        const longMessageArray = oyuncuBilgileri.split('\n');
        const parts = splitMessageByKeyword(longMessageArray, 'SteamHex', 10);
        let currentPage = 0;

        // İlk embed'i oluşturuyoruz
        const embed = new EmbedBuilder()
            .setColor(0xFFFFFF)
            .setTitle(`${serverHostname} Sunucusunda Oyuncular`)
            .setDescription(`Belirttiğin tagda şu kadar oyuncu var: ${oyuncuIsimleri.length}\n${parts[currentPage]}`)
            .setFooter({ text: `Sayfa ${currentPage + 1} / ${parts.length}` });

        // Butonları oluşturuyoruz
        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('İleri')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(parts.length <= 1);

        const prevButton = new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Geri')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const iptButton = new ButtonBuilder()
            .setCustomId('ipt')
            .setLabel('İptal Et')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(prevButton, nextButton, iptButton);

        // Embed mesajını gönderiyoruz
        const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

        // Buton etkileşimlerini yakalıyoruz
        const filter = interaction => interaction.user.id === message.author.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'next') {
                currentPage++;
            } else if (i.customId === 'prev') {
                currentPage--;
            } else if (i.customId === 'ipt') {
                nextButton.setDisabled(true);
                prevButton.setDisabled(true);
                iptButton.setDisabled(true);
                await i.update({ components: [row] });
                return;
            }

            // Embed'i güncelle
            const updatedEmbed = new EmbedBuilder()
                .setColor(0xFFFFFF)
                .setTitle(`${serverHostname} Sunucusunda Oyuncular`)
                .setDescription(`Belirttiğin tagda şu kadar oyuncu var: ${oyuncuIsimleri.length}\n${parts[currentPage]}`)
                .setFooter({ text: `Sayfa ${currentPage + 1} / ${parts.length}` });

            // Butonları güncelle
            prevButton.setDisabled(currentPage === 0);
            nextButton.setDisabled(currentPage === parts.length - 1);

            await i.update({ embeds: [updatedEmbed], components: [row] });
        });

        collector.on('end', async () => {
            try {
                nextButton.setDisabled(true);
                prevButton.setDisabled(true);
                iptButton.setDisabled(true);
               if(sentMessage) await sentMessage.edit({ components: [row] });
            } catch (error) {
                console.log('Mesaj düzenlenemedi, silinmiş olabilir. Hata: ' + error);
            }
        });
    }
};
/**
 * Bu komut, sunucudaki belirli bir role sahip olan ve
 * o an bir ses kanalında bulunmayan üyelere toplu DM gönderir.
 * İşlem sonunda, mesajın gönderilemediği üyeleri raporlar.
 */

// Gerekli Discord.js modülleri
const { EmbedBuilder } = require('discord.js');
// Gerekli yapılandırma dosyası
const config = require("../configs/config.json");

// --- AYARLAR ---
// Her bir DM gönderimi arasında beklenecek süre (milisaniye cinsinden).
// Discord tarafından spam olarak algılanmamak için önemlidir. 500 = yarım saniye.
const DM_GECIKME_SURESI = 500;

module.exports = {
    conf: {
        aliases: ["dm"],
        name: "dmat",
        category: "Owner",
        owner: false,
        enabled: true
    },

    run: async (client, message, args) => {
        // 1. YETKİ KONTROLÜ
      if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;


        // 2. MESAJ İÇERİĞİ KONTROLÜ
        const gonderilecekMesaj = args.slice(0).join(" ");
        if (!gonderilecekMesaj) {
            return message.reply({ content: "Lütfen kullanıcılara DM'den göndermek istediğiniz mesajı yazın." });
        }

        // 3. HEDEF KULLANICILARI BELİRLEME
        try {
            const waitMessage = await message.reply({ content: "Hedef kullanıcılar belirleniyor ve sunucu verileri çekiliyor..." });

            await message.guild.members.fetch();

            const hedefKullanicilar = message.guild.members.cache.filter(member =>
               member.roles.cache.has(config.ekipRole) && 
                !member.voice.channel &&                     
                !member.user.bot       
            );

            if (hedefKullanicilar.size === 0) {
                return waitMessage.edit({ content: "Belirtilen rolde olup seste olmayan kimse bulunamadı." });
            }

            // 4. TOPLU DM GÖNDERİM İŞLEMİ
            await waitMessage.edit({ content: `**${hedefKullanicilar.size}** adet hedeflenen kullanıcıya DM gönderilmeye başlanıyor... Bu işlem biraz zaman alabilir.` });

            const gonderilemeyenler = [];

            for (const member of hedefKullanicilar.values()) {
                try {
                    await member.send(gonderilecekMesaj);
                } catch (error) {
                    console.log(`HATA: ${member.user.tag} adlı kullanıcıya DM gönderilemedi.`);
                    gonderilemeyenler.push(member);
                }
                await new Promise(res => setTimeout(res, DM_GECIKME_SURESI));
            }

            // 5. SONUÇ RAPORLAMA
            await waitMessage.delete();

            if (gonderilemeyenler.length > 0) {
                // --- YENİ RAPOR FORMATI BURADA BAŞLIYOR ---

                let aciklama = `Toplam **${hedefKullanicilar.size}** kişiye mesaj gönderilmeye çalışıldı. **${gonderilemeyenler.length}** kişiye DM gönderilemedi.\n\n`;

                // Kullanıcı etiketlerini ve ID'lerini ayrı ayrı listelere alıyoruz.
                let etiketListesi = gonderilemeyenler.map(m => m.toString());
                let idListesi = gonderilemeyenler.map(m => `\`${m.id}\``); // ID'leri kod bloğu içine alıyoruz
                
                // Birleştirilmiş rapor metnini oluşturuyoruz
                let raporMetni = `**Gönderilemeyen Kullanıcılar (Etiket):**\n${etiketListesi.join('\n')}\n\n---\n**Kullanıcı ID'leri (Kopyalamak için):**\n${idListesi.join('\n')}`;

                // Discord'un karakter limitini aşmamak için rapor metnini kontrol ediyoruz
                if ((aciklama + raporMetni).length > 4096) {
                    const sigdirilacakKullaniciSayisi = 25; // Tek embed'e sığacak yaklaşık kullanıcı sayısı
                    
                    // Eğer liste çok uzunsa, listeleri kırpıyoruz
                    if (gonderilemeyenler.length > sigdirilacakKullaniciSayisi) {
                        etiketListesi = etiketListesi.slice(0, sigdirilacakKullaniciSayisi);
                        idListesi = idListesi.slice(0, sigdirilacakKullaniciSayisi);
                        
                        // Kırpılmış metni yeniden oluşturuyoruz
                        raporMetni = `**Gönderilemeyen Kullanıcılar (Etiket):**\n${etiketListesi.join('\n')}\n\n-------------------\n**Kullanıcı ID'leri (Kopyalamak için):**\n${idListesi.join('\n')}\n\n...ve ${gonderilemeyenler.length - sigdirilacakKullaniciSayisi} diğer kullanıcı.`;
                    }
                }
                
                aciklama += raporMetni;

                const raporEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("DM Gönderim Raporu")
                    .setDescription(aciklama)
                    .setTimestamp();
                
                await message.channel.send({ embeds: [raporEmbed] });
                // --- YENİ RAPOR FORMATI BURADA BİTİYOR ---

            } else {
                await message.channel.send({ content: `✅ **Başarılı!** Hedeflenen **${hedefKullanicilar.size}** kullanıcının tamamına mesaj gönderildi.` });
            }

        } catch (error) {
            console.error("DM gönderme komutunda genel bir hata oluştu:", error);
            message.channel.send({ content: "İşlem sırasında beklenmedik bir hata oluştu. Lütfen konsolu kontrol edin." });
        }
    }
};
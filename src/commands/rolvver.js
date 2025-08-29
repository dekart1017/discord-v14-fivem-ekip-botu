/**
 * Bu komut, bir kullanıcıya belirtilen rolü verir.
 * Komut, işlemi güvenli ve stabil bir şekilde gerçekleştirmek için
 * bir dizi yetki, hiyerarşi ve hata kontrolü içerir.
 */

// Gerekli Discord.js modülleri
const { EmbedBuilder } = require('discord.js');

module.exports = {
    conf: {
        aliases: ["rolver", "rolekle"],
        name: "rolver",
        enabled: true
    },

    run: async (client, message, args) => {
        // --- 1. KULLANICI YETKİ KONTROLÜ ---
        /**
         * Sorgu: "Bu komutu kullanan kişinin 'Rolleri Yönet' izni var mı?"
         * Neden Gerekli? Sunucudaki herkesin rol alıp vermesini engellemek için en temel güvenlik katmanıdır.
         * Sadece yetkili moderatörlerin kullanabilmesini sağlar.
         */
      if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;


        // --- 2. ARGÜMAN GEÇERLİLİĞİ KONTROLÜ ---
        /**
         * Sorgu: "Komutla birlikte bir kullanıcı ve bir rol belirtildi mi? Belirtilenler geçerli mi?"
         * Neden Gerekli? Kullanıcı eksik veya hatalı bilgi girdiğinde botun çökmesini engeller
         * ve komutun doğru kullanımı hakkında kullanıcıyı bilgilendirir.
         */
        const uye = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!uye) {
            return message.reply({ content: `**Kullanım Hatası!**\nLütfen bir kullanıcı etiketle veya ID'sini gir.\nÖrnek: \`.rolver @kullanıcı Üye\`` });
        }
        
        const rolArg = args.slice(1).join(' ');
        if (!rolArg) {
            return message.reply({ content: `**Kullanım Hatası!**\nLütfen bir rol etiketle, ID'sini veya adını gir.\nÖrnek: \`.rolver ${uye} Üye\`` });
        }
        
        const rol = message.mentions.roles.first() || message.guild.roles.cache.get(rolArg) || message.guild.roles.cache.find(r => r.name.toLowerCase() === rolArg.toLowerCase());
        if (!rol) {
            return message.reply({ content: `**Bulunamadı!** \`${rolArg}\` adında geçerli bir rol bulamadım.` });
        }

        // --- 3. BOTUN HİYERARŞİ KONTROLÜ ---
        /**
         * Sorgu: "Benim (botun) en yüksek rolüm, verilmesi istenen rolden daha yüksek bir konumda mı?"
         * Neden Gerekli? Discord API kuralları gereği, bot kendi rol hiyerarşisinden daha yüksek bir rolü yönetemez.
         * Bu kontrol, API hatası almadan önce durumu tespit edip kullanıcıya anlaşılır bir geri bildirim sunar.
         */
        if (message.guild.members.me.roles.highest.position <= rol.position) {
            return message.reply({ content: `**Yetkim Yetmiyor!** \`${rol.name}\` rolünü vermek için yetkim yok. Lütfen botun rolünü, bu rolün üstüne taşıyın.` });
        }

        // --- 4. KULLANICININ HİYERARŞİ KONTROLÜ (SUNUCU SAHİBİ İSTİSNASI İLE) ---
        /**
         * Sorgu: "Komutu kullanan kişi sunucu sahibi değilse, kendi en yüksek rolünden daha yüksek bir rol mü vermeye çalışıyor?"
         * Neden Gerekli? Moderatörlerin yetkilerini aşmasını ve kendilerinden üstün rolleri dağıtmasını engeller.
         * Sunucu sahibi bu kuraldan muaf olduğu için onun için bu kontrol atlanır.
         */
        if (message.author.id !== message.guild.ownerId) {
            if (message.member.roles.highest.position <= rol.position) {
                return message.reply({ content: `**Hiyerarşi Hatası!** Kendi rolünüzden daha yüksek veya aynı seviyedeki bir rolü veremezsiniz.` });
            }
        }
        
        // --- 5. MEVCUT ROL KONTROLÜ ---
        /**
         * Sorgu: "Rolü vermeye çalıştığım kullanıcı zaten bu role sahip mi?"
         * Neden Gerekli? Gereksiz işlemi engeller ve kullanıcıya daha net bir geri bildirim sağlar. Kullanıcı deneyimini iyileştirir.
         */
        if (uye.roles.cache.has(rol.id)) {
            return message.reply({ content: `Bu kullanıcı zaten \`${rol.name}\` rolüne sahip.` });
        }
        
        // --- 6. ROL VERME İŞLEMİ VE HATA YAKALAMA ---
        /**
         * Try...Catch Bloğu: "Tüm kontrollerden geçtikten sonra rolü verirken beklenmedik bir sorun oluştu mu?"
         * Neden Gerekli? Discord API'ındaki anlık sorunlar gibi öngörülemeyen durumlarda botun çökmesini engeller,
         * sorunu konsola kaydederek hata ayıklamayı kolaylaştırır.
         */
        try {
            await uye.roles.add(rol);

            // Başarı mesajını embed ile gönder
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                .setDescription(`✅ ${uye} kullanıcısına başarıyla **${rol.name}** rolü verildi!`)
                .setTimestamp();
            
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Rol verme hatası:", error);
            message.reply({ content: "Rol verilirken beklenmedik bir hata oluştu. Lütfen konsolu kontrol edin." });
        }
    }
};
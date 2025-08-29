/**
 * Bu komut, bir kullanıcıdan belirtilen rolü alır.
 * Komut, işlemi güvenli ve stabil bir şekilde gerçekleştirmek için
 * bir dizi yetki, hiyerarşi ve hata kontrolü içerir.
 */

// Gerekli Discord.js modülleri
const { EmbedBuilder } = require('discord.js');

module.exports = {
    conf: {
        aliases: ["rolal", "rolekaldir"],
        name: "rolal",
        enabled: true
    },

    run: async (client, message, args) => {
        // --- 1. KULLANICI YETKİ KONTROLÜ ---
        /**
         * Sorgu: "Bu komutu kullanan kişinin 'Rolleri Yönet' izni var mı?"
         * Neden Gerekli? Sunucudaki herkesin rol alıp vermesini engellemek için en temel güvenlik katmanıdır.
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
            return message.reply({ content: `**Kullanım Hatası!**\nLütfen bir kullanıcı etiketle veya ID'sini gir.\nÖrnek: \`.rolal @kullanıcı Üye\`` });
        }
        
        const rolArg = args.slice(1).join(' ');
        if (!rolArg) {
            return message.reply({ content: `**Kullanım Hatası!**\nLütfen bir rol etiketle, ID'sini veya adını gir.\nÖrnek: \`.rolal ${uye} Üye\`` });
        }
        
        const rol = message.mentions.roles.first() || message.guild.roles.cache.get(rolArg) || message.guild.roles.cache.find(r => r.name.toLowerCase() === rolArg.toLowerCase());
        if (!rol) {
            return message.reply({ content: `**Bulunamadı!** \`${rolArg}\` adında geçerli bir rol bulamadım.` });
        }

        // --- 3. BOTUN HİYERARŞİ KONTROLÜ ---
        /**
         * Sorgu: "Benim (botun) en yüksek rolüm, alınması istenen rolden daha yüksek bir konumda mı?"
         * Neden Gerekli? Bot, kendi rol hiyerarşisinden daha yüksek bir rolü yönetemez.
         */
        if (message.guild.members.me.roles.highest.position <= rol.position) {
            return message.reply({ content: `**Yetkim Yetmiyor!** \`${rol.name}\` rolünü almak için yetkim yok. Lütfen botun rolünü, bu rolün üstüne taşıyın.` });
        }

        // --- 4. KULLANICININ HİYERARŞİ KONTROLÜ (SUNUCU SAHİBİ İSTİSNASI İLE) ---
        /**
         * Sorgu: "Komutu kullanan kişi sunucu sahibi değilse, kendi en yüksek rolünden daha yüksek bir rolü mü almaya çalışıyor?"
         * Neden Gerekli? Moderatörlerin yetkilerini aşmasını ve kendilerinden üstün rolleri yönetmesini engeller.
         */
        if (message.author.id !== message.guild.ownerId) {
            if (message.member.roles.highest.position <= rol.position) {
                return message.reply({ content: `**Hiyerarşi Hatası!** Kendi rolünüzden daha yüksek veya aynı seviyedeki bir rolü alamazsınız.` });
            }
        }
        
        // --- 5. MEVCUT ROL KONTROLÜ ---
        /**
         * Sorgu: "Rolünü almaya çalıştığım kullanıcı zaten bu role sahip değil mi?"
         * Neden Gerekli? Zaten sahip olmadığı bir rolü almaya çalışmayı engeller ve kullanıcıya doğru geri bildirim sağlar.
         */
        if (!uye.roles.cache.has(rol.id)) {
            return message.reply({ content: `Bu kullanıcının zaten \`${rol.name}\` rolü yok.` });
        }
        
        // --- 6. ROL ALMA İŞLEMİ VE HATA YAKALAMA ---
        /**
         * Try...Catch Bloğu: "Tüm kontrollerden geçtikten sonra rolü alırken beklenmedik bir sorun oluştu mu?"
         * Neden Gerekli? Öngörülemeyen durumlarda botun çökmesini engeller ve hatayı konsola kaydeder.
         */
        try {
            await uye.roles.remove(rol);

            // Başarı mesajını embed ile gönder
            const embed = new EmbedBuilder()
                .setColor("Red") // Rol alma işlemi olduğu için renk Kırmızı
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true })})
                .setDescription(`✅ ${uye} kullanıcısından başarıyla **${rol.name}** rolü alındı!`)
                .setTimestamp();
            
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Rol alma hatası:", error);
            message.reply({ content: "Rol alınırken beklenmedik bir hata oluştu. Lütfen konsolu kontrol edin." });
        }
    }
};
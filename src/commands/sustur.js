const config = require("../configs/config.json");

module.exports = {
    conf: {
        aliases: ["sustur"],
        name: "sustur",
        enabled: true
    },

    run: async (client, message, args, bankerEmbed, prefix) => {
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

        const voiceChannel = message.member.voice.channel; // Kullanıcının bulunduğu ses kanalını al

        if (!voiceChannel) {
            return message.reply('Bir ses kanalına katılmanız gerekiyor.');
        }

        // Rolleri belirleyin, örneğin "Admin" rolü
        const exemptedRoles = ["Boss", "OG","HİGH+"]; // Susturulmayacak rollerin isimleri
        const exemptedRoleIds = message.guild.roles.cache.filter(role => exemptedRoles.includes(role.name)).map(role => role.id);

        // Tüm kullanıcıları mute etmek ya da unmute yapmak
        if (args[0] === 'aç') {
            // "sustur aç" komutu
            for (const [memberId, member] of voiceChannel.members) {
                if (exemptedRoleIds.some(roleId => member.roles.cache.has(roleId))) {
                    // Eğer kullanıcıda susturulmaması gereken bir rol varsa, atla
                    continue;
                }
                await member.voice.setMute(false); // Mute'u aç
            }
            return message.reply('Ses kanalındaki tüm kullanıcıların sesi açıldı.');
        }

        // "sustur" komutu
        for (const [memberId, member] of voiceChannel.members) {
            if (exemptedRoleIds.some(roleId => member.roles.cache.has(roleId))) {
                // Eğer kullanıcıda susturulmaması gereken bir rol varsa, atla
                continue;
            }
            await member.voice.setMute(true); // Mute et
        }

        return message.reply('Ses kanalındaki tüm kullanıcılar susturuldu.');
    }
};

const { EmbedBuilder } = require("discord.js");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");
const config = require("../configs/config.json")
module.exports = {
  conf: {
    aliases: ["kontrol"],
    name: "kontrol",
    category: "Genel",
    owner: true,
    enabled: true
  },

  run: async (client, message, args, bankerEmbed,prefix ) => {
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

    const Guild = client.guilds.cache.get(message.guild.id);
    
    const messageData = async (type) => {
        let data = await otUser.find({ guildID: Guild.id }).sort({ topStat: -1 });
    
        // 500'den az ot sayısı olanları ve 0 ot olanları filtrele
        data = data.filter((e) => e[type] <= config.otMiktar && Guild.members.cache.has(e.userID));
    
        if (data.length > 0) {
            data.forEach(async (e, i) => {
                try {
                    // Kullanıcıyı sunucudan bul
                    const member = await Guild.members.fetch(e.userID);
    
                    // Eğer ot'ları 0 ise özel bir mesaj gönder
                    if (e[type] === 0) {
                        await member.send(`Merhaba! Senin toplam ot sayın \`${Number(e[type]).toLocaleString()}\`. Lütfen bunu artırmaya çalış! Eğer Ot sayını 5000 yapamazsan Compton Permin Çekilecek! Son Tarih 10.02.2025`);
                    } else {
                        // Eğer ot sayısı 0 değil, ama 500'den az ise başka bir mesaj
                        await member.send(`Merhaba! Senin toplam ot sayın \`${Number(e[type]).toLocaleString()}\`. Lütfen bunu artırmaya çalış! Eğer Ot sayını 5000 yapamazsan Compton Permin Çekilecek! Son Tarih 10.02.2025`);
                    }
                    
                    console.log(`${member.user.tag} adlı kullanıcıya mesaj gönderildi.`);
                } catch (err) {
                    console.error(`Mesaj gönderilemedi: ${e.userID} - Hata: ${err.message}`);
                }
            });
    
            return data.map((e, i) => `\`${i + 1}.\` <@${e.userID}> : \`${Number(e[type]).toLocaleString()} ot\``).join("\n");
        } else {
            return "`Veri bulunmuyor.`";
        }
    };
    const text = new EmbedBuilder().setDescription(`${await messageData("topStat")}`).setAuthor({ name: `COMPTON Ot Sıralaması `, iconURL: Guild.iconURL({ forceStatic: true }) }).setFooter({ text: "Son Güncelleme", iconURL: Guild.iconURL({ forceStatic: true }) }).setColor("White").setTimestamp();

    return await message.reply({ embeds: [text] });
    


  }
};

const { EmbedBuilder } = require("discord.js");
const config = require("../configs/config.json")
module.exports = {
  conf: {
    aliases: ["sesteolmayanlar"],
    name: "sesteolmayanlar",
    category: "Genel",
    owner: false,
    enabled: true
  },

  run: async (client, message, args, bankerEmbed, prefix) => {
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

    // Buraya kontrol etmek istediğiniz rolün ID'sini yazın
    const rolID = config.ekipRole; // 🔁 Burayı kendi rol ID'nizle değiştirin

    const rol = message.guild.roles.cache.get(rolID);
    if (!rol) return message.reply({ content: "Belirtilen rol bulunamadı." });

    // Rolde olup seste olmayan üyeleri filtrele
    const sesteOlmayanlar = rol.members.filter(member => !member.voice.channel);

    if (sesteOlmayanlar.size === 0) {
      return message.reply({ content: "Belirtilen rolde seste olmayan kullanıcı yok." });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎧 Seste Olmayan Kullanıcılar")
      .setDescription(sesteOlmayanlar.map(m => `<@${m.id}>`).join("\n"))
      .setColor("Red")
      .setFooter({ text: `${sesteOlmayanlar.size} kişi seste değil.` });

    message.reply({ embeds: [embed] });
  }
};

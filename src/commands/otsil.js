const { EmbedBuilder } = require("discord.js");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");
module.exports = {
  conf: {
    aliases: ["otsil", "ots", "osil"],
    name: "otsil",
    category: "Genel",
    owner: false,
    enabled: true
  },

  run: async (client, message, args, bankerEmbed,prefix ) => {
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const otmiktar = (args[1]);
    if(!member) return message.reply("kullanıcı belirtin");
    if(!otmiktar) return message.reply("ot miktarı girin");

    const otUserData = await otUser.findOne({ guildID: message.guild.id, userID: member.id });
    const otGuildData = await otGuild.findOne({ guildID: message.guild.id});

    if(otUserData.topStat < otmiktar || otUserData.dailyStat < otmiktar) return message.reply("daha az sayı gir");

    const btop = otUserData.topStat - `${otmiktar}`;
    const bdaily = otUserData.dailyStat - `${otmiktar}`;
   




    await otUser.findOneAndUpdate({ guildID: message.guild.id, userID: member.id }, { $set: { topStat: btop }},  { upsert: true });
    await otUser.findOneAndUpdate({ guildID: message.guild.id, userID: member.id }, { $set: { dailyStat: bdaily }},  { upsert: true });

    await otGuild.findOneAndUpdate({ guildID: message.guild.id}, { $set: { topStat: btop }},  { upsert: true });
    await otGuild.findOneAndUpdate({ guildID: message.guild.id}, { $set: { dailyStat: bdaily }},  { upsert: true });
   
  

   await message.reply({content: `<@${member.id}> kullanıcısından **${otmiktar}** Adet ot silindi Toplamda **${otUserData ? otUserData.topStat - otmiktar: "0"}** otu var!`});
  }
};

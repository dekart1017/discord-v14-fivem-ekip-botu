const { EmbedBuilder } = require("discord.js");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");
module.exports = {
  conf: {
    aliases: ["otsıfırla"],
    name: "otsıfırla",
    category: "Genel",
    owner: true,
    enabled: true
  },

  run: async (client, message, args, bankerEmbed,prefix ) => {
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if(!member) return message.reply("kullanıcı belirtin");

    await otUser.findOneAndUpdate({ guildID: message.guild.id, userID: member.id }, { $set: { topStat: 0 }},  { upsert: true });
    await otUser.findOneAndUpdate({ guildID: message.guild.id, userID: member.id }, { $set: { dailyStat: 0 }},  { upsert: true });

    await otGuild.findOneAndUpdate({ guildID: message.guild.id}, { $set: { topStat: 0 }},  { upsert: true });
    await otGuild.findOneAndUpdate({ guildID: message.guild.id}, { $set: { dailyStat: 0 }},  { upsert: true });
   
  

    await message.reply({content: `<@${member.id}> kullanıcısının bütün otları silindi!`});
  }
};

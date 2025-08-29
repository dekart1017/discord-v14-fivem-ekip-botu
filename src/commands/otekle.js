const { EmbedBuilder ,PermissionFlagsBits} = require("discord.js");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");
module.exports = {
  conf: {
    aliases: ["otekle", "ote", "oekle"],
    name: "otekle",
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
    await otUser.findOneAndUpdate({ guildID: message.guild.id, userID: member.id }, { $inc: { topStat: args[1] }},  { upsert: true });
    await otUser.findOneAndUpdate({ guildID: message.guild.id, userID: member.id }, { $inc: { dailyStat: args[1] }},  { upsert: true });

    await otGuild.findOneAndUpdate({ guildID: message.guild.id}, { $inc: { topStat: args[1] }},  { upsert: true });
    await otGuild.findOneAndUpdate({ guildID: message.guild.id}, { $inc: { dailyStat: args[1] }},  { upsert: true });
   
    const otUserData = await otUser.findOne({ guildID: message.guild.id, userID: member.id });
    const otGuildData = await otGuild.findOne({ guildID: message.guild.id});

console.log(`${message.member.user.tag} -> ${member.user.tag} --> ${otmiktar}`)
    await message.reply({content: `<@${member.id}> kullanıcısına **${otmiktar}** Adet ot eklendi Toplamda **${otUserData ? otUserData.topStat: "0"}** otu oldu!`});
  }
};

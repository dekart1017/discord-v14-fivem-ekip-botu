const { EmbedBuilder } = require("discord.js");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");

module.exports = {
  conf: {
    aliases: ["toplantı"],
    name: "toplantı",
    category: "Genel",
    owner: false,
    enabled: true
  },

  run: async (client, message, args, bankerEmbed,prefix ) => {
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

    let sesteyok = message.guild.members.cache.filter(s => !s.voice.channel).map(a => a.id);

    sesteyok.forEach(async a => {
        const member = await message.guild.members.fetch(a)
      if(!member.roles.cache.has(config.ekipRole)) return;
        
       await member.roles.remove(config.ekipRole);
    }, 1);
    let sestekiler = message.guild.members.cache.filter(s => s.voice.channel).map(a => a.id);

   /* sestekiler.forEach(async a => {
        const member = await message.guild.members.fetch(a)

        
       await member.roles.add("1206314191992922252");
    },1);
    await message.reply(`Bütün Herkesten compton permini çektim ve sesteki kullanıcılara veriyorum`)
*/        
  }

};

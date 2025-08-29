const { EmbedBuilder } = require("discord.js");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");
module.exports = {
  conf: {
    aliases: ["sesecek", "sescek"],
    name: "sesecek",
    category: "Genel",
    owner: false,
    enabled: true
  },

  run: async (client, message, args, bankerEmbed,prefix ) => {
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

    let sestekiler = message.guild.members.cache.filter(s => s.voice.channel).map(a => a.id);

    sestekiler.forEach(async a => {
        const member = await message.guild.members.fetch(a)

        if(!member.voice.channel) return;
       await member.voice.setChannel(message.member.voice.channel.id);
    });
    await message.reply(`Bütün herkesi <#${message.member.voice.channel.id}> kanalına çektim`)
        
  }

};

const { EmbedBuilder } = require("discord.js");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");
module.exports = {
  conf: {
    aliases: ["otbilgi", "otb", "obilgi"],
    name: "otbilgi",
    category: "Genel",
    owner: false,
    enabled: true
  },

  run: async (client, message, args, bankerEmbed,prefix ) => {

if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0] || message.member);

    

    if(!member) return message.reply("kullanıcı belirtin");
   


    const otUserData = await otUser.findOne({ guildID: message.guild.id, userID: member.id });


    await message.reply({content: `<@${member.id}> kullanıcısının **${otUserData ? otUserData.topStat: "0"}** otu var!`});
  }
};
              
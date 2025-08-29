const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const config = require("../configs/config.json");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");
module.exports = {
  conf: {
    aliases: ["me", "stats"],
    name: "stat",
    help: "stat <@Banker/ID>",
    category: "Genel",
    enabled: true
  },

  /**
   * @param { import("discord.js").Client } client 
   * @param { import("discord.js").Message } message 
   * @param { Array<String> } args 
   * @param { import("discord.js").EmbedBuilder } bankerEmbed 
   * @returns 
   */
  run: async (client, message, args, bankerEmbed) => {
    const kullanıcı = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
 
    const otUserData = await otUser.findOne({ guildID: message.guild.id, userID: kullanıcı.id });
    const otGuildData = await otGuild.findOne({ guildID: message.guild.id});

   
   
    bankerEmbed.setThumbnail(kullanıcı.user.avatarURL({ dynamic: true })).setDescription(`<@${kullanıcı.id}> kullanıcısının genel sunucu ses ve mesaj istatistikleri;`);
    await message.react(config.emojis.onay);

    await message.reply({content: `Toplamda **${otUserData ? otUserData.topStat : 0}** Ot, Bugün **${otUserData ? otUserData.dailyStat : "0"}** Ot Toplamışınız! `});
  }
};


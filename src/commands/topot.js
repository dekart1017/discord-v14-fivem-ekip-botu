const config = require("../configs/config.json");
const { GuildMember, EmbedBuilder } = require("discord.js");
const functionHandler = require("../handlers/functionHandler");
const { emojis, sunucuAdi,  } = require("../configs/config.json");
const otUser = require ("../schemas/otUser.js");
const otGuild = require("../schemas/otGuild");
const moment = require("moment");

module.exports = {
	conf: {
		aliases: ["topot","ottop","otlb","lb"],
		name: "ottop",
		enabled: true
	},

	/**
	 * @param { import("discord.js").Client } client 
	 * @param { import("discord.js").Message } message 
	 * @param { Array<String> } args 
	 * @param { import("discord.js").EmbedBuilder } bankerEmbed 
	 * @param { String<String> } prefix 
	 * @returns 
	 */
	run: async (client, message, args, bankerEmbed, prefix) => {
        const Guild = client.guilds.cache.get(message.guild.id);




		const messageData = async (type) => {
			let data = await otUser.find({ guildID: Guild.id }).sort({ topStat: -1 });
			data = data.filter((e) => e[type] !== 0 && Guild.members.cache.has(e.userID));
			return data.length > 0 ? data.splice(0, 30).map((e, i) => `\`${i + 1}.\` <@${e.userID}> : \`${Number(e[type]).toLocaleString()} ot\``).join("\n") : "`Veri bulunmuyor.`";
		};
           
		const text = new EmbedBuilder().setDescription(`${await messageData("topStat")}`).setAuthor({ name: `${sunucuAdi} Ot Sıralaması `, iconURL: Guild.iconURL({ forceStatic: true }) }).setFooter({ text: "Son Güncelleme", iconURL: Guild.iconURL({ forceStatic: true }) }).setColor("White").setTimestamp();

		return await message.reply({ embeds: [text] });
		

    }
	
};

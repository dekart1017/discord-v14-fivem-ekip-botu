const config = require("../configs/config.json");

module.exports = {
	conf: {
		aliases: ["idal"],
		name: "idal",
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
		if (!message.member.permissions.has("Administrator")) return;
		if(!message.member.voice.channel) return message.reply("ses kanalına baglan yarrak")
		
        let sestekiler = message.guild.channels.cache.get(message.member.voice.channel.id).members.map(x => x.user).join("\n ")


       await message.channel.send(`\`\`\`${sestekiler}\`\`\``);
	   await message.channel.send("---------------------------------");
	   await message.channel.send(sestekiler);
    }
	
};

const config = require("../configs/config.json");

module.exports = {
	conf: {
		aliases: ["help", "y", "h"],
		name: "yardım",
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
		const yetkili = client.commands.filter((e) => e.conf.help && e.conf.category === "Yetkili").sort((a, b) => b.conf.help - a.conf.help).map((e) => `\`${prefix}${e.conf.help}\``).join("\n");
		const genel = client.commands.filter((e) => e.conf.help && e.conf.category === "Genel").sort((a, b) => b.conf.help - a.conf.help).map((e) => `\`${prefix}${e.conf.help}\``).join("\n");

		message.reply({ embeds: [bankerEmbed.setColor("#ffffff").setDescription(`
**__OT KOMUTLARI__**
__.stat__ **->** ne kadar otunuz olduğunu gösterir.
__.otbilgi <@Banker>__ **->** etiketlenen kullanıcının kaç ot olduğunu gösterir.
__.otekle <@Banker> <100>__ **->** etiketlenen kullanıcıya belirtilen sayıda ot ekler.
__.otsil <@Banker> <100>__ **->** etiketlenen kullanıcının belirtilen sayıda otunu siler.
__.otsıfırla <@Banker>__ **->** etiketlenen kullanıcının bütün otlarını siler.


**__EKİP İÇİ KOMUTLAR__**
__.dmat <mesaj>__ **->** seste olmayan herkese özelden mesaj atar.(dm i kapalı olanlara gitmez)
__.idal__ **->** ses kanalındaki herkesin idsini alır.
__.sesecek__ **->** sunucuda ses kanalındaki bütün herkesi aynı sese toplar.

ve daha fazlası..

\`(<> işareti içindeki şeyler tamamen değişkendir istediğiniz gibi düzenleyebilirsiniz)\`

`).setFooter({ text: "Dekart1017", iconURL: message.guild.iconURL({ forceStatic: true }) })] }).then(() => message.react(config.emojis.onay));
	}
};

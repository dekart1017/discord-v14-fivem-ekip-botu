const { GuildMember, EmbedBuilder } = require("discord.js");
const { emojis, sunucuAdi,  } = require("../configs/config.json");
const otUser = require ("../schemas/otUser.js");
const otGuild = require("../schemas/otGuild");
const moment = require("moment");

module.exports = async (client) => {
	client.fetchLeaderBoard = async (channel, textMessage) => {
		const [text] = await client.generateleaderBoard(channel.guild.id);

		await textMessage.edit({ embeds: [text] });
	};

client.generateleaderBoard = async (guildId) => {
		const Guild = await client.guilds.cache.get(guildId);
		if (!Guild) throw new TypeError("Invalid Argument: Guild");
		const messageData = async (type) => {
			let data = await otUser.find({ guildID: guildId }).sort({ topStat: -1 });
			data = data.filter((e) => e[type] !== 0 && Guild.members.cache.has(e.userID));
			return data.length > 0 ? data.splice(0, 30).map((e, i) => `\`${i + 1}.\` <@${e.userID}> : \`${Number(e[type]).toLocaleString()} ot\``).join("\n") : "`Veri bulunmuyor.`";
		}; 
		

		const text = new EmbedBuilder().setDescription(`${await messageData('topStat')}`).setAuthor({ name: `${sunucuAdi} Ot Siralamasi `, iconURL: Guild.iconURL({ forceStatic: true }) }).setFooter({ text: "Son Güncelleme", iconURL: Guild.iconURL({ forceStatic: true }) }).setColor("White").setTimestamp();

		return [text];
	};

	client.status = async (activities, status, time) => {
		if (!time.on) {
			client.user.setActivity(activities[3])
			client.user.setStatus(status[1])
		} else {
			let i = 0;
			setInterval(() => {
				if (i >= activities.length) i = 0
				client.user.setActivity(activities[i])
				i++;
			}, time.activities);

			let s = 0;
			setInterval(() => {
				if (s >= activities.length) s = 0
				client.user.setStatus(status[s])
				s++;
			}, time.status);
		}
	};

	/**
	 * @param { Number } value 
	 * @param { Number } maxValue 
	 * @param { Number } size 
	 * @returns 
	 */


	GuildMember.prototype.hasRole = function (role, every = true) {
		return (
			(Array.isArray(role) &&
				((every && role.every((e) => this.roles.cache.has(e))) ||
					(!every && role.some((e) => this.roles.cache.has(e))))) ||
			(!Array.isArray(role) && this.roles.cache.has(role))
		);
	};

	/**
	 * @param { Number } time 
	 * @returns 
	 */
	client.getTime = (time) => {
		if (isNaN(time) || time.toLocaleString().includes('-')) throw new TypeError("Invalid Argument : Time");
		let date = moment.duration(time)._data;

		if (date.years) return `${date.years} yıl${date.months ? `, ${date.months} ay` : ``}${date.days ? `, ${date.days} gün` : ``}`
		if (date.months) return `${date.months} ay${date.days ? `, ${date.days} gün` : ``}${date.hours ? `, ${date.hours} saat` : ``}`
		if (date.days) return `${date.days} gün${date.hours ? `, ${date.hours} saat` : ``}${date.minutes ? `, ${date.minutes} dakika` : ``}`;
		if (date.hours) return `${date.hours} saat${date.minutes ? `, ${date.minutes} dakika` : ``}${date.seconds ? `, ${date.seconds} sn.` : ``}`;
		if (date.minutes) return `${date.minutes} dakika${date.seconds ? `, ${date.seconds} sn.` : ``}`;
		if (date.seconds) return `${date.seconds} sn.`;
	};

	Array.prototype.listRoles = function (type = "mention") {
		return this.length > 1
			? this.slice(0, -1)
				.map((x) => `<@&${x}>`)
				.join(", ") +
			" ve " +
			this.map((x) => `<@&${x}>`).slice(-1)
			: this.map((x) => `<@&${x}>`).join("");
	};

	Array.prototype.last = function () {
		return this[this.length - 1];
	};
};

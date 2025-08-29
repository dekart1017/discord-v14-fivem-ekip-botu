const { Schema, model } = require("mongoose");

const şema = Schema({
	guildID: { type: Number, default: 0 },
	topStat: { type: Number, default: 0 },
	dailyStat: { type: Number, default: 0 },
});

module.exports = model("messageGuild", şema);

const { Schema, model } = require("mongoose");

const şema = Schema({
	guildID: { type: String, default: 0 },
	userID:{ type: String, default: 0 },
	topStat: { type: Number, default: 0 },
	dailyStat: { type: Number, default: 0 },
	timeout: { type: Number, default: Date.now() },
});

module.exports = model("messageUser", şema);

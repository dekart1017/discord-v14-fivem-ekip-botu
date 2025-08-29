const client = global.client;
const { leaderBoard, topMessage } = require("../configs/config.json");
const { CronJob } = require("cron");
const otUser = require ("../schemas/otUser");
const otGuild = require("../schemas/otGuild");

const moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = async () => {
  const channel = client.channels.cache.get(leaderBoard);
  if (!channel) return console.log("[LEADERBOARD] Lider tablosu kanalı bulunamadı!");

  const textMessageData = await channel.messages.fetch(topMessage);
  if (!textMessageData) return console.log("[LEADERBOARD] Ot sıralaması lider tablosu mesajı bulunamadı!");
  
  client.fetchLeaderBoard(channel, textMessageData);
  const leaderboard = new CronJob("*/10 * * * *", async () => client.fetchLeaderBoard(channel, textMessageData));
  leaderboard.start();
};

module.exports.conf = {
  name: "ready",
};

const client = global.client;
const config = require("../configs/config.json");
const messageUser = require("../schemas/otUser");
const { CronJob } = require("cron");

module.exports = () => {
  const sunucu = client.guilds.cache.get(config.guildID);

  const daily = new CronJob("0 0 * * *", () => {
    sunucu.members.cache.forEach(async (member) => {
      await messageUser.updateMany({ guildID: sunucu.id, userID: member.user.id }, { $set: { dailyStat: 0 } });
    });
  }, null, true, "Europe/Istanbul");
  daily.start();
};

module.exports.conf = {
  name: "ready",
};

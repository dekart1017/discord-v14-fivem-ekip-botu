const client = global.client;
const config = require("../configs/config.json");
const { joinVoiceChannel } = require("@discordjs/voice");
const ranks = require("../schemas/ranks");

module.exports = async () => {

  ranks.findOne({ guildId: config.guildID }, async (err, data) => {
    if (!data) new ranks({ guildId: config.guildID, ranks: [] }).save();
  });
  setInterval(async () => {
    client.status(
      [
        { name: config.activity, type: 1, url: "https://github.com/dekart1017" }, // Twitch'de yayında
     
      ],
      ["dnd"],
      {
        on: false,
        activities: 15000,
        status: 30000,
      }
    );
    const Guild = client.guilds.cache.get(config.guildID);
    if (!Guild) return;
    const VoiceChannel = Guild.channels.cache.get(config.voiceChannel);
    if (!VoiceChannel) return;
    joinVoiceChannel({
      channelId: VoiceChannel.id,
      guildId: VoiceChannel.guild.id,
      selfDeaf: false,
      adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
    });
  }, 1000 * 3);





           
        

  // client.on("warn", m => console.log(`[WARN] - ${m}`));
  // client.on("error", m => console.log(`[ERROR] - ${m}`));
  // process.on("uncaughtException", error => console.log(`[ERROR] - ${error}`));
  // process.on("unhandledRejection", (err) => console.log(`[ERROR] - ${err}`));
};

module.exports.conf = {
  name: "ready",
};

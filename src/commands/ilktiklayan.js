const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  conf: {
    aliases: ["ilk"],
    name: "ilk",
    category: "Genel",
    owner: false,
    enabled: true
  },

  run: async (client, message, args, bankerEmbed, prefix) => {
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

    let clickedUsers = []; // Tıklayan kullanıcıları saklayacak liste
    let sinir = args[0];

    if (!sinir) return message.reply({ content: "Kaç kişi belirt örn: .ilk 20" });
    await message.delete();

    const sendMessageWithButton = async (message) => {
      // Mesaj içeriği ve buton ekliyoruz
      bankerEmbed
        .setTitle(`Butona tıklayan ilk ${sinir} kişiye perm verilecek!`)
        .setDescription('Aşağıdaki butona tıklayarak perm alabilirsiniz.');

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('join_button')
            .setLabel('Katıl')
            .setStyle(ButtonStyle.Primary)
        );

      // Mesajı gönderiyoruz
      const sentMessage = await message.channel.send({ embeds: [bankerEmbed], components: [row] });

      // Butona tıklama olayını dinliyoruz
      const filter = i => i.customId === 'join_button' && !clickedUsers.includes(i.user.id);
      const collector = await sentMessage.createMessageComponentCollector({ filter, time: 1000 * 60 * 15 }); // 10 dakika süre

      collector.on('collect', async (i) => {
        if (clickedUsers.includes(i.user.id)) {
          await i.reply({ content: 'Zaten katıldınız!', ephemeral: true }).catch(err => console.log(err));
          return;
        }

        // Eğer butona tıklayan kişi sayısı belirtilen limite ulaşmadıysa ekle
        if (clickedUsers.length < sinir) {
          clickedUsers.push(i.user.id);

          // İlk tıklayanı göstermek için (ilk sırada)
          const taggedUsers = clickedUsers.map(userId => `<@${userId}>`).join('\n');

          // Mesajı düzenleyerek tıklayanları gösteriyoruz
          await sentMessage.edit({
            embeds: [new EmbedBuilder().setTitle(`Perm verilecek kişiler (${sinir}):`).setDescription(`Katılan Kişi Sayısı:**${clickedUsers.length}**\n ${taggedUsers} \`\`\`${taggedUsers}\`\`\``)],
            components: [row]  // Butonu ekli tutuyoruz
          }).catch(err => console.log(err));

          // Kullanıcıya bildir
          await i.reply({ content: 'Perme Listesine eklendiniz!', ephemeral: true }).catch(err => console.log(err));

          // Eğer sinir sayısına ulaşıldıysa, butonu devre dışı bırak
          if (clickedUsers.length === sinir) {
            await sentMessage.edit({
              embeds: [new EmbedBuilder().setTitle('Perm verilecek kişiler:').setDescription(`Katılan Kişi Sayısı:**${clickedUsers.length}**\n${taggedUsers} \`\`\`${taggedUsers}\`\`\``)],
              components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId('join_button')
                  .setLabel('Katıl')
                  .setStyle(ButtonStyle.Primary)
                  .setDisabled(true)  // Butonu devre dışı bırakıyoruz
              )]
            }).catch(err => console.log(err));

            await collector.stop();  // Toplayıcıyı durdur
          }
        } else {
          // Eğer maksimum katılımcı sayısına ulaşıldıysa, kullanıcıya uyarı ver
          await i.reply({ content: 'Maksimum katılımcı sayısına ulaşıldı!', ephemeral: true }).catch(err => console.log(err));
          const taggedUsers = clickedUsers.map(userId => `<@${userId}>`).join('\n');
          await sentMessage.edit({
            embeds: [new EmbedBuilder().setTitle('Perm verilecek kişiler:').setDescription(`Katılan Kişi Sayısı:**${clickedUsers.length}**\n${taggedUsers} \`\`\`${taggedUsers}\`\`\``)],
            components: [new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('join_button')
                .setLabel('Katıl')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)  // Butonu devre dışı bırakıyoruz
            )]
          }).catch(err => console.log(err));

          await collector.stop();  // Toplayıcıyı durdur
        }
      });

      collector.on('end', async () => {
        if(!sentMessage) return;
        try {
          // Buton devre dışı bırakıldıktan sonra mesajı güncelle
          const taggedUsers = clickedUsers.map(userId => `<@${userId}>`).join('\n');
          await sentMessage.edit({
            embeds: [new EmbedBuilder().setTitle('Perm verilecek kişiler:').setDescription(`Katılan Kişi Sayısı:**${clickedUsers.length}**\n${taggedUsers} \`\`\`${taggedUsers}\`\`\``)],
            components: [new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('join_button')
                .setLabel('Katıl')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)  // Butonu devre dışı bırakıyoruz
            )]
          }).catch(err => console.log(err));
        } catch (error) {
          console.log('Mesaj düzenlenemedi, silinmiş olabilir.' + error);
        }
      });
    };

    sendMessageWithButton(message);
  }
};
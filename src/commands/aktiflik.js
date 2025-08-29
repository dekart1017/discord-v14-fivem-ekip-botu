const { timeout } = require("cron");
const config = require("../configs/config.json");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    conf: {
        aliases: ["aktiflik"],
        name: "aktif",
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
if (!message.member.permissions.has("Administrator") && !config.StaffRole?.some(id => message.member.roles.cache.has(id))) return;

        const ROLE_ID = config.ekipRole; // Rol ID'sini buraya girin
        const TIMEOUT = 1000 * 60; // 60 saniye (1 dakika) süre belirlenmiştir

        // Butonları ve mesajı oluştur
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('click_me')
                .setLabel('Butona Tıkla!')
                .setStyle(ButtonStyle.Primary)
        );
        const { time, TimestampStyles } = require('discord.js');

        const date = new Date();

        // 1 dakika sonrasını hesapla
        date.setMinutes(date.getMinutes() + 1); // Şu anki zamanın dakika değerine 1 ekleyin

        // Kalan süreyi hesapla ve biçimlendir
        const kalansure = time(date, TimestampStyles.RelativeTime);

        bankerEmbed
            .setTitle(`${message.guild.name} Aktiflik Testi!`)
            .setDescription(`
                \`>\` Eğer ekibimizde aktif olarak oynamak istiyorsanız aşağıdaki butona tıklayınız! aksi takdirde **Ekip perminiz çekilecektir!**
                \`Kalan süre:\` **${kalansure}**`)

        // Mesajı gönder
        const sentMessage = await message.channel.send({
            content: '|| @everyone / @here ||',
            embeds: [bankerEmbed],
            components: [row]
        });

        // Butona tıklamayı dinleyin
        const filter = (interaction) => interaction.customId === 'click_me';
        const collector = sentMessage.createMessageComponentCollector({ filter, time: TIMEOUT });

        const clickedUsers = [];
        collector.on('collect', async (i) => {
            if (clickedUsers.includes(i.user.id)) {
                await i.reply({ content: 'Zaten katıldınız!', ephemeral: true }).catch(err => console.log(err));
                return;
            }

            // Eğer butona tıklayan kişi sayısı belirtilen limite ulaşmadıysa ekle
            clickedUsers.push(i.user.id);

            // Mesajı düzenleyerek tıklayanları gösteriyoruz
            await sentMessage.edit({
                embeds: [bankerEmbed.setDescription(`
                    \`>\` Eğer ekibimizde aktif olarak oynamak istiyorsanız aşağıdaki butona tıklayınız! aksi takdirde **Ekip perminiz çekilecektir!**
                    \`Kalan süre:\` **${kalansure}**
                    \`Aktif üye Sayısı\`:**${clickedUsers.length}**`)],
                components: [row]  // Butonu ekli tutuyoruz
            }).catch(err => console.log(err));

            // Kullanıcıya bildir
            await i.reply({ content: 'Aktiflik listesine eklendiniz!', ephemeral: true }).catch(err => console.log(err));
        });

        collector.on('end', async (collected) => {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('click_me')
                    .setLabel('Süresi Doldu!!')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
            );

            // Butona tıklamayan kişilere rol atama
            const members = await message.guild.members.fetch();

            // Zaman dolduktan sonra butonları güncelle
            await sentMessage.edit({
                components: [row]
            });

            // Belirli bir rolü olan kullanıcıları kontrol et
            members.forEach(async (member) => {
                if (member.roles.cache.has(ROLE_ID)) { // Eğer kullanıcıda belirli bir rol varsa
                    const userHasClicked = collected.some(i => i.user.id === member.id);

                    if (!userHasClicked && member.id !== message.author.id) {
                        try {
                            // Eğer butona tıklamamışsa rolünü kaldır
                            await member.roles.remove(ROLE_ID);
                            await message.channel.send(`<@${member.id}> Kişisinden rol çekildi!`);
                        } catch (error) {
                            console.error(`Rol verilirken hata oluştu: ${error}`);
                        }
                    }
                }
            });
            console.log('Zaman doldu, butona basmayanlara rol verildi.');
        });

    }

};
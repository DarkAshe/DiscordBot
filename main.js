require('dotenv').config()
const Discord = require('discord.js')
const request = require('request')
const cheerio = require('cheerio')
const ytdl = require('ytdl-core')
const fs = require('fs')
const queue = new Map()
const PREFIX = '?'

const client = new Discord.Client()

client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))
for(const file of commandFiles){
    const command = require(`./commands/${file}`)

    client.commands.set(command.name, command)
}

client.once('ready', () => {
    console.log('The BOT is online!')
})

client.on('message', async message => {
    if(message.author.bot) return
    if(!message.content.startsWith(PREFIX)) return
           
    const args = message.content.substring(PREFIX.length).split(" ")
    const serverQueue = queue.get(message.guild.id)

    if(message.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send("You need to be in a channel to play music")
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("I don\'t permissions to connect to the voice channel")
        if(!permissions.has('SPEAK')) return message.channel.send("I don\'t permissions to speak in the channel")

        const songInfo = await ytdl.getInfo(args[1])
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        }

        if(!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
            }
            queue.set(message.guild.id, queueConstruct)

            queueConstruct.songs.push(song)

            try {
                var connection = await voiceChannel.join()
                queueConstruct.connection = connection
                play(message.guild, queueConstruct.songs[0])
            } catch(error) {
                console.log(`There was an error connecting to the voice channel: ${error}`)
                queue.delete(message.guild.id)
                return message.channel.send(`There was an error connecting to the voice channel: ${error}`)
            }
        } else {
            serverQueue.songs.push(song)
            return message.channel.send(`**${song.title}** has been added to the queue`)
        }
        return undefined
    }
        else if(message.content.startsWith(`${PREFIX}stop`)) {
        if(!message.member.voice.channel) return message.channel.send("You need to be in a channel to stop the music")
        if(!serverQueue) return message.channel.send("There is nothing playing")
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end()
        message.channel.send("I have stoped the music for you")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}skip`)) {
        if(!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to skip the music")
        if(!serverQueue) return message.channel.send("There is nothing playing")
        serverQueue.connection.dispatcher.end()
        message.channel.send("I have skipped the music for you")
        return undefined
    }
})

function play(guild, song) {
    const serverQueue = queue.get(guild.id)

    if(!song) {
        serverQueue.voiceChannel.leave()
        queue.delete(guild.id)
        return
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
    .on('finish', () => {
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
    })
    .on('error', error => {
        console.log(error)
    })
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
}

client.on("guildMemberAdd", member => {
    const WelcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome')
    WelcomeChannel.send (`Hello ${member}, welcome to Demo Mesa! Have fun, but first please verify and read the rules.`)
})

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.id === '755102491246592040')
        await message.delete();
    if(message.content.toLowerCase() === '!verify' && message.channel.id === '755102491246592040')
    {   
        await message.delete().catch(err => console.log(err));
        const role = message.guild.roles.cache.get('755087485687562350');
        if(role) {
            try {
                await message.member.roles.add(role);
                console.log("Role added!");
            }
            catch(err) {
                console.log(err);
            }
        }
    }
});

client.login(process.env.token)
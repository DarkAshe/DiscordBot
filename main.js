require('dotenv').config()
const Discord = require('discord.js')
const Util = require('discord.js')
const request = require('request')
const cheerio = require('cheerio')
const ytdl = require('ytdl-core')
const fs = require('fs')
const YouTube = require('simple-youtube-api')
const queue = new Map()
const youtube = new YouTube(process.env.GOOGLE_API_KEY)
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
    if (message.author.bot) return
    if (!message.content.startsWith(PREFIX)) return

    const args = message.content.substring(PREFIX.length).split(" ")
    const searchString = args.slice(1).join(' ')
    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : ''
    const serverQueue = queue.get(message.guild.id)

    if (message.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = message.member.voice.channel
        if (!voiceChannel) return message.channel.send("You need to be in a channel to play music")
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if (!permissions.has('CONNECT')) return message.channel.send("I don\'t permissions to connect to the voice channel")
        if (!permissions.has('SPEAK')) return message.channel.send("I don\'t permissions to speak in the channel")

        try {
            var video = await youtube.getVideoByID(url)
        } catch {
            try {
                var videos = await youtube.searchVideos(searchString, 1)
                var video = await youtube.getVideoByID(videos[0].id)
            } catch {
                return message.channel.send("I couldn\'t find any search results")
            }
        }

        const song = {
            id: video.id,
            title: Util.escapeMarkdown(video.title),
            url: `https://www.youtube.com/watch?v=${video.id}`
        }

        if (!serverQueue) {
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
            } catch (error) {
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
    else if (message.content.startsWith(`${PREFIX}stop`)) {
        if (!message.member.voice.channel) return message.channel.send("You need to be in a channel to stop the music")
        if (!serverQueue) return message.channel.send("There is nothing playing")
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end()
        message.channel.send("I have stoped the music for you")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}skip`)) {
        if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to skip the music")
        if (!serverQueue) return message.channel.send("There is nothing playing")
        serverQueue.connection.dispatcher.end()
        message.channel.send("I have skipped the music for you")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}volume`)) {
        if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to change the volume")
        if (!serverQueue) return message.channel.send("There is nothing playing")
        if (!args[1]) return message.channel.send(`That volume is: **${serverQueue.volume}**`)
        if (isNaN(args[1])) return message.channel.send("That is not a valid amount to change the volume")
        serverQueue.volume = args[1]
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5)
        message.channel.send(`I have changed the volume to **${args[1]}**`)
        return undefined
    } else if (message.content.startsWith(`${PREFIX}np`)) {
        if (!serverQueue) return message.channel.send("There is nothing playing")
        message.channel.send(`Now Playing: **${serverQueue.songs[0].title}**`)
        return undefined
    } else if (message.content.startsWith(`${PREFIX}queue`)) {
        if (!serverQueue) return message.channel.send("There is nothing playing")
        message.channel.send(`
__**Song Queue:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}

**Now Playing:** ${serverQueue.songs[0].title}
        `, { split: true })
        return undefined
    } else if (message.content.startsWith(`${PREFIX}pause`)) {
        if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to use the pause command")
        if (!serverQueue) return message.channel.send("There is nothing playing")
        if (!serverQueue.playing) return message.channel.send("The music is already paused")
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        message.channel.send("I have paused the music for you")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}resume`)) {
        if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to use the resume command")
        if (!serverQueue) return message.channel.send("There is nothing playing")
        if (serverQueue.playinf) return message.channel.send("The music is already playing")
        serverQueue.playing = true
        serverQueue.connection.dispatcher.resume()
        message.channel.send("I have now resumed the music for you")
        return undefined
    }
})

function play(guild, song) {
    const serverQueue = queue.get(guild.id)

    if (!song) {
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

    serverQueue.textChannel.send(`Start Playing: **${song.title}**`)
}

client.on("guildMemberAdd", member => {
    const WelcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome')
    WelcomeChannel.send (`Hello ${member}, welcome to Demo Mesa! Have fun, but first please verify and read the rules.`)
})

client.on('message', async message => {
    if(message.author.bot) return
    if(message.channel.id === '755102491246592040')
        await message.delete()
    if(message.content.toLowerCase() === '!verify' && message.channel.id === '755102491246592040')
    {   
        await message.delete().catch(err => console.log(err))
        const role = message.guild.roles.cache.get('755087485687562350')
        if(role) {
            try {
                await message.member.roles.add(role)
                console.log("Role added!");
            }
            catch(err) {
                console.log(err)
            }
        }
    }
})

client.on('message', message =>{
    if(!message.content.startsWith(PREFIX) || message.author.bot) return

    const args = message.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

    if(command === 'demomesa'){
       client.commands.get('demomesa').execute(message, args)
    }
    if(command === 'clear'){
       client.commands.get('clear').execute(message, args)
    }
    if(command === 'stfu'){
        client.commands.get('stfu').execute(message, args)
    }
    if(command === 'osama'){
        client.commands.get('osama').execute(message, args)
    }
    if(command === 'image'){
        switch (args[0]) {
            case 'image':
            image(message)
            break;
        }
        function image(message){
 
            var options = {
                url: "http://results.dogpile.com/serp?qc=images&q=" + "memes",
                method: "GET",
                headers: {
                    "Accept": "text/html",
                    "User-Agent": "Chrome"
                }
            };
        
            request(options, function(error, response, responseBody) {
         
                $ = cheerio.load(responseBody)
         
                var links = $(".image a.link")
         
                var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"))
               
                console.log(urls)
         
                // Send result
                message.channel.send( urls[Math.floor(Math.random() * urls.length)])
            })
         
        }
    }
})

client.login(process.env.token)
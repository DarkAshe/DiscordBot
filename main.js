require('dotenv').config()
const Discord = require('discord.js')
const request = require('request')
const cheerio = require('cheerio')
const ytdl = require('ytdl-core')
const fs = require('fs')
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

    if(message.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send("You need to be in a channel to play music")
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("I don\'t permissions to connect to the voice channel")
        if(!permissions.has('SPEAK')) return message.channel.send("I don\'t permissions to speak in the channel")
        
        try {
            var connection = await voiceChannel.join()
        } catch(error) {
            console.log(`There was an error connecting to the voice channel: ${error}`)
            return message.channel.send(`There was an error connecting to the voice channel: ${error}`)
        }

        const dispatcher = connection.play(ytdl(args[1]))
        .on('finish', () => {
            voiceChannel.leave()
        })
        .on('error', error => {
            console.log(error)
        })
        dispatcher.setVolumeLogarithmic(5 / 5)
    }
        else if(message.content.startWith(`${PREFIX}stop`)) {
        if(!message.member.voice.channel) return message.channel.send("You need to be in a channel to stop the music")
        voice.channel.leave()
        return undefined
    }
})

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
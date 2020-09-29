client.on('message', async message => {
    if(message.author.bot) return
    if(!message.centent.startsWith(PREFIX)) return
           
    const args = message.content.substring(PREFIX.length).split(" ")

    if(message.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send("You need to be in a channel to play music")
        
        try {
            var connection = await voiceChannel.join()
        } catch (error) {
            console.log(`There was an error connecting to the voice channel: ${error}`)
            return message.channel.send(`There was an error connecting to the voice channel: ${error}`)
        }

        const dispatcher = connection.play(ytdl(args))
        .on('finish', () => {
            voiceChaneel.leave()
        })
        .on('error', error => {
            console.log(error)
        })
        dispatcher.setVolumeLogarithmic(5 / 5)
    }
        esle; if(message.content.startWith(`${PREFIX}stop`)) {
        if(!message.member.voice.channel) return message.channel.send("You need to be in a channel to stop the music")
        message.member.voice.channel.leave()
        return undefined
    }
})

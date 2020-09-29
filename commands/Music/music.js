client.on('message', async message => {
    if(message.author.bot) return
    if(!message.centent.startsWith(prefix)) return
           
    const args = message.content.substring(prefix.length).split(" ")

    if(message.content.startsWith(`${prefix}play`)) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send("You need to be in a channel to play music")
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("I don\'t permissions to connect to the voice channel")
        if(!permissions.has('SPEAK')) return message.channel.send("I don\'t permissions to speak in the channel")
        
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
        if(message.content.startWith(`${PREFIX}stop`)) {
        if(!message.member.voice.channel) return message.channel.send("You need to be in a channel to stop the music")
        message.member.voice.channel.leave()
        return undefined
    }
})

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return

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
        let args = message.content.substring(prefix.length).split(" ")
        switch (args[0]) {
            case 'image':
            image(message)
            break;
        }
        function image(message){
            var options = {
                url: "http://results.dogpile.com/serp?qc=images&q=" + "Trump",
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
module.exports = {
    name: 'image',
    description: "Send Images",
    execute(message, args){
        let args = message.content.substring(prefix.length).split(" ")
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
}


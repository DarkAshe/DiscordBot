module.exports = {
    name: "image",
    
        async run(message){
 
            var options = {
                url: "http://results.dogpile.com/serp?qc=images&q=" + "Memes",
                method: "GET",
                headers: {
                    "Accept": "text/html",
                    "User-Agent": "Chrome"
                }
            };
        
            request(options, function(error, response, responseBody) {
         
                $ = cheerio.load(responseBody);
         
                var links = $(".image a.link");
         
                var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
               
                console.log(urls);
         
                // Send result
                message.channel.send( urls[Math.floor(Math.random() * urls.length)]);
            });
         
        }
}
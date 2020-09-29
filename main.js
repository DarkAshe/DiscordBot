const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = '-';

const fs = require('fs');

const request = require('request');
const cheerio = require('cheerio');

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}


client.once('ready', () => {
    console.log('The BOT is online!');
})

client.on("guildMemberAdd", member => {
    const WelcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome')
    WelcomeChannel.send (`Hello ${member}, welcome to Demo Mesa! Have fun, but first please verify and read the rules.`)
})

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.id === '')
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
    }
});

client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'demomesa'){
       client.commands.get('demomesa').execute(message, args);
    }
    if(command === 'clear'){
       client.commands.get('clear').execute(message, args);
    }
    if(command === 'stfu'){
        client.commands.get('stfu').execute(message, args);
    }
    if(command === 'osama'){
        client.commands.get('osama').execute(message, args);
    }
    if(command === 'image'){
        let args = message.content.substring(prefix.length).split(" ");
        switch (args[0]) {
            case 'image':
            image(message);
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
         
                $ = cheerio.load(responseBody);
         
                var links = $(".image a.link");
         
                var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
               
                console.log(urls);
         
                // Send result
                message.channel.send( urls[Math.floor(Math.random() * urls.length)]);
            });
         
        }
    }
});

client.login(process.env.token);
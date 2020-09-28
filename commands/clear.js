module.exports = {
    name: 'clear',
    description: "Clear the chat!",
    execute(message, args){
        message.channel.bulkDelete(99);
    }
}
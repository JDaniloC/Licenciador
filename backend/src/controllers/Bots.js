const Bots = require('../models/Bot'); 

module.exports = {
    
    async index(request, response) {
        const bots = await Bots.find();
        return response.json(bots);
    },

    async store(request, response) {
        const {name, title, imageURL} = request.body;
        // JWT token!

        let bot = await Bots.findOne({name}); 
        if (!bot) { 
            bot = await Bots.create({
                name,
                title,
                imageURL,
            })
        }
        return response.json(bot);
    },

    async destroy(request, response) {
        const {name} = request.body;
        // JWT token!

        let deletebot = await Bots.findOneAndDelete({name});
        return response.json(deletebot);
    }

}
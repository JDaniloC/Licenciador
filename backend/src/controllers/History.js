const History = require('../models/History');

module.exports = {
    async index(request, response) {
        const events = await History.find();
        return response.json(events);
    },

    async show(request, response) {
        const { who } = request.query;
        const events = await History.find({ who });

        return response.json(events)
    },

    async store( who, what ) {
        await History.create({
            who, what, when: new Date()
        })
    },

    async delete(request, response) {
        const { when, email } = request.body;

        const creator = await Sellers.findOne({ email });

        if (!creator || creator.type !== "admin") {
            return response.json({});
        }


        await History.deleteMany({ when: { $lt: when } })
    }
}
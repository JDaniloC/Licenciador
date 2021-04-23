const Sellers = require('../models/Seller'); 
const History = require('./History');

module.exports = {
    async index(request, response) {
        // This need to be a JWT token
        
        const sellers = await Sellers.find();
        return response.json(sellers);
    },

    async store(request, response) {
        const { admin: creatorEmail,
                email: sellerEmail, 
            licenses, botlist, show 
        } = request.body;

        // This need to be a JWT token
        const creator = await Sellers.findOne({ email: creatorEmail });

        if (!creator || creator.type !== "admin") {
            return response.json({});
        }

        let seller = await Sellers.findOne({email: sellerEmail}); 
        if (!seller) { 
            seller = await Sellers.create({
                email: sellerEmail,
                tests: licenses,
                type: "seller",
                licenses: 0,
                botlist,
                show,
            })
        } else {
            seller.botlist.forEach(name => {
                if (botlist.indexOf(name) === -1) {
                    botlist.push(name);
                }
            });

            seller = await Sellers.findOneAndUpdate(
                {email: sellerEmail},
                {
                    tests: licenses, 
                    botlist, 
                    show
                })  
            seller.botlist = botlist;
        }
        seller.password = "";
        History.store(creatorEmail, `Create/Update ${sellerEmail} seller.`)
        return response.json(seller);
    },

    async destroy(request, response) {
        const { email, creatorEmail } = request.body;
        // This need to be a JWT token/
        const creator = await Sellers.findOne({ email: creatorEmail });

        if (!creator || creator.type !== "admin") {
            return response.json({});
        }

        const seller = await Sellers.findOneAndDelete({email});

        History.store(creatorEmail, `Deleted ${email} seller.`)
        return response.json(seller);
    },

}
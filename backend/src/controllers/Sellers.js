const Sellers = require('../models/Seller'); 

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
                tests: licenses * 2,
                type: "seller",
                licenses,
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
                    licenses, 
                    tests: licenses * 2, 
                    botlist, 
                    show
                })  
            seller.botlist = botlist;
        }
        seller.password = "";
        return response.json(seller);
    },

    async destroy(request, response) {
        const {email} = request.body;
        // This need to be a JWT token

        const seller = await Sellers.findOneAndDelete({email});
        return response.json(seller);
    },

}
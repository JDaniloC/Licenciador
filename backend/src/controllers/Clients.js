const Client = require('../models/Client');
const History = require('./History');

module.exports = {

    async show(request, response) {
        const { email, bot: botName } = request.query;

        let result = {};
        let client = await Client.findOne({ email });
        if (client) {
            client.license.forEach(element => {
                if (element.botname === botName) {
                    result[email] = {
                        timestamp: element.timestamp
                    }
                }
            }); 
        } else {
            clientList = await Client.find({ seller: email });
            if (clientList.length > 0) {
                clientList.forEach(client => {
                    for (let index = 0; index < client.license.length; index++) {
                        const element = client.license[index];
                        if (element.botname === botName) {
                            let timestamp = element.timestamp - (new Date().getTime() / 1000);
                            if (timestamp < 0) {
                                timestamp = 0
                            } else {
                                timestamp /= 86400
                            }
                            result[client.email] = {
                                licenses: {
                                    [botName]: Math.round(timestamp)
                                }
                            }
                        }
                    } 
                })
            }
        } 
        return response.json(result);
    },

    async store(request, response) {
        const { seller: sellerEmail, client: clientEmail, bot: botName } = request.body;
        // Needs to use a JWT token (from seller)
       
        if (!sellerEmail || !clientEmail || !botName) {
            return response.json({});
        }

        let client = await Client.findOne({ email: clientEmail }); 
        const today = new Date().getTime();

        if (!client) { 
            client = await Client.create({
                email: clientEmail,
                seller: sellerEmail,
                license: [{
                    botname: botName,
                    updateTime: today, 
                    timestamp: 0
                }],
            });
            History.store(sellerEmail, `Created the ${clientEmail} client.`)
        } else {
            let licenses = client.license;
            let hasLicense = licenses.filter(license => license.botname === botName)
            if (hasLicense.length === 0) {
                licenses.push({
                    botname: botName,
                    timestamp: 0
                });
            };
            await Client.updateOne({email: clientEmail}, {
                seller: sellerEmail,
                updateTime: today, 
                license: licenses
            });
            History.store(sellerEmail, `Updated the ${clientEmail} client.`)
        }

        return response.json({
            seller: sellerEmail,
            since: today,
            licenses: {
                [botName]: 0
            }
        });
    },

    async update(request, response) {
        // const { license } = request.body; 
        // let atualizar = await Client.findOneAndUpdate(
        //    { client:license });
        // return response.json(atualizar)
    },

    async destroy(request, response) {
        const { seller, email } = request.body;
        // Needs to use a JWT token (from seller)

        let client = await Client.findOne({ email }); 
        if (client.seller === seller) {
            await Client.findOneAndDelete({ email });

            History.store(seller, `Deleted the ${email} client.`)
        }
        return response.json(client);
    }
}

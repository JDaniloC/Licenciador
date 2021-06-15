import { 
    VercelRequest, 
    VercelRequestBody, 
    VercelRequestQuery, 
    VercelResponse 
} from '@vercel/node';
import Clients, { ClientSchema } from '../../models/Clients';
import { storeHistory } from './history';
import { connectToDatabase } from './database';
import Sellers from '../../models/Sellers';
import toLowerCase from './utils';

async function show(query: VercelRequestQuery) {
    const { email, botName, isSeller } = toLowerCase(query);

    let result = {};
    if (!isSeller) {
        const client = await Clients.findOne({ email }) as ClientSchema;
        client.license.forEach(element => {
            if (element.botName === botName) {
                result[email] = {
                    timestamp: element.timestamp
                }
            }
        }); 
    } else {
        const clientList = await Clients.find({ seller: email }) as ClientSchema[];
        if (clientList.length > 0) {
            clientList.forEach(client => {
                client.license.map((element) => {
                    if (element.botName === botName) {
                        let timestamp = element.timestamp - (new Date().getTime() / 1000);
                        if (timestamp < 0) {
                            timestamp = 0
                        } else {
                            timestamp /= 86400
                        }
                        result[client.email] = {
                            licenses: {
                                [botName as string]: Math.round(timestamp)
                            }
                        }
                    }
                })
            })
        }
    } 
    return result;
}

async function store(body: VercelRequestBody) {
    const { sellerEmail, clientEmail, botName } = toLowerCase(body);

    if (!sellerEmail || !clientEmail || !botName) {
        return {}
    }

    let client = await Clients.findOne({ email: clientEmail }) as ClientSchema; 
    const today = new Date().getTime();

    if (!client) { 
        await Clients.create({
            email: clientEmail,
            seller: sellerEmail,
            license: [{
                botName,
                updateTime: today, 
                timestamp: 0
            }],
        });
        storeHistory(sellerEmail, `Created the ${clientEmail} client.`)
    } else {
        const licenses = client.license;
        const hasLicense = licenses.filter(
            license => license.botName === botName).length > 0
        if (!hasLicense) {
            licenses.push({
                botName, timestamp: 0, updateTime: today
            });
            storeHistory(sellerEmail, `Add ${botName} to ${clientEmail} client.`)
        };
        await Clients.updateOne({email: clientEmail}, {
            seller: sellerEmail,
            updateTime: today, 
            license: licenses
        });
        if (client.seller !== sellerEmail) {
            storeHistory(sellerEmail, `Changed Seller from ${client.seller} of ${clientEmail} client.`)
        }
    }

    return {
        seller: sellerEmail,
        since: today,
        licenses: {
            [botName]: 0
        }
    };
}

async function destroy(query: VercelRequestQuery) {
    const { seller, email } = toLowerCase(query);

    if (!seller || !email) {
        return { "error": "Missing params." };
    }

    let client = await Clients.findOne({ email }) as ClientSchema; 
    if (client.seller === seller) {
        if (client.license.filter((license) => {
            const now = new Date().getTime();
            const before = license.updateTime;
            const allow = ((license.timestamp - before) > 7) ? 7 : 1;
            return ((now - before) / (1000 * 60 * 60 * 24)) > allow
        }).length == 0) {
            await Sellers.findOneAndUpdate(
                { email: seller }, {$inc: { licenses: -1 }})
        }

        await Clients.findOneAndDelete({ email });

        storeHistory(seller, `Deleted the ${email} client.`)
    }
    return client;
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    switch (req.method) {
        case "GET":
            const clientList = await show(req.query);
            res.status(200).json(clientList);
            break;
        case "POST":
            const newClient = await store(req.body);
            res.status(200).json(newClient);
            break;
        case "DELETE":
            const deleted = await destroy(req.query);
            res.status(200).json(deleted);
            break;
        default:
            res.status(404).json({ "error": "method not found" });
            break;
    }
}
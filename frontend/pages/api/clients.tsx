import { 
    VercelRequest, 
    VercelRequestBody, 
    VercelRequestQuery, 
    VercelResponse 
} from '@vercel/node';
import Clients, { ClientSchema } from 'models/Clients';
import { connectToDatabase } from './database';
import { storeHistory } from './history';

import GetRemaining from 'utils/GetRemaining';
import toLowerCase from 'utils/GetRequest';
import verifyRole from 'utils/verifyRole';
import Sellers from 'models/Sellers';
import Users from 'models/Users';
import MD5 from 'utils/MD5';

async function show(email: string, botName: string, password: string) {
    const result = { timestamp: 0, message: "Compre uma licença!" };
    const client = await Clients.findOne({ email }) as ClientSchema;

    if (client === null) {
        throw new Error('Client not found');
    }

    if (["catalogador"].indexOf(botName) !== -1) {
        if (typeof password === "undefined") {
            result.message = "Senha necessária!";
            return result;
        }
        if (client.password !== MD5(password)) {
            if (client.password) {
                result.message = "Senha incorreta! Você alterou a senha?";
                return result;
            } else {
                await Clients.findOneAndUpdate(
                    { email }, { password: MD5(password) }
                );
            }
        }
    }

    client.license.forEach(element => {
        if (element.botName === botName) {
            result.timestamp = element.timestamp - (
                new Date().getTime() / 1000);
            result.message = GetRemaining(element.timestamp);
        }
    }); 
    return result;
}

async function index(email: string, botName: string, isAdmin: boolean = false) {
    let result = [];
    const query = (isAdmin) ? {} : { seller: email };
    const clientList = await Clients.find(query) as ClientSchema[];
    if (clientList.length > 0) {
        clientList.forEach(client => {
            client.license.map((element) => {
                if (element.botName === botName || isAdmin) {
                    let timestamp = element.timestamp - (
                        new Date().getTime() / 1000);
                    if (timestamp < 0) {
                        timestamp = 0
                    } else {
                        timestamp /= 86400
                    }
                    
                    let updateString = "?";
                    try {
                        updateString = client.updateTime.toLocaleString("pt-BR")
                    } catch (e) {
                        console.log(e)
                    }

                    result.push({
                        email: client.email,
                        seller: client.seller,
                        updateAt: updateString,
                        botName: element.botName,
                        license: Math.round(timestamp)
                    })
                }
            })
        })
    }
    return result;
}

async function getClient(req: VercelRequest) {
    const { email, botName, password } = toLowerCase(req.query);
    const reqRole = await verifyRole(req, ["admin"]);
    if (reqRole === "seller") {
        if (!reqRole) {
            throw new Error("Unauthorized");
        }
        return await index(email, botName);
    } else if (reqRole === "admin") {
        if (!reqRole) {
            throw new Error("Unauthorized");
        }
        return await index(email, botName, true);
    } else {
        return await show(email, botName, password);
    }
}

async function store(body: VercelRequestBody) {
    const { sellerEmail, clientEmail, botName } = toLowerCase(body);

    if (!sellerEmail || !clientEmail || !botName) {
        return {}
    }

    let client = await Clients.findOne(
        { email: clientEmail }) as ClientSchema; 
    const today = new Date().getTime();

    if (!client) { 
        await Clients.create({
            email: clientEmail,
            seller: sellerEmail,
            updateTime: today, 
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

    const updateString = new Date(today).toLocaleString("pt-BR");
    return {
        license: 0,
        email: clientEmail,
        updateAt: updateString
    };
}

async function destroy(query: VercelRequestQuery) {
    const { seller, email, botName } = toLowerCase(query);

    if (!seller || !email || !botName) {
        return { "error": "Params required: seller, email, botName" };
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
        
        client.license = client.license.filter(
            license => license.botName !== botName
        );
        
        if (client.license.length === 0) {
            await Clients.findOneAndDelete({ email });
            await Users.findOneAndDelete({ email });
            storeHistory(seller, `Deleted the ${email} client.`)
        } else {
            await Clients.updateOne({ email }, {
                license: client.license,
                updateTime: new Date().getTime(), 
            });
            storeHistory(seller, `Deleted bot ${botName} of ${email} client.`)
        }

        return client;
    }
    return { "error": "Unauthorized seller!" };
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    if (req.method === "GET") {
        try { 
            const response = await getClient(req);
            return res.status(200).json(response);
        } catch (e) {
            if (e instanceof Error) {
                return res.status(401).json({ 
                    error: "UNAUTHORIZED." 
                });
            }
            return res.status(404).json({ 
                error: "Client not found" 
            });
        } 
    }

    const isAdmin = await verifyRole(req, ["seller"]);
    if (!isAdmin) {
        return res.status(401).json({ 
            error: "UNAUTHORIZED." });
    }

    switch (req.method) {
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

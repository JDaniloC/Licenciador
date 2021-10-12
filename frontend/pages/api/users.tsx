import { 
    VercelRequest, 
    VercelRequestBody, 
    VercelRequestQuery, 
    VercelResponse 
} from '@vercel/node';

import Clients, { ClientSchema } from 'models/Clients';
import Users, { UserSchema } from 'models/Users';
import Bots, { BotSchema } from 'models/Bots';
import { connectToDatabase } from './database';

import GetRemaining from 'utils/GetRemaining';
import toLowerCase from 'utils/GetRequest';

const MAX_TRADES = 10;

async function show(email: string) {
    const user = await Users.findOne({ email }) as UserSchema;
    
    if (!user) {
        return {}
    }
    const client = await Clients.findOne({ email }) as ClientSchema;
    const botList = await Bots.find() as BotSchema[];
    const licenses = []

    for (let index = 0; index < client.license.length; index++) {
        const license = client.license[index];
        const botFound = botList.filter(bot => (
            bot.name === license.botName));

        if (botFound.length === 0) continue;
        
        licenses.push({
            botName: license.botName,
            botTitle: botFound[0].title,
            botImg: botFound[0].imageURL,
            remaining: GetRemaining(license.timestamp),
        });
    }

    return { 
        licenses,
        email: user.email, 
        trades: user.trades, 
        seller: client.seller,
        createdAt: user.createdAt,
        totalYield: user.totalYield, 
        initialBalance: user.initialBalance,
        additionalInfo: user.additionalInfo,
    }
}

async function store(body: VercelRequestBody) {
    const { email } = toLowerCase(body);

    if (!email) {
        return {}
    }

    const user = await Users.findOne({ email }) as UserSchema; 
    const today = new Date();

    if (!user) { 
        const { 
            initialBalance, 
            additionalInfo 
        } = toLowerCase(body);

        if (initialBalance === undefined) {
            return {}
        }

        return await Users.create({
            email, 
            totalYield: 0,
            initialBalance, 
            additionalInfo,
            createdAt: today
        });
    }
    const { 
        botName, account, 
        result, amount, infos 
    } = toLowerCase(body);

    if ([botName, account, result, amount, infos ].filter(
            item => item === null).length > 0) {
        return {}
    }

    user.trades.push({
        infos: infos.toUpperCase(), 
        botName, account,
        result, amount, 
        date: today 
    });
    user.totalYield += amount
    if (user.trades.length > MAX_TRADES) {
        user.trades.splice(0, 1);
    }
    await Users.updateOne({ email }, { 
        trades: user.trades,
        totalYield: user.totalYield
    });
    return user;
}

async function destroy(query: VercelRequestQuery) {
    const { email } = toLowerCase(query);

    if (!email) {
        return { "error": "Missing params." };
    }

    return await Users.findOneAndDelete({ email });
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    switch (req.method) {
        case "GET":
            const { email } = toLowerCase(req.query);
            const response = await show(email);
            res.status(200).json(response);
            break;
        case "POST":
            const newUser = await store(req.body);
            res.status(200).json(newUser);
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

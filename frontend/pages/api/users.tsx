import { 
    VercelRequest, 
    VercelRequestBody, 
    VercelRequestQuery, 
    VercelResponse 
} from '@vercel/node';

import Clients, { ClientSchema } from '../../models/Clients';
import Users, { UserSchema } from '../../models/Users';
import Bots, { BotSchema } from '../../models/Bots';

import { connectToDatabase } from './database';
import toLowerCase from './utils';

async function show(email: string) {
    const user = await Users.findOne({ email }) as UserSchema;
    
    if (user === null) {
        return {}
    }
    const client = await Clients.findOne({ email }) as ClientSchema;

    const trades = [];
    const botList: BotSchema[] = [];
    
    for (let index = 0; index < user.trades.length; index++) {
        const element = user.trades[index];
        let botFound = botList.filter(bot => (
            bot.name === element.botName))
        if (botFound.length === 0) {
            const bot = await Bots.findOne({ 
                botName: element.botName }) as BotSchema;
            botList.push(bot);
            botFound.push(bot);
        }

        const license = client.license.filter(license => (
            license.botName === element.botName));

        trades.push({
            ...element,
            botImg: botFound[0].imageURL,
            license: license[0].timestamp
        })
    }
    return { ...user, trades }
}

async function store(body: VercelRequestBody) {
    const { email } = toLowerCase(body);

    if (email === null) {
        return {}
    }

    const user = await Users.findOne({ email }) as UserSchema; 
    const today = new Date();

    if (!user) { 
        const { 
            realBalance, 
            initialBalance, 
            additionalInfo 
        } = toLowerCase(body);

        if ([realBalance, initialBalance, additionalInfo ].filter(
                item => item === null).length > 0) {
            return {}
        }

        return await Users.create({
            email, realBalance,
            initialBalance, 
            additionalInfo,
            createdAt: today
        });
    }
    const { botName, account, balance, 
        result, amount, infos 
    } = toLowerCase(body);

    if ([botName, account, balance, 
        result, amount, infos ].filter(
            item => item === null).length > 0) {
        return {}
    }

    user.trades.push({
        botName, account, balance, 
        result, amount, infos,
        date: today 
    });
    return await Clients.updateOne({ email }, { 
        trades: user.trades 
    });
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

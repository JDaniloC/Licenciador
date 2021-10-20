import { 
    VercelRequest, 
    VercelRequestBody, 
    VercelRequestQuery, 
    VercelResponse 
} from '@vercel/node';

import Clients, { ClientSchema } from 'models/Clients';
import Users, { UserSchema, UserLicense } from 'models/Users';
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
    const licenses: UserLicense[] = []

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
    const createdAt = new Date(user.createdAt).toLocaleString("pt-BR");

    return { 
        email: user.email, 
        licenses, createdAt,
        trades: user.trades, 
        initialBalance: user.initialBalance,
        additionalInfo: user.additionalInfo,
        totalYield: user.totalYield.toFixed(2), 
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
            additionalInfo,
            account
        } = toLowerCase(body);

        if (initialBalance === undefined ||
            account == undefined) {
            return {}
        }

        if (account !== "real") {
            return await Users.create({
                email, 
                totalYield: 0,
                additionalInfo,
                createdAt: today,
                initialBalance: 0, 
            });
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
        result, amount, infos,
        initialBalance: newBalance,
    } = toLowerCase(body);

    if ([botName, account, result, amount, infos ].filter(
            item => item === undefined).length > 0) {
        return {}
    }

    let initialBalance = user.initialBalance;
    if (user.initialBalance === 0 
        && account === "real" &&
        newBalance !== undefined)  {
        initialBalance = newBalance
    }

    const { title: botTitle } = await Bots.findOne({ name: botName });
    user.trades.push({
        botName, result, botTitle,
        infos: infos.toUpperCase(), 
        amount: parseFloat(amount), 
        account: account.toUpperCase(), 
        date: today.toLocaleString("pt-BR"),
    });
    user.totalYield += parseFloat(amount);
    if (user.trades.length > MAX_TRADES) {
        user.trades.splice(0, 1);
    }
    await Users.updateOne({ email }, { 
        initialBalance,
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

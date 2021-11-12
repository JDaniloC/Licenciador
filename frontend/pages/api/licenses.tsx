import { VercelRequest, VercelRequestBody, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './database';
import { storeHistory } from './history';

import toLowerCase from 'utils/GetRequest';
import verifyRole from 'utils/verifyRole';

import Clients from 'models/Clients';
import Sellers from 'models/Sellers';

async function store(body: VercelRequestBody) {
    const { sellerEmail, clientEmail,
        botName, isTest } = toLowerCase(body);
    
    if (!sellerEmail || !clientEmail || !botName || 
        isTest === undefined) {
        return {};
    } 
    
    const today = new Date().getTime();
    const seller = await Sellers.findOne({ email: sellerEmail });
    const client = await Clients.findOne({ email: clientEmail });
    const result = {
        updateAt: new Date(client.updateTime).toLocaleString("pt-BR"),
        licenses: seller.licenses,
        tests: seller.tests,
        email: clientEmail,
        license: 0,
    }
    
    if (!client || seller.botList.indexOf(botName) === -1) {
        return result;
    }
    
    const agora = new Date().getTime() / 1000;
    const licenses = client.license;
    let daysToAdd = 0;
    if (isTest && seller.tests > 0) {
        result.tests -= 1;
        daysToAdd = 3;
    } else if (!isTest){
        daysToAdd = 31;
        result.licenses += 1;
    }
    
    let foundBot = false;
    licenses.forEach(bot => {
        if (bot.botName === botName) {
            foundBot = true;
            bot.timestamp = agora + 86400 * daysToAdd;
            result.license = daysToAdd;
        }
    })
    if (!foundBot) {
        licenses.push({
            botName: botName,
            timestamp: agora + 86400 * daysToAdd
        })
        result.license = daysToAdd;
    }
    
    result.updateAt = new Date(today).toLocaleString("pt-BR");
    await Sellers.findOneAndUpdate(
        {email: sellerEmail}, {
            licenses: result.licenses,
            tests: result.tests
        });
    await Clients.findOneAndUpdate(
        {email: clientEmail}, {
            license: licenses,
            updateTime: today, 
        })            
    
    if (daysToAdd > 0) {
        storeHistory(sellerEmail, `Added ${daysToAdd} days to ${clientEmail}.`)
    }
    return result;
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    const isAdmin = await verifyRole(req, ["seller"]);
    if (!isAdmin) {
        return res.status(401).json({ 
            error: "UNAUTHORIZED." });
    }

    switch (req.method) {
        case "POST":
            const result = await store(req.body);
            res.status(200).json(result);
            break;
    
        default:
            res.status(404).json({ "error": "method not found" });
            break;
    }
}
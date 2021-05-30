import { VercelRequest, VercelRequestBody, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './database';
import Clients from '../../models/Clients';
import Sellers from '../../models/Sellers';
import { storeHistory } from './history';
import toLowerCase from './utils';

async function store(body: VercelRequestBody) {
    const { sellerEmail, clientEmail,
        botName, isTest } = toLowerCase(body);
    
    if (!sellerEmail || !clientEmail || !botName || 
        isTest === undefined) {
        return {};
    } 
    
    const seller = await Sellers.findOne({ email: sellerEmail });
    const client = await Clients.findOne({ email: clientEmail });
    const result = {
        licenses: seller.licenses,
        tests: seller.tests,
        time: 0
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
            result.time = daysToAdd;
        }
    })
    if (!foundBot) {
        licenses.push({
            botName: botName,
            timestamp: agora + 86400 * daysToAdd
        })
        result.time = daysToAdd;
    }
    
    await Sellers.findOneAndUpdate(
        {email: sellerEmail}, {
            licenses: result.licenses,
            tests: result.tests
        });
    await Clients.findOneAndUpdate(
        {email: clientEmail}, {license: licenses})            
    
    if (daysToAdd > 0) {
        storeHistory(sellerEmail, `Added ${daysToAdd} days to ${clientEmail}.`)
    }
    return result;
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    switch (req.method) {
        case "POST":
            const result = store(req.body);
            res.status(200).json(result);
            break;
    
        default:
            res.status(404).json({ "error": "method not found" });
            break;
    }
}
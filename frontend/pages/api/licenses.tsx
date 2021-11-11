import { VercelRequest, VercelRequestBody, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './database';
import { storeHistory } from './history';

import toLowerCase from 'utils/GetRequest';
import verifyRole from 'utils/verifyRole';

import Clients from 'models/Clients';
import Sellers from 'models/Sellers';

async function store(body: VercelRequestBody) {
    const { sellerEmail, clientEmail,
        botName, licenseDays } = toLowerCase(body);
    
    if (!sellerEmail || !clientEmail || !botName || !licenseDays) {
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
    const licenseList = client.license;
    result.licenses += 1;
    
    let foundBot = false;
    licenseList.forEach(bot => {
        if (bot.botName === botName) {
            foundBot = true;
            bot.timestamp = agora + 86400 * licenseDays;
            result.license = licenseDays;
        }
    })
    if (!foundBot) {
        licenseList.push({
            botName: botName,
            timestamp: agora + 86400 * licenseDays
        })
        result.license = licenseDays;
    }
    
    result.updateAt = new Date(today).toLocaleString("pt-BR");
    await Sellers.findOneAndUpdate(
        {email: sellerEmail}, {
            licenses: result.licenses
        });
    await Clients.findOneAndUpdate(
        {email: clientEmail}, {
            license: licenseList,
            updateTime: today, 
        })            
    
    if (licenseDays > 0) {
        storeHistory(sellerEmail, `Added ${licenseDays} days to ${clientEmail}.`)
    }
    return result;
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    const isAdmin = await verifyRole(req, ["seller"]);
    if (!isAdmin) {
        return res.status(403).json({ 
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
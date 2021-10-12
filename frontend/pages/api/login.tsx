import { VercelRequest, VercelRequestBody, VercelResponse } from '@vercel/node';
import Sellers, { SellerSchema } from 'models/Sellers';
import { connectToDatabase } from './database';

import MD5 from 'utils/MD5';

async function store(body: VercelRequestBody) {
    const {email, password} = body;
            
    if (!email || !password) {
        return {
            error: 'Params required: email, password'
        };
    }
    const account = await Sellers.findOne({ email }) as SellerSchema;
    const encrypted = MD5(password);
    let result = {};
    if (account) {
        if (account.password) {
            if (account.password === encrypted) {
                result = account;
            }
        } else {
            await Sellers.findOneAndUpdate(
                { email }, {password: encrypted}
            );
            result = account;
        }
    } 

    return result;
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
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
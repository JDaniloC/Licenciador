import { VercelRequest, VercelRequestBody, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './database';
import Sellers from '../../models/Sellers';
import MD5 from './MD5';

async function store(body: VercelRequestBody) {
    const {email, password} = body;
            
    if (!email || !password) {
        return {
            error: 'Params required: email, password'
        };
    }
    let conta = await Sellers.findOne({ email });
    let encrypted = MD5(password);
    let result = {};
    if (conta) {
        if (conta.password) {
            if (conta.password === encrypted) {
                result = conta;
            }
        } else {
            await Sellers.findOneAndUpdate(
                { email }, {password: encrypted}
            );
            result = conta;
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
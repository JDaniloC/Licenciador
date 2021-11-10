import { 
    VercelRequest, 
    VercelResponse, 
    VercelRequestBody
} from '@vercel/node';
import Sellers, { SellerSchema } from 'models/Sellers';
import { connectToDatabase } from './database';

import MD5 from 'utils/MD5';
import jwt  from "jsonwebtoken";
import verifyToken from 'utils/VerifyToken';

async function store(body: VercelRequestBody) {
    const { email, password } = body;
            
    if (!email || !password) {
        return {
            error: 'Params required: email, password'
        };
    }
    const account = await Sellers.findOne({ email }) as SellerSchema;
    const encrypted = MD5(password);
    let result = null;
    if (account) {
        const token = jwt.sign({ email }, process.env.SECRET, {
            expiresIn: 60 * 60 // expires in 1 hour
        });
        if (account.password) {
            if (account.password === encrypted) {
                result = { 
                    token, email: account.email, type: account.type,
                    botList: account.botList, showBots: account.showBots,
                    tests: account.tests, licenses: account. licenses,
                };
            }
        } else {
            await Sellers.findOneAndUpdate(
                { email }, {password: encrypted}
            );
            result = { 
                token, email: account.email, type: account.type,
                botList: account.botList, showBots: account.showBots,
                tests: account.tests, licenses: account. licenses,
            };
        }
    }

    return result;
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    switch (req.method) {
        case "GET":
            const isAuth = verifyToken(req);
            if (isAuth.auth) {
                res.status(200).json(isAuth);
            } else {
                res.status(401).json(isAuth);
            }
            break;

        case "POST":
            const result = await store(req.body);
            res.status(200).json(result);
            break;
    
        default:
            res.status(404).json({ "error": "method not found" });
            break;
    }
}
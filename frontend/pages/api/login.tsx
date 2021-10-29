import { 
    VercelRequest, 
    VercelResponse, 
    VercelRequestBody
} from '@vercel/node';
import Sellers, { SellerSchema } from 'models/Sellers';
import { connectToDatabase } from './database';

import MD5 from 'utils/MD5';
import jwt  from "jsonwebtoken";

function verifyJWT(request: VercelRequest, response: VercelResponse){
    const token = request.headers.authorization;
    if (!token) return response.status(401).json(
        { auth: false, message: 'No token provided.' });
    
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
        if (err) return response.status(500).json(
            { auth: false, message: 'Failed to authenticate token.' });
        
        response.status(200).json(
            { auth: true, message: 'Authenticated' });
    });
}

async function store(body: VercelRequestBody) {
    const { email, password } = body;
            
    if (!email || !password) {
        return {
            error: 'Params required: email, password'
        };
    }
    const account = await Sellers.findOne({ email }) as SellerSchema;
    const encrypted = MD5(password);
    let result = { token: null };
    if (account) {
        const token = jwt.sign({ email }, process.env.SECRET, {
            expiresIn: 60 * 60 // expires in 1 hour
        });
        if (account.password) {
            if (account.password === encrypted) {
                result.token = token;
            }
        } else {
            await Sellers.findOneAndUpdate(
                { email }, {password: encrypted}
            );
            result.token = token;
        }
    }

    return result;
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    switch (req.method) {
        case "GET":
            await verifyJWT(req, res);
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
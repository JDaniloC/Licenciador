import { 
    VercelRequestBody,
    VercelRequest, 
    VercelResponse
} from '@vercel/node';

import { connectToDatabase } from './database';
import verifyRole from 'utils/verifyRole';
import Bots from 'models/Bots';

async function store(body: VercelRequestBody) {
    const {name, title, imageURL, extraInfo} = body;

    let bot = await Bots.findOne({name}); 
    if (!bot) { 
        bot = await Bots.create({
            name,
            title,
            imageURL,
            extraInfo
        })
    }
    return bot;
}

async function destroy(body: VercelRequestBody, 
                       res: VercelResponse) {
    const { name } = body;

    const deletedBot = await Bots.findOneAndDelete({ name })
    res.status(200).json(deletedBot);
}

export default async (
    req: VercelRequest, 
    res: VercelResponse
) => {
    await connectToDatabase();
    
    if (req.method === "GET") {
        const { name } = req.query;
        if (name) {
            const bot = await Bots.findOne({ name }); 
            return res.status(200).json(bot);
        } else {
            const bots = await Bots.find();
            return res.status(200).json(bots);
        }
    }

    const isAdmin = await verifyRole(req, ["admin"]);
    if (!isAdmin) {
        return res.status(401).json({ 
            error: "UNAUTHORIZED." });
    }
    
    switch (req.method) {
        case "POST":
            const bot = await store(req.body);
            res.status(200).json(bot);
            break;
        case "DELETE":
            await destroy(req.body, res);
            break
        default:
            res.status(404).json(
                { "error": "method not found" });
            break;
    }
}

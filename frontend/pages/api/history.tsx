import { VercelRequest, VercelRequestBody, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './database';
import Histories from '../../models/History';
import Sellers from '../../models/Sellers';

export async function storeHistory(who: string, what: string) {
    await Histories.create({
        who, what, when: new Date()
    })
}

async function destroy(body: VercelRequestBody) {
    const { when, email } = body;

    const creator = await Sellers.findOne({ email });

    if (!creator || creator.type !== "admin") {
        return;
    }

    await Histories.deleteMany({ when: { $lt: when } })
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    switch (req.method) {
        case "GET":
            const allEvents = await Histories.find();
            res.status(200).json(allEvents);
            break;
        
        case "DELETE":
            destroy(req.body);
            res.status(202);
            break;
            
        default:
            res.status(404).json({ "error": "method not found" });
            break;
    }
}
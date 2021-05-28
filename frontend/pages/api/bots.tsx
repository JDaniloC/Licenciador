import { connectToDatabase } from './database';
import Bots from '../../models/Bots';
import { 
    VercelRequestBody,
    VercelRequest, 
    VercelResponse
} from '@vercel/node';

async function destroy(body: VercelRequestBody) {
    const { name } = body;
    return await Bots.findOneAndDelete({name});
}

export default async (
    req: VercelRequest, 
    res: VercelResponse) => {
    await connectToDatabase();

    switch (req.method) {
        case "GET":
            const bots = await Bots.find();
            res.status(200).json(bots);
            break;
        case "POST":
            const {name, title, imageURL} = req.body;

            let bot = await Bots.findOne({name}); 
            if (!bot) { 
                bot = await Bots.create({
                    name,
                    title,
                    imageURL,
                })
            }
            res.status(200).json(bot);
            break;
        case "DELETE":
            res.status(200).json(destroy(req.body));
            break
        default:
            res.status(404).json(
                { "error": "method not found" });
            break;
    }
}

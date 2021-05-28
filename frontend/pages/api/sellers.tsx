import { VercelRequest, VercelRequestBody, VercelRequestQuery, VercelResponse } from '@vercel/node';
import Sellers, { SellerSchema } from '../../models/Sellers';
import { connectToDatabase } from './database';
import { storeHistory } from './history';

async function store(body: VercelRequestBody) {
    let { creatorEmail, sellerEmail, 
        tests, botList, showBots 
    } = body;
    sellerEmail = sellerEmail.toLowerCase();

    const creator = await Sellers.findOne(
        { email: creatorEmail }) as SellerSchema;
    if (!creator || creator.type !== "admin") {
        return {};
    }

    let seller = await Sellers.findOne(
        { email: sellerEmail }) as SellerSchema; 
    if (!seller) { 
        seller = await Sellers.create({
            email: sellerEmail,
            type: "seller",
            licenses: 0,
            botList, showBots, tests,
        })
    } else {
        seller.botList.forEach(name => {
            if (botList.indexOf(name) === -1) {
                botList.push(name);
            }
        });

        seller = await Sellers.findOneAndUpdate(
            {email: sellerEmail},
            { tests, botList, showBots })  
        seller.showBots = showBots;
        seller.tests = tests;
        seller.botList = botList;
    }
    seller.password = "";
    storeHistory(creatorEmail, `Created/Updated ${sellerEmail} seller.`)
    return seller;
}

async function destroy(query: VercelRequestQuery) {
    const { email, creatorEmail } = query;

    if (!email || !creatorEmail) {
        return { "error": "Missing params: email, creatorEmail" };
    }

    const creator = await Sellers.findOne({ email: creatorEmail });

    if (!creator || creator.type !== "admin") {
        return {};
    }

    const seller = await Sellers.findOneAndDelete({email});

    storeHistory(creatorEmail as string, `Deleted ${email} seller.`)
    return seller;
}

export default async (req: VercelRequest, res: VercelResponse) => {
    await connectToDatabase();
    
    switch (req.method) {
        case "GET":
            const allSellers = await Sellers.find();
            res.status(200).json(allSellers);
            break;
    
        case "POST":
            const newSeller = await store(req.body);
            res.status(200).json(newSeller);
            break;

        case "DELETE":
            const deleted = await destroy(req.query);
            res.status(202).json(deleted);
            break;

        default:
            res.status(404).json({ "error": "method not found" });
            break;
    }
}
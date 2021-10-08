import mongoose from 'mongoose';

interface Trade {
    botName: string,
    account: string,
    balance: number,
    result: string,
    amount: number,
    infos: string,
    date: Date,
}

export interface UserSchema {
    email: string,
    createdAt: Date,
    realBalance: Number,
    initialBalance: Number,
    additionalInfo: Object,
    trades: Array<Trade>
}

const TradeModel = new mongoose.Schema({
    botName: String,
    account: String,
    balance: Number,
    result: String,
    amount: Number,
    infos: String,
    date: Date,
})

const UserModel = new mongoose.Schema({
    email: String,
    trades: [TradeModel],
    realBalance: Number,
    initialBalance: Number,
    additionalInfo: Object,
    createdAt: Date,
})

export default mongoose.models.User || 
    mongoose.model('User', UserModel);
import mongoose from 'mongoose';

export interface Trade {
    botTitle: string,
    botName: string,
    account: string,
    result: string,
    amount: number,
    infos: string,
    date: string,
}

export interface UserSchema {
    email: string,
    createdAt: Date,
    totalYield: number,
    initialBalance: Number,
    additionalInfo: Object,
    trades: Array<Trade>
}

export interface UserLicense {
    botImg: string,
    botName: string,
    botTitle: string,
    remaining: string
}

export interface UserView {
    email: string,
    createdAt: string,
    totalYield: Number,
    trades: Array<Trade>,
    initialBalance: Number,
    additionalInfo: Object,
    licenses: Array<UserLicense>,
}

const TradeModel = new mongoose.Schema({
    botTitle: String,
    botName: String,
    account: String,
    result: String,
    amount: Number,
    infos: String,
    date: String,
})

const UserModel = new mongoose.Schema({
    email: String,
    trades: [TradeModel],
    totalYield: Number,
    initialBalance: Number,
    additionalInfo: Object,
    createdAt: Date,
})

export default mongoose.models.User || 
    mongoose.model('User', UserModel);
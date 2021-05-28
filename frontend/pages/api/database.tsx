import mongoose from 'mongoose';

const connection = {
    isConnected: 0
}

export async function connectToDatabase() {
    if (connection.isConnected) {
        return
    }

    const db = await mongoose.connect(
        process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false 
    })

    connection.isConnected = db.connections[0].readyState;
}

import mongoose from "mongoose";

export const connectToDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database Connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.log(`Error connection to MongoDb: ${error.message}`);
        process.exit();
        
    }
}
import dotenv from "dotenv"
dotenv.config();
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async()=>{
    try {
       const connectioninstance= await mongoose.connect
       (`mongodb+srv://${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`mongodb connected host:${connectioninstance.connection.host}`);
       
    } catch (error) {
       console.log("mongodb error",error);
       process.exit(1)
        
    }
}
export default connectDB
import mongoose from "mongoose"
import { db_name } from "@/constants"

// export interface MongooseCache {
//   conn: typeof import("mongoose") | null;
//   promise: Promise<typeof import("mongoose")> | null;
// }

// declare global {
//   var mongoose: MongooseCache | undefined;
// }

// const globalForMongoose = global as typeof globalThis & {
//   mongoose?: {
//     conn: typeof import('mongoose') | null
//     promise: Promise<typeof import('mongoose')> | null
//   }
// }

const mongoDB_URL = process.env.MONGODB_URL
if (!mongoDB_URL) {
    throw new Error("MONGODB_URL is not defined in the environment variables")
}

// let cached = globalForMongoose.mongoose
// if (!cached) {
//     cached = globalForMongoose.mongoose = { conn: null, promise: null }
// }
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            console.log("Using cached MongoDB connection");
            return mongoose.connection
        }
        await mongoose.connect(`${mongoDB_URL}/${db_name}`, {
            bufferCommands: false,
        })
        console.log("using new MongoDB connection");
        return mongoose.connection

    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
        process.exit(1)
    }
}

export default connectDB
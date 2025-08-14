// apps/backend/src/database.ts
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB = process.env.MONGO_DB_NAME || "eiah_orquestrador";

mongoose.set("strictQuery", true);

export default (async () => {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(URI, {
            dbName: DB,                      // 👈 força o database
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        } as any);
        console.log(`[DB] Conectado em ${URI}/${DB}`);
    }
    return mongoose.connection;
})();

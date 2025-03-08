import { MongoDBAdapter } from '@infrastructure/db';

export const mongoDBAdapter = new MongoDBAdapter(process.env.MONGO_URL, process.env.DB_NAME);

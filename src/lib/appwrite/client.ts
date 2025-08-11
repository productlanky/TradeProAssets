import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const PROFILE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROFILE_COLLECTION_ID || "";
const NOTIFICATION_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATION_COLLECTION || "";
const TRANSACTION_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_TRANSACTION_COLLECTION || "";
const INVESTMENT_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_INVESTMENT_COLLECTION || "";
const RECEIPTS_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_RECEIPTS_BUCKET || "";
const STOCKLOG_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_STOCKLOG_COLLECTION_ID || "";

export { client, account, databases, storage, DB_ID, PROFILE_COLLECTION_ID, NOTIFICATION_COLLECTION, TRANSACTION_COLLECTION, INVESTMENT_COLLECTION, RECEIPTS_BUCKET,STOCKLOG_COLLECTION_ID};
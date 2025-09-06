import { consola } from "consola";
import type { Connection as MongooseConnection } from "mongoose";
import mongoose from "mongoose";

let cachedConnection: MongooseConnection | null = null;
let cachedClient: any = null;

type DBOptions = {
  maxPoolSize?: number;
  minPoolSize?: number;
  socketTimeoutMS?: number;
  [key: string]: any;
};

const defaultOptions: DBOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  socketTimeoutMS: 60000,
  serverSelectionTimeoutMS: 30000,
};

function withDatabase<T extends (...args: any[]) => Promise<any>>(
  handler: (client: any, ...args: Parameters<T>) => ReturnType<T>,
  dbName: string = "0xLiderX",
  options: DBOptions = {}
) {
  return async (...args: Parameters<T>) => {
    const client = await connectToDatabase(dbName, options);
    return handler(client, ...args);
  };
}

async function connectToDatabase(
  dbName: string = "0xLiderX",
  options: DBOptions = {}
) {
  if (cachedConnection && cachedClient) {
    return cachedClient;
  }

  const uri = process.env.DATABASE_URL || "";
  if (!uri) {
    consola.error("DATABASE_URL is not set");
    throw new Error("DATABASE_URL is not set");
  }

  try {
    const mongooseInstance = await mongoose.connect(uri, {
      ...defaultOptions,
      ...options,
      dbName,
    });
    cachedConnection = mongooseInstance.connection;
    cachedClient = cachedConnection.getClient().db(dbName);
    consola.success(`Connected to database: ${dbName}`);
    return cachedClient;
  } catch (error) {
    consola.error("Error connecting to database:", error);
    throw error;
  }
}

async function disconnectDatabase() {
  if (cachedConnection) {
    await cachedConnection.close();
    consola.info("Database connection closed");
    cachedConnection = null;
    cachedClient = null;
  }
}

async function reconnectDatabase(
  dbName: string = "0xLiderX",
  options: DBOptions = {}
) {
  await disconnectDatabase();
  return connectToDatabase(dbName, options);
}

async function dropDatabase() {
  if (!cachedClient) {
    consola.warn("No database client to drop database");
    return;
  }
  await cachedClient.dropDatabase();
  consola.info("Database dropped");
}

export {
  connectToDatabase,
  disconnectDatabase,
  dropDatabase,
  reconnectDatabase,
  withDatabase,
};

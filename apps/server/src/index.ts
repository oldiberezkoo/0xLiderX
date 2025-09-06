import { serve } from "@hono/node-server";
import consola from "consola";
import dotenv from "dotenv";
import "dotenv/config";
import i18next from "i18next";
import { connectToDatabase } from "./db";
import app from "./helpers/app";

dotenv.config();

export const server = async () => {
  await connectToDatabase().catch((error) => {
    consola.error("Error connecting to database:", error);
    process.exit(1);
  });
  await i18next.init();
  serve({
    fetch: app.fetch,
    port: parseInt(process.env.SERVER_PORT!),
    hostname: process.env.SERVER_ADDRESS_HOST,
  });

  consola.success(
    `Server running at http://${process.env.SERVER_ADDRESS_HOST}:${process.env.SERVER_PORT}`
  );
};

server();

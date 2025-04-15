// config.js
import path from "path";
import { fileURLToPath } from "url";

// Adjust __dirname to use the working directory where the script was executed
const __dirname = process.cwd();

export const config = {
  srcDir: path.resolve(__dirname, "./src/"),
  publicDir: path.resolve(__dirname, "./public"),
  outDir: path.resolve(__dirname, "./dist"),
  port: process.env.PORT || 3000,
  host: process.env.HOST || "0.0.0.0"
};

import { defineConfig } from "drizzle-kit";



const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  
  throw new Error("DATABASE_URL is required to run drizzle commands");
  
}



const databaseUrl = new URL(connectionString);

const database = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));



export default defineConfig({
  
  schema: "./drizzle/schema.ts",
  
  out: "./drizzle",
  
  dialect: "mysql",
  
  dbCredentials: {
    
    host: databaseUrl.hostname,
    
    port: Number(databaseUrl.port || "4000"),
    
    user: decodeURIComponent(databaseUrl.username),
    
    password: decodeURIComponent(databaseUrl.password),
    
    database,
    
    ssl: {
      
      minVersion: "TLSv1.2",
      
    },
    
  },
  
});


















import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createRateLimit, cleanupRateLimitBuckets } from "./rateLimit";

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(['User-agent: *', 'Disallow: /guide', 'Disallow: /admin', 'Disallow: /api/', 'Disallow: /login', 'Disallow: /register', ''].join(String.fromCharCode(10)));
  });
  app.use('/api/trpc', createRateLimit({ windowMs: 10 * 60 * 1000, maxRequests: 300, keyPrefix: 'trpc' }));
  app.use('/api/trpc', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    next();
  });
  setInterval(() => cleanupRateLimitBuckets(), 15 * 60 * 1000).unref();
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  if (process.env.OAUTH_SERVER_URL && process.env.VITE_APP_ID) {
    registerOAuthRoutes(app);
  }
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number.parseInt(process.env.PORT || "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch(console.error);

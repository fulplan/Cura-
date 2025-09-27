import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced development logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Log incoming requests in development
  if (app.get("env") === "development" && path.startsWith("/api")) {
    log(`🌐 [REQUEST] ${req.method} ${path} - ${req.ip}`);
    if (req.body && Object.keys(req.body).length > 0) {
      log(`📦 [REQUEST BODY] ${JSON.stringify(req.body, null, 2)}`);
    }
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
      
      // Enhanced development response logging
      if (app.get("env") === "development") {
        const status = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
        log(`${status} [RESPONSE] ${req.method} ${path} - ${res.statusCode} (${duration}ms)`);
        if (capturedJsonResponse && res.statusCode >= 400) {
          log(`🚨 [ERROR RESPONSE] ${JSON.stringify(capturedJsonResponse, null, 2)}`);
        }
      }
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Avoid double-send errors if headers already sent
    if (res.headersSent) {
      return _next(err);
    }

    res.status(status).json({ message });
    
    // Log the error but don't rethrow to avoid crashing the server
    if (app.get("env") === "development") {
      log(`🚨 [SERVER ERROR] ${err.stack || err.message}`);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Initialize email service on startup
    try {
      const { storage } = await import('./storage');
      await storage.initializeEmailService();
      log(`📧 Email service initialization completed`);
    } catch (error) {
      log(`❌ Failed to initialize email service on startup: ${error}`);
    }

    // Initialize scheduler service on startup
    try {
      const { schedulerService } = await import('./services/schedulerService');
      schedulerService.initializeDefaultJobs();
      log(`📅 Scheduler service initialized with default jobs`);
    } catch (error) {
      log(`❌ Failed to initialize scheduler service on startup: ${error}`);
    }
  });
})();

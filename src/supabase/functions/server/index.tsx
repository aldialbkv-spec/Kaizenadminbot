import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { a3ReportsRouter } from "./a3-reports-routes.ts";
import { vsmRouter } from "./vsm-routes.ts";
import qfdRoutes from "./qfd-routes.ts";
import hoshinRoutes from "./hoshin.ts";
import aiTestRoutes from "./ai-test-routes.ts";
import authRoutes from "./auth-routes.ts";
import tutorialRoutes from "./tutorial-routes.ts";
import tutorialAdminRoutes from "./tutorial-admin-routes.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    credentials: true,
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4c493c62/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth routes
app.route("/make-server-4c493c62/auth", authRoutes);

// Tutorial routes (public)
app.route("/make-server-4c493c62/tutorials", tutorialRoutes);

// Tutorial admin routes (upload/delete)
app.route("/make-server-4c493c62/tutorials/admin", tutorialAdminRoutes);

// A3 Reports routes
app.route("/make-server-4c493c62/a3-reports", a3ReportsRouter);

// VSM routes
app.route("/make-server-4c493c62/vsm", vsmRouter);

// QFD routes
app.route("/make-server-4c493c62/qfd", qfdRoutes);

// Hoshin Kanri routes
app.route("/make-server-4c493c62/hoshin", hoshinRoutes);

// AI Test routes
app.route("/make-server-4c493c62/ai-test", aiTestRoutes);

Deno.serve(app.fetch);
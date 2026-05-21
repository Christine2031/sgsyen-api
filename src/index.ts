import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import health from "./routes/health.js";
import reports from "./routes/reports.js";

const app = new Hono();

app.use("*", cors({
  origin: config.allowedOrigins.includes("*")
    ? "*"
    : (origin) => {
        if (!origin) return "*";
        if (config.allowedOrigins.includes(origin)) return origin;
        return null;
      },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.route("/health", health);
app.route("/reports", reports);

app.notFound((c) => c.json({ error: "Not Found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

const server = serve({ fetch: app.fetch, port: config.port });
console.log(`🚀 sgsyen-api running on port ${config.port}`);

// 优雅关闭（Cloud Run SIGTERM 支持）
const shutdown = () => {
  console.log("⏳ 收到关闭信号，正在优雅退出...");
  server.close(() => {
    console.log("✅ 服务已安全关闭");
    process.exit(0);
  });
  // 超过 10s 强制退出（Cloud Run 默认 deadline）
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

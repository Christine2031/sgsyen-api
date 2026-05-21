import dotenv from "dotenv";
dotenv.config();

// 启动时校验必填环境变量
const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ 缺少必填环境变量: ${key}`);
    process.exit(1);
  }
}

export const config = {
  port: Number(process.env.PORT) || 8080,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  gcsBucket: process.env.GCS_BUCKET || "sgsyen-content",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((s) => s.trim()),
};

import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 8080,
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  gcsBucket: process.env.GCS_BUCKET || "sgsyen-content",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "*")
    .split(",")
    .map((s) => s.trim()),
};

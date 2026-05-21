import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";
import { getSignedUrl, readFileAsText } from "../lib/gcs.js";

const reports = new Hono();

// 报告列表
reports.get("/", async (c) => {
  const { data, error } = await supabase
    .from("reports")
    .select("id, slug, title, subtitle, category, summary, cover_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// 报告详情（含正文）
reports.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !report) return c.json({ error: "Not Found" }, 404);

  // 从 GCS 读取 Markdown 正文
  let content = "";
  if (report.gcs_content_path) {
    content = await readFileAsText(report.gcs_content_path);
  }

  return c.json({ ...report, content });
});

// 下载 PDF（需验证会员权限）
reports.get("/:slug/download", async (c) => {
  const slug = c.req.param("slug");
  const authHeader = c.req.header("Authorization");

  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return c.json({ error: "Unauthorized" }, 401);

  // 检查 sgsyen 订阅
  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("product", "sgsyen")
    .eq("status", "active")
    .single();

  if (subError && subError.code !== "PGRST116") {
    // PGRST116 = 0 rows，属于正常无订阅；其他错误是 DB 故障
    console.error("[reports/download] 订阅查询失败:", subError);
    return c.json({ error: "服务器内部错误" }, 500);
  }
  if (!sub) return c.json({ error: "需要开通 SGSYEN 会员" }, 403);

  const { data: report } = await supabase
    .from("reports")
    .select("gcs_pdf_path")
    .eq("slug", slug)
    .single();

  if (!report?.gcs_pdf_path) return c.json({ error: "PDF 不存在" }, 404);

  const url = await getSignedUrl(report.gcs_pdf_path, 10);
  return c.json({ url });
});

export default reports;

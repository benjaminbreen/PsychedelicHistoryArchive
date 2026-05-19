import { buildArchiveIndexJson, loadArchiveExportData } from "@/lib/llm-export";

export const revalidate = 3600;

export async function GET() {
  const data = await loadArchiveExportData();

  return Response.json(buildArchiveIndexJson(data), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600"
    }
  });
}

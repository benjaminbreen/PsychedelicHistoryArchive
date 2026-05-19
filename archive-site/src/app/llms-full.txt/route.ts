import { buildLlmsFullTxt, loadArchiveExportData } from "@/lib/llm-export";

export const revalidate = 3600;

export async function GET() {
  const data = await loadArchiveExportData();

  return new Response(buildLlmsFullTxt(data), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600"
    }
  });
}

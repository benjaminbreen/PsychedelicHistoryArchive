import { listSources } from "@/lib/cms/repository";
import { SourceList } from "@/components/admin/source-list";
export default async function SourcesPage() {
  try { return <SourceList sources={await listSources()} />; }
  catch (error) { return <><div className="cms-heading"><h1>Sources</h1></div><div className="cms-card"><h2>Connect the editorial workspace</h2><p className="cms-error">{error instanceof Error ? error.message : "The archive could not be loaded."}</p><p>Setup instructions are in <code>CMS.md</code> in the repository. Once connected, everyone works from this source list.</p></div></>; }
}

import { listPages } from "@/lib/cms/pages";
import { PageList } from "@/components/admin/page-workspace";
export default async function ListPage() { return <PageList kind="bibliography" pages={await listPages("bibliography")} />; }

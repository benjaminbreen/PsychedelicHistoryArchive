import { notFound, redirect } from "next/navigation";

const collectionArchiveTargets: Record<string, string> = {
  "william-james-altered-states": "/archive?people=William%20James",
  "anaesthetic-revelation": "/archive?tag=Anesthesia",
  "clinical-reports": "/archive?tag=Clinical",
  "philosophy-after-intoxication": "/archive?tag=Philosophy"
};

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const target = collectionArchiveTargets[slug];

  if (!target) notFound();

  redirect(target);
}

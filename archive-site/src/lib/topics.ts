import { getSupabaseClient } from "@/lib/supabase";

export type PublicTopic = {
  id: string;
  slug: string;
  name: string;
  dek?: string | null;
  bodyMarkdown?: string | null;
  icon?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: string | null;
  sortOrder?: number | null;
  updatedAt?: string | null;
};

export type PublicTopicDocumentLink = {
  documentId: string;
  position?: number | null;
  relationshipLabel?: string | null;
  editorialNote?: string | null;
  featured: boolean;
};

export type PublicTopicRelation = {
  slug: string;
  name: string;
  relationLabel?: string | null;
  position?: number | null;
};

export type PublicTopicListItem = PublicTopic & {
  documentIds: string[];
  documentCount: number;
};

export type PublicTopicBundle = {
  topic: PublicTopic;
  documentLinks: PublicTopicDocumentLink[];
  relatedTopics: PublicTopicRelation[];
};

type TopicRow = {
  id: string;
  slug: string;
  name: string;
  dek: string | null;
  body_markdown: string | null;
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: string | null;
  sort_order: number | null;
  updated_at: string | null;
  topic_documents?: Array<{ document_id: string | null }>;
};

type TopicDocumentRow = {
  document_id: string | null;
  position: number | null;
  relationship_label: string | null;
  editorial_note: string | null;
  is_featured: boolean | null;
};

type TopicRelationRow = {
  position: number | null;
  relation_label: string | null;
  related_topic: TopicRow | TopicRow[] | null;
};

const TOPIC_LIST_SELECT = `
  id,
  slug,
  name,
  dek,
  body_markdown,
  icon,
  seo_title,
  seo_description,
  status,
  sort_order,
  updated_at,
  topic_documents(document_id)
`;

const TOPIC_SELECT = `
  id,
  slug,
  name,
  dek,
  body_markdown,
  icon,
  seo_title,
  seo_description,
  status,
  sort_order,
  updated_at
`;

export async function listPublicTopics(): Promise<PublicTopicListItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("topics")
    .select(TOPIC_LIST_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    warnMissingTopicsSchema(error.message);
    return [];
  }

  return ((data ?? []) as unknown as TopicRow[]).map((row) => ({
    ...topicFromRow(row),
    documentIds: row.topic_documents?.map((link) => link.document_id).filter((id): id is string => Boolean(id)) ?? [],
    documentCount: row.topic_documents?.filter((link) => Boolean(link.document_id)).length ?? 0
  }));
}

export async function getPublicTopicBundle(slug: string): Promise<PublicTopicBundle | undefined> {
  const supabase = getSupabaseClient();
  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("topics")
    .select(TOPIC_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    warnMissingTopicsSchema(error.message);
    return undefined;
  }
  if (!data) return undefined;

  const topic = topicFromRow(data as unknown as TopicRow);
  const [documentLinks, relatedTopics] = await Promise.all([
    listTopicDocumentLinks(topic.id),
    listTopicRelations(topic.id)
  ]);

  return { topic, documentLinks, relatedTopics };
}

async function listTopicDocumentLinks(topicId: string): Promise<PublicTopicDocumentLink[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("topic_documents")
    .select("document_id, position, relationship_label, editorial_note, is_featured")
    .eq("topic_id", topicId)
    .order("position", { ascending: true, nullsFirst: false });

  if (error) {
    warnMissingTopicsSchema(error.message);
    return [];
  }

  return ((data ?? []) as TopicDocumentRow[])
    .filter((row): row is TopicDocumentRow & { document_id: string } => Boolean(row.document_id))
    .map((row) => ({
      documentId: row.document_id,
      position: row.position,
      relationshipLabel: row.relationship_label,
      editorialNote: row.editorial_note,
      featured: Boolean(row.is_featured)
    }));
}

async function listTopicRelations(topicId: string): Promise<PublicTopicRelation[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("topic_relations")
    .select("position, relation_label, related_topic:topics!topic_relations_related_topic_id_fkey(id, slug, name, status)")
    .eq("topic_id", topicId)
    .order("position", { ascending: true, nullsFirst: false });

  if (error) {
    warnMissingTopicsSchema(error.message);
    return [];
  }

  return ((data ?? []) as unknown as TopicRelationRow[])
    .reduce<PublicTopicRelation[]>((acc, row) => {
      const related = firstRelated(row.related_topic);
      if (!related || related.status !== "published") return acc;
      acc.push({
        slug: related.slug,
        name: related.name,
        relationLabel: row.relation_label,
        position: row.position
      });
      return acc;
    }, []);
}

function topicFromRow(row: TopicRow): PublicTopic {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    dek: row.dek,
    bodyMarkdown: row.body_markdown,
    icon: row.icon,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    status: row.status,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at
  };
}

function firstRelated<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function warnMissingTopicsSchema(message: string) {
  if (
    message.includes("Could not find") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  ) {
    console.warn("Curated topics schema is not installed yet; using tag-derived topics.", message);
    return;
  }
  console.warn("Curated topics query failed; using tag-derived topics.", message);
}

export type AccessType = "hosted" | "external" | "metadata_only";
export type HostingStatus =
  | "metadata_only"
  | "external_link"
  | "transcript_only"
  | "page_images"
  | "pdf"
  | "page_images_and_pdf";

export type SourceType =
  | "Book"
  | "Academic Article"
  | "Essay"
  | "Letter"
  | "Patient Report"
  | "Medical Report"
  | "Audio/Video"
  | "Film"
  | "Field Notes"
  | "Manuscript"
  | "Newspaper Article"
  | "Source"
  | "Testimony";

export type SourceKind = "single" | "collection" | "collection_item";
export type ReaderMode = "transcript" | "translation" | "overview" | "pdf" | "audio" | "video" | "images";

export type ArchiveSource = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  subtitle?: string;
  sourceKind?: SourceKind;
  parentCollectionId?: string;
  sequenceLabel?: string;
  sequenceNumber?: number;
  issueDate?: string;
  collectionItemCount?: number;
  collectionItems?: CollectionItemSummary[];
  author: string;
  year: number;
  displayDate: string;
  type: SourceType;
  medium: "Text" | "Image" | "Audio/Video" | "Personal History" | "Biography";
  era: "Pre-1800" | "1800-1950" | "1950-1970" | "1970-2000" | "2000-Present";
  region: string;
  language: string;
  tags: string[];
  legacyTags?: string[];
  people: string[];
  creators?: SourceCreator[];
  substances: string[];
  summary: string;
  excerpt: string;
  citation: string;
  publicationTitle?: string;
  rights: string;
  sourceUrl: string;
  contentLanguage?: string;
  translationLanguage?: string;
  translationText?: string;
  translationProvider?: "llm" | "human" | "published";
  translationNote?: string;
  readerMode?: ReaderMode;
  mediaEmbedUrl?: string;
  accessType: AccessType;
  hostingStatus: HostingStatus;
  wordCount: number;
  addedDate: string;
  featured?: boolean;
  imageTone: "paper" | "portrait" | "botanical" | "clinical" | "letter";
  imagePath?: string;
  imageAlt?: string;
  transcript?: string;
  transcriptSections?: TranscriptSection[];
  figures?: SourceFigure[];
  pages?: SourcePage[];
  files?: SourceFile[];
};

export type CollectionItemSummary = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  sequenceLabel?: string;
  sequenceNumber?: number;
  displayDate?: string;
  pageCount?: number;
  tags?: string[];
  imagePath?: string;
  imageAlt?: string;
  href?: string;
};

export type FacetOption = {
  label: string;
  count: number;
  href: string;
};

export type SourceLineBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SourcePageLine = {
  id: string;
  index: number;
  text: string;
  normalizedText?: string;
  confidence?: number;
  language?: string;
  paragraphIndex?: number;
  box?: SourceLineBox;
};

export type SourcePage = {
  id: string;
  pageNumber: number;
  label: string;
  imagePath?: string;
  thumbnailPath?: string;
  imageWidth?: number;
  imageHeight?: number;
  ocrText?: string;
  ocrConfidence?: number;
  language?: string;
  transcriptionStatus?: string;
  lines: SourcePageLine[];
};

export type SourceFile = {
  id: string;
  kind: string;
  url: string;
  mimeType?: string;
  byteSize?: number;
};

export type SourceCreator = {
  name: string;
  role: string;
};

export type TranscriptSectionKind = "overview" | "transcript" | "note";

export type TranscriptSection = {
  id?: string;
  heading: string;
  kind: TranscriptSectionKind;
  body?: string;
  bodyFormat?: "plain" | "markdown";
  position?: number;
  paragraphs: string[];
};

export type SourceFigure = {
  id: string;
  imagePath?: string;
  alt?: string;
  caption: string;
  position?: "before_overview" | "inline" | string;
  token?: string;
  credit?: string;
  sectionId?: string;
};

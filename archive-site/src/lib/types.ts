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

export type ArchiveSource = {
  id: string;
  slug: string;
  title: string;
  author: string;
  year: number;
  displayDate: string;
  type: SourceType;
  medium: "Text" | "Image" | "Audio/Video" | "Personal History" | "Biography";
  era: "Pre-1800" | "1800-1950" | "1950-1970" | "1970-2000" | "2000-Present";
  region: string;
  language: string;
  tags: string[];
  people: string[];
  substances: string[];
  summary: string;
  excerpt: string;
  citation: string;
  rights: string;
  sourceUrl: string;
  accessType: AccessType;
  hostingStatus: HostingStatus;
  wordCount: number;
  addedDate: string;
  featured?: boolean;
  imageTone: "paper" | "portrait" | "botanical" | "clinical" | "letter";
  imagePath?: string;
  imageAlt?: string;
  transcript?: string;
};

export type FacetOption = {
  label: string;
  count: number;
  href: string;
};

#!/usr/bin/env python3
import json
import re
import unicodedata
import uuid
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
IMPORT_DIR = ROOT / "data" / "latin-america-import"
QA_DIR = ROOT / "data" / "qa"

SOURCE_SLUG = "el-contexto-cultural-de-un-alucinogeno-aborigen-banisteriopsis-caapi"
SOURCE_ID = "0d0ecc94-e4d5-5baf-b174-67112069445c"
TRANSLATION_PATH = IMPORT_DIR / "translations" / f"{SOURCE_SLUG}.md"


REFERENCE_CATALOG = [
    {
        "key": "friedberg-1965-banisteriopsis",
        "match": [("friedberg", "1965")],
        "title": "Des Banisteriopsis utilisés comme drogue en Amérique du Sud",
        "item_type": "article",
        "year": 1965,
        "contributors": ["Claudine Friedberg"],
    },
    {
        "key": "bristol-1966-psychotropic-banisteriopsis",
        "match": [("bristol", "1966")],
        "title": "The Psychotropic Banisteriopsis among the Sibundoy of Colombia",
        "item_type": "article",
        "publication_title": "Botanical Museum Leaflets, Harvard University",
        "year": 1966,
        "volume": "21",
        "issue": "5",
        "pages": "113-140",
        "contributors": ["Melvin L. Bristol"],
    },
    {
        "key": "cuatrecasas-1958-prima-flora-colombiana-malpighiaceae",
        "match": [("cuatrecasas", "1958")],
        "title": "Prima flora colombiana. 2. Malpighiaceae",
        "item_type": "article",
        "publication_title": "Webbia",
        "year": 1958,
        "pages": "343-664",
        "contributors": ["José Cuatrecasas"],
    },
    {
        "key": "garcia-barriga-1958-yaje-caapi-ayahuasca",
        "match": [("barriga", "1958"), ("garcia barriga", "1958")],
        "title": "El Yajé, Caapi o Ayahuasca: Un alucinógeno amazónico",
        "item_type": "article",
        "year": 1958,
        "contributors": ["Hernando García Barriga"],
    },
    {
        "key": "perez-arbelaez-1956-plantas-utiles-colombia",
        "match": [("arbelaez", "1956"), ("perez arbelaez", "1956")],
        "title": "Plantas útiles de Colombia",
        "item_type": "book",
        "year": 1956,
        "contributors": ["Enrique Pérez Arbeláez"],
    },
    {
        "key": "uscategui-1959-present-distribution-narcotics-colombia",
        "match": [("uscategui", "1959")],
        "title": "The Present Distribution of Narcotics and Stimulants amongst the Indian Tribes of Colombia",
        "item_type": "article",
        "publication_title": "Botanical Museum Leaflets, Harvard University",
        "year": 1959,
        "volume": "18",
        "issue": "6",
        "pages": "273-304",
        "contributors": ["Néstor Uscátegui M."],
    },
    {
        "key": "fischer-cardenas-1923-principio-activo-yage",
        "match": [("fischer", "1923")],
        "title": "Estudio sobre el principio activo del yagé",
        "item_type": "dissertation",
        "publisher": "Universidad Nacional",
        "publication_place": "Bogotá",
        "year": 1923,
        "contributors": ["G. Fischer Cárdenas"],
    },
    {
        "key": "schultes-1957-identity-malpighiaceous-narcotics",
        "match": [("schultes", "1957")],
        "title": "The Identity of the Malpighiaceous Narcotics of South America",
        "item_type": "article",
        "publication_title": "Botanical Museum Leaflets, Harvard University",
        "year": 1957,
        "volume": "18",
        "pages": "1-56",
        "contributors": ["Richard Evans Schultes"],
    },
    {
        "key": "schultes-1960-pharmacognosy-native-narcotics",
        "match": [("schultes", "1960")],
        "title": "Pharmacognosy: Jungle Search for New Drug Plants in the Amazon; Native Narcotics of the New World; Botany Attacks the Hallucinogens",
        "item_type": "report",
        "publication_title": "The Pharmaceutical Sciences. Third Lecture Series",
        "year": 1960,
        "pages": "138-185",
        "contributors": ["Richard Evans Schultes"],
    },
    {
        "key": "hochstein-paradies-1957-alkaloids-banisteria-caapi",
        "match": [("hochstein and paradies", "1957")],
        "title": "Alkaloids of Banisteria caapi and Prestonia amazonicum",
        "item_type": "article",
        "publication_title": "Journal of the American Chemical Society",
        "year": 1957,
        "volume": "79",
        "pages": "5735-5736",
        "contributors": ["F. A. Hochstein", "A. M. Paradies"],
    },
    {
        "key": "rocha-1905-memorandum-viaje-regiones-amazonicas",
        "match": [("rocha", "1905")],
        "title": "Memorandum de viaje: Regiones amazónicas",
        "item_type": "book",
        "publication_place": "Bogotá",
        "year": 1905,
        "contributors": ["Joaquín Rocha"],
    },
    {
        "key": "koch-grunberg-1909-zwei-jahre",
        "match": [("koch grunberg", "1909"), ("koch-grunberg", "1909")],
        "title": "Zwei Jahre unter den Indianern",
        "item_type": "book",
        "publication_place": "Berlin",
        "year": 1909,
        "contributors": ["Theodor Koch-Grünberg"],
    },
    {
        "key": "bruzzi-1962-civilizacao-indigena-uaupes",
        "match": [("bruzzi", "1962")],
        "title": "A civilização indígena do Uaupés",
        "item_type": "book",
        "publication_place": "São Paulo",
        "year": 1962,
        "contributors": ["Alcionílio Alves da Silva Bruzzi"],
    },
    {
        "key": "goldman-1963-cubeo",
        "match": [("goldman", "1963")],
        "title": "The Cubeo: Indians of the Northwest Amazon",
        "item_type": "book",
        "publication_title": "Illinois Studies in Anthropology",
        "year": 1963,
        "contributors": ["Irving Goldman"],
    },
    {
        "key": "der-marderosian-pinkley-dobbins-1968-dmt-banisteriopsis",
        "match": [("pinkley and dobbins", "1968"), ("der marderosian pinkley and dobbins", "1968")],
        "title": "Native Use and Occurrence of N,N-Dimethyltryptamine in the Leaves of Banisteriopsis rusbyana",
        "item_type": "article",
        "publication_title": "American Journal of Pharmacy",
        "year": 1968,
        "volume": "140",
        "issue": "5",
        "pages": "137-147",
        "contributors": ["Ara H. Der Marderosian", "Homer V. Pinkley", "Murrell F. Dobbins IV"],
    },
    {
        "key": "mallol-recasens-1963-imagenes-yaje",
        "match": [("recasens", "1963"), ("mallol de recasens", "1963")],
        "title": "Cuatro representaciones de las imágenes alucinatorias originadas por la toma de yajé",
        "item_type": "article",
        "publication_title": "Revista Colombiana de Folklore",
        "year": 1963,
        "volume": "8",
        "pages": "61-81",
        "contributors": ["M. R. Mallol de Recasens"],
    },
    {
        "key": "reichel-dolmatoff-1960-notas-etnograficas-choco",
        "match": [("reichel dolmatoff", "1960")],
        "title": "Notas etnográficas sobre los indios del Chocó",
        "item_type": "article",
        "publication_title": "Revista Colombiana de Antropología",
        "year": 1960,
        "volume": "9",
        "pages": "75-158",
        "contributors": ["Gerardo Reichel-Dolmatoff"],
    },
    {
        "key": "reichel-dolmatoff-1968-desana",
        "match": [("reichel dolmatoff", "1968")],
        "title": "Desana: Simbolismo de los indios Tukano del Vaupés",
        "item_type": "book",
        "publisher": "Universidad de los Andes",
        "publication_place": "Bogotá",
        "year": 1968,
        "contributors": ["Gerardo Reichel-Dolmatoff"],
    },
    {
        "key": "stradelli-1890-uaupes",
        "match": [("stradelli", "1890")],
        "title": "L'Uaupés e gli Uaupés",
        "item_type": "article",
        "publication_title": "Bollettino della Società Geografica Italiana",
        "year": 1890,
        "pages": "425-453",
        "contributors": ["Ermanno Stradelli"],
    },
    {
        "key": "biocca-1965-viaggi-tra-gli-indi",
        "match": [("biocca", "1965")],
        "title": "Viaggi tra gli Indi. Alto Río Negro - Alto Orinoco",
        "item_type": "book",
        "publication_place": "Roma",
        "year": 1965,
        "contributors": ["Ettore Biocca"],
    },
]


INLINE_CITATION_RE = re.compile(
    r"([A-Z][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.-]+(?:,?\s+(?:and|y|et)\s+[A-Z][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.-]+|(?:,\s+[A-Z][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.-]+){0,3})?)\s*\((\d{4}[a-z]?(?:[,;]\s*\d{4}[a-z]?)*(?:,?\s*pp?\.\s*[^)]*)?)\)"
)


def uuid_for(kind: str, value: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"{kind}:{value}"))


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower().replace("’", "'")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def slugify(value: str) -> str:
    return normalize(value).replace(" ", "-")


def split_names(display_names: list[str]) -> list[dict]:
    rows = []
    for index, name in enumerate(display_names, start=1):
      parts = name.split()
      family = parts[-1] if parts else name
      given = " ".join(parts[:-1]) or None
      rows.append({
          "display_name": name,
          "family_name": family,
          "given_name": given,
          "position": index,
      })
    return rows


def catalog_by_match() -> dict[tuple[str, str], dict]:
    mapping = {}
    for item in REFERENCE_CATALOG:
        for author_key, year in item["match"]:
            mapping[(normalize(author_key), year)] = item
    return mapping


def extract_inline_citations(text: str) -> list[dict]:
    citations = []
    for match in INLINE_CITATION_RE.finditer(text):
        raw_author = match.group(1).strip()
        raw_years = match.group(2)
        years = re.findall(r"\b\d{4}[a-z]?\b", raw_years)
        citations.append({
            "text": match.group(0),
            "author": raw_author,
            "author_key": normalize(raw_author.replace("Koch-Grunberg", "Koch Grunberg").replace("Reichel-Dolmatoff", "Reichel Dolmatoff")),
            "years": years,
        })
    return citations


def build_rows() -> dict[str, list[dict]]:
    text = TRANSLATION_PATH.read_text(encoding="utf-8")
    citations = extract_inline_citations(text)
    matches = catalog_by_match()
    items_by_key: dict[str, dict] = {}
    aliases = []
    links = []
    bibliography_documents = []
    unresolved = []

    for citation in citations:
        if len(citation["years"]) != 1:
            unresolved.append({**citation, "reason": "compound_year_citation"})
            continue
        year = citation["years"][0]
        item = matches.get((citation["author_key"], year))
        if not item:
            unresolved.append({**citation, "reason": "no_source_local_match"})
            continue
        items_by_key[item["key"]] = item
        item_id = uuid_for("bibliography-item", item["key"])
        aliases.append({
            "id": uuid_for("bibliography-alias", f"{item['key']}:{citation['text']}"),
            "bibliography_item_id": item_id,
            "alias": citation["text"],
            "normalized_alias": normalize(citation["text"]),
            "source": "source-local-inline-citation",
            "status": "auto",
        })
        links.append({
            "id": uuid_for("document-citation-link", f"{SOURCE_SLUG}:{citation['text']}:{item['key']}"),
            "document_id": SOURCE_ID,
            "bibliography_item_id": item_id,
            "citation_text": citation["text"],
            "normalized_citation": normalize(citation["text"]),
            "confidence": 0.94,
            "status": "auto",
            "match_reason": "Exact source-local author/year match",
            "occurrence_count": text.count(citation["text"]),
        })
        bibliography_documents.append({
            "bibliography_item_id": item_id,
            "document_id": SOURCE_ID,
            "relationship_label": "Cited by this source",
            "editorial_note": "Auto-linked from source-local author-year citation.",
        })

    item_rows = []
    contributor_rows = []
    item_contributor_rows = []
    seen_contributors = {}
    for item in items_by_key.values():
        item_id = uuid_for("bibliography-item", item["key"])
        item_rows.append({
            "id": item_id,
            "slug": item["key"],
            "item_type": item.get("item_type", "article"),
            "title": item["title"],
            "publication_title": item.get("publication_title"),
            "publisher": item.get("publisher"),
            "publication_place": item.get("publication_place"),
            "year": item.get("year"),
            "volume": item.get("volume"),
            "issue": item.get("issue"),
            "pages": item.get("pages"),
            "recommendation_status": "contextual",
            "status": "published",
            "editorial_note": f"Bibliography record generated from citations in Reichel-Dolmatoff's 1969 article on Banisteriopsis caapi.",
        })
        for contributor in split_names(item.get("contributors", [])):
            slug = slugify(contributor["display_name"])
            contributor_id = uuid_for("bibliography-contributor", slug)
            if slug not in seen_contributors:
                contributor_rows.append({
                    "id": contributor_id,
                    "display_name": contributor["display_name"],
                    "family_name": contributor["family_name"],
                    "given_name": contributor["given_name"],
                    "slug": slug,
                })
                seen_contributors[slug] = contributor_id
            item_contributor_rows.append({
                "bibliography_item_id": item_id,
                "contributor_id": contributor_id,
                "role": "author",
                "position": contributor["position"],
            })

    return {
        "bibliography_items": item_rows,
        "bibliography_contributors": contributor_rows,
        "bibliography_item_contributors": item_contributor_rows,
        "bibliography_item_aliases": aliases,
        "bibliography_item_documents": list({(row["bibliography_item_id"], row["document_id"]): row for row in bibliography_documents}.values()),
        "document_citation_links": list({(row["normalized_citation"], row["bibliography_item_id"]): row for row in links}.values()),
        "report": {
            "source_slug": SOURCE_SLUG,
            "inline_citation_count": len(citations),
            "auto_linked_count": len({(row["normalized_citation"], row["bibliography_item_id"]) for row in links}),
            "unresolved_count": len(unresolved),
            "unresolved": unresolved,
        },
    }


def write_json(name: str, rows: list[dict]) -> None:
    path = IMPORT_DIR / f"{name}.json"
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    rows = build_rows()
    for name in [
        "bibliography_items",
        "bibliography_contributors",
        "bibliography_item_contributors",
        "bibliography_item_aliases",
        "bibliography_item_documents",
        "document_citation_links",
    ]:
        write_json(name, rows[name])

    QA_DIR.mkdir(parents=True, exist_ok=True)
    report = rows["report"]
    (QA_DIR / "citation-link-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown = [
        "# Citation Link Report",
        "",
        f"- Source: `{report['source_slug']}`",
        f"- Inline citations found: {report['inline_citation_count']}",
        f"- Auto-linked: {report['auto_linked_count']}",
        f"- Unresolved: {report['unresolved_count']}",
        "",
        "## Unresolved",
    ]
    for item in report["unresolved"]:
        markdown.append(f"- `{item['text']}`: {item['reason']}")
    (QA_DIR / "citation-link-report.md").write_text("\n".join(markdown).strip() + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

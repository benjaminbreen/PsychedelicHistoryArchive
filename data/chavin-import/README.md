# Chavin de Huantar Import

Staged source entry for Richard L. Burger's argument about vilca snuff and Chavin de Huantar ritual material culture.

Primary source:

Burger, Richard L. "What Kind of Hallucinogenic Snuff Was Used at Chavin de Huantar? An Iconographic Identification." *Nawpa Pacha* 31, no. 2 (2011): 123-140. https://doi.org/10.1179/naw.2011.31.2.123.

The excerpt blocks in `document_sections.json` were supplied by the project editor. Images were downloaded from Wikimedia Commons / Walters Art Museum source records for staged upload:

- `estela-del-portador-del-cactus.jpg`: Carlo Brescia / Limaymanta pacha, Wikimedia Commons, CC BY-SA 4.0.
- `chavin-lanzon-stela-cyark.jpg`: CyArk, via Wikimedia Commons, CC BY-SA 3.0.
- `feline-and-cactus-stirrup-vessel-walters.jpg`: Walters Art Museum, accession 48.2832, via Wikimedia Commons, CC BY-SA 3.0; object public domain.

Upload with:

```bash
SUPABASE_URL="https://yqcvybdabpnxyapnrjlp.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your_secret_key" \
SUPABASE_STORAGE_BUCKET="archive-assets" \
node scripts/upload_squarespace_to_supabase.mjs --import-dir data/chavin-import
```

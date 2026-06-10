# Thumbnail refresh

Curated replacement thumbnails for published archive records whose live
thumbnail was missing, visually blank after `object-cover`, or an unhelpful
page/PDF crop.

`assets.json` records the local file, target Supabase storage path, and
document id for each replacement. The live Supabase `documents.thumbnail_path`
and `documents.cover_image_path` fields were updated to these storage paths.

Source notes:

- `william-james-brazil-sunglasses-thumbnail.jpg`: Houghton Library William James in Brazil photograph already imported in `data/squarespace-import`.
- `sidney-cohen-ucla-program-thumbnail.jpg`: UCLA program image already imported in `data/squarespace-import`.
- `john-lilly-dolphin-newspaper-thumbnail.jpg`: Orlando Sentinel clipping already imported in `data/squarespace-import`.
- `chavin-cactus-bearer-thumbnail.jpg`: Chavin cactus-bearer stele image already imported in `data/chavin-import`.
- `fitz-hugh-ludlow-thumbnail.jpg`: Fitz Hugh Ludlow portrait already imported in `data/squarespace-import`.
- `william-james-la-farge-thumbnail.jpg`: cropped from the existing William James portrait imported in `data/nitrous-ether-import`.
- `cannabis-indica-wellcome-thumbnail.jpg`: Wellcome Collection cannabis indica plate via Wikimedia Commons.
- `davy-pneumaticks-lecture-thumbnail.jpg`: Library of Congress scan of Gillray, *Scientific Researches! New Discoveries in Pneumaticks!*.

# CWC+ Recipe Import Sources

Drop raw recipe files here before importing via the Admin Panel.

---

## Folder Structure

```
import-sources/
├── pdf/     ← Drop PDF recipe files here
├── html/    ← Drop HTML recipe files here
└── README.md
```

---

## How to Use

1. **Drop your files** into the correct folder:
   - PDF recipe ebooks → `/pdf`
   - Exported HTML pages → `/html`

2. **Open Admin Panel** → go to **Recipe Importer** tab.

3. **Select your file** from within the importer, or paste the extracted text directly.

4. **Review** each extracted recipe before saving.

5. **Confirm & Save** — recipes are written directly to Supabase.

---

## Rules

- **One volume per file** — e.g. `VOL_17.pdf`, `VOL_18.html`
- **Multiple files supported** — process them one at a time in the importer
- **Naming convention** (recommended): `VOL_XX_TITLE.pdf`

---

## Supported Formats

| Format | Notes |
|--------|-------|
| `.pdf` | Auto text extraction via Recipe Engine |
| `.html` | Paste inner text or upload raw HTML |
| `.txt`  | Paste directly into the text field in the importer |

---

## Files in This Folder

These files are **not served publicly** and not included in the app build.
They exist only as source material for the admin import workflow.

Add this folder to `.gitignore` if you do not want recipe source files committed to git.

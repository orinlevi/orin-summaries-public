# מדריך לעבודה עם orin-summaries

## סקירה כללית

הפרויקט הוא אתר סיכומי קורסים סטטי שנבנה על **Next.js 16 + React 19 + Tailwind CSS 4**, מאורגן כ-**monorepo** עם Turborepo.

מיועד לסטודנטים ב-B.Sc. פסיכולוגיה ומדעי המחשב עם דגש במדעי המוח, אוניברסיטת תל אביב.

---

## מבנה התיקיות

```
orin-summaries/
├── apps/
│   └── web/                          # האפליקציה הראשית (Next.js)
│       ├── src/
│       │   ├── app/                  # דפי האתר (App Router)
│       │   │   ├── layout.tsx        # Layout ראשי (RTL, KaTeX CSS)
│       │   │   ├── page.tsx          # דף הבית – רשימת קורסים
│       │   │   ├── globals.css       # עיצוב כללי (dark theme, prose)
│       │   │   └── course/
│       │   │       └── [courseId]/
│       │   │           ├── page.tsx  # דף קורס – רשימת יחידות
│       │   │           └── [unitSlug]/
│       │   │               └── page.tsx  # דף יחידה – תוכן הסיכום
│       │   ├── lib/
│       │   │   ├── courses.ts        # טעינת נתוני קורסים מ-courses.json
│       │   │   └── content.ts        # קריאת קבצי Markdown
│       │   └── components/
│       │       └── content/
│       │           └── MarkdownRenderer.tsx  # רינדור Markdown + מתמטיקה
│       ├── content/                  # כל תוכן הקורסים
│       │   ├── courses.json          # קובץ הגדרות מרכזי!
│       │   ├── cs1001/               # דוגמה לתיקיית קורס
│       │   │   ├── notes/            # סיכומים ב-Markdown
│       │   │   ├── exam_questions/   # שאלות מבחנים
│       │   │   └── latex/            # מקור LaTeX + PDF
│       │   └── ... (45+ קורסים)
│       ├── private-assets/           # קבצים להורדה (דורש login)
│       │   ├── cs1001/               # PDFs, notebooks, קוד
│       │   ├── neuroscience/         # תמונות + PDFs
│       │   └── ...
│       ├── admin-assets/             # קבצים אישיים (רק admin)
│       │   ├── calculus1b/           # דפי נוסחאות רשמיים
│       │   ├── discrete1/
│       │   └── ...
│       └── public/
│           ├── logo.png
│           └── assets/               # תמונות ב-Markdown (ללא הגנה)
│               ├── neuroscience/     # brain_views.png וכו׳
│               └── ...
├── packages/
│   └── remark-mkdocs/                # פלאגין להמרת MkDocs → React
│       └── src/
│           ├── admonitions.ts        # !!! info → blockquote alerts
│           ├── math-fixup.ts         # MathJax → KaTeX
│           └── rehype-admonitions.ts # HTML post-processing
├── scripts/
│   └── build-latex.sh                # קומפילציית LaTeX → PDF
├── turbo.json                        # הגדרות Turborepo
└── package.json                      # הגדרות monorepo
```

---

## איך להוסיף קורס חדש

### שלב 1: צרי תיקייה

```bash
mkdir -p apps/web/content/MY-COURSE/notes
```

### שלב 2: כתבי סיכומים ב-Markdown

צרי קבצי `.md` בתיקיית `notes/`:

```markdown
# שם הנושא

## כותרת משנה

טקסט בעברית, **מודגש**, *נטוי*.

### נוסחה

$$E = mc^2$$

נוסחה בתוך שורה: $x^2 + y^2 = r^2$

### טבלה

| עמודה 1 | עמודה 2 |
|---------|---------|
| ערך     | ערך     |

### קוד

```python
def hello():
    print("Hello")
```

### Admonition (תיבת מידע)

!!! info "כותרת"
    תוכן התיבה

!!! warning "אזהרה"
    שימו לב!

### תמונה

![תיאור](/assets/MY-COURSE/images/image.png)
```

**סוגי Admonitions נתמכים:** `info`, `note`, `tip`, `warning`, `danger`, `example`, `abstract`, `definition`, `theorem`

**Admonition מתקפל:** `??? info "כותרת"` (נפתח בלחיצה)

### שלב 3: עדכני את courses.json

פתחי את `apps/web/content/courses.json` והוסיפי entry:

```json
{
  "id": "my-course",
  "slug": "my-course",
  "title": "שם הקורס בעברית",
  "description": "תיאור קצר",
  "semester": "A",
  "year": 1,
  "category": "cs-math",
  "accentColor": "purple",
  "priceILS": 0,
  "contentDir": "MY-COURSE",
  "downloadables": [],
  "sections": [
    {
      "name": "סיכומים",
      "items": [
        {
          "id": 1,
          "slug": "topic-1",
          "file": "notes/01_topic.md",
          "title": "שם הנושא",
          "free": true
        }
      ]
    }
  ]
}
```

**שדות חשובים:**

| שדה | הסבר |
|-----|-------|
| `id` | מזהה ייחודי, משמש ב-URL: `/course/my-course` |
| `slug` | אותו דבר כמו `id` (בדרך כלל) |
| `contentDir` | שם התיקייה תחת `content/` |
| `category` | `cs-math` / `psychology` / `neuroscience` |
| `accentColor` | `purple` / `teal` / `indigo` / `cyan` / `emerald` |
| `priceILS` | ערך מספרי (ראי הגדרות תשלום בנפרד) |
| `sections[].items[].file` | נתיב יחסי ל-Markdown בתוך תיקיית הקורס |
| `sections[].items[].slug` | חלק מה-URL: `/course/my-course/topic-1` |
| `sections[].items[].free` | `true` = נגיש לכולם, `false` = בתשלום |

### שלב 4: הוספת תמונות (אופציונלי)

```bash
mkdir -p apps/web/public/assets/MY-COURSE/images
# העתיקי תמונות לתיקייה
```

ב-Markdown:
```markdown
![תיאור התמונה](/assets/MY-COURSE/images/filename.png)
```

### שלב 5: בדקי שהכל עובד

```bash
npm run dev      # פתחי localhost:3000
npm run build    # ודאי שהבילד עובר בהצלחה
```

---

## איך להוסיף LaTeX (PDF להורדה)

### שלב 1: צרי תיקיית LaTeX

```bash
mkdir -p apps/web/content/MY-COURSE/latex
```

### שלב 2: צרי preamble.tex

**העתיקי מקורס קיים** (מומלץ):

```bash
cp apps/web/content/statistics1/latex/preamble.tex apps/web/content/MY-COURSE/latex/
```

הפריאמבל כולל:
- **עברית** עם polyglossia + פונט DavidCLM
- **תיבות צבעוניות** (defbox=כחול, thmbox=ירוק, exbox=כתום, formulabox=סגול, notebox=צהוב)
- **מתמטיקה** (amsmath, amssymb)
- **תרשימים** (TikZ, PGFPlots)

### שלב 3: כתבי main.tex

```latex
\documentclass[12pt]{article}
\input{preamble}

\begin{document}
\begin{hebrew}

\begin{center}
{\LARGE \textbf{שם הקורס – סיכום}}\\[0.5em]
{\large X יחידות}
\end{center}
\vspace{1em}

\section{נושא ראשון}

\begin{defbox}
\textbf{הגדרה:} טקסט ההגדרה.
\end{defbox}

\begin{formulabox}
\[
E = mc^2
\]
\end{formulabox}

\begin{notebox}
הערה חשובה.
\end{notebox}

\end{hebrew}
\end{document}
```

> **חשוב:** אל תשתמשי ב-`\maketitle` או `\tableofcontents` – יש באג של stack overflow עם polyglossia. במקום זה, השתמשי ב-`\begin{center}`.

### שלב 4: קמפלי

```bash
cd apps/web/content/MY-COURSE/latex
xelatex -interaction=nonstopmode main.tex
xelatex -interaction=nonstopmode main.tex   # פעמיים! (לייצוב הפניות)
```

### שלב 5: העתיקי PDF ועדכני courses.json

```bash
mkdir -p apps/web/public/assets/MY-COURSE
cp main.pdf ../../public/assets/MY-COURSE/my_course_summary.pdf
```

ב-courses.json:
```json
"downloadables": [
  { "title": "סיכום הקורס - PDF", "file": "/assets/MY-COURSE/my_course_summary.pdf" }
]
```

> **טיפ:** ה-pre-commit hook מקמפל LaTeX אוטומטית כשיש שינויים ב-`.tex` ומעתיק את ה-PDF ל-public/assets.

---

## סוגי תיבות צבעוניות ב-LaTeX

| סביבה | צבע | שימוש |
|--------|------|-------|
| `defbox` | כחול בהיר | הגדרות |
| `thmbox` | ירוק בהיר | משפטים |
| `exbox` | כתום בהיר | דוגמאות |
| `formulabox` | סגול בהיר | נוסחאות |
| `notebox` | צהוב בהיר | הערות |

---

## מבנה courses.json – חוקים

1. **`id`** חייב להיות ייחודי בין כל הקורסים
2. **`slug`** חייב להיות ייחודי (משמש ב-URL)
3. **`contentDir`** חייב להתאים לשם התיקייה תחת `content/`
4. **`sections[].items[].id`** חייב להיות ייחודי **בתוך הקורס**
5. **`sections[].items[].slug`** חייב להיות ייחודי **בתוך הקורס**
6. **`sections[].items[].file`** חייב להצביע על קובץ Markdown קיים
7. לפחות יחידה אחת צריכה להיות `"free": true`

---

## מערכת הקבצים להורדה (Assets)

### שלוש תיקיות, שלוש רמות גישה

```
apps/web/
├── public/assets/         # תמונות ב-Markdown (ללא הגנה, נגיש לכולם)
├── private-assets/        # קבצים מוגנים (דורש התחברות)
└── admin-assets/          # קבצים אישיים (רק אדמין רואה ומוריד)
```

| תיקייה | מה שמים שם | מי רואה | דוגמה |
|---------|-----------|---------|-------|
| `public/assets/{course}/` | תמונות שמוטמעות ב-Markdown | כולם | `/assets/neuroscience/brain_views.png` |
| `private-assets/{course}/` | PDFs, notebooks, קוד | משתמשים רשומים | סיכומי LaTeX, קבצי .py |
| `admin-assets/{course}/` | דפי נוסחאות, סיכומים חיצוניים | רק אדמין (את) | דפי נוסחאות רשמיים |

### API הורדות

כל ההורדות עוברות דרך **`/api/download?file=...`**:

- **`/api/download?file=/assets/course/file.pdf`** - מחפש ב-`private-assets/`, דורש login
- **`/api/download?file=/admin-assets/course/file.pdf`** - מחפש ב-`admin-assets/`, דורש admin

משתמש לא מחובר שמנסה להוריד קובץ מוגן מקבל PDF paywall.

### הוספת קובץ חדש להורדה

**קובץ ציבורי (לכל הרשומים):**

1. שמי את הקובץ ב-`apps/web/private-assets/{course}/`
2. הוסיפי ל-`courses.json` ב-downloadables:
```json
{ "title": "סיכום הקורס - PDF", "file": "/assets/{course}/file.pdf" }
```

**קובץ אישי (רק לך):**

1. שמי את הקובץ ב-`apps/web/admin-assets/{course}/`
2. הוסיפי ל-`courses.json` ב-downloadables:
```json
{ "title": "דף נוסחאות", "file": "/admin-assets/{course}/file.pdf", "adminOnly": true }
```

**קובץ חינמי (בלי login):**

```json
{ "title": "טבלת Z", "file": "/assets/statistics1/z-table.pdf", "free": true }
```
הקובץ צריך להיות ב-`public/assets/` (לא ב-private-assets).

### סוגי קבצים ב-courses.json

```json
{
  "downloadables": [
    { "title": "שם", "file": "/assets/...", "free": false, "adminOnly": false }
  ],
  "notebooks": [
    { "title": "שם", "file": "/assets/.../nb.ipynb", "colab": "https://colab..." }
  ],
  "codeFiles": [
    { "title": "שם", "file": "/assets/.../demo.py" }
  ]
}
```

---

## אימות והרשאות

### רמות גישה

| רמה | מוגדר ב- | יכולות |
|-----|---------|--------|
| אורח | - | צפייה ביחידות `"free": true` בלבד |
| רשום | KV store (Vercel) | כל היחידות + הורדות מ-private-assets |
| Admin | `ADMIN_EMAILS` env var | כל הנ"ל + הורדות מ-admin-assets |
| Allowed | `ALLOWED_EMAILS` env var | כמו רשום, בלי תשלום |

### משתני סביבה (env vars)

| משתנה | תיאור |
|-------|-------|
| `COOKIE_SECRET` | סוד להצפנת tokens (חובה) |
| `ADMIN_EMAILS` | אימיילים של אדמינים, מופרדים בפסיק |
| `ALLOWED_EMAILS` | אימיילים שמקבלים גישה חינמית |

### Token

- פורמט: HMAC-SHA256 signed JWT ב-cookie `access_token`
- תוקף: 180 יום (סמסטר)

### API Routes

| Route | תפקיד |
|-------|--------|
| `POST /api/auth/verify-email` | שליחת קוד אימות |
| `POST /api/auth/activate` | הפעלת חשבון |
| `GET /api/auth/check` | בדיקת סטטוס (`{ ok, admin }`) |
| `GET /api/auth/google` | Google OAuth login |
| `GET /api/download` | הורדת קבצים מוגנים |
| `POST /api/auth/redeem-coupon` | מימוש קופון |
| `POST /api/admin/create-coupon` | יצירת קופון (admin only) |
| `POST /api/webhooks/lemonsqueezy` | webhook תשלום |

---

## פקודות שימושיות

| פקודה | מה עושה |
|-------|---------|
| `npm run dev` | שרת פיתוח מקומי (port 3000) |
| `npm run build` | בילד לייצור (בודק שהכל עובד) |
| `npx turbo build` | אותו דבר, עם caching |
| `git push` | דוחף לריפו ב-GitHub (מפעיל deploy ב-Vercel) |
| `./scripts/build-latex.sh` | קומפילציית כל קבצי LaTeX ל-PDF |
| `./scripts/build-latex.sh discrete1` | קומפילציית קורס ספציפי בלבד |

---

## Pipeline הרינדור

```
קובץ Markdown
    ↓
preprocessMkdocsAdmonitions()   – המרת !!! blocks
    ↓
preprocessMathFixup()           – תיקון סינטקס מתמטי
    ↓
rewriteLinks()                  – המרת לינקים יחסיים
    ↓
MDXRemote + plugins:
  ├─ remarkGfm      – טבלאות, strikethrough
  ├─ remarkMath      – $...$ ו-$$...$$
  ├─ rehypeRaw       – HTML גולמי
  ├─ rehypeKatex     – רינדור מתמטיקה
  ├─ rehypeAdmonitions – תיבות מידע
  └─ rehypeSlug      – עוגנים לכותרות
    ↓
HTML מעוצב באתר
```

---

## עיצוב ו-RTL

- **כיוון:** `dir="rtl"` על כל האתר
- **בלוקי קוד:** `direction: ltr` (תמיד שמאל-לימין)
- **מתמטיקה (KaTeX):** `direction: ltr` עם `unicode-bidi: isolate`
- **טבלאות:** `direction: rtl`, כותרות `text-align: right`
- **רשימות:** `padding-right` (RTL-aware)
- **blockquote:** `border-right` (RTL-aware)

---

## הוספת Section חדש (כמו "תרגילים" או "שאלות מבחנים")

ב-courses.json, הוסיפי אובייקט חדש תחת `sections`:

```json
{
  "name": "תרגילים",
  "items": [
    { "id": 100, "slug": "ex-1", "file": "exercises/ex1.md", "title": "תרגיל 1", "free": true }
  ]
}
```

ה-`id` צריך להיות ייחודי בתוך הקורס (גם בין sections שונים).

---

## טיפים

- **2 קומפילציות LaTeX** – תמיד צריך `xelatex` פעמיים כדי שההפניות יתייצבו
- **אל תשתמשי ב-`\tableofcontents`** – באג ידוע עם polyglossia
- **תמונות:** שמרי בשמות קטנים באנגלית (לדוגמה: `atomic_structure.png`, לא `Atomic Structure.png`)
- **בילד אחרי כל שינוי:** `npm run build` מוודא שלא שברת כלום
- **מתמטיקה inline:** `$formula$` (דולר בודד), display: `$$formula$$` (דולר כפול)
- **לינקים בין יחידות:** `[טקסט](filename.md)` – מומר אוטומטית ל-URL נכון

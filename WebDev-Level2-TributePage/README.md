# Tribute Page - Alan Turing

A tribute to Alan Turing (1912–1954), the pioneer of theoretical computer science and artificial intelligence. Built for the Oasis Infobyte (OIBSIP) Web Development Level 2 task.

The page is designed like his 1936 paper *On Computable Numbers*: journal typesetting, a tape of square cells, and a red read head. The first machine from that paper runs live at the top of the page.

## ✅ Checklist coverage

| Requirement | Where it is |
|---|---|
| Title and one-line tagline | Hero: "Alan Turing" and "The mathematician who imagined the computer before anyone could build one." |
| Prominent royalty-free image | Plate I: Turing aged 16, public domain via Wikimedia Commons |
| 3–4 paragraphs of biography | "A life of genius": four paragraphs, each with a sourced margin note |
| Timeline / key achievements | "Key achievements, one square per year": a to-scale tape from 1912 to 1954, plus what came after |
| Styled quote block | Full-width black band with a verified quote from *Computing Machinery and Intelligence* (1950), labelled with its source |
| At least 2 background colours | Paper `#f4f4f0`, ink `#101010`, and timeline grey `#e6e6df` |
| At least 2 font styles | Old Standard TT (serif, headings and body), Courier Prime (monospace, tape and tables), UnifrakturMaguntia (Turing's Fraktur state names) |
| Responsive layout | CSS Grid with breakpoints at 56rem and 36rem, tested at 1440px and 390px |

## 🚀 Features

- **A working Turing machine**: Example I from section 3 of the 1936 paper runs on a tape. You can Run, Pause, Step, and Reset it, and the active row of its state table lights up.
- **Timeline to scale**: one square per year, so the long quiet years and the dense 1936–1954 period look as they really were.
- **Honest sourcing**: the quote is Turing's own. A common misattribution (a line from the 2014 film *The Imitation Game*) is pointed out rather than repeated.
- **Accessible**: semantic HTML, a skip link, keyboard-operable controls, visible focus, and no autoplay when `prefers-reduced-motion` is set. The page is fully readable without JavaScript.

## 🛠️ Tech Stack

- **HTML5**: semantic structure (`header`, `main`, `section`, `figure`, `blockquote`, `table`, `ol`)
- **CSS3**: custom properties, Grid, media queries, reduced-motion support
- **Vanilla JavaScript**: the tape machine (`script.js`), no libraries
- **Google Fonts**: Old Standard TT, Courier Prime, UnifrakturMaguntia

## 📂 Project Structure

- `index.html`: page content and structure
- `style.css`: all styling and responsive rules
- `script.js`: the Turing machine

## 📖 How to Run

1. Clone or download the `WebDev-Level2-TributePage` folder.
2. Open `index.html` in any modern web browser.

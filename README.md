# Meridian Health — Hospital Management Website

A premium, animated hospital/healthcare platform built in vanilla HTML5, CSS3,
JavaScript, and GSAP (+ ScrollTrigger). No frameworks, no build step — open
`index.html` in a browser, or serve the folder with any static server.

## Build status

| Page | Status |
|---|---|
| Home (`index.html`) | ✅ Complete — all 10 sections |
| 404 (`404.html`) | ✅ Complete |
| Login (`login.html`) | ✅ Complete — wired to validation.js |
| Create Account (`create-account.html`) | ✅ Complete — wired to validation.js, strength meter |
| About (`about.html`) | ✅ Complete — story, mission/vision, timeline, tech, team, values, stats, testimonials, CTA |
| Services (`services.html`) | ✅ Complete — bento grid, ER/Diagnostics/Surgery/Pharmacy deep-dive, department directory, technology, FAQ accordion, CTA |
| Blog (`blog.html`) | ✅ Complete — featured article, working category filter, trending strip, popular list, health tips, newsletter, CTA |
| Contact (`contact.html`) | ✅ Complete — info cards, map placeholder, fully validated contact form |
| Admin Dashboard (`admin-dashboard.html`) | ✅ Complete — 8-tab sidebar console with charts, tables, search, filters |
| Public Dashboard (`public-dashboard.html`) | ✅ Complete — one-page patient portal, personalized from the login session |
| Privacy Policy, Terms | ⏳ Not started |

## Design concept

**"Meridian"** — a line that connects, in geography, in traditional medicine,
in wayfinding. The whole visual system is built around that idea: a thin
pulse/pathway line appears in the loader, the hero background, the patient
journey, and the final CTA, standing in for the thread that connects every
step of a patient's care.

- **Color** — cool clinical paper (`#F5F9F7`), deep pine ink (`#0B241F`),
  medical teal (`#12726B`) as the brand color, and a warm coral (`#FF6B52`)
  reserved for CTAs and moments of energy. No cream/terracotta, no dark+neon —
  chosen specifically to read as *clinical trust* rather than a generic AI
  template.
- **Type** — Space Grotesk (display, technical/precise), Manrope (body,
  humanist and readable), IBM Plex Mono (stats, labels, timestamps — reads
  like a monitor readout, which fits the healthcare-tech brief).
- **Signature element** — the animated meridian/pulse line, reused across the
  loader, hero, "why choose us," and final CTA.

All tokens live at the top of `css/style.css` under `:root` — change the
palette or type scale there and it propagates everywhere.

## What's built and working right now

```
hospital-management/
├── index.html           ← full home page, all 10 required sections
├── 404.html              ← creative animated 404 (Back / Home only, no navbar)
├── about.html            ← story, mission/vision, timeline, tech, team, values, stats, CTA
├── services.html         ← bento grid, ER/diagnostics/surgery/pharmacy, directory, FAQ, CTA
├── blog.html             ← featured article, category filter, trending strip, newsletter
├── contact.html          ← info cards, map placeholder, validated contact form
├── login.html            ← animated split-screen login, live validation
├── create-account.html   ← registration with strength meter + live validation
├── admin-dashboard.html  ← sidebar console: overview, patients, doctors, appointments,
│                            departments, messages, reports, settings
├── public-dashboard.html ← one-page patient portal: appointments, care team, health
│                            summary, prescriptions, notifications
├── css/
│   ├── style.css         ← design tokens + every component style (incl. auth)
│   └── responsive.css    ← 1200 / 1024 / 768 / 430 / 375px breakpoints
├── js/
│   ├── main.js            ← preloader, navbar, mobile menu, cursor, spotlight,
│   │                         magnetic buttons, scramble text, page transitions
│   ├── animations.js       ← GSAP hero timeline, scroll-reveal presets, counters,
│   │                         horizontal patient-journey scroll, sticky "why choose
│   │                         us," testimonial slider, morphing headline, 3D tilt
│   ├── validation.js       ← reusable name / email / password / confirm-password
│   │                          validation engine — powers every form on the site
│   ├── auth.js              ← login.html / create-account.html specific behaviour:
│   │                           password show/hide, strength meter, form submit
│   └── dashboard.js         ← both dashboards: sidebar tab switching, mobile
│                               sidebar drawer, profile dropdown, hand-built
│                               SVG/CSS charts, live table search, toggles
└── assets/                ← empty logo/images/icons folders, ready for your files
```

## The dashboards

Both dashboards share `css/dashboard.css` (a separate stylesheet from the
public site, loaded only on these two pages) and `js/dashboard.js`, but the
two pages are deliberately different shapes, matching how the brief
describes them:

- **`admin-dashboard.html`** is an 8-tab console (Overview, Patients,
  Doctors, Appointments, Departments, Messages, Reports, Settings) behind a
  fixed sidebar. Switching tabs swaps the visible panel with a fade — it's
  a single HTML file, not eight separate pages, so state and styling stay
  in sync. Overview includes hand-built SVG/CSS charts (a drawn line chart,
  a donut, and bar charts — no charting library), an animated stat grid, a
  live-searchable patient table, and a status-filterable appointments table
  reusing the same filter-pill component from the Blog page. It isn't linked
  from the public navbar by design — real admin consoles usually aren't —
  so reach it directly at `admin-dashboard.html`.
- **`public-dashboard.html`** is one scrolling patient portal page (no
  sidebar, no tabs), matching the more casual, single-page structure the
  brief describes for patients: welcome banner, quick actions, upcoming
  appointment, care team, medical services, health summary, appointment
  history, prescriptions, and notifications. Logging in via `login.html`
  redirects here and personalizes the welcome message and profile email
  from the demo session stored in `localStorage`; visiting it directly
  without logging in still works and shows sensible demo data.

Both reuse `.card`, `.btn`, `.avatar-initials`, `.eyebrow`, and every other
token from `style.css`, so they read as part of the same product rather than
a bolted-on admin panel.

**Home page (`index.html`)** implements all 10 sections from the brief with a
different animation personality each, per section 40 of the brief:

| Section | Animation identity |
|---|---|
| 01 Hero | Kinetic split-text headline, mask-reveal visual, floating cards, choreographed 13-step entrance timeline |
| 02 Stats | Card stagger + count-up counters |
| 03 Hospital Intro | Clip-path mask reveal + split text |
| 04 Services Bento | Staggered bento grid, icon micro-interactions, spotlight hover |
| 05 Doctors | Cursor-driven 3D tilt + hover-reveal info panel |
| 06 Patient Journey | Pinned horizontal scroll (desktop) → snap-scroll swipe (mobile) |
| 07 Why Choose Us | Sticky visual, scroll-linked active state |
| 08 Testimonials | Auto-rotating slider + dual-direction infinite marquee |
| 09 Blog | Bento grid, image-zoom hover, one featured card |
| 10 Final CTA | Blur-reveal heading with an auto-morphing phrase + pulse-line background |

Also included and working: full-screen animated mobile nav, GSAP Bento-grid
preloader with live progress, custom cursor + hover spotlight + magnetic
buttons (desktop only, auto-disabled on touch), reduced-motion support, and a
reusable scroll-reveal preset system (`fade-up`, `fade-left`, `scale-reveal`,
`blur-reveal`, `mask-reveal`, `rotate-reveal`) driven entirely by
`data-animate` attributes — so new sections can opt into an animation without
writing new JS.

## Honest scope note — what isn't built yet

The full brief specifies **8 more pages** (about, services, blog, contact,
login, create-account, privacy, terms) plus **two full dashboards**
(admin + public) with charts, tables, and profile UI. Building all of that
to the same standard as the home page in one pass would mean shipping it
half-finished, so I stopped here deliberately rather than hand you ten
shallow pages.

## Login & Create Account — how the demo data works

This is a frontend-only build (brief §33), so there's no real backend or
database. `login.html` validates the email/password fields, then on success
stores a lightweight flag in `localStorage` and redirects to
`public-dashboard.html` — a stand-in for "you're now logged in," ready to be
replaced with a real API call later. `create-account.html` validates every
field live (first/last name letters-only, valid email, matching passwords,
8-character minimum with a strength meter) and shows an inline success state
rather than actually creating anything server-side.

## What's next

Everything from the brief is built except **Privacy Policy** and
**Terms & Conditions** — the two static legal pages linked from the footer
on every page. Say the word and I'll wrap those up too; they're the
smallest remaining piece by far, just long-form text in the site's
markdown/prose styling.
A few effects from the brief were intentionally simplified for performance
and reliability rather than left half-working: particle-formation text and
liquid/melting text are not implemented (they're expensive to do well and
easy to do janky); handwriting-style text uses a straightforward reveal
rather than a literal stroke-by-stroke pen animation. Everything else in the
animation list (split text, kinetic type, mask reveal, scramble text,
morphing text, marquee, sticky storytelling, horizontal scroll, 3D tilt,
flip/expandable cards, magnetic buttons, hover spotlight) is implemented.

## Photography

Doctor cards still use a clean initials avatar (no stock photos of "our
doctors," since they're not real people). But six sections now use real
photography, hotlinked directly from Unsplash's CDN (`images.unsplash.com`)
rather than downloaded/rehosted — every photo is confirmed
"Free to use under the Unsplash License" (free for commercial use, no
attribution required) as of when it was sourced:

| Page | Section | Photo |
|---|---|---|
| About | Hospital Story visual | `photo-1755995083683-50d08cd83d09` — hospital hallway |
| About | Final CTA background | `photo-1640876777012-bdb00a6323e2` — surgical team |
| Services | Emergency Care row | `photo-1648224395277-052c8108efa3` — hospital equipment |
| Services | Diagnostics row | `photo-1646956141700-55bd6bc59d95` — lab pipettes |
| Blog | Featured article visual | `photo-1532938911079-1b06ac7ceec7` — stethoscope |
| Blog | Newsletter background | `photo-1576091160550-2173dba999ef` — telehealth/laptop |

Every photo container also carries a `.bg-photo` (or `.bg-photo-dark`, where
text sits directly on the image) class, which lays a soft brand-teal
gradient over the photo so it's color-graded to match the rest of the site
rather than looking like a dropped-in stock image. To swap any of these for
your own photography later, just replace the `background-image: url(...)`
in that element's inline `style` — the overlay and sizing stay intact.

Everywhere else — home page hero/intro/doctors/blog cards, and any section
not listed above — still uses the intentional gradient + pulse-line
placeholder (`.ph-visual` class) rather than more stock photography, since
those would need to look like specific people/places on your actual site
and a generic stock photo would misrepresent that. Swap
`<div class="ph-visual">...</div>` for `<img src="assets/images/your-photo.jpg" alt="...">`
whenever you have the real thing.

## Adding your logo (see brief §37)

The navbar, footer, and loader all reference a placeholder mark:

```html
<span class="brand-mark">
  <svg viewBox="0 0 24 24" ...><path d="M12 5v14M5 12h14"/></svg>
</span>
<span class="brand-word">Meridian<small>Health Network</small></span>
```

Drop your logo file in `assets/logo/`, then replace the `<svg>` inside every
`.brand-mark` (navbar ×1, footer ×1, loader ×1) with an `<img>` pointing to
it. `.brand-mark` is a fixed 42×42px box with `border-radius:12px` — set your
`<img>` to `width:100%;height:100%;object-fit:contain` and it'll stay
compact while your logo reads clearly, per the brief's requirement.

## Running it

No build step. Either:
- Open `index.html` directly in a browser, or
- Serve the folder (`python3 -m http.server`, VS Code Live Server, etc.) —
  recommended, since some browsers restrict `fetch`/module behavior on
  `file://` URLs.

GSAP and ScrollTrigger load from the cdnjs CDN in the `<head>`/before
`</body>` — an internet connection is required the first time each page
loads (or self-host `gsap.min.js` / `ScrollTrigger.min.js` in a `vendor/`
folder if you need it fully offline).

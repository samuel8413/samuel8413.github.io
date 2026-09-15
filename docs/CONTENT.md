# Editing content

Everything the site shows comes from two JSON files in `content/`. You never need to touch components to change what is said.

```sh
npm run content:check          # validate + list findings
npm run content:check:strict   # what the deploy runs; fails on blocking errors
npm run dev                    # see it live
```

## `content/profile.json`

The LinkedIn-shaped export. Fields and their rules:

| Field                                                                                        | Notes                                                                                                                  |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `contact.full_name`                                                                          | **Required for deployment.** Drives the title, `h1`, footer and JSON-LD.                                               |
| `contact.email`, `phone`                                                                     | Optional. Rendered only if present _and_ allowed by `privacy` in `site.config.json`.                                   |
| `contact.location`                                                                           | Free text, shown in the hero and JSON-LD address.                                                                      |
| `contact.linkedin_url`, `github_url`, `website_url`                                          | Optional `http(s)` URLs. At least one contact channel (email or LinkedIn) is required for deployment.                  |
| `headline`                                                                                   | One line under your name.                                                                                              |
| `summary`                                                                                    | Paragraphs separated by blank lines. The first is the hero pitch; the rest go to "About".                              |
| `positions[]`                                                                                | `started_on` / `finished_on` accept `"2013"`, `"Oct 2024"`, `"Oct 5, 2024"` or ISO. `finished_on: null` means current. |
| `positions[].description`                                                                    | Any of: a string; `{ "intro", "bullets": [] }`; `{ "responsibilities": [], "key_achievements": [] }`.                  |
| `education[]`, `languages[]`, `certifications[]`, `honors[]`, `projects[]`, `publications[]` | Optional arrays. Sections disappear when empty.                                                                        |
| `skills[]`                                                                                   | Flat list of LinkedIn labels. Each must appear in a group in `site.config.json`.                                       |

Unknown keys fail validation on purpose, so a typo cannot silently vanish.

### How positions are presented

- Consecutive roles at the same company are grouped under one company heading with the total tenure (a promotion path).
- Roles that ended before `experience.careerPivot` (see below) are collapsed under "Earlier career". Ongoing roles are never collapsed.
- Durations ("3 yrs 2 mos") count both end months, the way LinkedIn does. "Present" uses the build date; the site rebuilds monthly.

## `content/site.config.json`

Editorial choices that are not in the LinkedIn export.

| Key                                      | Purpose                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| `site.url`                               | Canonical origin for local builds. The deploy workflow overrides it. Leave empty if unsure.   |
| `site.titleTemplate`                     | `%s` becomes your name.                                                                       |
| `site.description`                       | Meta description. Empty falls back to the first summary paragraph, trimmed to 155 characters. |
| `site.repositoryUrl`                     | Shown as "View source" in the footer.                                                         |
| `experience.careerPivot`                 | Date before which finished roles are "earlier career".                                        |
| `highlights[]`                           | Up to six `{ value, label, detail }` cards under the hero. Keep values short and defensible.  |
| `skills.groups[]`                        | Ordered groups of skill names. Order inside a group is the display order.                     |
| `skills.labels`                          | Display overrides, for example `"Python (Programming Language)": "Python"`.                   |
| `contact.lead`                           | Sentence above the contact channels.                                                          |
| `privacy.showEmail`, `privacy.showPhone` | Whether to publish those fields even when present. Phone defaults to off.                     |

## Findings you may see

| Finding                       | Severity | Meaning                                              |
| ----------------------------- | -------- | ---------------------------------------------------- |
| `contact.full_name` empty     | error    | The site renders "Your Name". Deployment is blocked. |
| no contact channel            | error    | Neither email nor LinkedIn. Deployment is blocked.   |
| skill not in any group        | error    | Renders under "Other" locally. Add it to a group.    |
| taxonomy entry not in profile | warning  | You removed a skill on LinkedIn; tidy the group.     |
| certification without URL     | warning  | Rendered without a "Verify" link.                    |

## The printable résumé

`/cv/` is the same data rendered as a document. Open it from the "Save as PDF" button in the site header, or directly. In the print dialog choose "Save as PDF", Letter or A4, and turn off headers and footers. The e2e suite fails if the résumé grows past two pages; if you add a lot of content, lower `resume.detailedTenures` or switch off a section in `resume.include`.

## Portrait

Replace `src/assets/headshot.jpg` with a square image, 1200 px or larger, without EXIF you would not want published (Astro strips metadata when it re-encodes, but the source is committed). The build produces AVIF, WebP and JPEG at four widths, plus a 1200 px social card.

## Favicon

`public/favicon.svg` is a neutral mark. Swap it for your initials or logo; keep it SVG.

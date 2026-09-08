# Book Sales Study

An interactive companion to [the Book Sales analysis](https://github.com/ashishoutlier/EDA_Book_Sales).

The website uses the 1,070 records in the repository's CSV. Readers can filter by publisher or genre, search by book or author, compare ratings with units sold, and browse individual records. Missing ratings are excluded from averages. The source does not establish a currency or sales period.

The interface uses Bodoni Moda for headings and Hanken Grotesk for body text, with wine, pale rose and slate blue drawn from book jacket and catalogue design. Fonts are served by Google Fonts.

## Local development

```sh
npm ci
npm run dev
```

## Validation

```sh
node --test lib/books.test.mjs
npx tsc --noEmit
npm run build
```

The tests cover combined filters, empty results, missing ratings, numerical sorting and aggregate totals. Browser rendering and the optional browser tool registry could not be checked in the authoring session because a connected browser was unavailable.

## Source

The dataset is stored in `lib/books.json`. It is derived from `Books_Data_Clean.csv`, with blank book titles displayed as “Untitled record”. The original notebook remains the source for the wider analysis.

The website uses React, Vinext and the included Shadcn controls. Hosting configuration belongs in `.openai/hosting.json`.

## GitHub Pages

The live website is at [Book Sales Study](https://ashishoutlier.github.io/EDA_Book_Sales/).

Build the site for its repository path and prepare the static output:

```sh
NEXT_PUBLIC_BASE_PATH=/EDA_Book_Sales npm run build
node scripts/prepare-pages.mjs EDA_Book_Sales
```

The output in `dist/pages` is served from the repository's `gh-pages` branch. The preparation step places exported assets at the paths GitHub Pages serves beneath the repository URL.

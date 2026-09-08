# Book Sales: Exploratory Data Analysis

[Explore the live Book Sales Study](https://ashishoutlier.github.io/EDA_Book_Sales/)

The website lets you search the catalogue, filter by genre or publisher, and compare reader ratings with units sold. Its source and setup instructions are in [website](website/README.md).

This notebook explores book metadata, reader ratings, pricing, and sales. It checks data quality, filters records by publication year, and plots relationships between these fields.

**Start here:** [Book sales notebook](Book_Sales_EDA.ipynb) · [Included dataset](Books_Data_Clean.csv)

## Questions explored

* How are publication years, genres, and language codes distributed in this dataset?
* How does the number of reader ratings vary across genres?
* What patterns appear between sale price and units sold?
* How do average ratings relate to the number of ratings a book receives?

## Analysis workflow

1. Load the CSV and inspect descriptive statistics.
2. Keep records with `Publishing Year > 1800`.
3. Inspect missing values, remove rows without a book name, and check duplicates and unique values.
4. Create a histogram of publication years, genre counts, boxplots of rating counts, a language pie chart, and relationship scatterplots.

The included CSV contains **1,070 rows and 15 columns**. The notebook's saved outputs show 1,050 rows after the year filter and 1,029 after removing missing book names. These counts describe the included dataset and saved analysis; they are not totals for the book market.

## Run locally

Use Python 3 and run these commands from the repository root. The notebook metadata records Python 3.12.7; dependency versions were not recorded in an environment file.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install numpy pandas matplotlib seaborn jupyterlab
python -m jupyterlab Book_Sales_EDA.ipynb
```

On Windows, activate the environment with `.venv\Scripts\Activate.ps1` in PowerShell. Keep the notebook and CSV in the same working directory, then execute cells in order. GitHub can also display the saved outputs without installing Python.

## Data notes

| File | Contents |
| --- | --- |
| [Books_Data_Clean.csv](Books_Data_Clean.csv) | Book titles, authors, publication years, languages, ratings, genres, publishers, and sales fields |
| [Book_Sales_EDA.ipynb](Book_Sales_EDA.ipynb) | Cleaning steps, summary tables, and charts |

The CSV's publisher column is named `Publisher `, including a trailing space. The repository does not identify the original data provider, collection method, sales period, currency, or dataset license. These details need confirmation before interpreting the data as representative of a wider market.

## Current limitations

* Filtering by publication year and removing rows without titles change the sample. Missing language codes are inspected but not filled; the language chart excludes missing values through `value_counts()`.
* Genre counts measure records in the dataset, despite a chart label referring to books printed.
* Plots show associations, without statistical tests or a predictive model. They do not establish that price, genre, or ratings cause sales differences.
* Saved output includes a pandas `SettingWithCopyWarning`. The notebook has not been rerun as part of this documentation update, and the installation commands are not a locked or verified environment.

## Author

Ashish.

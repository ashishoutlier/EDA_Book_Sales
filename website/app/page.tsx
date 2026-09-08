'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Search, X, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import raw from '@/lib/books.json';
import { filterBooks, summarizeBooks, sortBooks } from '@/lib/books.mjs';

type Book = typeof raw[number];
const books = raw as Book[];
const genres = [...new Set(books.map(b => b.genre))].sort();
const publishers = [...new Set(books.map(b => b.publisher))].sort();
const colors: Record<string, string> = { 'genre fiction': '#79334b', fiction: '#bc8e9b', nonfiction: '#427584', children: '#a07830' };
const fmt = (n: number) => new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(n);
const compact = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Picker({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return <div className="picker"><span className="control-label">{label}</span><Select value={value} onValueChange={v => onChange(v ?? 'all')}>
    <SelectTrigger aria-label={label} className="choice"><SelectValue>{value === 'all' ? 'All ' + label.toLowerCase() : titleCase(value)}</SelectValue></SelectTrigger>
    <SelectContent><SelectItem value="all">All {label.toLowerCase()}</SelectItem>{options.map(o => <SelectItem key={o} value={o}>{titleCase(o)}</SelectItem>)}</SelectContent>
  </Select></div>;
}

function Scatter({ rows, selected, onSelect }: { rows: Book[]; selected: Book | null; onSelect: (b: Book) => void }) {
  const points = rows.filter(b => b.rating !== null && b.units !== null && b.units > 0);
  const x = (n: number) => 58 + (n / 5) * 652;
  const y = (n: number) => 318 - (Math.log10(Math.max(n, 1)) / 5) * 274;
  return <div className="scatter-wrap"><svg viewBox="0 0 752 370" role="img" aria-label="Scatter plot of average reader rating against units sold, on a logarithmic sales scale. The catalogue below provides the data as text.">
    <text x="58" y="19" className="axis-title">Units sold</text>
    {[10, 100, 1000, 10000, 100000].map(n => <g key={n}><line x1="58" y1={y(n)} x2="716" y2={y(n)} className="grid-line" /><text x="45" y={y(n) + 4} textAnchor="end">{compact(n)}</text></g>)}
    {[0, 1, 2, 3, 4, 5].map(n => <g key={n}><text x={x(n)} y="341" textAnchor="middle">{n}</text></g>)}
    {points.map(b => <circle key={b.id} cx={x(b.rating!)} cy={y(b.units!)} r={selected?.id === b.id ? 8 : 4} fill={colors[b.genre]} opacity={selected?.id === b.id ? 1 : .55} onClick={() => onSelect(b)} className="book-point"><title>{b.title + ": " + b.rating + " / 5, " + fmt(b.units!) + " units"}</title></circle>)}
    <text x="386" y="368" textAnchor="middle" className="axis-title">Average reader rating</text>
  </svg><p className="chart-note">Each dot is one record. Sales use a logarithmic scale so smaller and larger figures remain visible.</p></div>;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [publisher, setPublisher] = useState('all');
  const [sort, setSort] = useState('units');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Book | null>(null);
  const filtered = useMemo(() => filterBooks(books, { query, genre, publisher }) as Book[], [query, genre, publisher]);
  const summary = useMemo(() => summarizeBooks(filtered), [filtered]);
  const ranked = useMemo(() => sortBooks(filtered, sort) as Book[], [filtered, sort]);
  const byGenre = genres.map(name => ({ name, count: filtered.filter(b => b.genre === name).length }));
  const resetPage = () => { setPage(0); setSelected(null); };
  const reset = () => { setQuery(''); setGenre('all'); setPublisher('all'); resetPage(); };
  const active = query || genre !== 'all' || publisher !== 'all';
  const pageCount = Math.max(1, Math.ceil(ranked.length / 12));
  const currentPage = Math.min(page, pageCount - 1);
  const selection = selected && filtered.some(b => b.id === selected.id) ? selected : ranked[0] ?? null;
  const selectionRef = useRef({ query, genre, publisher, summary, books: ranked.slice(0, 12) });
  selectionRef.current = { query, genre, publisher, summary, books: ranked.slice(0, 12) };
  useEffect(() => {
    type Context = { registerTool: (tool: object, options: { signal: AbortSignal }) => unknown };
    const context = (document as Document & { modelContext?: Context }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name: 'get_book_selection',
        title: 'Read the current book selection',
        description: 'Return active filters, computed totals and the first twelve sorted records from the visible Book Sales study.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute(input: unknown) {
          if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Provide an empty object.');
          return selectionRef.current;
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch { /* Browsers without the optional registry keep the same interface. */ }
    return () => lifecycle.abort();
  }, []);

  return <>
    <a href="#study" className="skip-link">Skip to the study</a>
    <header className="site-header"><a className="wordmark" href="./"><BookOpen size={27} strokeWidth={1.4} /><span>Book Sales Study</span></a><a className="source-link" href="https://github.com/ashishoutlier/EDA_Book_Sales"><GitBranch size={18} />View the project</a></header>
    <main id="study" className="study">
      <section className="intro"><div><p className="byline">A data study by Ashish</p><h1>Between ratings<br />and revenue.</h1><p className="intro-copy">Explore how sales, reader ratings and publishers relate across the books in this dataset.</p></div><div className="dataset-note"><span className="dataset-number">1,070</span><span>records, each with<br />a story in the numbers.</span><p>A snapshot from the original analysis.<br />Not a live view of the book market.</p></div></section>
      <div className="filter-bar">
        <label className="search-field"><span className="control-label">Find a book or author</span><div><Search size={19}/><input value={query} onChange={e => { setQuery(e.target.value); resetPage(); }} placeholder="Try Tolkien, Austen, or a title" type="search" /></div></label>
        <Picker label="Genres" value={genre} options={genres} onChange={v => { setGenre(v); resetPage(); }} />
        <Picker label="Publishers" value={publisher} options={publishers} onChange={v => { setPublisher(v); resetPage(); }} />
        <button className="reset-button" disabled={!active} onClick={reset}><X size={16}/> Clear filters</button>
      </div>
      <Tabs defaultValue="overview" className="study-tabs">
        <div className="tab-row"><TabsList variant="line" className="view-tabs"><TabsTrigger value="overview">The overview</TabsTrigger><TabsTrigger value="catalogue">The catalogue</TabsTrigger><TabsTrigger value="notes">About the data</TabsTrigger></TabsList><span aria-live="polite" className="result-count">{fmt(summary.count)} of {fmt(books.length)} records</span></div>
        <TabsContent value="overview">
          {filtered.length ? <div className="overview-grid">
            <section className="plot-panel"><div className="panel-heading"><div><h2>Do better ratings mean more sales?</h2><p>Read the pattern. Explore the exceptions.</p></div></div><div className="legend">{genres.map(g => <span key={g}><i style={{background: colors[g]}}/>{titleCase(g)}</span>)}</div><Scatter rows={filtered} selected={selection} onSelect={setSelected}/></section>
            <aside className="reading-panel"><div className="selection-heading"><span>From this selection</span><BookOpen size={20}/></div><dl className="summary-list"><div><dt>Units sold</dt><dd>{compact(summary.units)}</dd></div><div><dt>Average book rating</dt><dd>{summary.rating?.toFixed(2) ?? 'Not recorded'}<small> / 5</small></dd></div></dl><h3>The mix of genres</h3><div className="genre-bars">{byGenre.map(g => <div key={g.name}><div className="genre-label"><span>{titleCase(g.name)}</span><span>{fmt(g.count)}</span></div><div className="bar-track"><div style={{width: (g.count / filtered.length * 100) + '%', background: colors[g.name]}}/></div></div>)}</div><p className="side-note">Averages give every book equal weight. Genre labels follow the source file.</p></aside>
            {selection && <section className="book-detail"><div className="record-marker" aria-hidden="true">{String(selection.id + 1).padStart(4, '0')}</div><div className="record-copy"><p className="detail-label">A closer look</p><h2>{selection.title}</h2><p>{selection.authors}</p><span>{selection.publisher}{selection.year !== null ? ', published ' + Math.trunc(selection.year) : ''}</span></div><dl><div><dt>Reader rating</dt><dd>{selection.rating ?? 'Not recorded'}<small> / 5</small></dd></div><div><dt>Units sold</dt><dd>{selection.units === null ? 'Not recorded' : fmt(selection.units)}</dd></div></dl></section>}
          </div> : <div className="empty-state"><h2>No books in this selection.</h2><p>Try another title or clear the filters to return to the full dataset.</p><button className="primary-button" onClick={reset}>Show all books</button></div>}
        </TabsContent>
        <TabsContent value="catalogue"><section className="catalogue-panel"><div className="catalogue-heading"><div><h2>Read the individual records.</h2><p>All values come from the supplied dataset.</p></div><Picker label="Sort by" value={sort} options={['units','rating','sales']} onChange={v => { setSort(v === 'all' ? 'units' : v); setPage(0); }}/></div><Table className="catalogue"><TableHeader><TableRow><TableHead>Book and author</TableHead><TableHead>Publisher</TableHead><TableHead>Genre</TableHead><TableHead className="numeric">Rating</TableHead><TableHead className="numeric">Units sold</TableHead></TableRow></TableHeader><TableBody>{ranked.slice(currentPage * 12, currentPage * 12 + 12).map(b => <TableRow key={b.id}><TableCell className="book-cell"><strong>{b.title}</strong><span>{b.authors}</span></TableCell><TableCell>{b.publisher}</TableCell><TableCell>{titleCase(b.genre)}</TableCell><TableCell className="numeric">{b.rating?.toFixed(2) ?? 'Not recorded'}</TableCell><TableCell className="numeric">{b.units === null ? 'Not recorded' : fmt(b.units)}</TableCell></TableRow>)}</TableBody></Table>{!ranked.length && <p className="empty-catalogue">No matching records. Try clearing the filters.</p>}<div className="pagination"><span>Page {currentPage + 1} of {pageCount}</span><div><button aria-label="Previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={18}/></button><button aria-label="Next page" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={18}/></button></div></div></section></TabsContent>
        <TabsContent value="notes"><article className="data-notes"><h2>A catalogue is a starting point.</h2><p>This website is a companion to my Book Sales analysis. It uses the 1,070 rows in the CSV included with the repository. The charts are calculated from that file and change with your filters.</p><h3>What the numbers mean</h3><p>Ratings are the average reader ratings recorded for each book. Units sold and gross sales are separate fields in the source. The file does not establish a sales period or currency, so this site does not present the values as current market figures or attach a currency symbol.</p><h3>What needs care</h3><p>The file includes missing titles and inconsistent publication years. Missing titles appear as “Untitled record”; missing numbers are excluded from relevant averages. The categories “fiction” and “genre fiction” are kept separate, as recorded in the source.</p><p>This is an observational dataset. A relationship between two fields does not show that one causes the other. Dataset collection methods and licensing are not documented in the original repository.</p><a className="text-link" href="https://github.com/ashishoutlier/EDA_Book_Sales/blob/main/Book_Sales_EDA.ipynb">Read the original notebook</a></article></TabsContent>
      </Tabs>
    </main>
    <footer><span>Book Sales Study</span><p>Made by Ashish, from the original Book Sales analysis.</p><a href="https://github.com/ashishoutlier/EDA_Book_Sales">Source and methods</a></footer>
  </>;
}

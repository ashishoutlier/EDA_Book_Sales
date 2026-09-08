export function filterBooks(rows, { query = '', genre = 'all', publisher = 'all' } = {}) {
  const term = query.trim().toLocaleLowerCase();
  return rows.filter(book =>
    (!term || (book.title + ' ' + book.authors).toLocaleLowerCase().includes(term)) &&
    (genre === 'all' || book.genre === genre) &&
    (publisher === 'all' || book.publisher === publisher)
  );
}
export function summarizeBooks(rows) {
  const rated = rows.filter(book => Number.isFinite(book.rating));
  return {
    count: rows.length,
    units: rows.reduce((sum, book) => sum + (Number.isFinite(book.units) ? book.units : 0), 0),
    sales: rows.reduce((sum, book) => sum + (Number.isFinite(book.sales) ? book.sales : 0), 0),
    rating: rated.length ? rated.reduce((sum, book) => sum + book.rating, 0) / rated.length : null,
    rated: rated.length,
  };
}
export function sortBooks(rows, field = 'units') {
  return [...rows].sort((a, b) => {
    const av = a[field], bv = b[field];
    if (!Number.isFinite(av)) return Number.isFinite(bv) ? 1 : 0;
    if (!Number.isFinite(bv)) return -1;
    return bv - av || a.id - b.id;
  });
}

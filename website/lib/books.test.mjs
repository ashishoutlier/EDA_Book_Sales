import test from 'node:test';
import assert from 'node:assert/strict';
import { filterBooks, summarizeBooks, sortBooks } from './books.mjs';

const rows = [
  { id: 1, title: 'A Tale', authors: 'Ada', genre: 'fiction', publisher: 'North', rating: 4, units: 100, sales: 200 },
  { id: 2, title: 'A History', authors: 'Ben', genre: 'nonfiction', publisher: 'South', rating: null, units: 20, sales: 80 },
  { id: 3, title: 'Another Tale', authors: 'Ada', genre: 'fiction', publisher: 'South', rating: 2, units: 80, sales: 100 },
];
test('combines author search with genre and publisher filters', () => {
  assert.deepEqual(filterBooks(rows, { query: ' ADA ', genre: 'fiction', publisher: 'South' }).map(x => x.id), [3]);
});
test('returns all rows for empty filters and none for an unmatched query', () => {
  assert.equal(filterBooks(rows, {}).length, 3);
  assert.deepEqual(filterBooks(rows, { query: 'unlisted' }), []);
});
test('averages only known ratings and aggregates sales without inventing a currency', () => {
  assert.deepEqual(summarizeBooks(rows), { count: 3, units: 200, sales: 380, rating: 3, rated: 2 });
  assert.deepEqual(summarizeBooks([]), { count: 0, units: 0, sales: 0, rating: null, rated: 0 });
});
test('sorts numerically, puts missing ratings last and preserves original rows', () => {
  assert.deepEqual(sortBooks(rows, 'rating').map(x => x.id), [1, 3, 2]);
  assert.deepEqual(sortBooks(rows, 'units').map(x => x.id), [1, 3, 2]);
  assert.deepEqual(rows.map(x => x.id), [1, 2, 3]);
});

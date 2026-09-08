import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Book Sales Study | Ashish',
  description: 'Explore book ratings, publishers and sales across 1,070 records from the Book Sales analysis.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

import { Inter } from 'next/font/google';
import './globals.css';
import { LevelProvider } from './context/LevelContext';
import LevelBadge from './components/LevelBadge';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Meie Koning — Portfolio',
  description: 'Builder, creator, and explorer at the intersection of AI and design.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <LevelProvider>
          {children}
          <LevelBadge />
        </LevelProvider>
      </body>
    </html>
  );
}

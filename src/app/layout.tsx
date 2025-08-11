import { Outfit } from 'next/font/google';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/sonner'; 




import './globals.css'
import Script from 'next/script';

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: ' Trade Pro - Blockchain Company',
  description:
    'tradeproassets.xyz is an investment firm committed to exceptional returns for investors through actively managed portfolios of these blockchain assets.',
  keywords:
    'blockchain, Forex, FX, Crypto, Cryptos, Cryptocurrencies, Stock, Stocks, Bonds, Invest, Investment, Equity',
  openGraph: {
    url: 'https://tradeproassets.xyz/',
    type: 'website',
    title: 'Trade With Us',
    description:
      'Earn huge return on investment. With our professional team of traders, you are guaranteed of your earnings.',
    images: [
      'https://static.news.bitcoin.com/wp-content/uploads/2022/07/tesla-sold-btc1.jpg',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    domain: 'tradeproassets.xyz',
    url: 'https://tradeproassets.xyz/',
    title: 'Trade With Us',
    description:
      'Earn huge return on investment. With our professional team of traders, you are guaranteed of your earnings.',
    images: [
      'https://static.news.bitcoin.com/wp-content/uploads/2022/07/tesla-sold-btc1.jpg',
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
          <Toaster />
        </ThemeProvider>
        <Script src="//code.jivosite.com/widget/w6GDGUb46u" async></Script>
      </body>
    </html>
  );
}

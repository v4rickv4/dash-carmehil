import './globals.css';

export const metadata = {
  title: 'Dashboard Meta Ads | Carmehil',
  description: 'Painel de análise de performance das campanhas de Meta Ads da Carmehil. Acompanhe investimento, leads, CPL, CTR e muito mais.',
  keywords: 'meta ads, carmehil, dashboard, performance, campanhas, leads, marketing',
  openGraph: {
    title: 'Dashboard Meta Ads | Carmehil',
    description: 'Análise completa de performance das campanhas Meta Ads',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

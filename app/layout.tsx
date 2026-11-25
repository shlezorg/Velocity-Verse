import type { Metadata } from "next";
import { Oswald, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { site } from "@/lib/site";

const headline = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-headline", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website", images: ["/og-default.jpg"] },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: site.name, url: site.url },
    { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/brand/velocity-verse-logo.webp` },
  ],
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('vv_theme');
      var theme = saved || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.style.colorScheme = theme;
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${headline.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-white rounded-md">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}

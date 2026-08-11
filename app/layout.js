import { Sora, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ReadingSettingsProvider } from "@/components/providers/ReadingSettingsProvider";
import { HashScrollHandler } from "@/components/navigation/HashScrollHandler";
import { BRAND } from "@/lib/config/brand.js";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: {
    default: `${BRAND.name} — News Intelligence`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: BRAND.name,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${newsreader.variable} font-sans min-h-screen page-shell`}>
        <ThemeProvider>
          <ReadingSettingsProvider>
            <HashScrollHandler />
            <SiteChrome>{children}</SiteChrome>
          </ReadingSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

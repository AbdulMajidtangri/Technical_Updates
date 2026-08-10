import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ReadingSettingsProvider } from "@/components/providers/ReadingSettingsProvider";
import { HashScrollHandler } from "@/components/navigation/HashScrollHandler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: {
    default: "TechPulse AI — News Intelligence",
    template: "%s | TechPulse AI",
  },
  description: "Professional technology news intelligence. Ranked, analyzed, and explained.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TechPulse AI",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans min-h-screen`}>
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
import { PT_Serif } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/Providers/ThemeProvider";
import { AuthProvider } from "@/Providers/AuthContext";
import CustomAnalyticsTracker from "@/components/CustomAnalyticsTracker";

const PTserif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-PTserif",
  display: "swap",
  preload: false,
});

export const metadata = {
  title: "Mouhcine AKASBI",
  description: "Mouhcine AKASBI portfolio",
  metadataBase: new URL('https://akasbimouhcine.com'),
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1c22' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body
        className={`${PTserif.variable} w-full min-h-screen h-full antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CustomAnalyticsTracker />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

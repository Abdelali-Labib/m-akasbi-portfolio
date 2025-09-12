import { PT_Serif } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/Providers/ThemeProvider";
import { AuthProvider } from "@/Providers/AuthContext";
import CustomAnalyticsTracker from "@/components/CustomAnalyticsTracker";

// Font optimized without preload to avoid unused resource warning
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${PTserif.variable} bg-light dark:bg-dark w-full min-h-screen h-full antialiased`}
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

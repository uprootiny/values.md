import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/header";
import { ProgressProvider } from "@/components/progress-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "values.md - Discover Your Personal Values",
  description: "Generate your personalized values.md file through ethical dilemmas to guide AI systems aligned with your principles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Build information for deployment tracing
  const buildInfo = {
    buildTime: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'local'
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Build information for deployment tracing */}
        <meta name="build-commit" content={buildInfo.commit} />
        <meta name="build-branch" content={buildInfo.branch} />
        <meta name="build-time" content={buildInfo.buildTime} />
        {/* Build: {buildInfo.commit} ({buildInfo.branch}) at {buildInfo.buildTime} */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ProgressProvider>
              <Header />
              {children}
            </ProgressProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

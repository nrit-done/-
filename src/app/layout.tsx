import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const settingsBootScript = `
(() => {
  try {
    const raw = localStorage.getItem("jobpilot-settings");
    const settings = raw ? JSON.parse(raw) : null;
    const preference = settings?.appearance?.theme || "light";
    const theme = preference === "system"
      ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density =
      settings?.appearance?.density || "comfortable";
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.density = "comfortable";
  }
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobPilot",
  description: "前端求职管理与作品集展示平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsBootScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

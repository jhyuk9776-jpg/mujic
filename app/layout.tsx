import type { Metadata } from "next";
import { Geist, Geist_Mono, Pirata_One, Schoolbell } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pirataOne = Pirata_One({
  variable: "--font-pirata-one",
  subsets: ["latin"],
  weight: "400",
});

const schoolBell = Schoolbell({
  variable: "--font-school-bell",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "mujic",
  description: "mujic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pirataOne.variable} ${schoolBell.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

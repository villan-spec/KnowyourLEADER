import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Know Your Leader — Tamil Nadu 2026 Elections Dashboard",
    description:
        "Compare MLA candidates in Tamil Nadu's 2026 Assembly Elections based on objective facts — declared assets, criminal cases, and local issues addressed. A non-partisan civic tool.",
    keywords: "Tamil Nadu elections, 2026, MLA candidates, candidate comparison, civic tech, know your leader",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}

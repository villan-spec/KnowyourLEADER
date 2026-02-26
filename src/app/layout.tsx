import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DisclaimerModal from "@/components/DisclaimerModal";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://knowyourleader.in"),
    title: {
        default: "Know Your Leader — Tamil Nadu 2026 Elections Dashboard",
        template: "%s | Know Your Leader",
    },
    description:
        "Compare MLA candidates in Tamil Nadu's 2026 Assembly Elections based on objective facts — declared assets, criminal cases, and local issues addressed. A non-partisan civic tool.",
    keywords: [
        "Tamil Nadu elections 2026",
        "TN Election 2026",
        "MLA candidates",
        "candidate comparison",
        "civic tech",
        "know your leader",
        "தமிழ்நாடு தேர்தல் 2026",
        "சட்டமன்றத் தேர்தல்",
    ],
    openGraph: {
        type: "website",
        locale: "en_IN",
        siteName: "Know Your Leader",
        title: "Know Your Leader — Tamil Nadu 2026 Elections Dashboard",
        description:
            "Compare MLA candidates based on declared assets, criminal cases & local issues. Non-partisan civic tool for Tamil Nadu voters.",
        images: [
            {
                url: "/images/tn-election-og.png",
                width: 1200,
                height: 630,
                alt: "Know Your Leader — Tamil Nadu 2026 Elections",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Know Your Leader — Tamil Nadu 2026 Elections Dashboard",
        description:
            "Compare MLA candidates based on declared assets, criminal cases & local issues.",
        images: ["/images/tn-election-og.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "https://knowyourleader.in",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="min-h-screen flex flex-col">
                <DisclaimerModal />
                <Header />
                <main className="flex-1 pt-24 sm:pt-32">{children}</main>
                <Footer />
            </body>
        </html>
    );
}

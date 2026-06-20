import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { ClientShell } from "@/components/providers/client-shell";
import "./globals.css";
import { SITE } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.author} — AI & Data Science`,
    template: `%s — ${SITE.author}`,
  },
  description: `${SITE.author} is a data scientist in ${SITE.location}, building data-science pipelines, ML models, and n8n automations.`,
  applicationName: `${SITE.author} — Portfolio`,
  authors: [{ name: SITE.author, url: SITE.url }],
  creator: SITE.author,
  publisher: SITE.author,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.author} — AI & Data Science`,
    description: `${SITE.author} is an AI & Data Science student in ${SITE.location}, building data-science pipelines and n8n automations.`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.author,
    title: `${SITE.author} — AI & Data Science`,
    description: `${SITE.author} is an AI & Data Science student in ${SITE.location}, building data-science pipelines and n8n automations.`,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0E0E10" },
    { media: "(prefers-color-scheme: light)", color: "#F2EDE4" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.author,
  url: SITE.url,
  email: `mailto:${SITE.email}`,
  jobTitle: "AI & Data Science · n8n Orchestration",
  knowsAbout: [
    "Data Science",
    "Machine Learning",
    "Python",
    "LightGBM",
    "Pandas",
    "scikit-learn",
    "SHAP",
    "n8n",
    "FastAPI",
  ],
  sameAs: SITE.sameAs,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Coimbatore",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "SNS College of Engineering",
    sameAs: "https://www.snsce.ac.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col antialiased"
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <svg
          aria-hidden
          style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
        >
          <defs>
            <filter
              id="warp"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.018 0.022"
                numOctaves="2"
                seed="7"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="14"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter
              id="soft-warp"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01"
                numOctaves="1"
                seed="3"
              />
              <feDisplacementMap
                in="SourceGraphic"
                scale="6"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        <SmoothScrollProvider>
          <ClientShell>{children}</ClientShell>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
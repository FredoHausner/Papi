import type {Metadata} from "next";
import {Share_Tech_Mono} from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const terminalFont = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-terminal",
  weight: "400",
});

export const metadata: Metadata = {
  title: "PapiOS v1.0",
  description: "Retro AI terminal by Fredo Gonzalez",
  openGraph: {
    title: "PapiOS v1.0",
    description: "Retro AI terminal by Fredo Gonzalez",
    type: "website",
    url: "https://papi.ai",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body
        className={`${terminalFont.variable} font-mono bg-terminal-bg text-terminal-text min-h-screen overflow-hidden relative antialiased`}
      >
        <Providers>
          <main className="relative z-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

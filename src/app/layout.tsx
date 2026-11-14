import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reach One Child Foundation | Every Child Can Thrive",
  description: "Reach One Child Foundation equips vulnerable children in Zambia with education, literacy, mentorship and community support.",
  metadataBase: new URL("https://reachonechildfoundation.org"),
  openGraph: { title: "Reach One Child Foundation", description: "Educate. Empower. Transform.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

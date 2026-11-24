import type { Metadata, Viewport } from "next";
import "@fontsource/caprasimo/latin-400.css";
import "@fontsource/caprasimo/latin-ext-400.css";
import "@fontsource-variable/newsreader/standard.css";
import "@fontsource-variable/newsreader/standard-italic.css";
import "@fontsource-variable/caveat/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nuestro calendario de Adviento",
  description: "24 días, 24 razones para quererte.",
};

export const viewport: Viewport = {
  themeColor: "#0a2219",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

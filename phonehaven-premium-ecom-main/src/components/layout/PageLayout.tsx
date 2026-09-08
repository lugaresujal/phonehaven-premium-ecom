import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "../ui/WhatsAppButton";

export type Crumb = { label: string; to?: string };

export function PageLayout({
  children,
  title,
  subtitle,
  crumbs,
  bare,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  crumbs?: Crumb[];
  bare?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {!bare && (title || crumbs) && (
          <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
            <div className="container-hop py-10 md:py-14">
              {crumbs && (
                <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-primary">Home</Link>
                  {crumbs.map((c, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <ChevronRight size={12} />
                      {c.to ? <Link to={c.to} className="hover:text-primary">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
                    </span>
                  ))}
                </nav>
              )}
              {title && <h1 className="font-serif text-4xl md:text-5xl text-foreground">{title}</h1>}
              {subtitle && <p className="mt-3 text-muted-foreground max-w-2xl">{subtitle}</p>}
            </div>
          </section>
        )}
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: { label: string; href: string }[];
  image?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  image,
}: PageHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden bg-slate-950 pt-18 text-white">
      {image && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(2,6,23,.96)_5%,rgba(15,23,42,.88)_52%,rgba(30,64,175,.68)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-12 -z-10 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl"
      />

      <div className="public-container py-14 sm:py-18 lg:py-22">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <li>
              <Link
                href="/"
                aria-label="Beranda"
                className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white"
              >
                <Home aria-hidden="true" className="h-4 w-4" />
              </Link>
            </li>
            {breadcrumbs.map((crumb, index) => {
              const current = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.href}-${index}`} className="flex items-center gap-2">
                  <ChevronRight aria-hidden="true" className="h-4 w-4 text-slate-500" />
                  {current ? (
                    <span aria-current="page" className="font-semibold text-amber-300">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="focus-ring rounded hover:text-white">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">
            {breadcrumbs[0]?.label ?? "SMP IP Yakin Jakarta"}
          </p>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

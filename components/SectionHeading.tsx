import Link from "next/link";

export function SectionHeading({ id, title, href }: { id: string; title: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between border-b border-line pb-3">
      <h2 id={id} className="flex items-center gap-3 font-display text-2xl sm:text-3xl font-bold text-ink uppercase tracking-tight">
        <span aria-hidden="true" className="h-6 w-1 bg-accent rounded-full" />
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-accent">
          View all →
        </Link>
      )}
    </div>
  );
}

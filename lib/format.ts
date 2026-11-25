import type { Article } from "./types";

export const articleHref = (a: Article | { category: string; slug: string }) =>
  `/${a.category}/${a.slug}`;

export const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

import { MetadataRoute } from "next";
import { KIT_GAMES } from "@/lib/kitGames";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://secondmonitorgames.com";
  const now  = new Date();

  return [
    {
      url:             base,
      lastModified:    now,
      changeFrequency: "daily",
      priority:        1.0,
    },
    ...KIT_GAMES.map((g) => ({
      url:             `${base}/play/${g.id}`,
      lastModified:    now,
      changeFrequency: "weekly" as const,
      priority:        0.7,
    })),
    {
      url:             `${base}/about`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.6,
    },
  ];
}

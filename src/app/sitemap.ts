import { MetadataRoute } from "next";

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
    {
      url:             `${base}/games/decode`,
      lastModified:    now,
      changeFrequency: "daily",
      priority:        0.9,
    },
    {
      url:             `${base}/games/the-escape`,
      lastModified:    now,
      changeFrequency: "daily",
      priority:        0.8,
    },
    {
      url:             `${base}/games/block-fall`,
      lastModified:    now,
      changeFrequency: "daily",
      priority:        0.7,
    },
    {
      url:             `${base}/about`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.6,
    },
  ];
}

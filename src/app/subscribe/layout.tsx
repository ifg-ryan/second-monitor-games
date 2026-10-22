import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PRICING_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  title:       "Subscribe — Ad-Free Daily Games | Second Monitor Games",
  description: "Go ad-free and unlock the full puzzle archive. Subscribe to Second Monitor Games for $4.99/month — 7-day free trial, cancel anytime.",
  alternates:  { canonical: "https://secondmonitorgames.com/subscribe" },
  robots:      { index: true, follow: true },
};

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  if (!PRICING_ENABLED) redirect("/");
  return children;
}

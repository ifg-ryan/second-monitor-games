import type { Metadata } from "next";

export const metadata: Metadata = {
  title:      "Terms of Service — Second Monitor Games",
  description: "Terms of Service for Second Monitor Games. Read about usage rules, subscriptions, and your rights as a player.",
  alternates: { canonical: "https://secondmonitorgames.com/terms" },
  robots:     { index: true, follow: true },
};

const EFFECTIVE_DATE = "March 1, 2026";
const CONTACT_EMAIL  = "hello@secondmonitorgames.com";
const SITE_NAME      = "Second Monitor Games";
const SITE_URL       = "https://secondmonitorgames.com";

const sections = [
  {
    id:    "acceptance",
    title: "1. Acceptance of Terms",
    body: [
      `By accessing or using ${SITE_NAME} (${SITE_URL}), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the site.`,
      `These Terms apply to all visitors, registered users, and subscribers. We may update these Terms at any time. Continued use of the site after changes are posted constitutes your acceptance of the revised Terms. We will note the effective date at the top of this page when changes are made.`,
    ],
  },
  {
    id:    "service",
    title: "2. Description of Service",
    body: [
      `${SITE_NAME} provides free daily puzzle games, card games, and brain challenges accessible through your web browser. New challenges are published every day at midnight UTC. All daily games are free to play without creating an account.`,
      `A subscription plan is available that removes advertisements and unlocks access to the archive of past puzzles. Subscription features are described on our Pricing page and are subject to change with reasonable notice.`,
      `We reserve the right to modify, suspend, or discontinue any part of the service at any time, including specific games, features, or the site as a whole. We are not liable to you or any third party for any such modification, suspension, or discontinuation.`,
    ],
  },
  {
    id:    "accounts",
    title: "3. User Accounts",
    body: [
      `Creating an account is optional. An account is required to access subscriber-only features, save your scores to our leaderboards, and maintain cross-device progress.`,
      `Account authentication is handled through Clerk, a third-party authentication provider. By creating an account, you also agree to Clerk's Terms of Service and Privacy Policy. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.`,
      `You agree to provide accurate information when creating your account and to keep that information current. We reserve the right to suspend or terminate accounts that violate these Terms or that we determine, in our sole discretion, are being used inappropriately.`,
    ],
  },
  {
    id:    "subscriptions",
    title: "4. Subscriptions and Billing",
    body: [
      `Subscriptions are billed on a recurring monthly or annual basis. Payment is processed through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel.`,
      `You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period — you retain access to subscriber features until that date. We do not offer partial refunds for unused time unless required by applicable law.`,
      `Subscription prices are listed on our Pricing page and are subject to change. We will provide at least 14 days' notice before changing the price of an active subscription. Continued use of the subscription after a price change takes effect constitutes acceptance of the new price.`,
      `If a payment fails, we may suspend your subscription after a brief grace period. We will attempt to notify you by email before suspending access.`,
    ],
  },
  {
    id:    "ip",
    title: "5. Intellectual Property",
    body: [
      `All content on ${SITE_NAME} — including game designs, code, graphics, text, and branding — is owned by or licensed to Second Monitor Games and is protected by applicable intellectual property laws.`,
      `You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from this site without our express written permission. This includes game mechanics, daily puzzle content, and visual assets.`,
      `Your personal game data (scores, streaks, stats) belongs to you. See our Privacy Policy for information on how to export or delete your data.`,
    ],
  },
  {
    id:    "conduct",
    title: "6. User Conduct",
    body: [
      `You agree not to use the site to: (a) cheat, manipulate game results, or circumvent daily puzzle restrictions; (b) scrape, harvest, or collect data from the site in an automated manner without our permission; (c) attempt to gain unauthorized access to any part of the site or its infrastructure; (d) transmit malware, viruses, or any other malicious code; (e) harass, abuse, or harm other users.`,
      `We reserve the right to remove display names, scores, or accounts that we determine violate these rules or that contain offensive, impersonating, or misleading content.`,
    ],
  },
  {
    id:    "disclaimer",
    title: "7. Disclaimer of Warranties",
    body: [
      `${SITE_NAME} is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components.`,
      `We do not guarantee that daily puzzles will always be available at midnight UTC or that streak data will never be lost due to technical failures. We will make reasonable efforts to maintain service reliability but cannot guarantee it.`,
    ],
  },
  {
    id:    "liability",
    title: "8. Limitation of Liability",
    body: [
      `To the fullest extent permitted by law, Second Monitor Games shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of — or inability to use — the service, even if we have been advised of the possibility of such damages.`,
      `Our total liability to you for any claims arising out of or related to these Terms or your use of the service shall not exceed the amount you paid to us in subscription fees in the twelve months preceding the claim, or $10, whichever is greater.`,
    ],
  },
  {
    id:    "governing",
    title: "9. Governing Law",
    body: [
      `These Terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any disputes arising under these Terms shall be resolved in the state or federal courts located in Delaware, and you consent to personal jurisdiction in those courts.`,
    ],
  },
  {
    id:    "contact",
    title: "10. Contact",
    body: [
      `If you have questions about these Terms, please contact us at ${CONTACT_EMAIL}. We aim to respond within 5 business days.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-20">

        {/* ── Header ──────────────────────────────────────────── */}
        <div
          style={{
            display:       "inline-block",
            background:    "var(--accent-dim)",
            color:         "var(--accent)",
            fontSize:      "11px",
            fontWeight:    700,
            letterSpacing: "0.12em",
            padding:       "4px 12px",
            borderRadius:  "4px",
            textTransform: "uppercase",
            marginBottom:  "20px",
          }}
        >
          Legal
        </div>

        <h1
          style={{
            fontFamily:   "var(--font-dm-serif)",
            color:        "var(--text)",
            fontSize:     "clamp(1.75rem, 4vw, 2.5rem)",
            lineHeight:   1.15,
            marginBottom: "12px",
          }}
        >
          Terms of Service
        </h1>

        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "48px" }}>
          Effective date: {EFFECTIVE_DATE}
        </p>

        {/* ── Sections ────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: "40px" }}>
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2
                style={{
                  color:        "var(--text)",
                  fontSize:     "1.05rem",
                  fontWeight:   700,
                  marginBottom: "14px",
                }}
              >
                {section.title}
              </h2>
              <div className="flex flex-col" style={{ gap: "12px" }}>
                {section.body.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      color:      "var(--text-muted)",
                      fontSize:   "0.9rem",
                      lineHeight: 1.75,
                      margin:     0,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── Divider + back ──────────────────────────────────── */}
        <div
          style={{
            borderTop:  "1px solid var(--border)",
            marginTop:  "56px",
            paddingTop: "24px",
            display:    "flex",
            gap:        "24px",
            fontSize:   "0.85rem",
          }}
        >
          <a href="/privacy" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Privacy Policy →
          </a>
          <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            ← Back to games
          </a>
        </div>

      </div>
    </div>
  );
}

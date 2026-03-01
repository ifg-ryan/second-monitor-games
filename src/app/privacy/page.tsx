import type { Metadata } from "next";

export const metadata: Metadata = {
  title:      "Privacy Policy — Second Monitor Games",
  description: "Privacy Policy for Second Monitor Games. Learn what data we collect, how we use it, and your rights under GDPR and CCPA.",
  alternates: { canonical: "https://secondmonitorgames.com/privacy" },
  robots:     { index: true, follow: true },
};

const EFFECTIVE_DATE = "March 1, 2026";
const CONTACT_EMAIL  = "hello@secondmonitorgames.com";
const SITE_NAME      = "Second Monitor Games";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "12px" }}>
          Effective date: {EFFECTIVE_DATE}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.75, marginBottom: "48px" }}>
          {SITE_NAME} takes your privacy seriously. This policy explains what data we collect,
          why we collect it, who we share it with, and what rights you have over it. We aim to
          collect only what we need to run the service.
        </p>

        {/* ── 1. Information We Collect ───────────────────────── */}
        <section id="collect" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            1. Information We Collect
          </h2>

          <h3 style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>
            Information you provide
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "20px" }}>
            If you create an account, we collect your email address and optionally your name,
            through our authentication provider Clerk. If you choose a display name for
            leaderboards, that name is stored in our database. If you subscribe, Stripe collects
            your payment details — we never see or store your full card number.
          </p>

          <h3 style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>
            Information collected automatically
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "20px" }}>
            When you play games, your results (score, completion status, guess count) may be sent
            to our servers and stored in our database. This is used for leaderboards and aggregate
            statistics. We also collect standard server logs including IP address, browser type,
            and pages visited. These logs are retained for up to 30 days for security and
            debugging purposes.
          </p>

          <h3 style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px" }}>
            Local storage (no account needed)
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75 }}>
            For free play without an account, game data such as your streak, stats, and
            whether you have played today is stored in your browser&apos;s localStorage.
            This data never leaves your device unless you create an account and we sync it.
            Clearing your browser data will erase it.
          </p>
        </section>

        {/* ── 2. Cookies ──────────────────────────────────────── */}
        <section id="cookies" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            2. Cookies and Tracking
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "12px" }}>
            We use a small number of essential cookies to keep you signed in and remember your
            theme preference (dark/light mode). These are strictly necessary and cannot be
            opted out of while using the service.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75 }}>
            The free, ad-supported tier of the site uses Google AdSense, which places advertising
            cookies on your device to show relevant ads. If you prefer not to receive targeted
            ads, you can opt out through Google&apos;s{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              Ad Settings
            </a>
            {" "}or use the opt-out link in our footer. Subscribers see no ads and no advertising
            cookies are set for active subscribers.
          </p>
        </section>

        {/* ── 3. How We Use Your Information ──────────────────── */}
        <section id="use" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            3. How We Use Your Information
          </h2>
          {[
            ["Run the service", "Process your game results, maintain leaderboards, track streaks, and manage subscriptions."],
            ["Communicate with you", "Send transactional emails such as subscription receipts, renewal reminders, and support responses. We do not send marketing emails without your opt-in."],
            ["Improve the service", "Aggregate, anonymised usage data helps us understand which games are popular and identify technical issues."],
            ["Security and fraud prevention", "Server logs and account data are used to detect abuse, cheating, and unauthorized access."],
            ["Legal compliance", "We may process data as required by applicable law, court order, or to protect our legal rights."],
          ].map(([title, body]) => (
            <div key={title} style={{ marginBottom: "16px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>
                <strong style={{ color: "var(--text-dim)" }}>{title}: </strong>
                {body}
              </p>
            </div>
          ))}
        </section>

        {/* ── 4. Third-Party Services ─────────────────────────── */}
        <section id="third-parties" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            4. Third-Party Services
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "20px" }}>
            We use the following third-party services. Each has its own privacy policy governing
            their data practices.
          </p>
          <div
            style={{
              background:   "var(--surface)",
              border:       "1px solid var(--border)",
              borderRadius: "10px",
              overflow:     "hidden",
            }}
          >
            {[
              { name: "Clerk",        purpose: "User authentication and account management.",      link: "https://clerk.com/legal/privacy" },
              { name: "Stripe",       purpose: "Payment processing for subscriptions. We never store card details.", link: "https://stripe.com/privacy" },
              { name: "Neon / PostgreSQL", purpose: "Database hosting for game results, leaderboards, and account data.", link: "https://neon.tech/privacy-policy" },
              { name: "Vercel",       purpose: "Website hosting and deployment. Collects server logs.", link: "https://vercel.com/legal/privacy-policy" },
              { name: "Google AdSense", purpose: "Advertising on the free tier. Sets advertising cookies. Not active for subscribers.", link: "https://policies.google.com/privacy" },
            ].map((row, i, arr) => (
              <div
                key={row.name}
                style={{
                  display:       "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap:           "16px",
                  padding:       "14px 20px",
                  borderBottom:  i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems:    "start",
                }}
              >
                <a
                  href={row.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}
                >
                  {row.name}
                </a>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  {row.purpose}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Data Retention ───────────────────────────────── */}
        <section id="retention" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            5. Data Retention
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "12px" }}>
            We retain your account data and game history for as long as your account is active.
            If you delete your account, we will delete your personal data within 30 days, except
            where we are required to retain it for legal or billing purposes (e.g. subscription
            payment records, which are retained for 7 years as required by tax law).
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75 }}>
            Anonymised, aggregated leaderboard entries (score without personal identifiers)
            may be retained indefinitely for historical statistics.
          </p>
        </section>

        {/* ── 6. Your Rights ──────────────────────────────────── */}
        <section id="rights" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            6. Your Rights
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "16px" }}>
            Depending on where you live, you may have the following rights regarding your personal data:
          </p>
          {[
            ["Access",     "Request a copy of the personal data we hold about you."],
            ["Correction", "Ask us to correct inaccurate or incomplete data."],
            ["Deletion",   "Request that we delete your personal data. You can also delete your account directly from your account settings."],
            ["Portability", "Request your game history and stats in a machine-readable format."],
            ["Objection",  "Object to processing based on legitimate interest, including direct marketing."],
            ["Opt-out of sale (CCPA)", "California residents have the right to opt out of the sale or sharing of personal data for cross-context behavioral advertising. We do not sell your data. To opt out of targeted advertising cookies from Google AdSense, use the opt-out controls in our footer or visit Google's Ad Settings."],
          ].map(([right, desc]) => (
            <div key={right} style={{ marginBottom: "14px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>
                <strong style={{ color: "var(--text-dim)" }}>{right}: </strong>
                {desc}
              </p>
            </div>
          ))}
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75, marginTop: "16px" }}>
            To exercise any of these rights, email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
              {CONTACT_EMAIL}
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        {/* ── 7. Children ─────────────────────────────────────── */}
        <section id="children" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            7. Children&apos;s Privacy
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75 }}>
            {SITE_NAME} is not directed at children under the age of 13. We do not knowingly
            collect personal data from children under 13. If you believe a child under 13 has
            provided us with personal data, please contact us and we will delete it promptly.
          </p>
        </section>

        {/* ── 8. Changes ──────────────────────────────────────── */}
        <section id="changes" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            8. Changes to This Policy
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75 }}>
            We may update this Privacy Policy from time to time. When we do, we will update the
            effective date at the top of the page. For significant changes, we will notify account
            holders by email. Your continued use of the site after changes are posted constitutes
            acceptance of the revised policy.
          </p>
        </section>

        {/* ── 9. Contact ──────────────────────────────────────── */}
        <section id="contact" style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}>
            9. Contact
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.75 }}>
            For privacy questions, data requests, or concerns, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
              {CONTACT_EMAIL}
            </a>
            . We aim to respond within 5 business days.
          </p>
        </section>

        {/* ── Footer links ────────────────────────────────────── */}
        <div
          style={{
            borderTop:  "1px solid var(--border)",
            marginTop:  "16px",
            paddingTop: "24px",
            display:    "flex",
            gap:        "24px",
            fontSize:   "0.85rem",
          }}
        >
          <a href="/terms" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Terms of Service →
          </a>
          <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            ← Back to games
          </a>
        </div>

      </div>
    </div>
  );
}

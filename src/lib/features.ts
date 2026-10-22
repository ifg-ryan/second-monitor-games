// Site feature switches. Flip one and redeploy.

/**
 * Paid subscription (pricing page, subscribe flow, subscription card, archive lock).
 * Off for now: everything plays free, /pricing and /subscribe redirect home, the archive is open.
 * Turn back on to restore it all; the Stripe code and data are untouched.
 */
export const PRICING_ENABLED = false;

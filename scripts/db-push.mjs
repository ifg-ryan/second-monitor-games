// Runs during the Vercel build. On production deploys it applies schema
// changes that only ADD things (new tables, new columns with defaults) to the
// database. Anything that would delete data is refused by Prisma, and this
// script never fails the build: the site keeps working, and the kit APIs
// report "unavailable" until the change is applied.
import { spawnSync } from 'node:child_process';

if (process.env.VERCEL_ENV !== 'production' || !process.env.DATABASE_URL) {
  console.log('[db-push] skipped (not a production build, or no DATABASE_URL)');
  process.exit(0);
}
const r = spawnSync('npx', ['prisma', 'db', 'push'], { stdio: 'inherit', env: process.env });
console.log(r.status === 0 ? '[db-push] schema is up to date' : `[db-push] FAILED (exit ${r.status}); build continues, kit APIs will report unavailable`);
process.exit(0);

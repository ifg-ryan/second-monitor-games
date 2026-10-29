// The signed-in player's achievements across all kit games and the site (server component).
import { prisma } from '@/lib/prisma';
import { KIT_GAMES, kitUrl } from '@/lib/kitGames';
import { SITE_ACHIEVEMENTS } from '@/lib/siteAchievements';
import { achievementXp, levelFor, sumXp } from '@/lib/xp';
import { parseData } from '@/lib/gameSave';

export default async function AchievementsCard({ userId, cardStyle, labelStyle }: { userId: string; cardStyle: React.CSSProperties; labelStyle: React.CSSProperties }) {
  let unlocked = new Set<string>();
  let xp = 0;
  let ok = true;
  // Progress toward count achievements ("hit 100 balls") comes from each game's cloud save.
  const counts = new Map<string, number>();
  try {
    const rows = await prisma.achievement.findMany({ where: { userId }, select: { game: true, key: true } });
    unlocked = new Set(rows.map((r) => `${r.game}:${r.key}`));
    xp = sumXp(rows);
    const saves = await prisma.gameSave.findMany({ where: { userId }, select: { game: true, data: true } }).catch(() => []);
    for (const s of saves) {
      const site = parseData(s.data).site as { counts?: Record<string, unknown> } | undefined;
      for (const [id, n] of Object.entries(site?.counts ?? {})) if (typeof n === 'number') counts.set(`${s.game}:${id}`, n);
    }
  } catch {
    ok = false;
  }
  const lv = levelFor(xp);
  const pct = Math.round((100 * (lv.xp - lv.floor)) / Math.max(1, lv.next - lv.floor));
  const groups = [
    { id: 'site', title: 'Second Monitor Games', icon: '⭐', href: null as string | null, list: SITE_ACHIEVEMENTS.map((a) => ({ ...a, secret: false })) },
    ...KIT_GAMES.map((g) => ({ id: g.id, title: g.title, icon: g.icon ?? '🎮', href: kitUrl(g.id), list: g.achievements.map((a) => ({ ...a, secret: !!a.secret })) })),
  ];
  const total = groups.reduce((n, g) => n + g.list.length, 0);
  const got = groups.reduce((n, g) => n + g.list.filter((a) => unlocked.has(`${g.id}:${a.id}`)).length, 0);

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <span style={labelStyle}>Achievements</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{got} / {total} unlocked</span>
      </div>
      {ok && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.4rem', color: 'var(--text)' }}>Level {lv.level}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>{lv.xp.toLocaleString('en-US')} XP · {(lv.next - lv.xp).toLocaleString('en-US')} to level {lv.level + 1}</span>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden' }} aria-label={`${pct}% of the way to level ${lv.level + 1}`}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)' }} />
          </div>
        </div>
      )}
      {!ok && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Achievements are warming up. Check back soon.</p>}
      <div style={{ display: 'grid', gap: '18px' }}>
        {groups.map((g) => (
          <div key={g.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text)', fontWeight: 600 }}>
              <span>{g.icon}</span>
              {g.href ? <a href={g.href} style={{ color: 'var(--text)' }}>{g.title}</a> : g.title}
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>{g.list.filter((a) => unlocked.has(`${g.id}:${a.id}`)).length}/{g.list.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {g.list.map((a) => {
                const has = unlocked.has(`${g.id}:${a.id}`);
                const hidden = a.secret && !has;
                const goal = 'goal' in a && typeof a.goal === 'number' && a.goal > 1 ? a.goal : 0;
                const count = Math.min(goal, counts.get(`${g.id}:${a.id}`) ?? 0);
                const axp = achievementXp(g.id, a.id);
                return (
                  <div key={a.id} title={hidden ? 'Secret' : a.description} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', opacity: has ? 1 : 0.5 }}>
                    <span style={{ fontSize: '1.2rem' }}>{has ? '🏆' : '🔒'}</span>
                    <span style={{ fontSize: '0.85rem', lineHeight: 1.3, color: 'var(--text)' }}>
                      {hidden ? 'Secret achievement' : a.name}
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{hidden ? 'Keep playing to find it' : a.description}</span>
                      <span style={{ display: 'block', color: has ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>
                        {axp} XP{!has && goal && !hidden ? ` · ${count.toLocaleString('en-US')} / ${goal.toLocaleString('en-US')}` : ''}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

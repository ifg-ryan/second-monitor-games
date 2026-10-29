// Play stats on the lab's Games page: plays, play time, daily players and four health numbers,
// per game and site-wide. Data: the Play table (written by /api/kit/play), read with four groupBy
// queries and summed in src/lib/playStats.ts. Lab testers' plays are left out unless ?lab=1.
import { loadPlayRows } from '@/lib/playData';
import StatsTable from './StatsTable';
import { PERIODS, QUICK_QUIT_SECONDS, dauSeries, duration, pct, periodRange, summarize, type DayRow, type PeriodId, type PlayerDay, type Stats } from '@/lib/playStats';

export interface StatsQuery {
  period: PeriodId;
  lab: boolean;
}

export function readQuery(p: { period?: string; lab?: string }): StatsQuery {
  const period = (PERIODS.find((x) => x.id === p.period)?.id ?? '7d') as PeriodId;
  return { period, lab: p.lab === '1' };
}

type Data = { rows: DayRow[]; playerDays: PlayerDay[]; today: string; range: ReturnType<typeof periodRange> };

export async function loadStats(q: StatsQuery): Promise<Data | null> {
  const data = await loadPlayRows(q.lab);
  if (!data) return null; // table not created yet (it appears on the next production deploy)
  const first = data.rows.reduce<string | null>((m, r) => (m === null || r.day < m ? r.day : m), null);
  return { ...data, range: periodRange(q.period, data.today, first) };
}

/** Period and lab toggles, as links that keep the picked game. */
function Controls({ q, game }: { q: StatsQuery; game: string | null }) {
  const href = (p: Partial<StatsQuery>) => {
    const s = new URLSearchParams();
    if (game) s.set('game', game);
    const period = p.period ?? q.period;
    if (period !== '7d') s.set('period', period);
    if (p.lab ?? q.lab) s.set('lab', '1');
    const qs = s.toString();
    return `/lab/games${qs ? `?${qs}` : ''}`;
  };
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
      {PERIODS.map((p) => (
        <a key={p.id} href={href({ period: p.id })} style={{ ...pill, ...(p.id === q.period ? pillOn : {}) }}>{p.label}</a>
      ))}
      <a href={href({ lab: !q.lab })} style={{ ...pill, marginLeft: '8px', ...(q.lab ? pillOn : {}) }} title="Plays by people logged in to the lab">
        {q.lab ? '✓ ' : ''}Include tester plays
      </a>
    </div>
  );
}

const unavailable = () => <p style={muted}>Play stats start once the site deploys with the Play table. Numbers appear as people play.</p>;

/** Site-wide numbers, the daily players chart and the per-game table. */
export async function StatsOverview({ q, games }: { q: StatsQuery; games: { id: string; title: string; version: string; linked: boolean }[] }) {
  const data = await loadStats(q);
  const site = data && summarize(data.rows, data.playerDays, data.range, null);
  const todayDau = data && summarize(data.rows, data.playerDays, periodRange('today', data.today, null), null).players;
  const ids = new Set(games.map((g) => g.id));
  const extra = data ? [...new Set(data.rows.map((r) => r.game))].filter((id) => !ids.has(id)).map((id) => ({ id, title: id, version: '', linked: false })) : [];
  const list = [...games, ...extra].map((g) => ({ ...g, s: data ? summarize(data.rows, data.playerDays, data.range, g.id) : null }));

  return (
    <section style={{ marginTop: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ ...h2, margin: 0 }}>Play stats</h2>
        <Controls q={q} game={null} />
      </div>
      {!data || !site ? unavailable() : (
        <>
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', margin: '16px 0 18px' }}>
            <Tile n={todayDau ?? 0} label="players today" />
            <Tile n={site.avgDau.toFixed(1)} label="avg daily players" />
            <Tile n={site.plays} label="plays" />
            <Tile n={duration(site.seconds)} label="total play time" />
            <Tile n={duration(site.avgSeconds)} label="avg per play" />
          </div>
          <DauChart series={dauSeries(data.playerDays, data.today, 30)} />
        </>
      )}
      <StatsTable columns={COLUMNS} rows={list.map((g) => ({ id: g.id, title: g.title, linked: g.linked, version: g.version, cells: cells(g.s) }))} />
    </section>
  );
}

/** One game's numbers, at the top of its page. */
export async function GameStats({ q, game }: { q: StatsQuery; game: string }) {
  const data = await loadStats(q);
  const s = data && summarize(data.rows, data.playerDays, data.range, game);
  return (
    <section style={{ ...card, margin: '0 0 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <b style={{ fontSize: '0.85rem' }}>Play stats</b>
        <Controls q={q} game={game} />
      </div>
      {!s ? unavailable() : (
        <div style={{ display: 'flex', gap: '26px', flexWrap: 'wrap', marginTop: '12px' }}>
          <Tile n={s.plays} label="plays" />
          <Tile n={duration(s.seconds)} label="total play time" />
          <Tile n={s.avgDau.toFixed(1)} label="avg daily players" />
          <Tile n={duration(s.avgSeconds)} label="avg per play" />
          <Tile n={pct(s.finished)} label="finished a run" />
          <Tile n={pct(s.quickQuits)} label={`quit in under ${QUICK_QUIT_SECONDS}s`} />
          <Tile n={s.playsPerPlayer === null ? '–' : s.playsPerPlayer.toFixed(1)} label="plays per player" />
          <Tile n={pct(s.returning)} label="came back another day" />
        </div>
      )}
    </section>
  );
}

const COLUMNS = [
  { label: 'Plays', tip: 'A play starts at the first key, click or touch' },
  { label: 'Play time', tip: 'Active time only: tab visible, player did something in the last minute' },
  { label: 'Avg DAU', tip: 'Average daily players over the period' },
  { label: 'Avg play', tip: 'Average active time per play' },
  { label: 'Finished', tip: 'Plays that reached a game over or posted a score' },
  { label: 'Quick quits', tip: `Plays under ${QUICK_QUIT_SECONDS} seconds` },
  { label: 'Plays/player', tip: 'Replay pull' },
  { label: 'Returning', tip: 'Players in the period who have played on more than one day' },
];

function cells(s: Stats | null): { text: string; value: number | null }[] {
  if (!s || !s.plays) return COLUMNS.map(() => ({ text: '–', value: null }));
  const n = (v: number | null, text: string) => ({ text: v === null ? '–' : text, value: v });
  return [
    n(s.plays, s.plays.toLocaleString()),
    n(s.seconds, duration(s.seconds)),
    n(s.avgDau, s.avgDau.toFixed(1)),
    n(s.avgSeconds, duration(s.avgSeconds)),
    n(s.finished, pct(s.finished)),
    n(s.quickQuits, pct(s.quickQuits)),
    n(s.playsPerPlayer, s.playsPerPlayer?.toFixed(1) ?? ''),
    n(s.returning, pct(s.returning)),
  ];
}

/** Daily players, last 30 days: one bar a day, hover for the number. */
function DauChart({ series }: { series: { day: string; players: number }[] }) {
  const max = Math.max(1, ...series.map((d) => d.players));
  const label = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return (
    <figure style={{ ...card, margin: 0 }}>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '10px' }}>
        <b>Daily players, last 30 days</b>
        <span style={muted}>peak {max}</span>
      </figcaption>
      <div role="img" aria-label={`Daily players for the last 30 days, peak ${max}`} style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '90px', borderBottom: '1px solid var(--border)' }}>
        {series.map((d) => (
          <div key={d.day} title={`${label(d.day)}: ${d.players} player${d.players === 1 ? '' : 's'}`} className="dau-col" style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', cursor: 'default' }}>
            <div style={{ width: '100%', height: `${(d.players / max) * 100}%`, minHeight: d.players ? '2px' : 0, background: 'var(--accent)', borderRadius: '4px 4px 0 0' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...muted, marginTop: '6px' }}>
        <span>{label(series[0].day)}</span>
        <span>Today</span>
      </div>
    </figure>
  );
}

function Tile({ n, label }: { n: number | string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{typeof n === 'number' ? n.toLocaleString() : n}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

const h2 = { fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px' } as const;
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' } as const;
const muted = { fontSize: '0.75rem', color: 'var(--text-muted)' } as const;
const pill = { fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: '999px', padding: '4px 11px', color: 'var(--text-dim)', textDecoration: 'none' } as const;
const pillOn = { borderColor: 'var(--accent)', color: 'var(--text)', background: 'color-mix(in srgb, var(--accent) 14%, transparent)' } as const;

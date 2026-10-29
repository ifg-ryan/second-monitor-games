// The lab's Games page: pick a game to see the kit pieces it is built from, every version shipped
// with its build notes, changes not shipped yet, and its lab activity (tester notes, GDD builds).
// Data: lab-data/game-history.json (claude-games scripts/lab-history.mjs, on every ship),
// lab-data/kit-catalog.json (scripts/lab-catalog.mjs), and the Feedback and GameBuild tables.
import type { Metadata } from 'next';
import { isTester } from '@/lib/lab';
import { prisma } from '@/lib/prisma';
import { KIT_GAMES } from '@/lib/kitGames';
import history from '../../../../lab-data/game-history.json';
import catalog from '../../../../lab-data/kit-catalog.json';
import LabLogin from '../LabLogin';
import LabNav from '@/components/lab/LabNav';
import GamePicker from './GamePicker';
import { StatsOverview, GameStats, readQuery, type StatsQuery } from './PlayStats';
import { SITE_GAMES } from '@/lib/playStats';

export const metadata: Metadata = { title: 'Games', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Note = { sha: string; date: string; subject: string; body?: string };
type Version = { version: number; source: string; date: string; notes: Note[] };
type GameHistory = { created: string | null; versions: Version[]; unreleased: Note[] };
type Piece = { id: string; name: string; category: string; module: string; what: string; usedBy: string[] };

const HISTORY = (history as unknown as { games: Record<string, GameHistory> }).games;
const CAT = catalog as unknown as { categories: { id: string; name: string }[]; modules: { id: string; title: string; summary: string }[]; pieces: Piece[]; games: { id: string; name: string; uses: string[] }[] };
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const time = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const live = (id: string) => KIT_GAMES.find((g) => g.id === id);
const titleOf = (id: string) => live(id)?.title ?? CAT.games.find((g) => g.id === id)?.name ?? id;

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ game?: string; period?: string; lab?: string }> }) {
  if (!(await isTester())) return <main style={wrap}><LabLogin /></main>;
  const ids = Object.keys(HISTORY).sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
  const options = ids.map((id) => ({ id, title: titleOf(id), versions: HISTORY[id].versions.length }));
  const sp = await searchParams;
  const pick = sp.game;
  const q = readQuery(sp);
  const id = pick && HISTORY[pick] ? pick : null;

  return (
    <main style={wrap}>
      <LabNav />
      <GamePicker options={options} value={id} />
      {id ? <Game id={id} q={q} /> : <Overview ids={ids} q={q} />}
    </main>
  );
}

function Overview({ ids, q }: { ids: string[]; q: StatsQuery }) {
  const games = [
    ...ids.map((id) => {
      const v = HISTORY[id].versions[0];
      return { id, title: titleOf(id), linked: true, version: v ? `v${v.version}` : HISTORY[id].unreleased.length ? 'not shipped' : '' };
    }),
    ...Object.entries(SITE_GAMES).map(([id, title]) => ({ id, title, linked: false, version: 'older site game' })),
  ];
  return <StatsOverview q={q} games={games} />;
}

async function Game({ id, q }: { id: string; q: StatsQuery }) {
  const h = HISTORY[id];
  const site = live(id);
  const modules = CAT.games.find((g) => g.id === id)?.uses ?? [];
  const pieces = CAT.pieces.filter((p) => p.usedBy.includes(id) && p.category !== 'candidate');
  const own = CAT.pieces.filter((p) => p.category === 'candidate' && p.module === id);
  const byCat = CAT.categories.map((c) => ({ ...c, pieces: pieces.filter((p) => p.category === c.id) })).filter((c) => c.pieces.length);
  const [feedback, builds] = await Promise.all([
    prisma.feedback.findMany({ where: { game: id }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, text: true, heard: true, note: true, status: true, createdAt: true } }).catch(() => []),
    prisma.gameBuild.findMany({ where: { slug: id }, select: { id: true, title: true, status: true, versions: true } }).catch(() => []),
  ]);
  const latest = h.versions[0];

  return (
    <div style={{ marginTop: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2rem', fontWeight: 400, margin: 0 }}>{titleOf(id)}</h1>
        {site && <a href={`/play/${id}`} style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>Play live ↗</a>}
        <a href={`/lab?game=${id}`} className="nav-link-muted" style={{ fontSize: '0.85rem' }}>Give feedback</a>
      </div>
      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', margin: '14px 0 22px' }}>
        <Stat n={latest ? `v${latest.version}` : 'none'} label={latest ? `live since ${day(latest.date)}` : 'not shipped yet'} />
        <Stat n={pieces.length} label="kit pieces used" />
        <Stat n={modules.length} label="kit modules" />
        <Stat n={h.versions.reduce((n, v) => n + v.notes.length, 0) + h.unreleased.length} label="changes recorded" />
        {h.created && <Stat n={day(h.created)} label="first built" />}
      </div>

      <GameStats q={q} game={id} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <section>
          <h2 style={h2}>Version history</h2>
          {h.unreleased.length > 0 && (
            <div style={{ ...card, borderColor: 'var(--accent)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <b>Not shipped yet</b>
                <span style={muted}>{h.unreleased.length} change{h.unreleased.length > 1 ? 's' : ''} in the kit, waiting for the next ship</span>
              </div>
              <Notes notes={h.unreleased} />
            </div>
          )}
          {h.versions.map((v) => (
            <div key={v.source} style={{ ...card, marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                <b>Version {v.version}{v === latest ? <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '4px', padding: '1px 6px', verticalAlign: 'middle' }}>LIVE</span> : null}</b>
                <span style={muted}>{time(v.date)} · <code>{v.source}</code></span>
              </div>
              {v.notes.length ? <Notes notes={v.notes} /> : <p style={{ ...muted, margin: '8px 0 0' }}>Re-shipped with no game changes (kit or site updates only).</p>}
            </div>
          ))}
          {!h.versions.length && !h.unreleased.length && <p style={muted}>No history yet.</p>}
        </section>

        <section>
          <h2 style={h2}>Built from the kit</h2>
          <div style={{ ...card, marginBottom: '12px' }}>
            <b style={{ fontSize: '0.85rem' }}>Modules</b>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {modules.map((m) => (
                <span key={m} title={CAT.modules.find((x) => x.id === m)?.summary} style={chip}>{CAT.modules.find((x) => x.id === m)?.title ?? m}</span>
              ))}
            </div>
          </div>
          {byCat.map((c) => (
            <div key={c.id} style={{ ...card, marginBottom: '12px' }}>
              <b style={{ fontSize: '0.85rem' }}>{c.name} <span style={muted}>{c.pieces.length}</span></b>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
                {c.pieces.map((p) => (
                  <li key={p.id} style={{ padding: '5px 0', borderTop: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    <a href={`/lab/kit?q=${encodeURIComponent(p.name)}`} style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>{p.name}</a>
                    <span style={{ color: 'var(--text-dim)' }}> · {p.what.length > 110 ? `${p.what.slice(0, 107)}…` : p.what}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {own.length > 0 && (
            <div style={{ ...card, marginBottom: '12px' }}>
              <b style={{ fontSize: '0.85rem' }}>Inside this game, could join the kit <span style={muted}>{own.length}</span></b>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
                {own.map((p) => <li key={p.id} style={{ padding: '5px 0', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}><b>{p.name}</b><span style={{ color: 'var(--text-dim)' }}> · {p.what}</span></li>)}
              </ul>
            </div>
          )}

          {(feedback.length > 0 || builds.length > 0) && <h2 style={{ ...h2, marginTop: '28px' }}>Lab activity</h2>}
          {builds.map((b: { id: string; title: string; status: string; versions: number }) => (
            <a key={b.id} href={`/lab/builds/${b.id}`} style={{ ...card, display: 'block', marginBottom: '12px', textDecoration: 'none', color: 'var(--text)' }}>
              <b>Built from a GDD</b> <span style={muted}>· {b.versions} lab version{b.versions === 1 ? '' : 's'} · {b.status}</span>
            </a>
          ))}
          {feedback.length > 0 && (
            <div style={card}>
              <b style={{ fontSize: '0.85rem' }}>Tester notes <span style={muted}>{feedback.length}</span></b>
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
                {feedback.map((f: { id: string; text: string; heard: string | null; note: string | null; status: string; createdAt: Date }) => (
                  <li key={f.id} style={{ padding: '6px 0', borderTop: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.45 }}>
                    <span style={muted}>{day(String(f.createdAt))} · {f.status}</span>
                    <div>{f.heard ?? (f.text || 'Voice note')}</div>
                    {f.note && <div style={{ color: 'var(--text-dim)' }}>{f.note}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Notes({ notes }: { notes: Note[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
      {notes.map((n) => (
        <li key={n.sha} style={{ padding: '7px 0', borderTop: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.45 }}>
          <div style={{ fontWeight: 600 }}>{n.subject}</div>
          {n.body && (
            <details>
              <summary style={{ ...muted, cursor: 'pointer' }}>Build notes</summary>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-dim)', marginTop: '4px' }}>{n.body}</div>
            </details>
          )}
          <div style={muted}>{time(n.date)} · <code>{n.sha}</code></div>
        </li>
      ))}
    </ul>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>{n}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

const wrap = { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 80px' } as const;
const h2 = { fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px' } as const;
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' } as const;
const muted = { fontSize: '0.75rem', color: 'var(--text-muted)' } as const;
const chip = { fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px', color: 'var(--text-dim)' } as const;

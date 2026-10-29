// How to use the tester lab: setup, giving feedback, Push, Review, Push to live site, Undo.
// Open to anyone with the link (not linked from the public site) so a new tester can read it first.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import LabNav from '@/components/lab/LabNav';

export const metadata: Metadata = { title: 'Tester Lab guide', robots: { index: false, follow: false } };

const Shot = ({ src, alt, small }: { src: string; alt: string; small?: boolean }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/lab-guide/${src}`} alt={alt} style={{ display: 'block', width: small ? 'min(420px, 100%)' : '100%', borderRadius: '10px', border: '1px solid var(--border)', margin: '14px 0 22px' }} />
);
const H2 = ({ children }: { children: ReactNode }) => <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: '48px 0 12px', fontWeight: 400 }}>{children}</h2>;
const P = ({ children }: { children: ReactNode }) => <p style={{ margin: '0 0 12px' }}>{children}</p>;
const ol = { listStyle: 'decimal', paddingLeft: '24px', margin: '0 0 12px' } as const;
const ul = { listStyle: 'disc', paddingLeft: '24px', margin: '0 0 12px' } as const;
const cell = { border: '1px solid var(--border)', padding: '8px 10px', verticalAlign: 'top' } as const;

export default function LabGuide() {
  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 100px', color: 'var(--text)' }}>
      <LabNav />
      <div style={{ maxWidth: '760px', lineHeight: 1.6, fontSize: '1rem' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '0 0 8px', fontWeight: 400 }}>Lab guide</h1>
      <P>The lab is where game designers work with Claude on Second Monitor Games. Its sections are the tabs along the top of every lab page:</P>
      <ul style={ul}>
        <li><b>Feedback</b>: notes on any of our games. Claude makes the change, you test it, and push it live (sections 1 to 7).</li>
        <li><b>Games</b>: play stats for every game, and for each game the Kit pieces it&apos;s built from and every version with its build notes (section 8).</li>
        <li><b>Create Game</b>: upload a GDD and get a playable game back to test and refine (sections 9 and 10).</li>
        <li><b>Kit</b>: every reusable piece games are built from, searchable (section 11).</li>
        <li><b>Guide</b>: this page.</li>
      </ul>
      <P>For feedback: talk or type notes while you play, and Claude turns them into a playable test build in about 10 to 15 minutes. Nothing reaches the live site until a tester tries that build and pushes it live.</P>
      <Loop />

      <H2>1. One-time setup</H2>
      <ol style={ol}>
        <li>Go to <a href="/lab" style={{ color: 'var(--accent)' }}>secondmonitorgames.com/lab</a>. It isn&apos;t linked anywhere on the site.</li>
        <li>Type the lab passcode and press <b>Enter</b>.</li>
        <li>That&apos;s it: this browser stays in for 90 days. <b>Sign out</b>, top right of every lab page, turns it off.</li>
      </ol>
      <Shot src="01-passcode.png" alt="The lab passcode screen" small />
      <P>Use Chrome, Edge or Safari. Recording works in all three; Firefox can still type and upload notes. You can read this guide without the passcode, so it&apos;s fine to send the link to a new tester first.</P>

      <H2>2. Giving feedback while you play</H2>
      <P>Open any game on the site. Once you&apos;re in the lab, an orange <b>🎙 Feedback</b> button sits in the bar above the game. (It isn&apos;t on the Pop out window, which shows the game on its own.)</P>
      <Shot src="02-feedback-button.png" alt="The Feedback button above a game" />
      <ol style={ol}>
        <li><b>Press Feedback.</b> A panel opens in the bottom right and starts recording right away. The first time, allow the microphone.</li>
        <li><b>Talk.</b> Think out loud, ramble, restart sentences. Claude sorts out the points later. Up to 10 minutes.</li>
      </ol>
      <Shot src="03-recording.png" alt="Recording, with the timer on the Stop button" small />
      <ol start={3} style={ol}>
        <li><b>Press Stop.</b> Play the clip back, or delete it with × and record again.</li>
        <li><b>Add writing if you like.</b> Type in Notes, or press <b>Upload</b> to add a .txt or .md file of notes.</li>
      </ol>
      <Shot src="04-ready-to-send.png" alt="A recording and a typed note, ready to send" small />
      <ol start={5} style={ol}>
        <li><b>Press Send.</b> The note goes to the lab with the game, the build and how far into the session you were. Keep playing.</li>
      </ol>
      <P>You can also add notes from the <b>Feedback</b> tab itself: pick the game at the top, then record, type or upload. <b>Give feedback</b> on a game&apos;s page in the Games tab opens this with that game already picked.</P>
      <Shot src="05-lab-add-note.png" alt="Adding a note in the lab" />

      <H2>3. Sending notes to Claude: Inbox and Push</H2>
      <P>Notes wait in the <b>Inbox</b> until someone presses Push. Nothing changes in any game until then.</P>
      <Shot src="06-inbox.png" alt="The Inbox and the Push button" />
      <ul style={ul}>
        <li>New notes arrive ticked. Untick any to hold back.</li>
        <li>Click a note&apos;s text to edit it. × sets it aside.</li>
        <li><b>Push</b> sends every ticked note to Claude in one batch. Notes for different games can go together.</li>
      </ul>

      <H2>4. While Claude works: In progress and Stop</H2>
      <P>A batch takes about 10 to 15 minutes: recordings are transcribed, Claude makes the changes, the Kit&apos;s checks run, and a test build of each changed game goes up. Live games are untouched.</P>
      <Shot src="07-in-progress.png" alt="A note in progress with Stop" />
      <P><b>Stop</b> cancels the run and returns the note to the Inbox marked &quot;Stopped&quot;. Use it if a run is stuck or was pushed by mistake. <b>Stop all</b> appears when more than one note is running.</P>

      <H2>5. Testing the change and pushing it live</H2>
      <P>When the test build is up, the batch moves to <b>Review</b>: what the tester said, what <b>Claude heard</b>, what it <b>Changed</b>, and a link to test it.</P>
      <Shot src="08-review.png" alt="A batch in Review" />
      <P><b>Test the preview</b> (or <b>Try</b>) opens the test build page: the new version, with the change list above it. Test builds never post to the real leaderboards.</P>
      <Shot src="09a-test-build.png" alt="The test build page" />
      <P><b>Happy with it?</b> Tick <b>Are you sure?</b>, then press <b>Push to live site</b>. Anyone with the lab passcode can do this. After a few minutes the bar shows <b>Live now: play it</b>. This takes the whole batch live; if it changed other games too, the checkbox names them.</P>
      <Shot src="09b-push-live.png" alt="Are you sure? ticked, Push to live site ready" />
      <P><b>Not right?</b> In the lab, press <b>Send back</b> and say what should change. The test build is thrown away and the notes return to the Inbox with your comment, so the next Push tells Claude what was wrong. <b>Approve</b> in the lab is the same as Push to live site.</P>
      <P>If someone changed the same game since the test build was made, the push can&apos;t go through: the batch stays in Review with a note saying so. Press <b>Send back</b> and push again, and Claude redoes the change on top of the latest version.</P>

      <H2>6. Live changes and Undo</H2>
      <Shot src="10-live.png" alt="A live batch with Play and Undo" />
      <P>Live changes are grouped by push, each with a <b>Play it live</b> link once the site has updated. <b>Undo</b> reverts that whole push and re-ships the games as they were; if later changes touched the same code, the note says so and Undo has to be done by hand. Every change is also kept in the Kit&apos;s history on GitHub, so nothing is lost.</P>

      <H2>7. Set aside and troubleshooting</H2>
      <P><b>Set aside</b> holds notes you set aside, notes Claude skipped (with the reason) and undone pushes. <b>Back to inbox</b> returns one.</P>
      <Shot src="11-set-aside.png" alt="Set aside with a skipped note" />
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem', margin: '8px 0 20px' }}>
        <thead><tr><th style={cell}>What you see</th><th style={cell}>What to do</th></tr></thead>
        <tbody>
          <tr><td style={cell}>No Feedback button on a game</td><td style={cell}>Enter the passcode at /lab, then reload the game</td></tr>
          <tr><td style={cell}>&quot;Microphone blocked&quot;</td><td style={cell}>Allow the microphone in the address bar, then press Record</td></tr>
          <tr><td style={cell}>Note stuck in In progress</td><td style={cell}>Runs take up to about 15 minutes. Longer than that: press Stop, then push again</td></tr>
          <tr><td style={cell}>Note back in the Inbox in red</td><td style={cell}>Read the reason, edit the note if needed, push again</td></tr>
          <tr><td style={cell}>&quot;The change broke the kit checks&quot;</td><td style={cell}>Push again, or reword the note more specifically</td></tr>
          <tr><td style={cell}>Live link not showing yet</td><td style={cell}>The site is still updating; refresh in a few minutes</td></tr>
          <tr><td style={cell}>&quot;Someone changed the same game code&quot;</td><td style={cell}>Send back, then push again (section 5)</td></tr>
        </tbody>
      </table>
      <P>Each Push runs Claude on Ryan&apos;s account, capped at $5 a feedback push, $20 a Create Game push, and $200 a month. Send back and Stop cost almost nothing.</P>

      <H2>8. Games</H2>
      <P>The <b>Games</b> tab opens on <b>Play stats</b> for the whole site: players today, average daily players, plays and play time, a chart of daily players over the last 30 days, and a table of every game you can sort by any column (plays, play time, finished runs, quick quits, plays per player, returning players). Hover a column name for what it counts. Choose today, 7 days, 30 days or all time at the top. Plays by people signed in to the lab are left out unless you press <b>Include tester plays</b>, so testing doesn&apos;t skew the numbers.</P>
      <P>Pick a game from the dropdown to see its own play stats, plus:</P>
      <ul style={ul}>
        <li><b>Version history</b>: every version that went live, newest first, with the date. Under each are the changes made since the version before, and <b>Build notes</b> opens the full note on a change. Changes made but not shipped yet sit at the top under <b>Not shipped yet</b>.</li>
        <li><b>Built from the Kit</b>: the Kit modules and every Kit piece the game uses, by category. Click a piece to open it in the Kit tab. Systems built only for this game that could join the Kit are listed too.</li>
        <li><b>Lab activity</b>: tester notes on the game and any Create Game build it came from.</li>
      </ul>
      <Shot src="16-games.png" alt="A game in the Games tab: version history with build notes, and the Kit pieces it uses" />
      <P>A new version is added automatically every time a game ships, from the Feedback tab, Create Game or Ryan&apos;s own work.</P>

      <H2>9. Create Game: a new game from a GDD</H2>
      <P>Under <b>Create Game</b>, drop in a game design document (PDF, Word, Markdown or text, up to 3 MB), give the game a title, and add any notes for Claude: a look to use, what to build first, what to leave out. Press <b>Upload</b>.</P>
      <Shot src="13-new-games.png" alt="Create Game: upload a GDD, and the list of games with their status" />
      <P>On the game&apos;s page, press <b>Push to Claude</b>. Claude reads the GDD, maps every system it needs to pieces already in the Kit, builds the game from those pieces, and moves anything new and reusable back into the Kit. A first build usually takes 20 to 45 minutes; the page updates by itself, and <b>Stop</b> cancels it. A scanned PDF has no text for Claude to read, so use a text PDF or a Word file.</P>
      <P>When it&apos;s done, the page shows:</P>
      <ul style={ul}>
        <li><b>The test build</b>, playable right on the page (or <b>Open full window</b>). Test builds never post to the real leaderboards.</li>
        <li><b>What&apos;s in this version</b>, and what isn&apos;t built yet.</li>
        <li><b>Kit reuse</b>: how many Kit pieces it reused, how many new pieces it added to the Kit, and how many lines of game code it took. <b>Claude&apos;s kit plan</b> lists each system in the GDD and the Kit piece that covers it.</li>
        <li><b>History</b> of every upload, push and version.</li>
      </ul>
      <Shot src="14-build-page.png" alt="A new game's page: the test build, Ask for changes, Kit reuse and History" />
      <P><b>Not there yet?</b> Write what should change under <b>Ask for changes</b> and press <b>Push changes to Claude</b>. Each push makes a new version on top of the last, with the GDD still the reference. Repeat as often as you like.</P>
      <P><b>Happy with it?</b> Press <b>Send to power user</b>. The game waits for a power user to publish it. <b>Delete this game</b>, at the bottom, removes a game that isn&apos;t live.</P>

      <H2>10. Power users: publishing a new game</H2>
      <P>Power users sign in to the lab with the power-user passcode (Ryan sets it as <code>LAB_POWER_PASSCODE</code>). They see a <b>POWER USER</b> badge, and on a game waiting for them, a <b>Publish to live site</b> button behind an <b>Are you sure?</b> checkbox.</P>
      <Shot src="15-publish.png" alt="A game waiting for a power user, with Publish to live site" />
      <P>Publishing merges the game&apos;s code (and anything it added to the Kit) into the Kit, then ships the game to the site with a front-page card, a leaderboard and achievements. It takes a few minutes; the page then shows <b>Play it live</b>. Anyone can still <b>Withdraw the request</b> or ask for more changes before it&apos;s published. If the Kit changed in the same places since the version was built, publishing stops with a note: ask for a small change to rebuild it on the latest Kit, then publish again. Once live, the game appears in the Games tab like every other game.</P>

      <H2>11. The Kit</H2>
      <P>Every game is built from the Kit: shared pieces for the game loop, screens, input, cameras, waves, cards, words, scoring, effects, sound and art looks. The more games we build, the more pieces the Kit has, and the less new code each game needs.</P>
      <Shot src="12-kit.png" alt="The Kit browser, searching for waves" />
      <ul style={ul}>
        <li><b>Search</b> by what you need (&quot;waves&quot;, &quot;deck&quot;, &quot;tower defense&quot;) or filter by category.</li>
        <li><b>Click a piece</b> for when to use it, what it&apos;s good for, which games use it, and a short code example.</li>
        <li>Below the pieces: the <b>starter templates</b>, the <b>modules</b>, and which modules each game uses (the Games tab has the full breakdown per game).</li>
        <li><b>Art</b> shows every art look and art pack as pictures. Pick Looks or a library style (pixel, retro, illustrated...), click a card for a large view with its colours, type and the games using it, and use the arrow keys to flip through.</li>
        <li><b>Still inside a game</b> lists systems built for one game that the next game could pull into the Kit.</li>
      </ul>
      <P>Writing a GDD with the Kit in mind (naming a look, or a system the Kit already has) makes builds faster and cheaper. The Kit list updates every time a game ships.</P>
      </div>
    </main>
  );
}

/** The feedback loop, drawn in the site's theme colours so it reads in light and dark. */
function Loop() {
  const ink = 'var(--text)', quiet = 'var(--text-muted)', line = 'var(--text-dim)', accent = 'var(--accent)';
  const box = (x: number, y: number, name: string, sub: string, hot = false) => (
    <g>
      <rect x={x} y={y} width="150" height="60" rx="8" fill={hot ? accent : 'none'} fillOpacity={hot ? 0.15 : 1} stroke={hot ? accent : line} strokeWidth={hot ? 2 : 1.25} />
      <text x={x + 75} y={y + 26} textAnchor="middle" fontWeight="600" fill={ink}>{name}</text>
      <text x={x + 75} y={y + 45} textAnchor="middle" fontSize="11.5" fill={hot ? ink : quiet}>{sub}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 760 330" role="img" aria-label="Record a note, Inbox, Claude works, Test build, then Push to live site; Send back loops to the Inbox and Undo puts the old version back" style={{ width: '100%', margin: '16px 0', fontFamily: 'inherit' }} fontSize="13">
      <defs>
        <marker id="loop-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={line} />
        </marker>
      </defs>
      <text x="24" y="30" fontSize="15" fontWeight="600" fill={ink}>Nothing reaches the live site until a tester pushes the test build</text>
      <g fill="none" stroke={line} strokeWidth="1.25">
        <path d="M174 140H198" markerEnd="url(#loop-arrow)" />
        <path d="M348 140H372" markerEnd="url(#loop-arrow)" />
        <path d="M522 140H566" markerEnd="url(#loop-arrow)" />
        <path d="M641 170V232" markerEnd="url(#loop-arrow)" />
        <path d="M641 110V72H273V110" markerEnd="url(#loop-arrow)" />
      </g>
      {box(24, 110, 'Record a note', 'voice, typing or a file')}
      {box(198, 110, 'Inbox', 'pick notes, press Push')}
      {box(372, 110, 'Claude works', 'about 10 minutes')}
      {box(566, 110, 'Test build', 'play it, check it')}
      {box(566, 232, 'Live site', 'everyone plays it', true)}
      <g fontSize="11.5" fill={quiet}>
        <text x="457" y="64" textAnchor="middle">Send back, with a comment</text>
        <text x="629" y="205" textAnchor="end">Are you sure? + Push to live site</text>
        <text x="550" y="266" textAnchor="end">Undo puts the old version back</text>
      </g>
    </svg>
  );
}

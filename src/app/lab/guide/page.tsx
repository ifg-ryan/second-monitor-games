// How to use the tester lab: setup, giving feedback, Push, Review, Push to live site, Undo.
// Open to anyone with the link (not linked from the public site) so a new tester can read it first.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Tester Lab guide', robots: { index: false, follow: false } };

const Shot = ({ src, alt, small }: { src: string; alt: string; small?: boolean }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/lab-guide/${src}`} alt={alt} style={{ display: 'block', width: small ? 'min(420px, 100%)' : '100%', borderRadius: '10px', border: '1px solid var(--border)', margin: '14px 0 22px' }} />
);
const H2 = ({ children }: { children: ReactNode }) => <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.6rem', margin: '48px 0 12px', fontWeight: 400 }}>{children}</h2>;
const P = ({ children }: { children: ReactNode }) => <p style={{ margin: '0 0 12px' }}>{children}</p>;
const ol = { listStyle: 'decimal', paddingLeft: '24px', margin: '0 0 12px' } as const;
const ul = { listStyle: 'disc', paddingLeft: '24px', margin: '0 0 12px' } as const;
const cell = { border: '1px solid var(--border)', padding: '8px 10px', verticalAlign: 'top' } as const;

export default function LabGuide() {
  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 20px 100px', lineHeight: 1.6, fontSize: '1rem', color: 'var(--text)' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2.4rem', margin: '0 0 8px', fontWeight: 400 }}>Tester Lab guide</h1>
      <P>Talk or type notes while you play. Claude turns them into a playable test build in about 10 minutes. Nothing reaches the live site until a tester tries that build and pushes it live.</P>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/lab-guide/loop.svg" alt="Record a note, Inbox, Claude works, Test build, then Push to live site; Send back loops to the Inbox and Undo puts the old version back" style={{ width: '100%', margin: '16px 0' }} />

      <H2>1. One-time setup</H2>
      <ol style={ol}>
        <li>Go to <a href="/lab" style={{ color: 'var(--accent)' }}>secondmonitorgames.com/lab</a>. It isn&apos;t linked anywhere on the site.</li>
        <li>Type the lab passcode and press <b>Enter</b>.</li>
        <li>That&apos;s it: this browser stays in for 90 days. <b>Sign out</b>, top right of the lab, turns it off.</li>
      </ol>
      <Shot src="01-passcode.png" alt="The lab passcode screen" small />
      <P>Use Chrome, Edge or Safari. Recording works in all three; Firefox can still type and upload notes.</P>

      <H2>2. Giving feedback while you play</H2>
      <P>Open any game. Once you&apos;re in the lab, an orange <b>🎙 Feedback</b> button sits in the bar above the game.</P>
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
      <P>You can also add notes from the lab itself: pick the game at the top, then record, type or upload.</P>
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
      <P>A batch takes about 10 minutes: recordings are transcribed, Claude makes the changes, the Kit&apos;s checks run, and a test build of each changed game goes up. Live games are untouched.</P>
      <Shot src="07-in-progress.png" alt="A note in progress with Stop" />
      <P><b>Stop</b> cancels the run and returns the note to the Inbox. Use it if a run is stuck or was pushed by mistake.</P>

      <H2>5. Testing the change and pushing it live</H2>
      <P>When the test build is up, the batch moves to <b>Review</b>: what the tester said, what <b>Claude heard</b>, what it <b>Changed</b>, and a link to test it.</P>
      <Shot src="08-review.png" alt="A batch in Review" />
      <P><b>Test the preview</b> (or <b>Try</b>) opens the test build page: the new version, with the change list above it. Test builds never post to the real leaderboards.</P>
      <Shot src="09a-test-build.png" alt="The test build page" />
      <P><b>Happy with it?</b> Tick <b>Are you sure?</b>, then press <b>Push to live site</b>. Anyone with the lab passcode can do this. After a few minutes the bar shows <b>Live now: play it</b>. This takes the whole batch live; if it changed other games too, the checkbox names them.</P>
      <Shot src="09b-push-live.png" alt="Are you sure? ticked, Push to live site ready" />
      <P><b>Not right?</b> In the lab, press <b>Send back</b> and say what should change. The test build is thrown away and the notes return to the Inbox with your comment, so the next Push tells Claude what was wrong. <b>Approve</b> in the lab is the same as Push to live site.</P>

      <H2>6. Live changes and Undo</H2>
      <Shot src="10-live.png" alt="A live batch with Play and Undo" />
      <P><b>Undo</b> reverts that whole push and re-ships the games as they were. Every change is also kept in the Kit&apos;s history on GitHub, so nothing is lost.</P>

      <H2>7. Set aside and troubleshooting</H2>
      <P><b>Set aside</b> holds notes you set aside, notes Claude skipped (with the reason) and undone pushes. <b>Back to inbox</b> returns one.</P>
      <Shot src="11-set-aside.png" alt="Set aside with a skipped note" />
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem', margin: '8px 0 20px' }}>
        <thead><tr><th style={cell}>What you see</th><th style={cell}>What to do</th></tr></thead>
        <tbody>
          <tr><td style={cell}>No Feedback button on a game</td><td style={cell}>Enter the passcode at /lab, then reload the game</td></tr>
          <tr><td style={cell}>&quot;Microphone blocked&quot;</td><td style={cell}>Allow the microphone in the address bar, then press Record</td></tr>
          <tr><td style={cell}>Note stuck in In progress</td><td style={cell}>Wait 15 minutes, then press Stop and push again</td></tr>
          <tr><td style={cell}>Note back in the Inbox in red</td><td style={cell}>Read the reason, edit the note if needed, push again</td></tr>
          <tr><td style={cell}>&quot;The change broke the kit checks&quot;</td><td style={cell}>Push again, or reword the note more specifically</td></tr>
          <tr><td style={cell}>Live link not showing yet</td><td style={cell}>The site is still updating; refresh in a few minutes</td></tr>
        </tbody>
      </table>
      <P>Each Push runs Claude on Ryan&apos;s account, capped at $5 a push and $200 a month. Send back and Stop cost almost nothing.</P>
    </main>
  );
}

// Play stats for the site's older games (Cryptogram, Block Fall, The Escape original).
// Kit games get the same thing from @kit/site (claude-games kit/site/Telemetry.ts); keep the two in step.
// Use: <script src="/smg-play.js" data-game="cryptogram"></script>
// A play starts at the first input. Time counts while the tab is visible and the player did something
// in the last minute. A GAME_OVER message to the parent page counts as a finished run.
(function () {
  var script = document.currentScript;
  var game = script && script.getAttribute('data-game');
  if (!game || !/^https?:/.test(location.protocol) || location.pathname.indexOf('/proto/preview/') >= 0) return;
  var url = '/api/kit/play';
  var IDLE = 60000;

  function guestId() {
    var id = null;
    try { id = JSON.parse(localStorage.getItem('shared:smg-guest')); } catch { /* ignore */ }
    if (!id) {
      id = 'g' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      try { localStorage.setItem('shared:smg-guest', JSON.stringify(id)); } catch { /* ignore */ }
    }
    return id;
  }

  var play = { id: 'p' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36), game: game, guestId: guestId(), seconds: 0, runs: 0 };
  var started = false, ms = 0, lastInput = 0, lastTick = 0, sent = '';

  function tick() {
    var t = Date.now(), dt = Math.min(t - lastTick, 5000);
    lastTick = t;
    if (started && document.visibilityState !== 'hidden' && t - lastInput < IDLE) ms += Math.max(0, dt);
  }
  function flush() {
    if (!started) return;
    tick();
    play.seconds = Math.floor(ms / 1000);
    var key = play.seconds + '/' + play.runs;
    if (key === sent) return;
    sent = key;
    var body = JSON.stringify(play);
    try { if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))) return; } catch { /* ignore */ }
    fetch(url, { method: 'POST', body: body, keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } }).catch(function () {});
  }
  function input() {
    lastInput = Date.now();
    if (started) return;
    started = true;
    lastTick = lastInput;
    setInterval(tick, 1000);
    setInterval(flush, 60000);
    flush();
  }
  ['keydown', 'pointerdown', 'pointermove', 'wheel', 'touchstart'].forEach(function (type) {
    addEventListener(type, input, { capture: true, passive: true });
  });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });
  addEventListener('pagehide', flush);

  // These games tell the page around them when a run ends.
  try {
    if (window.parent !== window) {
      window.parent.addEventListener('message', function (e) {
        if (e.source === window && e.data && e.data.type === 'GAME_OVER') {
          if (!started) input();
          play.runs++;
          flush();
        }
      });
    }
  } catch { /* ignore */ }
})();

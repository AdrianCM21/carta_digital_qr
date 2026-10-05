/* Aviso sonoro corto (sin archivos de audio). Falla en silencio si el navegador lo bloquea. */
(function (g) {
  const H = (g.Helpers = g.Helpers || {});
  let ctx;

  H.beep = function () {
    try {
      const AC = g.AudioContext || g.webkitAudioContext;
      if (!AC) return;
      ctx = ctx || new AC();
      if (ctx.state === 'suspended') ctx.resume();
      [[880, 0], [1175, 0.14]].forEach((n) => {
        const o = ctx.createOscillator();
        const gain = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = n[0];
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + n[1]);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + n[1] + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n[1] + 0.22);
        o.connect(gain).connect(ctx.destination);
        o.start(ctx.currentTime + n[1]);
        o.stop(ctx.currentTime + n[1] + 0.25);
      });
    } catch (e) {}
  };
})(window);

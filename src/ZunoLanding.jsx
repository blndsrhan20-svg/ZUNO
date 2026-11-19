import { useEffect, useRef } from 'react';

export default function ZunoLanding({ onEnter }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0, height = 0, dpr = 1, frame = 0;
    let points = [];
    const resize = () => {
      cancelAnimationFrame(frame);
      const box = canvas.getBoundingClientRect();
      width = box.width; height = box.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const radius = Math.min(width, height) * .43;
      points = [];
      for (let ring = 0; ring < 7; ring++) {
        const count = 14 + ring * 6;
        for (let i = 0; i < count; i++) points.push({
          angle: i / count * Math.PI * 2,
          radius: radius * (.28 + ring * .12),
          tilt: ring * .45 + .2,
          speed: (ring % 2 ? 1 : -1) * (.0016 + ring * .0003),
          size: .8 + Math.random() * .8
        });
      }
      draw();
    };
    let tick = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2, cy = height * .46;
      const radius = Math.min(width, height) * .43;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * .9);
      glow.addColorStop(0, 'rgba(255,241,193,.24)');
      glow.addColorStop(.4, 'rgba(216,180,94,.09)');
      glow.addColorStop(1, 'rgba(216,180,94,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
      const dots = points.map(p => {
        if (!reduced) p.angle += p.speed;
        const ex = Math.cos(p.angle) * p.radius;
        const ey = Math.sin(p.angle) * p.radius * .42;
        return [cx + ex * Math.cos(p.tilt) - ey * Math.sin(p.tilt), cy + ex * Math.sin(p.tilt) + ey * Math.cos(p.tilt), p.size];
      });
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i][0] - dots[j][0], dy = dots[i][1] - dots[j][1];
        const distance = dx * dx + dy * dy, max = radius * radius * .012;
        if (distance < max) {
          ctx.strokeStyle = 'rgba(216,180,94,' + (.25 * (1 - distance / max)) + ')';
          ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(dots[i][0], dots[i][1]); ctx.lineTo(dots[j][0], dots[j][1]); ctx.stroke();
        }
      }
      ctx.shadowColor = '#d8b45e'; ctx.shadowBlur = 9; ctx.fillStyle = 'rgba(255,241,193,.92)';
      dots.forEach(([x, y, size]) => { ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); });
      ctx.shadowBlur = 0;
      const pulse = reduced ? 1 : 1 + Math.sin(tick) * .055; tick += .03;
      ctx.strokeStyle = 'rgba(216,180,94,.48)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, radius * .16 * pulse, 0, Math.PI * 2); ctx.stroke();
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * .14 * pulse);
      core.addColorStop(0, '#fff8dc'); core.addColorStop(.6, '#d8b45e'); core.addColorStop(1, 'rgba(138,106,37,0)');
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, radius * .14 * pulse, 0, Math.PI * 2); ctx.fill();
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  return <main className="zuno-landing" dir="rtl">
    <nav className="zl-nav"><span className="zl-wordmark">ZUNO<span>.</span></span><button className="zl-nav-cta" onClick={onEnter}>ابدأ الآن <span>↗</span></button></nav>
    <header className="zl-hero">
      <canvas ref={canvasRef} className="zl-orbit" aria-hidden="true" />
      <div className="zl-hero-content">
        <span className="zl-tag">ذكاء اصطناعي من طراز آخر</span>
        <h1>ZUNO</h1>
        <p>مساحة واحدة لأفكار أكبر. اسأل، ابتكر، واكتشف إمكانيات جديدة.</p>
        <div className="zl-actions"><button onClick={onEnter}>ابدأ رحلتك <span>↗</span></button><a href="#zl-capabilities">اكتشف قدراته</a></div>
      </div>
      <span className="zl-scroll-hint">اكتشف زونو <span>↓</span></span>
    </header>
    <div className="zl-marquee" aria-hidden="true"><div>كتابة　·　برمجة　·　تحليل　·　ترجمة　·　تخطيط　·　تعليم　·　إبداع　·　كتابة　·　برمجة　·　تحليل　·　ترجمة　·　تخطيط　·　تعليم　·　إبداع　·　</div></div>
    <section className="zl-capabilities" id="zl-capabilities">
      <div className="zl-section-heading"><span>إمكانيات ZUNO</span><h2>كل مهارة. في مكان واحد.</h2><p>مساعد ذكي يساعدك على تحويل الأسئلة والأفكار إلى خطوات واضحة.</p></div>
      <div className="zl-feature-grid">
        <article><b>01</b><h3>يكتب</h3><p>صياغة الرسائل والمقالات والأفكار بأسلوب واضح.</p></article>
        <article><b>02</b><h3>يبرمج</h3><p>مراجعة الأكواد وشرحها والمساعدة في بناء المشاريع.</p></article>
        <article><b>03</b><h3>يحلّل</h3><p>تنظيم المعلومات وتبسيط المسائل المعقدة.</p></article>
        <article><b>04</b><h3>يتعلّم معك</h3><p>تعليمات مخصصة تساعد على ضبط أسلوب الإجابة.</p></article>
      </div>
    </section>
    <section className="zl-final"><span>خطوتك التالية تبدأ هنا</span><h2>الفخامة تبدأ بكلمة.</h2><button onClick={onEnter}>ادخل إلى ZUNO <span>↗</span></button></section>
    <footer className="zl-footer"><span>ZUNO.</span><span>مساحة هادئة لأفكار أكبر.</span></footer>
  </main>;
}

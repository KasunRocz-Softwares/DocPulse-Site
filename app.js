// DocPulse site — published-note card, publishing pipeline, page-designer preview.
const root = document.documentElement;
const reduce = root.classList.contains('rm');

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const kid of kids) if (kid) n.append(kid);
  return n;
}
const onView = (node, fn, threshold = .35) => {
  if (!node) return;
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold });
  io.observe(node);
};

/* ---------------- Hero: published release notes (illustrative) ---------------- */
function initNoteCard() {
  const card = document.querySelector('.note-card');
  if (!card) return;
  const TAG = { Feature: 'tag', Fix: 'tag tag-fix', Security: 'tag tag-sec', Hotfix: 'tag tag-hot', Improvement: 'tag' };
  const notes = [
    { v: 'v2.4.0', t: 'Faster checkout', d: 'Released Nov 10', c: [['Feature', 'Save cards for next time'], ['Improvement', 'Checkout loads twice as fast'], ['Fix', 'Coupon totals round correctly']] },
    { v: 'v2.4.0-hotfix.1', t: 'Checkout hotfix', d: 'Released Nov 12', c: [['Hotfix', 'Card form works on older Safari']] },
    { v: 'v2.5.0', t: 'Team workspaces', d: 'Released Nov 17', c: [['Feature', 'Shared team workspaces'], ['Security', 'Sign-in alerts for new devices'], ['Improvement', 'Clearer order timeline']] },
  ];
  const version = document.getElementById('note-version');
  const title = document.getElementById('note-title');
  const date = document.getElementById('note-date');
  const list = document.getElementById('note-changes');
  const show = (n) => {
    version.textContent = n.v;
    title.textContent = n.t;
    date.textContent = n.d;
    list.replaceChildren(...n.c.map(([cat, text], i) => {
      const li = el('li', {}, el('span', { class: TAG[cat] || 'tag', text: cat }), el('span', { text }));
      li.style.setProperty('--i', i);
      return li;
    }));
  };
  let k = 0;
  show(notes[0]);
  if (reduce) return;
  setInterval(() => {
    if (document.hidden) return;
    k = (k + 1) % notes.length;
    show(notes[k]);
  }, 4200);
}

/* ---------------- Publishing pipeline ---------------- */
function initPipeline() {
  const list = document.getElementById('stages');
  if (!list) return;
  const items = [...list.children];
  const STEPS = [
    { title: 'Draft', sub: 'Write the release and its changes. Internal notes stay internal; only changes with a public description can be published.', who: 'Developer', rule: 'Admin, Release manager or Developer' },
    { title: 'Internal review', sub: 'The team checks the release record: changes, documents and deployments.', who: 'Developer', rule: 'Admin, Release manager or Developer' },
    { title: 'Approval revision', sub: 'The public notes are frozen with a content hash. Editing them later needs a new revision.', who: 'Developer', rule: 'The author of this revision' },
    { title: 'Approved', sub: 'A second person approves exactly that frozen revision. The author is refused, even as an administrator.', who: 'Reviewer', rule: 'Admin, Release manager or Reviewer, never the author' },
    { title: 'Published', sub: 'The approved revision becomes an immutable public snapshot. It can be revoked, never edited.', who: 'Release manager', rule: 'Admin or Release manager' },
  ];
  const title = document.getElementById('flow-title');
  const sub = document.getElementById('flow-sub');
  const who = document.getElementById('flow-who');
  const rule = document.getElementById('flow-rule');
  const next = document.getElementById('flow-next');
  const prev = document.getElementById('flow-prev');
  let current = 0;
  let auto = null;
  const show = (n) => {
    current = Math.max(0, Math.min(STEPS.length - 1, n));
    items.forEach((li, i) => {
      li.classList.toggle('done', i < current || (i === current && current === STEPS.length - 1));
      li.classList.toggle('current', i === current);
      li.setAttribute('aria-current', i === current ? 'step' : 'false');
    });
    const s = STEPS[current];
    title.textContent = s.title;
    sub.textContent = s.sub;
    who.textContent = s.who;
    rule.textContent = s.rule;
    prev.disabled = current === 0;
    next.firstChild.textContent = current === STEPS.length - 1 ? 'Start again ' : 'Next step ';
  };
  const stopAuto = () => { if (auto) { clearInterval(auto); auto = null; } };
  next.addEventListener('click', () => { stopAuto(); show(current === STEPS.length - 1 ? 0 : current + 1); });
  prev.addEventListener('click', () => { stopAuto(); show(current - 1); });
  items.forEach((li, i) => {
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    const pick = () => { stopAuto(); show(i); };
    li.addEventListener('click', pick);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  show(0);
  if (reduce) return;
  onView(list, () => {
    auto = setInterval(() => {
      if (document.hidden) return;
      if (current >= STEPS.length - 1) { stopAuto(); return; }
      show(current + 1);
    }, 1600);
  });
}

/* ---------------- Page designer preview ---------------- */
function initDesigner() {
  const mini = document.getElementById('mini');
  if (!mini) return;
  const bind = (groupId, attr) => {
    const buttons = [...document.querySelectorAll(`#${groupId} button`)];
    buttons.forEach((b) => b.addEventListener('click', () => {
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      mini.dataset[attr] = b.dataset[attr];
    }));
  };
  bind('theme-seg', 'theme');
  bind('layout-seg', 'layout');
}

/* ---------------- Setup: tabs, live file contents, copy buttons ---------------- */
function initSetup() {
  document.querySelectorAll('.os-tabs, .file-tabs').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (t) => tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        const n = tabs[(i + d + tabs.length) % tabs.length];
        select(n); n.focus();
      });
    });
  });
  // Show the real files, so the page and the downloads can never disagree.
  document.querySelectorAll('code[data-src]').forEach((code) => {
    fetch(code.dataset.src, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((text) => {
        code.replaceChildren(...text.split('\n').flatMap((line, i) => {
          const parts = [];
          if (i) parts.push(document.createTextNode('\n'));
          const m = /^(\s*)(#.*)$/.exec(line);
          if (m) { parts.push(document.createTextNode(m[1])); const c = document.createElement('span'); c.className = 'c'; c.textContent = m[2]; parts.push(c); }
          else parts.push(document.createTextNode(line));
          return parts;
        }));
      })
      .catch(() => { /* keep the fallback link */ });
  });
  document.querySelectorAll('.copy').forEach((b) => b.addEventListener('click', async () => {
    const host = b.closest('.code, .file');
    const text = host.querySelector('code').innerText;
    try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; b.classList.add('done'); }
    catch { b.textContent = 'Select & copy'; }
    setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1800);
  }));
}

/* ---------------- Reveal, progress, menu ---------------- */
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -10% 0px', threshold: .08 });
document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
addEventListener('scroll', () => {
  root.style.setProperty('--p', (scrollY / Math.max(1, root.scrollHeight - innerHeight)).toFixed(4));
}, { passive: true });
const nav = document.getElementById('nav');
const menuBtn = nav.querySelector('.menu-btn');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }));

initNoteCard();
initPipeline();
initDesigner();
initSetup();

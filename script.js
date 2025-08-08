/* script.js
 - typing effect (index only)
 - nav mobile toggle
 - terminal click sound (WebAudio oscillator)
 - simple markdown fetcher (used by blog listing)
*/

(() => {
  // ---------------------------
  // Terminal click sound (WebAudio)
  // ---------------------------
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function clickBeep() {
    try {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'square';
      o.frequency.value = 800;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      // quick ramp
      g.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.09);
      setTimeout(()=>o.stop(), 120);
    } catch (e) { /* some browsers block autoplay */ }
  }

  // play click on all links/buttons with data-sound attribute
  document.addEventListener('click', (ev) => {
    let el = ev.target;
    while(el && el !== document) {
      if (el.dataset && el.dataset.sound !== undefined) {
        clickBeep();
        break;
      }
      el = el.parentNode;
    }
  });

  // ---------------------------
  // NAV MOBILE TOGGLE
  // ---------------------------
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      // animate bars
      menuToggle.classList.toggle('open');
    });
  }

  // Close mobile nav when clicking a link
  document.addEventListener('click', (ev) => {
    if (ev.target.matches('.nav-links a')) {
      if (navLinks && navLinks.classList.contains('show')) navLinks.classList.remove('show');
    }
  });

  // ---------------------------
  // Active nav link highlighting (based on file name)
  // ---------------------------
  const loc = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === loc) a.classList.add('active');
  });

  // ---------------------------
  // Typing effect (only on index page)
  // ---------------------------
  function initTyping() {
    const el = document.querySelector('.typing');
    if (!el) return;
    const text = 'code, shield, repeat';
    let i = 0;
    el.textContent = '';
    function step() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(step, 80);
      } else {
        // cursor pulse
        setInterval(() => {
          el.classList.toggle('blink');
        }, 600);
      }
    }
    step();
  }
  initTyping();

  // ---------------------------
  // Simple Markdown fetcher for blog posts (very small)
  // Expects: <div id="post-list"></div> on blog page
  // and posts at /posts/*.md
  // ---------------------------
  function mdToHtml(md) {
    md = md.replace(/```([\s\S]*?)```/g, (m, code) => `<pre><code>${escapeHtml(code)}</code></pre>`);
    md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    md = md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    md = md.replace(/^\s*-\s+(.*)/gim, '<li>$1</li>');
    md = md.replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`);
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    md = md.replace(/^\s*([^<
].+)\s*$/gm, '<p>$1</p>');
    return md;
  }
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&<"']/g, function(m){return ({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'})[m];});
  }

  function loadBlogList() {
    const listEl = document.getElementById('post-list');
    if (!listEl) return;
    const posts = [
      { file:'posts/ai-in-bugbounty.md', title:'Using AI in Bug Bounty' },
      { file:'posts/networking-tools.md', title:'Networking Tools Deep Dive' },
      { file:'posts/bandit-journey.md', title:'Bandit Wargame: Lessons & Tips' }
    ];
    posts.forEach(p => {
      fetch(p.file).then(r => r.text()).then(md => {
        const preview = md.split('
').find(l => l.trim().length>0) || '';
        const div = document.createElement('div');
        div.className = 'post-item';
        div.innerHTML = `<h4>${p.title}</h4><p>${preview.slice(0,220)}</p><a class="btn" href="${p.file}" target="_blank" data-sound>Read raw .md</a>`;
        listEl.appendChild(div);
      }).catch(e => {
        const div = document.createElement('div');
        div.className = 'post-item';
        div.innerHTML = `<h4>${p.title}</h4><p>Post not found (create ${p.file})</p>`;
        listEl.appendChild(div);
      });
    });
  }
  loadBlogList();

})(); /* end script */

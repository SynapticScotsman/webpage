/* Layout mode for this page.
 *
 * Loaded alongside edit.js when ?edit is in the address. Press Layout in the
 * toolbar and the page becomes rearrangeable: drag cards into a new order or into
 * a different sector, move whole sections up and down, and hide anything you do
 * not want. Save produces the same finished index.html as text mode, because the
 * save routine serialises the live DOM and the DOM is what you just rearranged.
 *
 * What this deliberately does NOT do: free positioning, resizing, changing
 * spacing, colour or type. Those are the controls that let someone produce a page
 * that looks right on their monitor and is broken on a phone. Structured moves
 * cannot do that, because the grid keeps deciding the geometry.
 *
 * If genuinely freeform layout editing is needed, this is the wrong tool and a
 * visual HTML editor such as Pinegrow is the right one. See EDITING.md.
 */
(function () {
  'use strict';

  var CARD = '.wcard, .tool, .clip, .way, .level, .cluster, .prog, .sector, .stream-item';
  var on = false;
  var dragged = null;

  // ---------------------------------------------------------------- chrome
  var css = document.createElement('style');
  css.id = 'layoutStyle';
  css.textContent =
    '.lay [data-move]{outline:1px dashed rgba(124,224,192,.45); outline-offset:4px;' +
      'position:relative; cursor:grab; border-radius:3px}' +
    '.lay [data-move]:hover{outline-color:#7CE0C0}' +
    '.lay [data-move].dragging{opacity:.35; cursor:grabbing}' +
    '.lay [data-move].over{outline:2px solid #7CE0C0; outline-offset:6px}' +
    '.lay [data-sec]{outline:1px dashed rgba(224,104,124,.4); outline-offset:10px}' +
    '.lay [hidden-by-editor]{display:block !important; opacity:.28; filter:grayscale(1)}' +
    '.ctl{position:absolute; top:-11px; right:-11px; z-index:60; display:flex; gap:3px}' +
    '.ctl button{font:600 10px/1 ui-monospace,Consolas,monospace; letter-spacing:.06em;' +
      'cursor:pointer; padding:4px 7px; border-radius:3px; border:1px solid #33373C;' +
      'background:#0B0D10; color:#E6E4DF}' +
    '.ctl button:hover{border-color:#7CE0C0; color:#7CE0C0}' +
    '.secctl{position:absolute; top:8px; left:8px; z-index:61; display:flex; gap:4px}' +
    '.lay section, .lay .thesis, .lay .build, .lay .facility{position:relative}';
  document.head.appendChild(css);

  // ---------------------------------------------------------------- helpers
  function tag(el, kind) {
    var box = document.createElement('span');
    box.className = kind === 'section' ? 'secctl' : 'ctl';
    box.dataset.editorchrome = '1';
    box.innerHTML = kind === 'section'
      ? '<button data-a="up" title="Move section up">&uarr;</button>' +
        '<button data-a="down" title="Move section down">&darr;</button>' +
        '<button data-a="hide" title="Hide this section">hide</button>'
      : '<button data-a="hide" title="Hide this item">hide</button>';
    box.addEventListener('click', function (ev) {
      var a = ev.target.dataset.a;
      if (!a) return;
      ev.preventDefault(); ev.stopPropagation();
      if (a === 'hide') {
        var already = el.hasAttribute('hidden-by-editor');
        if (already) { el.removeAttribute('hidden-by-editor'); }
        else { el.setAttribute('hidden-by-editor', ''); }
        ev.target.textContent = already ? 'hide' : 'show';
      } else if (a === 'up' && el.previousElementSibling) {
        el.parentNode.insertBefore(el, el.previousElementSibling);
      } else if (a === 'down' && el.nextElementSibling) {
        el.parentNode.insertBefore(el.nextElementSibling, el);
      }
      changed();
    });
    el.appendChild(box);
  }

  function changed() {
    var bar = document.getElementById('editBar');
    if (bar) bar.querySelector('.count').textContent = 'unsaved changes';
    window.__layoutEdited = true;
  }

  // ---------------------------------------------------------------- enable
  function enable() {
    document.body.classList.add('lay');

    [].forEach.call(document.querySelectorAll(CARD), function (el) {
      el.dataset.move = '1';
      el.draggable = true;
      tag(el, 'card');

      el.addEventListener('dragstart', function (e) {
        dragged = el; el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', ''); } catch (x) {}
      });
      el.addEventListener('dragend', function () {
        el.classList.remove('dragging'); dragged = null;
        [].forEach.call(document.querySelectorAll('.over'), function (n) { n.classList.remove('over'); });
      });
      el.addEventListener('dragover', function (e) {
        if (!dragged || dragged === el) return;
        e.preventDefault();
        el.classList.add('over');
      });
      el.addEventListener('dragleave', function () { el.classList.remove('over'); });
      el.addEventListener('drop', function (e) {
        if (!dragged || dragged === el) return;
        e.preventDefault(); e.stopPropagation();
        el.classList.remove('over');
        // Insert before or after depending on which half was dropped on, so the
        // move reads the way the person expects.
        var r = el.getBoundingClientRect();
        var after = (e.clientY - r.top) > r.height / 2;
        el.parentNode.insertBefore(dragged, after ? el.nextSibling : el);
        changed();
      });
    });

    [].forEach.call(document.querySelectorAll('main > section, main > div'), function (el) {
      if (!el.id && !el.className) return;
      el.dataset.sec = '1';
      tag(el, 'section');
    });
  }

  function disable() {
    document.body.classList.remove('lay');
    [].forEach.call(document.querySelectorAll('[data-editorchrome]'), function (n) { n.remove(); });
    [].forEach.call(document.querySelectorAll('[data-move]'), function (el) {
      el.removeAttribute('data-move'); el.removeAttribute('draggable');
    });
    [].forEach.call(document.querySelectorAll('[data-sec]'), function (el) {
      el.removeAttribute('data-sec');
    });
  }

  // ---------------------------------------------------------------- toolbar hook
  var iv = setInterval(function () {
    var bar = document.getElementById('editBar');
    if (!bar) return;
    clearInterval(iv);
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'lay-toggle'; b.textContent = 'Layout';
    bar.insertBefore(b, bar.querySelector('.save'));
    b.addEventListener('click', function () {
      on = !on;
      if (on) { enable(); b.style.borderColor = '#7CE0C0'; b.style.color = '#7CE0C0'; }
      else { disable(); b.style.borderColor = ''; b.style.color = ''; }
    });
  }, 60);

  /* Cleanup contract used by edit.js before it serialises: strip the drag chrome,
     and convert anything hidden here into a real hidden attribute so the saved
     page honours it. */
  window.__layoutCleanup = function (doc) {
    doc.querySelectorAll('[data-editorchrome]').forEach(function (n) { n.remove(); });
    doc.querySelectorAll('#layoutStyle').forEach(function (n) { n.remove(); });
    doc.querySelectorAll('[data-move]').forEach(function (n) {
      n.removeAttribute('data-move'); n.removeAttribute('draggable');
      n.classList.remove('dragging', 'over');
    });
    doc.querySelectorAll('[data-sec]').forEach(function (n) { n.removeAttribute('data-sec'); });
    doc.querySelectorAll('[hidden-by-editor]').forEach(function (n) {
      n.removeAttribute('hidden-by-editor');
      n.setAttribute('hidden', '');
    });
    var b = doc.querySelector('body');
    if (b) b.classList.remove('lay');
  };
})();

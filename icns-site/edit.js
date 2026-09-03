/* Visual edit mode for this page.
 *
 * Add ?edit to the address and every piece of text becomes editable in place.
 * Click a heading, type, press Save, and the browser hands back a complete
 * index.html with the changes in it. Upload that file to GitHub and the site
 * updates. No install, no account, no build step, no CMS.
 *
 * Only text is editable. Layout, colours and structure are left alone on purpose,
 * because the failure mode of a general-purpose visual editor is someone dragging
 * a box and silently breaking the page for everyone on a phone.
 *
 * Loaded only when ?edit is present, so a normal visitor never downloads it.
 */
(function () {
  'use strict';

  // Elements worth editing: ones that hold words rather than structure. Anything
  // with an element child is skipped, so containers cannot be typed into.
  var SELECTOR = 'h1, h2, h3, h4, p, li, figcaption, .act, .sec-link, .lvl, .n, .k, .lang, .best, .open-to';
  var edited = false;

  function isLeafText(el) {
    if (!el.textContent.trim()) return false;
    for (var i = 0; i < el.children.length; i++) {
      // Allow inline emphasis inside a heading; reject anything structural.
      if (!/^(EM|STRONG|B|I|SUP|SUB|BR|SPAN)$/.test(el.children[i].tagName)) return false;
    }
    return true;
  }

  var targets = [].filter.call(document.querySelectorAll(SELECTOR), isLeafText);

  targets.forEach(function (el) {
    // plaintext-only stops pasted markup and stray divs from Enter. Older browsers
    // fall back to true, which is still usable.
    try { el.contentEditable = 'plaintext-only'; }
    catch (e) { el.contentEditable = 'true'; }
    el.dataset.editable = '1';
    el.addEventListener('input', function () {
      edited = true;
      bar.querySelector('.count').textContent = 'unsaved changes';
      el.dataset.changed = '1';
    });
  });

  // Toolbar
  var bar = document.createElement('div');
  bar.id = 'editBar';
  bar.innerHTML =
    '<span class="lbl">Edit mode</span>' +
    '<span class="count">' + targets.length + ' editable blocks</span>' +
    '<button type="button" class="save">Save a copy</button>' +
    '<button type="button" class="off">Leave</button>';
  document.body.appendChild(bar);

  var css = document.createElement('style');
  css.id = 'editStyle';
  css.textContent =
    '[data-editable]{outline:1px dashed rgba(224,104,124,.35); outline-offset:3px; border-radius:2px}' +
    '[data-editable]:hover{outline-color:rgba(224,104,124,.8)}' +
    '[data-editable]:focus{outline:2px solid #E0687C; background:rgba(224,104,124,.10)}' +
    '[data-changed]{background:rgba(124,224,192,.10)}' +
    '#editBar{position:fixed; left:0; right:0; bottom:0; z-index:9999; display:flex;' +
    'align-items:center; gap:14px; padding:10px 18px; background:#0B0D10;' +
    'border-top:1px solid #33373C; font:600 12px/1 ui-monospace,Consolas,monospace;' +
    'letter-spacing:.1em; text-transform:uppercase; color:#E6E4DF}' +
    '#editBar .lbl{color:#E0687C}' +
    '#editBar .count{color:#9A9EA6; margin-right:auto; text-transform:none; letter-spacing:.04em}' +
    '#editBar button{font:inherit; letter-spacing:.1em; text-transform:uppercase; cursor:pointer;' +
    'padding:9px 16px; border-radius:3px; border:1px solid #33373C; background:transparent; color:#E6E4DF}' +
    '#editBar .save{background:#990033; border-color:#990033; color:#fff}' +
    '#editBar .save:hover{background:#C33A50; border-color:#C33A50}' +
    '#editBar button:hover{border-color:#9A9EA6}';
  document.head.appendChild(css);

  bar.querySelector('.off').addEventListener('click', function () {
    if (edited && !confirm('Leave without saving? Your changes will be lost.')) return;
    location.search = '';
  });

  bar.querySelector('.save').addEventListener('click', function () {
    var doc = document.documentElement.cloneNode(true);

    // Strip everything this mode and the page runtime added, so the saved file is
    // the authored page plus the new words, not a snapshot of a running browser.
    doc.querySelectorAll('#editBar, #editStyle').forEach(function (n) { n.remove(); });
    doc.querySelectorAll('[data-editable]').forEach(function (n) {
      n.removeAttribute('contenteditable');
      n.removeAttribute('data-editable');
      n.removeAttribute('data-changed');
    });
    // The hero script injects <source> and may swap in an iframe on play.
    doc.querySelectorAll('#heroVideo source, iframe').forEach(function (n) { n.remove(); });
    doc.querySelectorAll('.playing').forEach(function (n) { n.classList.remove('playing'); });
    var mt = doc.querySelector('#motionToggle');
    if (mt) mt.setAttribute('hidden', '');
    // The loader stays. It is inert without ?edit in the address, and stripping it
    // would make edit mode one-use: save once and nobody can ever edit again.

    // Layout mode adds its own chrome and marks hidden items; let it clean up.
    if (window.__layoutCleanup) { window.__layoutCleanup(doc); }

    var html = '<!DOCTYPE html>\n' + doc.outerHTML + '\n';
    var blob = new Blob([html], { type: 'text/html' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);

    edited = false;
    bar.querySelector('.count').textContent = 'saved to your downloads';
  });

  window.addEventListener('beforeunload', function (e) {
    if (edited || window.__layoutEdited) { e.preventDefault(); e.returnValue = ''; }
  });
})();

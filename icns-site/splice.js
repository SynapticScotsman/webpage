/* Source-splicing save for edit mode. Loaded by the ?edit loader after edit.js
 * and layout.js; edit.js's Save button uses it through window.__spliceSave.
 *
 * WHY THIS EXISTS. The first Save serialised the live DOM (cloneNode, outerHTML).
 * Measured 2026-09-05 on index.html with nothing edited: 50 of 778 lines came
 * back different. 17 self-closing SVG paths became <path></path>, 4 boolean
 * attributes gained ="", 12 named entities (&middot; &rsquo; &rarr;) became bare
 * characters, multi-line tags collapsed onto one line, and the two scripts the
 * loader injects were written into the page, so every later visitor would have
 * got the toolbar. The DOM is the browser's reading of the file, not the file.
 *
 * WHAT IT DOES INSTEAD. Fetch the page's own source. Parse it with parse5 with
 * source positions on; parse5 follows the HTML spec, so its tree has the same
 * shape as the browser's, which is what makes pairing the two trees by walking
 * them in step sound. Pair every source element with its live element. On Save,
 * walk the live tree and emit:
 *   untouched element ....... its original bytes, verbatim
 *   edited text block ....... original start and end tags, new innerHTML between
 *   moved card or section ... its original bytes at the new place, carrying the
 *                             whitespace that preceded it in the source
 *   hidden item ............. original start tag with ' hidden' added
 * A save with no edits is therefore the file itself, byte for byte.
 * window.__spliceSelfTest() checks all of that in the browser; add &selftest to
 * the address to run it on load and see the result in the toolbar.
 *
 * WHEN IT STANDS DOWN. No source (file://), no parse5 (offline), or a source
 * element with no live twin: __spliceSave is never installed, the toolbar says
 * why, and edit.js falls back to serialising the DOM.
 */
(function () {
  'use strict';

  var PARSE5 = 'https://cdn.jsdelivr.net/npm/parse5@8.0.1/+esm';
  // What may sit between two siblings for them to be reorderable: whitespace,
  // comments, and stray end tags. A stray end tag (index.html had a </div> with
  // no open div before </main>) creates no element, so parse5 leaves it in the
  // gap; the browser ignores it too, so carrying it along changes nothing.
  // Anything else is prose, and reordering around it would drop it.
  var GAP = /^(\s|<!--[\s\S]*?-->|<\/[a-zA-Z][\w-]*\s*>)*$/;

  var src = '', map = null, all = [], root = null, selected = null;

  // ------------------------------------------------------------ pairing
  function isEl(n) { return typeof n.tagName === 'string'; } // parse5 text nodes are '#text'

  // innerHTML minus anything the editor put inside (layout mode's hide buttons).
  function clean(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll('[data-editorchrome]').forEach(function (n) { n.remove(); });
    return c.innerHTML;
  }

  // Pair source element p with live element el, then their children in order.
  // A live child whose tag does not match the next source child has no source
  // (the hero <source>, editor chrome, injected scripts) and is skipped. A source
  // child left without a live twin means the page changed shape before we
  // looked; the whole mapping is refused rather than guessed at.
  function pair(p, el, parent) {
    var loc = p.sourceCodeLocation;
    if (!loc || !loc.startTag) throw new Error('<' + p.tagName + '> has no source position');
    var e = {
      el: el, parent: parent, kids: [],
      start: loc.startOffset, end: loc.endOffset,
      tagEnd: loc.startTag.endOffset,
      innerEnd: loc.endTag ? loc.endTag.startOffset : loc.endOffset,
      endTag: loc.endTag ? src.slice(loc.endTag.startOffset, loc.endTag.endOffset) : '',
      line: loc.startLine, endLine: loc.endLine,
      // Inside a text block the words are the unit, not the elements: typing
      // across an <em> may legitimately delete it.
      inLeaf: !!parent && (parent.inLeaf || parent.inner !== undefined),
      // Text blocks are compared by innerHTML, captured now, before anyone types.
      inner: el.hasAttribute('data-editable') ? clean(el) : undefined
    };
    map.set(el, e); all.push(e);
    var pk = (p.childNodes || []).filter(isEl), lk = el.children, j = 0;
    for (var i = 0; i < lk.length && j < pk.length; i++) {
      if (lk[i].localName.toLowerCase() === pk[j].tagName.toLowerCase()) {
        e.kids.push(lk[i]); pair(pk[j], lk[i], e); j++;
      }
    }
    if (j < pk.length) {
      throw new Error('<' + pk[j].tagName + '> at line ' + pk[j].sourceCodeLocation.startLine + ' has no live element');
    }
    return e;
  }

  // ------------------------------------------------------------ emitting
  function liveKids(el) { return [].filter.call(el.children, function (c) { return map.has(c); }); }
  function same(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // Did anything change in this element or below it? Memoised per save.
  function dirty(e) {
    if (e.d !== undefined) return e.d;
    var el = e.el;
    var d = el.hasAttribute('hidden-by-editor') || (e.inner !== undefined && clean(el) !== e.inner);
    if (!d) {
      var lk = liveKids(el);
      d = !same(lk, e.kids);
      for (var i = 0; i < lk.length && !d; i++) d = dirty(map.get(lk[i]));
    }
    e.d = d;
    return d;
  }

  function startTag(e) {
    var t = src.slice(e.start, e.tagEnd);
    if (e.el.hasAttribute('hidden-by-editor') && !/\shidden(?=[\s>\/=])/.test(t)) {
      t = t.replace(/\s*\/?>$/, function (m) { return ' hidden' + m; });
    }
    return t;
  }

  function gap(text, el) {
    if (!GAP.test(text)) throw new Error('cannot reorder inside <' + el.localName + '>: there is text between its children');
    return text;
  }

  // The whitespace (and comments) that preceded e in the source. It travels with
  // the element when the element moves, which keeps the indentation sane.
  function before(e) {
    var i = e.parent.kids.indexOf(e.el);
    var from = i > 0 ? map.get(e.parent.kids[i - 1]).end : e.parent.tagEnd;
    return gap(src.slice(from, e.start), e.parent.el);
  }

  function emit(e) {
    if (!dirty(e)) return src.slice(e.start, e.end);
    var el = e.el, out = startTag(e), i, k, pos;
    if (e.inner !== undefined) {
      if (!e.endTag) throw new Error('editable <' + el.localName + '> has no end tag in the source');
      var now = clean(el);
      out += now === e.inner ? src.slice(e.tagEnd, e.innerEnd) : now;
    } else {
      var lk = liveKids(el);
      if (same(lk, e.kids)) {
        // Same children, a change somewhere below: keep every byte between them.
        pos = e.tagEnd;
        for (i = 0; i < lk.length; i++) { k = map.get(lk[i]); out += src.slice(pos, k.start) + emit(k); pos = k.end; }
        out += src.slice(pos, e.innerEnd);
      } else {
        // Reordered, or a child arrived or left: each child brings its own lead-in.
        for (i = 0; i < lk.length; i++) { k = map.get(lk[i]); out += before(k) + emit(k); }
        var last = e.kids.length ? map.get(e.kids[e.kids.length - 1]).end : e.tagEnd;
        out += gap(src.slice(last, e.innerEnd), el);
      }
    }
    return out + e.endTag;
  }

  function save() {
    for (var i = 0; i < all.length; i++) {
      all[i].d = undefined;
      if (!all[i].inLeaf && !all[i].el.isConnected) {
        throw new Error('the page removed <' + all[i].el.localName + '> (line ' + all[i].line + ') while you were editing; reload and try again');
      }
    }
    return src.slice(0, root.start) + emit(root) + src.slice(root.end);
  }

  // Where a live element lives in the file, for pointing a chat at it.
  function context(el) {
    while (el && !map.has(el)) el = el.parentElement;
    if (!el) return null;
    var e = map.get(el);
    return { file: location.pathname.split('/').pop() || 'index.html',
             line: e.line, endLine: e.endLine, start: e.start, end: e.end,
             source: src.slice(e.start, e.end) };
  }

  // ------------------------------------------------------------ toolbar
  var note = null, pending = '';
  function say(msg) { pending = msg; if (note) note.textContent = msg; }

  function install() {
    var bar = document.getElementById('editBar');
    if (!bar) return false;
    note = document.createElement('span');
    note.className = 'src';
    note.textContent = pending;
    bar.insertBefore(note, bar.querySelector('.count'));

    var copy = document.createElement('button');
    copy.type = 'button'; copy.className = 'copy'; copy.textContent = 'Copy for chat';
    copy.title = 'Copy the selected block and where it lives in the file, to paste into a chat';
    bar.insertBefore(copy, bar.querySelector('.save'));
    copy.addEventListener('click', function () {
      var c = selected && context(selected);
      if (!c) { say('click a block on the page first'); return; }
      var text = c.file + ' lines ' + c.line + '-' + c.endLine + '\n' + c.source + '\n';
      navigator.clipboard.writeText(text).then(
        function () { say('copied ' + c.file + ':' + c.line + '-' + c.endLine); },
        function () { say('the browser blocked the copy'); });
    });

    var css = document.createElement('style');
    css.id = 'spliceStyle';
    css.textContent = '#editBar .src{color:#9A9EA6; text-transform:none; letter-spacing:.04em}';
    document.head.appendChild(css);
    return true;
  }

  document.addEventListener('focusin', function (ev) { if (map && map.has(ev.target)) selected = ev.target; });
  document.addEventListener('mousedown', function (ev) {
    var el = ev.target.closest && ev.target.closest('[data-move], [data-editable]');
    if (el && !ev.target.closest('#editBar')) selected = el;
  }, true);

  // ------------------------------------------------------------ self-test
  // Multiset line difference: how many source lines vanished and how many new
  // ones appeared. A pure move scores 0/0 while the text still differs.
  function lineDiff(a, b) {
    var m = new Map();
    a.split('\n').forEach(function (l) { m.set(l, (m.get(l) || 0) + 1); });
    b.split('\n').forEach(function (l) { m.set(l, (m.get(l) || 0) - 1); });
    var gone = 0, added = 0;
    m.forEach(function (v) { if (v > 0) gone += v; else added -= v; });
    return { gone: gone, added: added };
  }
  function label(el) { return (el.querySelector('h1,h2,h3,h4,h5') || el).textContent.trim().slice(0, 40); }

  window.__spliceSelfTest = function () {
    var r = { mapped: all.length, live: document.getElementsByTagName('*').length }, out, d;

    out = save();
    r.zeroEdit = { identical: out === src, ok: out === src };

    var h = document.querySelector('h1, h2'), t = h && h.firstChild, was = t && t.data;
    if (t && t.nodeType === 3) {
      t.data = was + ' EDITED'; out = save(); d = lineDiff(src, out); t.data = was;
      r.oneTextEdit = { linesGone: d.gone, linesAdded: d.added,
                        ok: d.gone === 1 && d.added === 1 && out.indexOf(' EDITED') > -1 };
    } else {
      r.oneTextEdit = { skipped: 'no heading with a leading text node', ok: true };
    }

    var sel = window.__layoutCards || '.wcard';
    var card = [].find.call(document.querySelectorAll(sel), function (c) {
      return map.has(c) && c.nextElementSibling && map.has(c.nextElementSibling);
    });
    if (card) {
      var e = map.get(card), next = card.nextElementSibling, parent = card.parentNode;
      var cardSrc = src.slice(e.start, e.end);
      parent.insertBefore(next, card);
      out = save(); d = lineDiff(src, out);
      var liveOrder = [].map.call(document.querySelectorAll(sel), label);
      parent.insertBefore(card, next);
      var parsed = new DOMParser().parseFromString(out, 'text/html');
      var savedOrder = [].map.call(parsed.querySelectorAll(sel), label);
      r.oneMove = { linesGone: d.gone, linesAdded: d.added, changed: out !== src,
                    cardOnce: out.split(cardSrc).length === 2,
                    orderMatchesPage: same(liveOrder, savedOrder),
                    ok: d.gone === 0 && d.added === 0 && out !== src &&
                        out.split(cardSrc).length === 2 && same(liveOrder, savedOrder) };

      card.setAttribute('hidden-by-editor', '');
      out = save(); d = lineDiff(src, out);
      card.removeAttribute('hidden-by-editor');
      var want = src.slice(e.start, e.tagEnd).replace(/\s*\/?>$/, function (m) { return ' hidden' + m; });
      r.oneHide = { linesGone: d.gone, linesAdded: d.added,
                    ok: d.gone === 1 && d.added === 1 && out.indexOf(want) > -1 && src.indexOf(want) === -1 };
    } else {
      r.oneMove = { skipped: 'no card with a mapped sibling', ok: true };
      r.oneHide = r.oneMove;
    }

    var c = h && context(h);
    r.context = { line: c && c.line, chars: c && (c.end - c.start),
                  ok: !!c && c.source.charAt(0) === '<' && src.slice(c.start, c.end) === c.source };

    r.ok = ['zeroEdit', 'oneTextEdit', 'oneMove', 'oneHide', 'context'].every(function (k) { return r[k].ok; });
    return r;
  };

  // ------------------------------------------------------------ boot
  var waiting = setInterval(function () { if (install()) clearInterval(waiting); }, 60);

  Promise.all([
    fetch(location.pathname, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('source fetch returned ' + res.status);
      return res.text();
    }),
    import(PARSE5)
  ]).then(function (got) {
    src = got[0];
    var doc = got[1].parse(src, { sourceCodeLocationInfo: true });
    map = new WeakMap(); all = [];
    root = pair(doc.childNodes.filter(isEl)[0], document.documentElement, null);
    window.__spliceSave = save;
    window.__spliceContext = context;
    say('saves into the source, ' + all.length + ' elements mapped');
    if (/selftest/.test(location.search)) {
      var r = window.__spliceSelfTest();
      console.log('splice selftest', r);
      say('selftest ' + (r.ok ? 'passed' : 'FAILED, see console') + ', ' + all.length + ' elements mapped');
    }
  }).catch(function (err) {
    console.warn('splice.js standing down:', err);
    window.__spliceError = err.message;
    say('fallback save (' + err.message + ')');
  });
})();

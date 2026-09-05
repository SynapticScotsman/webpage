"""Zero-edit round-trip check for the in-page editor's Save button.

Open each page with ?edit, press Save without touching anything, and read the file
the browser hands back. The saved page must not carry the editor's own scripts.

Why this exists: the loader in each page appends edit.js and layout.js to <head>
when ?edit is present. Save serialises the live DOM, so those two elements ended up
in the saved index.html, where edit.js (which has no ?edit guard of its own) ran for
every visitor and showed them the edit toolbar. The fix marks the injected scripts
data-editorchrome and strips that marker on save; this check is what fails if
either half of that is lost.

The loader itself (data-editloader) must survive, or a saved page can never be
edited again. A fix that strips every <script> would pass the first assertion and
break the second, which is why both are here.

Run:  python icns-site/test_save_roundtrip.py
Needs: pip install playwright   (uses the Chrome already installed; no browser download)
"""
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

SITE = Path(__file__).resolve().parent
PAGES = ["index.html", "access.html"]
# Matches <script src="edit.js"> in any attribute order or quoting, but not the
# loader's own text, which names both files inside a JS array and must stay.
EDITOR_SCRIPT = re.compile(r"<script\b[^>]*\bsrc=[\"']?(?:\./)?(edit|layout)\.js")


def save_without_editing(page, name):
    page.goto((SITE / name).as_uri() + "?edit")
    # The Layout button is added by layout.js once edit.js's bar exists, so its
    # presence means both editor scripts have run: the real state a person saves from.
    page.wait_for_selector("#editBar .lay-toggle")
    with page.expect_download() as dl:
        page.click("#editBar .save")
    return Path(dl.value.path()).read_text(encoding="utf-8")


def test_zero_edit_save_strips_editor_scripts():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page()
        for name in PAGES:
            html = save_without_editing(page, name)
            leaked = EDITOR_SCRIPT.findall(html)
            assert not leaked, f"{name}: saved copy still loads {leaked} for every visitor"
            assert "data-editloader" in html, f"{name}: saved copy lost the ?edit loader"
            print(f"ok  {name}: no editor scripts in the saved copy; loader kept")
        browser.close()


if __name__ == "__main__":
    test_zero_edit_save_strips_editor_scripts()

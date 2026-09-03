# Hero background reel

Drop `hero.mp4` (and optionally `hero.webm`) in this folder and the landing page
plays it behind the headline. With no file here the page shows the still poster
instead and nothing changes. Nothing in the code needs editing either way.

## What to cut

Ten to twenty seconds, silent, no captions, no titles, no analysis overlays.

That last point matters more than it sounds. Most of the centre's footage is
screen-recorded analysis: matplotlib axes, colourbars, tick labels, readouts like
`Velocity tuned to dx/dt = 0.000`. That material is compelling in a video panel
where someone is reading it, and it is a mess behind a headline, where it reads as
a spreadsheet someone left open.

Clips that work as ambient background, because they are clean imagery:

- the lunar eclipse, the disc drifting through frame
- the rocket launch, the plume against the sky
- star fields and satellite tracks
- Sensiball, if you have a clean angle without the interface visible

Avoid: anything with plot axes, anything with a cursor visible, anything with a
hard cut every second. Slow and continuous beats fast and exciting here, because
the eye is meant to land on the headline, not the video.

## Encoding

The background sits behind a scrim at 55% opacity, so it can be compressed harder
than footage anyone is going to watch directly. Aim for under 3 MB. Under 1.5 MB
is better.

```bash
# H.264 MP4. Every browser can play this, so it is the one that matters.
ffmpeg -i source.mp4 -t 15 -an \
  -vf "scale=1280:-2,fps=24" \
  -c:v libx264 -crf 30 -preset slow \
  -pix_fmt yuv420p -movflags +faststart \
  hero.mp4
```

```bash
# VP9 WebM. Roughly 30% smaller; browsers that support it will prefer it.
ffmpeg -i source.mp4 -t 15 -an \
  -vf "scale=1280:-2,fps=24" \
  -c:v libvpx-vp9 -crf 40 -b:v 0 \
  hero.webm
```

What the flags are doing, and why each one is deliberate:

- `-an` strips audio entirely. A background loop must be silent, and a muted audio
  track is dead weight in the file.
- `-t 15` caps the length. A loop wants to be short enough that the seam is not
  worth noticing.
- `scale=1280:-2` is plenty behind a scrim. 1920 doubles the file for no visible
  gain at 55% opacity.
- `fps=24` over 30 or 60. Nobody is studying the motion.
- `-crf 30` (H.264) and `-crf 40` (VP9) are well past what you would accept for
  footage in a player, and correct here. Push them higher if the file is still fat.
- `-pix_fmt yuv420p` for Safari, which will refuse other chroma formats.
- `-movflags +faststart` moves the index to the front so playback can begin before
  the file finishes downloading.

Check the result:

```bash
ls -lh hero.mp4 hero.webm
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 hero.mp4
```

## Getting the source

The originals live with whoever shot them. Failing that, the centre's own channel
is at <https://www.youtube.com/channel/UC-fyHEMEM7pTczY-hN_VpBg> and `yt-dlp` will
pull a master from it, though a re-encode of a re-encode is visibly worse. Use the
originals if they can be found.

## What the page does with it

- Loads only after the poster, so it never delays first paint.
- Does not load at all when the visitor has asked for reduced motion, is on a
  screen under 900px, or has data saver on or a 2G connection.
- Shows a Pause control whenever it is playing, because WCAG 2.2.2 requires a way
  to stop anything that moves for more than five seconds. The current centre site
  fails this with its carousel; this page should not repeat that.
- Falls back to the poster silently if the file is missing, broken, or if the
  browser refuses to autoplay it.

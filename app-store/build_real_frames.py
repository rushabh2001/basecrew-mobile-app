#!/usr/bin/env python3
"""Capture real-UI HTML screens and composite App Store marketing frames."""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
REAL = ROOT / "real-ui"
OUT = ROOT
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Phone screen logical size (iPhone 14-ish)
W, H = 390, 844
SCALE = 3  # retina capture

SCREENS = [
    {
        "id": "login",
        "slug": "00-login",
        "headline": "Sign in. Get to work.",
        "subtitle": "Organization-ready access for your crew.",
        "footer": "Secure sign-in to your BaseCrew workspace",
    },
    {
        "id": "home",
        "slug": "01-clock",
        "headline": "Clock in. Stay accountable.",
        "subtitle": "GPS-verified attendance for modern teams.",
        "footer": "Attendance that syncs with your workspace",
    },
    {
        "id": "today",
        "slug": "02-today",
        "headline": "Plan your day. Get more done.",
        "subtitle": "Focus today with tasks that matter most.",
        "footer": "Your day, planned and on track",
    },
    {
        "id": "tasks",
        "slug": "03-tasks",
        "headline": "Tasks that stay on track.",
        "subtitle": "Swipe to complete. Stay in flow.",
        "footer": "Work synced with your BaseCrew workspace",
    },
    {
        "id": "team",
        "slug": "04-team",
        "headline": "See your team in real time.",
        "subtitle": "Live activity and attendance at a glance.",
        "footer": "Lead with clarity across your crew",
    },
    {
        "id": "inbox",
        "slug": "05-inbox",
        "headline": "Never miss what matters.",
        "subtitle": "Reminders and alerts in one inbox.",
        "footer": "Stay ahead of deadlines and updates",
    },
]

SIZES = [
    (1290, 2796),
    (1242, 2688),
    (1179, 2556),
]


def load_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Helvetica Neue Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Helvetica Neue.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def extract_screen_html(screen_id: str) -> str:
    html = (REAL / "screens.html").read_text(encoding="utf-8")
    # Pull style block
    style_start = html.index("<style>")
    style_end = html.index("</style>") + len("</style>")
    style = html[style_start:style_end]
    # Pull phone div
    marker = f'id="screen-{screen_id}"'
    start = html.index(marker)
    # find opening <div class="phone"
    open_div = html.rfind("<div class=\"phone\"", 0, start)
    # naive balanced div parse
    i = open_div
    depth = 0
    end = None
    while i < len(html):
        if html.startswith("<div", i):
            depth += 1
            i = html.find(">", i) + 1
            continue
        if html.startswith("</div>", i):
            depth -= 1
            i += len("</div>")
            if depth == 0:
                end = i
                break
            continue
        i += 1
    if end is None:
        raise RuntimeError(f"Could not extract screen {screen_id}")
    phone = html[open_div:end]
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/>{style}
<style>
  html, body {{ margin:0; padding:0; background:#FAFBFC; width:{W}px; height:{H}px; overflow:hidden; }}
  .phone {{ width:{W}px; height:{H}px; }}
  /* Hardware island is drawn on the iPhone frame */
  .island {{ display:none !important; }}
  .tab .icon {{ font-size: 22px; line-height: 24px; }}
  .tab {{ font-size: 11px; }}
</style>
</head><body>{phone}</body></html>"""


def capture_screen(screen_id: str, dest: Path) -> None:
    html = extract_screen_html(screen_id)
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / f"{screen_id}.html"
        page.write_text(html, encoding="utf-8")
        shot = Path(tmp) / "shot.png"
        cmd = [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            f"--force-device-scale-factor={SCALE}",
            f"--window-size={W},{H}",
            f"--screenshot={shot}",
            page.as_uri(),
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        img = Image.open(shot).convert("RGBA")
        # Crop to exact phone size in case chrome adds chrome
        img = img.crop((0, 0, W * SCALE, H * SCALE))
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest)


def iphone_frame(screen: Image.Image, target_h: int) -> Image.Image:
    """Clean iPhone frame - solid bezel only, no shadow/highlight overlays."""
    phone_h = max(200, target_h)
    phone_w = int(phone_h * 0.492)
    bezel_side = max(14, phone_w // 22)
    bezel_top = max(14, phone_w // 22)
    bezel_bot = max(16, phone_w // 18)
    radius = max(52, phone_w // 6)

    phone = Image.new("RGBA", (phone_w, phone_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(phone)

    # Outer titanium + inner black bezel
    draw.rounded_rectangle(
        (0, 0, phone_w - 1, phone_h - 1),
        radius=radius,
        fill=(22, 24, 28, 255),
    )
    inset = max(3, phone_w // 70)
    draw.rounded_rectangle(
        (inset, inset, phone_w - 1 - inset, phone_h - 1 - inset),
        radius=max(40, radius - inset),
        fill=(0, 0, 0, 255),
    )

    inner_x = bezel_side
    inner_y = bezel_top
    inner_w = phone_w - bezel_side * 2
    inner_h = phone_h - bezel_top - bezel_bot
    inner_r = max(38, radius - bezel_side)

    screen_resized = screen.resize((inner_w, inner_h), Image.Resampling.LANCZOS)
    screen_mask = Image.new("L", (inner_w, inner_h), 0)
    ImageDraw.Draw(screen_mask).rounded_rectangle(
        (0, 0, inner_w - 1, inner_h - 1), radius=inner_r, fill=255
    )
    phone.paste(screen_resized, (inner_x, inner_y), screen_mask)

    # Dynamic Island
    island_w = int(inner_w * 0.34)
    island_h = max(22, int(inner_h * 0.032))
    ix = inner_x + (inner_w - island_w) // 2
    iy = inner_y + max(10, int(inner_h * 0.012))
    draw = ImageDraw.Draw(phone)
    draw.rounded_rectangle(
        (ix, iy, ix + island_w, iy + island_h),
        radius=island_h // 2,
        fill=(0, 0, 0, 255),
    )

    # Side buttons
    btn = (48, 50, 54, 255)
    draw.rounded_rectangle((0, int(phone_h * 0.18), 3, int(phone_h * 0.22)), radius=1, fill=btn)
    draw.rounded_rectangle((0, int(phone_h * 0.26), 3, int(phone_h * 0.34)), radius=1, fill=btn)
    draw.rounded_rectangle((0, int(phone_h * 0.36), 3, int(phone_h * 0.44)), radius=1, fill=btn)
    draw.rounded_rectangle(
        (phone_w - 4, int(phone_h * 0.30), phone_w - 1, int(phone_h * 0.40)),
        radius=1,
        fill=btn,
    )

    # Clip everything to the rounded phone silhouette
    body_mask = Image.new("L", (phone_w, phone_h), 0)
    ImageDraw.Draw(body_mask).rounded_rectangle(
        (0, 0, phone_w - 1, phone_h - 1), radius=radius, fill=255
    )
    phone.putalpha(body_mask)
    return phone


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if draw.textlength(trial, font=font) <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def make_frame(screen: Image.Image, meta: dict, size: tuple[int, int]) -> Image.Image:
    """Symmetric: top text, equal gap, phone, equal gap, bottom text."""
    fw, fh = size
    canvas = Image.new("RGBA", (fw, fh), (11, 18, 38, 255))
    draw = ImageDraw.Draw(canvas)
    for y in range(fh):
        t = y / max(1, fh - 1)
        r = int(11 + (30 - 11) * t)
        g = int(18 + (99 - 18) * t)
        b = int(38 + (255 - 38) * t)
        draw.line([(0, y), (fw, y)], fill=(r, g, b, 255))

    h_font = load_font(max(44, fw // 15), bold=True)
    s_font = load_font(max(24, fw // 38), bold=False)
    f_font = load_font(max(20, fw // 46), bold=False)

    outer = int(fh * 0.030)
    side = int(fw * 0.06)
    max_text_w = fw - side * 2
    target_gap = int(fh * 0.030)

    headline_lines = wrap_text(draw, meta["headline"], h_font, max_text_w)
    sub_lines = wrap_text(draw, meta["subtitle"], s_font, max_text_w)
    footer_lines = wrap_text(draw, meta["footer"], f_font, max_text_w)

    # Draw top text first so we know its real bottom edge
    y = outer
    for line in headline_lines:
        tw = draw.textlength(line, font=h_font)
        draw.text(((fw - tw) / 2, y), line, font=h_font, fill=(255, 255, 255, 255))
        y += int(h_font.size * 1.05)
    y += int(fh * 0.008)
    for line in sub_lines:
        tw = draw.textlength(line, font=s_font)
        draw.text(((fw - tw) / 2, y), line, font=s_font, fill=(230, 238, 255, 230))
        y += int(s_font.size * 1.18)
    top_text_bottom = y

    foot_h = len(footer_lines) * int(f_font.size * 1.25)
    bottom_text_top = fh - outer - foot_h
    band = bottom_text_top - top_text_bottom

    phone = iphone_frame(screen, target_h=max(400, band - target_gap * 2))
    pw, ph = phone.size
    max_w = int(fw * 0.90)
    if pw > max_w:
        scale = max_w / pw
        phone = phone.resize((int(pw * scale), int(ph * scale)), Image.Resampling.LANCZOS)
        pw, ph = phone.size

    if ph + target_gap * 2 > band:
        scale = (band - target_gap * 2) / ph
        phone = phone.resize((int(pw * scale), int(ph * scale)), Image.Resampling.LANCZOS)
        pw, ph = phone.size

    # Center phone in the band => identical gap above and below
    phone_top = top_text_bottom + (band - ph) // 2
    gap_visual = phone_top - top_text_bottom

    px = (fw - pw) // 2
    canvas.alpha_composite(phone, (px, phone_top))

    fy = phone_top + ph + gap_visual
    for line in footer_lines:
        tw = draw.textlength(line, font=f_font)
        draw.text(((fw - tw) / 2, fy), line, font=f_font, fill=(220, 230, 255, 215))
        fy += int(f_font.size * 1.25)

    return canvas.convert("RGB")


def main() -> None:
    captures = REAL / "captures"
    captures.mkdir(parents=True, exist_ok=True)

    for meta in SCREENS:
        cap = captures / f"{meta['id']}@{SCALE}x.png"
        print(f"Capturing {meta['id']}...")
        capture_screen(meta["id"], cap)
        screen = Image.open(cap).convert("RGBA")

        master = make_frame(screen, meta, (1290, 2796))
        master_path = OUT / f"basecrew-asc-{meta['slug']}.png"
        master.save(master_path, optimize=True)
        print(f"  wrote {master_path.name}")

        for w, h in SIZES:
            framed = make_frame(screen, meta, (w, h))
            path = OUT / f"basecrew-asc-{meta['slug']}-{w}x{h}.png"
            framed.save(path, optimize=True)
            print(f"  wrote {path.name}")


if __name__ == "__main__":
    main()

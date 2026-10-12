#!/usr/bin/env python3
"""Build iOS + Android + App Store icons from the Electron BaseCrew icon."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ELECTRON_ICON = ROOT / "electron" / "icon.png"
APP_STORE = Path(__file__).resolve().parent / "basecrew-app-icon-1024.png"
IOS_SET = (
    Path(__file__).resolve().parents[1]
    / "ios"
    / "BaseCrewMobile"
    / "Images.xcassets"
    / "AppIcon.appiconset"
)
ANDROID_RES = (
    Path(__file__).resolve().parents[1] / "android" / "app" / "src" / "main" / "res"
)

# iOS AppIcon sizes: (filename, pixel size)
IOS_SIZES = [
    ("Icon-20@2x.png", 40),
    ("Icon-20@3x.png", 60),
    ("Icon-29@2x.png", 58),
    ("Icon-29@3x.png", 87),
    ("Icon-40@2x.png", 80),
    ("Icon-40@3x.png", 120),
    ("Icon-60@2x.png", 120),
    ("Icon-60@3x.png", 180),
    ("AppIcon-1024.png", 1024),
]

ANDROID_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}


def opaque_master(size: int = 1024) -> Image.Image:
    """Electron icon has transparent corners; App Store requires opaque RGB."""
    src = Image.open(ELECTRON_ICON).convert("RGBA")
    # White plate matches the squircle fill of the Electron icon
    base = Image.new("RGBA", src.size, (255, 255, 255, 255))
    base.alpha_composite(src)
    if base.size != (size, size):
        base = base.resize((size, size), Image.Resampling.LANCZOS)
    return base.convert("RGB")


def round_icon(img: Image.Image, radius_ratio: float = 0.22) -> Image.Image:
    """Optional rounded preview (Android adaptive often wants square; keep square PNG)."""
    w, h = img.size
    r = int(min(w, h) * radius_ratio)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=r, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rgba = img.convert("RGBA")
    out.paste(rgba, (0, 0), mask)
    return out


def main() -> None:
    master = opaque_master(1024)
    APP_STORE.parent.mkdir(parents=True, exist_ok=True)
    master.save(APP_STORE, optimize=True)
    print(f"Wrote {APP_STORE}")

    IOS_SET.mkdir(parents=True, exist_ok=True)
    contents = {
        "images": [],
        "info": {"author": "xcode", "version": 1},
    }

    mapping = [
        ("iphone", "2x", "20x20", "Icon-20@2x.png"),
        ("iphone", "3x", "20x20", "Icon-20@3x.png"),
        ("iphone", "2x", "29x29", "Icon-29@2x.png"),
        ("iphone", "3x", "29x29", "Icon-29@3x.png"),
        ("iphone", "2x", "40x40", "Icon-40@2x.png"),
        ("iphone", "3x", "40x40", "Icon-40@3x.png"),
        ("iphone", "2x", "60x60", "Icon-60@2x.png"),
        ("iphone", "3x", "60x60", "Icon-60@3x.png"),
        ("ios-marketing", "1x", "1024x1024", "AppIcon-1024.png"),
    ]

    for filename, px in IOS_SIZES:
        resized = master.resize((px, px), Image.Resampling.LANCZOS)
        path = IOS_SET / filename
        resized.save(path, optimize=True)
        print(f"  iOS {filename} ({px}px)")

    for idiom, scale, size, filename in mapping:
        contents["images"].append(
            {
                "filename": filename,
                "idiom": idiom,
                "scale": scale,
                "size": size,
            }
        )

    import json

    (IOS_SET / "Contents.json").write_text(
        json.dumps(contents, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Updated {IOS_SET / 'Contents.json'}")

    for folder, px in ANDROID_SIZES.items():
        d = ANDROID_RES / folder
        d.mkdir(parents=True, exist_ok=True)
        square = master.resize((px, px), Image.Resampling.LANCZOS)
        rounded = round_icon(square)
        # Keep opaque square for launcher; also write round with alpha composited on white then mask
        square.save(d / "ic_launcher.png", optimize=True)
        # Round: composite onto transparent then save PNG with alpha for round icon
        # Android round icons can use the same asset; bake on white then re-mask for soft edges
        round_rgb = Image.new("RGBA", (px, px), (255, 255, 255, 255))
        round_rgb.alpha_composite(rounded)
        # Save with circular-ish soft corners as RGBA
        rounded.save(d / "ic_launcher_round.png", optimize=True)
        print(f"  Android {folder} ({px}px)")

    print("Done - icons match Electron branding.")


if __name__ == "__main__":
    main()

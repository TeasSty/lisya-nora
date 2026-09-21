"""
Clean fox mark: transparent cutout + warm brand-tan ear/muzzle accents.

1. rembg subject cutout from original source
2. Strip all cream / photo-white / fringe (no preserved whites)
3. Paint soft geometric accents for inner ears + muzzle only,
   clipped to silhouette “bays” (near fox pigment) so the cream
   disk / chest never comes back as a blob
4. Export site assets + teal/dark/cream previews
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
PROC = ROOT / "tmp-logo-proc"
PUBLIC = ROOT / "public"
IMAGES = PUBLIC / "images"

# Warm fox-family apricot — dark enough to read on cream (#fbf3e4),
# soft enough on dark header/footer.
ACCENT = (201, 148, 88, 255)  # #C99458
TEAL_BG = (45, 110, 100, 255)
DARK_BG = (28, 24, 22, 255)
CREAM_BG = (251, 243, 228, 255)


def ensure_rembg(src: Path, dest: Path) -> Image.Image:
    if dest.exists():
        return Image.open(dest).convert("RGBA")
    from rembg import remove

    out = remove(Image.open(src).convert("RGBA"))
    out.save(dest)
    return out.convert("RGBA")


def is_light_arr(rem: np.ndarray) -> np.ndarray:
    r, g, b, a = (rem[:, :, i] for i in range(4))
    subj = a > 80
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    sat = np.maximum(np.maximum(r, g), b).astype(int) - np.minimum(
        np.minimum(r, g), b
    )
    near_cream = (
        (r >= 195)
        & (g >= 175)
        & (b >= 160)
        & (np.minimum(np.minimum(r, g), b) > 140)
        & ((r.astype(int) - b) < 90)
    )
    pale = (lum >= 175) & (sat <= 60)
    pale2 = (lum >= 200) & (sat <= 80) & ((r.astype(int) - b) < 70)
    dark = lum < 50
    return subj & (near_cream | pale | pale2) & ~dark


def dilate(mask: np.ndarray, iterations: int) -> np.ndarray:
    out = mask.copy()
    for _ in range(iterations):
        pad = np.pad(out, 1, constant_values=False)
        out = (
            pad[0:-2, 1:-1]
            | pad[2:, 1:-1]
            | pad[1:-1, 0:-2]
            | pad[1:-1, 2:]
            | pad[0:-2, 0:-2]
            | pad[0:-2, 2:]
            | pad[2:, 0:-2]
            | pad[2:, 2:]
            | out
        )
    return out


def polygon_mask(size: tuple[int, int], polys: list[list[tuple[float, float]]]) -> np.ndarray:
    im = Image.new("L", size, 0)
    draw = ImageDraw.Draw(im)
    for poly in polys:
        draw.polygon(poly, fill=255)
    return np.array(im) > 0


def build_mark(rem_im: Image.Image) -> Image.Image:
    rem = np.array(rem_im.convert("RGBA"))
    h, w, _ = rem.shape
    light = is_light_arr(rem)
    pigment = (rem[:, :, 3] > 80) & ~light

    # Geometric accents in 736-space (source size)
    sx, sy = w / 736.0, h / 736.0

    def P(x: float, y: float) -> tuple[float, float]:
        return (x * sx, y * sy)

    ear_l = [
        P(248, 120),
        P(300, 118),
        P(322, 195),
        P(295, 240),
        P(255, 235),
        P(232, 185),
    ]
    ear_r = [
        P(488, 120),
        P(436, 118),
        P(414, 195),
        P(441, 240),
        P(481, 235),
        P(504, 185),
    ]
    # Compact muzzle — around nose / upper cheeks only (not chest)
    muzzle = [
        P(300, 325),
        P(345, 305),
        P(368, 300),
        P(391, 305),
        P(436, 325),
        P(455, 365),
        P(445, 410),
        P(410, 445),
        P(368, 455),
        P(326, 445),
        P(291, 410),
        P(281, 365),
    ]

    painted = polygon_mask((w, h), [ear_l, ear_r, muzzle])
    # Soft edge
    soft = (
        Image.fromarray((painted.astype(np.uint8) * 255), "L")
        .filter(ImageFilter.GaussianBlur(1.6))
    )
    soft_a = np.array(soft).astype(np.float32) / 255.0

    # Only keep accents in open bays next to pigment (not cream-disk voids)
    near_pig = dilate(pigment, iterations=42)
    # Prefer former light OR empty interior near pigment
    bay = (~pigment) & near_pig & (soft_a > 0.08)
    # Extra: don't paint far below nose into chest — hard Y clip
    yy, _xx = np.ogrid[:h, :w]
    bay &= yy <= int(470 * sy)

    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[pigment] = rem[pigment]
    out[pigment, 3] = 255

    for i, c in enumerate(ACCENT[:3]):
        out[:, :, i][bay] = np.clip(
            soft_a[bay] * c + (1.0 - soft_a[bay]) * out[:, :, i][bay],
            0,
            255,
        ).astype(np.uint8)
    out[:, :, 3][bay] = np.clip(soft_a[bay] * 255, 0, 255).astype(np.uint8)

    # Fringe kill on pigment edges
    r, g, b, a = (out[:, :, i] for i in range(4))
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    sat = np.maximum(np.maximum(r, g), b).astype(int) - np.minimum(
        np.minimum(r, g), b
    )
    opaque = a >= 40
    pad = np.pad(opaque, 1, constant_values=False)
    near_clear = ~(
        pad[0:-2, 1:-1]
        & pad[2:, 1:-1]
        & pad[1:-1, 0:-2]
        & pad[1:-1, 2:]
        & pad[0:-2, 0:-2]
        & pad[0:-2, 2:]
        & pad[2:, 0:-2]
        & pad[2:, 2:]
    )
    fringe = opaque & near_clear & (
        ((lum > 180) & (sat < 55))
        | ((a < 220) & (lum > 165) & (sat < 70))
        | ((r > 205) & (g > 190) & (b > 175) & ((r.astype(int) - b) < 80))
    )
    out[fringe, 3] = 0

    im = Image.fromarray(out, "RGBA")
    im.putalpha(im.getchannel("A").filter(ImageFilter.MedianFilter(3)))
    print(f"accent pixels={bay.sum()}")
    return im


def trim_and_pad(im: Image.Image, pad_ratio: float = 0.05) -> Image.Image:
    bbox = im.split()[-1].getbbox()
    if not bbox:
        return im
    cropped = im.crop(bbox)
    side = max(cropped.size)
    pad = int(side * pad_ratio)
    canvas = Image.new("RGBA", (side + 2 * pad, side + 2 * pad), (0, 0, 0, 0))
    ox = (canvas.size[0] - cropped.size[0]) // 2
    oy = (canvas.size[1] - cropped.size[1]) // 2
    canvas.paste(cropped, (ox, oy), cropped)
    return canvas


def preview(im: Image.Image, bg: tuple[int, int, int, int], path: Path, size: int = 512) -> None:
    mark = im.copy()
    mark.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    canvas.paste(
        mark,
        ((size - mark.size[0]) // 2, (size - mark.size[1]) // 2),
        mark,
    )
    canvas.convert("RGB").save(path, optimize=True)


def fit_square(im: Image.Image, size: int) -> Image.Image:
    out = im.copy()
    out.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(
        out,
        ((size - out.size[0]) // 2, (size - out.size[1]) // 2),
        out,
    )
    return canvas


def save_favicon_ico(im: Image.Image, path: Path) -> None:
    sizes = [16, 32, 48]
    imgs = [fit_square(im, s) for s in sizes]
    imgs[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=imgs[1:],
    )


def main() -> None:
    PROC.mkdir(exist_ok=True)
    src = PROC / "00-source.png"
    if not src.exists():
        raise SystemExit(f"Missing {src}")

    rembg_im = ensure_rembg(src, PROC / "01-rembg.png")

    rem = np.array(rembg_im)
    light = is_light_arr(rem)
    stripped = rem.copy()
    stripped[light, 3] = 0
    Image.fromarray(stripped, "RGBA").save(PROC / "02-stripped.png")

    final = trim_and_pad(build_mark(rembg_im))
    final.save(PROC / "03-final.png")

    preview(final, TEAL_BG, PROC / "preview-final-teal.png")
    preview(final, DARK_BG, PROC / "preview-final-dark.png")
    preview(final, CREAM_BG, PROC / "preview-final-cream.png")
    preview(Image.fromarray(stripped, "RGBA"), TEAL_BG, PROC / "preview-stripped-teal.png")
    preview(rembg_im, TEAL_BG, PROC / "preview-01-rembg-teal.png")

    fit_square(final, 1024).save(PUBLIC / "logo.png", "PNG", optimize=True)
    fit_square(final, 512).save(PUBLIC / "logo-mark.png", "PNG", optimize=True)
    fit_square(final, 512).save(IMAGES / "logo-mark.webp", "WEBP", quality=92, method=6)
    fit_square(final, 512).save(
        IMAGES / "logo-mark-dark.webp", "WEBP", quality=92, method=6
    )
    fit_square(final, 32).save(PUBLIC / "favicon-32.png", "PNG", optimize=True)
    fit_square(final, 180).save(PUBLIC / "apple-touch-icon.png", "PNG", optimize=True)
    save_favicon_ico(final, PUBLIC / "favicon.ico")

    shipped = Image.open(IMAGES / "logo-mark.webp").convert("RGBA")
    preview(shipped, TEAL_BG, PROC / "preview-logo-mark-teal.png", size=360)
    preview(shipped, DARK_BG, PROC / "preview-logo-mark-dark.png", size=360)
    preview(shipped, CREAM_BG, PROC / "preview-logo-mark-cream.png", size=360)

    print("accent #{:02X}{:02X}{:02X}".format(*ACCENT[:3]))
    print("final", final.size)
    print("assets written")


if __name__ == "__main__":
    main()

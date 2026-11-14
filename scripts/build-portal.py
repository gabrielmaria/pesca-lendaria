#!/usr/bin/env python3
"""Gera o pacote de submissão para a GameDistribution (Azerion).

Uso:
  python3 scripts/build-portal.py

Resultado:
  dist/pesca-lendaria-gamedistribution.zip
  dist/gamedistribution-cover.png (se assets/img/screenshot-surface.png existir)
"""
from pathlib import Path
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "portal"
ZIP = ROOT / "dist" / "pesca-lendaria-gamedistribution.zip"
COVER = ROOT / "dist" / "gamedistribution-cover.png"

# staging limpo
if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "assets" / "css").mkdir(parents=True)
(OUT / "assets" / "js").mkdir(parents=True)
(OUT / "assets" / "img").mkdir(parents=True)

# ficheiros do jogo (sem README, ROADMAP, capturas, ads.txt ou vercel.json)
shutil.copy2(ROOT / "index.html", OUT / "index.html")
shutil.copy2(ROOT / "assets" / "css" / "styles.css", OUT / "assets" / "css" / "styles.css")
for f in (ROOT / "assets" / "js").glob("*.js"):
    shutil.copy2(f, OUT / "assets" / "js" / f.name)
for name in ("logo.png", "favicon-32.png", "favicon-64.png", "apple-touch-icon.png"):
    src = ROOT / "assets" / "img" / name
    if src.exists():
        shutil.copy2(src, OUT / "assets" / "img" / name)

# No portal, força GameDistribution e desliga analytics first-party.
cfg_path = OUT / "assets" / "js" / "config.js"
cfg = cfg_path.read_text()
cfg = cfg.replace("modo: 'auto',", "modo: 'gamedistribution',")
cfg = cfg.replace("const ANALYTICS = {\n  ativo: true,", "const ANALYTICS = {\n  ativo: false,")
cfg_path.write_text(cfg)

# Remove o loader do AdSense do HTML do portal (o SDK da GD trata dos anúncios).
html_path = OUT / "index.html"
html = html_path.read_text()
html = re.sub(
    r"<script>(?:(?!</script>)[\s\S])*adsbygoogle\.js(?:(?!</script>)[\s\S])*</script>\s*",
    "",
    html,
    count=1,
)
html_path.write_text(html)

# ZIP com index.html na raiz.
ZIP.parent.mkdir(parents=True, exist_ok=True)
if ZIP.exists():
    ZIP.unlink()
with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(OUT.rglob("*")):
        if p.is_file():
            z.write(p, p.relative_to(OUT))

# Capa 512x512 a partir da captura de superfície (opcional; podes substituir no portal).
shot = ROOT / "assets" / "img" / "screenshot-surface.png"
if shot.exists():
    try:
        from PIL import Image, ImageOps
        img = Image.open(shot).convert("RGB")
        cover = ImageOps.fit(img, (512, 512), method=Image.Resampling.LANCZOS, centering=(0.5, 0.28))
        cover.save(COVER, optimize=True)
    except Exception as e:
        print(f"(capa ignorada: {e})")

print(f"ZIP: {ZIP}")
if COVER.exists():
    print(f"COVER: {COVER}")

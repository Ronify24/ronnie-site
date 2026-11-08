"""Build the one-page brief resume; render its preview with pdftoppm at 180 dpi."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
FONT_DIR = Path("/Users/ronniec/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/standard_fonts")
for name, filename in [("Helvetica", "LiberationSans-Regular.ttf"), ("Helvetica-Bold", "LiberationSans-Bold.ttf"), ("Helvetica-Oblique", "LiberationSans-Italic.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
pdfmetrics.registerFontFamily("Helvetica", normal="Helvetica", bold="Helvetica-Bold", italic="Helvetica-Oblique", boldItalic="Helvetica-Bold")
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/RonnieCleland_2026_Resume.pdf'
INK, MUTED, TEAL = '#172E35', '#50646A', '#087F89'
c = canvas.Canvas(str(OUT), pagesize=(612,792))
c.setTitle('Ronnie Cleland | Creative AI Platform Architect | Brief Resume')
c.setAuthor('Ronnie Cleland')

def text(s,x,y,size=10,bold=False,color=INK):
    c.setFillColor(HexColor(color)); c.setFont('Helvetica-Bold' if bold else 'Helvetica',size); c.drawString(x,y,s)

def para(s,x,y,w,size=10,leading=14,color=INK):
    p=Paragraph(s,ParagraphStyle('body',fontName='Helvetica',fontSize=size,leading=leading,textColor=HexColor(color)))
    _,h=p.wrap(w,750); p.drawOn(c,x,y-h); return y-h

def section(s,x,y,w):
    text(s,x,y,9,True,TEAL)
    c.setStrokeColor(HexColor('#CDDEDF')); c.setLineWidth(.6); c.line(x,y-8,x+w,y-8)
    return y-22

# Restrained dark masthead links the brief to the portfolio; the body stays print-friendly.
c.setFillColor(HexColor(INK)); c.rect(0,625,612,167,fill=1,stroke=0)
c.setFillColor(HexColor('#38D4D9')); c.rect(42,753,35,3,fill=1,stroke=0)
text('RONNIE CLELAND',42,718,28,True,'#FFFFFF')
text('CREATIVE AI PLATFORM ARCHITECT',43,696,12,True,'#72E0E2')
text('Artist-facing products / Generative media / Production systems',43,675,9.5,color='#DFEAEC')
for label,url,x,w in [('ronnie@lumifyai.com','mailto:ronnie@lumifyai.com',43,124),('linkedin.com/in/ronniecleland','https://linkedin.com/in/ronniecleland',192,157),('ronniecleland.com','https://ronniecleland.com',400,110)]:
    text(label,x,649,9,color='#DFEAEC'); c.linkURL(url,(x,646,x+w,660),relative=0)
y=para('Creative technology leader with <b>20+ years</b> across animation, VFX, real-time look development, and artist tools. Co-founder of Lumify AI, combining artistic direction, product design, and hands-on engineering to turn creative intent into controllable workflows.',42,603,528,10.5,14.5)

# Main experience column and a concise supporting column.
y=section('CURRENT EXPERIENCE',42,y-23,326)
text('LUMIFY AI',42,y,12,True)
y=para('Co-Founder &amp; Chief Creative Technology Officer',42,y-9,326,10,14,color=TEAL)
text('2024 - Present',42,y-16,9,color=MUTED); y-=30
for title,body in [
 ('Product + interaction','Lead the creative vision and browser-based UX for image, video, and 3D/world workflows.'),
 ('Canvas to production','Connect saved projects, approved reference libraries, shot direction, and the Cut. Retain earlier takes and make selection for the edit explicit.'),
 ('Artist-directed controls','Shape relighting, material, time-of-day, and camera tools; reviewed batch stills and shot video; speech, music, and sound workflows.'),
 ('Full-stack delivery','Build responsive JavaScript interfaces and Python/Flask services for provider routing, asynchronous jobs, result registration, and saved revisions.'),
 ('Review + accountability','Implement quote review and explicit generation approval, source lineage, job status, approved cost estimates, and review MP4 assembly.'),
 ('Model integration','Connect Runway, fal.ai, World Labs, and local services through capability-aware controls and deployment policies.')]:
    y=para(f'<b>{title}</b><br/>{body}',42,y,326,10,13.5)-11
assert y>65,y

x,w=394,176
z=section('CORE STRENGTHS',x,536.5,w)
z=para('Creative workflows + artist UX<br/>Product architecture<br/>Technical art direction<br/>Model orchestration + handoff',x,z,w,9.5,14)-17
z=section('TECHNICAL PRACTICE',x,z,w)
z=para('JavaScript / HTML / CSS<br/>Python / Flask / REST APIs<br/>SQLite / FFmpeg / AI Toolkit',x,z,w,9.5,14)-8
z=para('Working knowledge: PyTorch/CUDA, Diffusers, Transformers, ComfyUI.',x,z,w,9,12.5,color=MUTED)-16
z=section('PRODUCTION FOUNDATION',x,z,w)
for title,body in [
 ('DreamWorks Animation','2010 - 2021 / Department Chair, Look Development Supervisor, Environment Surfacing Lead'),
 ('Spire Animation','2021 - 2023 / Unreal look development'),
 ('FableLight Studios','2023 - 2024 / Digital innovation'),
 ('Earlier VFX + digital art','Sony Pictures Imageworks, Rhythm &amp; Hues, Asylum VFX, Gentle Giant, Look FX')]:
    z=para(f'<b>{title}</b><br/>{body}',x,z,w,9,12)-6
z=section('EDUCATION',x,z-12,w)
z=para('Gnomon / Certificate of Visual FX<br/>Delgado / Visual Communications<br/>USC / Media Arts',x,z,w,8.5,12)
assert z>55,z
c.setStrokeColor(HexColor('#CDDEDF')); c.line(42,42,570,42)
text('RONNIE CLELAND',42,27,8,True)
text('CREATIVE VISION. PRACTICAL SYSTEMS.',228,27,8,color=MUTED)
text('01 / 01',536,27,8,color=TEAL)
c.save()
print(OUT)


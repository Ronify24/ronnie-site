"""Rebuild the two-page, selectable-text full resume and first-page preview."""
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
OUT = ROOT / 'assets/Ronnie_Cleland_Creative_AI_Platform_Architect.pdf'
INK, MUTED, TEAL, LINE = '#172E35', '#50646A', '#087F89', '#CDDEDF'
c = canvas.Canvas(str(OUT), pagesize=(612, 792))
c.setTitle('Ronnie Cleland | Creative AI Platform Architect')
c.setAuthor('Ronnie Cleland')

def text(s, x, y, size=10, bold=False, color=INK):
    c.setFillColor(HexColor(color)); c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
    c.drawString(x,y,s)

def para(s, y, size=10, leading=14, x=44, width=524, color=INK):
    p=Paragraph(s, ParagraphStyle('body', fontName='Helvetica', fontSize=size, leading=leading, textColor=HexColor(color)))
    _,h=p.wrap(width,750); p.drawOn(c,x,y-h)
    return y-h

def section(label,y):
    text(label,44,y,9,True,TEAL)
    c.setStrokeColor(HexColor(LINE)); c.setLineWidth(.6); c.line(44,y-8,568,y-8)
    return y-22

def footer(page, label):
    c.setStrokeColor(HexColor(LINE)); c.line(44,42,568,42)
    text('RONNIE CLELAND',44,27,8,True)
    text(label,180,27,8,color=MUTED)
    text(f'0{page} / 02',530,27,8,color=TEAL)

def job(org,role,dates,y):
    text(org,44,y,11,True)
    c.setFont('Helvetica',9); c.setFillColor(HexColor(MUTED)); c.drawRightString(568,y,dates)
    return para(role,y-7,10,13,color=TEAL)-7

def bullet(s,y):
    text('•',46,y-9,10,color=TEAL)
    return para(s,y,x=58,width=510,size=10,leading=13.5)-4

# Page 1: current practice, with a restrained editorial white/teal identity.
c.setFillColor(HexColor(TEAL)); c.rect(44,747,38,4,fill=1,stroke=0)
text('RONNIE CLELAND',44,712,28,True)
text('CREATIVE AI PLATFORM ARCHITECT',45,690,12,True,TEAL)
text('Artist-facing products  /  Generative media  /  Production systems',45,671,9.5,color=MUTED)
for label,url,x,w in [('ronnie@lumifyai.com','mailto:ronnie@lumifyai.com',44,123),('linkedin.com/in/ronniecleland','https://linkedin.com/in/ronniecleland',191,159),('ronniecleland.com','https://ronniecleland.com',393,110)]:
    text(label,x,649,9,color=MUTED); c.linkURL(url,(x,646,x+w,660),relative=0)
y=section('PROFILE',625)
y=para('Creative AI platform architect and visual-production leader with <b>20+ years</b> across feature animation, VFX, real-time look development, and artist tools. Co-founder of Lumify AI, connecting artistic judgment with hands-on product design and full-stack implementation. Builds creative systems that make intent, review, and the next decision visible.',y)-20
y=section('CURRENT EXPERIENCE',y)
y=job('LUMIFY AI','Co-Founder & Chief Creative Technology Officer','2024 - Present',y)
for s in [
    'Lead product strategy, creative direction, and interaction design for a browser-based platform spanning image, video, and 3D/world workflows.',
    'Build responsive HTML/CSS/JavaScript interfaces and Python/Flask services for model integration, server-controlled provider routing, asynchronous jobs, and result registration.',
    'Connect the creative canvas with saved projects, reference libraries, shot direction, and the Cut; retain earlier takes and separate preview from explicit selection for the edit.',
    'Implement generation quote review and explicit approval, job status and recovery, source lineage, saved revisions, and approved cost estimates.',
    'Integrate Runway, fal.ai, World Labs, and local model services through capability-aware controls and deployment policies.'
]: y=bullet(s,y)
y=section('SELECTED PRODUCT SYSTEMS',y-8)
for title,body in [
    ('DIRECTED CREATION','Reference approval and Library lock; relighting, material, time-of-day, and saved camera direction; reviewed batch still and shot-video workflows.'),
    ('REVIEW TO CUT','Retained takes, source history, explicit Use in Cut, shot timing, and review MP4 assembly; speech, music, and sound workflows.'),
    ('PRODUCTION CONTINUITY','Project persistence, revision protection, provider provenance, generation history, metadata, and traceable handoff.')
]:
    y=para(f'<b><font color="{TEAL}">{title}</font></b>  {body}',y,9.5,13)-7
y=section('TECHNICAL PRACTICE',y-7)
y=para('<b>Build:</b> JavaScript, HTML/CSS, Python, Flask, REST APIs, SQLite, FFmpeg.<br/><b>Integrate:</b> Hosted and local inference, model/provider adapters, AI Toolkit; working knowledge of PyTorch/CUDA, Diffusers, Transformers, and ComfyUI.',y,9.5,13)
assert y>55, y
footer(1,'PRODUCT + PLATFORM'); c.showPage()

# Page 2: career history remains in chronological reading order.
c.setFillColor(HexColor(TEAL)); c.rect(44,747,38,4,fill=1,stroke=0)
text('THE PRODUCTION FOUNDATION',44,718,20,True)
text('20+ years of craft, creative leadership, and visual problem-solving.',44,697,10,color=MUTED)
y=section('SELECTED PRIOR EXPERIENCE',672)
y=job('FABLELIGHT STUDIOS','Digital Innovation','2023 - 2024',y)
y=para('Explored next-generation stories and workflows with artists, connecting emerging technology and storytelling.',y)-17
y=job('SPIRE ANIMATION','Unreal Look Development Designer','2021 - 2023',y)
y=para('Developed worlds and concepts for <i>Trouble</i> with a previs team using Unreal Engine and Substance, combining real-time world building, material design, and look development.',y)-17
y=job('DREAMWORKS ANIMATION','Department Chair / Look Development Supervisor / Environment Surfacing Lead','2010 - 2021',y)
y=para('Led and collaborated across feature-animation world building, surfacing, look development, and shot quality. Translated creative direction into environments, materials, reviews, and pipeline-ready deliverables while balancing visual ambition, schedule, and evolving story needs.',y)-7
y=para('<b>Selected productions:</b> The Croods 2, How to Train Your Dragon 3, Trolls Holiday Special, Boss Baby, Kung Fu Panda 3, Penguins, Home, The Croods, and Puss in Boots.',y,9.5,13)-18
for org,role,date,body in [
('RHYTHM & HUES','Texture TD','2008 - 2009','Primary texture artist on Land of the Lost, Night at the Museum 2, and Cirque du Freak.'),
('ASYLUM VFX','Texture Artist','2008 - 2010',"Texture work on The Curious Case of Benjamin Button, The Sorcerer’s Apprentice, Prince of Persia, and commercials."),
('GENTLE GIANT','Next-Generation Character Development','2007 - 2008','Digital art and character/creature workflows for scans, feature films, next-generation releases, and toy products.'),
('LOOK FX','Matte Painter & Roto Artist','2006','Rotoscope work on Pirates of the Caribbean 2, Rocky Balboa, and The Nightmare Before Christmas; matte painting for a NASA simulation ride.'),
('SONY PICTURES IMAGEWORKS','Dust-Busting Roto Artist','2005','Dust-busting work on Ghost Rider; internal Maya and production training.')]:
    y=job(org,role,date,y); y=para(body,y,9.5,12.5)-14
y=section('EDUCATION',y)
y=para('<b>Gnomon</b> - Certificate of Visual FX, Hollywood, CA<br/><b>Delgado</b> - Visual Communications, New Orleans, LA<br/><b>USC</b> - Media Arts, Columbia, SC',y,9.5,13)
assert y>55,y
footer(2,'EXPERIENCE + CRAFT'); c.save()
print(OUT)

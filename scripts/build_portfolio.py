"""Build the cinematic portfolio PDF from current site artwork and UI captures."""
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

from reportlab.lib.utils import ImageReader
from PIL import Image
from io import BytesIO
import json
from PIL import ImageOps
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/Ronnie_Cleland_Creative_AI_Platform_Architect_Portfolio.pdf'
W,H=1152,648
c=canvas.Canvas(str(OUT),pagesize=(W,H))
c.setTitle('Ronnie Cleland | Creative AI Platform Architect | Portfolio')
c.setAuthor('Ronnie Cleland')
WHITE='#EFF8F8'; MUTED='#E3EFF0'; CYAN='#47D5DB'; BG='#071D24'
slides=[]; elements=[]
build=ROOT/'artifacts/portfolio-build';build.mkdir(exist_ok=True)
def text(s,x,y,size=12,color=WHITE,bold=False):
 elements.append(dict(type='text',text=s,x=x,y=H-y-size*.85,w=max(1,1115-x),h=size*1.4,size=size,color=color,bold=bold))
 c.setFillColor(HexColor(color));c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);c.drawString(x,y,s)
def para(s,x,y,w,size=17,leading=25,color=MUTED):
 p=Paragraph(s,ParagraphStyle('p',fontName='Helvetica-Bold' if size>=30 else 'Helvetica',fontSize=size,leading=leading,textColor=HexColor(color)));_,h=p.wrap(w,H);p.drawOn(c,x,y-h)
 # Use the PDF's actual line breaks for matching, editable PowerPoint text.
 for i,line in enumerate(p.blPara.lines):
  words=line[1] if isinstance(line,tuple) else [getattr(word,'text','') for word in line.words]
  elements.append(dict(type='text',text=' '.join(words).replace('R&D;', 'R&D').replace(' ,', ','),x=x,y=H-y+i*leading+size*.15,w=w+8,h=leading+3,size=size,color=color,bold=size>=30))
 return y-h

def art(path,x,y,w,h,cover=True):
 im=Image.open(ROOT/path).convert('RGB');im.thumbnail((2000,1400));iw,ih=im.size
 buffer=BytesIO();im.save(buffer,format='JPEG',quality=90);buffer.seek(0)
 scale=max(w/iw,h/ih) if cover else min(w/iw,h/ih)
 crop=ImageOps.fit(im,(round(w*2),round(h*2))) if cover else im
 iw2,ih2=crop.size;sc=min(w/iw2,h/ih2);dw,dh=iw2*sc,ih2*sc
 asset=build/f'image-{len(slides)}-{len(elements)}.jpg';crop.save(asset,quality=92)
 elements.append(dict(type='image',path=str(asset),x=x+(w-dw)/2,y=H-y-h+(h-dh)/2,w=dw,h=dh))
 c.saveState();p=c.beginPath();p.rect(x,y,w,h);c.clipPath(p,stroke=0)
 c.drawImage(ImageReader(buffer),x+(w-iw*scale)/2,y+(h-ih*scale)/2,iw*scale,ih*scale);c.restoreState()
def base(n,label):
 c.setFillColor(HexColor(BG));c.rect(0,0,W,H,fill=1,stroke=0)
 text('RONNIE CLELAND',42,612,11,bold=True);text('CREATIVE AI PLATFORM ARCHITECT',720,612,10,color=MUTED)
 c.setStrokeColor(HexColor('#25434A'));c.line(42,590,1110,590)
 elements.append(dict(type='line',x=42,y=58,w=1068,h=0))
 text(label.upper(),42,557,11,CYAN,True)
 text('RONNIECLELAND.COM',42,24,9,MUTED);text(f'{n:02} / 12',1060,24,10,CYAN)
def end():
 slides.append(elements.copy());elements.clear();c.showPage()
def split(n,label,title,body,points,img,screenshot=False):
 base(n,label)
 y=para(title,42,520,470,34,39,WHITE)-24
 y=para(body,42,y,456,17,24)-24
 for head,desc in points:
  c.setStrokeColor(HexColor('#31535B'));c.setLineWidth(.7);c.line(42,y+11,492,y+11)
  elements.append(dict(type='line',x=42,y=H-y-11,w=450,h=0))
  text(head,42,y-3,14,CYAN,True);y=para(desc,42,y-20,450,17,24)-25
 assert y>42,(n,y)
 art(img,535,80,575,450,not screenshot)
 if screenshot:text('LUMIFY V2 / PRODUCT INTERFACE',550,61,9,MUTED)
 end()
base(1,'Portfolio / 2026')
art('assets/lumify-studio-perspective.webp',470,70,682,490)
para('Artistic vision.<br/>Practical systems.',42,506,515,48,54,WHITE)
para('I build creative AI tools that keep artists in control of the next decision.',44,352,420,22,31)
text('20+ YEARS OF PRODUCTION CRAFT',44,190,12,CYAN,True)
para('Animation + VFX / Real-time / Creative AI',44,165,420,16,23)
end()
split(2,'The foundation','The craft comes first.','20+ years across animation, VFX, real-time look development, and artist tools shape how I design creative systems.',[
('DREAMWORKS ANIMATION / 2010 - 2021','Department Chair, Look Development Supervisor, and Environment Surfacing Lead.'),('REAL-TIME + CREATIVE INNOVATION','Spire Animation (2021 - 2023) and FableLight Studios (2023 - 2024).'),('PRODUCTION JUDGMENT','Composition, materials, lighting, review, and collaboration at feature-film scale.')],'assets/renaissance-workshop.webp')
split(3,'Lumify / Product ownership','A workspace built around creative intent.','Co-Founder & Chief Creative Technology Officer, Lumify AI / 2024 - Present.',[
('PRODUCT + INTERACTION','Lead creative direction, product strategy, and artist-facing interaction design.'),('HANDS-ON IMPLEMENTATION','Connect responsive interfaces to Python/Flask services, provider routing, asynchronous jobs, and saved work.'),('ONE CREATIVE CONTEXT','Bring the canvas, reference library, shots, and the Cut into a connected workflow.')],'gallery/v2/lumify_v2_Workspace.png',True)
split(4,'References / Creative context','Start with the work.','Give the system the visual context that the artist has already chosen.',[
('REFERENCE LIBRARY','Organize source material and assign reference roles within the project.'),('APPROVAL + LOCK','Review imported references and preserve approved Library context.'),('SAVED DIRECTION','Carry shot and camera choices into generation and review.')],'gallery/v2/lumify_v2_Reference.png',True)
split(5,'Generation / Review before action','Make the next step explicit.','A clear creative action needs a clear decision about what will run.',[
('BATCH STILLS','Select shots, shape their look, and review the proposed generation.'),('QUOTE + APPROVAL','Show estimates and require explicit approval before chargeable generation.'),('CAPABILITY-AWARE CHOICES','Match available controls to model, provider, task, and deployment policy.')],'gallery/v2/lumify_v2_Batch.png',True)
split(6,'Shots / Iteration','Keep the alternatives.','Generation is part of the process. Choosing the right take is an artistic decision.',[
('RETAINED TAKES','Preserve earlier results so artists can return to and compare their options.'),('SHOT VIDEO','Generate from approved inputs and supported model contracts.'),('PREVIEW IS NOT SELECTION','Let artists inspect a take before explicitly choosing Use in Cut.')],'gallery/v2/lumify_v2_Shots.png',True)
split(7,'The Cut / Editorial continuity','Carry decisions into the edit.','The selected take becomes part of a saved sequence, with a visible path to review.',[
('EXPLICIT SELECTION','Assemble the takes the artist has chosen for the Cut.'),('TIMING + REVIEW','Arrange shot timing and assemble a review MP4 from saved video selections.'),('AUDIO WORKFLOWS','Support speech, music, and sound as part of the project workflow.')],'gallery/v2/lumify_v2_Cut.png',True)
base(8,'Architecture / End-to-end ownership')
para('Connect the experience to the system.',42,518,1050,36,44,WHITE)
para('I work across the layers that turn a visual goal into a reviewable result.',42,457,1020,19,26)
cols=[('01 / INTERACTION','Artist-facing state','JavaScript, HTML/CSS, visual controls, validation, and feedback.','assets/generative-vision.webp'),('02 / ORCHESTRATION','Policy, route, execute','Python/Flask, REST APIs, server-controlled routing, job status, and recovery.','assets/pipeline-backend.webp'),('03 / CONTINUITY','Save, trace, review','SQLite, source lineage, revisions, provider provenance, and FFmpeg review export.','assets/workflow-orchestration.webp')]
for i,(label,title,body,img) in enumerate(cols):
 x=42+i*362;art(img,x,240,344,165);text(label,x,215,11,CYAN,True);text(title,x,185,20,bold=True);para(body,x,163,330,16,23)
end()
split(9,'Integration / Evolving capabilities','Models evolve.<br/>Intent stays visible.','Integrate new capabilities through a consistent creative workflow.',[
('PROVIDER CONNECTIONS','Runway, fal.ai, World Labs, and local model services.'),('IMPLEMENTATION PRACTICE','Model/provider adapters, AI Toolkit, hosted and local inference; working knowledge of PyTorch/CUDA, Diffusers, and Transformers.'),('VALID CONTROLS','Deployment policies and model contracts shape which actions and settings are available.')],'assets/compute-ops.webp')
split(10,'Visual + spatial practice','Think beyond a single frame.','Production craft and spatial thinking inform the tools I build for image, motion, and generated worlds.',[
('ARTIST-DIRECTED IMAGE WORK','Relighting, material, time-of-day, and camera controls make creative intent actionable.'),('REAL-TIME FOUNDATION','Unreal Engine and Substance experience connects materials, world building, and interactive feedback.'),('SPATIAL WORKFLOWS','3D and world-generation integrations extend the creative vocabulary alongside image and video.')],'assets/3d-real-time.webp')
split(11,'Design outcomes','Make the process legible.','The product value is in the decisions artists can understand and control.',[
('BEFORE GENERATION','Review references, supported settings, and estimated costs.'),('DURING ITERATION','See job status, retain takes, and trace source context.'),('AFTER REVIEW','Choose what enters the Cut, protect saved revisions, and assemble work for review.')],'assets/reel-light-sculpture.webp')
base(12,'Let’s connect')
art('assets/generative-vision.webp',630,70,522,490)
para('Creative judgment.<br/>Product thinking.<br/>Hands-on delivery.',42,510,590,42,50,WHITE)
para('Building artist-facing AI products, creative research, and visual workflow systems.',44,326,500,21,29)
for label,url,y in [('ronnie@lumifyai.com','mailto:ronnie@lumifyai.com',196),('linkedin.com/in/ronniecleland','https://linkedin.com/in/ronniecleland',155),('ronniecleland.com','https://ronniecleland.com',114)]:
 text(label,44,y,18,CYAN);c.linkURL(url,(44,y-4,420,y+22),relative=0)
end();c.save();(build/'slides.json').write_text(json.dumps(slides));print(OUT)

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
OUT=ROOT/'assets/Ronnie_Cleland_Creative_AI_Platform_Architect_Portfolio_V2.pdf'
W,H=1152,648
c=canvas.Canvas(str(OUT),pagesize=(W,H))
c.setTitle('Ronnie Cleland | Creative AI Platform Architect | Portfolio')
c.setAuthor('Ronnie Cleland')
WHITE='#EFF8F8'; MUTED='#E3EFF0'; CYAN='#47D5DB'; BG='#071D24'
slides=[]; elements=[]
build=ROOT/'artifacts/portfolio-v2-build';build.mkdir(exist_ok=True)
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
# Full-bleed compositions with native, editable text over quiet image areas.
def scene(n,label,img,left=.8,bottom=.85):
 # Composite the code-native legibility gradient into one background surface.
 # Hundreds of adjacent PDF alpha rectangles caused browser stitching seams.
 # Keep source artwork untouched and all foreground text as PDF text.
 import numpy as np
 width,height=2304,1296
 backdrop=ImageOps.fit(Image.open(ROOT/img).convert('RGB'),(width,height))
 xx=np.linspace(0,1,width)[None,:]
 yy=np.linspace(0,1,height)[:,None]
 opacity=1-(1-left*(1-xx)**1.5)*(1-bottom*yy**1.5)
 pixels=np.asarray(backdrop,dtype=np.float32)
 tint=np.array([3,21,28],dtype=np.float32)
 pixels=pixels*(1-opacity[:,:,None])+tint*opacity[:,:,None]
 composed=Image.fromarray(np.clip(np.rint(pixels),0,255).astype('uint8'))
 asset=build/f'continuous-background-{n:02}.jpg'
 composed.save(asset,quality=95,subsampling=0)
 c.drawImage(str(asset),0,0,W,H)
 elements.append(dict(type='image',path=str(asset),x=0,y=0,w=W,h=H))
 text('RONNIE CLELAND',48,610,11,WHITE,True)
 text(label.upper(),48,571,11,CYAN,True)
 text(f'PORTFOLIO / {n:02}',1000,28,10,WHITE)
def finish():
 slides.append(elements.copy());elements.clear();c.showPage()
def notes(points,y=165):
 for i,(head,body) in enumerate(points):
  x=48+i*359
  text(head,x,y,12,CYAN,True)
  bottom=para(body,x,y-15,328,17,23)
  assert bottom>42,(head,bottom)

def visual(n,label,title,body,points,img):
 scene(n,label,img,.85,.94)
 para(title,48,510,660,47,53,WHITE)
 para(body,50,378,520,19,27)
 notes(points);finish()
scene(1,'Creative AI Platform Architect','assets/cinematic-world.webp',.5,.55)
para('Artistic vision.<br/>Human control.',48,485,680,62,69,WHITE)
para('I build creative AI tools that keep artists<br/>in control of the next decision.',51,309,580,24,33)
text('20+ YEARS OF CRAFT / ANIMATION / VFX / REAL-TIME',51,105,12,CYAN,True)
text('RONNIECLELAND.COM',51,75,12,WHITE)
finish()
visual(2,'The foundation','The craft comes first.',
 '20+ years of production experience shape how I design creative systems.',[
 ('DREAMWORKS / 2010 - 2021','Department Chair, Look Development Supervisor, and Environment Surfacing Lead.'),
 ('REAL-TIME + INNOVATION','Spire Animation (2021 - 2023). FableLight Studios (2023 - 2024).'),
 ('VISUAL JUDGMENT','Lighting, materials, composition, and review at feature-film scale.')],'assets/renaissance-workshop.webp')

def product(n,label,title,body,points,screen,bg):
 scene(n,label,bg,.94,.8)
 y=para(title,48,518,420,39,45,WHITE)-22
 y=para(body,50,y,372,18,25)-25
 for head,desc in points:
  text(head,50,y,12,CYAN,True);y=para(desc,50,y-13,365,17,23)-22
 assert y>48,(n,y)
 art(screen,450,145,670,380,False)
 text('LUMIFY V2 / WORKING INTERFACE',467,119,10,WHITE)
 finish()
product(3,'Lumify / Product ownership','Creative intent.<br/>Connected work.',
 'Co-Founder & Chief Creative Technology Officer / 2024 - Present.',[
 ('PRODUCT + DESIGN','Lead the creative direction and artist-facing interaction design.'),
 ('FULL-STACK OWNERSHIP','Connect responsive interfaces to Python/Flask services and model routing.'),
 ('ONE CREATIVE CONTEXT','Bring the canvas, references, shots, and the Cut into a connected workflow.')],
 'gallery/v2/lumify_v2_Workspace.png','assets/generative-vision.webp')
product(4,'References / Context','The idea has<br/>a visual history.',
 'Begin with the material the artist has already chosen.',[
 ('REFERENCE LIBRARY','Organize source material and assign reference roles.'),
 ('APPROVAL + LOCK','Review imported references and preserve approved Library context.'),
 ('SAVED DIRECTION','Carry shot and camera choices into generation and review.')],
 'gallery/v2/lumify_v2_Reference.png','assets/data-science.webp')
product(5,'Generation / Approval','A clear action.<br/>An informed choice.',
 'Make creative direction and generation costs visible before the run.',[
 ('BATCH STILLS','Select shots and shape their look together.'),
 ('QUOTE + APPROVAL','Review estimates and explicitly approve chargeable generation.'),
 ('VALID CONTROLS','Match available settings to the model, task, and deployment policy.')],
 'gallery/v2/lumify_v2_Batch.png','assets/compute-ops.webp')
product(6,'Shots / Iteration','Every take is<br/>a creative choice.',
 'Keep alternatives available as the work evolves.',[
 ('RETAINED TAKES','Return to earlier results and compare options.'),
 ('SHOT VIDEO','Generate from approved inputs and supported model contracts.'),
 ('ARTIST SELECTION','Preview a take before explicitly choosing Use in Cut.')],
 'gallery/v2/lumify_v2_Shots.png','assets/video-post.webp')
product(7,'The Cut / Editorial continuity','The choices<br/>become a sequence.',
 'Carry approved takes into a saved edit and a visible path to review.',[
 ('EXPLICIT SELECTION','Assemble the takes the artist chooses.'),
 ('TIMING + REVIEW','Arrange shot timing and export a review MP4 from saved video selections.'),
 ('SOUND + STORY','Support speech, music, and sound within the project.')],
 'gallery/v2/lumify_v2_Cut.png','assets/reel-light-sculpture.webp')
visual(8,'Architecture / End-to-end ownership','The system carries<br/>the creative intent.',
 'I connect what the artist sees to the services that make the work possible.',[
 ('INTERACTION','JavaScript and HTML/CSS. Direct controls, validation, and visible feedback.'),
 ('ORCHESTRATION','Python/Flask, REST APIs, server-controlled routing, job status, and recovery.'),
 ('CONTINUITY','Saved revisions, source lineage, provider provenance, and review export.')],'assets/pipeline-backend.webp')
visual(9,'Integration / Evolving capabilities','New capabilities.<br/>A coherent workflow.',
 'Models evolve. The artist still needs a clear next step.',[
 ('PROVIDER CONNECTIONS','Runway, fal.ai, World Labs, and local model services.'),
 ('IMPLEMENTATION','Model adapters and AI Toolkit. Working knowledge of PyTorch/CUDA, Diffusers, and Transformers.'),
 ('AVAILABLE ACTIONS','Model contracts and deployment policies define the supported controls.')],'assets/workflow-orchestration.webp')
visual(10,'Spatial thinking / Real-time craft','A world beyond<br/>the frame.',
 'Materials, light, and camera direction connect image-making with spatial exploration.',[
 ('IMAGE DIRECTION','Relighting, material, time-of-day, and camera workflows make intent actionable.'),
 ('REAL-TIME FOUNDATION','Unreal Engine and Substance experience in world building and look development.'),
 ('SPATIAL WORKFLOWS','3D and generated-world integrations extend the creative vocabulary.')],'assets/3d-real-time.webp')
visual(11,'Design outcomes / Artist control','Confidence comes<br/>from visible decisions.',
 'Give artists a process they can inspect, revisit, and direct.',[
 ('BEFORE GENERATION','Review references, supported settings, and estimated costs.'),
 ('DURING ITERATION','See job status, retain earlier takes, and trace source context.'),
 ('AFTER REVIEW','Select takes for the Cut, protect saved revisions, and assemble work for review.')],'assets/lumify-system-field.png')
scene(12,'Let’s connect','assets/cinematic-observatory.webp',.92,.7)
para('An artist’s eye.<br/>A builder’s mind.',48,487,690,58,65,WHITE)
para('Creative AI products, visual workflows,<br/>and tools that serve the person creating.',50,306,600,23,32)
for label,url,y in [('ronnie@lumifyai.com','mailto:ronnie@lumifyai.com',170),('linkedin.com/in/ronniecleland','https://linkedin.com/in/ronniecleland',130),('ronniecleland.com','https://ronniecleland.com',90)]:
 text(label,50,y,18,CYAN);c.linkURL(url,(50,y-4,430,y+22),relative=0)
finish();c.save();(build/'slides.json').write_text(json.dumps(slides));print(OUT)

import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '/Users/ronniec/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const root=process.cwd(), dir=root+'/artifacts/portfolio-v2-build';
const pages=JSON.parse(await fs.readFile(dir+'/slides.json','utf8'));
const p=Presentation.create({slideSize:{width:1152,height:648}});
for(const [i,items] of pages.entries()){
 const slide=p.slides.add();slide.background.fill='#071D24';
 const bg=await fs.readFile(`${dir}/bg-${String(i+1).padStart(2,'0')}.jpg`);
 slide.images.add({blob:new Uint8Array(bg),contentType:'image/jpeg',position:{left:0,top:0,width:1152,height:648}});
 const start=items.findIndex(e=>e.type==='text');
 for(const e of items.slice(start)){
  if(e.type==='image'){
   const data=await fs.readFile(e.path);
   slide.images.add({blob:new Uint8Array(data),contentType:'image/jpeg',position:{left:e.x,top:e.y,width:e.w,height:e.h}});
  }else if(e.type==='text'){
   const sh=slide.shapes.add({geometry:'textbox',position:{left:e.x,top:e.y,width:e.w,height:e.h},fill:'none',line:{fill:'none',width:0}});
   sh.text=e.text;sh.text.style={fontFamily:'Liberation Sans',fontSize:e.size,bold:e.bold,color:e.color,insets:{left:0,right:0,top:0,bottom:0}};
  }else{
   slide.shapes.add({geometry:'rect',position:{left:e.x,top:e.y,width:e.w,height:.7},fill:'#31535B',line:{fill:'none',width:0}});
  }
 }
 const png=await p.export({slide,format:'png',scale:1});await fs.writeFile(`${dir}/ppt-${i+1}.png`,new Uint8Array(await png.arrayBuffer()));
}
await(await PresentationFile.exportPptx(p)).save(dir+'/candidate.pptx');
const skill='/Users/ronniec/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
const {finalizePresentation}=await import(skill+'/container_tools/artifact_tool_utils.mjs');
await finalizePresentation({workspaceDir:root,candidatePath:dir+'/candidate.pptx',finalPath:root+'/artifacts/portfolio-output/portfolio-main.pptx',explicitTotalSlideCount:12,pythonExecutable:'/Users/ronniec/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','10972800,6172200'],verifyArtifactToolImport:true,receiptPath:dir+'/validation-main.json'});

// Keep native scrolling, with measured placeholders for distant recipe blocks.
// Whole cards are inserted together, ahead of the viewport; no deferred title paint.
let active=null;
export function disposeCatalogViewport(){active?.dispose();active=null;}
export function renderCatalogViewport(root,html){
 disposeCatalogViewport();
 const template=document.createElement('template');template.innerHTML=html;
 const children=[...template.content.children],chunks=[];
 root.classList.add('catalog-windowed');root.dataset.recipeCount=String(template.content.querySelectorAll('details[data-recipe]').length);
 root.replaceChildren();
 for(let i=0;i<children.length;i+=32){
  const node=document.createElement('div');node.className='catalog-chunk';node.append(...children.slice(i,i+32));root.append(node);
  chunks.push({node,html:'',height:0,mounted:true});
 }
 let disposed=false,frame=0,remeasure=true,width=root.clientWidth;
 const schedule=()=>{if(!disposed&&!frame)frame=requestAnimationFrame(update);};
 const observer=new ResizeObserver(entries=>{
  if(disposed)return;
  for(const entry of entries){const chunk=chunks.find(c=>c.node===entry.target);if(chunk?.mounted){const height=entry.borderBoxSize?.[0]?.blockSize??entry.target.getBoundingClientRect().height;if(Math.abs(height-chunk.height)>.5){chunk.height=height;schedule();}}}
 });
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',resize);root.classList.remove('catalog-windowed');}
 function resize(){if(Math.abs(root.clientWidth-width)>1){width=root.clientWidth;remeasure=true;}schedule();}
 function mount(chunk){if(chunk.mounted)return;chunk.node.style.height='';chunk.node.innerHTML=chunk.html;chunk.mounted=true;}
 function update(){
  frame=0;if(disposed)return;if(!root.isConnected){dispose();return;}
  if(remeasure){
   for(const chunk of chunks)mount(chunk);
   // One layout pass, only on first entry or a width change, never on scrolling.
   const heights=chunks.map(c=>c.node.getBoundingClientRect().height);
   chunks.forEach((c,i)=>{c.height=heights[i];});remeasure=false;
  }
  const rect=root.getBoundingClientRect(),height=innerHeight,overscan=Math.max(1800,height*3),from=-rect.top-overscan,to=-rect.top+height+overscan;
  let offset=0;
  for(const chunk of chunks){
   const end=offset+chunk.height,visible=end>=from&&offset<=to;
   if(visible)mount(chunk);
   else if(chunk.mounted&&!chunk.node.querySelector('details[open]')&&!chunk.node.matches(':focus-within')){
    chunk.html=chunk.node.innerHTML;chunk.node.style.height=chunk.height+'px';chunk.node.replaceChildren();chunk.mounted=false;
   }
   offset=end;
  }
 }
 for(const chunk of chunks)observer.observe(chunk.node);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize,{passive:true});
 active={dispose};schedule();
}

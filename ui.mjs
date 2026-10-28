// Keep existing controls and focus while quantities or remote data change.
const key=node=>node.nodeType===1?(node.getAttribute('data-key')||node.getAttribute('data-recipe')||node.id):null;
function morph(current,next){
 if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName){current.replaceWith(next.cloneNode(true));return;}
 if(current.nodeType===3){if(current.nodeValue!==next.nodeValue)current.nodeValue=next.nodeValue;return;}
 if(current.nodeType!==1)return;
 const active=current===document.activeElement;
 for(const attr of [...current.attributes])if(!next.hasAttribute(attr.name))current.removeAttribute(attr.name);
 for(const attr of [...next.attributes])if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);
 patch(current,[...next.childNodes]);
 if(!active&&['INPUT','SELECT','TEXTAREA'].includes(current.tagName)&&current.type!=='file'&&current.value!==next.value)current.value=next.value;
}
function patch(parent,incoming){
 const old=[...parent.childNodes],keyed=new Map(old.map(n=>[key(n),n]).filter(([k])=>k)),used=new Set();
 let cursor=parent.firstChild;
 for(const next of incoming){
  const id=key(next);let current=id?keyed.get(id):cursor;
  if(current&&(used.has(current)||(!id&&key(current))||current.nodeType!==next.nodeType||current.nodeName!==next.nodeName))current=null;
  if(!current){current=next.cloneNode(true);parent.insertBefore(current,cursor);}else{if(current!==cursor)parent.insertBefore(current,cursor);morph(current,next);}
  used.add(current);cursor=current.nextSibling;
 }
 for(const node of old)if(!used.has(node)&&node.parentNode===parent)node.remove();
}
export function reconcile(parent,html){const template=document.createElement('template');template.innerHTML=html;patch(parent,[...template.content.childNodes]);}
export function readPreference(key,fallback=''){try{return localStorage.getItem(key)??fallback;}catch{return fallback;}}
export function writePreference(key,value){try{localStorage.setItem(key,value);}catch{/* Preferences are optional; data writes use the strict journal. */}}

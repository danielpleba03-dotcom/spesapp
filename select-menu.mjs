export function enhanceSelects(){
 let serial=0,open=null;
 const close=(focus=false)=>{if(!open)return;const {box,trigger,list}=open;box.classList.remove('is-open');if(list.matches(':popover-open'))list.hidePopover();list.hidden=true;trigger.setAttribute('aria-expanded','false');open=null;if(focus)trigger.focus();};
 function sync(){
  if(open&&!open.box.isConnected)close();
  for(const select of document.querySelectorAll('select')){
   if(!select._menu){
    const box=document.createElement('span');box.className='select-menu';select.before(box);box.append(select);select.classList.add('select-native');select.tabIndex=-1;
    const trigger=document.createElement('button');trigger.type='button';trigger.className='select-trigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
    const list=document.createElement('span');list.className='select-options';list.id='select-options-'+(++serial);list.setAttribute('role','listbox');if('showPopover' in list)list.setAttribute('popover','manual');list.hidden=true;trigger.setAttribute('aria-controls',list.id);box.append(trigger,list);
    const menu={box,trigger,list,select};select._menu=menu;
    trigger.addEventListener('click',event=>{event.preventDefault();if(open===menu){close();return;}close();open=menu;box.classList.add('is-open');list.hidden=false;if('showPopover' in list){const rect=trigger.getBoundingClientRect(),height=Math.min(220,select.options.length*42+12);Object.assign(list.style,{position:'fixed',margin:'0',inset:'auto',minWidth:rect.width+'px',width:Math.max(rect.width,90)+'px',left:Math.min(rect.left,innerWidth-Math.max(rect.width,90)-8)+'px',top:(rect.bottom+height+8>innerHeight?Math.max(8,rect.top-height-6):rect.bottom+6)+'px'});list.showPopover();}trigger.setAttribute('aria-expanded','true');(list.querySelector('[aria-selected="true"]:not(:disabled)')||list.querySelector('button:not(:disabled)'))?.focus();});
    trigger.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();trigger.click();}});
    list.addEventListener('keydown',event=>{const options=[...list.querySelectorAll('button:not(:disabled)')],i=options.indexOf(document.activeElement);let next;if(event.key==='ArrowDown')next=(i+1)%options.length;if(event.key==='ArrowUp')next=(i-1+options.length)%options.length;if(event.key==='Home')next=0;if(event.key==='End')next=options.length-1;if(next!==undefined){event.preventDefault();options[next]?.focus();}else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey){options.find(b=>b.textContent.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()))?.focus();}});
   }
   const {trigger,list}=select._menu,selected=select.selectedOptions[0],text=selected?.textContent||'Scegli';
   if(trigger.textContent!==text)trigger.textContent=text;
   const label=select.getAttribute('aria-label')||select.labels?.[0]?.childNodes[0]?.textContent?.trim()||'Scegli';trigger.setAttribute('aria-label',label+': '+text);trigger.disabled=select.disabled;
   const signature=[...select.options].map(o=>[o.value,o.textContent,o.disabled,o.selected].join('|')).join('\n');
   if(list.dataset.signature!==signature){list.dataset.signature=signature;list.replaceChildren();for(const option of select.options){const button=document.createElement('button');button.type='button';button.setAttribute('role','option');button.setAttribute('aria-selected',String(option.selected));button.textContent=option.textContent;button.disabled=option.disabled;button.addEventListener('click',event=>{event.preventDefault();if(option.disabled)return;select.value=option.value;close(true);select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));sync();});list.append(button);}}
  }
 }
 new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});
 for(const event of ['input','change'])document.addEventListener(event,()=>queueMicrotask(sync));
 document.addEventListener('click',event=>{if(open&&!open.box.contains(event.target))close();});
 document.addEventListener('keydown',event=>{if(open&&event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}else if(open&&event.key==='Tab')close();},true);
 document.addEventListener('focusin',event=>{if(open&&!open.box.contains(event.target))close();});
 document.addEventListener('scroll',()=>close(),true);addEventListener('resize',()=>close());
 sync();
}


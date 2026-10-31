// A portrait-sized browsing context keeps dialogs, popovers and hit targets aligned
// when a browser cannot lock the physical display orientation (notably iOS).
export function portraitGeometry(width,height,angle=0,landscape=width>height){
 if(!landscape)return {width,height,left:0,top:0,rotation:0};
 const clockwise=angle===270||angle===-90;
 return {width:height,height:width,left:clockwise?width:0,top:clockwise?0:height,rotation:clockwise?90:-90};
}
export function mountPortraitShell(){
 if(window.self!==window.top)return false;
 const phone=/iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);
 const localPreview=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('preview')==='1';
 if(!phone&&!(localPreview&&innerWidth<=650&&innerHeight>innerWidth))return false;
 document.body.classList.add('portrait-shell');
 const frame=document.createElement('iframe');frame.className='portrait-frame';frame.title='Spesapp';frame.src=location.href;
 document.body.replaceChildren(frame);
 const layout=()=>{
  const angle=typeof window.orientation==='number'?window.orientation:(screen.orientation?.angle||0);
  const landscape=phone?(typeof window.orientation==='number'?Math.abs(window.orientation)===90:screen.orientation?.type?screen.orientation.type.startsWith('landscape'):innerWidth>innerHeight):innerWidth>innerHeight;
  const g=portraitGeometry(innerWidth,innerHeight,angle,landscape);
  Object.assign(frame.style,{width:g.width+'px',height:g.height+'px',left:g.left+'px',top:g.top+'px',transform:`rotate(${g.rotation}deg)`});
 };
 layout();addEventListener('resize',layout);addEventListener('orientationchange',layout);screen.orientation?.addEventListener('change',layout);
 return true;
}


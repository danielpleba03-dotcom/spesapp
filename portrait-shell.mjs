// A portrait-sized browsing context keeps dialogs, popovers and hit targets aligned
// when a browser cannot lock the physical display orientation (notably iOS).
export function portraitGeometry(width,height,angle=0,landscape=width>height){
 if(!landscape)return {width,height,left:0,top:0,rotation:0};
 const clockwise=angle===270||angle===-90;
 return {width:height,height:width,left:clockwise?width:0,top:clockwise?0:height,rotation:clockwise?90:-90};
}
export function portraitInsets(insets,rotation,baselineTop=0,baselineBottom=0){
 const top=rotation===-90?insets.left:rotation===90?insets.right:insets.top;
 const bottom=rotation===-90?insets.right:rotation===90?insets.left:insets.bottom;
 return {top:Math.max(top,baselineTop),bottom:Math.max(bottom,baselineBottom)};
}
export function mountPortraitShell(){
 if(window.self!==window.top)return false;
 const phone=/iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent);
 const localPreview=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('preview')==='1';
 if(!phone&&!(localPreview&&innerWidth<=650&&innerHeight>innerWidth))return false;
 document.body.classList.add('portrait-shell');
 const frame=document.createElement('iframe');frame.className='portrait-frame';frame.title='Spesapp';frame.src=location.href;
 document.body.replaceChildren(frame);
 const probe=document.createElement('div');probe.className='safe-area-probe';document.body.append(probe);
 let portraitTop=0,portraitBottom=0,portraitWidth=Math.min(innerWidth,innerHeight),lastRotation=-90,previousLandscape=false;
 const layout=()=>{
  const width=innerWidth,height=innerHeight;
  // Dimensions update before orientation metadata on iOS. A keyboard changes
  // height but does not widen the display, so it must not trigger rotation.
  const landscape=width>height&&width>portraitWidth*1.25;
  if(landscape!==previousLandscape){previousLandscape=landscape;settle();}
  const angle=typeof window.orientation==='number'?window.orientation:(screen.orientation?.angle||0);
  const g=portraitGeometry(width,height,angle,landscape);
  if(landscape){if(angle===0)g.rotation=lastRotation;else lastRotation=g.rotation;g.left=g.rotation===90?width:0;g.top=g.rotation===90?0:height;}
  else portraitWidth=width;
  const css=getComputedStyle(probe),insets={top:parseFloat(css.paddingTop)||0,right:parseFloat(css.paddingRight)||0,bottom:parseFloat(css.paddingBottom)||0,left:parseFloat(css.paddingLeft)||0};
  if(!landscape){portraitTop=Math.max(portraitTop,insets.top);portraitBottom=Math.max(portraitBottom,insets.bottom);}
  const safe=portraitInsets(insets,g.rotation,portraitTop,portraitBottom);
  Object.assign(frame.style,{width:g.width+'px',height:g.height+'px',left:g.left+'px',top:g.top+'px',transform:`rotate(${g.rotation}deg)`});
  try{const root=frame.contentDocument?.documentElement;if(root){root.style.setProperty('--app-safe-top',safe.top+'px');root.style.setProperty('--app-safe-bottom',safe.bottom+'px');}}catch{}
 };
 frame.addEventListener('load',layout);
 let settleTimer;
 const settle=()=>{const root=frame.contentDocument?.documentElement;if(!root)return;root.classList.add('orientation-settling');clearTimeout(settleTimer);settleTimer=setTimeout(()=>root.classList.remove('orientation-settling'),1200);};
 const refresh=()=>{layout();requestAnimationFrame(layout);};
 const rotating=()=>{settle();refresh();};
 refresh();addEventListener('resize',refresh);addEventListener('orientationchange',rotating);screen.orientation?.addEventListener('change',rotating);window.visualViewport?.addEventListener('resize',refresh);

 return true;
}



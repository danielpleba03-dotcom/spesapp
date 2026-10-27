import {emptyState,applyAction} from './domain.mjs';
import {firebaseConfig} from './firebase-config.mjs';
export async function createStore(recipes,onChange,onError){
 const preview=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('preview')==='1';
 if(preview){
  let value=JSON.parse(localStorage.getItem('spesapp-preview')||'null')||emptyState(recipes);
  const notify=()=>onChange(structuredClone(value),{preview:true,ready:true,online:true,pending:0});
  const store={dispatch:action=>{value=applyAction(value,action);localStorage.setItem('spesapp-preview',JSON.stringify(value));notify();},logout:()=>location.reload(),login:()=>{},get state(){return value;},user:{displayName:'Anteprima locale'},preview:true};
  queueMicrotask(notify);return store;
 }
 if(!firebaseConfig)throw Error('La versione online è in preparazione. Completa la configurazione Firebase prima della pubblicazione.');
 const base='https://www.gstatic.com/firebasejs/13.1.0/';
 const [{initializeApp},authSDK,fire]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
 const app=initializeApp(firebaseConfig),auth=authSDK.getAuth(app);
 const db=fire.initializeFirestore(app,{localCache:fire.persistentLocalCache({tabManager:fire.persistentMultipleTabManager()})});
 let remote=emptyState(recipes),queue=[],unsub=null,user=null,ready=false,flushing=false,pending=false,queueKey='',retry=null;
 const persist=()=>localStorage.setItem(queueKey,JSON.stringify(queue));
 function emit(){let visible=structuredClone(remote);for(const action of queue){try{visible=applyAction(visible,action);}catch{}}onChange(visible,{ready,online:navigator.onLine,pending:queue.length,authenticated:!!user,user});}
 async function flush(){
  if(flushing||!user||!ready||!navigator.onLine)return;flushing=true;
  try{while(queue.length&&user&&navigator.onLine){
   const action=queue[0],ref=fire.doc(db,'users',user.uid,'data','main');
   try{
    await fire.runTransaction(db,async tx=>{
     const snap=await tx.get(ref),before=snap.exists()?snap.data():emptyState(recipes);
     const after=applyAction(before,action),today=new Date().toISOString().slice(0,10);
     if(new TextEncoder().encode(JSON.stringify(after)).length>800000)throw Error('Archivio quasi pieno: esporta un backup prima di aggiungere altri dati.');
     if(before.backupDate!==today){tx.set(fire.doc(db,'users',user.uid,'backups',today),before);after.backupDate=today;}
     tx.set(ref,after);
    });
    queue=queue.filter(x=>x.id!==action.id);persist();emit();
   }catch(error){
    if(['unavailable','deadline-exceeded','aborted','resource-exhausted'].includes(error.code)){clearTimeout(retry);retry=setTimeout(flush,10000);break;}
    if(error.code==='permission-denied'){onError(Error('Accesso ai dati non consentito. Usa il tuo account autorizzato.'));break;}
    queue=queue.filter(x=>x.id!==action.id);persist();emit();onError(error);
   }
  }}finally{flushing=false;}
 }
 const store={
  login:()=>authSDK.signInWithPopup(auth,new authSDK.GoogleAuthProvider()),
  async logout(){if(queue.length)throw Error('Attendi la sincronizzazione delle modifiche prima di uscire.');await authSDK.signOut(auth);location.reload();},
  dispatch(action){if(!user||!ready)throw Error('Attendi il caricamento dei tuoi dati.');applyAction(store.state,action);queue.push(action);persist();emit();void flush();},
  get state(){let visible=structuredClone(remote);for(const a of queue){try{visible=applyAction(visible,a);}catch{}}return visible;},
  get user(){return user;},preview:false
 };
 authSDK.onAuthStateChanged(auth,async next=>{
  unsub?.();user=next;ready=false;remote=emptyState(recipes);queue=[];
  if(!next){emit();return;}
  queueKey='spesapp-pending-'+next.uid;
  try{queue=JSON.parse(localStorage.getItem(queueKey)||'[]');}catch{queue=[];}
  const ref=fire.doc(db,'users',next.uid,'data','main');
  unsub=fire.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
   if(snapshot.exists()){remote=snapshot.data();ready=true;emit();void flush();}
   else if(!snapshot.metadata.fromCache){
    void fire.runTransaction(db,async tx=>{const current=await tx.get(ref);if(!current.exists())tx.set(ref,emptyState(recipes));}).catch(onError);
   }
  },error=>{ready=false;emit();onError(error.code==='permission-denied'?Error('Questo account non è autorizzato ad aprire Spesapp.'):error);});
  emit();
 });
 addEventListener('online',()=>{emit();void flush();});addEventListener('offline',emit);
 return store;
}

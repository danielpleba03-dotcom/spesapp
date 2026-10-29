import {emptyState,applyAction,validateState,DomainError,assertCapacity} from './domain.mjs?v=20261029-colors';
import {createJournal} from './journal.mjs?v=20261029-colors';
import {firebaseConfig} from './firebase-config.mjs?v=20261029-colors';
export function cloudMessage(error){
 const code=String(error?.code||'');
 if(code.includes('popup-closed-by-user')||code.includes('cancelled-popup-request'))return 'Accesso annullato. Puoi riprovare quando vuoi.';
 if(code.includes('popup-blocked'))return 'Il browser ha bloccato la finestra Google. Consenti i popup per questo sito e riprova.';
 if(code.includes('unauthorized-domain'))return 'Questo indirizzo non è autorizzato per l’accesso. Apri il collegamento ufficiale di Spesapp.';
 if(code.includes('permission-denied'))return 'Accesso ai dati non consentito. Usa il tuo account Google autorizzato.';
 if(code.includes('resource-exhausted'))return 'Quota temporaneamente raggiunta. Le modifiche restano salvate sul dispositivo e saranno ritentate.';
 if(code.includes('network-request-failed')||code.includes('unavailable'))return 'Connessione non disponibile. Le modifiche restano sul dispositivo.';
 return error instanceof DomainError?error.message:typeof error?.message==='string'&&!code?error.message:'Non è stato possibile completare l’operazione. I dati non sono stati cancellati. Riprova tra poco.';
}
export async function createStore(recipes,onChange,onError,dependencies={}){
 const preview=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('preview')==='1';
 if(preview){
  let saved;try{saved=localStorage.getItem('spesapp-preview');}catch{}
  let value=saved?validateState(JSON.parse(saved)):emptyState(recipes);
  const notify=()=>onChange(structuredClone(value),{preview:true,authenticated:true,ready:true,online:true,pending:0});
  const store={dispatch:action=>{const next=applyAction(value,action);localStorage.setItem('spesapp-preview',JSON.stringify(next));value=next;notify();},logout:()=>location.reload(),login:()=>{},get state(){return structuredClone(value);},user:{displayName:'Anteprima locale'},preview:true};
  queueMicrotask(notify);return store;
 }
 if(!firebaseConfig)throw Error('Configurazione del servizio non disponibile. Riprova più tardi.');
 const base='https://www.gstatic.com/firebasejs/13.1.0/';
 const [{initializeApp},authSDK,fire]=dependencies.sdk||await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
 const app=initializeApp(firebaseConfig),auth=authSDK.getAuth(app);
 const db=fire.initializeFirestore(app,{localCache:fire.persistentLocalCache({tabManager:fire.persistentMultipleTabManager()})});
 let session=null,unsub=null,epoch=0;
 const report=e=>onError(Error(cloudMessage(e)));
 function visible(s){let result=structuredClone(s.remote);for(const a of s.journal?.list()||[]){try{result=applyAction(result,a);}catch{}}return result;}
 function emit(){const s=session;if(!s){onChange(emptyState(),{ready:false,online:navigator.onLine,pending:0,authenticated:false});return;}try{onChange(visible(s),{ready:s.ready,online:navigator.onLine,pending:s.journal?.list().length||0,authenticated:true,user:s.user,error:s.error,fromCache:s.fromCache});}catch(e){s.ready=false;s.error=cloudMessage(e);onChange(s.remote,{ready:false,online:navigator.onLine,authenticated:true,pending:0,error:s.error});}}
 function retry(s,delay=10000){clearTimeout(s.retry);if(s===session)s.retry=setTimeout(()=>void flush(s),delay);}
 async function flush(s=session){
  if(!s||s!==session||s.flushing||!s.ready||!navigator.onLine)return;
  s.flushing=true;
  try{while(s===session&&navigator.onLine){
   const action=s.journal.list()[0];if(!action)break;const snapshotVersion=s.snapshotVersion;
   const ref=fire.doc(db,'users',s.user.uid,'data','main'),receipt=fire.doc(db,'users',s.user.uid,'receipts',action.id);
   try{
    const committed=await fire.runTransaction(db,async tx=>{
     if(s!==session)throw Object.assign(Error('Sessione cambiata'),{code:'cancelled'});
     const snap=await tx.get(ref),done=await tx.get(receipt);
     if(!snap.exists())throw Object.assign(Error('Archivio non disponibile. Riprova più tardi.'),{code:'unavailable'});
     let before;try{before=validateState(snap.data());}catch{throw Object.assign(Error('Archivio non valido. Le modifiche sul dispositivo sono conservate.'),{code:'data-corrupt'});}
     if(done.exists())return before;
     const after=applyAction(before,action),today=new Date().toISOString().slice(0,10);
     let backupRef,backup;
     if(before.backupDate!==today){backupRef=fire.doc(db,'users',s.user.uid,'backups',today);backup=await tx.get(backupRef);after.backupDate=today;}
     assertCapacity(after);
     if(backupRef&&!backup.exists())tx.set(backupRef,before);
     tx.set(ref,after);tx.set(receipt,{createdAt:fire.serverTimestamp(),type:action.type});return after;
    });
    // Local acknowledgement can be lost without repeating the operation: the receipt survives.
    s.journal.remove(action.id);if(s===session){if(s.snapshotVersion===snapshotVersion)s.remote=committed;s.error='';emit();}
   }catch(error){
    if(s!==session)break;
    if(error instanceof DomainError){s.journal.remove(action.id);report(error);emit();continue;}
    s.error=cloudMessage(error);emit();retry(s,error.code==='permission-denied'?30000:10000);break;
   }
  }}catch(e){if(s===session){s.error=cloudMessage(e);report(e);emit();retry(s);}}finally{s.flushing=false;}
 }
 const store={
  login:()=>authSDK.signInWithPopup(auth,new authSDK.GoogleAuthProvider()).catch(e=>{throw Error(cloudMessage(e));}),
  async logout(){if(session?.journal?.list().length)throw Error('Attendi il salvataggio delle modifiche prima di uscire.');await authSDK.signOut(auth);},
  dispatch(action){const s=session;if(!s?.ready)throw Error('Attendi il caricamento dei tuoi dati.');applyAction(visible(s),action);s.journal.put(action);emit();void flush(s);},
  get state(){return session?visible(session):emptyState();},get user(){return session?.user;},preview:false
 };
 authSDK.onAuthStateChanged(auth,next=>{
  unsub?.();if(session)clearTimeout(session.retry);epoch++;
  if(!next){session=null;emit();return;}
  const s={epoch,user:next,remote:emptyState(recipes),ready:false,journal:null,error:'',fromCache:true,snapshotVersion:0,flushing:false,retry:null};session=s;
  try{s.journal=createJournal(localStorage,next.uid);}catch(e){s.error=e.message;emit();return;}
  const ref=fire.doc(db,'users',next.uid,'data','main');
  unsub=fire.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
   if(s!==session)return;s.snapshotVersion++;
   if(snapshot.exists()){
    try{s.remote=validateState(snapshot.data());s.ready=true;s.fromCache=snapshot.metadata.fromCache;s.error='';emit();void flush(s);}
    catch{ s.ready=false;s.error='I dati dell’archivio non sono leggibili. Non sono stati modificati: contatta l’assistenza.';emit();}
   }else if(!snapshot.metadata.fromCache){
    void fire.runTransaction(db,async tx=>{const current=await tx.get(ref);if(!current.exists())tx.set(ref,emptyState(recipes));}).catch(e=>{if(s===session){s.error=cloudMessage(e);emit();}});
   }else{emit();}
  },error=>{if(s===session){s.ready=false;s.error=cloudMessage(error);emit();}});
  emit();
 });
 addEventListener('storage',event=>{const s=session;if(s?.journal?.matches(event.key)){emit();void flush(s);}});
 addEventListener('online',()=>{emit();void flush();});addEventListener('offline',emit);
 return store;
}

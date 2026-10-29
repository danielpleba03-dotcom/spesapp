import {validateAction,DomainError} from './domain.mjs?v=20261029-suggestionclose';
// One immutable local entry per operation: tabs never overwrite a shared array.
export function createJournal(storage,uid){
 const prefix='spesapp-operation-'+encodeURIComponent(uid)+':',legacy='spesapp-pending-'+uid;
 const storageError=()=>new Error('Il browser non consente di salvare le modifiche sul dispositivo. Non chiudere l’app e controlla le impostazioni di archiviazione.');
 function list(){
  const result=[];
  try{for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith(prefix))continue;const raw=storage.getItem(key);if(raw===null)continue;const value=validateAction(JSON.parse(raw));if(key!==prefix+value.id)throw Error();result.push(value);}}
  catch{throw new Error('Una modifica salvata sul dispositivo non è leggibile. I dati sono conservati: contatta l’assistenza prima di cancellare la memoria del browser.');}
  return result.sort((a,b)=>(a.at||0)-(b.at||0)||a.id.localeCompare(b.id));
 }
 function put(action){validateAction(action);if(storage.getItem(prefix+action.id)!==null)return;const entries=list();if(entries.length>=2000)throw new DomainError('Troppe modifiche in attesa. Collegati a Internet e attendi la sincronizzazione.');try{storage.setItem(prefix+action.id,JSON.stringify({...action,at:Math.max(Date.now(),(entries.at(-1)?.at||0)+1,Number(action.at)||0)}));}catch{throw storageError();}}
 function remove(id){try{storage.removeItem(prefix+id);}catch{throw storageError();}}
 function migrate(){let value;try{value=storage.getItem(legacy);}catch{throw storageError();}if(value===null)return;let previous;try{previous=JSON.parse(value);if(!Array.isArray(previous))throw Error();previous.forEach(validateAction);}catch{throw new Error('La coda delle modifiche precedente non è leggibile. Non cancellare i dati del browser.');}for(const a of previous)put(a);try{storage.removeItem(legacy);}catch{throw storageError();}}
 migrate();return {list,put,remove,matches:key=>key?.startsWith(prefix)||key===legacy};
}

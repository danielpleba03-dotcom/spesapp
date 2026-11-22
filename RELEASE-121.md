# Spesapp — 22 novembre 2026, avvio più leggero

Il telefono apre Spesa senza inizializzare l'interfaccia del Piano, il risolutore «Non trovo» o l'abbonamento Firestore delle settimane. Il Piano viene inizializzato una sola volta quando si apre la sezione o si usa «Non trovo». In presenza di operazioni settimanali locali non ancora salvate, parte comunque il recupero per l'account corrente. Sul PC resta Piano → Settimana come schermata iniziale.

La creazione dell'archivio iniziale da 5.000 ricette è ora una funzione differita: viene eseguita soltanto se manca il documento dell'utente o nell'anteprima senza dati. Un utente esistente non ricrea né valida una seconda copia di tutte le ricette prima di leggere il proprio archivio. Le importazioni di aggiornamento vengono programmate nei tempi liberi del browser dopo la prima schermata, con un'uscita rapida quando sono già complete. Il controllo dell'unità del prodotto non scorre più tutte le ricette quando il campo è vuoto e riutilizza un indice mentre lo stato non cambia.

Quando Firestore conferma dal server un documento già ricevuto identico dalla cache, l'app aggiorna i metadati senza validare nuovamente tutte le ricette. Ogni documento con dati cambiati continua a essere validato; le verifiche contro risposte obsolete e le code offline restano attive.

I cataloghi immutabili conservano gli URL della versione 120; un aggiornamento dell'interfaccia non cambia più inutilmente l'indirizzo di tutti i dati. Il service worker installa sei risorse essenziali, invece di precaricare l'intera app, i cataloghi storici, seed.json e tutti gli SDK. Riutilizza i cataloghi già presenti e conserva una release precedente per le schede aperte. Le risposte di rete non attendono la scrittura su disco della cache.

Dopo l'apertura, le risorse effettivamente usate e quattro piccoli moduli del Piano vengono conservati per l'uso offline con tre trasferimenti al massimo in parallelo, riutilizzando la cache HTTP. Il Piano non viene eseguito o sincronizzato solo per preparare questi file. Se un modulo non è disponibile, compare un errore con «Riprova» invece di un caricamento senza fine. Il primo «Non trovo» attende i dati delle settimane senza richiedere un secondo tocco.

Ricette, quantità, preparazioni, preferiti, settimana e codice di accesso sono conservati. Non cambia la selezione dei pasti né la logica della spesa.

Verifiche: avvio mobile con 5.000 ricette senza richieste week-ui/week-store/shopping-resolution-ui, successiva apertura del Piano, primo «Non trovo», PC con settimana completa, riapertura offline e prima apertura del Piano offline. Controllati installazione della cache, riuso dei dati, scritture lente, isolamento delle code per account, seed differito, sincronizzazione concorrente, preparazioni, unità, sostituzioni della spesa e bilanciamento settimanale.

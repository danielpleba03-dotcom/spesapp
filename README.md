# Spesapp web

Versione installabile, solo dark, pensata per GitHub Pages e Firebase Spark.

## File pubblici
Solo questa cartella `web` deve essere caricata su GitHub. Il database SQLite,
i backup, il file `migrazione-spesapp.json` e le regole con l'indirizzo personale
rimangono nella cartella superiore e non devono essere pubblicati.
La configurazione web Firebase identifica il progetto: non è una credenziale
amministrativa. La protezione dei dati è nelle regole Firestore.

## Attivazione
1. Creare il progetto Firebase senza Analytics, Gemini o fatturazione.
2. Attivare Authentication con Google e Firestore Standard in area europea.
3. Pubblicare le regole private nella console Firestore: solo il proprietario
   verificato può leggere o modificare il suo documento. Gli altri utenti non
   possono accedere; nessuna regola di test pubblica.
4. Inserire i dati della registrazione web in firebase-config.mjs.
5. Caricare solo i file web nel repository GitHub pubblico e attivare Pages
   dalla radice del ramo main. Non serve GitHub Actions.
6. Aggiungere il dominio github.io del proprietario ai domini autorizzati di
   Firebase Authentication. Accedere con il proprio Google account.
7. Non importare dati di prova nel sito pubblico: le installazioni esistenti mantengono il proprio archivio.

## Dati e uso offline
Le modifiche vengono applicate tramite transazioni Firestore con identificativo
univoco: un acquisto ripetuto non viene conteggiato due volte. Le azioni offline
sono accodate sul dispositivo e inviate quando la connessione ritorna.
Usare l'app offline solo dopo un primo accesso e caricamento completo online.
Non uscire dall'account finché rimangono modifiche da sincronizzare.
La prima modifica giornaliera crea una copia immutabile dello stato precedente
su Firestore. Importazione ed esportazione manuali sono state rimosse dall'interfaccia. Il pulsante in alto esegue direttamente il logout.

## Gratuità
GitHub Pages e Firebase Spark non richiedono un server locale. Restare su Spark,
senza collegare un account di fatturazione. Le quote gratuite sono limitate:
se vengono superate il servizio può sospendersi. Nessuna garanzia di gratuità
immutabile o disponibilità senza interruzioni per sempre.

## Anteprima
Servire questa cartella con un server HTTP e aprire ?preview=1 su localhost.
L'anteprima usa dati separati nel browser e non si collega a Firebase.
## Revisione qualità · 28 ottobre 2026
Le quantità delle ricette sono sempre per una persona. La conferma Preparata
accetta il numero di persone e le quantità effettivamente consumate; questi
valori non cambiano la ricetta salvata. La ricetta aperta mostra solo dosi e link alla fonte; procedimento e strumenti non sono richiesti né mostrati.

Le operazioni in attesa hanno una chiave locale per ciascuna azione e una
ricevuta immutabile sul server. Prima di pubblicare questa versione web è
necessario pubblicare le regole private aggiornate che autorizzano le ricevute
solo al proprietario verificato. Non caricare tali regole nel repository pubblico.
Le ricevute e le copie giornaliere occupano spazio e consumano quote Spark;
il piano resta gratuito entro i limiti del servizio.

La vista telefono è attiva: lista della spesa e dispensa in consultazione con
ricerca e quantità, inclusi gli esauriti; ricette disponibili solo sul PC.
Il modulo di aggiunta alla spesa mantiene lo stato aperto/chiuso sul dispositivo.
Il manifesto richiede orientamento verticale. Se il browser non permette il
blocco nativo, la vista orizzontale mostra l'invito a ruotare il telefono.

## Interfaccia compatta
L'archivio iniziale include solo i pancake banana e uova. Questo non elimina
automaticamente le ricette salvate: la pulizia di quelle esistenti avviene solo
con conferma dell'utente. I suggerimenti prodotto derivano esclusivamente
dalla dispensa, inclusi gli esauriti, senza un catalogo preimpostato. I moduli
consentono inserimento libero, passi di 50 G / 1 L / 1 P e unità abbreviate;
Altro viene sempre inviato in pezzi, conservando i vincoli sulle unità dei
prodotti già registrati. Le ricette si salvano con nome, link e ingredienti.

## Aggiornamento mobile · 29 ottobre 2026
Valori preimpostati di inserimento: 100 G, 1 L e 1 P, ripristinati dopo ogni
aggiunta e cambio di unità; i pulsanti procedono di 50 G, 1 L e 1 P.
Gli indicatori ordinari di sincronizzazione non sono mostrati. Gli errori di
salvataggio restano visibili quando richiedono un intervento. Le righe acquistate si chiudono con un'animazione
compatta e i controlli vengono disabilitati subito per evitare doppi acquisti.
La ricetta iniziale è BUDINO BANANA E CIOCCOLATO: per persona, una banana
(P) e 25 G di cioccolato fondente, con fonte In cucina da Eva / GialloZafferano.
Gli aggiornamenti non cancellano automaticamente gli archivi esistenti.

## Unità condivise · 29 ottobre 2026
Dispensa (anche esauriti), lista e ricette condividono la stessa unità per
ogni prodotto. Un inserimento incompatibile viene rifiutato subito, senza
conversioni arbitrarie. Solo i metadati storici privi di riferimenti reali
vengono ignorati. Modificando una ricetta si può cambiare esplicitamente
unità e dose solo se non esistono altri riferimenti che la vincolano.
Sul telefono le quantità in dispensa sono leggibili e modificabili soltanto
con +/−, in passi di 50 G, 1 L o 1 P, senza scendere sotto zero.
Sul telefono sono applicate regole touch e viewport per evitare zoom
involontario: i doppi tocchi sui controlli restano due azioni normali e lo
scorrimento verticale resta attivo.

## Ricette mobile e orientamento · 31 ottobre 2026
Ricette disponibili anche sul telefono: ricerca, filtri, ingredienti/link, creazione/modifica e conferma delle dosi effettive. La stessa logica dati è condivisa con il PC.
Un contenitore della stessa origine mantiene un viewport verticale anche se il browser non supporta il blocco nativo. La rotazione modifica solo dimensioni e trasformazione del contenitore, preservando pagina e modali. Il manifesto continua a preferire portrait; tastiera e barre di sistema dipendono dal dispositivo. Nessuna schermata blocca l'uso in orizzontale. Desktop invariato e dati non reinizializzati.


## Preferite e mancanti in spesa · 31 ottobre 2026
Filtri ricette: Fattibili adesso, Non fattibili e Preferite; nessuna vista Tutte. Il flag favorite booleano è salvato nella ricetta e conservato nella validazione e nelle modifiche. La stella usa saveRecipe con payload dedicato senza alterare dosi.
Il comando Mancanti in spesa calcola le scorte per una persona e arrotonda per eccesso a 50 G, 1 L, 1 P. Considera le quantità già pianificate e completa la prima riga esistente anziché duplicarla. Esegue il piano atomicamente con addShopping; ripetizione dell'operazione e doppi clic non duplicano le quantità. Nessuna modifica alle regole di accesso o ai permessi Firebase.


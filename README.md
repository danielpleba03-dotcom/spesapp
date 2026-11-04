# Spesapp web

App personale installabile, solo dark, per PC e telefono.

## Funzioni attive
- Spesa, Dispensa e Ricette.
- Ricette → Preparata: numero di persone, moltiplicatori ×2–×5 e quantità effettive modificabili. La conferma scala soltanto la dispensa e non modifica la ricetta.
- Ricette → Settimana: generazione diretta senza questionario, pranzo e cena da lunedì a venerdì, collegamento fra cena e pranzo successivo, cambio ricetta per pasto.
- La Settimana organizza soltanto la spesa. Aprire una ricetta non consuma ingredienti. Il consumo si conferma esclusivamente dalla scheda con Preparata.
- Spesa settimanale aggregata: sottrae dispensa e lista esistente, conta una sola volta ogni porzione di cena e pranzo collegati.

Non sono attivi Piano, profilo alimentare, calorie, diario dei consumi o elenco delle porzioni pronte. Il precedente archivio privato è conservato e reso di sola lettura; la nuova app non lo carica.

## Distribuzione
Pubblicare soltanto i file di questa cartella sul repository GitHub Pages.
Database locali, backup, credenziali, dati personali e firestore.private.rules restano fuori dalla cartella pubblica.
La configurazione web Firebase identifica il progetto e non è una credenziale amministrativa. La protezione è nelle regole Firestore riservate al proprietario verificato.

Prima di distribuire la versione 20261102-settimana, pubblicare le regole private aggiornate per users/{uid}/recipeWeeks/main e le ricevute di tipo week. L’archivio dei prodotti rimane users/{uid}/data/main con schema 1. Non importare dati di prova nell’archivio reale.

## Dati e uso offline
Le operazioni hanno identificativo univoco e ricevuta server: un invio ripetuto non duplica acquisti o preparazioni. Le operazioni offline rimangono sul dispositivo e vengono ritentate al ritorno della connessione. Il primo uso richiede accesso e caricamento online.
Le settimane usano un archivio e una coda separati dai prodotti. Generare o cambiare un menu non modifica la dispensa. Soltanto Mancanti alla spesa può aggiornare la lista dal menu.
La prima modifica giornaliera dei prodotti salva una copia immutabile dello stato precedente su Firestore.

## Costi
GitHub Pages e Firebase Spark non richiedono il PC acceso. Restare su Spark senza collegare fatturazione. Le quote gratuite sono limitate e non costituiscono una garanzia di disponibilità o gratuità immutabile per sempre.

## Anteprima
Servire questa cartella con HTTP e aprire ?preview=1 su localhost. L’anteprima usa dati separati nel browser e non si collega a Firebase.

## Aggiornamento 20261102-diretta
Generazione immediata senza quiz: nessun limite di tempo, priorità alla dispensa, pranzo collegato alla cena precedente. Venti nuove ricette (10 primi e 10 secondi), Colazioni e Dolci conservati, Merende rimosse dal catalogo iniziale e dalle scelte. Badge kcal per una persona: stime indicative dagli ingredienti, nessun diario o profilo calorico. Valore manuale facoltativo nel modulo ricetta; se mancano riferimenti compatibili non si mostra un totale parziale. Alimentari in dispensa in ordine alfabetico.

## Aggiornamento 20261102-equilibrio
Sezione principale Piano, con Ricettario e Settimana. Nuove proposte alternano Primi e Secondi nello stesso giorno, mantenendo priorità alla dispensa e collegamento cena-pranzo. Cambia ricetta propone direttamente una diversa ricetta dello stesso tipo. Pranzi passati dalle 12:00 e cene dalle 20:00 sono grigi e bloccati; la rigenerazione conserva i pasti trascorsi e i relativi ingredienti. La spesa settimanale considera soltanto le porzioni future. Le operazioni offline rispettano l’orario del clic. Aggiunte 12 ricette con fonti verificate e stime kcal. Nessuna preparazione automatica.

## Aggiornamento 20261104-porzioni
Preparata propone 2 porzioni aprendo una ricetta dalla Settimana e 1 dal Ricettario. I pulsanti rapidi offrono le altre quantità da 1 a 5. Comprato tutto trasferisce in dispensa i prodotti presenti nella lista con un unico aggiornamento, senza duplicare un invio ripetuto.

La versione dell’app si verifica nel file sw.js: spesapp-2026-11-04-porzioni-v43. Il caricamento dei file su main non equivale alla pubblicazione: attendere il completamento di GitHub Pages prima di verificare la versione servita dal sito.

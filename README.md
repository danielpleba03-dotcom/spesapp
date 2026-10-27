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
7. Dalle impostazioni dell'app importare il file privato migrazione-spesapp.json.

## Dati e uso offline
Le modifiche vengono applicate tramite transazioni Firestore con identificativo
univoco: un acquisto ripetuto non viene conteggiato due volte. Le azioni offline
sono accodate sul dispositivo e inviate quando la connessione ritorna.
Usare l'app offline solo dopo un primo accesso e caricamento completo online.
Non uscire dall'account finché rimangono modifiche da sincronizzare.
La prima modifica giornaliera crea una copia immutabile dello stato precedente
su Firestore. È disponibile anche l'esportazione manuale JSON. L'importazione
scarica prima una copia dello stato attuale e richiede conferma.

## Gratuità
GitHub Pages e Firebase Spark non richiedono un server locale. Restare su Spark,
senza collegare un account di fatturazione. Le quote gratuite sono limitate:
se vengono superate il servizio può sospendersi. Nessuna garanzia di gratuità
immutabile o disponibilità senza interruzioni per sempre.

## Anteprima
Servire questa cartella con un server HTTP e aprire ?preview=1 su localhost.
L'anteprima usa dati separati nel browser e non si collega a Firebase.

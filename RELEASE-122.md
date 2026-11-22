# Spesapp — 22 novembre 2026, una sola schermata iniziale

Corretto il susseguirsi di più schermate durante l'apertura. Il contenitore verticale del telefono avviava un secondo documento, ripetendo il caricamento; la prima schermata inoltre spariva al termine del caricamento dei moduli, prima che i dati fossero pronti.

Ora un'unica schermata scura rimane stabile fino alla prima pagina utilizzabile: Spesa sul telefono, Piano → Settimana sul PC. Il contenitore del telefono conserva la schermata esterna mentre il documento interno si prepara. Un segnale di disponibilità, verificato per origine e finestra del contenitore, la rimuove una sola volta. Le schermate intermedie e i brevi vuoti restano coperti. Non viene introdotto alcun ritardo artificiale; il segnale segue i dati effettivamente pronti.

Gli errori di connessione, dei moduli e del Piano rimangono visibili con possibilità di riprovare. L'accesso Google e il codice iniziale sono conservati. Il documento verticale può riusare l'autorizzazione già verificata nella stessa scheda anche quando il suo spazio locale non è disponibile, senza richiedere nuovamente il codice. Un messaggio proveniente da un'altra origine o finestra non rivela l'app.

Verifica browser con 5.000 ricette e risposta dei dati ritardata: prima comparivano caricamento, vuoto, caricamento interno, schermata intermedia e app; dopo soltanto caricamento e app. Provati telefono e PC, errore di caricamento, errore dei dati del Piano, codice errato e spazio locale del contenitore indisponibile. Verificate anche geometria verticale, riapertura offline e prima apertura del Piano offline. Ricette, scorte, lista, preparazioni e selezione dei pasti restano invariati.

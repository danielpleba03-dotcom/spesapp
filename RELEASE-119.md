# Spesapp — 22 novembre 2026

## Mille ricette aggiuntive con fonti

Nuovo banco immutabile di **1.000 ricette**, distinto da tutti i banchi precedenti per identificativo, nome e collegamento. Aggiunte: 457 Primi, 225 Secondi, 177 Contorni, 75 Antipasti, 55 Dolci e 11 Merende. 493 hanno al massimo otto ingredienti nella lista normalizzata.

Fonti: 596 ricette di Misya, 297 del Cucchiaio d’Argento e 107 dello Spicchio d’Aglio. Ogni pagina selezionata è stata ricontrollata il 22 novembre 2026: HTTP 200, identità della ricetta, ingredienti e resa confrontati con i dati della fonte, procedimento presente. Collegamenti con procedimento assente o dati cambiati sono esclusi. Nel banco non viene copiato il testo del procedimento, che rimane sul sito dell’editore.

Le quantità sono per una porzione; pesi dei singoli alimenti, misure domestiche e condimenti non quantificati dalla fonte rimangono indicativi, come segnalato nella scheda. Sono scartati rese ambigue in stampi/dimensioni, pezzi frazionari incompatibili con l’archivio e combinazioni di quantità non interpretabili. Le categorie del ricettario seguono la portata della fonte o una classificazione editoriale del piatto. Pranzo e cena della Settimana continuano a proporre soltanto Primi e Secondi.

## Dati e prestazioni

L’importazione usa 25 blocchi da 40 ricette e identificativi di operazione stabili: può riprendere dopo un’interruzione e non ripristina ricette successivamente eliminate. Le cinque ricette ritirate nell’aggiornamento precedente restano escluse. Dispensa, spesa, preparazioni, preferiti, conteggi e ricette personali sono conservati. I nuovi riferimenti compatti sono aggiunti al formato esistente senza modificare le definizioni dei banchi precedenti.

Preservati il codice iniziale della PWA e il riconoscimento dei dispositivi già autorizzati. Aggiornati soltanto i riferimenti ai moduli e la cache dell’app.

Verifiche: 31 controlli su fonti, unicità, unità, capacità dell’archivio, importazione interrompibile, idempotenza, conservazione dei dati, concorrenza, acquisti, preparazioni, sostituzioni e menu settimanale. Browser a 390 e 1440 px: 3.000 ricette, ricerca e link delle nuove schede, preferiti e accesso iniziale; durante lo scroll prolungato massimo 160 schede montate, zero blocchi vuoti e zero cambi di posizione non richiesti. I tempi misurati descrivono l’ambiente di prova, non garantiscono una frequenza fotogrammi su ogni dispositivo.

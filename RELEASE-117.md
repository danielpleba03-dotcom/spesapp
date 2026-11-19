# Spesapp — Ricettario fluido

- Rimozione una tantum di cinque ricette, richiesta dall’utente: Galettes bretonnes, Salatini al cheddar, Crêpes senza uova, Crema al mascarpone e cioccolato, Bruschette con melanzane. Le definizioni immutabili rimangono disponibili per decodificare vecchi archivi; l’aggiornamento non le reimporta nel ricettario attivo.
- Il ricettario mantiene attivi blocchi di 32 elementi vicini allo schermo, con tre schermate di anticipo e segnaposto delle dimensioni misurate per i blocchi distanti. Schede aperte e controlli con focus restano montati. Titoli e contenitori vengono inseriti insieme, senza animazioni di apparizione o `content-visibility:auto`.
- Barra di navigazione opaca: rimosso il filtro di sfocatura retrostante, visivamente inutile e costoso durante lo scroll. Layout dei blocchi isolato per limitare i ricalcoli.
- Prove Chromium a 390 e 1440 px su 2.000 ricette: 62 schede inizialmente attive, massimo 160 durante lo scroll veloce prolungato; zero blocchi vuoti e zero cambi di posizione non richiesti. Verificati salti a fine/metà/inizio elenco, ricerca su tutto il catalogo e apertura delle schede. Questi risultati descrivono l’ambiente di prova, non una garanzia di frequenza fotogrammi su ogni dispositivo.
- Test di rimozione: archivio di 2.005 ricette portato a 2.000 anche interrompendo e riprendendo l’operazione; ricaricamento senza altre cancellazioni, conservando prodotti, lista, conteggi delle altre ricette, preferiti e ricette personali.

L’aggiornamento viene applicato dall’app autenticata al successivo caricamento; nessuna pulizia di dispensa, spesa o cronologia viene eseguita.

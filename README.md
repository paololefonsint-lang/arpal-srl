# Sito Arpal Srl — bozza

Sito statico (HTML/CSS/JS puro, nessun build step) con animazioni GSAP + ScrollTrigger e smooth scroll Lenis.

## Struttura

```
index.html            Home, Storia, Servizi (6), Assistenza, Materiali, Contatti
preventivo.html        Form "Richiedi preventivo" multi-step
assets/css/style.css        Design system e layout di tutto il sito
assets/css/preventivo.css   Stili del form multi-step
assets/js/data.js           Contenuti dinamici: timeline, 10 schede materiali, gallerie foto
assets/js/main.js           Comportamento: nav, hero, reveal on scroll, gallerie/lightbox, modali materiali
assets/js/preventivo.js     Logica del form multi-step (validazione, riepilogo, invio)
assets/img/                 Foto ottimizzate (JPG ridimensionati) organizzate per sezione
```

## Deploy su Netlify

1. Trascina l'intera cartella `sito-arpal` su [app.netlify.com/drop](https://app.netlify.com/drop), oppure collega questa cartella a un repository Git e importalo in Netlify.
2. Nessuna build command necessaria: `publish` è già impostato su `.` in `netlify.toml`.
3. Il form "Richiedi preventivo" usa **Netlify Forms** (`data-netlify="true"`): dopo il primo deploy le richieste compariranno in *Site settings → Forms* sul pannello Netlify, senza bisogno di un backend.

## Da rifinire prima della pubblicazione definitiva

- Sostituire le foto placeholder riusate per **Facciate** e **Rivestimenti metallici** con scatti dedicati, quando disponibili.
- Confermare indirizzi completi delle due sedi (attualmente solo Comune/provincia, come da materiale fornito).
- Definire le domande definitive del form preventivo (la struttura a step è già pronta: basta modificare le opzioni in `preventivo.html`).
- Verificare/registrare i profili social linkati in Contatti e Footer.

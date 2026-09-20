# Letterlijk

Nederlandstalige typtrainer voor Belgisch AZERTY. 15 lessen, 45 vrij selecteerbare oefeningen en voortgang in localStorage. Geen backend, database of account.

## Lokaal starten

Vereist Node.js 22.12+ (of 24 LTS).

```sh
npm install
npm run dev
```

`npm test` controleert de cumulatieve lesopbouw, resultaatberekening en opslagvalidatie. `npm run build` controleert TypeScript en maakt de productieversie in `dist`. `npm run preview` toont die versie lokaal.

## Git en GitHub

Maak op GitHub een lege repository en koppel die lokaal:

```sh
git add .
git commit -m "Build Letterlijk Belgian AZERTY typing trainer"
git branch -M main
git remote add origin https://github.com/JOUW-ACCOUNT/JOUW-REPO.git
git push -u origin main
```

De GitHub Actions-workflow voert tests en een productiebuild uit bij pushes en pull requests naar `main`.

## Cloudflare Pages

Kies in Cloudflare **Workers & Pages → Create application → Pages → Connect to Git** en selecteer de GitHub-repository. Gebruik:

| Instelling | Waarde |
|---|---|
| Production branch | `main` |
| Framework preset | `Vite` of `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | leeg (projectroot) |
| Environment variable | `NODE_VERSION=24` |

Cloudflare installeert dependencies op basis van `package-lock.json`. Elke push naar `main` levert een nieuwe productieversie op. Pull requests krijgen via de Pages-integratie een preview. Er zijn geen database- of API-sleutels nodig. `public/_headers` wordt automatisch meegebouwd voor Pages.

## Lesmethode

Gebaseerd op de basisrijmethode zoals beschreven door [TypeMission](https://www.typingmission.com/nl-be/typemission-voor-scholen/typemethode) en de opbouw basisrij → bovenrij → onderrij van [TypingFast België](https://typingfast.net/be/lessons/). De precieze lettergroepen en oefenteksten zijn zelf samengesteld. Eerst F/J, D/K, S/L, Q/M en G/H; daarna bovenrij, onderrij, hoofdletters en leestekens. Vanaf de eerste klinkers worden echte Nederlandse woorden gebruikt. Alle teksten blijven binnen de al aangeleerde tekens. Cijfers en accenten vallen buiten deze versie.

Een oefening slaagt bij minimaal 95% nauwkeurigheid en binnen de aangegeven maximale duur. De tijdslimiet wordt berekend met 8 woorden/minuut voor de basisrij, 10 voor woorden bouwen, 12 voor vlotter typen en 15 voor hoofdletters en leestekens, plus 10 seconden speling (minimaal 30 seconden). Dit zijn eigen, rustige oefendoelen. Verkeerde aanslagen tellen mee, de cursor wacht op het juiste teken. De klok pauzeert bij focusverlies. Snelheid gebruikt vijf tekens per woord. De oefening stopt niet als de tijd om is. Bij een gemist doel wordt opnieuw oefenen aanbevolen, maar doorgaan blijft mogelijk. Oude resultaten behouden hun eerdere beoordeling.

Nieuwe letters op de boven- en onderrij beginnen met acht paren per vinger, bijvoorbeeld eerst alleen Q-A en A-Q, dan D-E en E-D. Pas daarna worden vingers gecombineerd. De app geeft de juiste vinger aan, maar kan niet meten welke fysieke vinger de cursist gebruikt.

## Lokale gegevens

Resultaten worden per oefening bewaard onder `letterlijk.progress.v1`, maximaal 30 pogingen per oefening. Er is geen synchronisatie. Browsergegevens wissen, een ander apparaat, een andere domeinnaam of een andere preview-URL betekent een aparte of lege voortgang. Bij onbeschikbare opslag verschijnt een waarschuwing.

De app gebruikt Google Fonts voor DM Sans en Manrope, met lokale lettertypes als fallback. De toetsenbordillustraties zijn CSS en SVG; er zijn geen externe beeldbestanden.

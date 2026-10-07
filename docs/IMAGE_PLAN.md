# Bildplan

## Sofort verwenden

### Hero
`public/images/uwr/variants/hero-underwater-rugby.png`

- Startseiten-Hero
- Ball + Korb + mehrere Spieler direkt erkennbar
- Text links, Action rechts
- dunkler Gradient nur per CSS, Original bleibt unangetastet

### „Was ist UWR?“
`public/images/uwr/variants/poolside-original-web.jpg`

- lockerer Vereins-/Trainingskontext
- guter Kontrast zur Unterwasser-Action

### „Adrenalin unter Wasser“
`public/images/uwr/variants/wide-match-hero-16x9.jpg`

- breite Spielsituation
- zeigt die dritte Dimension gut

### Finaler CTA / Probetraining
`public/images/uwr/variants/goal-scene-hero-16x9.jpg`

- Korbszene
- emotionaler Abschluss

### Reserve / dunkler Hintergrund
`public/images/uwr/variants/dark-match-hero-16x9.jpg`

- für Unterseiten, Story-Zwischenbanner oder Liga/Turnier

## Interaktive Erklärung „Was ist UWR?“

Die zwei dafür bereitgestellten Fotos liegen unverändert unter:

- `public/images/uwr/source/explainer-overview.png` (1024 × 819)
- `public/images/uwr/source/explainer-positions.png` (1024 × 683)

Das erste zeigt Ball, Korb und Ausrüstung. Das zweite zeigt die Positionen aus
einer weiteren Perspektive. Die Deckel-Spielerin trägt in beiden Bildern einen
Badeanzug. Marker, manuell konfigurierte Konturen und weiche Randverläufe sind
separate SVG-/CSS-Ebenen; die Originale werden nicht bearbeitet. Keine
Vergrößerungsanimation und keine generative Hochskalierung. Hero, Luft & Wechsel
und CTA verwenden die vorhandenen Hero-, Poolside- und Korbfotos der Startseite.
Für hochauflösende Retina-Ansichten der beiden Erklärfotos die Originale
nachreichen. Konkrete Fotocredits und dauerhafte Nutzungsrechte
dieser beiden Dateien vor dem öffentlichen Launch bestätigen.

## Portrait-Varianten

Die vorhandenen 4:5-Crops liegen unter `public/images/uwr/variants/*portrait*` und eignen sich für mobile Teaser/News.

## Workflow für die kommenden hochauflösenden Vereinsbilder

1. Originale unverändert archivieren.
2. In Payload hochladen.
3. Fotocredit + Nutzungsrecht ausfüllen.
4. Payload-Focal-Point auf Ball/Spielszene setzen.
5. Hero/Card/Portrait automatisch aus dem Original erzeugen lassen.
6. Keine generative KI zum „Verbessern“ realer Spielszenen – sie verändert Spieler und Details.

## Rechte

Die aktuell beigelegten Fotos stammen aus dem vom Nutzer bereitgestellten TSCF-/Abteilungsbestand und sind für den Prototyp freigegeben. Vor öffentlichem Launch die konkrete dauerhafte Webfreigabe/Urheberangabe je Bild dokumentieren. Genau dafür gibt es im `media`-CMS die Felder Credit, Quelle und Nutzungsrecht.

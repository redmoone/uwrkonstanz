# Design-Spezifikation

## Richtung

Basis ist das ausgewählte Mockup `reference-homepage.png`:

- Sportmarke statt klassische Vereinsseite
- große, kondensierte Headlines
- echte UWR-Fotografie als Hauptträger
- Tiefblau + Aqua + Off-White
- klare, eher kantige Flächen
- keine Card-/SaaS-Optik
- nur kleine Hover-/Fade-Microinteractions, auch auf der scrollgeführten
  Erklärseite „Was ist UWR?“

## Logo

Das bereitgestellte Vereinslogo liegt unverändert als transparentes SVG unter
`public/images/uwr/logo.svg`. Es wird im Header aller öffentlichen Seiten, im
Startseiten-Footer und als Browser-Icon verwendet. Die Größe wird per CSS an
Desktop und Mobilgeräte angepasst; Farben und Proportionen bleiben erhalten.

## Farben

- Navy: `#03273F`
- Dark Navy: `#021D30`
- Mid Blue: `#0D668E`
- Aqua: `#73E5EF`
- Light Aqua: `#A7F3F7`
- Off White: `#F6F5F1`
- Text: `#08253B`

## Typografie

Überschriften verwenden auf allen öffentlichen Seiten dieselbe Schriftfamilie
(`--font-heading`). Große Headlines sind kräftig (900), Berichtstitel im Teaser
etwas ruhiger (800). Fließtext nutzt einheitlich `--font-body`.

Im Starter werden Systemfonts genutzt. Für den Launch empfehle ich:

- Headlines: **Barlow Condensed** oder **Roboto Condensed** (OFL)
- Fließtext: **Inter** oder **Manrope**

Fonts später selbst hosten, damit kein externer Google-Fonts-Request nötig ist.

## Textstil

Punkte werden nur als Satzzeichen im Fließtext verwendet. Überschriften, Labels
und kurze Slogans kommen ohne dekorative oder abschließende Punkte aus.

## Layoutregeln

- Reguläre Contentbreite ca. 1180 px; große Reportageabschnitte bis 1600 px,
  Textspalten davon unabhängig maximal 620 px
- Hero 16:9/full bleed
- Headlines bewusst sehr groß, Text dagegen ruhig
- max. zwei dominante Farben pro Abschnitt
- wenig Rundungen; Buttons rechteckig
- News als Magazinraster, nicht als schwebende Karten

News-Übersicht und einzelne Berichte verwenden das gleiche Hero-Foto wie die
Startseite hinter Navigation und Überschrift. Eine dunkle Überlagerung sichert
die Lesbarkeit. Das Bild endet vor dem Inhalt; Teaser und Artikeltext stehen
weiterhin auf hellem Hintergrund.

## Interaktive UWR-Erklärung

`/unterwasserrugby` ist eine kleine digitale Sportreportage mit sechs großen
Abschnitten: Spiel in drei Dimensionen, Ball, Korb, Ausrüstung, Luft & Wechsel
und Teamplay. Ein ca. 60vh hoher Foto-Hero eröffnet die Geschichte. Keine
Kapitel-Navigation, Player-Schalter, Plus-Buttons oder Spotlight-Kreise.

Breite Bild-/Textflächen wechseln zwischen Off-White und Navy. Desktop ungefähr
62 % Foto, 38 % Text; die Bildseite wechselt. Große dunkle Fotos laufen weich
in dieselbe Hintergrundfarbe aus. Keine Abschnittsrahmen, Karten oder Schatten.
Die Ausrüstung erklärt weiterhin alle sechs Teile, einschließlich Badehose und
Badeanzug. Tor / Deckel, Untertor / Dackel und Stürmer sind Teil von Teamplay.

Kleine Cyan-Ringe mit zentralem Punkt markieren Details; optionale, manuell
konfigurierte SVG-Konturen zeigen ein aktives Objekt mit weichem Glow. Nur die
längeren Ausrüstungs-/Teamplay-Fotos dürfen abschnittsweise sticky sein. Mobil
unter 768 px immer Foto über Text, kein Sticky und mindestens 44-px-Touch-Ziele.
Dezente Text-Fades und Marker-Übergänge, keine Zooms oder große Parallaxe.
`prefers-reduced-motion` deaktiviert Übergänge und Sticky. Inhalte bleiben auch
ohne JavaScript vollständig. Der abschließende Probetraining-CTA übernimmt
Bild, Farben und Button der Startseite. Pflegehinweise: `UWR_EXPLAINER.md`.

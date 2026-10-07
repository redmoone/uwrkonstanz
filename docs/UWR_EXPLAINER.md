# „Was ist UWR?“ – eine gemeinsame Story-Bühne

Route: `/unterwasserrugby`. Hero und CTA bleiben erhalten.
Homepage, Navigation, gemeinsame Fonts/Tokens/Buttons, Payload und Dependencies
sind unverändert. CSS-Änderungen sind auf den `.uwr-page`-Block begrenzt.

## Architektur

Hero → **eine sticky Fullscreen-Bühne** → Probetraining → Footer.

`UwrExplainer` enthält `ExplainerStage` und einen unsichtbaren `scrollDriver`.
Die Bühne ist `position: sticky; top: 0; height: 100svh`. Die Driver-Fläche
überlappt ihren ersten Viewport über einen negativen Margin; sie ist weder
Navigation noch sichtbare Sektion und besitzt keine interaktiven Elemente.

Ball, Korb, Ausrüstung und Luft erhalten je einen 90svh-Trigger.
Teamplay verwendet drei 60svh-Trigger mit demselben Foto. Ein letzter
100svh-Driver-Abstand gibt auch dem letzten Zustand seine volle Scrollzeit,
bevor die Bühne sich zum CTA löst. Normales Browser-Scrolling, kein Scroll-Snap.

Fünf absolut übereinanderliegende Bild-Layer bleiben gemountet. Nur der
gewählte Layer ist interaktiv; alle anderen sind `inert` und `aria-hidden`.
Crossfade: 800 ms. Text: 20 px, 400 ms, kleiner Eintrittsversatz.
Marker/Highlight-Eintritt: 350 ms. Kein Zoom, keine Parallaxe, keine Pulse.
Textpositionen variieren kontrolliert; maximal 500 px breit. Die Fotografie
bleibt eine Fläche, ohne Kartenrahmen oder großflächigen Glow.

Es gibt keine getrennten Desktop-Kapitel-Sektionen, Kapitel-Navigation,
Plus-Marker, Richtungsgrafik, zusätzliche 3D-Erklärung oder Positionsliste.

## Dateien

- `UwrExplainer.tsx`: gemeinsamer Scroll-/Hover-State, Responsive-/Motion-Modus.
- `ExplainerStage.tsx`: fünf dauerhaft gemountete Bild-/Text-Layer.
- `StoryTrigger.tsx`: unsichtbare Scrollintervalle.
- `StoryCopy.tsx`: kurze Headline und Erklärung, Team-Unterzustand.
- `StoryLinear.tsx`: kompakter linearer Fallback.
- `StoryTranscript.tsx`: vollständige Kurzfassung für Screenreader auf Desktop.
- `InteractiveImage.tsx`: gemeinsames Foto-/Annotations-SVG.
- `HotspotMarker.tsx`, `OutlineOverlay.tsx`: deklarative Annotationen.
- `src/lib/uwr-story.ts`: fünf States und sieben Trigger.
- `src/lib/uwr-hotspots.ts`: Originalkoordinaten, Konturen und Debug-Schalter.

Die bisherigen `StoryScene.tsx` und `StoryStep.tsx` wurden entfernt.

## Scroll und Hover

IntersectionObserver mit einer zwei Pixel hohen Zone am **oberen** Viewportrand.
Vertikale Root-Margins werden aus der Viewport-Höhe in Pixeln berechnet.
Jeder Trigger bestimmt genau einen State und optional ein Highlight.
Erster/letzter State werden bei Sprüngen außerhalb der Driver-Intervalle
begrenzt, damit die Bühne niemals leer oder beim Wiedereintritt falsch startet.

`activeId = hoveredId ?? scrollActiveId`.
MouseLeave, Blur, Touch-Ende/-Abbruch, Escape, State-Wechsel und Moduswechsel
löschen den temporären Hover. Der Fallback teilt diesen Hover-State.
Kein imperatives Hinzufügen/Entfernen von DOM-Klassen, keine Klick-Auswahl.

Auf Desktop wird nur der zum aktuellen Trigger gehörige Marker ausgegeben.
Ein abgelöstes Highlight verschwindet unmittelbar; das neue blendet ein.
Teamspieler haben bewusst nur einen kleinen lokalen Glow, keine ungenauen
Körperkonturen. Ball und Korb verwenden die vorhandenen manuell geprüften Pfade.

## Originalbilder und SVG-Ausrichtung

- Ball / ABC: `explainer-overview.png`, **1024 × 819 px**.
- Korb / Team: `explainer-positions.png`, **1024 × 683 px**.
- Luft: `poolside-original-web.jpg`, **2560 × 1920 px**.

Foto, Marker und Kontur liegen immer im selben SVG mit Original-`viewBox`.
Desktop: `xMidYMid slice`; Fallback: unbeschnittenes `xMidYMid meet`.
Die tatsächliche SVG-Matrix `getScreenCTM().a` bestimmt die Markerkompensation,
nicht die SVG-Breite: Bei `slice` kann die Höhe den Maßstab bestimmen.
Ring: 20 px, Punkt: 4 px, Trefferfläche: 48 × 48 px.

`DEBUG_HOTSPOTS = false` bleibt Standard. Bei `true` zeigt die gewählte Bühne
alle Hotspots und Pfade ihres Originals, IDs, Pixelkoordinaten und viewBox.
Der Debug-Modus hebt die Ein-Highlight-Regel absichtlich auf.

## Fallback und Accessibility

Unter 768 px, unter 600 px Viewport-Höhe, bei ungewöhnlichen Seitenverhältnissen
(außerhalb 4:5 bis 5:2) oder bei `prefers-reduced-motion: reduce`:
fünf kompakte Bild-/Textfolgen, keine Sticky-Bühne, keine hohen Trigger.
Der lineare Inhalt wird schon serverseitig ausgegeben; ohne JavaScript bleibt
die komplette Erklärung lesbar.

Reduced Motion: keine Animation/Transition und kein Smooth-Scroll.
Die Änderung des Motion- oder Viewport-Modus wird während der Sitzung erkannt.

Die Desktop-Kurzfassung enthält alle fünf Erklärtexte und drei Team-Schritte
für Screenreader; visuelle Stage-Texte werden dort nicht doppelt vorgelesen.
Verborgene Layer/Fallbacks enthalten keine erreichbaren Tastaturziele.
Native Hotspot-Buttons unterstützen Fokus, Enter/Space und Escape.

## Browserprüfung am 07.10.2026

Zuerst ausschließlich Ball/Korb umgesetzt und im Browser geprüft,
erst danach Ausrüstung, Luft und Team ergänzt.

- Desktop/Tablet: 1920, 1440, 1024 und 768 px.
- Beide Konturen an allen vier Breiten visuell geprüft; Foto-/Pfad-Matrizen gleich.
- Alle sieben Trigger vorwärts/rückwärts, Crossfade und unveränderter Sticky-Top.
- Nur ein aktuelles Highlight, keine sichtbaren alten Kapitel-Sektionen.
- Alle fünf Marker mit echtem Hover und MouseLeave geprüft.
- Tastatur-Tab/Fokus, Escape sowie Touch-PointerDown/Up geprüft.
- Bühne löst sich zum CTA; direkte Sprünge zurück zum Hero starten mit Ball.
- Mobile 390 und 320 px: linear, vollständige Texte, 48-px-Trefferflächen,
  kein horizontaler Überlauf.
- Echte Chrome-Präferenz Reduced Motion: linear, alle Texte sichtbar,
  Animation `none`, Transition `0s`, Scroll `auto`.
- TypeScript ohne Fehler; Browser-Konsole ohne Fehler/Warnungen.
- Scope gegen gesicherte Ausgangskopie geprüft (Workspace hat kein Git-Repository):
  Homepage/Nav/Hero/CTA/Payload/Packages unverändert; gemeinsamer CSS-Präfix
  und -Suffix außerhalb des UWR-Blocks exakt gleich.

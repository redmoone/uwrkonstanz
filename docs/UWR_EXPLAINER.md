# „Was ist UWR?“ – Ein-Bild-Scroll-Bühne

Route: `/unterwasserrugby`. Der bestehende Hero füllt jetzt 100svh; Texte,
Foto und Gestaltung bleiben erhalten. CTA, Homepage, Navigation, Fonts,
Farben, Payload und Dependencies bleiben unverändert.

## Architektur

Fullscreen-Hero → beim natürlichen Weiterscrollen direkt eine viewportgroße
Sticky-Bühne → bestehender Probetraining-CTA. Kein Scroll-Snap oder zusätzlicher
Übergangsabschnitt; die kleine vorhandene Pfeil-Verknüpfung führt zur Bühne.
Die Bühne enthält genau ein SVG und genau ein Foto:
`/images/uwr/source/explainer-positions-upscaled.png`, Größe **1536 × 1024**.
Das vom Nutzer bereitgestellte hochskalierte PNG wird unverändert verwendet.
Die ältere Bilddatei bleibt erhalten, wird aber nicht mehr von der Bühne geladen.

Foto, Konturen und alle Marker liegen in derselben SVG-Kameragruppe.
`matrix(zoom 0 0 zoom x y)` bewegt sie gemeinsam; Zoom 1.1–1.28,
750 ms mit sanftem Ein-/Auslauf. Kameragrenzen halten alle 44-px-Ziele
innerhalb des Bildkoordinatenraums. Hover bewegt die Kamera nicht.

Die Fotokanten besitzen eine eigene SVG-Alpha-Maske: seitlich 6 %, oben/unten
3 % mit weich abgestuftem Verlauf. Sie folgt dem Foto innerhalb der Kamera,
nicht dem Viewport. Das Bildinnere bleibt vollständig opak; Marker, Konturen
und Trace bleiben unmaskiert. Der separate Textlesbarkeitsverlauf bleibt erhalten.

Sechs unsichtbare 90svh-Trigger steuern die Geschichte:
Ball → Korb → Ausrüstung → Deckel → Untertor/Dackel → Stürmer.
Keine Bildwechsel, Crossfades, Kapitelkarten, Kapitel-Navigation oder
zusätzliche 3D-Erklärung. Kein Scroll-Snap.

## Daten und Komponenten

- `src/lib/uwr-explainer.ts`: Quelle für Fotometadaten, uwrCopy und Ausrüstung.
- `src/lib/uwr-stage.ts`: sechs Zustände, Kameraziele und kurze Quelltextauszüge.
- `src/lib/uwr-hotspots.ts`: Marker in den neuen Originalpixeln und Konturzuordnung.
- `src/lib/uwr-outlines.ts`: exakt übernommene Geometrie der sechs Nutzer-SVGs.
- `public/images/uwr/source/outlines/`: editierbare Original-SVGs (1536 × 1024).
- `UwrExplainer`: IntersectionObserver, Scroll-/Hover-State und Fallback-Modus.
- `ExplainerStage`: genau eine InteractiveImage und der aktuelle kurze Storytext.
- `InteractiveImage`: gemeinsame SVG-Kamera, Resize-Kompensation, Trace-Modus.
- `HotspotMarker / OutlineOverlay`: deklarative Marker und Hervorhebungen.
- `StoryTrigger / StoryCopy / StoryLinear / StoryTranscript`: Driver und Quelltexte.

Die erfundene Mehrbild-Story in `uwr-story.ts` ist entfernt.
Die vorhandenen Texte werden nicht neu geschrieben. Der vollständige Wortlaut
bleibt im linearen Fallback und für Screenreader erhalten.

## Interaktion und Konturen

`activeId = hoveredId ?? scrollActiveId`.
Alle acht Marker bleiben sichtbar: Ball, Korb, drei Rollen und drei ABC-Objekte.
Ausrüstung ist eine explizite Gruppe mit drei unabhängigen Konturen:
Maske, Schnorchel und Flossen. Hover hebt nur das jeweils erkundete Objekt hervor.
MouseLeave, Blur, Escape, Touch-Ende und Moduswechsel setzen den Override zurück.
Es erscheint regulär maximal eine Kontur; nur der Ausrüstungs-Scrollzustand
zeigt seine drei ausdrücklich zusammengehörigen ABC-Objekte gleichzeitig.

Ring 20 px, Mittelpunkt 4 px, kreisförmige Trefferfläche mit 44-px-Durchmesser.
Ihre Größe wird mit Basis-SVG-Maßstab × aktuellem Kamerazoom kompensiert.
Transparente foreignObject-Ecken blockieren keine benachbarten Marker.

Die gelieferten Pfade ersetzen die bisherigen Konturen vollständig; sie werden
nicht neu gezeichnet oder vereinfacht. Das Deckel-Polygon wird geometrisch exakt
in einen geschlossenen Unterpfad überführt. Die Aussparungen bei Deckel und
Untertor bleiben durch evenodd-Füllung erhalten. Der neue Stürmer-Pfad gehört
zum kopfüber schwimmenden Spieler in der Mitte; Marker und Kameraziel folgen
dieser Zuordnung. Die drei Ausrüstungs-Pfade bleiben getrennt.
Drei Ebenen: weicher äußerer Glow, 2.1-px-Kontur mit non-scaling-stroke,
7 % transparente Innenfläche. Keine Ersatzellipsen oder permanente Pulse.

## Tracing

`DEBUG_HOTSPOTS = false` ist Standard; alternativ `?trace=1`.
Tracing zeigt alle Pfade/Marker, IDs, Originalkoordinaten (1536 × 1024), ein 50-px-Raster
und die viewBox. Klickpositionen erscheinen im Bild und in der Konsole.
Die inverse **Kameragruppenmatrix** liefert Originalpixel auch bei Zoom.
Im Trace-Modus sind alle Konturen gleichzeitig sichtbar, unabhängig vom Storyzustand.

## Mobile, Reduced Motion und Accessibility

Unter 768 px, unter 600 px Höhe, bei extremen Seitenverhältnissen oder
Reduced Motion: ein unbeschnittenes Bild, anschließend sechs kompakte
Quelltextkapitel. Kein Sticky und keine Scroll-Driver-Höhe.
Hover-/Touch-Erklärungen stehen dann unter dem Foto, nicht über Spielern.

SSR/ohne JavaScript bleibt vollständig lesbar. Native Buttons unterstützen
Tab, Enter/Space und Escape; aria-describedby enthält die Quellerklärung.
Reduced Motion deaktiviert Kamera, Animationen und Übergänge.

## Prüfung am 08.10.2026

Nach Einrichtung der Ein-Bild-Stage wurden das neue PNG und die sechs
gelieferten SVGs auf gemeinsame Maße und unveränderte Pfadgeometrie geprüft.
Das importierte PNG stimmt per SHA256 mit dem Nutzer-Anhang überein.
ViewBox, Kamera-Bildgrenzen und Trace-Raster verwenden die Fotometadaten.

- Konturen bei 1920, 1440, 1024 und 768 px visuell geprüft.
- Sechs Scrollzustände vorwärts/rückwärts und direkte Scrollsprünge geprüft.
- Alle acht Marker mit echtem Hover und MouseLeave geprüft.
- Deckel → Hover Stürmer → MouseLeave Deckel; Kamera bleibt dabei gleich.
- Tastaturfokus/Tab und Escape stellen den Scrollfokus korrekt wieder her.
- Mobile 320/390 px: ein SVG, kein Sticky/Überlauf; alle Markerzentren erreichbar.
- Touch-PointerDown/Up im mobilen Modus geprüft; Override bleibt nicht hängen.
- Echte Chrome-Reduced-Motion-Präferenz: lineare Texte, Kamera 1.0, Übergänge 0s.
- Trace-Klick durch inverse Kameramatrix auf Originalkoordinaten geprüft.
- TypeScript und Browserkonsole ohne Fehler; git diff --check sauber.
- Geschützte Dateien und gemeinsame CSS-Bereiche per Git-Scope-Audit unverändert.

# Payload-Datenmodell

## Berichte (`posts`)
Für Trainer der wichtigste Bereich. Nur Titel, Kategorie, Kurztext, Titelbild, Datum und Rich-Text.

Veröffentlichte Berichte erscheinen auf der Startseite und unter `/news`.
Die Karten verlinken auf `/news/[slug]`; Entwürfe sind öffentlich nicht erreichbar.
Fotocredits werden aus dem zugeordneten Medium übernommen.

Der erste echte Bericht zum Klassenerhalt von UWR Bodensee ist im lokalen CMS
gespeichert. Der wiederholbare Import liegt unter `scripts/import-bundesliga-report.ts`.
Ein erneuter Aufruf legt vorhandene Berichte nicht doppelt an:

```bash
pnpm payload run scripts/import-bundesliga-report.ts public/images/uwr/source/bundesliga-klassenerhalt-bodensee.png 2026-04-28T12:00:00+02:00
```

Bei einem vorhandenen Bericht aktualisiert ein ausdrücklich übergebenes Datum
nur das Veröffentlichungsdatum. Das bestätigte Datum dieses Berichts ist der
28. April 2026. Das Originalfoto
bleibt unter `public/images/uwr/source/` erhalten; Payload verwaltet die Uploads
und Bildvarianten unter `media/`.

## Termine & Aktionen (`events`)
Turniere, Trainingslager, Aktionen, Probetrainings-Termine.

## Trainingszeiten (`training-times`)
Änderbar ohne Deployment. Die Startseite berechnet aus allen aktiven wöchentlichen
Trainingszeiten den nächsten Beginn in `Europe/Berlin` und zeigt Datum, Uhrzeit
und Ort. Bereits begonnene Einheiten werden nicht als nächster Termin angezeigt;
die Auswahl springt zur nächsten noch bevorstehenden Einheit, nötigenfalls in
der Folgewoche. Die Berechnung wird bei jedem Seitenaufruf erneuert.

Das alte Feld `sortOrder` bleibt für Datenbankkompatibilität erhalten, ist aber
im Admin ausgeblendet und beeinflusst die Auswahl nicht mehr. Start und Ende
müssen gültige Uhrzeiten sein, z. B. `19:10`. Ohne aktive, gültige Einträge werden
keine Ersatz-Trainingszeiten erfunden, sondern ein Hinweis angezeigt. Ausfälle,
Ferien und einmalige Terminänderungen sind noch nicht gesondert modelliert.

## Bilder (`media`)
Alt-Text, Credit, Quelle, Nutzungsrecht und Freigabehinweis. Das verhindert später Lizenz-Chaos.

## Team (`team-members`)
Trainer/Ansprechpartner in definierter Reihenfolge.

## Seiten (`pages`)
Für Inhalte wie „Über UWR“, „Probetraining“, „Verein“.

## Website-Einstellungen (`site-settings`)
Hero-Text und Kontakt-/Social-Daten.

# Controlling-Lernkonsole — auf Vercel bringen

Statische Seite, ein einziges HTML-Dokument plus Symbole. Kein Build, keine
Abhängigkeiten, keine Umgebungsvariablen.

## Inhalt des Ordners

| Datei | Zweck |
|---|---|
| `index.html` | die komplette App (~64 KB gzip) |
| `sw.js` | Service Worker — die App startet auch ohne Netz |
| `manifest.webmanifest` | macht die Seite auf dem Handy installierbar |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.*` | Symbole |
| `vercel.json` | Sicherheits-Header und Cache-Regeln |

## Weg 1 — Weboberfläche, keine Installation nötig

1. Ordner als ZIP packen (oder gleich den entpackten Ordner bereithalten).
2. Auf <https://vercel.com/new> gehen, unten **„Deploy without Git"** wählen
   und den Ordner ins Fenster ziehen.
3. Framework Preset auf **Other** stehen lassen, Root Directory `./`,
   Build Command leer, Output Directory leer.
4. Deploy. Nach ein paar Sekunden steht die Adresse
   `https://<projektname>.vercel.app`.

## Weg 2 — Kommandozeile

```bash
npm i -g vercel
cd lernkonsole
vercel            # einmal anmelden, Fragen mit Enter bestätigen
vercel --prod     # danach für jede Veröffentlichung
```

Bei „Want to modify these settings?" mit **no** antworten — die statische
Erkennung ist richtig.

## Weg 3 — GitHub

Ordner als Repository pushen, auf vercel.com **Import Git Repository**.
Jeder Push veröffentlicht dann automatisch. Sinnvoll, wenn du später noch
Kapitel ergänzen willst.

## Nach dem ersten Deploy

**Anonyme Anmeldungen einschalten.** Im Supabase-Dashboard unter
*Authentication → Sign In / Providers*. Ohne das bleibt die App im
Offline-Modus: sie funktioniert, aber ohne Abgleich, ohne Fehlerliste und
ohne Klausurverlauf. Ob es geklappt hat, siehst du links unten in der
Seitenleiste — dort steht dann grün **synchronisiert**.

**Auf dem Handy installieren.** Seite in Safari oder Chrome öffnen, dann
„Zum Home-Bildschirm hinzufügen". Danach startet sie im Vollbild wie eine
App und läuft auch offline.

## Was du wissen solltest

**Der Supabase-Schlüssel steht im Quelltext.** Das ist Absicht: Es ist der
*publishable key*, der genau dafür gedacht ist. Der Schutz liegt in den
RLS-Policies der Datenbank — jeder angemeldete Nutzer sieht ausschließlich
eigene Zeilen. Getestet: ein zweiter Nutzer sieht null Zeilen und kann
fremde Daten weder ändern noch löschen.

**Die Seite ist öffentlich erreichbar**, wer die Adresse kennt, kommt drauf.
Über `robots.txt`-Ebene ist sie per Meta-Tag auf `noindex` gesetzt, taucht
also nicht in Suchmaschinen auf. Wer die Seite aufruft, bekommt eine eigene
anonyme Kennung und damit einen eigenen, leeren Lernstand — deine Daten
sieht er nicht. Willst du es ganz dicht, aktiviere in den Vercel-Projekt-
einstellungen unter *Deployment Protection* den Passwortschutz (im
Hobby-Tarif teilweise kostenpflichtig).

**Anonyme Anmeldung heißt: ein Gerät.** Die Sitzung liegt im Browser-Speicher
des jeweiligen Geräts. Löschst du die Browserdaten oder wechselst du das
Gerät, beginnt ein neuer, leerer Lernstand — die alten Daten bleiben in der
Datenbank liegen, sind aber nicht mehr erreichbar. Wenn du Handy und Laptop
zusammenführen willst, sag Bescheid: dafür verknüpft man die anonyme
Kennung nachträglich mit einer E-Mail-Adresse.

**Aktualisieren.** Neue Fassung von `index.html` hochladen und neu
deployen. Der Service Worker holt sie beim übernächsten Start; wer sofort
will, lädt einmal hart neu (Strg+Shift+R). Die Cache-Version in `sw.js`
(`lernkonsole-v1`) kannst du hochzählen, dann wird der alte Cache verworfen.

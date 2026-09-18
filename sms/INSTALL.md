# Einbau — Schritt für Schritt

Reihenfolge einhalten. Nach jedem Schritt kompilieren; wenn etwas nicht kompiliert,
nicht weitermachen, sondern die Fehlermeldung anschauen.

**Wichtig nach jeder Änderung an einer Prozedur:**
- Kompilierfehler zeigen sich nur als **rotes X am linken Rand** der Zeile - einmal durch
  die ganze Prozedur scrollen. Scheitert das Kompilieren, bleibt **still die alte Fassung
  aktiv**, und jeder Test zeigt das alte Verhalten.
- Vor dem Kompilieren prüfen, ob wirklich der **neue Inhalt** im Editor steht (z.B. mit
  Strg+F nach einer Zeile suchen, die nur in der neuen Fassung vorkommt). Ein versehentlich
  eingefügter alter Stand verhält sich genau wie „Änderung wirkt nicht".
- SwissMail läuft als eigener Prozess (Taskleisten-Symbol). Nach Änderungen **ganz beenden**
  und neu starten, sonst läuft noch der alte Stand.

## 1. Neue Prozeduren anlegen

Im Prozedur-Explorer je eine neue Prozedur anlegen und den Dateiinhalt hineinkopieren.
Namen exakt so, sie rufen sich gegenseitig auf:

| Prozedurname | Datei |
| --- | --- |
| `Sms_Lib` | `neue Prozeduren/Sms_Lib.prc` |
| `Sms_Cfg` | `neue Prozeduren/Sms_Cfg.prc` |
| `Sms_Http` | `neue Prozeduren/Sms_Http.prc` |
| `Sms_Text` | `neue Prozeduren/Sms_Text.prc` |
| `Sms_Log` | `neue Prozeduren/Sms_Log.prc` |
| `Sms_Send` | `neue Prozeduren/Sms_Send.prc` |

`Sms_Send` zuletzt — sie ruft alle anderen auf.

## 2. Einstellungsmaske `Sms_Pref`

Jede Garage hat ihr **eigenes ASPSMS-Konto** und trägt die Zugangsdaten selbst ein.

1. Im Designer den Dialog-Frame `Sms_Pref` anlegen, nach
   `neue Prozeduren/Sms_Pref_Maske.txt` (Objektnamen exakt übernehmen).
2. In `Eml_Main` (SwissMail-Hauptfenster) den Menüeintrag „Extras → SMS-Einstellungen..."
   ergänzen, nach `neue Prozeduren/Eml_Main_Patch.txt`.

Die Maske legt beim ersten Speichern die Konfigurationsprozedur `_smsPref` selbst an —
von Hand muss nichts erstellt werden.

Nur zum Entwickeln/Testen, solange die Maske noch nicht existiert: `_smsPref` kann auch
direkt als Prozedur angelegt werden (Vorlage `neue Prozeduren/_smsPref.prc`, Format genau
einhalten: `/*` in Zeile 1, `*/main(){}` am Ende, keine Leerzeilen davor/danach).

### Was die Garage tun muss (für die Kundenanleitung)

1. Konto auf www.aspsms.com eröffnen
2. Guthaben kaufen (Mindestkauf 500 Credits)
3. Absender-ID (z.B. Garagenname, max. 11 Zeichen) festlegen. Im Test wurde `consultec`
   ohne Freischaltung akzeptiert und so angezeigt.
4. In SwissGarage unter SwissMail → Extras → SMS-Einstellungen **API-Userkey und API-Passwort**
   (ASPSMS-Kundenbereich → API-Zugangsdaten, nicht das Login-Passwort) per Kopieren/Einfügen
   eintragen - ein falsch kopiertes Passwort ergibt „Gateway-Fehler 3: Authorization failed". Absender eintragen,
   „Testmodus" einschalten, „SMS-Versand aktiv" einschalten
5. Test-SMS verschicken, dann Testmodus ausschalten

## 3. `ADR-A SMS` ersetzen

Alte Prozedur zuerst sichern (Export liegt als `Prozeduren/adr-a sms.txt` bei),
dann durch `neue Prozeduren/ADR-A SMS_neu.txt` ersetzen.

Zwei Änderungen gegenüber dem Original:
- der `Case` mit `'076','077','078','079'` weicht `eSms # 'sms:' + :5,1,15:`
- der `AKOM`-Block am Ende fällt weg

## 4. `Doc_Send:SendSingle()` patchen

Nach `neue Prozeduren/Doc_Send_Patch.txt`: drei lokale Variablen ergänzen, den Block als
erstes im Rumpf von `SendSingle()` einfügen. Am bestehenden Mailpfad ändert sich nichts —
ohne `sms:`-Marker läuft alles wie bisher.

## 5. SMS-Log-Tabelle (optional, kann nachgezogen werden)

Ohne diesen Schritt funktioniert der Versand vollständig, nur das technische Protokoll
bleibt leer (`Sms_Log:Write()` steigt am Anfang aus). Die Historie beim Kunden wird
unabhängig davon geschrieben.

Wenn du sie willst: Tabelle im Datenbank-Designer anlegen mit den Feldern aus dem
auskommentierten Block in `Sms_Log.prc` (`SMS-Datum`, `SMS-Benutzer`, `SMS-AdrDatIdt`,
`SMS-Nummer`, `SMS-Text`, `SMS-Segmente`, `SMS-Gateway`, `SMS-Status`, `SMS-MessageId`,
`SMS-Fehler`), dann in `Sms_Log.prc` `_Sms_TabLog` auf die Tabellennummer setzen und
den Block einkommentieren.

## 6. Testen

**6.1 Netz zuerst.** Vom Server aus prüfen, ob `json.aspsms.com:443` erreichbar ist.
Kommt `_ErrSckTlsConnect` zurück, hängt es an Firewall oder TLS, nicht am Code.
Bei SOCKS-Proxy: Server, Port, Benutzer, Passwort gehören als Parameter 5–8 in den
`SckConnect()`-Aufruf in `Sms_Http.prc`.

**6.1b Nicht eingerichtet.** Bevor die Maske ausgefüllt ist: F12, SMS, Senden.
Erwartet: Meldung „SMS-Versand ist nicht eingerichtet …" mit Hinweis auf Einstellungen | SMS.

**6.2 Testmodus.** Adresse mit Handy-Nummer öffnen, F12, SMS, Text tippen, Senden.
Erwartet: Maske schliesst ohne Fehlermeldung, in der Adresse steht `SMS vom <heute> …`.
Es kommt keine SMS an — das ist richtig so bei `testMode: 1`.

**6.3 Fehlerfall.** Passwort in der Maske absichtlich verfälschen, nochmals senden.
Erwartet: Dialog mit `Gateway-Fehler <Code>: <Text>`, die Maske bleibt offen,
keine Historie-Zeile. Passwort wieder korrigieren.

**6.4 Echtversand.** Testmodus in der Maske ausschalten. Je eine SMS an eine eigene Nummer bei
**Swisscom**, **Salt** und **Sunrise**. Salt ist der eigentliche Beweis — diese Nummern
gingen mit dem alten eSMS-Weg gar nicht.
Auf dem Handy prüfen: kommt die SMS an, und steht die richtige Absender-ID drin?

**6.5 Nummernformate.** Dieselbe Adresse nacheinander mit `079 123 45 67`,
`+41 79 123 45 67` und `0041791234567` im Handy-Feld — alle drei müssen ankommen.
Dann `12345` eintragen: erwartet die Meldung `Ungueltige Mobilnummer`, kein Versand.

**6.6 Text.** Eine SMS mit Umlauten (`äöüéà`) und eine mit über 160 Zeichen.
Erwartet: Umlaute korrekt auf dem Handy, langer Text als eine zusammenhängende
Nachricht (zählt bei ASPSMS als mehrere Segmente — Kostenpunkt).

## Was sich für die Anwender ändert

Nichts an der Bedienung: F12, SMS, tippen, Senden — wie vorher. Neu funktioniert es
mit jeder Mobilnummer statt nur mit Swisscom und Sunrise, und man sieht sofort, ob der
Versand geklappt hat.

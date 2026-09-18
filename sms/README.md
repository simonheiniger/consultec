# SMS-Versand über Gateway (ASPSMS)

Umsetzung von `Programmierauftrag_SMS.pdf` (28.08.2026): SMS aus dem Telefonbuch (F12) neu über
ein SMS-Gateway statt über eSMS-Mail. Bestehende Mailansicht bleibt, nur der Versandweg ändert.

## Ordner

- `Prozeduren/` — Original-Exporte aus dem System (unverändert)
- `neue Prozeduren/` — was neu dazukommt bzw. geändert wird

## Befund aus den Original-Prozeduren

`ADR-A SMS` (Altsyntax) macht heute:

1. Handy-Nummer aus `:5,1,15:` (Tabelle 5 = Adressen) prüfen, in die Zwischenablage legen
2. **Netz-Einschränkung**: nur `076/077/078/079` → `'0041' + Nr + '@esms.ch'`
   ← genau das ist die Limite aus dem Auftrag
3. `:ADR-EMail: # eSms`, dann `Call('Fnc_DocNew',140,:KOM-DatIdt:,y,'',y)`
4. Historie-Zeile in den Maskentext `AKOM-<AdressDatIdt>`

`Fnc_DocNew` ist nur ein Wrapper → `Doc_Main('DocNew',140,…)`.

**`Doc_Main:WriteLog()` kennt bereits `case 'sms'`** und schreibt
`'SMS vom <Datum> <Dokument>'` nach `AKOM-<DatIdt>` — dieselbe Mechanik wie `case 'email'`.
Die Historie ist damit erledigt: nach erfolgreichem Versand `WriteLog('sms',aAddId)` aufrufen.
Der `AKOM`-Block in `ADR-A SMS` entfällt dafür — siehe Abschnitt „Historie".

`Lib_Http` enthält nur `getResolveBody()` (schneidet den Body aus einer rohen HTTP-Antwort).
Der Request selbst läuft über die conzept-Socket-API — Muster in `HTTP_Main:Download()`:
`SckConnect()` → `HttpOpen(_HttpSendRequest,…)` → `spHttpHeader` / `CteInsertItem()` →
`HttpClose(_HttpCloseConnection)` → `HttpOpen(_HttpRecvResponse,…)` → `HttpGetData()`.
`Sms_Http.prc` ist nach genau diesem Muster gebaut, erweitert um TLS
(`SckConnect(host,443,_SckTlsMed | _SckTlsSNI,20000)`) und den Request-Body.
`Lib_File`, `Lib_Mem`, `Lib_Str`, `Lib_Crypt`. Damit entfällt die curl-Krücke;
`Sms_File.prc` wurde wieder gelöscht.

## Lösungsweg

Empfänger bekommt den Marker `sms:` (`sms:079 123 45 67`). Beim Senden erkennt die
Sende-Aktion den Marker über `Sms_Send:IsSmsRecipient()` und ruft `Sms_Send:Send()` statt
des Mailversands. Ein einziger Ansatzpunkt, keine globalen Variablen, Maske unverändert.

## Dateien in `neue Prozeduren/`

| Datei | Zweck | Status |
| --- | --- | --- |
| `ADR-A SMS_neu.txt` | Patch: Netz-Case raus, `sms:`-Marker rein | fertig |
| `Doc_Send_Patch.txt` | Einzufügender Block in `Doc_Send:SendSingle()` | fertig |
| `Sms_Lib.prc` | Nummern-Normalisierung E.164, GSM-7-Prüfung, Segmentzahl | fertig |
| `Sms_Cfg.prc` | Konfiguration `_smsPref`, Einstellungsdialog, Vorlagen (Text `SMS_VORLAGEN`, getrennt durch `---`) | fertig |
| `Eml_Main_Patch.txt` | Menüeintrag Extras → SMS-Einstellungen in SwissMail | fertig |
| `Sms_Pref_Maske.txt` | Vorgabe für den Einstellungs-Dialog, inkl. Vorlagen-Feld | Vorgabe |
| `Sms_Dlg.prc` | **neues Fenster „SMS senden"**: Name, Nummer, Text, Zeichenzähler, Vorlagen | fertig, Maske fehlt |
| `Sms_Dlg_Maske.txt` | Bauplan dazu (Teil A fest 760×560, Teil B Vorlagen per Kopieren aus Doc_Main) | Vorgabe |
| `Sms_Tpl.prc` + `Sms_Tpl_Maske.txt` | Vorlagen-Editor (Titel + mehrzeiliger Text, Liste, Neu/Löschen) | fertig |
| `Sms_LogDlg.prc` + `Sms_LogView_Maske.txt` | Verlauf der versendeten SMS (Text `SMS_LOG`) | neu |
| `_smsPref.prc` | Vorlage Konfiguration (nur Entwicklung) | Vorlage |
| `Sms_Text.prc` | Nachrichtentext aus dem Editor-Kontext holen | fertig |
| `Sms_Send.prc` | Payload, Versand, Antwortauswertung, Marker-Helfer | fertig |
| `Sms_Http.prc` | POST über TLS-Socket, Antwort auswerten | fertig |
| `Sms_Log.prc` | technisches Protokoll | Tabellennummer fehlt |

## Ablauf neu

1. `ADR-A SMS` setzt `:ADR-EMail: # 'sms:' + :5,1,15:` — keine Netzprüfung mehr
2. `Fnc_DocNew` → `Doc_Main` öffnet die Maske wie bisher
3. Benutzer tippt den Text, klickt Senden → `Doc_Send:SendSingle()`
4. Neuer erster Block dort: `Sms_Send:IsSmsRecipient(...)` erkennt den Marker,
   `Sms_Text:FromContext()` holt den Text, `Sms_Send:Send()` verschickt ihn
5. Bei Erfolg `Doc_Main:WriteLog('sms',"ADR-DatIdt")` — die Historie kann das bereits

## Stand (16.09.2026)

✅ Eigenes Fenster **„SMS senden"** statt Mailansicht: Empfänger mit Name und Nummer, Absender,
Textfeld mit Zeichenzähler, Vorlagen-Auswahl, Verlauf-Knopf.
✅ **Vorlagen-Editor** (Titel + mehrzeiliger Text, anlegen/ändern/löschen), gespeichert im
CONZEPT-Text `SMS_VORLAGEN`.
✅ **Verlauf** aller Versuche im CONZEPT-Text `SMS_LOG`, Anzeige mit Datum, Empfänger, Nummer,
Ergebnis, Umfang, Text. Aus dem SMS-Fenster gefiltert auf den Empfänger, über
SwissMail → Extras → SMS-Verlauf… vollständig.
✅ **Erfolgsmeldung** nach dem Versand, Testmodus mit Warnsymbol, Fehler mit Fehlersymbol.
✅ **160-Zeichen-Grenze** (`LengthMax` in der Maske, Kürzung im Code), Zeilenumbruch über `AutoWrap`.
✅ Erste echte SMS versendet und empfangen, Umlaute korrekt.

### Rückmeldungen des Kunden (PDF „SMS schreiben")

| Punkt | Status |
| --- | --- |
| nur wenige Zeichen möglich | behoben, war Folge des Fehlers unten |
| Fehlermeldung ab einem Wert | behoben: `Lib_Json:InsertAlpha` kann nur 250 Zeichen, die Anfrage wird jetzt direkt im Speicher gebaut |
| Zeilenumbruch am Feldende | `AutoWrap` ✓ |
| Feld kleiner, auf 160 begrenzen | Feld 150 hoch, `LengthMax` 160 |

## Was noch fehlt

1. **Tests:** Salt- oder Sunrise-Nummer, weitere Nummernformate.
2. **Absender** bei ASPSMS freischalten lassen (`CONSULTEC` wurde bisher ohne Freischaltung akzeptiert).
3. **SMS-Log-Tabelle:** Der Verlauf läuft über den Text `SMS_LOG`. Für Auswertungen (pro Benutzer,
   pro Monat, Kosten) wäre eine richtige Tabelle besser — dann nur `Sms_Log:Write()` und
   `Sms_Log:Fill()` umstellen, die Masken bleiben.
4. **Sicherung `Eml_Main`** mit der April-Vorlage vergleichen.
5. Optional: Fenster in der Grösse veränderbar (Grouping/Align wie in `Doc_Main`).

## CONZEPT 16 — gelernt bei diesem Auftrag

| Falsch angenommen | Richtig |
| --- | --- |
| `StrTrim`, `StrPos` | `StrAdj(x,_StrBegin \| _StrEnd)`, `StrFind(text,such,start)` |
| `CnvIA(zahl)` = Zahl→Text | `CnvAI` = Zahl→Text, `CnvIA` = Text→Zahl |
| `&&`, `\|\|` | `and`, `or` |
| `#define` | `define { name : wert }` |
| `var tText : alpha(4096)` | `var`-Parameter **ohne** Länge; Länge hat die Variable des Aufrufers |
| `alpha` ohne Länge für lange Texte | kurz → Überlauf bricht **still** ab; lange Daten als Memory (`Lib_Json:JsonToMem`, `MemToJson`) |
| JSON-Knotenart in `spType` | JSON-Knotenart in **`spID`**; `spType` = Datentyp des Werts |
| `Lib_Json:InsertInt(…,0)` | legt `null` an → Flags als Text `"1"`/`"0"` speichern |
| `CteInsertNode('',…)` für Array-Elemente | nicht belegt → Array als Text per `Lib_Mem:Insert` |
| `HttpPutData` | Body wird mit `HttpClose(_HttpCloseConnection,tMem)` gesendet |
| `txFormatWinAnsi` systemweit | kommt aus `@I:Doc_CtxDefine` |
| `WinDialogBox(0,…)` im Dokumentfenster | kann dahinter verschwinden → `gFrmMain` als Elternfenster |
| `Eml_Main:InitUI()` läuft immer | nur im Modul-Start; eigenständig läuft `main()` |
| Unterprozeduren beliebig anordnen | muessen vor der ersten Verwendung stehen, sonst "Prozedur unbekannt" |
| Kompilierfehler fallen auf | nur rotes X am Rand; alte Fassung bleibt still aktiv |

## Entscheide

- **Konto:** Jede Garage eröffnet ihr eigenes ASPSMS-Konto und trägt die Zugangsdaten in der
  Maske `Sms_Pref` ein. Consultec verrechnet keine SMS.
- **Eigenes SMS-Fenster** statt Mailansicht (Entscheid 16.09.2026): `ADR-A SMS` ruft `Sms_Dlg`
  statt `Fnc_DocNew`. Mit Zeichenzähler, Vorlagen-Auswahl, Name und Nummer. Zuerst feste Grösse
  760×560, veränderbar (Grouping/Align wie in `Doc_Main`) als späterer Schritt.
  Der `Doc_Send`-Patch wird dadurch überflüssig.
- **Menü:** „SMS-Einstellungen" kommt zu den Mail-Einstellungen, nicht ins Telefonbuch.
  Einrichtung ist Systemeinstellung. Aufruf: `Sms_Cfg:Dialog()`.
- **Kein Rückfall auf eSMS.** Bei einem Gateway-Fehler gibt es eine Meldung, der Benutzer kann
  erneut senden. Ein automatischer Rückfall könnte SMS doppelt zustellen und würde nur für
  CH-Nummern 076–079 mit aktivem eSMS funktionieren.

## Historie

Der `AKOM`-Block wurde aus `ADR-A SMS` **entfernt**. Die Historie schreibt neu
`Doc_Main:WriteLog('sms',"ADR-DatIdt")` aus `Doc_Send:SendSingle()`.

Gründe:

- **Richtiger Zeitpunkt.** Der alte Block lief nach `Call('Fnc_DocNew',…)` — also auch dann,
  wenn der Benutzer die Maske ohne Senden geschlossen hat. `Fnc_DocNew` hat keinen
  Rückgabewert, der Block konnte das gar nicht wissen. `WriteLog` läuft erst, wenn das
  Gateway die SMS angenommen hat.
- **Dublettenprüfung funktioniert.** Der alte `ScanText` suchte nach
  `'E-Mail vom …' + :SEB-Bezeichnung:`, eingefügt wurde aber `'SMS vom …' + :TXT-Bezeichnung:`
  — andere Vorsilbe, anderes Feld, also nie ein Treffer. Zweimal F12 am selben Tag gab zwei
  Zeilen. `WriteLog` vergleicht mit `TextSearch` gegen genau die Zeile, die es selbst schreibt.
- **Keine Doppelspurigkeit.** `WriteLog` meldet den Kommunikationstext bei der Adresse selbst an
  (`ADR-KommText` / `ADR-KomText`) und legt ihn mit `TextCreate` an — der ganze erste Teil des
  alten Blocks war damit ohnehin doppelt.

Die Zeile heisst neu `SMS vom <Datum> <gDocName>` statt `… <:TXT-Bezeichnung:>` und steht
weiterhin zuoberst im Maskentext `AKOM-<AdressDatIdt>`, gleich wie die Mail- und Brief-Zeilen.

## Test

- Normalisierung: `079 123 45 67`, `0041791234567`, `+41 79 123 45 67`, `+49 170 …`, `abc`
- Testmodus (✓ in der Maske): keine Anfrage an ASPSMS, Meldung „TESTMODUS - die SMS wurde NICHT versendet" mit Empfänger, Absender, Zeichen, Segmenten; Guthaben bleibt gleich
- Falsches Passwort → Fehlerpfad und Meldung in der Maske
- Echtversand je Netz: Swisscom, **Salt**, **Sunrise** (Salt beweist, dass die Limite weg ist)
- Umlaute + Text > 160 Zeichen → Darstellung und Segmentzahl
- Netzwerk trennen → saubere Meldung, kein Hänger

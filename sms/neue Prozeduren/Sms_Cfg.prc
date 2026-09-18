@A+
@C+

//=================================================================================================
// Sms_Cfg
// SMS-Konfiguration der Garage. Jede Garage hat ihr eigenes ASPSMS-Konto.
// Ablage als JSON-Prozedur '_smsPref' (gleiches Muster wie '_phonePref').
//
// Schluessel:
//   gateway    : 'aspsms'   Beschriftung, wird nicht ausgewertet
//   userKey    : ASPSMS Userkey
//   password   : ASPSMS Passwort
//   originator : Absender-ID, max. 11 Zeichen alphanumerisch oder Nummer in E.164
//   defaultCc  : '41'       Laendervorwahl fuer nationale Nummern
//   active     : '1'/'0'    SMS-Versand ueber Gateway eingeschaltet (Text)
//   testMode   : '1'/'0'    keine Anfrage an ASPSMS, nur Pruefung und Anzeige (Text)
//
// Bei einem Gateway-Fehler gibt es bewusst keinen Rueckfall auf eSMS: der Benutzer bekommt
// eine Meldung und kann erneut senden. Das vermeidet doppelt zugestellte SMS.
//=================================================================================================

define
  {
  sSmsPrefName : '_smsPref'
  sSmsTplName  : 'SMS_VORLAGEN'
  sSmsTplSep   : '---'
  }


//=================================================================================================
// SetAlpha()
// Lib_Json:WriteAlpha aendert nur bestehende Knoten und liefert sonst false.
// Fehlt der Schluessel noch (neue Garage, aeltere Konfiguration), wird er eingefuegt.
//
// IsFlag()
// Liest ein Ein/Aus-Flag. Flags werden bewusst als Text gespeichert:
// Lib_Json:InsertInt(...,0) legt einen null-Knoten an (CteInsertNode mit Wert 0),
// der danach nie mehr als Zahl gespeichert wird.
//=================================================================================================
sub SetAlpha
  (
  aCfg   : handle;
  aKey   : alpha(64);
  aValue : alpha(500);
  )
{
if(!Lib_Json:WriteAlpha(aCfg,aKey,aValue))
  Lib_Json:InsertAlpha(aCfg,aKey,aValue);
}

sub IsFlag
  (
  aCfg : handle;
  aKey : alpha(64);
  ) : logic;
local
  {
  tItem : handle;
  }
{
//--- Flags werden als Text "1"/"0" gespeichert. Aeltere Konfigurationen enthalten
//--- evtl. eine Zahl 1 oder null. Erst die JSON-Knotenart pruefen, dann nur den
//--- passenden Wert lesen - null wird nie gelesen.
//--- Die JSON-Knotenart steht in spID (CteInsertNode(Name, _JsonNode..., Wert),
//--- Lib_Json:Open setzt spID). spType ist der Datentyp des Werts, nicht die Knotenart.
tItem # aCfg->CteRead(_CteNodePath,0,aKey);
if(tItem = 0)
  return(false);

if(tItem->spID = _JsonNodeString)
  return(tItem->spValueAlpha = '1');

if(tItem->spID = _JsonNodeNumber)
  return(tItem->spValueInt = 1);

return(false);
}


//=================================================================================================
// Load()
// Liest die Konfiguration. Existiert '_smsPref' noch nicht, wird eine leere Konfiguration
// mit Standardwerten geliefert - der Aufrufer merkt am Flag 'active', dass nichts eingerichtet ist.
//=================================================================================================
sub Load
  (
  var tCfg : handle;
  ) : logic;
local
  {
  tRet : int;
  }
{
tRet # Lib_Json:LoadPrc(var tCfg,sSmsPrefName);
if(tRet < 0)
  {
  //--- noch nie gespeichert: mit leerem Objekt weiterarbeiten ---
  if(tCfg > 0)
    CteClose(tCfg);
  Lib_Json:Open(var tCfg);
  }

if(Lib_Json:ReadAlpha(tCfg,'gateway') = '')
  SetAlpha(tCfg,'gateway','aspsms');

if(Lib_Json:ReadAlpha(tCfg,'defaultCc') = '')
  SetAlpha(tCfg,'defaultCc','41');

return(true);
}


//=================================================================================================
// Save()
//=================================================================================================
sub Save
  (
  aCfg : handle;
  )
{
Lib_Json:SavePrc(aCfg,sSmsPrefName);
}


//=================================================================================================
// IsActive()
// true, wenn der Gateway-Versand eingeschaltet und vollstaendig konfiguriert ist.
//=================================================================================================
sub IsActive() : logic;
local
  {
  tCfg : handle;
  tOk  : logic;
  }
{
Load(var tCfg);

tOk # IsFlag(tCfg,'active')
   and (Lib_Json:ReadAlpha(tCfg,'userKey') != '')
   and (Lib_Json:ReadAlpha(tCfg,'password') != '')
   and (Lib_Json:ReadAlpha(tCfg,'originator') != '');

CteClose(tCfg);
return(tOk);
}


//=================================================================================================
// Vorlagen
// Gespeichert als CONZEPT-Text 'SMS_VORLAGEN' (wie die Kommunikationstexte AKOM-...),
// darum ohne Laengengrenze.
//
// Format: Vorlagen werden durch eine Zeile mit '---' getrennt. Eine Vorlage darf also
// mehrere Zeilen haben; die erste Zeile ist die Bezeichnung in der Auswahlliste.
//=================================================================================================

//=================================================================================================
// TemplatesToAlpha()
// Alle Vorlagen als ein Text mit Zeilenumbruechen - fuer das TextEdit in Sms_Pref.
// Rueckgabe: Anzahl Vorlagen.
//=================================================================================================
sub TemplatesToAlpha
  (
  var tText : alpha;
  ) : int;
local
  {
  tBuf    : handle;
  tErr    : int;
  tCount  : int;
  tLineNo : int;
  tLine   : alpha(4096);
  }
{
tText # '';
tBuf  # TextOpen(512);
tErr  # tBuf->TextRead(sSmsTplName,0);
if(tErr != 0)
  {
  tBuf->TextClose();
  return(0);
  }

tCount  # tBuf->TextInfo(_TextLines);
tLineNo # 1;
while(tLineNo <= tCount)
  {
  tLine # tBuf->TextLineRead(tLineNo,0);
  if(StrLen(tText) + StrLen(tLine) > 4000)
    break;
  if(tLineNo = 1)
    tText # tLine;
  else
    tText # tText + StrChar(13) + StrChar(10) + tLine;
  tLineNo # tLineNo + 1;
  }

tBuf->TextClose();
return(tCount);
}


//=================================================================================================
// TemplatesFromAlpha()
// Speichert den Inhalt des TextEdit: jede nicht leere Zeile wird eine Vorlage.
// Zeilen koennen mit CR+LF oder nur LF getrennt sein.
//=================================================================================================
sub TemplatesFromAlpha
  (
  aText : alpha(4096);
  ) : logic;
local
  {
  tBuf  : handle;
  tErr  : int;
  tRest : alpha(4096);
  tLine : alpha(4096);
  tPos  : int;
  }
{
tBuf  # TextOpen(512);
tRest # aText;

while(tRest != '')
  {
  tPos # StrFind(tRest,StrChar(10),1);
  if(tPos > 0)
    {
    tLine # StrCut(tRest,1,tPos-1);
    tRest # StrCut(tRest,tPos+1,StrLen(tRest)-tPos);
    }
  else
    {
    tLine # tRest;
    tRest # '';
    }

  //--- CR am Zeilenende entfernen. Leerzeilen bleiben erhalten, sie gehoeren
  //--- zum Vorlagentext (Absatz vor der Grussformel).
  tLine # Mdl_Lib:StrRep(tLine,StrChar(13),'',true);
  tBuf->TextLineWrite(tBuf->TextInfo(_TextLines) + 1,tLine,_TextLineInsert);
  }

tErr # TextCreate(sSmsTplName,0);
tErr # tBuf->TextWrite(sSmsTplName,0);
tBuf->TextClose();
return(tErr = 0);
}


//=================================================================================================
// TemplatesFill()
// Fuellt eine DataList: Spalte 1 = Anzeige (Anfang der Vorlage), Spalte 2 = ganzer Text.
// Muster wie Doc_Send beim Fuellen von dlFromAddress.
// Rueckgabe: Anzahl Vorlagen.
//=================================================================================================
sub TemplatesFill
  (
  aList : handle;
  ) : int;
local
  {
  tBuf    : handle;
  tErr    : int;
  tLines  : int;
  tLineNo : int;
  tLine   : alpha(4096);
  tTitle  : alpha(250);
  tText   : alpha(4096);
  tHasTpl : logic;
  tCount  : int;
  }
{
tBuf # TextOpen(512);
tErr # tBuf->TextRead(sSmsTplName,0);
if(tErr != 0)
  {
  tBuf->TextClose();
  return(0);
  }

tLines  # tBuf->TextInfo(_TextLines);
tLineNo # 1;
tTitle  # '';
tText   # '';
tHasTpl # false;
tCount  # 0;

//--- Erste Zeile eines Blocks = Titel (nur fuer die Liste),
//--- alle weiteren Zeilen = Text der SMS.
while(tLineNo <= tLines + 1)
  {
  if(tLineNo <= tLines)
    tLine # tBuf->TextLineRead(tLineNo,0);
  else
    tLine # sSmsTplSep;

  if(StrAdj(tLine,_StrBegin | _StrEnd) = sSmsTplSep)
    {
    //--- Vorlagen ohne Titel ueberspringen (Leerzeilen am Anfang oder doppelte ---) ---
    if(tHasTpl and (tTitle != ''))
      {
      aList->WinLstDatLineAdd(StrCut(tTitle,1,60),_WinLstDatLineLast);
      aList->WinLstCellSet(tText,2,_WinLstDatLineLast,_WinLstDatModeDefault);
      tCount # tCount + 1;
      }
    tTitle  # '';
    tText   # '';
    tHasTpl # false;
    }
  else
    {
    if(!tHasTpl)
      {
      tTitle  # StrAdj(tLine,_StrBegin | _StrEnd);
      tHasTpl # true;
      }
    else
      {
      if(StrLen(tText) + StrLen(tLine) < 4000)
        {
        //--- CR+LF, sonst zeigt das TextEdit alles auf einer Zeile ---
        if(tText = '')
          tText # tLine;
        else
          tText # tText + StrChar(13) + StrChar(10) + tLine;
        }
      }
    }

  tLineNo # tLineNo + 1;
  }

tBuf->TextClose();
return(tCount);
}


//=================================================================================================
// TemplatesFromList()
// Schreibt alle Zeilen einer DataList (Spalte 2 = ganzer Vorlagentext) in den Text
// SMS_VORLAGEN zurueck, getrennt durch eine Zeile mit '---'.
//=================================================================================================
sub TemplatesFromList
  (
  aList : handle;
  ) : logic;
local
  {
  tBuf     : handle;
  tErr     : int;
  tCount   : int;
  tLineNo  : int;
  tWritten : int;
  tTitle   : alpha(250);
  tText    : alpha(4096);
  tRest    : alpha(4096);
  tLine    : alpha(4096);
  tPos     : int;
  }
{
tBuf   # TextOpen(512);
tCount # aList->WinLstDatLineInfo(_WinLstDatInfoCount);

tLineNo  # 1;
tWritten # 0;

while(tLineNo <= tCount)
  {
  tTitle # '';
  tText  # '';
  aList->WinLstCellGet(tTitle,1,tLineNo);
  aList->WinLstCellGet(tText ,2,tLineNo);
  tTitle # StrAdj(tTitle,_StrBegin | _StrEnd);

  //--- Vorlagen ohne Titel werden nicht gespeichert ---
  if(tTitle != '')
    {
    //--- Trennzeile zwischen den Vorlagen ---
    if(tWritten > 0)
      tBuf->TextLineWrite(tBuf->TextInfo(_TextLines) + 1,sSmsTplSep,_TextLineInsert);

    //--- Titelzeile ---
    tBuf->TextLineWrite(tBuf->TextInfo(_TextLines) + 1,tTitle,_TextLineInsert);

    //--- Textzeilen ---
    tRest # tText;
    while(tRest != '')
      {
      tPos # StrFind(tRest,StrChar(10),1);
      if(tPos > 0)
        {
        tLine # StrCut(tRest,1,tPos-1);
        tRest # StrCut(tRest,tPos+1,StrLen(tRest)-tPos);
        }
      else
        {
        tLine # tRest;
        tRest # '';
        }
      tLine # Mdl_Lib:StrRep(tLine,StrChar(13),'',true);
      tBuf->TextLineWrite(tBuf->TextInfo(_TextLines) + 1,tLine,_TextLineInsert);
      }

    tWritten # tWritten + 1;
    }

  tLineNo # tLineNo + 1;
  }

tErr # TextCreate(sSmsTplName,0);
tErr # tBuf->TextWrite(sSmsTplName,0);
tBuf->TextClose();
return(tErr = 0);
}


//=================================================================================================
// Dialog()
// Einstellungsmaske fuer die Garage. Oeffnet den Frame 'Sms_Pref' (im Designer anzulegen,
// Objektnamen siehe neue Prozeduren/Sms_Pref_Maske.txt), fuellt die Felder, speichert bei OK.
// Aufruf aus dem Einstellungsmenue: Sms_Cfg:Dialog(gFrmMain) bzw. Call('Sms_Cfg:Dialog').
//=================================================================================================
sub Dialog
  (
  opt aParent : handle;
  ) : logic;
local
  {
  tCfg      : handle;
  tFrame    : handle;
  tNew      : handle;
  tChk      : handle;
  tOk       : logic;
  tRet      : int;
  tOrig     : alpha(250);
  tPassword : alpha(250);
  }
{
Load(var tCfg);

tFrame # WinOpen('Sms_Pref',_WinOpenDialog);
if(tFrame <= 0)
  {
  CteClose(tCfg);
  WinDialogBox(0,'SMS','Maske Sms_Pref wurde nicht gefunden.',_WinIcoError,_WinDialogOK,1);
  return(false);
  }

//--- Felder fuellen ------------------------------------------------------------
$edSmsUserKey->wpCaption    # Lib_Json:ReadAlpha(tCfg,'userKey');
$edSmsPassword->wpCaption   # Lib_Json:ReadAlpha(tCfg,'password');
$edSmsOriginator->wpCaption # Lib_Json:ReadAlpha(tCfg,'originator');
$edSmsDefaultCc->wpCaption  # Lib_Json:ReadAlpha(tCfg,'defaultCc');

Mdl_Lib:SetCh($cbSmsActive  ,IsFlag(tCfg,'active'));
Mdl_Lib:SetCh($cbSmsTestMode,IsFlag(tCfg,'testMode'));

//--- Rueckgabe 1 = OK, wie in Mdl_Lib:DialogDelete() ---
tRet # WinDialogRun(tFrame,_WinDialogCenter,aParent);

if(tRet != 1)
  {
  tFrame->WinClose();
  CteClose(tCfg);
  return(false);
  }

//--- Eingaben uebernehmen ------------------------------------------------------
//--- Konfiguration wird bei jedem Speichern komplett neu aufgebaut. So bleiben
//--- keine alten Knoten mit falschem Typ (z.B. null) aus frueheren Versionen stehen.
tOrig     # StrAdj($edSmsOriginator->wpCaption,_StrBegin | _StrEnd);
tPassword # StrAdj($edSmsPassword->wpCaption,_StrBegin | _StrEnd);

Lib_Json:Open(var tNew);
Lib_Json:InsertAlpha(tNew,'gateway'   ,'aspsms');
Lib_Json:InsertAlpha(tNew,'userKey'   ,StrAdj($edSmsUserKey->wpCaption,_StrBegin | _StrEnd));
Lib_Json:InsertAlpha(tNew,'password'  ,tPassword);
Lib_Json:InsertAlpha(tNew,'originator',tOrig);
Lib_Json:InsertAlpha(tNew,'defaultCc' ,StrAdj($edSmsDefaultCc->wpCaption,_StrBegin | _StrEnd));

if(Mdl_Lib:GetCh($cbSmsActive))
  Lib_Json:InsertAlpha(tNew,'active','1');
else
  Lib_Json:InsertAlpha(tNew,'active','0');

if(Mdl_Lib:GetCh($cbSmsTestMode))
  Lib_Json:InsertAlpha(tNew,'testMode','1');
else
  Lib_Json:InsertAlpha(tNew,'testMode','0');

tFrame->WinClose();

//--- Plausibilitaet: alphanumerische Absender-ID max. 11 Zeichen ------------------
if((StrCut(tOrig,1,1) != '+') and (StrLen(tOrig) > 11))
  WinDialogBox(0,'SMS','Die Absender-ID "' + tOrig + '" ist länger als 11 Zeichen.' + StrChar(13)+StrChar(10)
             + 'ASPSMS kürzt oder ersetzt sie.',_WinIcoWarning,_WinDialogOK,1);

Save(tNew);

//--- Kontrolle: gespeicherte Konfiguration sofort zuruecklesen. Load() faengt
//--- Lesefehler still ab und liefert dann eine leere Konfiguration - hier wird
//--- das sichtbar gemacht.
tRet # Lib_Json:LoadPrc(var tChk,sSmsPrefName);
tOk  # (tRet >= 0);
if(tOk)
  {
  tOk # (Lib_Json:ReadAlpha(tChk,'userKey')    = Lib_Json:ReadAlpha(tNew,'userKey'))
    and (Lib_Json:ReadAlpha(tChk,'password')   = Lib_Json:ReadAlpha(tNew,'password'))
    and (Lib_Json:ReadAlpha(tChk,'originator') = Lib_Json:ReadAlpha(tNew,'originator'))
    and (IsFlag(tChk,'active')   = IsFlag(tNew,'active'))
    and (IsFlag(tChk,'testMode') = IsFlag(tNew,'testMode'));
  }
if(tChk > 0)
  CteClose(tChk);

if(!tOk)
  WinDialogBox(0,'SMS','Die SMS-Einstellungen wurden nicht korrekt gespeichert (Lesen = '
             + CnvAI(tRet) + ').' + StrChar(13)+StrChar(10) + StrChar(13)+StrChar(10)
             + 'Ist die Prozedur _smsPref im Prozedur-Editor geöffnet? Dann schliessen '
             + 'und nochmals speichern.',_WinIcoError,_WinDialogOK,1);

CteClose(tNew);
CteClose(tCfg);
return(tOk);
}

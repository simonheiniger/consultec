@A+
@C+

//=================================================================================================
// Sms_Log
// Protokollierung des SMS-Versands.
//
// WriteHistory() schreibt die Zeile "SMS vom <Datum> <Textanfang>" in den Kommunikations-
// text AKOM-<AdressDatIdt> - dieselbe Logik wie Doc_Main:WriteLog(), aber ohne die
// globalen Variablen der Mailansicht, damit das eigene SMS-Fenster sie nutzen kann.
//
// Write() schreibt zusaetzlich das technische Protokoll in den CONZEPT-Text SMS_LOG
// (eine Zeile pro Versuch, neuste zuoberst). Das ersetzt vorerst die SMS-Log-Tabelle;
// wird spaeter eine Tabelle angelegt, wird nur Write() umgestellt.
//
// Zeilenformat:  Datum | AdrId | Nummer | Ergebnis | Umfang | Textanfang
// Der Empfaengername wird nicht gespeichert, sondern beim Anzeigen aus der Adresse
// geholt (Tabelle 1 ueber ADR-DatIdt) - so stimmt er auch nach einer Namensaenderung.
//=================================================================================================

define
  {
  sSmsLogName : 'SMS_LOG'
  sSmsLogSep  : ' | '

  //--- Tabellennummer der SMS-Log-Tabelle, siehe Sms_LogTab.txt.
  //--- 0 = noch keine Tabelle, dann laeuft alles ueber den Text SMS_LOG.
  //--- 516 = SMS-Protokoll (Kommunikationsblock 500-515 war belegt).
  sSmsTabLog  : 516
  }


//=================================================================================================
// Write()
// Schreibt einen Protokolleintrag. Das Gateway-Passwort wird nie protokolliert.
// aStatus: '1' = versendet, sonst der Fehlercode bzw. leer bei Transportfehler.
//=================================================================================================
sub Write
  (
  aAddId    : int;
  aNumber   : alpha(50);
  aText     : alpha(4096);
  aSegments : int;
  aStatus   : alpha(20);
  aMsgId    : alpha(100);
  aError    : alpha(1000);
  ) : logic;
local
  {
  tBuf    : handle;
  tErr    : int;
  tDate   : date;
  tTime   : time;
  tCfg    : handle;
  tLine   : alpha(4096);
  tResult : alpha(250);
  tShort  : alpha(4096);
  tSender : alpha(50);
  tPos    : int;
  }
{
tDate->vmServerTime();

if(aStatus = '1')
  tResult # 'versendet';
else
  {
  tResult # 'FEHLER';
  if(aError != '')
    tResult # 'FEHLER: ' + StrCut(aError,1,60);
  }

//--- Absender aus der Konfiguration ---
Sms_Cfg:Load(var tCfg);
tSender # Lib_Json:ReadAlpha(tCfg,'originator');
CteClose(tCfg);

//--- Textanfang in einer Zeile ---
tShort # aText;
tPos # StrFind(tShort,StrChar(13),1);
if(tPos > 0)
  tShort # StrCut(tShort,1,tPos-1);
tPos # StrFind(tShort,StrChar(10),1);
if(tPos > 0)
  tShort # StrCut(tShort,1,tPos-1);

//=================================================================================================
// Variante mit Tabelle
//=================================================================================================
if(sSmsTabLog > 0)
  {
  tTime->vmServerTime();

  tBuf # RecBufCreate(sSmsTabLog);
  tBuf->"SMS-Datum"      # tDate;
  tBuf->"SMS-Zeit"       # tTime;
  tBuf->"SMS-ADR DatIdt" # aAddId;
  tBuf->"SMS-Nummer"     # aNumber;
  tBuf->"SMS-Absender"   # tSender;
  tBuf->"SMS-User"       # Lib_User:GetId();
  tBuf->"SMS-Ergebnis"   # tResult;
  tBuf->"SMS-Status"     # aStatus;
  tBuf->"SMS-MessageId"  # aMsgId;
  tBuf->"SMS-Segmente"   # aSegments;
  tBuf->"SMS-Text"       # StrCut(tShort,1,250);

  //--- RecInsert(Datei,Optionen) liefert _rOk bei Erfolg ---
  tErr # RecInsert(tBuf,0);
  RecBufDestroy(tBuf);
  return(tErr = _rOk);
  }

//=================================================================================================
// Variante mit Text SMS_LOG (solange keine Tabelle angelegt ist)
//=================================================================================================
tLine # CnvAD(tDate,_FmtInternal) + sSmsLogSep
      + CnvAI(aAddId,_FmtNumNoGroup) + sSmsLogSep
      + aNumber                   + sSmsLogSep
      + tResult                   + sSmsLogSep
      + CnvAI(aSegments) + ' SMS' + sSmsLogSep
      + StrCut(tShort,1,80);

tBuf # TextOpen(512);
tErr # TextCreate(sSmsLogName,0);
tErr # tBuf->TextRead(sSmsLogName,0);

//--- neuste Zeile zuoberst ---
tBuf->TextLineWrite(1,tLine,_TextLineInsert);

tErr # tBuf->TextWrite(sSmsLogName,0);
tBuf->TextClose();

return(tErr = 0);
}


//=================================================================================================
// GetName()
// Empfaengername zur Adress-Id, leer wenn die Adresse fehlt.
//=================================================================================================
sub GetName
  (
  aAddId : int;
  ) : alpha;
local
  {
  tAdr  : handle;
  tName : alpha(250);
  }
{
tName # '';
if(aAddId <= 0)
  return('');

tAdr # RecBufCreate(1);
tAdr->"ADR-DatIdt" # aAddId;
if(RecRead(tAdr,1,0) = 0)
  tName # StrAdj(tAdr->"ADR-Vorname" + ' ' + tAdr->"ADR-Name",_StrBegin | _StrEnd);
RecBufDestroy(tAdr);

return(tName);
}


//=================================================================================================
// Fill()
// Fuellt eine DataList mit dem Verlauf.
// Spalten: 1 Datum, 2 Empfaenger, 3 Nummer, 4 Ergebnis, 5 Umfang, 6 Text
// aAddId > 0 zeigt nur die SMS an diese Adresse, 0 zeigt alle.
// Rueckgabe: Anzahl angezeigter Zeilen.
//=================================================================================================
sub Fill
  (
  aList  : handle;
  opt aAddId : int;
  ) : int;
local
  {
  tBuf    : handle;
  tErr    : int;
  tLines  : int;
  tLineNo : int;
  tLine   : alpha(4096);
  tRest   : alpha(4096);
  tPart   : alpha(4096);
  tDate   : alpha(20);
  tId     : int;
  tNumber : alpha(50);
  tResult : alpha(250);
  tSize   : alpha(20);
  tText   : alpha(4096);
  tCol    : int;
  tPos    : int;
  tCount  : int;
  }
{
//=================================================================================================
// Variante mit Tabelle: rueckwaerts lesen, damit die neusten zuoberst stehen
//=================================================================================================
if(sSmsTabLog > 0)
  {
  tCount # 0;
  tBuf # RecBufCreate(sSmsTabLog);

  //--- rueckwaerts ueber Schluessel 1: neuste zuerst ---
  for tErr # RecRead(tBuf,1,_RecLast);
  loop tErr # RecRead(tBuf,1,_RecPrev);
  while(tErr = _rOk)
    {
    if((aAddId <= 0) or (tBuf->"SMS-ADR DatIdt" = aAddId))
      {
      aList->WinLstDatLineAdd(CnvAD(tBuf->"SMS-Datum",_FmtInternal),_WinLstDatLineLast);
      aList->WinLstCellSet(GetName(tBuf->"SMS-ADR DatIdt")     ,2,_WinLstDatLineLast,_WinLstDatModeDefault);
      aList->WinLstCellSet(tBuf->"SMS-Nummer"                 ,3,_WinLstDatLineLast,_WinLstDatModeDefault);
      aList->WinLstCellSet(tBuf->"SMS-Ergebnis"               ,4,_WinLstDatLineLast,_WinLstDatModeDefault);
      aList->WinLstCellSet(CnvAI(tBuf->"SMS-Segmente") + ' SMS',5,_WinLstDatLineLast,_WinLstDatModeDefault);
      aList->WinLstCellSet(tBuf->"SMS-Text"                   ,6,_WinLstDatLineLast,_WinLstDatModeDefault);
      tCount # tCount + 1;
      }
    }

  RecBufDestroy(tBuf);
  return(tCount);
  }

//=================================================================================================
// Variante mit Text SMS_LOG
//=================================================================================================
tBuf # TextOpen(512);
tErr # tBuf->TextRead(sSmsLogName,0);
if(tErr != 0)
  {
  tBuf->TextClose();
  return(0);
  }

tLines  # tBuf->TextInfo(_TextLines);
tLineNo # 1;
tCount  # 0;

while(tLineNo <= tLines)
  {
  tLine # tBuf->TextLineRead(tLineNo,0);

  if(StrAdj(tLine,_StrBegin | _StrEnd) != '')
    {
    tDate   # '';
    tId     # 0;
    tNumber # '';
    tResult # '';
    tSize   # '';
    tText   # '';

    tRest # tLine;
    tCol  # 1;
    while((tRest != '') and (tCol <= 6))
      {
      tPos # StrFind(tRest,sSmsLogSep,1);
      if(tPos > 0)
        {
        tPart # StrCut(tRest,1,tPos-1);
        tRest # StrCut(tRest,tPos+StrLen(sSmsLogSep),StrLen(tRest)-tPos-StrLen(sSmsLogSep)+1);
        }
      else
        {
        tPart # tRest;
        tRest # '';
        }

      if(tCol = 1)
        tDate # tPart;

      //--- Alte Zeilen ohne Adress-Id: dort steht an zweiter Stelle die Nummer ---
      if(tCol = 2)
        {
        if(StrCut(tPart,1,1) = '+')
          {
          tNumber # tPart;
          tCol    # 3;
          }
        else
          tId # CnvIA(tPart);
        }
      else
        {
        if(tCol = 3)
          tNumber # tPart;
        if(tCol = 4)
          tResult # tPart;
        if(tCol = 5)
          tSize # tPart;
        if(tCol = 6)
          tText # tPart;
        }

      tCol # tCol + 1;
      }

    //--- Filter auf eine Adresse ---
    if((aAddId <= 0) or (tId = aAddId))
      {
      aList->WinLstDatLineAdd(tDate,_WinLstDatLineLast);
      aList->WinLstCellSet(GetName(tId),2,_WinLstDatLineLast,_WinLstDatModeDefault);
      aList->WinLstCellSet(tNumber     ,3,_WinLstDatLineLast,_WinLstDatModeDefault);
      aList->WinLstCellSet(tResult     ,4,_WinLstDatLineLast,_WinLstDatModeDefault);
      aList->WinLstCellSet(tSize       ,5,_WinLstDatLineLast,_WinLstDatModeDefault);
      aList->WinLstCellSet(tText       ,6,_WinLstDatLineLast,_WinLstDatModeDefault);
      tCount # tCount + 1;
      }
    }

  tLineNo # tLineNo + 1;
  }

tBuf->TextClose();
return(tCount);
}


//=================================================================================================
// WriteHistory()
// Uebernommen aus Doc_Main:WriteLog(): Kommunikationstext bei der Adresse anmelden,
// Text anlegen/lesen, Zeile oben einfuegen (ohne Dublette), Text schreiben.
//=================================================================================================
sub WriteHistory
  (
  aAddId : int;
  aText  : alpha(4096);
  ) : logic;
local
  {
  tErr       : int;
  tBufText   : handle;
  tBufAdr    : handle;
  tTextName  : alpha(32);
  tDate      : date;
  tDateAlpha : alpha(16);
  tLine      : alpha(255);
  tShort     : alpha(4096);
  tPos       : int;
  }
{
if(aAddId <= 0)
  return(false);

tBufAdr # RecBufCreate(1);
tBufAdr->"ADR-DatIdt" # aAddId;
tErr # RecRead(tBufAdr,1,0);
if(tErr != 0)
  {
  RecBufDestroy(tBufAdr);
  return(false);
  }

tTextName # 'AKOM-' + CnvAI(aAddId,_FmtNumNoGroup);
tDate->vmServerTime();
tDateAlpha # CnvAD(tDate,_FmtInternal);

if(tBufAdr->"ADR-KommText" = N)
  {
  RecRead(tBufAdr,1,_RecLock);
  tBufAdr->"ADR-KommText" # Y;
  tBufAdr->"ADR-KomText" # tTextName;
  RecReplace(tBufAdr,_RecUnLock);
  }
RecBufDestroy(tBufAdr);

//--- Textanfang: bis zum ersten Zeilenumbruch, hoechstens 60 Zeichen ---
tShort # aText;
tPos # StrFind(tShort,StrChar(13),1);
if(tPos > 0)
  tShort # StrCut(tShort,1,tPos-1);
tPos # StrFind(tShort,StrChar(10),1);
if(tPos > 0)
  tShort # StrCut(tShort,1,tPos-1);
tLine # 'SMS vom ' + tDateAlpha + ' ' + StrCut(tShort,1,60);

tBufText # TextOpen(512);
tErr # TextCreate(tTextName,0);
tErr # tBufText->TextRead(tTextName,0);

if(tBufText->TextSearch(1,1,_TextSearchCI,tLine) = 0)
  tBufText->TextLineWrite(1,tLine,_TextLineInsert);

tErr # tBufText->TextWrite(tTextName,0);
tBufText->TextClose();

return(tErr = 0);
}

@A+
@C+
@I:Doc_CtxDefine
// Doc_CtxDefine liefert txFormatWinAnsi (wie in Doc_Send)

//=================================================================================================
// Sms_Text
// Holt den Nachrichtentext aus dem Editor der Mailansicht.
// Verwendet denselben Weg wie Doc_Send:SendSingle() fuer die Plain-Text-Variante der Mail:
// gCtx->cpiSave(...,txFormatWinAnsi), danach die Datei zeilenweise einlesen.
//=================================================================================================


//=================================================================================================
// FromContext()
// aCtx    : Editor-Kontext (gCtx aus Doc_Send)
// aTempP  : Temp-Ordner, z.B. von Mdl_Lib:CreateTempFolder('SendSms')
// tText   : Text, Zeilen mit LF getrennt. '' bei Fehler.
// Ergebnis ueber var-Parameter mit fester Laenge statt Rueckgabewert 'alpha',
// damit laengere Texte nicht ueberlaufen.
//=================================================================================================
sub FromContext
  (
  aCtx      : handle;
  aTempP    : alpha(1000);
  var tText : alpha;
  ) : logic;
local
  {
  tPNE     : alpha(1000);
  tTxtHdl  : handle;
  tLine    : alpha(4096);
  tLineNo  : int;
  tCount   : int;
  tRet     : int;
  }
{
tText # '';
tPNE  # aTempP + 'Sms.txt';

tRet # aCtx->cpiSave(tPNE,0,txFormatWinAnsi);
if(tRet <= 0)
  return(false);

tTxtHdl # TextOpen(512);
tTxtHdl->TextRead(tPNE,_TextExtern | _TextANSI);

tCount  # tTxtHdl->TextInfo(_TextLines);
tLineNo # 1;

while(tLineNo <= tCount)
  {
  tLine # tTxtHdl->TextLineRead(tLineNo,0);

  //--- SMS-Text sinnvoll begrenzen: mehr als 10 Segmente ist kein SMS-Fall mehr ---
  if(StrLen(tText) + StrLen(tLine) > 1530)
    break;

  if(tLineNo = 1)
    tText # tLine;
  else
    tText # tText + StrChar(10) + tLine;

  tLineNo # tLineNo + 1;
  }

tTxtHdl->TextClose();

tText # StrAdj(tText,_StrBegin | _StrEnd);
return(true);
}

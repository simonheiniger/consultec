@A+
@C+

//=================================================================================================
// Sms_Dlg
// Eigenes Fenster "SMS senden": Empfaenger (Name + Nummer), Textfeld mit Zeichenzaehler,
// Vorlagen-Auswahl, Senden/Abbrechen. Ersetzt fuer SMS die Mailansicht (Fnc_DocNew).
//
// Aufruf aus ADR-A SMS (Altsyntax):  Call('Sms_Dlg',:5,1,24:,:5,1,15:);
//
// Maske: Frame 'Sms_Dlg' - Objekte und Ereignisse siehe Sms_Dlg_Maske.txt
//   Ereignisse:  teSmsText     EvtChanged   -> Sms_Dlg:EvtChanged
//                dlSmsTpl      EvtMouseItem -> Sms_Dlg:EvtMouseItem
//                btSmsSend     EvtClicked   -> Sms_Dlg:EvtClicked
//                btSmsTplEdit  EvtClicked   -> Sms_Dlg:EvtClicked (Vorlagen-Editor)
//                btSmsLog      EvtClicked   -> Sms_Dlg:EvtClicked (Verlauf)
//=================================================================================================


define
  {
  sSmsMaxChars : 160
  }


//=================================================================================================
// LimitText()
// Begrenzt das Nachrichtenfeld auf sSmsMaxChars Zeichen (eine SMS).
// Wird beim Tippen und beim Einsetzen einer Vorlage aufgerufen.
//=================================================================================================
sub LimitText()
local
  {
  tText : alpha(4096);
  }
{
tText # $teSmsText->wpCaption;
if(StrLen(tText) > sSmsMaxChars)
  $teSmsText->wpCaption # StrCut(tText,1,sSmsMaxChars);
}


//=================================================================================================
// UpdateCounter()
// Zaehlertext unter dem Textfeld aktualisieren, z.B. "52 / 160 - 1 SMS".
//=================================================================================================
sub UpdateCounter()
local
  {
  tText : alpha(4096);
  }
{
tText # $teSmsText->wpCaption;
$lbSmsCount->wpCaption # Sms_Lib:CounterText(tText);
}


//=================================================================================================
// EvtChanged()
// Text im Nachrichtenfeld wurde geaendert -> Zaehler nachfuehren.
//=================================================================================================
sub EvtChanged
  (
  aEvt : event;
  ) : logic;
{
if(aEvt:Obj->wpName = 'teSmsText')
  {
  LimitText();
  UpdateCounter();
  }
return(true);
}


//=================================================================================================
// EvtMouseItem()
// Vorlage in der Aufklapp-Liste angeklickt -> Text uebernehmen, Liste schliessen.
// Muster wie Doc_Evt:EvtMouseItem (dlFromAddress).
//=================================================================================================
sub EvtMouseItem
  (
  aEvt     : event;
  aButton  : int;
  aHitTest : int;
  aItem    : handle;
  aID      : int;
  ) : logic;
local
  {
  tObj   : handle;
  tTitle : alpha(250);
  tText  : alpha(4096);
  }
{
tObj # aEvt:obj;
if(tObj->wpName = 'dlSmsTpl')
  {
  //--- Spalte 1 = Titel (nur Anzeige), Spalte 2 = Text der SMS ---
  tTitle # '';
  tText  # '';
  tObj->WinLstCellGet(tTitle,1,_WinLstDatLineCurrent);
  tObj->WinLstCellGet(tText ,2,_WinLstDatLineCurrent);
  $teSmsText->wpCaption # tText;
  $edSmsTpl->wpCaption  # tTitle;
  $edSmsTpl->wpPopupOpen # false;
  LimitText();
  UpdateCounter();
  }
return(true);
}


//=================================================================================================
// EvtClicked()
// Senden-Knopf. Bei Erfolg: Historie schreiben, Fenster schliessen.
// Bei Fehler oder Testmodus: Meldung, Fenster bleibt offen.
//=================================================================================================
sub EvtClicked
  (
  aEvt : event;
  ) : logic;
local
  {
  tNumber : alpha(50);
  tShown  : alpha(50);
  tText   : alpha(4096);
  tError  : alpha(1000);
  tCfg    : handle;
  tAddId  : int;
  }
{
//--- Vorlagen-Editor oeffnen, danach Auswahlliste neu fuellen ---
if(aEvt:Obj->wpName = 'btSmsTplEdit')
  {
  Sms_Tpl();
  $dlSmsTpl->WinLstDatLineRemove(_WinLstDatLineAll);
  Sms_Cfg:TemplatesFill($dlSmsTpl);
  $edSmsTpl->wpCaption # '';
  return(true);
  }

//--- Verlauf anzeigen ---
if(aEvt:Obj->wpName = 'btSmsLog')
  {
  //--- nur der Verlauf dieses Empfaengers ---
  Sms_LogDlg(CnvIA($lbSmsAdrId->wpCaption));
  return(true);
  }

if(aEvt:Obj->wpName != 'btSmsSend')
  return(true);

tNumber # StrAdj($edSmsNumber->wpCaption,_StrBegin | _StrEnd);
tText   # $teSmsText->wpCaption;
tAddId  # CnvIA($lbSmsAdrId->wpCaption);

if(Sms_Send:Send(tNumber,tText,tAddId,var tError))
  {
  Sms_Log:WriteHistory(tAddId,tText);

  //--- fuer die Meldung die tatsaechlich verwendete Nummer anzeigen ---
  Sms_Cfg:Load(var tCfg);
  tShown # Sms_Lib:NormalizeNumber(tNumber,Lib_Json:ReadAlpha(tCfg,'defaultCc'));
  CteClose(tCfg);

  WinDialogBox($Sms_Dlg,'SMS','Die SMS wurde versendet.' + StrChar(13)+StrChar(10) + StrChar(13)+StrChar(10)
             + 'Empfänger: ' + tShown + StrChar(13)+StrChar(10)
             + 'Umfang: ' + CnvAI(Sms_Lib:SegmentCount(tText)) + ' SMS',
             _WinIcoInformation,_WinDialogOK,1);
  $Sms_Dlg->WinClose();
  return(true);
  }

//--- Testmodus ist kein Fehler: Warnsymbol statt Fehlersymbol ---
if(StrCut(tError,1,9) = 'TESTMODUS')
  WinDialogBox($Sms_Dlg,'SMS',tError,_WinIcoWarning,_WinDialogOK,1);
else
  WinDialogBox($Sms_Dlg,'SMS',tError,_WinIcoError,_WinDialogOK,1);
return(true);
}


//=================================================================================================
// main()
// aAdrId  : DatIdt der Adresse (Tabelle 1, "ADR-DatIdt")
// aNumber : Handynummer aus dem Telefonbuch, beliebige Schreibweise
//=================================================================================================
main
  (
  aAdrId  : int;
  aNumber : alpha(50);
  )
local
  {
  tFrame : handle;
  tAdr   : handle;
  tCfg   : handle;
  tName  : alpha(250);
  tCount : int;
  }
{
//--- Name aus der Adresse lesen (wie Doc_Main:WriteLog die Adresse liest) ---
tName # '';
if(aAdrId > 0)
  {
  tAdr # RecBufCreate(1);
  tAdr->"ADR-DatIdt" # aAdrId;
  if(RecRead(tAdr,1,0) = 0)
    tName # StrAdj(tAdr->"ADR-Vorname" + ' ' + tAdr->"ADR-Name",_StrBegin | _StrEnd);
  RecBufDestroy(tAdr);
  }

tFrame # WinOpen('Sms_Dlg',_WinOpenDialog);
if(tFrame <= 0)
  {
  WinDialogBox(0,'SMS','Maske Sms_Dlg wurde nicht gefunden.',_WinIcoError,_WinDialogOK,1);
  return;
  }

//--- Felder fuellen --------------------------------------------------------------
Sms_Cfg:Load(var tCfg);
$lbSmsFrom->wpCaption   # Lib_Json:ReadAlpha(tCfg,'originator');
CteClose(tCfg);

$lbSmsName->wpCaption   # tName;
$edSmsNumber->wpCaption # aNumber;
$lbSmsAdrId->wpCaption  # CnvAI(aAdrId,_FmtNumNoGroup);
$teSmsText->wpCaption   # '';

//--- Vorlagen --------------------------------------------------------------------
tCount # Sms_Cfg:TemplatesFill($dlSmsTpl);
if(tCount = 0)
  {
  $edSmsTpl->wpCaption  # '(keine Vorlagen)';
  $edSmsTpl->wpDisabled # true;
  }

UpdateCounter();

WinDialogRun(tFrame,_WinDialogCenterScreen);
WinClose(tFrame);
}

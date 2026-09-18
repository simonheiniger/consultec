@A+
@C+

//=================================================================================================
// Sms_Tpl
// Vorlagen-Editor: Liste links, Titel und Text rechts, Knoepfe Neu / Loeschen /
// Abbrechen / Speichern.
//
// Gespeichert wird im CONZEPT-Text SMS_VORLAGEN: Vorlagen durch eine Zeile '---'
// getrennt, erste Zeile einer Vorlage = Titel (siehe Sms_Cfg).
//
// Maske: Frame 'Sms_Tpl' - Objekte siehe Sms_Tpl_Maske.txt
//   Ereignisse:  btTplSave  EvtClicked   -> Sms_Tpl:EvtClicked  (speichert und schliesst)
//                dlTplList  EvtMouseItem -> Sms_Tpl:EvtMouseItem
//                teTplText  EvtChanged   -> Sms_Tpl:EvtChanged
//                edTplTitle EvtChanged   -> Sms_Tpl:EvtChanged
//                btTplNew   EvtClicked   -> Sms_Tpl:EvtClicked
//                btTplDel   EvtClicked   -> Sms_Tpl:EvtClicked
//=================================================================================================


define
  {
  sSmsMaxChars : 160
  }


//=================================================================================================
// LimitText()
// Vorlagen duerfen hoechstens so lang sein wie eine SMS.
//=================================================================================================
sub LimitText()
local
  {
  tText : alpha(4096);
  }
{
tText # $teTplText->wpCaption;
if(StrLen(tText) > sSmsMaxChars)
  $teTplText->wpCaption # StrCut(tText,1,sSmsMaxChars);
}


//=================================================================================================
// UpdateCounter()
//=================================================================================================
sub UpdateCounter()
local
  {
  tText : alpha(4096);
  }
{
tText # $teTplText->wpCaption;
$lbTplCount->wpCaption # Sms_Lib:CounterText(tText);
}


//=================================================================================================
// ApplyToList()
// Uebernimmt die Eingabefelder in die Liste.
// Spalte 1 = Titel (nur fuer die Liste), Spalte 2 = Text der SMS.
//=================================================================================================
sub ApplyToList()
local
  {
  tTitle : alpha(250);
  tText  : alpha(4096);
  tLine  : int;
  }
{
tTitle # StrAdj($edTplTitle->wpCaption,_StrBegin | _StrEnd);
tText  # $teTplText->wpCaption;

if(tTitle = '')
  return;

tLine # $dlTplList->wpCurrentInt;

if(tLine <= 0)
  {
  tLine # $dlTplList->WinLstDatLineAdd(StrCut(tTitle,1,60),_WinLstDatLineLast);
  $dlTplList->wpCurrentInt # tLine;
  }
else
  $dlTplList->WinLstCellSet(StrCut(tTitle,1,60),1,tLine,_WinLstDatModeDefault);

$dlTplList->WinLstCellSet(tText,2,tLine,_WinLstDatModeDefault);
}


//=================================================================================================
// ShowLine()
// Zeigt die gewaehlte Vorlage in Titel und Text an.
//=================================================================================================
sub ShowLine
  (
  aLine : int;
  )
local
  {
  tTitle : alpha(250);
  tText  : alpha(4096);
  }
{
tTitle # '';
tText  # '';

if(aLine > 0)
  {
  $dlTplList->WinLstCellGet(tTitle,1,aLine);
  $dlTplList->WinLstCellGet(tText ,2,aLine);
  }

$edTplTitle->wpCaption # tTitle;
$teTplText->wpCaption  # tText;
UpdateCounter();
}


//=================================================================================================
// EvtMouseItem()
// Vorlage in der Liste angeklickt.
//=================================================================================================
sub EvtMouseItem
  (
  aEvt     : event;
  aButton  : int;
  aHitTest : int;
  aItem    : handle;
  aID      : int;
  ) : logic;
{
if(aEvt:obj->wpName = 'dlTplList')
  ShowLine($dlTplList->wpCurrentInt);
return(true);
}


//=================================================================================================
// EvtChanged()
// Tippen im Text -> Zaehler nachfuehren.
//=================================================================================================
sub EvtChanged
  (
  aEvt : event;
  ) : logic;
{
if(aEvt:Obj->wpName = 'teTplText')
  {
  LimitText();
  UpdateCounter();
  }
return(true);
}


//=================================================================================================
// EvtClicked()
// Neu und Loeschen.
//=================================================================================================
sub EvtClicked
  (
  aEvt : event;
  ) : logic;
local
  {
  tName : alpha(32);
  tLine : int;
  tOk   : logic;
  }
{
tName # aEvt:Obj->wpName;

if(tName = 'btTplNew')
  {
  //--- laufende Eingabe sichern, dann leere Eingabe ---
  ApplyToList();
  $dlTplList->wpCurrentInt # 0;
  $edTplTitle->wpCaption # '';
  $teTplText->wpCaption  # '';
  UpdateCounter();
  $edTplTitle->WinFocusSet();
  }

if(tName = 'btTplSave')
  {
  //--- speichern, solange die Objekte noch existieren, dann schliessen ---
  ApplyToList();
  Sms_Cfg:TemplatesFromList($dlTplList);
  $Sms_Tpl->WinClose();
  return(true);
  }

if(tName = 'btTplDel')
  {
  tLine # $dlTplList->wpCurrentInt;
  tOk   # false;

  //--- Zeilennummer direkt uebergeben statt _WinLstDatLineCurrent ---
  if(tLine > 0)
    tOk # $dlTplList->WinLstDatLineRemove(tLine);


  if(tOk)
    {
    $dlTplList->wpCurrentInt # 0;
    $edTplTitle->wpCaption # '';
    $teTplText->wpCaption  # '';
    UpdateCounter();
    }
  }

return(true);
}


//=================================================================================================
// main()
// Oeffnet den Editor. Rueckgabe ueber WinDialogRun: 1 = Speichern.
//=================================================================================================
main()
local
  {
  tFrame : handle;
  tRet   : int;
  }
{
tFrame # WinOpen('Sms_Tpl',_WinOpenDialog);
if(tFrame <= 0)
  {
  WinDialogBox(0,'SMS','Maske Sms_Tpl wurde nicht gefunden.',_WinIcoError,_WinDialogOK,1);
  return;
  }

Sms_Cfg:TemplatesFill($dlTplList);
$dlTplList->wpCurrentInt # 0;
$edTplTitle->wpCaption # '';
$teTplText->wpCaption  # '';
UpdateCounter();

//--- Gespeichert wird in EvtClicked (btTplSave), solange die Objekte noch da sind ---
tRet # WinDialogRun(tFrame,_WinDialogCenterScreen);

WinClose(tFrame);
}

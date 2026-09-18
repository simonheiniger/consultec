@A+
@C+

//=================================================================================================
// Sms_LogDlg
// Uebersicht der versendeten SMS ("Verlauf"). Liest den CONZEPT-Text SMS_LOG ueber
// Sms_Log:Fill() - neuste Zeile zuoberst.
//
// Aufruf ohne Parameter (SwissMail, Extras) zeigt alle SMS.
// Aufruf mit Adress-Id (Knopf im Fenster SMS senden) zeigt nur diesen Empfaenger.
//
// Maske: Frame 'Sms_LogView' - Objekte siehe Sms_LogView_Maske.txt
//=================================================================================================

main
  (
  opt aAddId : int;   // > 0: nur SMS an diese Adresse
  )
local
  {
  tFrame : handle;
  tCount : int;
  tName  : alpha(250);
  }
{
tFrame # WinOpen('Sms_LogView',_WinOpenDialog);
if(tFrame <= 0)
  {
  WinDialogBox(0,'SMS','Maske Sms_LogView wurde nicht gefunden.',_WinIcoError,_WinDialogOK,1);
  return;
  }

tCount # Sms_Log:Fill($dlSmsLog,aAddId);

//--- Ueberschrift: gefiltert oder alles ---
if(aAddId > 0)
  {
  tName # Sms_Log:GetName(aAddId);
  if(tName = '')
    tName # 'diese Adresse';
  tFrame->wpCaption # 'SMS-Verlauf - ' + tName;
  }

if(tCount = 0)
  {
  if(aAddId > 0)
    $lbSmsLogInfo->wpCaption # 'Noch keine SMS an diesen Empfänger versendet.';
  else
    $lbSmsLogInfo->wpCaption # 'Noch keine SMS versendet.';
  }
else
  {
  if(tCount = 1)
    $lbSmsLogInfo->wpCaption # '1 Eintrag';
  else
    $lbSmsLogInfo->wpCaption # CnvAI(tCount) + ' Einträge, neuste zuoberst';
  }

WinDialogRun(tFrame,_WinDialogCenterScreen);
WinClose(tFrame);
}

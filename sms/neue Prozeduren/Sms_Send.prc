@A+
@C+

//=================================================================================================
// Sms_Send
// Fachlicher Versand einer SMS ueber das ASPSMS-Gateway.
// Wird aus Doc_Send:SendSingle() anstelle von Doc_Lib:EmailSend() aufgerufen, sobald die
// Empfaengeradresse den Marker 'sms:' traegt (gesetzt von ADR-A SMS).
//
// API: POST https://json.aspsms.com/SendSimpleTextSMS
//      { "UserName", "Password", "Originator", "Recipients":[...], "MessageText" }
//      Antwort: { "StatusCode":"1", "StatusInfo":"OK", "TransReferenceNumber":"..." }
//      StatusCode "1" = angenommen, alles andere = Fehler, Klartext in StatusInfo.
//
// Die Adress-Historie schreibt der Aufrufer via Doc_Main:WriteLog('sms',"ADR-DatIdt"),
// genau wie heute WriteLog('email',...) nach dem Mailversand.
//=================================================================================================


//=================================================================================================
// IsSmsRecipient()
// true, wenn die Empfaengerangabe den Marker 'sms:' traegt.
//=================================================================================================
sub IsSmsRecipient
  (
  aRecipient : alpha(1000);
  ) : logic;
{
return(StrCnv(StrCut(aRecipient,1,4),_StrLower) = 'sms:');
}


//=================================================================================================
// StripMarker()
// Liefert die nackte Nummer ohne den 'sms:'-Marker.
//=================================================================================================
sub StripMarker
  (
  aRecipient : alpha(1000);
  ) : alpha;
{
if(!IsSmsRecipient(aRecipient))
  return(aRecipient);

return(StrCut(aRecipient,5,StrLen(aRecipient)-4));
}


//=================================================================================================
// AppendRaw()
// Haengt Text an den Speicherbereich an (wie Lib_Mem:AlphaAppend, aber mit Zeichensatz).
//=================================================================================================
sub AppendRaw
  (
  aMem : handle;
  aTxt : alpha(250);
  )
{
MemWriteStr(aMem,aMem->spLen + 1,aTxt,_sys->spCharset);
}


//=================================================================================================
// AppendEscaped()
// Haengt Text JSON-gerecht an: " und \ werden geschuetzt, Zeilenumbrueche werden zu \n.
// Wird in Stuecken von hoechstens 200 Zeichen geschrieben, damit keine Alpha-Grenze greift
// (Lib_Json:InsertAlpha kann nur 250 Zeichen - daher bauen wir das JSON hier selbst).
//=================================================================================================
sub AppendEscaped
  (
  aMem  : handle;
  aText : alpha(4096);
  )
local
  {
  tPos   : int;
  tLen   : int;
  tChar  : alpha(1);
  tChunk : alpha(250);
  }
{
tLen   # StrLen(aText);
tPos   # 1;
tChunk # '';

while(tPos <= tLen)
  {
  tChar # StrCut(aText,tPos,1);

  if(tChar = StrChar(34))            // Anfuehrungszeichen
    tChunk # tChunk + StrChar(92) + StrChar(34);
  else
    {
    if(tChar = StrChar(92))          // Backslash
      tChunk # tChunk + StrChar(92) + StrChar(92);
    else
      {
      if(tChar = StrChar(10))        // LF
        tChunk # tChunk + StrChar(92) + 'n';
      else
        {
        if(tChar != StrChar(13))     // CR wird weggelassen
          tChunk # tChunk + tChar;
        }
      }
    }

  if(StrLen(tChunk) > 200)
    {
    AppendRaw(aMem,tChunk);
    tChunk # '';
    }

  tPos # tPos + 1;
  }

if(tChunk != '')
  AppendRaw(aMem,tChunk);
}


//=================================================================================================
// Send()
// aNumber : Empfaengernummer in beliebiger Schreibweise, mit oder ohne 'sms:'-Marker
// aText   : Nachrichtentext
// aAddId  : Adress-DatIdt fuer das Protokoll (0 = ohne Adressbezug)
// tError  : Klartext-Fehlermeldung fuer den Benutzer
//=================================================================================================
sub Send
  (
  aNumber    : alpha(1000);
  aText      : alpha(4096);
  aAddId     : int;
  var tError : alpha;
  ) : logic;
local
  {
  tCfg      : handle;
  tRes      : handle;
  tMem      : handle;
  tResMem   : handle;
  tNumber   : alpha(50);
  tStatus   : alpha(20);
  tInfo     : alpha(250);
  tMsgId    : alpha(100);
  tSegments : int;
  tRet      : int;
  }
{
tError # '';

//--- Konfiguration -----------------------------------------------------------
if(!Sms_Cfg:IsActive())
  {
  tError # 'SMS-Versand ist nicht eingerichtet.' + StrChar(13)+StrChar(10) + StrChar(13)+StrChar(10)
         + 'Unter Einstellungen | SMS das ASPSMS-Konto eintragen (Userkey, Passwort, '
         + 'Absender) und "SMS-Versand aktiv" einschalten.';
  return(false);
  }

Sms_Cfg:Load(var tCfg);

//--- Eingaben pruefen --------------------------------------------------------
tNumber # Sms_Lib:NormalizeNumber(StripMarker(aNumber),Lib_Json:ReadAlpha(tCfg,'defaultCc'));
if(tNumber = '')
  {
  tError # 'Ungültige Mobilnummer: ' + StripMarker(aNumber);
  CteClose(tCfg);
  return(false);
  }

if(StrAdj(aText,_StrBegin | _StrEnd) = '')
  {
  tError # 'Der Nachrichtentext ist leer.';
  CteClose(tCfg);
  return(false);
  }

//--- Sicherheitsnetz: eine SMS, also hoechstens 160 Zeichen ---
if(StrLen(aText) > 160)
  {
  tError # 'Der Text ist zu lang: ' + CnvAI(StrLen(aText)) + ' Zeichen.' + StrChar(13)+StrChar(10)
         + 'Erlaubt sind 160 Zeichen (eine SMS).';
  CteClose(tCfg);
  return(false);
  }

tSegments # Sms_Lib:SegmentCount(aText);

//--- Testmodus: KEINE Anfrage an ASPSMS. ASPSMS ignoriert ein Feld "Test" und
//--- versendet trotzdem (am 15.09.2026 so erlebt) - darum wird hier lokal abgebrochen.
//--- Geprueft sind bis hier: Einstellungen, Nummer, Text. Die Zugangsdaten nicht.
//--- Rueckgabe false: die Mailansicht bleibt offen, es entsteht kein Historie-Eintrag.
if(Sms_Cfg:IsFlag(tCfg,'testMode'))
  {
  tError # 'TESTMODUS - die SMS wurde NICHT versendet.' + StrChar(13)+StrChar(10) + StrChar(13)+StrChar(10)
         + 'Empfänger: ' + tNumber + StrChar(13)+StrChar(10)
         + 'Absender: '   + Lib_Json:ReadAlpha(tCfg,'originator') + StrChar(13)+StrChar(10)
         + 'Zeichen: '    + CnvAI(StrLen(aText)) + ', Segmente: ' + CnvAI(tSegments)
         + StrChar(13)+StrChar(10) + StrChar(13)+StrChar(10)
         + 'Zum echten Versand unter Extras | SMS-Einstellungen den Testmodus ausschalten.';
  CteClose(tCfg);
  return(false);
  }

//--- Anfrage aufbauen. Bewusst ohne Lib_Json: dessen InsertAlpha nimmt nur 250 Zeichen,
//--- ein SMS-Text kann bis 1530 Zeichen lang sein.
tMem # MemAllocate(_MemAutoSize);
tMem->spCharset # _CharsetUtf8;

AppendRaw(tMem,'{"UserName":"');
AppendEscaped(tMem,Lib_Json:ReadAlpha(tCfg,'userKey'));
AppendRaw(tMem,'","Password":"');
AppendEscaped(tMem,Lib_Json:ReadAlpha(tCfg,'password'));
AppendRaw(tMem,'","Originator":"');
AppendEscaped(tMem,Lib_Json:ReadAlpha(tCfg,'originator'));
AppendRaw(tMem,'","Recipients":["');
AppendRaw(tMem,tNumber);
AppendRaw(tMem,'"],"MessageText":"');
AppendEscaped(tMem,aText);
AppendRaw(tMem,'"}');

CteClose(tCfg);

//--- Versenden ---------------------------------------------------------------
if(!Sms_Http:PostJson(tMem,var tResMem,var tError))
  {
  MemFree(tMem);
  Sms_Log:Write(aAddId,tNumber,aText,tSegments,'','',tError);
  return(false);
  }
MemFree(tMem);

//--- Antwort auswerten -------------------------------------------------------
tRet # Lib_Json:MemToJson(tResMem,var tRes);
MemFree(tResMem);
if(tRet != 0)
  {
  CteClose(tRes);
  tError # 'Antwort des Gateways ist kein gültiges JSON.';
  Sms_Log:Write(aAddId,tNumber,aText,tSegments,'','',tError);
  return(false);
  }

tStatus # Lib_Json:ReadAlpha(tRes,'StatusCode');
tInfo   # Lib_Json:ReadAlpha(tRes,'StatusInfo');
tMsgId  # Lib_Json:ReadAlpha(tRes,'TransReferenceNumber');
CteClose(tRes);

if(tStatus != '1')
  {
  tError # 'Gateway-Fehler ' + tStatus + ': ' + tInfo;
  Sms_Log:Write(aAddId,tNumber,aText,tSegments,tStatus,tMsgId,tInfo);
  return(false);
  }

Sms_Log:Write(aAddId,tNumber,aText,tSegments,tStatus,tMsgId,'');

return(true);
}

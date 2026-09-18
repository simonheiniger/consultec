@A+
@C+

//=================================================================================================
// Sms_Http
// Einziger Ort, an dem der HTTP-Request abgesetzt wird.
// Aufgebaut nach dem Muster von HTTP_Main:Download(), erweitert um TLS und Request-Body.
//
// Ablauf: SckConnect (TLS) -> HttpOpen(_HttpSendRequest) -> Method/URI/Header setzen
//         -> HttpClose(_HttpCloseConnection,tMem) sendet Header + Body
//            (handle2 von HttpClose ist laut Hilfe der Deskriptor auf den HTTP-Body;
//             Host, Date und User-Agent setzt CONZEPT selbst, falls nicht gesetzt)
//         -> HttpOpen(_HttpRecvResponse) -> HttpGetData(tRaw) -> SckClose
//
// TLS: _SckTlsMed erlaubt SSL 3.0 / TLS 1.x, _SckTlsSNI ist noetig, weil json.aspsms.com
//      wie die meisten heutigen Hosts Server Name Indication erwartet.
//      _SckOptVerify (Zertifikatspruefung) waere zusaetzlich moeglich, setzt aber die Datei
//      common\ca-bundle.crt im CONZEPT-16-Datenverzeichnis voraus - siehe Hinweis unten.
//=================================================================================================

define
  {
  sSmsHost  : 'json.aspsms.com'
  sSmsPath  : '/SendSimpleTextSMS'
  sSmsPort  : 443
  sSmsTmOut : 20000
  }


//=================================================================================================
// PostJson()
// HTTP-POST mit JSON-Body.
// aBody     : Speicherbereich mit dem JSON (UTF-8), gehoert dem Aufrufer
// tResponse : Speicherbereich mit dem Antwort-Body - der Aufrufer gibt ihn mit MemFree frei
// Rueckgabe true = Gateway hat geantwortet, false = Transportfehler (tError gefuellt).
// Anfrage und Antwort bleiben bewusst im Speicher statt in Alpha-Variablen: so kann
// nichts ueberlaufen (Muster wie getPref in Phone_gql: Lib_Json:JsonToMem + Lib_Mem).
//=================================================================================================
sub PostJson
  (
  aBody         : handle;
  var tResponse : handle;
  var tError    : alpha;
  ) : logic;
local
  {
  tSck  : handle;
  tReq  : handle;
  tLst  : handle;
  tRes  : handle;
  tRaw  : handle;
  tBody : handle;
  tErr  : int;
  }
{
tResponse # 0;
tError    # '';

try
  {
  //--- Verbindung mit TLS ----------------------
  tSck # SckConnect(sSmsHost,sSmsPort,_SckTlsMed | _SckTlsSNI,sSmsTmOut);

  //--- Request aufbauen ------------------------
  tReq # HttpOpen(_HttpSendRequest,tSck);
  tLst # tReq->spHttpHeader;
  tReq->spMethod   # 'POST';
  tReq->spURI      # sSmsPath;
  tReq->spProtocol # 'HTTP/1.1';

  tLst->CteInsertItem('Host'        ,0,sSmsHost);
  tLst->CteInsertItem('Accept'      ,0,'application/json');
  tLst->CteInsertItem('Content-Type',0,'application/json; charset=utf-8');

  //--- Senden: der Body wird beim Schliessen des Request-Objekts uebergeben.
  tReq->HttpClose(_HttpCloseConnection,aBody);
  tReq # 0;

  //--- Antwort ---------------------------------
  tRes # HttpOpen(_HttpRecvResponse,tSck);
  if(!(tRes->spStatusCode =* '200*'))
    {
    tError # 'Gateway antwortet mit HTTP ' + tRes->spStatusCode + '.';
    ErrSet(-2);
    }

  tRaw # MemAllocate(_MemAutoSize);
  tRes->HttpGetData(tRaw);
  }
tErr # ErrGet();

//--- Aufraeumen, unabhaengig vom Ausgang -------------------------------------
if(tReq > 0)
  tReq->HttpClose(_HttpDiscard);
if(tRes > 0)
  tRes->HttpClose(0);
if(tSck > 0)
  tSck->SckClose();

if(tErr != 0)
  {
  if(tRaw > 0)
    MemFree(tRaw);

  if(tError = '')
    {
    if(tErr = _ErrSckTlsConnect)
      tError # 'Verschlüsselte Verbindung zum SMS-Gateway nicht möglich (TLS-Handshake). '
             + 'Firewall oder TLS-Version prüfen.';
    else
      tError # 'Gateway nicht erreichbar (' + CnvAI(tErr,_FmtNumNoGroup) + '). '
             + 'Internetzugang, Firewall und Proxy prüfen.';
    }
  return(false);
  }

if(tRaw->spLen = 0)
  {
  MemFree(tRaw);
  tError # 'Antwort des Gateways war leer.';
  return(false);
  }

//--- HttpGetData liefert nur den Body; getResolveBody bleibt der Sicherheitsgurt,
//--- falls die Antwort doch mit Headern kommt.
if(MemFindStr(tRaw,1,tRaw->spLen,'HTTP/') = 1)
  {
  Lib_Http:getResolveBody(tRaw,var tBody);
  MemFree(tRaw);
  if(tBody <= 0)
    {
    tError # 'Antwort des Gateways hatte keinen Inhalt.';
    return(false);
    }
  tResponse # tBody;
  }
else
  tResponse # tRaw;

return(true);
}


//=================================================================================================
// Hinweise
//
// Zertifikatspruefung
//   Ohne _SckOptVerify wird die Verbindung zwar verschluesselt, das Serverzertifikat aber
//   nicht geprueft. Fuer den Versand von Zugangsdaten ist die Pruefung empfehlenswert:
//   in SckConnect _SckOptVerify erganzen, common\ca-bundle.crt im CONZEPT-16-Datenverzeichnis
//   ablegen und den Common Name mit SckInfo(...,_SckCertificateCN) gegen sSmsHost pruefen.
//
// Proxy
//   Falls die Clients nur ueber einen Proxy ins Internet kommen, nimmt SckConnect ab
//   Parameter 5 Proxy-Server, Port, Benutzer und Passwort entgegen (SOCKS 4/4a/5).
//   Diese Werte gehoeren dann in die SMS-Konfiguration.
//=================================================================================================

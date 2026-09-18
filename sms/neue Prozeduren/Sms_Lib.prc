@A+
@C+

//=================================================================================================
// Sms_Lib
// Hilfsfunktionen fuer den SMS-Versand: Nummern-Normalisierung und Laengenberechnung.
// Bewusst ohne Gateway- und Datenbankzugriff, damit die Logik isoliert testbar bleibt.
//=================================================================================================


//=================================================================================================
// OnlyDigits()
// Entfernt alle Zeichen ausser Ziffern. Ein '+' an erster Stelle bleibt als Laendermarker.
//=================================================================================================
sub OnlyDigits
  (
  aNumber : alpha(50);
  ) : alpha;
local
  {
  tIn   : alpha(50);
  tOut  : alpha(50);
  tChar : alpha(1);
  tPos  : int;
  tLen  : int;
  }
{
tIn  # StrAdj(aNumber,_StrBegin | _StrEnd);
tOut # '';
tLen # StrLen(tIn);
tPos # 1;

while(tPos <= tLen)
  {
  tChar # StrCut(tIn,tPos,1);

  if(StrFind('0123456789',tChar,1) > 0)
    tOut # tOut + tChar;
  else
    {
    //--- '+' nur an erster Stelle als Laendermarker uebernehmen ---
    if((tChar = '+') and (tPos = 1))
      tOut # tOut + tChar;
    }

  tPos # tPos + 1;
  }

return(tOut);
}


//=================================================================================================
// NormalizeNumber()
// Wandelt eine beliebig geschriebene Telefonnummer in das E.164-Format (+41791234567).
// aDefaultCc ist die Laendervorwahl ohne '+' (Standard '41'), sie wird bei nationalen
// Nummern mit fuehrender '0' eingesetzt.
// Rueckgabe '' bedeutet: Nummer ist nicht versandfaehig.
//=================================================================================================
sub NormalizeNumber
  (
  aNumber    : alpha(50);
  aDefaultCc : alpha(5);
  ) : alpha;
local
  {
  tNum  : alpha(50);
  tCc   : alpha(5);
  tRest : alpha(50);
  tLen  : int;
  }
{
tNum # OnlyDigits(aNumber);
if(tNum = '')
  return('');

tCc # OnlyDigits(aDefaultCc);
if(tCc = '')
  tCc # '41';

if(StrCut(tNum,1,1) = '+')
  //--- bereits international: +41... ---
  tRest # StrCut(tNum,2,StrLen(tNum)-1);
else
  {
  if(StrCut(tNum,1,2) = '00')
    //--- international mit Verkehrsausscheidungsziffer: 0041... ---
    tRest # StrCut(tNum,3,StrLen(tNum)-2);
  else
    {
    if(StrCut(tNum,1,1) = '0')
      //--- national: fuehrende 0 durch Laendervorwahl ersetzen ---
      tRest # tCc + StrCut(tNum,2,StrLen(tNum)-1);
    else
      //--- weder + noch 00 noch 0: nicht eindeutig, nicht versenden ---
      return('');
    }
  }

//--- E.164 erlaubt 8 bis 15 Ziffern inklusive Laendervorwahl ---
tLen # StrLen(tRest);
if((tLen < 8) or (tLen > 15))
  return('');

return('+' + tRest);
}


//=================================================================================================
// HasUnicode()
// true, wenn der Text Zeichen enthaelt, die nicht im GSM-7-Alphabet stehen.
// Solche Texte gehen als UCS-2 raus: 70 statt 160 Zeichen pro Segment.
// Umlaute und Akzente sind in GSM-7 enthalten und zaehlen hier nicht.
//=================================================================================================
sub HasUnicode
  (
  aText : alpha(4096);
  ) : logic;
local
  {
  tGsm  : alpha(255);
  tChar : alpha(1);
  tPos  : int;
  tLen  : int;
  }
{
tGsm # '@$' + StrChar(10) + StrChar(13)
     + ' !"#%&()*+,-./0123456789:;<=>?' + StrChar(39)
     + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
     + 'abcdefghijklmnopqrstuvwxyz'
     + '_ÄÖÜäöüßÀàÅåÆæÇÉéÈèÌìÑñÒòØøÙùÜ'
     + '[]{}~^|€' + StrChar(92);

tLen # StrLen(aText);
tPos # 1;

while(tPos <= tLen)
  {
  tChar # StrCut(aText,tPos,1);

  if(StrFind(tGsm,tChar,1) = 0)
    return(true);

  tPos # tPos + 1;
  }

return(false);
}


//=================================================================================================
// SegmentCount()
// Anzahl SMS-Segmente (= Kostenfaktor).
// Einzel-SMS: 160 Zeichen GSM-7 bzw. 70 Unicode.
// Verkettet:  153 bzw. 67, da der Header Platz belegt.
//=================================================================================================
sub SegmentCount
  (
  aText : alpha(4096);
  ) : int;
local
  {
  tLen    : int;
  tSingle : int;
  tMulti  : int;
  tCount  : int;
  }
{
tLen # StrLen(aText);
if(tLen = 0)
  return(0);

if(HasUnicode(aText))
  {
  tSingle #  70;
  tMulti  #  67;
  }
else
  {
  tSingle # 160;
  tMulti  # 153;
  }

if(tLen <= tSingle)
  return(1);

tCount # tLen / tMulti;
if((tCount * tMulti) < tLen)
  tCount # tCount + 1;

return(tCount);
}


//=================================================================================================
// CounterText()
// Anzeige fuer den Zeichenzaehler im SMS-Fenster, z.B. "52 / 160 - 1 SMS".
// Die Grenze rechts ist die naechste Segmentgrenze (160, 306, 459 ... bzw. 70, 134, 201 ...).
//=================================================================================================
sub CounterText
  (
  aText : alpha(4096);
  ) : alpha;
local
  {
  tLen      : int;
  tSegments : int;
  tLimit    : int;
  }
{
tLen      # StrLen(aText);
tSegments # SegmentCount(aText);

if(tSegments <= 1)
  {
  if(HasUnicode(aText))
    tLimit # 70;
  else
    tLimit # 160;
  if(tSegments = 0)
    tSegments # 1;
  }
else
  {
  if(HasUnicode(aText))
    tLimit # tSegments * 67;
  else
    tLimit # tSegments * 153;
  }

return(CnvAI(tLen) + ' / ' + CnvAI(tLimit) + ' - ' + CnvAI(tSegments) + ' SMS');
}

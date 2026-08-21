//=================================================================================================
// OpenTypenschein()
// Öffnet die Typenschein-Homepage mit dem Systembrowser
//=================================================================================================
sub OpenTypenschein()
local
  {
  tUrl : alpha(250);
  tRet : int;
  }
{
tUrl # 'https://typenscheinschweiz.ch/';

//--- Mit Standard-Systembrowser öffnen ---------
tRet # SysExecute('',tUrl,'',_SysExecuteShowNormal);
}

<?php
require_once "./vendor/autoload.php";
require_once "pdf.php";
require_once "word.php";

function bbcode($brut)
{
    preg_match("#\[title\](.+)\[/title\]#isU",$brut,$title);
	$brut = substr($brut,strlen($title[0]));
    preg_match("#\[update\](.+)\[/update\]#isU",$brut,$update);
    $brut = substr($brut,strlen($update[0]));
	$actions = array();
	
	while(strlen($brut)>0)
	{
		preg_match("#\[action='(.+)'\](.+)\[/action\]#isU",$brut,$action);
		$brut = substr($brut,strlen($action[0])+1);
		$actions[]=array($action[1],$action[2]);

	}
	$data = array();
	foreach($actions as $key=>$entry)
	{
		$data[$key]['kind'] = $entry[0];
		$action = $entry[1];
		preg_match("#\[time\](.+)\[/time\]#isU",$action,$time);
		$data[$key]['time'] = $time[1]; 
		preg_match("#\[creator\](.+)\[/creator\]#isU",$action,$creator);
		$data[$key]['creator'] = $creator[1]; 
		preg_match("#\[text\](.+)\[/text\]#isU",$action,$text);
		preg_match("#\[url='(.+)'\](.+)\[/url\]#isU",$text[1],$url); 
		if(isset($url[0]))
		{
			$data[$key]['url']=$url[1];
			$data[$key]['attatchement'] = $url[2];
			$data[$key]['text'] = preg_replace("#\[(.+)\]#isU",' ',$text[1]);
		}
		else
			$data[$key]['text'] = $text[1];
	}
	krsort($data);
	return array($title[1],$update[1],$data);
}
if(isset($_POST['card']))
{
	if($_POST['format']=="pdf")
	{
		writePDF($_POST,"./upload/Trelloreporting.pdf");
		header("Location: ./?status=done&doc=".urlencode("./upload/Trelloreporting.pdf"));
	}
	else
	{
		writeWORD($_POST,"Trelloreporting");
		header("Location: ./?status=done&doc=".urlencode("./upload/Trelloreporting.docx"));
	}
}
?>
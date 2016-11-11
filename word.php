<?php
require_once "./vendor/autoload.php";
function write($phpWord, $filename, $writers)
{
    $result = '';

    // Write documents
    foreach ($writers as $format => $extension) {
        $result .= date('H:i:s') . " Write to {$format} format";
        if (null !== $extension) {
            $targetFile = __DIR__ . "/upload/{$filename}.{$extension}";
            $phpWord->save($targetFile, $format);
        } else {
            $result .= ' ... NOT DONE!';
        }
        $result .= "<br/>";
    }

    //$result .= getEndingNotes($writers);

    return $result;
}
function writeWORD($arg,$filename)
{
	$phpWord = new \PhpOffice\PhpWord\PhpWord();

		// Define styles
		
		$phpWord->addTitleStyle(1, array('size' => 28,'bold' => true),array('spaceAfter' =>200));
		$phpWord->addTitleStyle(2, array('size' => 18),array('spaceAfter' =>100));
		$phpWord->addTitleStyle(3, array('size' => 16, 'italic' => true),array('spaceAfter' =>50));
		$phpWord->addTitleStyle(4, array('size' => 12));
		
		
		$fontStyleName = 'legende';
		$phpWord->addFontStyle($fontStyleName, array('color' => '555555','italic'=>true));

		$phpWord->addParagraphStyle('listparagraph', array('spaceAfter' =>0));
		$phpWord->addParagraphStyle('listparagraph', array('spaceAfter' =>0));

		$predefinedMultilevelStyle = array('listType' => \PhpOffice\PhpWord\Style\ListItem::TYPE_NUMBER_NESTED);

		// New section
		$section = $phpWord->addSection();
		$section->addTitle('Trello Reporting', 1);
		$section->addText($arg['boardname'].' activities from '.$arg['from'].' to '.$arg['to'],"legende");
		$section->addText('Flash back the '.$arg['to'].' @ '.$arg['fromRetro'].' to '.$arg['toRetro'],"legende");
		$section->addText(utf8_decode($arg['note']));
		
		foreach($arg['lists'] as $id=>$name)
		{
			$section->addTitle($name, 2);
			if(isset($arg['card'][$id]))
				foreach($arg['card'][$id] as $string)
				{
					$string = trim(preg_replace('/\s\s+/', ' ', $string));
					list($title,$update,$data) = bbcode($string);
					$section->addTitle($title, 3);
					$section->addText("Last update :".$update,"legende");
					foreach($data as $action)
					{
						if($action['kind']=='retro')
							$fontlist =  array('spaceAfter' => 0,'size'=>10,"color"=>'FF0000');
						else
							$fontlist =  array('spaceAfter' => 0,'size'=>10);
						$section->addListItem(utf8_decode($action['creator']." (".$action['time'].") : ".$action['text']),0,$fontlist,null,"listparagraph");
					}
					$section->addTextBreak(1);
				}
				$section->addTextBreak(1);
		}

		echo write($phpWord, $filename, array('Word2007' => 'docx'));
}
?>
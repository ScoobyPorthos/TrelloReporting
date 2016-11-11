<?php
require_once "./vendor/autoload.php";
class PDF extends FPDF
{
	// En-tête
	function Header()
	{
		// Logo
		//$this->Image('logo.png',10,6,30);
		// Police Arial gras 15
		$this->SetFont('Arial','B',15);
		// Décalage à droite
		$this->Cell(80);
		// Titre
		$this->Cell(30,10,'Trello Repporting',0,0,'C');
		// Saut de ligne
		$this->Ln(10);
	}
	function h1($title,$subtitle,$x)
	{
		$this->SetFont('Times','B',14);
		$this->SetFillColor(200);
		$this->MultiCell(0,8,utf8_decode($title),0,2,'L',true);
		$this->Ln(5);
		$this->SetFont('Times','I',10);
		$this->setX($x);
		$this->Cell(0,0,utf8_decode($subtitle),0,2,'L');
		$this->SetFont('Times','',12);
		$this->Ln(5);
	}
	// Pied de page
	function Footer()
	{
		// Positionnement à 1,5 cm du bas
		$this->SetY(-15);
		// Police Arial italique 8
		$this->SetFont('Arial','I',8);
		// Numéro de page
		$this->Cell(0,10,'Page '.$this->PageNo().'/{nb}',0,0,'C');
	}
}
function writePDF($arg,$name=false)
{
	$name = ($name===false)?"upload/TrelloReports_".date('Y-m-d').".pdf":$name;
	$pdf = new PDF('P','mm','A4');
	$pdf->AliasNbPages();
	$pdf->AddPage();
	
	$pdf->SetFont('Times','',12);
	$pdf->Cell(0,6,$arg['boardname'].' activities from '.$arg['from'].' to '.$arg['to'],0,2,'C');
	$pdf->Ln(1);
	$pdf->Cell(0,6,' Flash back the '.$arg['to'].' @ '.$arg['fromRetro'].' to '.$arg['toRetro'],0,2,'C');
	$pdf->Ln(5);
	$pdf->SetFont('Times','I',14);
	$pdf->Cell(0,7,'Notes',0,2,'L');
	$pdf->SetFont('Times','',12);
	$pdf->Ln(5);
	$pdf->MultiCell(0,7,utf8_decode($arg['note']),0,2);
	$pdf->Ln(15);
	foreach($arg['lists'] as $id=>$name)
	{
		$pdf->setX(10);
		$pdf->SetFont('Times','',16);
		$pdf->SetFillColor(175);
		$pdf->Cell(0,12,$name,0,2,"L",true);
		$pdf->Ln(5);
		$pdf->SetFont('Times','',12);
		if(isset($arg['card'][$id]))
			foreach($arg['card'][$id] as $string)
			{
				$pdf->setX(20);
				$string = trim(preg_replace('/\s\s+/', ' ', $string));
				list($title,$update,$data) = bbcode($string);
				$pdf->h1($title,"Last update :".$update,20);
				foreach($data as $action)
				{
					$pdf->setX(30);
					$length = $pdf->GetStringWidth(utf8_decode($action['creator']." (".$action['time'].") : ".$action['text']));
					if($action['kind']=='retro')
						$pdf->SetTextColor(255,0,0);
					$pdf->MultiCell(0,6,utf8_decode($action['creator']." (".$action['time'].") : ".$action['text']),0,2);
					$pdf->SetTextColor(0,0,0);
					//$pdf->Ln(5);
				}
				$pdf->Ln(10);
			}
	}
	$pdf->Output($filename,'F');
}
?>
<?php

namespace App\G6K\Twig\Extension;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AssetExists extends AbstractExtension
{

	private $projectDir;

	public function __construct($projectDir) {
		$this->projectDir = $projectDir;
	}

	/**
	 * Return the functions registered as twig extensions
	 * 
	 * @return array
	 */
	public function getFunctions() {
		return array(
			new TwigFunction('asset_exists', [$this, 'assetExists']),
		);
	}

	public function assetExists($asset) {
		$asset = preg_replace("/\?.*$/", "", $asset);
		return file_exists(dirname($this->projectDir).$asset);
	}
}

?>

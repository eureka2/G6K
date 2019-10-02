<?php

namespace App\G6K\EventListener;

use Twig\Loader\FilesystemLoader as TwigLoaderFilesystem;

/**
 * Loads twig template from the filesystem.
 *
 * @copyright Jacques Archimède
 *
 */
class FileSystemLoader extends TwigLoaderFilesystem {

	/**
	 * Checks if the template can be found.
	 *
	 * Override the parent method to remove the bundle name and replace all ':' by '/' in the template name
	 *
	 * @param string $name  The template name
	 * @param bool   $throw Whether to throw an exception when an error occurs
	 *
	 * @return string|false|null The template name or false/null
	 */
	protected function findTemplate($name, $throw = true) {
		$name = str_replace(array('EUREKAG6KBundle:', ':'), array('', '/'), $name);
		return parent::findTemplate($name, $throw);
	}
}

?>

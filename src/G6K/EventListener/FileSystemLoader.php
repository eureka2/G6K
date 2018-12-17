<?php

namespace App\G6K\EventListener;

/**
 * Loads twig template from the filesystem.
 *
 * @copyright Jacques Archimède
 *
 */
class FileSystemLoader extends \Twig_Loader_Filesystem {

	/**
	 * Constructor of class FileSystemLoader
	 *
	 * @access  public
	 * @param   string|array $paths (default: array() A path or an array of paths where to look for templates
	 * @return  void
	 *
	 */
	public function __construct($paths = array()) {
		parent::__construct($paths);
	}

	/**
	 * Override the parent method to remove the bundle name and replace all ':' by '/' in the template name
	 *
	 * @access  public
	 * @param   string $name The name of the template
	 * @param   string $default (default: self::MAIN_NAMESPACE) The default namespace
	 * @return  array The parsed name : namespace in first element, template name in the seconf element of the array
	 *
	 */
	public function parseName($name, $default = self::MAIN_NAMESPACE) {
		$name = str_replace(array('EUREKAG6KBundle:', ':'), array('', '/'), $name);
		return parent::parseName($name, $default);
	}
}

?>

<?php

namespace EUREKA\G6KBundle\EventListener;

class FileSystemLoader extends \Twig_Loader_Filesystem {

	public function __construct($paths = array()) {
		parent::__construct($paths);
	}

	public function parseName($name, $default = self::MAIN_NAMESPACE) {
		$name = str_replace(array('EUREKAG6KBundle:', ':'), array('', '/'), $name);
		return parent::parseName($name, $default);
	}
}

?>

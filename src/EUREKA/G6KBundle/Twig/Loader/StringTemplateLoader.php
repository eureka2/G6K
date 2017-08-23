<?php

namespace EUREKA\G6KBundle\Twig\Loader;

class StringTemplateLoader implements \Twig_LoaderInterface, \Twig_ExistsLoaderInterface /*, \Twig_SourceContextLoaderInterface */{

	public function getSource($name) {
		return $name;
	}

	public function getSourceContext($name) {
		return new \Twig_Source($name, $name);
	}

	public function getCacheKey($name) {
		return $name;
	}

	public function isFresh($name, $time) {
		return true;
	}

	public function exists($name)
	{
		return preg_match('/\s/', $name);
	}

}


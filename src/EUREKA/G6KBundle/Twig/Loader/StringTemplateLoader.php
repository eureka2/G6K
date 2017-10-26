<?php

namespace EUREKA\G6KBundle\Twig\Loader;

/**
 * This class implements a String template loader for twig
 *
 * @copyright Jacques Archimède
 *
 */
class StringTemplateLoader implements \Twig_LoaderInterface, \Twig_ExistsLoaderInterface /*, \Twig_SourceContextLoaderInterface */{

	/**
	 * Returns the source code for a given template name.
	 * For this loader, the name of the template is the source code.
	 *
	 * @access  public
	 * @param   string $name The name of the template
	 * @return  string The source code of the template
	 *
	 */
	public function getSource($name) {
		return $name;
	}

	/**
	 * Returns the source context for a given template logical name.
	 *
	 * @access  public
	 * @param   string $name The name of the template
	 * @return  \Twig_Source The source context
	 */
	public function getSourceContext($name) {
		return new \Twig_Source($name, $name);
	}

	/**
	 * Returns the cache key to use for the cache for a given template name.
	 * For this loader, the name (source code) of the template is the cache key.
	 *
	 * @access  public
	 * @param   string $name The name of the template
	 * @return  string The cache key
	 *
	 */
	public function getCacheKey($name) {
		return $name;
	}

	/**
	 * Returns true if the template is still fresh. For this loader, the template is always fresh.
	 *
	 * @access  public
	 * @param   string $name The name of the template
	 * @param   int $time The timestamp of the last modification time of the cached template
	 * @return  bool always true
	 *
	 */
	public function isFresh($name, $time) {
		return true;
	}

	/**
	 * Check if we have the source code of a template, given its name.
	 *
	 * @access  public
	 * @param   string $name The name of the template
	 * @return  bool If the template source code is handled by this loader or not
	 *
	 */
	public function exists($name)
	{
		return preg_match('/\s/', $name) == 1;
	}

}


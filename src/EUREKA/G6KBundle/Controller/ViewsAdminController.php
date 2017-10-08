<?php

/*
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

namespace EUREKA\G6KBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Finder\Finder;

use EUREKA\G6KBundle\Manager\ControllersHelper;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

/**
 *
 * The ViewsAdminController class is the controller that handles all actions of the views management interface.
 *
 * These actions are:
 *
 * - Creation of a view
 * - Adding a node (file or folder) in the view tree
 * - Editing text file content
 * - Renaming a node
 * - Deleting a node
 * - Export of a view
 * - Deletion of a view
 *
 * @author Jacques Archimède
 *
 */
class ViewsAdminController extends BaseAdminController {

	/**
	 * @var string      $root The root directory of the view that is either the view directory or the public assets directory
	 *
	 * @access  private
	 *
	 */
	private $root;

	/**
	 * @var int        $nodeNum Working node number
	 *
	 * @access  private
	 *
	 */
	private $nodeNum = 0;

	/**
	 * @var array|null $nodeFile File description and content
	 *
	 * @access  private
	 *
	 */
	private $nodeFile = null;

	/**
	 * @var int      $node Current node number
	 *
	 * @access  private
	 *
	 */
	private $node;

	/**
	 * @var int      $script 1 if Javascript is enabled, 0 otherwise
	 *
	 * @access  private
	 *
	 */
	private $script;

	/**
	 * Entry point for the route paths begining by /admin/views
	 *
	 * These route paths are :
	 *
	 * - /admin/views
	 * - /admin/views/{view}
	 * - /admin/views/{view}/{node}
	 * - /admin/views/{view}/{node}/{crud}
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request  The request
	 * @param   string|null $view (default: null) The view name
	 * @param   int $node (default: 0) The node number
	 * @param   string|null $crud (default: null) operation to execute on the view (docreate-view, drop-view, edit-node, doedit-node, rename-node, add-node, remove-node, export)
	 * @return  \Symfony\Component\HttpFoundation\Response|\Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	public function indexAction(Request $request, $view = null, $node = 0, $crud = null)
	{
		$this->helper = new ControllersHelper($this, $this->container);
		$this->node = $node;
		$no_js = $request->query->get('no-js') || 0;
		$this->script = $no_js == 1 ? 0 : 1;
		return $this->runIndex($request, $view, $crud);
	}

	/**
	 * Dispatches the index action to the appropriate processing based on the value of the crud parameter.
	 *
	 * If the crud parameter contains no value, shows the views management interface.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string|null $view The view name
	 * @param   string|null $crud operation to execute on the view (docreate-view, drop-view, edit-node, doedit-node, rename-node, add-node, remove-node, export)
	 * @return  \Symfony\Component\HttpFoundation\Response|\Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	protected function runIndex(Request $request, $view, $crud) {
		$form = $request->request->all();
		if ($crud == 'docreate-view') {
			return $this->doCreateView($form, $request->files->all());
		} elseif ($crud == 'drop-view') {
			return $this->dropView($view);
		} elseif ($crud == 'doedit-node') {
			return $this->doEditNode($form, $view);
		} elseif ($crud == 'rename-node') {
			return $this->renameNode($form, $view);
		} elseif ($crud == 'add-node') {
			return $this->addViewNode($form, $request->files->all(), $view);
		} elseif ($crud == 'remove-node') {
			return $this->removeViewNode($view);
		} elseif ($crud == 'export') {
			return $this->exportViewNode($view);
		} else {
			return $this->showViews($request, $view, $crud);
		}
	}

	/**
	 * Shows the views management interface.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string|null $view The view name
	 * @param   string|null $crud Contains 'edit-node' or null
	 * @return  \Symfony\Component\HttpFoundation\Response The response object
	 *
	 */
	protected function showViews(Request $request, $view, $crud) {
		$views = array_filter(scandir($this->viewsDir), function ($simu) { return preg_match("/.xml$/", $simu); } );
		$hiddens = array();
		$hiddens['script'] = $this->script;
		$hiddens['action'] = $crud == 'edit-node' ? 'edit' : 'show';
		$views = array();
		$finder = new Finder();
		$finder->directories()->depth('< 1')->exclude(array('admin', 'base', 'Theme'))->in($this->viewsDir)->sortByName();
		foreach ($finder as $file) {
			if (file_exists($this->publicDir . '/' . $file->getRelativePathname())) {
				$views[] = array(
					'name' => $file->getBasename()
				);
			}
		}
		$viewInfos = array();
		if ($view !== null) {
			if ($view != 'new') {
				$this->nodeNum = 0;
				$viewInfos['name'] = $view;
				$this->root = $this->viewsDir;
				$this->nodeNum++;
				$viewInfos['templates'][] = array(
					'name' => $view,
					'type' => 'template',
					'mode' => '',
					'path' => '',
					'num' => $this->nodeNum,
					'isdir' => true,
					'children' => $this->makeTree($view, 'template')
				);
				$this->root = $this->publicDir;
				$this->nodeNum++;
				$viewInfos['assets'][] = array(
					'name' => $view,
					'type' => 'asset',
					'mode' => '',
					'path' => '',
					'num' => $this->nodeNum,
					'isdir' => true,
					'children' => $this->makeTree($view, 'asset')
				);
			} else {
				$hiddens['action'] = 'create';
			}
		}
		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
		try {
			return $this->render(
				'EUREKAG6KBundle:admin/pages:views.html.twig',
				array(
					'ua' => $silex["mobile_detect"],
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'views',
					'views' => $views,
					'view' => $viewInfos,
					'node' => $this->node,
					'file' => $this->nodeFile,
					'hiddens' => $hiddens,
					'script' => $this->script,
					'simulator' => null
				)
			);
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

	/**
	 * Creates a views and installs its templates and assets
	 *
	 * Route path : /admin/views/new/0/docreate-view
	 *
	 * The templates are copied into the views directory and the assets into the public directory
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   array $files Compressed files of assets and templates
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	protected function doCreateView($form, $files) {
		$view = $form['view-name'];
		$fs = new Filesystem();
		$uploadDir = str_replace("\\", "/", $this->get('kernel')->getContainer()->getParameter('g6k_upload_directory'));
		$templatesfile = '';
		$assetsfile = '';
		foreach ($files as $fieldname => $file) {
			if ($file && $file->isValid()) {
				$filePath = $uploadDir . "/" . $this->get('g6k.file_uploader')->upload($file);
				if ($fieldname == 'view-templates-file') {
					$templatesfile = $filePath;
				} elseif ($fieldname == 'view-assets-file') {
					$assetsfile = $filePath;
				}
			}
		}
		$zip = new \ZipArchive();
		if ($templatesfile != '') {
			$zip->open($templatesfile, \ZipArchive::CHECKCONS);
			$extract = array();
			for( $i = 0; $i < $zip->numFiles; $i++ ){
				$info = $zip->statIndex( $i );
				if (preg_match("/\.twig$/", $info['name'])) { // keep only twig files
					array_push($extract, $info['name']);
				}
			}
			$zip->extractTo($this->viewsDir . '/' . $view, $extract);
			$zip->close();
			$fs->remove($templatesfile);
		} else {
			try {
				$fs->mkdir($this->viewsDir . '/' . $view);
				if ($fs->exists($this->viewsDir . '/Default')) {
					$fs->mirror($this->viewsDir . '/Default', $this->viewsDir . '/' . $view);
				}
			} catch (IOExceptionInterface $e) {
			}
		}
		if ($assetsfile != '') {
			$zip->open($assetsfile, \ZipArchive::CHECKCONS);
			$zip->extractTo($this->publicDir . '/' . $view);
			$zip->close();
			$fs->remove($assetsfile);
		} else {
			try {
				$fs->mkdir($this->publicDir . '/' . $view);
				if ($fs->exists($this->publicDir . '/Default')) {
					$fs->mirror($this->publicDir . '/Default', $this->publicDir . '/' . $view);
				}
			} catch (IOExceptionInterface $e) {
			}
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view', array('view' => $view)));
	}

	/**
	 * Drops a view and all its files
	 *
	 * Route path : /admin/views/{view}/0/drop-view
	 *
	 * @access  protected
	 * @param   string $view The view name
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	protected function dropView($view) {
		$fs = new Filesystem();
		try {
			$fs->remove($this->viewsDir . '/' . $view);
			$fs->remove($this->publicDir . '/' . $view);
		} catch (IOExceptionInterface $e) {
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_views'));
	}

	/**
	 * Edits a text file content
	 *
	 * Route path : /admin/views/{view}/{node}/doedit-node
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $view The view name
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	protected function doEditNode($form, $view) {
		$fs = new Filesystem();
		$nodePath = $this->searchNodePath($view);
		if ($nodePath == $this->viewsDir . "/" . $form['file'] || $nodePath == $this->publicDir . "/" . $form['file']) { // security check
			$fs->dumpFile($nodePath, $form['file-content']);
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view_node', array('view' => $view, 'node' => $this->node)));
	}

	/**
	 * Renames a node 
	 *
	 * Route path : /admin/views/{view}/{node}/rename-node
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $view The view name
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	protected function renameNode($form, $view) {
		$fs = new Filesystem();
		$nodePath = $this->searchNodePath($view);
		$newName = $form['rename-node-name'];
		if (basename($nodePath) == $view && (dirname($nodePath) == $this->viewsDir || dirname($nodePath) == $this->publicDir)) {
			$oldpath = $this->viewsDir . '/' . basename($nodePath);
			$newpath = $this->viewsDir . '/' . $newName;
			$fs->rename($oldpath, $newpath);
			$oldpath = $this->publicDir . '/' . basename($nodePath);
			$newpath = $this->publicDir . '/' . $newName;
			$fs->rename($oldpath, $newpath);
			$view =$newName;
		} else {
			$newpath = preg_replace("/".basename($nodePath)."$/", $newName, $nodePath);
			$fs->rename($nodePath, $newpath);
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view', array('view' => $view)));
	}

	/**
	 * Deletes a node from the view tree
	 *
	 * Route path : /admin/views/{view}/{node}/remove-node
	 *
	 * @access  protected
	 * @param   string $view The view name
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	protected function removeViewNode($view) {
		$fs = new Filesystem();
		$nodePath = $this->searchNodePath($view);
		if ($nodePath != '') {
			try {
				$fs->remove($nodePath);
			} catch (IOExceptionInterface $e) {
			}
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view', array('view' => $view)));
	}

	/**
	 * Adds a node into the view tree
	 *
	 * Route path : /admin/views/{view}/{node}/add-node
	 *
	 * If the node is a folder, a directory is created.
	 * If the node is a file, the uploaded file is copied into the view tree.
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   array $files The uploaded file of the node
	 * @param   string $view The view name
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	protected function addViewNode($form, $files, $view) {
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$uploadDir = str_replace("\\", "/", $container->getParameter('g6k_upload_directory'));
		$nodePath = $this->searchNodePath($view);
		if ($nodePath != '') {
			$nodeName = $form['add-node-name'];
			if ($form['add-folder-or-file'] == 'file') {
				$nodeFile = '';
				foreach ($files as $fieldname => $file) {
					if ($file && $file->isValid()) {
						$filePath = $uploadDir . "/" . $this->get('g6k.file_uploader')->upload($file);
						if ($fieldname == 'add-node-file') {
							$nodeFile = $filePath;
						}
					}
				}
				if ($nodeFile != '') {
					try {
						$fs->copy($nodeFile, $nodePath . '/' . $nodeName);
						$fs->remove($nodeFile);
					} catch (IOExceptionInterface $e) {
					}
				}
			} else {
				try {
					$fs->mkdir($nodePath . '/' . $nodeName);
				} catch (IOExceptionInterface $e) {
				}
			}
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view', array('view' => $view)));
	}

	/**
	 * Exports a view node 
	 *
	 * Route path : /admin/views/{view}/{node}/export
	 *
	 * Creates a compressed file containing all the files of the node for downloading by the user.
	 *
	 * @access  protected
	 * @param   string $view The view name
	 * @return  \Symfony\Component\HttpFoundation\Response The response object
	 *
	 */
	protected function exportViewNode($view) {
		$nodePath = $this->searchNodePath($view);
		$content = array();
		if ($nodePath != '') {
			$finder = new Finder();
			$finder->ignoreVCS(true)->files()->in($nodePath)->sortByName();
			foreach ($finder as $file) {
				$content[] = array(
					'name' => $file->getRelativePathname(),
					'data' => file_get_contents($file->getRealPath()),
					'modtime' => $file->getMTime()
				);
			}
		}
		$filename = $this->node == 1 ? $view . "-templates" : $view . "-assets";
		$zipcontent = $this->zip($content);
		$response = new Response();
		$response->headers->set('Cache-Control', 'private');
		$response->headers->set('Content-type', 'application/octet-stream');
		$response->headers->set('Content-Disposition', sprintf('attachment; filename="%s"', $filename. ".zip"));
		$response->headers->set('Content-length', strlen($zipcontent));
		$response->sendHeaders();
		$response->setContent($zipcontent);
		return $response;
	}

	/**
	 * Search the directory path of the current node of the view
	 *
	 * @access  private
	 * @param   string $view The view name
	 * @return  string the directory path of the current node
	 *
	 */
	private function searchNodePath($view) {
		$this->nodeNum = 1;
		if ($this->nodeNum == $this->node) {
			return $this->viewsDir . "/" . $view;
		}
		$this->root = $this->viewsDir;
		$nodePath = $this->findNodePath($view);
		if ($nodePath == '') {
			$this->nodeNum++;
			if ($this->nodeNum == $this->node) {
				return $this->publicDir . "/" . $view;
			}
			$this->root = $this->publicDir;
			$nodePath = $this->findNodePath($view);
		}
		return $nodePath;
	}

	/**
	 * Recursively traverses a directory to find the directory path of the current node
	 *
	 * @access  private
	 * @param   string $dir The directory
	 * @return  string the directory path of the current node
	 *
	 */
	private function findNodePath($dir) {
		$nodePath = '';
		$objects = scandir($this->root . '/' . $dir);
		foreach ($objects as $object) {
			if ($object != "." && $object != "..") { 
				$this->nodeNum++;
				if ($this->nodeNum == $this->node) {
					$nodePath = $this->root . '/' . $dir . "/" . $object;
					break;
				}
				if (is_dir($this->root . '/' . $dir . "/" . $object)) {
					$nodePath = $this->findNodePath($dir . "/" . $object);
					if ($nodePath != '') {
						break;
					}
				}
			}
		}
		return $nodePath;
	}

	/**
	 * Recursively constructs a tree into an array from the directories of the view tree.
	 *
	 * @access  private
	 * @param   string $dir Current directory
	 * @param   string $type 'template' or 'asset'
	 * @param   int $parent (default: 0) Parent node
	 * @return  array The node tree
	 *
	 */
	private function makeTree($dir, $type, $parent = 0) {
		$nodes = array();
		$objects = scandir($this->root . '/' . $dir);
		foreach ($objects as $object) {
			if ($object != "." && $object != "..") { 
				$this->nodeNum++;
				if (is_dir($this->root . '/' . $dir . "/" . $object)) {
					$nodes[] = array(
						'name' => $object,
						'type' => $type,
						'mode' => '',
						'path' => $dir,
						'num' => $this->nodeNum,
						'isdir' => true,
						'children' => $this->makeTree($dir . "/" . $object, $type, $this->nodeNum)
					);
				} else {
					$mode = $this->getMode($object);
					if ($this->nodeNum == $this->node) {
						$this->nodeFile = array(
							'name' => $dir . "/" . $object,
							'mode' => $mode,
							'num' => $this->nodeNum,
							'content' => file_get_contents($this->root . '/' . $dir . "/" . $object)
						);
					}
					$nodes[] = array(
						'name' => $object,
						'type' => $type,
						'mode' => $mode,
						'path' => $dir,
						'num' => $this->nodeNum,
						'isdir' => false,
						'children' => array()
					);
				}
			}
		}
		return $nodes;
	}

	/**
	 * Returns the language mode of a file for the javascript component CodeMirror.
	 *
	 * @access  private
	 * @param   string $file The file name
	 * @return  string The language mode
	 *
	 */
	private function getMode($file) {
		$mode = "hmlmixed";
		if (preg_match("/\.([^\.]+)$/", $file, $m)) {
			switch($m[1]) {
				case 'css':
					$mode = "css";
					break;
				case 'js':
					$mode = "javascript";
					break;
				case 'twig':
					$mode = "twig";
					break;
			}
		}
		return $mode;
	}

}

?>

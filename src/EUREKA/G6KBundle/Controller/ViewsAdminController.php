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

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

class ViewsAdminController extends BaseAdminController {
	
	private $root;
	private $nodeNum = 0;
	private $nodeFile = null;
	private $node;

	public function indexAction(Request $request, $view = null, $node = 0, $crud = null)
	{
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;

		if ($crud == 'docreate-view') {
			return $this->doCreateView($form, $request->files->all());
		} elseif ($crud == 'drop-view') {
			return $this->dropView($view);
		} elseif ($crud == 'doedit-node') {
			return $this->doEditNode($form, $view, $node);
		} elseif ($crud == 'rename-node') {
			return $this->renameNode($form, $view, $node);
		} elseif ($crud == 'add-node') {
			return $this->addViewNode($form, $request->files->all(), $view, $node);
		} elseif ($crud == 'remove-node') {
			return $this->removeViewNode($view, $node);
		} elseif ($crud == 'export') {
			return $this->exportViewNode($view, $node);
		}
		$this->node = $node;
		$views_dir = $this->get('kernel')->getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/views";
		$public_dir = $this->get('kernel')->getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/public";
		$views = array_filter(scandir($views_dir), function ($simu) { return preg_match("/.xml$/", $simu); } );

		$hiddens = array();
		$hiddens['script'] = $script;
		$hiddens['action'] = $crud == 'edit-node' ? 'edit' : 'show';
		$views = array();
		$finder = new Finder();
		$finder->directories()->depth('< 1')->exclude(array('admin', 'base', 'Theme'))->in($views_dir)->sortByName();
		foreach ($finder as $file) {
			if (file_exists($public_dir . '/' . $file->getRelativePathname())) {
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
				$this->root = $views_dir;
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
				$this->root = $public_dir;
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
					'hiddens' => $hiddens
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

	protected function doCreateView($form, $files) {
		$view = $form['view-name'];
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$uploadDir = str_replace("\\", "/", $container->getParameter('g6k_upload_directory'));
		$viewdir = $bundle->getPath()."/Resources/views";
		$publicdir = $bundle->getPath()."/Resources/public";
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
			$result =$zip->open($templatesfile, \ZipArchive::CHECKCONS);
			$extract = array();
			for( $i = 0; $i < $zip->numFiles; $i++ ){
				$info = $zip->statIndex( $i );
				if (preg_match("/\.twig$/", $info['name'])) { // keep only twig files
					array_push($extract, $info['name']);
				}
			}
			$zip->extractTo($viewdir . '/' . $view, $extract);
			$zip->close();
			$fs->remove($templatesfile);
		} else {
			try {
				$fs->mkdir($viewdir . '/' . $view);
				// TODO: copy default view to this view
			} catch (IOExceptionInterface $e) {
			}
		}
		if ($assetsfile != '') {
			$result =$zip->open($assetsfile, \ZipArchive::CHECKCONS);
			$zip->extractTo($publicdir . '/' . $view);
			$zip->close();
			$fs->remove($assetsfile);
		} else {
			try {
				$fs->mkdir($publicdir . '/' . $view);
				// TODO: copy default view to this view
			} catch (IOExceptionInterface $e) {
			}
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view', array('view' => $view)));
	}

	protected function dropView($view) {
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$viewdir = $bundle->getPath()."/Resources/views";
		$publicdir = $bundle->getPath()."/Resources/public";
		try {
			$fs->remove($viewdir . '/' . $view);
			$fs->remove($publicdir . '/' . $view);
		} catch (IOExceptionInterface $e) {
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_views'));
	}

	protected function doEditNode($form, $view, $node) {
		$this->node = $node;
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$viewdir = $bundle->getPath()."/Resources/views";
		$publicdir = $bundle->getPath()."/Resources/public";
		$nodePath = $this->searchNodePath($viewdir, $publicdir, $view);
		if ($nodePath == $viewdir . "/" . $form['file'] || $nodePath == $publicdir . "/" . $form['file']) { // security check
			$fs->dumpFile($nodePath, $form['file-content']);
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view_node', array('view' => $view, 'node' => $node)));
	}

	protected function renameNode($form, $view, $node) {
		$this->node = $node;
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$viewdir = $bundle->getPath()."/Resources/views";
		$publicdir = $bundle->getPath()."/Resources/public";
		$nodePath = $this->searchNodePath($viewdir, $publicdir, $view);
		$newName = $form['rename-node-name'];
		if (basename($nodePath) == $view && (dirname($nodePath) == $viewdir || dirname($nodePath) == $publicdir)) {
			$oldpath = $viewdir . '/' . basename($nodePath);
			$newpath = $viewdir . '/' . $newName;
			$fs->rename($oldpath, $newpath);
			$oldpath = $publicdir . '/' . basename($nodePath);
			$newpath = $publicdir . '/' . $newName;
			$fs->rename($oldpath, $newpath);
			$view =$newName;
		} else {
			$newpath = preg_replace("/".basename($nodePath)."$/", $newName, $nodePath);
			$fs->rename($nodePath, $newpath);
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view', array('view' => $view)));
	}

	protected function removeViewNode($view, $node) {
		$this->node = $node;
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$viewdir = $bundle->getPath()."/Resources/views";
		$publicdir = $bundle->getPath()."/Resources/public";
		$nodePath = $this->searchNodePath($viewdir, $publicdir, $view);
		if ($nodePath != '') {
			try {
				$fs->remove($nodePath);
			} catch (IOExceptionInterface $e) {
			}
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_view', array('view' => $view)));
	}

	protected function addViewNode($form, $files, $view, $node) {
		$this->node = $node;
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$viewdir = $bundle->getPath()."/Resources/views";
		$publicdir = $bundle->getPath()."/Resources/public";
		$uploadDir = str_replace("\\", "/", $container->getParameter('g6k_upload_directory'));
		$nodePath = $this->searchNodePath($viewdir, $publicdir, $view);
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

	protected function exportViewNode($view, $node) {
		$this->node = $node;
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$viewdir = $bundle->getPath()."/Resources/views";
		$publicdir = $bundle->getPath()."/Resources/public";
		$nodePath = $this->searchNodePath($viewdir, $publicdir, $view);
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
		$filename = $node == 1 ? $view . "-templates" : $view . "-assets";
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

	private function searchNodePath($viewdir, $publicdir, $view) {
		$this->nodeNum = 1;
		if ($this->nodeNum == $this->node) {
			return $viewdir . "/" . $view;
		}
		$this->root = $viewdir;
		$nodePath = $this->findNodePath($view);
		if ($nodePath == '') {
			$this->nodeNum++;
			if ($this->nodeNum == $this->node) {
				return $publicdir . "/" . $view;
			}
			$this->root = $publicdir;
			$nodePath = $this->findNodePath($view);
		}
		return $nodePath;
	}

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
<?php

/*
The MIT License (MIT)

Copyright (c) 2019 Jacques Archimède

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

namespace App\G6K\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Yaml\Yaml;

use App\G6K\Manager\ControllersTrait;

use acroforms\AcroForm;

/**
 *
 * The PDFFormsAdminController class is the controller that handles all actions of the PDF Forms management interface.
 *
 * @author Jacques Archimède
 *
 */
class PDFFormsAdminController extends BaseAdminController {

	use ControllersTrait;

	/**
	 * @var string      $pdf Current pdf name
	 *
	 * @access  private
	 *
	 */
	private $pdf;

	/**
	 * @var int      $script 1 if Javascript is enabled, 0 otherwise
	 *
	 * @access  private
	 *
	 */
	private $script;

	/**
	 * Entry point for the route paths begining by /admin/pdfforms
	 *
	 * These route paths are :
	 *
	 * - /admin/pdfforms
	 * - /admin/pdfforms/{pdf}
	 * - /admin/pdfforms/{pdf}/{crud}
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request  The request
	 * @param   string|null $pdf (default: null) The pdf name
	 * @param   string|null $crud (default: null) operation to execute on the view (docreate, drop, edit, doedit, renam)
	 * @return  \Symfony\Component\HttpFoundation\Response|\Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	public function index(Request $request, $pdf = null, $crud = null)
	{
		$this->initialize();
		$no_js = $request->query->get('no-js') || 0;
		$this->script = $no_js == 1 ? 0 : 1;
		return $this->runIndex($request, $pdf, $crud);
	}

	/**
	 * Dispatches the index action to the appropriate processing based on the value of the crud parameter.
	 *
	 * If the crud parameter contains no value, shows the views management interface.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string|null $pdfform The PDF Form name
	 * @param   string|null $crud operation to execute on the view (docreate, drop, edit, doedit)
	 * @return  \Symfony\Component\HttpFoundation\Response|\Symfony\Component\HttpFoundation\RedirectResponse The response object
	 *
	 */
	protected function runIndex(Request $request, $pdfform, $crud) {
		$form = $request->request->all();
		if ($crud == 'docreate') {
			return $this->doCreatePDFForm($request, $form);
		} elseif ($crud == 'doedit') {
			return $this->doEditPDFForm($request, $form, $pdfform);
		} elseif ($crud == 'drop') {
			return $this->dropPDFForm($request, $pdfform);
		} else {
			return $this->showPDFForms($request, $pdfform, $crud);
		}
	}

	/**
	 * Shows the PDF Forms management interface.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string|null $pdfform The PDF Form name
	 * @param   string|null $crud Contains 'edit-pdfform' or null
	 * @return  \Symfony\Component\HttpFoundation\Response The response object
	 *
	 */
	protected function showPDFForms(Request $request, $pdfform, $crud) {
		$hiddens = array();
		$hiddens['script'] = $this->script;
		$hiddens['action'] = $crud == 'edit' ? 'edit' : 'show';
		$pdfforms = array();
		$categories = [];
		$notCategorized = $this->getTranslator()->trans("Not categorized");
		$finder = new Finder();
		$finder->files()->name('*.pdf')->in($this->pdfFormsDir)->sortByName();
		foreach ($finder as $file) {
			$pdfname = preg_replace("/\.[^\.]+$/", "", $file->getBasename());
			$title = $pdfname;
			$category = $notCategorized;
			if (file_exists($this->pdfFormsDir . '/' . $pdfname . ".info")) {
				$info = Yaml::parseFile($this->pdfFormsDir . '/' . $pdfname . ".info");
				$title = $info['descriptors']['title'];
				$category = $info['descriptors']['category'];
				if ($category == '') {
					$category = $notCategorized;
				}
				$categories[$category] = true;
			}
			$pdfforms[] = array(
				'name' => $pdfname,
				'title' => $title,
				'category' => $category
			);
		}
		$categories = array_keys($categories);
		usort($pdfforms, function($a, $b) use ($notCategorized) {
			$cmp = strcmp($a["category"], $b["category"]);
			if ($cmp == 0) {
				return strcmp($a["title"], $b["title"]);
			} elseif ($a["category"] == $notCategorized) {
				return 1;
			} elseif ($b["category"] == $notCategorized) {
				return -1;
			} else {
				return $cmp;
			}
		});
		$pdfformInfo = null;
		$usedby = [];
		if ($pdfform !== null) {
			if ($pdfform != 'new') {
				$pdfformInfo = [
					'descriptors' => [
						'name' => $pdfform,
						'title' => $pdfform,
						'category' => '',
						'mapping' => $this->getDefaultMapping($pdfform)
					]
				];
				if (file_exists($this->pdfFormsDir . '/' . $pdfform . ".info")) {
					$info = Yaml::parseFile($this->pdfFormsDir . '/' . $pdfform . ".info");
					$pdfformInfo = $this->deepArrayMerge($pdfformInfo, $info);
				}
				$usedby = $this->getUsedBy($pdfform);
			} else {
				$hiddens['action'] = 'create';
			}
		}
		$ua = new \Detection\MobileDetect();
		try {
			return $this->render(
				'admin/pages/pdfforms.html.twig',
				array(
					'ua' => $ua,
					'browserengine' => $this->getBrowserEngine($request),
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'pdfforms',
					'categories' => $categories,
					'pdfforms' => $pdfforms,
					'pdfform' => $pdfformInfo,
					'usedby' => $usedby,
					'hiddens' => $hiddens,
					'script' => $this->script,
					'simulator' => null,
					'view' => null
				)
			);
		} catch (\Exception $e) {
			throw $this->createNotFoundException($e->getMessage());
		}
	}

	/**
	 * Returns the default mapping of a PDF Form
	 *
	 * @access  protected
	 * @param   string $pdfform The name of the pdf form
	 * @return  array The default mapping
	 *
	 */
	protected function getDefaultMapping($pdfform) {
		$acroform = new AcroForm(
			$this->pdfFormsDir . '/' . $pdfform . '.pdf',
			[
				'pdftk' =>	$this->hasParameter('acroforms')
							? $this->getParameter('acroforms')['pdftk']
							: 'pdftk'
			]
		);
		return $this->makeDefaultMapping($acroform);
	}

	/**
	 * Returns the current mapping of a PDF Form
	 *
	 * @access  protected
	 * @param   string $pdfform The name of the pdf form
	 * @return  array The current mapping
	 *
	 */
	protected function getCurrentMapping($pdfform) {
		$mapping = $this->getDefaultMapping($pdfform);
		if (file_exists($this->pdfFormsDir . '/' . $pdfform . ".info")) {
			$info = Yaml::parseFile($this->pdfFormsDir . '/' . $pdfform . ".info");
			$oldmapping = array_filter($info['descriptors']['mapping'], function ($name) use ($mapping) {
				return isset($mapping[$name]);
			}, ARRAY_FILTER_USE_KEY);
			$mapping = array_merge($mapping, $oldmapping);
		}
		return $mapping;
	}

	/**
	 * Constructs the default mapping of a PDF Form
	 *
	 * @access  protected
	 * @param   \acroforms\AcroForm $acroform The parsed pdf form
	 * @return  array The default mapping
	 *
	 */
	protected function makeDefaultMapping($acroform) {
		$mapping = [];
		$fields = array_merge($acroform->getTextFields(), $acroform->getButtonFields());
		foreach ($fields as $fieldname) {
			$field = $acroform->getField($fieldname);
			$fullname = mb_convert_encoding($field->getFullName(), "UTF-8", [
				"UTF-8",
				"ISO-8859-1",
				"UTF-16BE",
				"WinAnsiEncoding",
				"Identity-H"
			]);
			$mapping[$fullname] = preg_replace("/(^Page1_0__|_0_$)/", "", $fieldname);
		}
		return $mapping;
	}

	/**
	* array_merge_recursive does indeed merge arrays, but it converts values with duplicate
	* keys to arrays rather than overwriting the value in the first array with the duplicate
	* value in the second array, as array_merge does. I.e., with array_merge_recursive,
	* this happens (documented behavior):
	*
	* @param array $array1
	* @param array $array2
	* @return array
	* @author Daniel <daniel (at) danielsmedegaardbuus (dot) dk>
	* @author Gabriel Sobrinho <gabriel (dot) sobrinho (at) gmail (dot) com>
	*/
	private function deepArrayMerge (array &$array1, array &$array2) {
		$merged = $array1;
		foreach ( $array2 as $key => &$value ) {
			if ( is_array ( $value ) && isset ( $merged [$key] ) && is_array ( $merged [$key] ) ) {
				$merged [$key] = $this->deepArrayMerge ( $merged [$key], $value );
			} else {
				$merged [$key] = $value;
			}
		}
		return $merged;
	}

	/**
	 * Makes the header for an action report on PDF Forms
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   string $pdfform The name of the pdf form
	 * @param   string $heading The title of the header
	 * @return  string
	 *
	 */
	protected function makeReportHeader(Request $request, $pdfform, $heading){
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		$ua = new \Detection\MobileDetect();
		return rtrim($this->renderView(
			'admin/pages/report/pdfforms-header.html.twig',
			array(
				'ua' => $ua,
				'browserengine' => $this->getBrowserEngine($request),
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'nav' => 'pdfforms',
				'pdfform' => $pdfform,
				'heading' => $heading,
				'simulator' => null,
				'script' => $script,
				'dataset' => [],
				'steps' => [],
				'actions' => [],
				'rules' => [],
				'datasources' => [],
				'views' => [],
				'widgets' => [],
				'functions' => [],
				'hiddens' => []
			)
		));
	}

	/**
	 * Makes the footer for an action report on PDF Forms
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   string $pdfform The name of the pdf form
	 * @return  string
	 *
	 */
	protected function makeReportFooter(Request $request, $pdfform){
		$ua = new \Detection\MobileDetect();
		return $this->renderView(
			'admin/pages/report/pdfforms-footer.html.twig',
			array(
				'ua' => $ua,
				'browserengine' => $this->getBrowserEngine($request),
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'nav' => 'pdfforms',
				'pdfform' => $pdfform
			)
		);
	}

	protected function doCreatePDFForm(Request $request, $form) {
		$files = $request->files->all();
		$category = $form['pdfform-category'];
		$title = $form['pdfform-title'];
		$fs = new Filesystem();
		$uploadDir = str_replace("\\", "/", $this->getParameter('upload_directory'));
		$pdffile = '';
		$pdfform = '';
		foreach ($files as $fieldname => $file) {
			if ($file && $file->isValid()) {
				$filePath = $uploadDir . "/" . $this->fileUploader->upload($file);
				if ($fieldname == 'pdfform-file') {
					$pdfform = $file->getClientOriginalName();
					$pdffile = $this->pdfFormsDir . "/" . $pdfform;
					$fs->rename($filePath, $pdffile, true);
					if (preg_match("/^(.+)\.pdf$/i", $pdfform, $m)) {
						$pdfform = trim($m[1]);
					}
				}
			}
		}
		$translator = $this->translator;
		if ($pdffile != '' && $pdfform != '') {
			$mapping = $this->getCurrentMapping($pdfform);
			$this->saveInfo($pdfform, $category, $title, $mapping);
			$response = new RedirectResponse($this->generateUrl('eureka_g6k_admin_pdfform', [ 'pdf' => $pdfform ]));
		} else {
			$pdfform = $translator->trans("Unknown");
			$heading = $translator->trans('Importing the PDF Form « %pdfform% »', ['%pdfform%' => $pdfform]);
			$header = $this->makeReportHeader($request, $pdfform, $heading);
			$footer = $this->makeReportFooter($request, $pdfform);
			$response = new StreamedResponse(function() use($header, $footer, $translator) {
				print $header;
				flush();
				print '<span class="alert-danger">' . $translator->trans("The uploaded file of the PDF Form can't be found.") . "</span>\n";
				print $footer."\n";
				flush();
			});
		}
		return $response;
	}

	protected function dropPDFForm(Request $request, $pdfform) {
		$translator = $this->translator;
		$message = '';
		if (file_exists($this->pdfFormsDir . '/' . $pdfform . ".pdf")) {
			$usedby = $this->getUsedBy($pdfform);
			if (empty($usedby)) {
				if (file_exists($this->pdfFormsDir . '/' . $pdfform . ".info")) {
					unlink($this->pdfFormsDir . '/' . $pdfform . ".info");
				}
				unlink($this->pdfFormsDir . '/' . $pdfform . ".pdf");
				return new RedirectResponse($this->generateUrl('eureka_g6k_admin_pdfforms'));
			} else {
				$message = $translator->trans("The PDF Form « %pdfform% » can not be deleted, it is used by at least one simulator", ['%pdfform%' => $pdfform ]);
			}
		} else {
			$message = $translator->trans("The PDF Form file « %pdfform% » doesn't exists", ['%pdfform%' => $pdfform . '.pdf']);
		}
		$heading = $translator->trans('Deleting the PDF Form « %pdfform% »', ['%pdfform%' => $pdfform]);
		$header = $this->makeReportHeader($request, $pdfform, $heading);
		$footer = $this->makeReportFooter($request, $pdfform);
		return new StreamedResponse(function() use($header, $footer, $message) {
			print $header;
			flush();
			print '<span class="alert-danger">' . $message . "</span>\n";
			print $footer."\n";
			flush();
		});
	}

	protected function doEditPDFForm($request, $form, $pdfform) {
		$mapping = [];
		$category = $form['pdfform-category'];
		$title = $form['pdfform-title'];
		$rmapping = array_flip($this->getCurrentMapping($pdfform));
		foreach($form as $name => $value) {
			if (preg_match("/^pdfform-data-(.+)$/", $name, $match)) {
				$data = $match[1];
				$mapping[$rmapping[$data]] = $value;
			}
		}
		$this->saveInfo($pdfform, $category, $title, $mapping);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_pdfform', [ 'pdf' => $pdfform ]));
	}

	private function saveInfo($pdfform, $category, $title, &$mapping) {
		$info = [
			'descriptors' => [
				'title' => $title,
				'category' => $category,
				'mapping' => $mapping 
			]
		];
		file_put_contents($this->pdfFormsDir . '/' . $pdfform . ".info", Yaml::dump($info, 3, 4));
	}

	private function getUsedBy($pdfform) {
		$simulators = [];
		$finder = new Finder();
		$finder->in($this->simulatorsDir)->files()->name('*.xml')->contains(' template="' . $pdfform . '.pdf"');
		foreach ($finder as $file) {
			$simulators[] = pathinfo($file->getFilename(), PATHINFO_FILENAME);
		}
		return array_unique($simulators);
	}

}

?>

<?php

/*
The MIT License (MIT)

Copyright (c) 2017-2020 Jacques Archimède

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

use App\G6K\Model\DatasetChild;
use App\G6K\Model\DataGroup;
use App\G6K\Model\Data;
use App\G6K\Model\FieldSet;
use App\G6K\Model\FieldRow;
use App\G6K\Model\Field;
use App\G6K\Model\Step;

use App\G6K\Manager\Api\HTMLMarkup;
use App\G6K\Manager\Api\Bootstrapifier;

use App\G6K\Manager\ControllersTrait;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

/**
 *
 * This class deals with the API function of the simulation engine.
 *
 * For a simulator to accept an API request, the following parameters must be defined in the "config/packages/g6k.yaml" file:
 * <pre>
 *    api:
 *         - &lt;simulator name 1&gt;
 *         - &lt;simulator name 2&gt;
 *         .........
 *         - &lt;simulator name n&gt;
 * </pre>
 *
 * the API conforms to the JSON API
 *
 * @see    http://jsonapi.org/
 * @author Jacques Archimède
 *
 */
class APIController extends BaseController {

	use ControllersTrait;

	const COLORS_NAME = [
		// see https://en.wikipedia.org/wiki/Web_colors
		'aliceblue' => '#f0f8ff',
		'antiquewhite' => '#faebd7',
		'aqua' => '#00ffff',
		'aquamarine' => '#7fffd4',
		'azure' => '#f0ffff',
		'beige' => '#f5f5dc',
		'bisque' => '#ffe4c4',
		'black' => '#000000',
		'blanchedalmond' => '#ffebcd',
		'blue' => '#0000ff',
		'blueviolet' => '#8a2be2',
		'brown' => '#a52a2a',
		'burlywood' => '#deb887',
		'cadetblue' => '#5f9ea0',
		'chartreuse' => '#7fff00',
		'chocolate' => '#d2691e',
		'coral' => '#ff7f50',
		'cornflowerblue' => '#6495ed',
		'cornsilk' => '#fff8dc',
		'crimson' => '#dc143c',
		'cyan' => '#00ffff',
		'darkblue' => '#00008b',
		'darkcyan' => '#008b8b',
		'darkgoldenrod' => '#b8860b',
		'darkgray' => '#a9a9a9',
		'darkgreen' => '#006400',
		'darkkhaki' => '#bdb76b',
		'darkmagenta' => '#8b008b',
		'darkolivegreen' => '#556b2f',
		'darkorange' => '#ff8c00',
		'darkorchid' => '#9932cc',
		'darkred' => '#8b0000',
		'darksalmon' => '#e9967a',
		'darkseagreen' => '#8fbc8f',
		'darkslateblue' => '#483d8b',
		'darkslategray' => '#2f4f4f',
		'darkturquoise' => '#00ced1',
		'darkviolet' => '#9400d3',
		'deeppink' => '#ff1493',
		'deepskyblue' => '#00bfff',
		'dimgray' => '#696969',
		'dodgerblue' => '#1e90ff',
		'firebrick' => '#b22222',
		'floralwhite' => '#fffaf0',
		'forestgreen' => '#228b22',
		'fuchsia' => '#ff00ff',
		'gainsboro' => '#dcdcdc',
		'ghostwhite' => '#f8f8ff',
		'gold' => '#ffd700',
		'goldenrod' => '#daa520',
		'gray' => '#808080',
		'grey' => '#808080',
		'green' => '#008000',
		'greenyellow' => '#adff2f',
		'honeydew' => '#f0fff0',
		'hotpink' => '#ff69b4',
		'indianred' => '#cd5c5c',
		'indigo' => '#4b0082',
		'ivory' => '#fffff0',
		'khaki' => '#f0e68c',
		'lavender' => '#e6e6fa',
		'lavenderblush' => '#fff0f5',
		'lawngreen' => '#7cfc00',
		'lemonchiffon' => '#fffacd',
		'lightblue' => '#add8e6',
		'lightcoral' => '#f08080',
		'lightcyan' => '#e0ffff',
		'lightgoldenrodyellow' => '#fafad2',
		'lightgray' => '#d3d3d3',
		'lightgreen' => '#90ee90',
		'lightpink' => '#ffb6c1',
		'lightsalmon' => '#ffa07a',
		'lightseagreen' => '#20b2aa',
		'lightskyblue' => '#87cefa',
		'lightslategray' => '#778899',
		'lightsteelblue' => '#b0c4de',
		'lightyellow' => '#ffffe0',
		'lime' => '#00ff00',
		'limegreen' => '#32cd32',
		'linen' => '#faf0e6',
		'magenta' => '#ff00ff',
		'maroon' => '#800000',
		'mediumaquamarine' => '#66cdaa',
		'mediumblue' => '#0000cd',
		'mediumorchid' => '#ba55d3',
		'mediumpurple' => '#9370db',
		'mediumseagreen' => '#3cb371',
		'mediumslateblue' => '#7b68ee',
		'mediumspringgreen' => '#00fa9a',
		'mediumturquoise' => '#48d1cc',
		'mediumvioletred' => '#c71585',
		'midnightblue' => '#191970',
		'mintcream' => '#f5fffa',
		'mistyrose' => '#ffe4e1',
		'moccasin' => '#ffe4b5',
		'navajowhite' => '#ffdead',
		'navy' => '#000080',
		'oldlace' => '#fdf5e6',
		'olive' => '#808000',
		'olivedrab' => '#6b8e23',
		'orange' => '#ffa500',
		'orangered' => '#ff4500',
		'orchid' => '#da70d6',
		'palegoldenrod' => '#eee8aa',
		'palegreen' => '#98fb98',
		'paleturquoise' => '#afeeee',
		'palevioletred' => '#db7093',
		'papayawhip' => '#ffefd5',
		'peachpuff' => '#ffdab9',
		'peru' => '#cd853f',
		'pink' => '#ffc0cb',
		'plum' => '#dda0dd',
		'powderblue' => '#b0e0e6',
		'purple' => '#800080',
		'red' => '#ff0000',
		'rosybrown' => '#bc8f8f',
		'royalblue' => '#4169e1',
		'saddlebrown' => '#8b4513',
		'salmon' => '#fa8072',
		'sandybrown' => '#f4a460',
		'seagreen' => '#2e8b57',
		'seashell' => '#fff5ee',
		'sienna' => '#a0522d',
		'silver' => '#c0c0c0',
		'skyblue' => '#87ceeb',
		'slateblue' => '#6a5acd',
		'slategray' => '#708090',
		'snow' => '#fffafa',
		'springgreen' => '#00ff7f',
		'steelblue' => '#4682b4',
		'tan' => '#d2b48c',
		'teal' => '#008080',
		'thistle' => '#d8bfd8',
		'tomato' => '#ff6347',
		'turquoise' => '#40e0d0',
		'violet' => '#ee82ee',
		'wheat' => '#f5deb3',
		'white' => '#ffffff',
		'whitesmoke' => '#f5f5f5',
		'yellow' => '#ffff00',
		'yellowgreen' => '#9acd32'
	];

	/**
	 * @var array      $errors API response errors, if any
	 *
	 * @access  private
	 *
	 */
	private $errors = array();

	/**
	 * The entry point of the API request all steps
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The user request
	 * @param   string $simu The simulator name
	 * @param   string $target The target file ('json', 'markup' or 'js'), default 'json'
	 * @return  \Symfony\Component\HttpFoundation\Response The API response object
	 *
	 */
	public function api(Request $request, $simu, $target = 'json', ParameterBagInterface $params)
	{
		return $this->runApi($request, $simu, $target, $params);
	}

	/**
	 * Run the Api server
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The user request
	 * @param   string $simu The simulator name
	 * @param   string $target The target file ('json', 'markup' or 'js'), default 'json'
	 * @return  \Symfony\Component\HttpFoundation\Response|\App\G6K\Model\Step The simulation step object or the API response object in JSON format
	 *
	 */
	protected function runApi(Request $request, $simu, $target, $params)
	{
		$this->initialize();
		if ($simu == 'simulators') {
			return $this->listApiSimulators($request);
		}
		try {
			$api = $this->getParameter('api');
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->translator->trans("API for this simulator is not implemented"));
		}
		if (! is_array($api) || !in_array($simu, $api)) {
			throw $this->createNotFoundException($this->translator->trans("API for this simulator is not implemented"));
		}
		$simufile = $this->projectDir . "/var/data/simulators/api/" . $simu;
		if (!file_exists($simufile . ".json") || !file_exists($simufile . ".js")) {
			throw $this->createNotFoundException($this->translator->trans("API for this simulator is not implemented"));
		}
		$form = array_merge($request->request->all(), $request->query->all());
		return $this->apiOutput($request, $simu, $form, $target, $params);
	}

	protected function listApiSimulators(Request $request)
	{
		$id = urlencode(base64_encode( gzcompress('simulators')));
		$self = $request->getSchemeAndHttpHost() . $request->getBasePath() . $request->getPathInfo();
		$response = new Response();
		$response->headers->set('Content-Type', 'application/json');
		$content = array(
			'links' => array(
				'self' => $self
			)
		);
		try {
			$api = $this->getParameter('api');
			$included = [
				'type' => 'simulators',
				'id' => 'simulators',
				'data' => []
			];
			foreach ($api as $simu) {
				$simufile = $this->projectDir . "/var/data/simulators/api/" . $simu . ".json";
				if (file_exists($simufile)) {
					$json = file_get_contents($simufile);
					$json = json_decode($json, true);
					$title = $json['data']['attributes']['title'];
					$link = $request->getSchemeAndHttpHost() . $request->getBasePath() . "/" . $simu . "/api";
					$included['data'][] = [
						'type' => 'simulator',
						'id' => $simu,
						'attributes' => [
							'title' => $title
						],
						'links' => [
							'self' => $link,
							'related' => $link . "/html"
						]
					];
				}
			}
			if (count($included['data']) == 0) {
				$this->addEntityError(
					"/data/simulator",
					$this->translator->trans("Global error"), 
					$this->translator->trans("API is not implemented in this server")
				);
			} else {
				$content['data'] = [
					'type' => 'simulators',
					'id' => $id,
					'attributes' => [
						'title' => $this->translator->trans("List of simulators served by the G6K API server")
					]
				];
				$content['included'] = $included;
			}
		} catch (\Exception $e) {
			$this->addEntityError(
				"/data/simulator",
				$this->translator->trans("Global error"), 
				$this->translator->trans("API is not implemented in this server")
			);
		}
		if ($this->error) {
			$content['errors'] = $this->errors;
			$response->setStatusCode(Response::HTTP_BAD_REQUEST);
		}
		$response->setContent(json_encode($content));
		return $response;
	}

	protected function apiOutput(Request $request, $simulator, $form, string $target, $params)
	{
		$response = new Response();
		$apiDir = $this->projectDir . "/var/data/simulators/api";
		switch ($target) {
			case 'html':
				$theme = 'default';
				$bootstrapifyjs = '';
				$locale = $form['locale'] ?? '';
				if ($locale !== '') {
					$this->translator->setLocale($locale);
				}
				$htmlMarkup = new HTMLMarkup($this->translator, $this->projectDir, null ,$params->all());
				$htmlMarkup->setSimulator($simulator);
				$variables = array_keys($htmlMarkup->getVariables());
				$buttons = array_keys($htmlMarkup->getButtons());
				$this->checkApiParameters($form, $variables, $buttons);
				if ($this->error) {
					break;
				}
				$markup = $form['markup'] ?? 'page';
				$bootstrap = $form['bootstrap'] ?? '';
				$addBootstrapStylesheet = $form['addBootstrapStylesheet'] ?? 'true';
				$addBootstrapScript = $form['addBootstrapScript'] ?? 'true';
				$addJQueryScript = $form['addJQueryScript'] ?? 'true';
				$primaryColor = $form['primaryColor'] ?? '#0b6ba8';
				$secondaryColor = $form['secondaryColor'] ?? '#ececec';
				$breadcrumbColor = $form['breadcrumbColor'] ?? $form['primaryColor'] ?? '#0b6ba8';
				$tabColor = $form['tabColor'] ?? $form['primaryColor'] ?? '#0b6ba8';
				$globalErrorColor = $form['globalErrorColor'] ?? 'red';
				$globalWarningColor = $form['globalWarningColor'] ?? '#8a6d3b';
				$fieldErrorColor = $form['fieldErrorColor'] ?? $form['globalErrorColor'] ?? 'red';
				$fieldWarningColor = $form['fieldWarningColor'] ?? $form['globalWarningColor'] ?? '#8a6d3b';
				$fontFamily = $form['fontFamily'] ?? 'Arial, Verdana';
				$fontSize = $form['fontSize'] ?? '1em';
				$stylesheet = $form['stylesheet'] ?? '';
				$htmlMarkup->run();
				$document = $htmlMarkup->get();
				if ($bootstrap != '') {
					$bootstrapifier = new Bootstrapifier([
						'markup' => $markup,
						'version' => $bootstrap
					]);
					$bootstrapifier->bootstrapify($document);
					$theme = 'bootstrap' . $bootstrap[0];
					if ($markup == 'fragment') {
						$bootstrapifyjs = "	bootstrapify({container: 'body', version: '" . $bootstrap . "', addBootstrapStylesheet: " . $addBootstrapStylesheet . ", addBootstrapScript: " . $addBootstrapScript . ", addJQueryScript: " . $addJQueryScript . "});";
					}
				}
				if ($stylesheet != '' && $markup == 'page') {
					$document->head()->append('<link>', [
						'type' => 'text/css',
						'rel' => 'stylesheet',
						'href' => $stylesheet
					]);
				}
				$container = $document->find('article.simulator-container')[0];
				$mainContainer = $markup == 'fragment' ? $container : $document->body();
				$mainContainer->append('<style>', implode("\n", ['', 
					'.simulator-container, .simulator-modal, .step-page {',
					'	--primary-color: ' . $primaryColor . ';',
					'	--primary-color-darken: ' . $this->lightenDarkenColor($primaryColor, -50) . ';',
					'	--primary-color-lighten: ' . $this->lightenDarkenColor($primaryColor, 50) . ';',
					'	--secondary-color: ' . $secondaryColor . ';',
					'	--secondary-color-darken: ' . $this->lightenDarkenColor($secondaryColor, -50) . ';',
					'	--secondary-color-lighten: ' . $this->lightenDarkenColor($secondaryColor, 50) . ';',
					'	--font-family: ' . $fontFamily . ';',
					'	--font-size: ' . $fontSize . ';',
					'}',
					'.simulator-container .simulator-breadcrumb {',
					'	--color: ' . $breadcrumbColor . ';',
					'}',
					'.simulator-container .global-alert.has-error {',
					'	--color: ' . $globalErrorColor . ';',
					'}',
					'.simulator-container .global-alert.has-warning {',
					'	--color: ' . $globalWarningColor . ';',
					'}',
					'.simulator-container .field-alert.has-error {',
					'	--color: ' . $fieldErrorColor . ';',
					'}',
					'.simulator-container .field-alert.has-warning {',
					'	--color: ' . $fieldWarningColor . ';',
					'}',
					'.simulator-container .step-panels-list {',
					'	--color: ' . $tabColor . ';',
					'}',
					'    '
				]));
				$mainContainer->append('<script>', [
					'type' => "text/javascript",
					'src' => $this->generateUrl(
						'eureka_g6k_api_target',
						[
							'simu' => $simulator,
							'target' => 'js'
						],
						UrlGeneratorInterface::ABSOLUTE_URL
					)
				]);
				$apiURI = $this->generateUrl(
					'eureka_g6k_api',
					[ 'simu' => $simulator ],
					UrlGeneratorInterface::ABSOLUTE_URL
				);
				$internalSourceURI = $this->generateUrl(
					'eureka_g6k_source',
					[ 'simu' => $simulator ],
					UrlGeneratorInterface::ABSOLUTE_URL
				);
				$publicURI = preg_replace("|/" . $simulator ."/.*$|", "", $internalSourceURI);
				$recaptcha = $this->getParameter('recaptcha');
				$options = $htmlMarkup->getOptions();
				$simulatorCss = $publicURI . "/assets/" . $options['defaultView'] . "/css/" . $simulator . ".css";
				$observers = [];
				foreach($form as $param => $value) {
					if (in_array($param, $variables) || in_array($param, $buttons)) {
						$observers[$param] = $value;
					}
				}
				$observers = str_replace(['[]', '"'], ['{}', "'"],json_encode($observers));
				$mainContainer->append('<script>', preg_replace("/\s+/", " ", implode("", ['', 
					"document.addEventListener( 'DOMContentLoaded', function() {",
					$bootstrapifyjs,
					"	var css = document.createElement('link');",
					"	css.type = 'text/css';",
					"	css.rel = 'stylesheet';",
					"	css.href = '" . $simulatorCss . "';",
					"	document.querySelector('head').appendChild(css);",
					"});",
					"window.addEventListener('load', function() {",
					"	var options = {",
					"		simulator: G6K_SIMU,",
					"		form: document.querySelector('.simulator form'),",
					"		locale: '" . $options['locale'] ."',",
					"		dynamic: true,",
					"		api: true,",
					"		mobile: false,",
					"		dateFormat: '" . $options['dateFormat'] . "',",
					"		decimalPoint: '" . $options['decimalPoint'] . "',",
					"		moneySymbol: '" . $options['moneySymbol'] . "',",
					"		symbolPosition: '" . $options['symbolPosition'] . "',",
					"		groupingSeparator: '" . $options['groupingSeparator'] . "',",
					"		groupingSize: '" . $options['groupingSize'] . "',",
					"		internalSourceURI: '" . $internalSourceURI . "',", 
					"		apiURI: '" . $apiURI . "',", 
					"		publicURI: '" . $publicURI . "',", 
					"		recaptchaSiteKey: '" . $recaptcha['site_key'] . "',", 
					"		theme: '" . $theme . "',", 
					"		observers: " . $observers, 
					"	};",
					"	var g6k = new G6k(options);",
					"	g6k.run();",
					"});"
				])));
				if ($markup == 'fragment') {
					$html = $document->html($container);
				} else {
					$html = $document->html();
				}
				$response->headers->set('Content-Type', 'text/html');
				$response->setContent($html);
				break;
			case 'js':
				$jsfile = $apiDir . "/" . $simulator . ".js";
				$response->headers->set('Content-Type', 'application/javascript');
				$response->setContent(file_get_contents($jsfile));
				break;
			case 'json':
				$jsonfile = $apiDir . "/" . $simulator . ".json";
				$response->headers->set('Content-Type', 'application/json');
				$response->setContent(file_get_contents($jsonfile));
				break;
			case 'pdf':
				$htmlMarkup = new HTMLMarkup($this->translator, $this->projectDir, null ,$params->all());
				$htmlMarkup->setSimulator($simulator);
				$options = $htmlMarkup->getOptions();
				$view = $options['defaultView'];
				$mpdf = $this->getPDF($request, $form['template'], $form, $view, $form['pdfFooter']);
				$pdfContent = base64_encode($mpdf->Output($simulator.".pdf", 'S'));
				$response->headers->set('Content-Type', 'application/pdf');
				$response->headers->set('Content-Length', strlen($pdfContent));
				$response->headers->set('Content-Disposition', 'inline; filename="'.$simulator.'.pdf"');
				$response->headers->set('Cache-Control', 'private, max-age=0, must-revalidate');
				$response->headers->set('Pragma', 'public');
				$response->setContent($pdfContent);
				break;
			case 'fpdf':
				$htmlMarkup = new HTMLMarkup($this->translator, $this->projectDir, null ,$params->all());
				$htmlMarkup->setSimulator($simulator);
				$fpdf = $this->getFilledPdf($request, $form['template'], $form);
				$pdfContent = base64_encode($fpdf->output('S', basename($form['template'])));
				$response->headers->set('Content-Type', 'application/pdf');
				$response->headers->set('Content-Length', strlen($pdfContent));
				$response->headers->set('Content-Disposition', 'inline; filename="'.$simulator.'.pdf"');
				$response->headers->set('Cache-Control', 'private, max-age=0, must-revalidate');
				$response->headers->set('Pragma', 'public');
				$response->setContent($pdfContent);
				break;
			default:
				$this->addEntityError(
					"/data/" . $simulator,
					$this->translator->trans("Invalid API request"), 
					$this->translator->trans(
						"Unrecognizable target '%target%'",
						[ '%target%' => $target ]
					)
				);
		}
		if ($this->error) {
			$id = urlencode(base64_encode( gzcompress($request->getQueryString())));
			$self = $request->getSchemeAndHttpHost() . $request->getBasePath() . $request->getPathInfo() . '?' . $request->getQueryString();
			$response->headers->set('Content-Type', 'application/json');
			$response->setStatusCode(Response::HTTP_BAD_REQUEST);
			$content = [
				'links' => [
					'self' => $self
				],
				'errors' => $this->errors,
				'data' => [
					'type' => $simulator,
					'id' => $id
				]
			];
			$response->setContent(json_encode($content));
		}
		return $response;
	}

	private function hex2rgb($hex) {
		$hex = str_replace("#", "", $hex);
		if(strlen($hex) == 3) {
			$r = hexdec(substr($hex,0,1).substr($hex,0,1));
			$g = hexdec(substr($hex,1,1).substr($hex,1,1));
			$b = hexdec(substr($hex,2,1).substr($hex,2,1));
		} else {
			$r = hexdec(substr($hex,0,2));
			$g = hexdec(substr($hex,2,2));
			$b = hexdec(substr($hex,4,2));
		}
		$rgb = [$r, $g, $b];
		return $rgb;
	}

	private function rgb2hex(array $rgb){
		$hex = "#";
		$hex .= str_pad(dechex($rgb[0]), 2, "0", STR_PAD_LEFT);
		$hex .= str_pad(dechex($rgb[1]), 2, "0", STR_PAD_LEFT);
		$hex .= str_pad(dechex($rgb[2]), 2, "0", STR_PAD_LEFT);
		return $hex;
	}

	private function lightenDarkenColor($hex, $amt) {
		$hex = strtolower(preg_replace("/\s+/", "", $hex));
		if (isset(self::COLORS_NAME[$hex])) {
			$hex = self::COLORS_NAME[$hex];
		}
		[$r, $g, $b] = $this->hex2rgb($hex);
		$r = min(255, max(0, $r + $amt));
		$g = min(255, max(0, $g + $amt));
		$b = min(255, max(0, $b + $amt));
		return $this->rgb2hex([$r, $g, $b]);
	  
	}
	private function checkApiParameters($form, $variables = [], $buttons = []) {
		$parameters = [
			'markup', 'locale', 'bootstrap',
			'addBootstrapStylesheet', 'addBootstrapScript', 'addJQueryScript', 
			'primaryColor', 'secondaryColor',
			'breadcrumbColor', 'tabColor',
			'globalErrorColor', 'globalWarningColor',
			'fieldErrorColor', 'fieldWarningColor',
			'fontFamily', 'fontSize', 'stylesheet'
		];
		foreach($form as $param => $value) {
			if (! in_array($param, $parameters)
				&& ! in_array($param, $variables)
				&& ! in_array($param, $buttons)) {
				$this->addParameterError(
					$param,
					$this->translator->trans("Invalid parameter"), 
					$this->translator->trans(
						"This parameter '%parameter%' doesn't exists",
						[ '%parameter%' => $param ]
					)
				);
			}
		}
	}

	/**
	 * Composes a parameter error
	 *
	 * @access  private
	 * @param   string $parameter the parameter name
	 * @param   string $title Title of the error
	 * @param   string $detail Detail of the error
	 * @return  void
	 *
	 */
	private function addParameterError($parameter, $title, $detail) {
		$this->errors[] = array(
			'status' => "" . Response::HTTP_BAD_REQUEST,
			'title' => $title,
			'detail' => $detail,
			'source' => array(
				'parameter' => $parameter
			)
		);
		$this->error = true;
	}

	/**
	 * Composes an entity error
	 *
	 * @access  private
	 * @param   string $entity the entity name
	 * @param   string $title Title of the error
	 * @param   string $detail Detail of the error
	 * @return  void
	 *
	 */
	private function addEntityError($entity, $title, $detail) {
		$this->errors[] = array(
			'status' => "" . Response::HTTP_UNPROCESSABLE_ENTITY,
			'title' => $title,
			'detail' => $detail,
			'source' => array(
				'pointer' => $entity
			)
		);
		$this->error = true;
	}

}

?>

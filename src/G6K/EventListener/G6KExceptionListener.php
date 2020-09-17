<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2020 Jacques Archimède

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
 
namespace App\G6K\EventListener;

use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpFoundation\Request;
use Twig\Environment;

/**
 *
 * Custom exception listener
 *
 * @copyright Jacques Archimède
 *
 */
class G6KExceptionListener
{

	/**
	 * @var \Symfony\Component\HttpKernel\KernelInterface      $kernel The Symfony kernel
	 *
	 * @access  protected
	 *
	 */
	protected $kernel;

	/**
	 * @var \Twig\Environment      $twig The Twig engine
	 *
	 * @access  protected
	 *
	 */
	protected $twig;

	/**
	 * Constructor of class G6KExceptionListener
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpKernel\KernelInterface $kernel The Symfony kernel
	 * @param   \Twig\Environment $twig The twig environment
	 * @return  void
	 *
	 */
	public function __construct(KernelInterface $kernel, Environment $twig) {
		$this->kernel = $kernel;
		$this->twig = $twig;
	}

	/**
	 * The listener for the exception event
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpKernel\Event\ExceptionEvent $event The exception event
	 * @return  void
	 *
	 */
	public function onKernelException(ExceptionEvent $event) {
		$request = $event->getRequest();
		$exception = $event->getThrowable();
		$route = $request->get("_route");
		if ($route == 'eureka_g6k_api') {
			$response = $this->jsonResponse($request, $exception);
		} elseif (preg_match("/^eureka_g6k_admin/", $route)) {
			$response = $this->htmlAdminResponse($exception);
		} else {
			$response = $this->htmlResponse($request, $exception);
		}
		$event->setResponse($response);
	}

	/**
	 * Renders a HTML response with the exception for the simulation engine
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   \Throwable $exception <parameter description>
	 * @return  \Symfony\Component\HttpFoundation\Response The HTML response
	 *
	 */
	protected function htmlResponse(Request $request, \Throwable $exception) {
		$domainview = $this->kernel->getContainer()->getParameter('domainview');
		$domain = $request->getHost();
		$view = $request->request->get("view", "", true);
		if ($view == "") {
			$view = $request->query->get("view", "", true);
		}
		if ($view == "") {
			foreach ($domainview as $d => $v) {
				if (preg_match("/".$d."$/", $domain)) {
					$view = $v;
					break;
				}
			}
			if ($view == "") {
				$view = "Default";
			}
		}
		$step = (object)array('simulator' => array('label' => 'Exception'));
		$message = $exception instanceof HttpExceptionInterface && $exception->getStatusCode() == 404 ? 'This simulator does not exist or is not available' : 'The simulation engine is currently under maintenance';
		$response = new Response();

		if ($exception instanceof HttpExceptionInterface) {
			$response->setContent(
				$this->twig->render(
					'base\pages\exception.html.twig', 
					array(
						'adminmessage' => "status : " . $exception->getStatusCode(),
						'message' => $exception->getStatusCode(),
						'stacktrace' => "",
						'code' => $exception->getStatusCode(),
						'view' => $view, 
						'step' => $step, 
						'exception' => true
					)
				)
			);
			$response->setStatusCode($exception->getStatusCode());
			$response->headers->replace($exception->getHeaders());
		} else {
			$response->setContent(
				$this->twig->render(
					'base\pages\exception.html.twig', 
					array(
						'adminmessage' => $this->trace($exception),
						'message' => $message,
						'stacktrace' => str_replace("\n", "<br>", $exception->getTraceAsString()),
						'code' => $exception->getCode(),
						'view' => $view, 
						'step' => $step, 
						'exception' => true
					)
				)
			);
			$response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
		}
		return $response;
	}

	/**
	 * Renders a HTML response with the exception for the administration module
	 *
	 * @access  protected
	 * @param   \Throwable $exception <parameter description>
	 * @return  \Symfony\Component\HttpFoundation\Response The HTML response
	 *
	 */
	protected function htmlAdminResponse(\Throwable $exception) {
		$step = (object)array('simulator' => array('label' => 'Exception'));
		$response = new Response();

		if ($exception instanceof HttpExceptionInterface) {
			$response->setContent(
				$this->twig->render(
					'admin/pages/exception.html.twig',
					array(
						'message' => "status : " . $exception->getStatusCode(),
						'stacktrace' => "",
						'code' => $exception->getStatusCode(),
						'nav' => 'exception',
						'step' => $step, 
						'exception' => true
					)
				)
			);
			$response->setStatusCode($exception->getStatusCode());
			$response->headers->replace($exception->getHeaders());
		} else {
			$response->setContent(
				$this->twig->render(
					'admin/pages/exception.html.twig',
					array(
						'message' => $this->trace($exception),
						'stacktrace' => str_replace("\n", "<br>", $exception->getTraceAsString()),
						'code' => $exception->getCode(),
						'nav' => 'exception',
						'step' => $step, 
						'exception' => true
					)
				)
			);
			$response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
		}
		return $response;
	}

	/**
	 * Renders a JSON response with the exception
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   \Exception $exception The exception
	 * @return  \Symfony\Component\HttpFoundation\Response The JSON response
	 *
	 */
	protected function jsonResponse(Request $request, \Throwable $exception) {
		$simu = $request->request->get("simu", "", true);
		if ($simu == "") {
			$simu = $request->query->get("simu", "", true);
		}
		$errors = array();
		$errors[] = array(
			'status' => "" . Response::HTTP_UNPROCESSABLE_ENTITY,
			'title' => "Unprocessable entity",
			'detail' => $exception->getMessage(),
			'source' => array(
				'pointer' => "/data/" . $simu
			)
		);
		$self = $request->getSchemeAndHttpHost() . $request->getBasePath() . $request->getPathInfo() . '?' . $request->getQueryString();
		$response = new Response();
		$response->headers->set('Content-Type', 'application/json');
		$response->setContent(
			json_encode(array(
					'links' => array(
						'self' => $self,
					),
					'errors' => $errors
				)
			)
		);
		$response->setStatusCode(Response::HTTP_UNPROCESSABLE_ENTITY);
		return $response;
	}

	/**
	 * Makes an HTML trace of the exception
	 *
	 * @access  protected
	 * @param   \Throwable $e The exception
	 * @param   array $seen (default: null)
	 * @return  string The HTML trace
	 *
	 */
	protected function trace(\Throwable $e, $seen = null) {
		$starter = $seen ? 'Caused by: ' : '';
		$result = array();
		if (!$seen) $seen = array();
		$trace  = $e->getTrace();
		$prev   = $e->getPrevious();
		$result[] = sprintf('%s%s: %s', $starter, get_class($e), $e->getMessage());
		$file = $e->getFile();
		$line = $e->getLine();
		while (true) {
			$current = "$file:$line";
			if (is_array($seen) && in_array($current, $seen)) {
				$result[] = sprintf(' ... %d more', count($trace)+1);
				break;
			}
			$result[] = sprintf(' at %s%s%s(%s%s%s)',
				count($trace) && array_key_exists('class', $trace[0]) ? str_replace('\\', '.', $trace[0]['class']) : '',
				count($trace) && array_key_exists('class', $trace[0]) && array_key_exists('function', $trace[0]) ? '.' : '',
				count($trace) && array_key_exists('function', $trace[0]) ? str_replace('\\', '.', $trace[0]['function']) : '(main)',
				$line === null ? $file : basename($file),
				$line === null ? '' : ':',
				$line === null ? '' : $line);
			if (is_array($seen))
				$seen[] = "$file:$line";
			if (!count($trace))
				break;
			$file = array_key_exists('file', $trace[0]) ? $trace[0]['file'] : 'Unknown Source';
			$line = array_key_exists('file', $trace[0]) && array_key_exists('line', $trace[0]) && $trace[0]['line'] ? $trace[0]['line'] : null;
			array_shift($trace);
		}
		$result = array_filter($result, function ($line) {
			return !preg_match("/at __TwigTemplate_/", $line);
		}); 
		$result = join("<br>", $result);
		if ($prev)
			$result  .= "<br>" . $this->trace($prev, $seen);
		return $result;
	}
}

?>

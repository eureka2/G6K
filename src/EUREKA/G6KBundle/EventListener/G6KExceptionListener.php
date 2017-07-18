<?php

namespace EUREKA\G6KBundle\EventListener;


use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class G6KExceptionListener
{
	protected $container;

	public function __construct(ContainerInterface $container) {
		$this->container = $container;
	}

	public function onKernelException(GetResponseForExceptionEvent $event) {
		$exception = $event->getException();
		$request = $event->getRequest();
		$domain = $request->getHost();
		$domainview = $this->container->getParameter('domainview');
		$view = "Default";
		foreach ($domainview as $d => $v) {
			if (preg_match("/".$d."$/", $domain)) {
				$view = $v;
				break;
			}
		}
		$loader = new \Twig_Loader_Array(array(
			'error.html.twig' => 'Error : {{ message }} with code : {{ code }}',
		));
		$twig = new \Twig_Environment($loader);

		$response = new Response();
		$response->setContent(
			$twig->render(
				'error.html.twig', 
				array(
					'message' => $exception->getMessage(),
					'code' => $exception->getCode()
				)
			)
		);

		if ($exception instanceof HttpExceptionInterface) {
			$response->setStatusCode($exception->getStatusCode());
			$response->headers->replace($exception->getHeaders());
		} else {
			$response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
		}

		// Send the modified response object to the event
		$event->setResponse($response);
	}
}
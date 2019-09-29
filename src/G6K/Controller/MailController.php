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
use Symfony\Component\HttpFoundation\Response;

/**
 *
 * The actions of the DefaultController class are used to run the simulation engine for a particular simulator.
 *
 * @author Jacques Archimède
 *
 */
class MailController extends BaseController {

	const RECAPTCHA_URL = 'https://www.google.com/recaptcha/api/siteverify';

	/**
	 * Entry point for the route path /{template}/{view}/mail
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $template  The template name for rendering the mail body
	 * @param   string $view The view name
	 * @param   \Swift_Mailer $mailer The mailer
	 * @return  \Symfony\Component\HttpFoundation\Response|false
	 *
	 */
	public function sendMail(Request $request, $template, $view, \Swift_Mailer $mailer)
	{
		$this->initialize();
		return $this->runSendMail($request, $template, $view, $mailer);
	}

	/**
	 * function runSendMail
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $template  The template name for rendering the mail body
	 * @param   string $view The view name
	 * @param   \Swift_Mailer $mailer The mailer
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	protected function runSendMail(Request $request, $template, $view, \Swift_Mailer $mailer)
	{
		$form = $request->request->all();
		$recaptcha_secret = $this->getParameter('recaptcha')['secret_key'];
		$recaptcha_response = $form['recaptcha_response'];
		$recaptcha = file_get_contents(self::RECAPTCHA_URL . '?secret=' . $recaptcha_secret . '&response=' . $recaptcha_response);
		$recaptcha = json_decode($recaptcha);

		if (file_exists($this->viewsDir . "/" . $view.'/'.'emails/'. $template . '.html.twig')) {
			$template = $view . '/emails/'. $template . '.html.twig';
		} else {
			$template = 'Default/emails/'. $template . '.html.twig';
		}

		$response = new Response();

		// Take action based on the score returned:
		if ($recaptcha->score >= 0.5) {
			$message = (new \Swift_Message())
				->setSubject($form['subject'])
				->setFrom($form['sender'])
				->setTo($form['recipients']) // string or array
				->setBody(
					$this->renderView(
						$template,
						$form
					),
					'text/html'
				)
			;
			$failures = [];
			if (!$mailer->send($message, $failures)) {
				$response->setContent(json_encode(['status' => 'error', 'failures' => $failures]));
			} else {
				$response->setContent(json_encode(['status' => 'ok']));
			}
		} else {
			$response->setContent(json_encode(['status' => 'error']));
		}
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

}

?>

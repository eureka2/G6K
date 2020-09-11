<?php declare(strict_types=1);

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
 
namespace App\Controller;

use App\Security\UserInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

trait SecurityControllerTrait {

	protected function sendResettingEmailMessage(UserInterface $user, \Swift_Mailer $mailer) {
		$url = $this->generateUrl('app_resetting_reset', ['token' => $user->getConfirmationToken()], UrlGeneratorInterface::ABSOLUTE_URL);
		$rendered = $this->render("security/email.txt.twig", [
			'user' => $user,
			'confirmationUrl' => $url,
		])->getContent();
		$this->sendEmailMessage($rendered, $this->getParameter('mail_from'), (string) $user->getEmail(), $mailer);
	}

	protected function sendEmailMessage(string $renderedTemplate, string $fromEmail, string $toEmail, \Swift_Mailer $mailer) {
		// Render the email, use the first line as the subject, and the rest as the body
		$renderedLines = explode("\n", trim($renderedTemplate));
		$subject = array_shift($renderedLines);
		$body = implode("\n", $renderedLines);

		$message = (new \Swift_Message())
			->setSubject($subject)
			->setFrom($fromEmail)
			->setTo($toEmail)
			->setBody($body);

		$mailer->send($message);
	}

}

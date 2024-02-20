/**
The MIT License (MIT)

Copyright (c) 2020 Jacques Archimède

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

(function (global) {
	'use strict';

	var template = 
	`<div class="simulator-modal fade" id="modal-sendmail" tabindex="-1" role="dialog" aria-labelledby="modal-sendmail-label" aria-hidden="true">
		<form id="modal-sendmail-form" action="">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="btn close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button>
						<h3 class="modal-title" id="modal-sendmail-label">[MODAL-TITLE]</h3>
					</div>
					<div class="modal-body">
						<h4 class="modal-sendmail-title">[MODAL-SIMULATOR-LABEL]</h4>
						<div id="modal-sendmail-body">
							<p><strong>[MODAL-PROMPT]</strong></p>
							<p class="mention-asterisk">[MODAL-MENTION-ASTERISK]</p>
							<div class="form-group">
								<label for="modal-sendmail-sender"><span class="asterisk">*</span> [MODAL-SENDER-LABEL]</label>
								<input type="email" name="sender" class="form-control" id="modal-sendmail-sender" aria-required="true">
							</div>
							<div class="form-group">
								<label for="modal-sendmail-recipients"><span class="asterisk">*</span> [MODAL-RECIPIENTS-LABEL]</label>
								<input type="text" name="recipients" class="form-control" id="modal-sendmail-recipients" aria-required="true">
								<p class="help-block">[MODAL-RECIPIENTS-HELP]</p>
							</div>
							<div class="form-group">
								<label for="modal-sendmail-message">[MODAL-MESSAGE-LABEL]</label>
								<textarea name="message" class="form-control" id="modal-sendmail-message" cols="30" rows="4" maxlength="800"></textarea>
								<p class="letter-count" data-textarea="modal-sendmail-message" aria-live="polite"></p>
							</div>
						</div>
						<div id="modal-sendmail-alert" class="alert" role="alert"></div>
					</div>
					<div class="modal-footer">
						<div id="modal-sendmail-recaptcha" style="float: left; margin: 0; padding: 0;"
							data-sitekey="[MODAL-RECAPTCHA]"
							data-size="invisible"
							data-badge="inline">
						</div>
						<button id="modal-sendmail-submit" class="btn btn-primary" type="button">[MODAL-SEND]</button>
						<button id="modal-sendmail-cancel" data-dismiss="modal" class="btn btn-default" type="button">[MODAL-CANCEL]</button>
					</div>
				</div>
			</div>
			<input type="hidden" name="subject" value="[MODAL-MAIL-SUBJECT]">
			<input type="hidden" name="host" value="">
			<input type="hidden" name="link" value="">
			<input type="hidden" name="simulator" value="[MODAL-SIMULATOR]">
		</form>
	</div>`;

	function shareByEmail(clickable, func, options, callback) {
		var g6k;
		if (typeof clickable === "object" && clickable && clickable["jquery"]) {
			g6k = clickable.data('g6k');
			clickable = clickable[0];
		} else {
			g6k = this;
		}
		var parameters = func.arguments;

		if (document.querySelector('#modal-sendmail') === null) {
			var modal = template
			.replace('[MODAL-TITLE]', Translator.trans('Share by email'))
			.replace('[MODAL-SIMULATOR-LABEL]', g6k.simu.label)
			.replace('[MODAL-PROMPT]', Translator.trans('To share this page, please enter the following information'))
			.replace('[MODAL-MENTION-ASTERISK]', Translator.trans('Fields marked with an %asterisk% are required.', { 'asterisk': '<span class="asterisk">*</span>' }))
			.replace('[MODAL-SENDER-LABEL]', Translator.trans('Your email'))
			.replace('[MODAL-RECIPIENTS-LABEL]', Translator.trans("Recipient's email"))
			.replace('[MODAL-RECIPIENTS-HELP]', Translator.trans("You can put up to 3 addresses separated by one semi-colon"))
			.replace('[MODAL-MESSAGE-LABEL]', Translator.trans('Your message'))
			.replace('[MODAL-RECAPTCHA]', options.recaptchaSiteKey)
			.replace('[MODAL-CANCEL]', Translator.trans('Cancel'))
			.replace('[MODAL-SEND]', Translator.trans('Send'))
			.replace('[MODAL-MAIL-SUBJECT]', g6k.simu.label)
			.replace('[MODAL-SIMULATOR]', g6k.simu.name)
			;
			var div = document.createElement('div');
			div.innerHTML = modal;
			modal = div.firstElementChild;
			document.body.appendChild(modal);
			window.addEventListener('click', function(event) {
				if (event.target == modal) {
					modal.style.display = "none";
				}
			});
			modal.querySelectorAll("button[data-dismiss='modal']").forEach(cancel => {
				cancel.addEventListener('click', function(event) {
					modal.style.display = "none";
				})
			});
		}
		if (clickable.matches('a')) {
			clickable.setAttribute('href', '');
			clickable.setAttribute('title', clickable.textContent);
			clickable.setAttribute('rel', 'noopener noreferrer');
			clickable.classList.add('email-share-button');
			clickable.innerHTML = '<span class="fonticon icon-mail">';
		}
		var modal = document.querySelector('#modal-sendmail');
		clickable.addEventListener('click', function(event) {
			event.preventDefault();
			var recaptcha = document.querySelector('#modal-sendmail-recaptcha');
			if (recaptcha !== null && recaptcha.querySelector('.grecaptcha-badge') === null) {
				grecaptcha.render(
					recaptcha,
					{
						'callback': function(token) {
							var data = {};
							var form = document.querySelector('#modal-sendmail-form');
							var inputs = form.querySelectorAll('input[name], textarea[name], select[name], button[name]');
							inputs.forEach(function (input) {
								data[input.name] = input.value;
							});
							data['recipients'] = data['recipients'].split(/\s*;\s*/);
							data['recaptcha_response'] = token;
							var simulator = document.querySelector('#modal-sendmail-form input[name=simulator]').value;
							var path = options.publicURI + "/sendpage/Default/mail";
							showInfo(Translator.trans("Sending the email in progress ...") );
							ajax({
								method: 'POST', 
								url: path,
								dataType: "json",
								data: data
							}).then(function( result, xhr, textStatus ) {
								showSuccess(Translator.trans("The email was sent successfully") );
							}).catch(function(response, xhr, textStatus) {
								if ((xhr.status != 0 && xhr.status != 200) || textStatus === 'timeout') {
									showError(Translator.trans("An error occurs while sending the mail") );
								}
							});
							document.querySelector('#modal-sendmail-submit').style.display = 'none';
							document.querySelector('#modal-sendmail-cancel').textContent = Translator.trans("Close");
						},
						'expired-callback': function() {
							showError(Translator.trans('The reCAPTCHA has expired!'));
						},
						'error-callback': function() {
							showError(Translator.trans('An error has been encountered!'));
						}
					}
				);
			}
			document.querySelector('#modal-sendmail-form input[name=link]').value = window.location.href.replace(/\#.*$/, "");
			document.querySelector('#modal-sendmail-form input[name=host]').value = window.location.host.replace(/:.*$/, "");
			modal.querySelectorAll('textarea[maxlength]').forEach(function(textarea) {
				var tid = textarea.getAttribute('id');
				var countblock = document.querySelector("#modal-sendmail .letter-count[data-textarea='" + tid + "']");
				if (countblock.length > 0) {
					var maxlength = parseInt(textarea.getAttribute('maxlength'));
					countblock.textContent = Translator.trans('%num% characters remaining', { num: maxlength });
					for (eventType of ['input', 'propertychange']) {
						textarea.addEventListener(eventType, function() {
							var num = maxlength - textarea.value.length;
							countblock.textContent = Translator.trans('%num% characters remaining', { num: num });
							
						});
					}
				}
			});
			modal.style.display = 'block';
			document.querySelector('#modal-sendmail-alert').style.display = 'none';
		});
		document.querySelector("#modal-sendmail-submit").addEventListener('click', function(event) {
			event.preventDefault();
			var form = document.querySelector('#modal-sendmail-form');
			form.querySelectorAll('input, select, textarea').forEach(input => input.parentElement.classList.remove('has-error'));
			var sender = form.querySelector('input[name=sender]');
			if (sender.value == '') {
				showError(Translator.trans('Your email is required'));
				sender.parentElement.classList.add('has-error');
				return false;
			}
			if (!IsValidEmail(sender.value)) {
				showError(Translator.trans('Your email is not valid!'));
				sender.parentElement.classList.add('has-error');
				return false;
			}
			var recipients = form.querySelector('input[name=recipients]');
			if (recipients.value == '') {
				showError(Translator.trans('The recipients are required'));
				recipients.parentElement.classList.add('has-error');
				return false;
			}
			var emails = recipients.value.split(/\s*;\s*/);
			for (var i = 0; i < emails.length; i++) {
				if (!IsValidEmail(emails[i])) {
					showError(Translator.trans('The email %email% is not valid!', {'email': emails[i]}));
					recipients.parentElement.classList.add('has-error');
					return false;
				}
			}
			showInfo(Translator.trans("reCAPTCHA control in progress ...") );
			grecaptcha.execute();
		});

		function IsValidEmail(email) {
			var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(email);
		}

		function showError(error) {
			var alert = document.querySelector('#modal-sendmail-alert');
			alert.textContent = error;
			alert.classList.remove('alert-info', 'alert-success');
			alert.classList.add('alert-danger');
			alert.style.display = '';
		}

		function showInfo(info) {
			var alert = document.querySelector('#modal-sendmail-alert');
			alert.textContent = info;
			alert.classList.remove('alert-success', 'alert-danger');
			alert.classList.add('alert-info');
			alert.style.display = '';
		}

		function showSuccess(success) {
			var alert = document.querySelector('#modal-sendmail-alert');
			alert.textContent = success;
			alert.classList.remove('alert-info', 'alert-danger');
			alert.classList.add('alert-success');
			alert.style.display = '';
		}
	}

	global.shareByEmail = shareByEmail;
}(this));

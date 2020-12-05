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

	var css =
	`#modal-sendmail {
		font-family: Arial, Helvetica, sans-serif;
	}

	/* The Modal (background) */
	#modal-sendmail.simulator-modal {
		display: none; /* Hidden by default */
		position: fixed; /* Stay in place */
		z-index: 1; /* Sit on top */
		padding-top: 30px; /* Location of the box */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		overflow: auto; /* Enable scroll if needed */
		background-color: rgb(0,0,0); /* Fallback color */
		background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
	}

	/* Modal Content */
	#modal-sendmail.simulator-modal .modal-content {
		position: relative;
		background-color: #fefefe;
		margin: auto;
		padding: 0;
		border: 1px solid #888;
		border-radius: 10px;
		outline: 0;
		width: 60%;
		height: 80%;
		box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
		-webkit-animation-name: modalanimatetop;
		-webkit-animation-duration: 0.4s;
		animation-name: modalanimatetop;
		animation-duration: 0.4s
	}

	/* Add Animation */
	@-webkit-keyframes modalanimatetop {
		from {top:-300px; opacity:0} 
		to {top:0; opacity:1}
	}

	@keyframes modalanimatetop {
		from {top:-300px; opacity:0}
		to {top:0; opacity:1}
	}

	/* The Close Button */
	#modal-sendmail .close {
		color: white;
		float: right;
		font-size: 28px;
		font-weight: bold;
		border: none;
		margin-top: 4px;
		background-color: var(--primary-color-darken);
	}

	#modal-sendmail.simulator-modal .close:hover,
	#modal-sendmail.simulator-modal .close:focus {
		background-color: var(--primary-color-lighten);
		text-decoration: none;
		cursor: pointer;
	}

	#modal-sendmail.simulator-modal .modal-header {
		padding: 2px 16px;
		background-color: var(--color, var(--primary-color));
		color: white;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
	}

	#modal-sendmail.simulator-modal .modal-title {
		margin: 12px auto;
	}

	#modal-sendmail.simulator-modal .modal-sendmail-title {
		color: var(--primary-color-darken, #0b6ba8);
	}


	#modal-sendmail.simulator-modal .modal-body {
		padding: 2px 16px;
	}

	#modal-sendmail.simulator-modal .modal-body label {
		display: inline-block;
		max-width: 100%;
		margin-bottom: 5px;
		font-weight: bold;
	}

	#modal-sendmail.simulator-modal .modal-body input,
	#modal-sendmail.simulator-modal .modal-body textarea {
		display: block;
		width: 98%;
		padding: 6px 12px;
		font-size: 14px;
		line-height: 1.42857143;
		color: #555;
		background-color: #fff;
		background-image: none;
		border: 1px solid #ccc;
		border-radius: 4px;
		-webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
		-webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
		-o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
		transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
		margin-bottom: 10px;
	}
	#modal-sendmail.simulator-modal .modal-body input:focus,
	#modal-sendmail.simulator-modal .modal-body textarea:focus {
	  border-color: #66afe9;
	  outline: 0;
	  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);
			  box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);
	}

	#modal-sendmail.simulator-modal .modal-body input {
		height: 30px;
	}

	#modal-sendmail.simulator-modal .modal-body textarea {
		height: auto;
	}

	#modal-sendmail.simulator-modal .modal-footer {
		padding: 2px 16px;
		background-color: var(--color, var(--primary-color));
		color: white;
		height: 3.7rem;
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}

	#modal-sendmail.simulator-modal .modal-footer button {
		display: inline-block;
		margin: 0.5em 0 1em 1em;
		font-size: 1.2em;
		font-weight: normal;
		border: 1px solid var(--primary-color, #0b6ba8);
		white-space: nowrap;
		padding: 6px 12px;
		line-height: 1.5;
		border-radius: 4px;
		text-transform: none;
		text-decoration: none;
		text-align: center;
		cursor: pointer;
		overflow: visible;
	}

	#modal-sendmail.simulator-modal .modal-footer button:hover {
		filter: brightness(75%);
	}

	#modal-sendmail.simulator-modal .modal-footer button.btn-primary {
		color: #fff;
		background-color: var(--primary-color-darken, #0b6ba8);
		float: right;
	}

	#modal-sendmail.simulator-modal .modal-footer button.btn-default {
		color: var(--primary-color, #0b6ba8);
		background-color: #fff;
		float: right;
	}
`;

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
			var style = document.createElement('style');
			style.textContent = css;
			document.head.appendChild(style);
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

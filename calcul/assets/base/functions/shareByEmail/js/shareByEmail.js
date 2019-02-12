/**
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

(function (global) {
	'use strict';

	var template = 
	`<div class="modal fade" id="modal-sendmail" tabindex="-1" role="dialog" aria-labelledby="modal-sendmail-label" aria-hidden="true">
		<form id="modal-sendmail-form" action="">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="btn close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button>
						<h4 class="modal-title" id="modal-sendmail-label">[MODAL-TITLE]</h4>
					</div>
					<div class="modal-body">
						<h5 id="modal-sendmail-title">[MODAL-SIMULATOR-LABEL]</h5>
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
						<div id="modal-sendmail-recaptcha" style="float: left;"
							data-sitekey="[MODAL-RECAPTCHA]"
							data-size="invisible"
							data-badge="inline">
						</div>
						<button id="modal-sendmail-cancel" data-dismiss="modal" class="btn btn-default" type="button">[MODAL-CANCEL]</button>
						<button id="modal-sendmail-submit" class="btn btn-primary" type="button">[MODAL-SEND]</button>
					</div>
				</div>
			</div>
			<input type="hidden" name="subject" value="[MODAL-MAIL-SUBJECT]">
			<input type="hidden" name="host" value="">
			<input type="hidden" name="link" value="">
			<input type="hidden" name="simulator" value="[MODAL-SIMULATOR]">
		</form>
	</div>`;

	function shareByEmail(clickable, func, callback) {
		var parameters = func.arguments;
		var g6k = clickable.data('g6k');

		if ($('#modal-sendmail').length == 0) {
			var modal = template
			.replace('[MODAL-TITLE]', Translator.trans('Share by email'))
			.replace('[MODAL-SIMULATOR-LABEL]', g6k.simu.label)
			.replace('[MODAL-PROMPT]', Translator.trans('To share this page, please enter the following information'))
			.replace('[MODAL-MENTION-ASTERISK]', Translator.trans('Fields marked with an %asterisk% are required.', { 'asterisk': '<span class="asterisk">*</span>' }))
			.replace('[MODAL-SENDER-LABEL]', Translator.trans('Your email'))
			.replace('[MODAL-RECIPIENTS-LABEL]', Translator.trans("Recipient's email"))
			.replace('[MODAL-RECIPIENTS-HELP]', Translator.trans("You can put up to 3 addresses separated by one semi-colon"))
			.replace('[MODAL-MESSAGE-LABEL]', Translator.trans('Your message'))
			.replace('[MODAL-RECAPTCHA]', '6LdL-40UAAAAALo6twArDk6sSM95Flw25yS5xC0Y')
			.replace('[MODAL-CANCEL]', Translator.trans('Cancel'))
			.replace('[MODAL-SEND]', Translator.trans('Send'))
			.replace('[MODAL-MAIL-SUBJECT]', g6k.simu.label)
			.replace('[MODAL-SIMULATOR]', g6k.simu.name)
			;
			$('body').append(modal);
		}
		if (clickable.is('a')) {
			clickable.attr('href', '');
			clickable.attr('title', clickable.text());
			clickable.attr('rel', 'noopener noreferrer');
			clickable.html('');
			clickable.addClass('email-share-button');
			clickable.append($('<span>', { 'class': 'fas fa-envelope'}));
		}
		clickable.on('click', function(event) {
			event.preventDefault();
			var recaptcha = $('#modal-sendmail-recaptcha');
			if (recaptcha.length > 0 && recaptcha.find('.grecaptcha-badge').length == 0) {
				grecaptcha.render(
					recaptcha[0],
					{
						'callback': function(token){
							var data = {};
							var inputs = $('#modal-sendmail-form').serializeArray();
							$.each(inputs, function (i, input) {
								data[input.name] = input.value;
							});
							data['recipients'] = data['recipients'].split(/\s*;\s*/);
							data['recaptcha_response'] = token;
							var simulator = $('#modal-sendmail-form').find('input[name=simulator]').val();
							var path = $(location).attr('pathname').replace("/" + simulator, "/sendpage").replace("tryIt", "").replace(/\/+$/, "") + "/mail";
							showInfo(Translator.trans("Sending the email in progress ...") );
							$.post(path,
								data,
								function(result){
									if (result.status == 'ok') {
										showSuccess(Translator.trans("The email was sent successfully") );
									} else if (result.failures) {
										showError(Translator.trans("An error occurred while sending mail"));
										console && console.log(result.failures);
									}
								},
								"json"
							).fail(function(jqXHR, textStatus, errorThrown) {
								if ((jqXHR.status != 0 && jqXHR.status != 200) || textStatus === 'timeout') {
									showError(Translator.trans("An error occurs while sending the mail") );
								}
							});
							$('#modal-sendmail-submit').hide();
							$('#modal-sendmail-cancel').text(Translator.trans("Close"));
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
			$('#modal-sendmail-form').find('input[name=link]').val(window.location.href.replace(/\#.*$/, ""));
			$('#modal-sendmail-form').find('input[name=host]').val(window.location.host.replace(/:.*$/, ""));
			$('#modal-sendmail').find('textarea[maxlength]').each(function() {
				var tid = $(this).attr('id');
				var countblock = $('#modal-sendmail').find(".letter-count[data-textarea='" + tid + "']");
				if (countblock.length > 0) {
					var maxlength = parseInt($(this).attr('maxlength'));
					countblock.text(Translator.trans('%num% characters remaining', { num: maxlength }));
					$(this).on('input propertychange', function() {
						var num = maxlength - $(this).val().length;
						countblock.text(Translator.trans('%num% characters remaining', { num: num }));
						
					});
				}
			});
			$('#modal-sendmail').modal();
			$('#modal-sendmail-alert').hide();
		});
		$("#modal-sendmail-submit").on('click', function(event) {
			event.preventDefault();
			var form = $('#modal-sendmail-form');
			form.find(':input').parent().removeClass('has-error');
			var sender = form.find('input[name=sender]');
			if (sender.val() == '') {
				showError(Translator.trans('Your email is required'));
				sender.parent().addClass('has-error');
				return false;
			}
			if (!IsValidEmail(sender.val())) {
				showError(Translator.trans('Your email is not valid!'));
				sender.parent().addClass('has-error');
				return false;
			}
			var recipients = form.find('input[name=recipients]');
			if (recipients.val() == '') {
				showError(Translator.trans('The recipients are required'));
				recipients.parent().addClass('has-error');
				return false;
			}
			var emails = recipients.val().split(/\s*;\s*/);
			for (var i = 0; i < emails.length; i++) {
				if (!IsValidEmail(emails[i])) {
					showError(Translator.trans('The email %email% is not valid!', {'email': emails[i]}));
					recipients.parent().addClass('has-error');
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
			$('#modal-sendmail-alert').text(error);
			$('#modal-sendmail-alert').removeClass('alert-info').removeClass('alert-success').addClass('alert-danger').show();
		}

		function showInfo(info) {
			$('#modal-sendmail-alert').text(info);
			$('#modal-sendmail-alert').removeClass('alert-success').removeClass('alert-danger').addClass('alert-info').show();
		}

		function showSuccess(success) {
			$('#modal-sendmail-alert').text(success);
			$('#modal-sendmail-alert').removeClass('alert-info').removeClass('alert-danger').addClass('alert-success').show();
		}
	}

	global.shareByEmail = shareByEmail;
}(this));

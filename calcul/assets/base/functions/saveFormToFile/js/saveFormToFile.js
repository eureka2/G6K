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

	function saveFormToFile(clickable, func, callback) {
		var parameters = func.arguments;
		var message = 'The form data has been saved on the hard disk.';
		var g6k = clickable.data('g6k');
		if (clickable.is('a')) {
			clickable.attr('href', '');
			clickable.attr('title', clickable.text());
			clickable.attr('rel', 'noopener noreferrer');
			clickable.html('');
			clickable.addClass('save-form-button');
			clickable.append($('<span>', { 'class': 'far fa-save'}));
		}
		if (func.appliedto == 'page') {
			clickable.on('click', function(event) {
				event.preventDefault();
				saveInputs('body');
				if (callback) {
					callback(true, message);
				}
			});
		} else if (func.appliedto == 'article') {
			clickable.on('click', function(event) {
				event.preventDefault();
				saveInputs('.main-container article');
				if (callback) {
					callback(true, message);
				}
			});
		} else {
			var element = g6k.getStepChildElement(parameters);
			if ($(element).hasClass('accordion-section')) {
				$(element).find('.panel-body').append(clickable);
			} else if ($(element).find('.modal-footer').length > 0) {
				$(element).find('.modal-footer').append(clickable);
			} else {
				$(element).append(clickable);
			}
			clickable.on('click', function(event) {
				event.preventDefault();
				saveInputs(element);
				if (callback) {
					callback(true, message);
				}
			});
		}

		function saveInputs(element) {
			var fields = {};
			$(element).find(":input:not([type='radio']), input[type='radio']:checked").each(function() {
				if (! $(this).is('button')) {
					var name = $(this).attr('name');
					var type = $(this).attr('type');
					if (name && type != 'hidden') {
						var value = $(this).val();
						if (type == 'checkbox') {
							value = $(this).is(':checked');
						}
						fields[name] = value;
					}
				}
			});
			var text = {
				simulator: g6k.simu.name,
				target: func.appliedto,
				step: g6k.simu.step.name
			}
			if (parameters.panel) {
				text['panel'] = parameters.panel;
			}
			if (parameters.fieldset) {
				text['fieldset'] = parameters.fieldset;
			}
			if (parameters.blockgroup) {
				text['blockgroup'] = parameters.blockgroup;
			}
			text['fields'] = fields;
			saveTextAsFile(g6k.simu.name + '.txt', JSON.stringify(text, null, "\t"));
		}

		function saveTextAsFile(fileNameToSaveAs, textToWrite) {
			var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
			var downloadLink = document.createElement("a");
			downloadLink.download = fileNameToSaveAs;
			downloadLink.innerHTML = "Save as";
			if (window.webkitURL != null) {
				downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
			} else {
				downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
				downloadLink.onclick = function (event) {
					document.body.removeChild(event.target);
				};
				downloadLink.style.display = "none";
				document.body.appendChild(downloadLink);
			}
			downloadLink.click();
		}

	}

	global.saveFormToFile = saveFormToFile;
}(this));

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

	function saveFormToFile(clickable, func, options, callback) {
		var g6k;
		if (typeof clickable === "object" && clickable && clickable["jquery"]) {
			g6k = clickable.data('g6k');
			clickable = clickable[0];
		} else {
			g6k = this;
		}
		var parameters = func.arguments;
		var message = 'The form data has been saved on the hard disk.';
		if (clickable.matches('a')) {
			clickable.setAttribute('href', '');
			clickable.setAttribute('title', clickable.textContent);
			clickable.setAttribute('rel', 'noopener noreferrer');
			clickable.classList.add('save-form-button');
			clickable.innerHTML = '<span class="icomoon icon-save">';
		}
		if (func.appliedto == 'page') {
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				saveInputs('body');
				if (callback) {
					callback(true, message);
				}
			});
		} else if (func.appliedto == 'article') {
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				saveInputs('.simulator-container.article');
				if (callback) {
					callback(true, message);
				}
			});
		} else {
			var element = g6k.getStepChildElement(parameters);
			if (element.classList.contains('accordion-section')) {
				element.querySelector('.panel-body').appendChild(clickable);
			} else if (element.querySelectorAll('.modal-footer').length > 0) {
				element.querySelectorAll('.modal-footer').forEach(footer => footer.appendChild(clickable));
			} else {
				element.appendChild(clickable);
			}
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				saveInputs(element);
				if (callback) {
					callback(true, message);
				}
			});
		}

		function saveInputs(element) {
			var fields = {};
			element.querySelectorAll("input:not([type='radio']), button, select, textarea, input[type='radio']:checked").forEach(function(input) {
				if (! input.matches('button')) {
					var name = input.getAttribute('name');
					var type = input.getAttribute('type');
					if (name && type != 'hidden') {
						var value = input.value;
						if (type == 'checkbox') {
							value = input.matches(':checked');
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

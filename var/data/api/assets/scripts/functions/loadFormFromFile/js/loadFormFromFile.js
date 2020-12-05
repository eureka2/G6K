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

	function loadFormFromFile(clickable, func, options, callback) {
		var g6k;
		if (typeof clickable === "object" && clickable && clickable["jquery"]) {
			g6k = clickable.data('g6k');
			clickable = clickable[0];
		} else {
			g6k = this;
		}
		var parameters = func.arguments;
		var message = 'The form data has been loaded from the hard disk.';
		if (clickable.matches('a')) {
			clickable.setAttribute('href', '');
			clickable.setAttribute('title', clickable.textContent);
			clickable.setAttribute('rel', 'noopener noreferrer');
			clickable.classList.add('load-form-button');
			clickable.innerHTML = '<span class="icomoon icon-save">';
		}
		var element;
		if (func.appliedto == 'page') {
			element = 'body';
		} else if (func.appliedto == 'article') {
			element = '.simulator-container.article';
		} else {
			element = g6k.getStepChildElement(parameters);
			if (element.classList.contains('accordion-section')) {
				element.querySelector('.panel-body').appendChild(clickable);
			} else if (element.querySelectorAll('.modal-footer').length > 0) {
				element.querySelectorAll('.modal-footer').forEach(footer => footer.appendChild(clickable));
			} else {
				element.appendChild(clickable);
			}
		}
		var fileToLoad = document.createElement('input');
		fileToLoad.setAttribute('type', 'file');
		fileToLoad.setAttribute('accept', 'text/plain, .txt');
		fileToLoad.classList.add('sr-only');
		document.querySelector('body').appendChild(fileToLoad);
		fileToLoad.addEventListener('change', function(e) {
			loadFileAsText(this, function(text) {
				var text = JSON.parse(text);
				if (text.simulator != g6k.simu.name) {
					callback && callback(false, "This data does not apply to this simulator.");
					return;
				}
				if (text.target != func.appliedto) {
					callback && callback(false, "This data does not apply to this part of the simulator.");
					return;
				}
				if (parameters.step && (! text.step || text.step != g6k.simu.step.name)) {
					callback && callback(false, "This data does not apply to this step of the simulator.");
					return;
				}
				if (parameters.panel && (! text.panel || text.panel != parameters.panel)) {
					callback && callback(false, "This data does not apply to this part of the simulator.");
					return;
				}
				if (parameters.fieldset && (! text.fieldset || text.fieldset != parameters.fieldset)) {
					callback && callback(false, "This data does not apply to this part of the simulator.");
					return;
				}
				if (parameters.blockgroup && (! text.blockgroup || text.blockgroup != parameters.blockgroup)) {
					callback && callback(false, "This data does not apply to this part of the simulator.");
					return;
				}

				text.fields.forEach(function(value, name) {
					element.querySelectorAll("[name='" + name + "']").forEach(function(input) {
						var type = input.getAttribute('type');
						if (type == 'radio') {
							if (input.getAttribute('value') == value) {
								input.setAttribute("checked", "checked");
								var label = input.closest('label');
								setTimeout(function() {
									label.classList.add('checked');
								}, 0);
							} else {
								return true; // continue
							}
						}
						g6k.setValue(name, value);
					});
				});
				if (callback) {
					callback(true, message);
				}
			});
		});
		clickable.addEventListener('click', function(event) {
			event.preventDefault();
			fileToLoad.trigger('click');
			fileToLoad.target.dispatchEvent(new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			}));
		});

		function loadFileAsText(fileToLoad, onLoad) {
			var file = fileToLoad.files[0];
			var fileReader = new FileReader();
			fileReader.onload = function(fileLoadedEvent) {
				onLoad && onLoad(fileLoadedEvent.target.result);
			};
			fileReader.readAsText(file, "UTF-8");
		}

	}

	global.loadFormFromFile = loadFormFromFile;
}(this));

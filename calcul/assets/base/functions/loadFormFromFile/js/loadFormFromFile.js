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

	function loadFormFromFile(clickable, func, callback) {
		var parameters = func.arguments;
		var message = 'The form data has been loaded from the hard disk.';
		var g6k = clickable.data('g6k');
		if (clickable.is('a')) {
			clickable.attr('href', '');
			clickable.attr('title', clickable.text());
			clickable.attr('rel', 'noopener noreferrer');
			clickable.html('');
			clickable.addClass('load-form-button');
			clickable.append($('<span>', { 'class': 'fas fa-save'}));
		}
		var element;
		if (func.appliedto == 'page') {
			element = 'body';
		} else if (func.appliedto == 'article') {
			element = '.main-container article';
		} else {
			element = g6k.getStepChildElement(parameters);
			if ($(element).hasClass('accordion-section')) {
				$(element).find('.panel-body').append(clickable);
			} else if ($(element).find('.modal-footer').length > 0) {
				$(element).find('.modal-footer').append(clickable);
			} else {
				$(element).append(clickable);
			}
		}
		var fileToLoad = $('<input>', { 'type': 'file', 'class': 'sr-only', 'accept': 'text/plain, .txt' });
		$('body').append(fileToLoad);
		fileToLoad.on('change', function(e) {
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

				$.each(text.fields, function(name, value) {
					$(element).find(":input[name='" + name + "']").each(function() {
						var type = $(this).attr('type');
						if (type == 'radio') {
							if ($(this).attr('value') == value) {
								$(this).prop("checked", true);
								var label = $(this).closest('label');
								setTimeout(function() {
									label.addClass('checked');
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
		clickable.on('click', function(event) {
			event.preventDefault();
			fileToLoad.trigger('click');
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

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

	function printElement(clickable, func, options, callback) {
		var g6k;
		if (typeof clickable === "object" && clickable && clickable["jquery"]) {
			g6k = clickable.data('g6k');
			clickable = clickable[0];
		} else {
			g6k = this;
		}
		var parameters = func.arguments;
		document.querySelector('html').setAttribute('moznomarginboxes', true);
		document.querySelector('body').style.colorAdjust = 'exact';
		document.querySelector('body').style.webkitPrintColorAdjust = 'exact';
		if (clickable.matches('a')) {
			clickable.setAttribute('href', '');
			clickable.setAttribute('title', clickable.textContent);
			clickable.setAttribute('rel', 'noopener noreferrer');
			clickable.classList.add('element-print-button');
			clickable.innerHTML = '<span class="fonticon icon-print">';
		}
		if (func.appliedto == 'data'){
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				if (callback) {
					callback(false);
				}
			});
		} else if (func.appliedto == 'page') {
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				window.print();
				if (callback) {
					callback(true);
				}
			});
		} else if (func.appliedto == 'article') {
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				new printThis(document.querySelector('.simulator-container.article'));
				if (callback) {
					callback(true);
				}
			});
		} else {
			var element = g6k.getStepChildElement(parameters);
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				new printThis(element, { copyTagClasses: true });
				if (callback) {
					callback(true);
				}
			});
		}

	}

	global.printElement = printElement;
}(this));

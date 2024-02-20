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

	function printToPDF(clickable, func, options, callback) {
		var g6k;
		if (typeof clickable === "object" && clickable && clickable["jquery"]) {
			g6k = clickable.data('g6k');
			clickable = clickable[0];
		} else {
			g6k = this;
		}
		var parameters = func.arguments;
		if (clickable.matches('a')) {
			clickable.setAttribute('href', '');
			clickable.setAttribute('title', clickable.textContent);
			clickable.setAttribute('rel', 'noopener noreferrer');
			clickable.classList.add('pdf-print-button');
			clickable.innerHTML = '<span class="icomoon icon-pdf">';
		}
		var message = null;
		if (func.appliedto == 'data' || func.appliedto == 'datagroup'){
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				if (callback) {
					callback(false);
				}
			});
		} else if (func.appliedto == 'page') {
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				pdfPrint(document.body);
				if (callback) {
					callback(true, message);
				}
			});
		} else if (func.appliedto == 'article') {
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				pdfPrint(document.querySelector('.simulator-container.article'));
				if (callback) {
					callback(true, message);
				}
			});
		} else {
			var element = g6k.getStepChildElement(parameters);
			clickable.addEventListener('click', function(event) {
				event.preventDefault();
				pdfPrint(element);
				if (callback) {
					callback(true, message);
				}
			});
		}

		function pdfPrint(element) {
			var opt = {
				margin:       1,
				filename:     g6k.simu.name + '.pdf',
				image:        { type: 'jpeg', quality: 0.98 },
				html2canvas:  { scale: 1 },
				jsPDF:        { unit: 'in', format: 'a3', orientation: 'landscape' }
			};
			html2pdf().set(opt).from(element).save();
		}

	}

	global.printToPDF = printToPDF;
}(this));

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

	function printToPDF(clickable, func, callback) {
		var parameters = func.arguments;
		var g6k = clickable.data('g6k');
		if (clickable.is('a')) {
			clickable.attr('href', '');
			clickable.attr('title', clickable.text());
			clickable.attr('rel', 'noopener noreferrer');
			clickable.html('');
			clickable.addClass('pdf-print-button');
			clickable.append($('<span>', { 'class': 'far fa-file-pdf'}));
		}
		var message = null;
		if (func.appliedto == 'data' || func.appliedto == 'datagroup'){
			clickable.on('click', function(event) {
				event.preventDefault();
				if (callback) {
					callback(false);
				}
			});
		} else if (func.appliedto == 'page') {
			clickable.on('click', function(event) {
				event.preventDefault();
				pdfPrint(document.body);
				if (callback) {
					callback(true, message);
				}
			});
		} else if (func.appliedto == 'article') {
			clickable.on('click', function(event) {
				event.preventDefault();
				pdfPrint($('.main .container')[0]);
				if (callback) {
					callback(true, message);
				}
			});
		} else {
			var element = g6k.getStepChildElement(parameters);
			clickable.on('click', function(event) {
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

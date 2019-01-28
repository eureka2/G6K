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
				pdfPrint($('.main-container article')[0]);
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
			html2canvas(element)
			.then(function(canvas){
				var pdf = new jsPDF('p', 'pt', 'letter');
				for (var i = 0; i <= element.clientHeight/980; i++) {
					var srcImg  = canvas;
					var sX      = 0;
					var sY      = 980*i; // start 980 pixels down for every new page
					var sWidth  = 900;
					var sHeight = 980;
					var dX      = 0;
					var dY      = 0;
					var dWidth  = 900;
					var dHeight = 980;

					window.onePageCanvas = document.createElement("canvas");
					onePageCanvas.setAttribute('width', 900);
					onePageCanvas.setAttribute('height', 980);
					var ctx = onePageCanvas.getContext('2d');
					ctx.drawImage(srcImg,sX,sY,sWidth,sHeight,dX,dY,dWidth,dHeight);

					var canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);

					var width         = onePageCanvas.width;
					var height        = onePageCanvas.clientHeight;

					if (i > 0) {
						pdf.addPage(612, 791); //8.5" x 11" in pts (in*72)
					}
					pdf.setPage(i+1);
					pdf.addImage(canvasDataURL, 'PNG', 20, 40, (width*.62), (height*.62));
				}
				pdf.save('Test.pdf');
			});
		}

	}

	global.printToPDF = printToPDF;
}(this));

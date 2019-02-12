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

	function copyToClipboard(clickable, func, callback) {
		var parameters = func.arguments;
		var message = 'The text is copied, click (ctrl/cmd + v) to paste it on your text editor.';
		var g6k = clickable.data('g6k');
		if (clickable.is('a')) {
			clickable.attr('href', '');
			clickable.attr('title', clickable.text());
			clickable.attr('rel', 'noopener noreferrer');
			clickable.html('');
			clickable.addClass('email-share-button');
			clickable.append($('<span>', { 'class': 'far fa-clipboard'}));
		}
		if (func.appliedto == 'data'){
			var name = g6k.getDataNameById(parameters.data);
			clickable.on('click', function(event) {
				event.preventDefault();
				var data = g6k.getData(name);
				copyTextToClipboard(data.value);
				if (callback) {
					callback(true, message);
				}
			});
		} else if (func.appliedto == 'page') {
			clickable.on('click', function(event) {
				event.preventDefault();
				copyHtmlToClipboard($('body').html());
				if (callback) {
					callback(true, message);
				}
			});
		} else if (func.appliedto == 'article') {
			clickable.on('click', function(event) {
				event.preventDefault();
				copyHtmlToClipboard($('.main-container article').html());
				if (callback) {
					callback(true, message);
				}
			});
		} else {
			var element = g6k.getStepChildElement(parameters);
			clickable.on('click', function(event) {
				event.preventDefault();
				copyElementToClipboard(element);
				if (callback) {
					callback(true, message);
				}
			});
		}

		function copyElementToClipboard(element) {
			// for Internet Explorer
			if(document.body.createTextRange) {
				var range = document.body.createTextRange();
				range.moveToElementText(element);
				range.select();
				document.execCommand("Copy");
			} else if(window.getSelection) {
				// other browsers
				var selection = window.getSelection();
				var range = document.createRange();
				range.selectNodeContents(element);
				selection.removeAllRanges();
				selection.addRange(range);
				document.execCommand("Copy");
			}
		}

		function copyTextToClipboard(text) {
			if (window.clipboardData && window.clipboardData.setData) {
				// IE specific code path to prevent textarea being shown while dialog is visible.
				return clipboardData.setData("Text", text); 

			} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
				var textarea = document.createElement("textarea");
				textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
				textarea.style.top = 0;
				textarea.style.left = 0;
				// Ensure it has a small width and height. Setting to 1px / 1em
				// doesn't work as this gives a negative w/h on some browsers.
				textarea.style.width = '2em';
				textarea.style.height = '2em';
				// We don't need padding, reducing the size if it does flash render.
				textarea.style.padding = 0;
				// Clean up any borders.
				textarea.style.border = 'none';
				textarea.style.outline = 'none';
				textarea.style.boxShadow = 'none';
				// Avoid flash of white box if rendered for any reason.
				textarea.style.background = 'transparent';
				textarea.textContent = text;
				document.body.appendChild(textarea);
				textarea.select();
				try {
					return document.execCommand("copy");  // Security exception may be thrown by some browsers.
				} catch (ex) {
					return false;
				} finally {
					document.body.removeChild(textarea);
				}
			}
		}

		function copyHtmlToClipboard(html) {
			var clipboardDiv = document.createElement('div');
			clipboardDiv.style.fontSize = '12pt'; // Prevent zooming on iOS
			// Reset box model
			clipboardDiv.style.border = '0';
			clipboardDiv.style.padding = '0';
			clipboardDiv.style.margin = '0';
			// Move element out of screen 
			clipboardDiv.style.position = 'fixed';
			clipboardDiv.style['right'] = '-9999px';
			clipboardDiv.style.top = (window.pageYOffset || document.documentElement.scrollTop) + 'px';
			// more hiding
			clipboardDiv.setAttribute('readonly', '');
			clipboardDiv.style.opacity = 0;
			clipboardDiv.style.pointerEvents = 'none';
			clipboardDiv.style.zIndex = -1;
			clipboardDiv.setAttribute('tabindex', '0'); // so it can be focused
			clipboardDiv.innerHTML = '';
			document.body.appendChild(clipboardDiv);
			clipboardDiv.innerHTML=html;
			var focused = document.activeElement;
			clipboardDiv.focus();
			window.getSelection().removeAllRanges();  
			var range = document.createRange(); 
			range.setStartBefore(clipboardDiv.firstChild);
			range.setEndAfter(clipboardDiv.lastChild);
			window.getSelection().addRange(range);  
			document.execCommand('copy');
			clipboardDiv.parentNode.removeChild(clipboardDiv);
		}

	}

	global.copyToClipboard = copyToClipboard;
}(this));

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

	function shareOnTwitter(clickable, func, options, callback) {
		var g6k;
		if (typeof clickable === "object" && clickable && clickable["jquery"]) {
			g6k = clickable.data('g6k');
			clickable = clickable[0];
		} else {
			g6k = this;
		}
		var parameters = func.arguments;

		var params = [
			'url='  + encodeURIComponent(window.location.href.replace(/\#.*$/, "")),
			'text=' + encodeURIComponent(g6k.simu.label)
		];
		var link;
		if (clickable.matches('button')) {
			link = document.createElement('a');
			link.innerHTML = clickable.innerHTML;
			link.className = clickable.className;
			link.style.textDecoration = 'none';
			clickable.insertAdjacentElement('afterend', link);
			clickable.setAttribute('aria-hidden', 'true')
			clickable.style.display = 'none';
		} else {
			link = clickable;
			link.setAttribute('title', clickable.textContent);
			link.innerHTML = '<span class="fonticon icon-twitter"></span>';
		}
		link.setAttribute('href', 'https://twitter.com/intent/tweet?' + params.join('&')); 
		link.setAttribute('target', '_blank');
		link.setAttribute('rel', 'noopener noreferrer');
		link.classList.add('twitter-share-button');
	}

	global.shareOnTwitter = shareOnTwitter;
}(this));

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

	function shareOnPinterest(clickable, func, callback) {
		var parameters = func.arguments;
		var g6k = clickable.data('g6k');

		var params = [
			'url='  + encodeURIComponent(window.location.href.replace(/\#.*$/, "")),
			'description=' + encodeURIComponent(g6k.simu.label),
			'page-image-src=' + 'media'
		];
		var link;
		if (clickable.is('button')) {
			link = $('<a>', {
				'class': clickable[0].className,
				'html': clickable.html()
			});
			link.css('text-decoration', 'none');
			clickable.after(link);
			clickable.attr('aria-hidden', 'true').hide();
		} else {
			link = clickable;
			link.attr('title', clickable.text());
			link.html('');
			link.append($('<span>', { 'class': 'fab fa-pinterest'}));
		}
		link.attr('href', 'https://pinterest.com/pin/create/button/?' + params.join('&')); 
		link.attr('target', '_blank');
		link.attr('rel', 'noopener noreferrer');
		link.addClass('pinterest-share-button');
	}

	global.shareOnPinterest = shareOnPinterest;
}(this));

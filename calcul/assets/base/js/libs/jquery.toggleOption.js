/* The MIT License (MIT)

Copyright (c) 2014 Glen Little

https://github.com/glittle/sunwapta.jquery.toggleOption

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* Description

A jQuery plugin that hides and shows <option> elements in a <select> dropdown element.
Syntax:

There are three functions: hideOption(), showOption(), toggleOption()

    $('#mySelect').hideOption(value); 
    $('#mySelect').showOption(value);
    $('#mySelect').toggleOption(value, [show]);

    value is a string - the text value of the option
    show is a truthy boolean - if true, the option will be shown, if false, the option will be hidden. If not provided, the option will be toggled from what it is now.
 */
 
(function ($) {
	$.fn.toggleOption = function (value, show) {
	// <summary>Show or hide the desired option</summary>
		return this.filter('select').each(function () {
			var select = $(this);
			if (typeof show === 'undefined') {
				show = select.find('option[value="' + value + '"]').length == 0;
			}
			if (show) {
				select.showOption(value);
			} else {
				select.hideOption(value);
			}
		});
	};
	$.fn.showOption = function (value) {
		// <summary>Show the desired option in the location it was in when hideOption was first used</summary>
		return this.filter('select').each(function () {
			var select = $(this);
			var found = select.find('option[value="' + value + '"]').length != 0;
			if (found) return; // already there

			var info = select.data('opt' + value);
			if (!info) return; // abort... hideOption has not been used yet

			var targetIndex = info.data('i');
			var options = select.find('option');
			var lastIndex = options.length - 1;
			if (lastIndex == -1) {
				select.prepend(info);
			} else {
				options.each(function (i, e) {
					var opt = $(e);
					if (opt.data('i') > targetIndex) {
						opt.before(info);
						return false;
					} else if (i == lastIndex) {
						opt.after(info);
						return false;
					}
				});
			}
			return;
		});
	};
	$.fn.hideOption = function (value) {
		/// <summary>Hide the desired option, but remember where it was to be able to put it back where it was</summary>
		return this.filter('select').each(function () {
			var select = $(this);
			var opt = select.find('option[value="' + value + '"]').eq(0);
			if (!opt.length) return;

			if (!select.data('optionsModified')) {
				// remember the order
				select.find('option').each(function (i, e) {
				$(e).data('i', i);
				});
				select.data('optionsModified', true);
			}

			select.data('opt' + value, opt.detach());
			return;
		});
	};
})(jQuery);
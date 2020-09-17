
/*
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

/*
 * Usage
 *
 * ShowMore.init({
 *     target: '.shrinkable',         // Selector of the element this script applies to (any CSS selector, eg: '#', '.'). Default: ''
 *     numOfWords: 50,                // Number of words to initially display (any number). Default: 50
 *     showMoretext: 'Show more',     // The text of 'Show more' link. Default: 'Show more'
 *     ellipsisText: ' ...',          // The text to use to replace the hidden text
 *     hiddenClass: 'sr-only'         // The class to use to hide part of the text except screen readers for which the text remains visible. Default: 'sr-only'
 * });
 */

;(function(win){
	'use strict';

	var ShowMore = {};

	const EMPTY_TAGS = ['area', 'base', 'basefont', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen', 'isindex', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

	ShowMore.init = function (options) {

		var merge = function() {
			for (var argument of arguments) {
				for (var key in argument) {
					if (argument.hasOwnProperty(key)) {
						if (argument[key] && argument[key].constructor && argument[key].constructor === Object) {
							arguments[0][key] = arguments[0][key] || {};
							merge(arguments[0][key], argument[key]);
						} else {
							arguments[0][key] = argument[key];
						}
					}
				}
			}
			return arguments[0];
		};

		var defaults = {
			target: '',
			numOfWords: 50,
			showMoretext: 'Show more',
			ellipsisText: ' ...',
			hiddenClass: 'sr-only'
		};

		options = merge({}, defaults, options);

		var walk = function(node, callback) {
			var tag = node.nodeName.toLowerCase();
			var empty = EMPTY_TAGS.includes(tag);
			if (callback.start) {
				var attributes = [];
				for (var attr of node.attributes) {
					attributes.push({
						name: attr.name,
						value: attr.value,
						escaped: attr.value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				}
				callback.start.call(node, tag, attributes, empty);
			}
			var children = node.childNodes;
			children.forEach(child => {
				switch (child.nodeType) {
					case Node.ELEMENT_NODE:
						walk(child, callback);
						break;
					case Node.DOCUMENT_FRAGMENT_NODE:
						if (null !== child.firstElementChild) {
							walk(child.firstElementChild, callback);
						}
						break;
					case Node.TEXT_NODE:
						if (callback.chars) {
							callback.chars.call(child, child.nodeValue);
						}
						break;
					case Node.COMMENT_NODE:
						if (callback.comment) {
							callback.comment.call(child, child.nodeValue);
						}
						break;
				}
			});
			if (callback.end && ! empty) {
				callback.end.call(null, tag);
			}
		};

		var shrinkables = document.querySelectorAll(options.target);
		shrinkables.forEach(shrinkable => {
			var truncated = "";
			var maxWords = options.numOfWords;
			var shrinked = false;

			walk(shrinkable, {
				start: function( tag, attrs, unary ) {
					var classFound = false;
					truncated += "<" + tag;
					for (var attr of attrs) {
						if (shrinked && attr.name == 'class') {
							attr.escaped += ' ' + options.hiddenClass;
							classFound = true;
						}
						truncated += " " + attr.name + '="' + attr.escaped + '"';
					}
					if (shrinked && !classFound) {
						truncated += ' class="' + options.hiddenClass + '"';
					}
					truncated += (unary ? "/" : "") + ">";
				},
				end: function( tag ) {
					truncated += "</" + tag + ">";
				},
				chars: function( text ) {
					if (!shrinked) {
						var nWords = text.split(/\s+/).length;
						if (nWords > maxWords) {
							text = text.split(/\s+/).slice(0, maxWords).join(' ');
							text += '<span>' + '... ' + '</span>';
							text += '<a class="show-more-link" href="javscript:void"><em><strong>' + options.showMoretext + '</strong></em></a>';
							shrinked = true;
						}
						maxWords -= nWords;
						truncated += text;
					}
				},
				comment: function( text ) {
					truncated += "<!--" + text + "-->";
				}
			});
			if (shrinked) {
				var container = document.createElement('div');
				container.style.display = 'inline-block';
				container.setAttribute('aria-hidden', 'true');
				container.innerHTML = truncated;
				shrinkable.parentNode.insertBefore(container, shrinkable.nextSibling);
				container.querySelector('.show-more-link').addEventListener("click", function(event) {
					event.preventDefault();
					shrinkable.classList.remove(options.hiddenClass);
					container.parentNode.removeChild(container);
				}, false);
				shrinkable.classList.add(options.hiddenClass);
			}
		});
	}

	window.ShowMore = ShowMore;

}(this));
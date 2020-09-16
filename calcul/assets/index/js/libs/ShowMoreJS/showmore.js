
/*
The MIT License (MIT)

Copyright (c) 2015-2020 Jacques Archimède

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
 *     hiddenClass: 'd-none'          // The class to use to hide part of the text. Default: 'hidden'
 * });
 */

;(function(win){
	'use strict';

	var ShowMore = {};

	ShowMore.helpers = {
		extends: function() {
			for (var i = 1, l = arguments.length; i < l; i++) {
				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) {
						if (arguments[i][key] && arguments[i][key].constructor && arguments[i][key].constructor === Object) {
							arguments[0][key] = arguments[0][key] || {};
							this.extends(arguments[0][key], arguments[i][key]);
						} else {
							arguments[0][key] = arguments[i][key];
						}
					}
				}
			}
			return arguments[0];
		}
	};

	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
		attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	const EMPTY_TAGS = ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'isindex', 'link', 'meta', 'param', 'embed'];
	const BLOCK_TAGS =['address', 'applet', 'blockquote', 'button', 'center', 'dd', 'del', 'dir', 'div', 'dl', 'dt', 'fieldset', 'form', 'frameset', 'hr', 'iframe', 'ins', 'isindex', 'li', 'map', 'menu', 'noframes', 'noscript', 'object', 'ol', 'p', 'pre', 'script', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'];
	const INLINE_TAGS = ['a', 'abbr', 'acronym', 'applet', 'b', 'basefont', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'font', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'object', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'textarea', 'tt', 'u', 'var'];
	const CLOSESELF_TAGS = ['colgroup', 'dd', 'dt', 'li', 'options', 'p', 'td', 'tfoot', 'th', 'thead', 'tr'];
	const FILL_ATTRS = ['checked', 'compact', 'declare', 'defer', 'disabled', 'ismap', 'multiple', 'nohref', 'noresize', 'noshade', 'nowrap', 'readonly', 'selected'];
	const SPECIAL_TAGS = ['script', 'style'];

	ShowMore.init = function (options) {
		var defaults = {
			target: '',
			numOfWords: 50,
			showMoretext: 'Show more',
			ellipsisText: ' ...',
			hiddenClass: 'hidden'
		};
		options = ShowMore.helpers.extends({}, defaults, options);

		var parse = function(html, handler) {
			var index, chars, match, stack = [], last = html;
			stack.last = function() {
				return this[this.length - 1];
			};
			while (html) {
				chars = true;
				if (!stack.last() || !SPECIAL_TAGS.includes(stack.last())) {
					if ( html.indexOf("<!--") == 0 ) {
						index = html.indexOf("-->");
						if ( index >= 0 ) {
							if (handler.comment) {
								handler.comment(html.substring(4, index));
							}
							html = html.substring(index + 3);
							chars = false;
						}
					} else if (html.indexOf("</") == 0) {
						match = html.match(endTag);
						if (match) {
							html = html.substring(match[0].length);
							match[0].replace(endTag, parseEndTag);
							chars = false;
						}
					} else if (html.indexOf("<") == 0) {
						match = html.match(startTag);
						if (match) {
							html = html.substring(match[0].length);
							match[0].replace(startTag, parseStartTag);
							chars = false;
						}
					}
					if ( chars ) {
						index = html.indexOf("<");
						var text = index < 0 ? html : html.substring(0, index);
						html = index < 0 ? "" : html.substring(index);
						if ( handler.chars ) {
							handler.chars( text );
						}
					}
				} else {
					html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
						text = text.replace(/<!--(.*?)-->/g, "$1")
							.replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
						if (handler.chars) {
							handler.chars( text );
						}
						return "";
					});
					parseEndTag("", stack.last());
				}
				if (html == last) {
					throw "Parse Error: " + html;
				}
				last = html;
			};

			parseEndTag();

			function parseStartTag(tag, tagName, rest, unary) {
				tagName = tagName.toLowerCase();
				if (BLOCK_TAGS.includes(tagName)) {
					while (stack.last() && INLINE_TAGS.includes( stack.last())) {
						parseEndTag( "", stack.last() );
					}
				}
				if (CLOSESELF_TAGS.includes(tagName) && stack.last() == tagName) {
					parseEndTag( "", tagName );
				}
				unary = EMPTY_TAGS.includes(tagName) || !!unary;
				if (!unary) {
					stack.push( tagName );
				}
				if (handler.start) {
					var attrs = [];
					rest.replace(attr, function(match, name) {
						var value = arguments[2] ? arguments[2] :
							arguments[3] ? arguments[3] :
							arguments[4] ? arguments[4] :
							FILL_ATTRS.includes(name) ? name : "";
						
						attrs.push({
							name: name,
							value: value,
							escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
						});
					});
					if (handler.start) {
						handler.start(tagName, attrs, unary);
					}
				}
			};

			function parseEndTag(tag, tagName) {
				if ( !tagName ) {
					var pos = 0;
				} else {
					for (var pos = stack.length - 1; pos >= 0; pos--) {
						if (stack[pos] == tagName) {
							break;
						}
					}
				}
				if (pos >= 0) {
					for (var i = stack.length - 1; i >= pos; i--) {
						if (handler.end) {
							handler.end(stack[i]);
						}
					}
					stack.length = pos;
				}
			}
		};

		var shrinkables = document.querySelectorAll(options.target);
		shrinkables.forEach(shrinkable => {
			var tagsStack = [];
			var truncated = "";
			var maxWords = options.numOfWords;
			var shrinked = false;

			parse(shrinkable.outerHTML, {
				start: function( tag, attrs, unary ) {
					var classFound = false;
					truncated += "<" + tag;
					for ( var i = 0; i < attrs.length; i++ ) {
						if (shrinked && attrs[i].name == 'class') {
							attrs[i].escaped += ' ' + options.hiddenClass;
							classFound = true;
						}
						truncated += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
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
							text += '<a class="show-more-link" href="#!"><em><strong>' + options.showMoretext + '</strong></em></a>';
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
				container.classList.add('d-inline-block');
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
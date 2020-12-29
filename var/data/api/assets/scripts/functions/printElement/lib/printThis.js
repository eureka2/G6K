/*
 * printThis v1.14.0
 * @desc Printing plug-in for jQuery
 * @author Jason Day
 *
 * Resources (based on):
 * - jPrintArea: http://plugins.jquery.com/project/jPrintArea
 * - jqPrint: https://github.com/permanenttourist/jquery.jqprint
 * - Ben Nadal: http://www.bennadel.com/blog/1591-Ask-Ben-Print-Part-Of-A-Web-Page-With-jQuery.htm
 *
 * Licensed under the MIT licence:
 *              http://www.opensource.org/licenses/mit-license.php
 *
 * (c) Jason Day 2015-2018
 *
 * Usage:
 *
 *  $("#mySelector").printThis({
 *      debug: false,                   // show the iframe for debugging
 *      importCSS: true,                // import parent page css
 *      importStyle: false,             // import style tags
 *      printContainer: true,           // grab outer container as well as the contents of the selector
 *      loadCSS: "path/to/my.css",      // path to additional css file - use an array [] for multiple
 *      pageTitle: "",                  // add title to print page
 *      removeInline: false,            // remove all inline styles from print elements
 *      removeInlineSelector: "body *", // custom selectors to filter inline styles. removeInline must be true
 *      printDelay: 333,                // variable print delay
 *      header: null,                   // prefix to html
 *      footer: null,                   // postfix to html
 *      base: false,                    // preserve the BASE tag, or accept a string for the URL
 *      formValues: true,               // preserve input/form values
 *      canvas: false,                  // copy canvas elements
 *      doctypeString: '...',           // enter a different doctype for older markup
 *      removeScripts: false,           // remove script tags from print content
 *      copyTagClasses: false           // copy classes from the html & body tag
 *      beforePrintEvent: null,         // callback function for printEvent in iframe
 *      beforePrint: null,              // function called before iframe is filled
 *      afterPrint: null                // function called before iframe is removed
 *  });
 *
 * Notes:
 *  - the loadCSS will load additional CSS (with or without @media print) into the iframe, adjusting layout
 */
;
(function(global) {

	function appendContent(el, content) {
		if (!content) return;

		if (typeof content == 'string') {
			var div = document.createElement('div');
			div.innerHTML = content;
			div.childNodes.forEach( node =>  el.appendChild(node) );
		} else {
			el.appendChild(content);
		}
	}

	function appendBody(body, element, opt) {
		// Clone for safety and convenience
		// Calls clone(withDataAndEvents = true) to copy form values.
		var content = element.cloneNode(opt.formValues);

		if (opt.formValues) {
			// Copy original select and textarea values to their cloned counterpart
			// Makes up for inability to clone select and textarea values with clone(true)
			copyValues(element, content, 'select, textarea');
		}

		if (opt.removeScripts) {
			var scripts = content.querySelectorAll('script');
			scripts.forEach(script => script.parentNode.removeChild(script));
		}

		if (opt.printContainer) {
			// grab $.selector as container
			body.appendChild(content);
		} else {
			// otherwise just print interior elements of container
			content.forEach(function(cont) {
				for (var child of cont.children) {
					body.appendChild(child);
				}
			});
		}
	}

	// Copies values from origin to clone for passed in elementSelector
	function copyValues(origin, clone, elementSelector) {
		var originalElements = origin.querySelectorAll(elementSelector);

		clone.querySelectorAll(elementSelector).forEach(function(item, index) {
			item.value = originalElements[index].value;
		});
	}

	var opt;
	var printThis = function(element, options) {
		opt = Utils.extend({}, printThis.DEFAULTS, options);

		var strFrameName = "printThis-" + (new Date()).getTime();

		if (window.location.hostname !== document.domain && navigator.userAgent.match(/msie/i)) {
			// Ugly IE hacks due to IE not inheriting document.domain from parent
			// checks if document.domain is set by comparing the host name against document.domain
			var iframeSrc = "javascript:document.write(\"<head><script>document.domain=\\\"" + document.domain + "\\\";</s" + "cript></head><body></body>\")";
			var printI = document.createElement('iframe');
			printI.name = "printIframe";
			printI.id = strFrameName;
			printI.className = "MSIE";
			document.body.appendChild(printI);
			printI.src = iframeSrc;

		} else {
			// other browsers inherit document.domain, and IE works if document.domain is not explicitly set
			var frame = document.createElement('iframe');
			frame.setAttribute('id', strFrameName);
			frame.setAttribute('name', 'printIframe');
			document.body.appendChild(frame);
		}

		var iframe = document.querySelector("#" + strFrameName);

		// show frame if in debug mode
		if (!opt.debug) {
			iframe.style.position = "absolute";
			iframe.style.width = "0px";
			iframe.style.height = "0px";
			iframe.style.left = "-600px";
			iframe.style.top = "-600px";
		}

		// before print callback
		if (typeof opt.beforePrint === "function") {
			opt.beforePrint();
		}

		// $iframe.ready() and $iframe.load were inconsistent between browsers
		setTimeout(function() {

			// Add doctype to fix the style difference between printing and render
			function setDocType(iframe, doctype){
				var win, doc;
				win = iframe.contentWindow || iframe.contentDocument || iframe;
				doc = win.document || win.contentDocument || win;
				doc.open();
				doc.write(doctype);
				doc.close();
			}

			if (opt.doctypeString){
				setDocType(iframe, opt.doctypeString);
			}

			var win = iframe.contentWindow || iframe.contentDocument || iframe,
				doc = win.document || win.contentDocument || win,
				head = doc.querySelector("head"),
				body = doc.querySelector("body"),
				base = document.querySelector('base'),
				baseURL;

			// add base tag to ensure elements use the parent domain
			if (opt.base === true && $base.length > 0) {
				// take the base tag from the original page
				baseURL = base.getAttribute('href');
			} else if (typeof opt.base === 'string') {
				// An exact base string is provided
				baseURL = opt.base;
			} else {
				// Use the page URL as the base
				baseURL = document.location.protocol + '//' + document.location.host;
			}

			var base = document.createElement('base');
			base.setAttribute('href', baseURL);
			head.appendChild(base);

			// import page stylesheets
			if (opt.importCSS) head.querySelector("link[rel='stylesheet']").forEach(function(link) {
				var href = link.getAttribute("href");
				if (href) {
					var media = link.getAttribute("media") || "all";
					var stylesheet = document.createElement('link');
					stylesheet.setAttribute('type', 'text/css');
					stylesheet.setAttribute('rel', 'stylesheet');
					stylesheet.setAttribute('href', href);
					stylesheet.setAttribute('media', media);
					head.appendChild(stylesheet);
				}
			});

			// import style tags
			if (opt.importStyle) {
				document.querySelectorAll("style").forEach(function(style) {
					head.appendChild(document.importNode(style, true));
				});
			}

			// add title of the page
			if (opt.pageTitle) {
				var title = document.createElement('title');
				title.innerHTML = opt.pageTitle;
				head.appendChild(title);
			}

			// import additional stylesheet(s)
			if (opt.loadCSS) {
				if (Array.isArray(opt.loadCSS)) {
					opt.loadCSS.forEach(function(value) {
						var stylesheet = document.createElement('link');
						stylesheet.setAttribute('type', 'text/css');
						stylesheet.setAttribute('rel', 'stylesheet');
						stylesheet.setAttribute('href', value);
						head.appendChild(stylesheet);
					});
				} else {
					var stylesheet = document.createElement('link');
					stylesheet.setAttribute('type', 'text/css');
					stylesheet.setAttribute('rel', 'stylesheet');
					stylesheet.setAttribute('href', opt.loadCSS);
					head.appendChild(stylesheet);
				}
			}

			var pageHtml = document.querySelector('html');

			// CSS VAR in html tag when dynamic apply e.g.  document.documentElement.style.setProperty("--foo", bar);
			doc.querySelector('html').style.cssText = pageHtml.style.cssText;

			// copy 'root' tag classes
			var tag = opt.copyTagClasses;
			if (tag) {
				tag = tag === true ? 'bh' : tag;
				if (tag.indexOf('b') !== -1) {
					body.className = document.body.className;
				}
				if (tag.indexOf('h') !== -1) {
					doc.querySelector('html').className = pageHtml.className;
				}
			}

			// print header
			appendContent(body, opt.header);

			if (opt.canvas) {
				// add canvas data-ids for easy access after cloning.
				var canvasId = 0;
				// .addBack('canvas') adds the top-level element if it is a canvas.
				element.querySelectorAll('canvas').forEach(function(cv){
					cv.setAttribute('data-printthis', canvasId++);
				});
			}

			appendBody(body, element, opt);

			if (opt.canvas) {
				// Re-draw new canvases by referencing the originals
				body.querySelectorAll('canvas').forEach(function(cv){
					var cid = cv.dataset.printthis,
						src = document.querySelector('[data-printthis="' + cid + '"]');

					cv.getContext('2d').drawImage(src, 0, 0);

					// Remove the markup from the original
					delete src.dataset.printthis;
				});
			}

			// remove inline styles
			if (opt.removeInline) {
				// Ensure there is a selector, even if it's been mistakenly removed
				var selector = opt.removeInlineSelector || '*';
				body.querySelectorAll(selector).forEach(sel => sel.removeAttribute("style"));
			}

			// print "footer"
			appendContent(body, opt.footer);

			// attach event handler function to beforePrint event
			function attachOnBeforePrintEvent(iframe, beforePrintHandler) {
				var win = iframe;
				win = win.contentWindow || win.contentDocument || win;

				if (typeof beforePrintHandler === "function") {
					if ('matchMedia' in win) {
						win.matchMedia('print').addListener(function(mql) {
							if (mql.matches)  beforePrintHandler();
						});
					} else {
						win.onbeforeprint = beforePrintHandler;
					}
				}
			}
			attachOnBeforePrintEvent(iframe, opt.beforePrintEvent);

			setTimeout(function() {
				if (iframe.classList.contains("MSIE")) {
					// check if the iframe was created with the ugly hack
					// and perform another ugly hack out of neccessity
					window.frames["printIframe"].focus();
					var script = document.createElement('script');
					script.innerHTML = 'window.print();';
					head.appendChild(script);
				} else {
					// proper method
					if (document.queryCommandSupported("print")) {
						iframe.contentWindow.document.execCommand("print", false, null);
					} else {
						iframe.contentWindow.focus();
						iframe.contentWindow.print();
					}
				}

				// remove iframe after print
				if (!opt.debug) {
					setTimeout(function() {
						iframe.parentNode.removeChild(iframe);
					}, 1000);
				}

				// after print callback
				if (typeof opt.afterPrint === "function") {
					opt.afterPrint();
				}

			}, opt.printDelay);

		}, 333);

	};

	// defaults
	printThis.DEFAULTS = {
		debug: false,               // show the iframe for debugging
		importCSS: true,            // import parent page css
		importStyle: false,         // import style tags
		printContainer: true,       // print outer container/$.selector
		loadCSS: "",                // path to additional css file - use an array [] for multiple
		pageTitle: "",              // add title to print page
		removeInline: false,        // remove inline styles from print elements
		removeInlineSelector: "*",  // custom selectors to filter inline styles. removeInline must be true
		printDelay: 333,            // variable print delay
		header: null,               // prefix to html
		footer: null,               // postfix to html
		base: false,                // preserve the BASE tag or accept a string for the URL
		formValues: true,           // preserve input/form values
		canvas: false,              // copy canvas content
		doctypeString: '<!DOCTYPE html>', // enter a different doctype for older markup
		removeScripts: false,       // remove script tags from print content
		copyTagClasses: false,      // copy classes from the html & body tag
		beforePrintEvent: null,     // callback function for printEvent in iframe
		beforePrint: null,          // function called before iframe is filled
		afterPrint: null            // function called before iframe is removed
	};

	global.printThis = printThis;
})(this);

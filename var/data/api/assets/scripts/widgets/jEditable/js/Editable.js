/*
 * Jeditable - jQuery in place edit plugin
 *
 * Copyright (c) 2006-2013 Mika Tuupola, Dylan Verheul
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/jeditable
 *
 * Based on editable by Dylan Verheul <dylan_at_dyve.net>:
 *	http://www.dyve.net/jquery/?editable
 *
 */

/**
  * Version 1.7.3
  *
  * ** means there is basic unit tests for this parameter. 
  *
  * @name  Jeditable
  * @type  jQuery
  * @param String  target			 (POST) URL or function to send edited content to **
  * @param Hash	options			additional options 
  * @param String  options[method]	method to use to send edited content (POST or PUT) **
  * @param Function options[callback] Function to run after submitting edited content **
  * @param String  options[name]	  POST parameter name of edited content
  * @param String  options[id]		POST parameter name of edited div id
  * @param Hash	options[submitdata] Extra parameters to send when submitting edited content.
  * @param String  options[type]	  text, textarea or select (or any 3rd party input type) **
  * @param Integer options[rows]	  number of rows if using textarea ** 
  * @param Integer options[cols]	  number of columns if using textarea **
  * @param Mixed   options[height]	'auto', 'none' or height in pixels **
  * @param Mixed   options[width]	 'auto', 'none' or width in pixels **
  * @param String  options[loadurl]   URL to fetch input content before editing **
  * @param String  options[loadtype]  Request type for load url. Should be GET or POST.
  * @param String  options[loadtext]  Text to display while loading external content.
  * @param Mixed   options[loaddata]  Extra parameters to pass when fetching content before editing.
  * @param Mixed   options[data]	  Or content given as paramameter. String or function.**
  * @param String  options[indicator] indicator html to show when saving
  * @param String  options[tooltip]   optional tooltip text via title attribute **
  * @param String  options[event]	 jQuery event such as 'click' of 'dblclick' **
  * @param String  options[submit]	submit button value, empty means no button **
  * @param String  options[cancel]	cancel button value, empty means no button **
  * @param String  options[cssclass]  CSS class to apply to input form. 'inherit' to copy from parent. **
  * @param String  options[style]	 Style to apply to input form 'inherit' to copy from parent. **
  * @param String  options[select]	true or false, when true text is highlighted ??
  * @param String  options[placeholder] Placeholder text or html to insert when element is empty. **
  * @param String  options[onblur]	'cancel', 'submit', 'ignore' or function ??
  *			 
  * @param Function options[onsubmit] function(settings, original) { ... } called before submit
  * @param Function options[onreset]  function(settings, original) { ... } called before reset
  * @param Function options[onerror]  function(settings, original, xhr) { ... } called on error
  *			 
  * @param Hash	options[ajaxoptions]  jQuery Ajax options. See docs.jquery.com.
  *			 
  */

(function (global) {
	'use strict';

	var extend = function(out) {
		out = out || {};
		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i]) continue;
			for (var key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key))
				out[key] = arguments[i][key];
			}
		}
		return out;
	};

	var Editable = function(elt, target, options) {

		if ('disable' == target) {
			elt.setAttribute('data-disabled.editable', true);
			return;
		}
		if ('enable' == target) {
			elt.setAttribute('data-disabled.editable', false);
			return;
		}
		if ('destroy' == target) {
			var eventEditable = elt.getAttribute('data-event.editable');
			if (eventEditable && Editable.handlers[eventEditable]) {
				var handlers = Editable.handlers[eventEditable];
				handlers.forEach( function(handler) {
					elt.removeEventListener(eventEditable, handler);
				}); 
			}
			elt.removeAttribute('data-disabled.editable');
			elt.removeAttribute('data-event.editable');
			return;
		}

		var settings = extend({}, Editable.DEFAULTS, {target:target}, options);

		/* setup some functions */
		var plugin   = Editable.editable.types[settings.type].plugin || function() { };
		var submit   = Editable.editable.types[settings.type].submit || function() { };
		var buttons  = Editable.editable.types[settings.type].buttons 
					|| Editable.editable.types['defaults'].buttons;
		var content  = Editable.editable.types[settings.type].content 
					|| Editable.editable.types['defaults'].content;
		var element  = Editable.editable.types[settings.type].element 
					|| Editable.editable.types['defaults'].element;
		var reset	= Editable.editable.types[settings.type].reset 
					|| Editable.editable.types['defaults'].reset;
		var callback = settings.callback || function() { };
		var onedit   = settings.onedit   || function() { }; 
		var onsubmit = settings.onsubmit || function() { };
		var onreset  = settings.onreset  || function() { };
		var onerror  = settings.onerror  || reset;
		  
		/* Show tooltip. */
		if (settings.tooltip) {
			elt.setAttribute('title', settings.tooltip);
		}

		settings.autowidth  = 'auto' == settings.width;
		settings.autoheight = 'auto' == settings.height;

		elt = elt.nodeName ? [ elt ] : Array.isArray(elt) ? elt : Array.from(elt); 
		return elt.forEach( function(self) {

			/* Inlined block elements lose their width and height after first edit. */
			/* Save them for later use as workaround. */
			var savedwidth  = parseFloat(getComputedStyle(self, null).width.replace("px", ""));
			var savedheight = parseFloat(getComputedStyle(self, null).height.replace("px", ""));

			/* Save so it can be later used by $.editable('destroy') */
			self.setAttribute('data-event.editable', settings.event);

			/* If element is empty add something clickable (if requested) */
			if (!self.innerHTML.trim()) {
				self.innerHTML = settings.placeholder;
			}

			if (/\./.test(settings.event)) {
				var parts = /^([^\.]+)\.?(.*)$/.exec(settings.event);
				var eventType = parts[1];
				var namespace = parts[2];
				var handler = function(e) {
					e.preventDefault();
					self.dispatchEvent(new Event(settings.event));
				};
				if (!Editable.handlers[settings.event]) {
					Editable.handlers[settings.event] = [];
				}
				Editable.handlers[settings.event].push(handler);
				self.addEventListener(eventType, handler, true);
			}
			self.addEventListener(settings.event, function(e) {

				/* Abort if element is disabled. */
				if (true === this.getAttribute('data-disabled.editable')) {
					return;
				}

				/* Prevent throwing an exeption if edit field is clicked again. */
				if (self.editing) {
					return;
				}

				/* Abort if onedit hook returns false. */
				if (false === onedit.apply(this, [settings, self])) {
				   return;
				}

				/* Prevent default action and bubbling. */
				e.preventDefault();
				e.stopPropagation();

				/* Remove tooltip. */
				if (settings.tooltip) {
					self.removeAttribute('title');
				}

				/* Figure out how wide and tall we are, saved width and height. */
				/* Workaround for http://dev.jquery.com/ticket/2190 */
				if (0 == parseFloat(getComputedStyle(self, null).width.replace("px", ""))) {
					settings.width  = savedwidth;
					settings.height = savedheight;
				} else {
					if (settings.width != 'none') {
						settings.width = 
							settings.autowidth ? parseFloat(getComputedStyle(self, null).width.replace("px", "")) : settings.width;
					}
					if (settings.height != 'none') {
						settings.height = 
							settings.autoheight ? parseFloat(getComputedStyle(self, null).height.replace("px", "")) : settings.height;
					}
				}

				/* Remove placeholder text, replace is here because of IE. */
				if (this.innerHTML.toLowerCase().replace(/(;|"|\/)/g, '') == 
					settings.placeholder.toLowerCase().replace(/(;|"|\/)/g, '')) {
						this.innerHTML = '';
				}

				self.editing = true;
				self.revert  = self.innerHTML;
				self.innerHTML = '';

				/* Create the form object. */
				var form = document.createElement('form');

				/* Apply css or style or both. */
				if (settings.cssclass) {
					if ('inherit' == settings.cssclass) {
						form.setAttribute('class', self.getAttribute('class'));
					} else {
						form.setAttribute('class', settings.cssclass);
					}
				}

				if (settings.style) {
					if ('inherit' == settings.style) {
						form.setAttribute('style', self.getAttribute('style') || 'display: inline-block;');
						/* IE needs the second line or display wont be inherited. */
						form.style.display = self.style.display;
					} else {
						form.setAttribute('style', settings.style);
					}
				}

				/* Add main input element to form and store it in input. */
				var input = element.apply(form, [settings, self]);

				/* Set input content via POST, GET, given data or existing value. */
				var input_content;

				if (settings.loadurl) {
					var t = setTimeout(function() {
						input.disabled = true;
						content.apply(form, [settings.loadtext, settings, self]);
					}, 100);

					var loaddata = {};
					loaddata[settings.id] = self.id;
					if (typeof settings.loaddata === 'function') {
						extend(loaddata, settings.loaddata.apply(self, [self.revert, settings]));
					} else {
						extend(loaddata, settings.loaddata);
					}
					ajax({
						method: settings.loadtype,
						url: settings.loadurl,
						data: loaddata,
						async: false,
					}).then(function( result, xhr, textStatus ) {
						window.clearTimeout(t);
						input_content = result;
						input.disabled = false;
					});
				} else if (settings.data) {
					input_content = settings.data;
					if (typeof settings.data === 'function') {
						input_content = settings.data.apply(self, [self.revert, settings]);
					}
				} else {
					input_content = self.revert; 
				}
				content.apply(form, [input_content, settings, self]);

				input.setAttribute('name', settings.name);

				/* Add buttons to the form. */
				buttons.apply(form, [settings, self]);
		 
				/* Add created form to self. */
				self.appendChild(form);
		 
				/* Attach 3rd party plugin if requested. */
				plugin.apply(form, [settings, self]);

				/* Focus to first visible form element. */
				var inputs = form.querySelectorAll("input:enabled:not([type='hidden']), texarea:enabled, select:enabled, button:enabled");
				for (var inp of inputs) {
					if (window.getComputedStyle(inp).display !== "none" && inp.offsetWidth > 0 && inp.offsetHeight > 0) {
						inp.focus();
						break;
					}
				}

				/* Highlight input contents when requested. */
				if (settings.select) {
					input.select();
				}

				/* discard changes if pressing esc */
				input.addEventListener('keydown', function(e) {
					if (e.keyCode == 27) {
						e.preventDefault();
						reset.apply(form, [settings, self]);
					}
				});

				/* Discard, submit or nothing with changes when clicking outside. */
				/* Do nothing is usable when navigating with tab. */
				var t;
				if ('cancel' == settings.onblur) {
					input.addEventListener('blur', function(e) {
						/* Prevent canceling if submit was clicked. */
						t = setTimeout(function() {
							reset.apply(form, [settings, self]);
						}, 500);
					});
				} else if ('submit' == settings.onblur) {
					input.addEventListener('blur', function(e) {
						/* Prevent double submit if submit was clicked. */
						t = setTimeout(function() {
							if (form.dispatchEvent(new Event('submit', {'cancelable': true}))) {
								form.submit();
							}
						}, 200);
					});
				} else if (typeof settings.onblur === 'function') {
					input.addEventListener('blur', function(e) {
						settings.onblur.apply(self, [input.value, settings]);
					});
				} else {
					input.addEventListener('blur', function(e) {
					});
				}

				form.addEventListener('submit', function(e) {

					if (t) { 
						clearTimeout(t);
					}

					/* Do no submit. */
					e.preventDefault(); 

					/* Call before submit hook. */
					/* If it returns false abort submitting. */
					if (false !== onsubmit.apply(form, [settings, self])) { 
						/* Custom inputs call before submit hook. */
						/* If it returns false abort submitting. */
						if (false !== submit.apply(form, [settings, self])) { 

							/* Check if given target is function */
							if (typeof settings.target === 'function') {
								var str = settings.target.apply(self, [input.value, settings]);
								self.innerHTML = str;
								self.editing = false;
								callback.apply(self, [self.innerHTML, settings]);
								if (!self.innerHTML.trim()) {
									self.innerHTML = settings.placeholder;
								}
							} else {
								/* Add edited content and id of edited element to POST. */
								var submitdata = {};
								submitdata[settings.name] = input.value;
								submitdata[settings.id] = self.id;
								/* Add extra data to be POST:ed. */
								if (typeof settings.submitdata == 'function') {
									extend(submitdata, settings.submitdata.apply(self, [self.revert, settings]));
								} else {
									extend(submitdata, settings.submitdata);
								}

								/* Quick and dirty PUT support. */
								if ('PUT' == settings.method) {
									submitdata['_method'] = 'put';
								}

								/* Show the saving indicator. */
								self.innerHTML = settings.indicator;

								/* Defaults for ajaxoptions. */
								var ajaxoptions = {
									method: 'post',
									data: submitdata,
									dataType: 'html',
									url: settings.target,
									success : function(result, status) {
										if (ajaxoptions.dataType == 'html') {
											self.innerHTML = result;
										}
										self.editing = false;
										callback.apply(self, [result, settings]);
										if (!self.innerHTML.trim()) {
											self.innerHTML = settings.placeholder;
										}
									},
									error: function(xhr, status, error) {
										onerror.apply(form, [settings, self, xhr]);
									}
								};

								/* Override with what is given in settings.ajaxoptions. */
								extend(ajaxoptions, settings.ajaxoptions);   
								ajax(
									ajaxoptions
								).then(function( data, xhr, textStatus ) {
									ajaxoptions.success(data, textStatus);
								}).catch(function(response, xhr, textStatus) {
									ajaxoptions.error(xhr, textStatus, response);
								});
							}
						}
					}

					/* Show tooltip again. */
					self.setAttribute('title', settings.tooltip);
					return false;
				});
			});

			/* Privileged methods */
			self.reset = function(form) {
				/* Prevent calling reset twice when blurring. */
				if (self.editing) {
					/* Before reset hook, if it returns false abort reseting. */
					if (false !== onreset.apply(form, [settings, self])) { 
						self.innerHTML = self.revert;
						self.editing   = false;
						if (!self.innerHTML.trim()) {
							self.innerHTML = settings.placeholder;
						}
						/* Show tooltip again. */
						if (settings.tooltip) {
							self.setAttribute('title', settings.tooltip);
						}
					}
				}
			};
		});

	};

	Editable.handlers = {};

	Editable.editable = {
		types: {
			defaults: {
				element : function(settings, original) {
					var input = document.createElement('input');
					input.type = 'hidden';
					this.appendChild(input);
					return input;
				},
				content : function(string, settings, original) {
					this.querySelector('input, select, textarea').value = string;
				},
				reset : function(settings, original) {
				  original.reset(this);
				},
				buttons : function(settings, original) {
					var form = this;
					if (settings.submit) {
						/* If given html string use that. */
						if (settings.submit.match(/>$/)) {
							var submit = document.createElement('div');
							submit.outerHTML = settings.submit;
							submit.addEventListener('click', function() {
								if (submit.getAttribute("type") != "submit") {
									if (form.dispatchEvent(new Event('submit', {'cancelable': true}))) {
										form.submit();
									}
								}
							});
						/* Otherwise use button with given string as text. */
						} else {
							var submit = document.createElement('button');
							submit.type = 'submit';
							submit.innerHTML = settings.submit;
						}
						this.appendChild(submit);
					}
					if (settings.cancel) {
						/* If given html string use that. */
						if (settings.cancel.match(/>$/)) {
							var cancel = document.createElement('div');
							cancel.outerHTML = settings.cancel;
						/* otherwise use button with given string as text */
						} else {
							var cancel = document.createElement('button');
							cancel.type = 'cancel';
							cancel.innerHTML = settings.cancel;
						}
						this.appendChild(cancel);

						cancel.addEventListener('click', function(event) {
							var reset;
							if (typeof Editable.editable.types[settings.type].reset == 'function') {
								reset = Editable.editable.types[settings.type].reset;
							} else {
								reset = Editable.editable.types['defaults'].reset;
							}
							reset.apply(form, [settings, original]);
							return false;
						});
					}
				}
			},
			text: {
				element : function(settings, original) {
					var input = document.createElement('input');
					if (settings.width  != 'none') {
						var width = typeof settings.width != 'string' ? settings.width + 'px' : settings.width;
						input.style.width = width;
					}
					if (settings.height != 'none') {
						var height = typeof settings.height != 'string' ? settings.height + 'px' : settings.height;
						input.style.height = height;
					}
					/* https://bugzilla.mozilla.org/show_bug.cgi?id=236791 */
					//input[0].setAttribute('autocomplete','off');
					input.setAttribute('autocomplete','off');
					this.appendChild(input);
					return input;
				}
			},
			textarea: {
				element : function(settings, original) {
					var textarea = document.createElement('textarea');
					if (settings.rows) {
						textarea.setAttribute('rows', settings.rows);
					} else if (settings.height != "none") {
						var height = typeof settings.height != 'string' ? settings.height + 'px' : settings.height;
						textarea.style.height = height;
					}
					if (settings.cols) {
						textarea.setAttribute('cols', settings.cols);
					} else if (settings.width != "none") {
						var width = typeof settings.width != 'string' ? settings.width + 'px' : settings.width;
						textarea.style.width = width;
					}
					this.appendChild(textarea);
					return textarea;
				}
			},
			select: {
				element : function(settings, original) {
					var select = document.createElement('select');
					this.appendChild(select);
					return select;
				},
				content : function(data, settings, original) {
					/* If it is string assume it is json. */
					if (String == data.constructor) {
						eval ('var json = ' + data);
					} else {
					/* Otherwise assume it is a hash already. */
						var json = data;
					}
					for (var key in json) {
						if (!json.hasOwnProperty(key)) {
							continue;
						}
						if ('selected' == key) {
							continue;
						} 
						var option = document.createElement('option');
						option.value = key;
						option.textContent = json[key];
						this.querySelector('select').appendChild(option);
					}
					/* Loop option again to set selected. IE needed this... */
					var children = this.querySelector('select').children;
					for (var child of children) {
						if (child.value == json['selected'] || 
							child.textContent == original.revert.trim()) {
								child.setAttribute('selected', 'selected');
						}
					}
					/* Submit on change if no submit button defined. */
					if (!settings.submit) {
						var form = this;
						this.querySelector('select').addEventListener('change', function() {
							if (form.dispatchEvent(new Event('submit', {'cancelable': true}))) {
								form.submit();
							}
						});
					}
				}
			}
		},

		/* Add new input type */
		addInputType: function(name, input) {
			Editable.editable.types[name] = input;
		}
	};

	/* Publicly accessible defaults. */
	Editable.DEFAULTS = {
		name       : 'value',
		id         : 'id',
		type       : 'text',
		width      : 'auto',
		height     : 'auto',
		event      : 'click.editable',
		onblur     : 'cancel',
		loadtype   : 'GET',
		loadtext   : 'Loading...',
		placeholder: 'Click to edit',
		loaddata   : {},
		submitdata : {},
		ajaxoptions: {}
	};

	global.Editable = Editable;

}(this));

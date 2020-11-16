(function (global) {
	'use strict';

	var defaults = {
		source: 0,
		minChars: 3,
		delay: 150,
		cache: 1,
		alignOnParent: false,
		menuId: 'autocomplete-suggestions',
		menuClass: '',
		helpText: '',
		clearButton: '',
		renderItem: function (item, search){
			// escape special characters
			search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
			var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
			return '<div data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
		},
		announce: function( count) {
		   switch (count) {
			   case 0:
				   return 'There is no suggestion';
			   case 1:
				   return 'There is one suggestion';
			   default:
				   return 'There are ' + count + ' suggestions, use up and down arrows to review.';
		   }
		},
		onSelect: function(event, term, item){},
		onClear: function() {},
		onInput: function(val) {},
		onTab: function() {}
	};

	var extend = function() {
		for (var o = {}, i = 0; i < arguments.length; i++) {
			for (var k in arguments[i]) {
				if (arguments[i].hasOwnProperty(k)) {
					o[k] = arguments[i][k].constructor === Object
						? extend(o[k] || {}, arguments[i][k])
						: arguments[i][k];
				}
			}
		}
		return o;
	};

	function autoComplete(input, options) {
		var self = this;
		this.input = input;
		this.input.classList.add('autocomplete-input');
		this.options = extend(defaults, options);

		this.input.dataStore = {};
		this.data = function(name, value) {
			if (value) {
				self.input.dataStore[name] = value;
			}
			return self.input.dataStore[name] || null;
		};
		
		this.input.attr = function(attrs) {
			for (var attr in attrs) {
				self.input.setAttribute(attr, attrs[attr]);
			}
		};

		// sc = 'suggestions container'
		this.input.sc = document.createElement('div');
		this.input.sc.setAttribute('id', this.options.menuId);
		this.input.sc.setAttribute('role', 'listbox');
		this.input.sc.classList.add('autocomplete-suggestions');
		this.input.attr({
			'role': 'combobox',
			'aria-owns': this.options.menuId,
			'aria-autocomplete': 'both',
			'autocorrect': 'off',
			'autocapitalize': 'off', 
			'spellcheck': 'false'
		});
		if (this.options.menuClass) {
			this.input.sc.classList.add(this.options.menuClass);
		} 
		var label = this.input.closest('label');
		if (label && label.id) {
			this.input.sc.setAttribute('aria-labelledby', label.id);
		}
		this.data('sc', this.input.sc);
		this.data('autocomplete', this.input.getAttribute('autocomplete'))
		this.data('suggestions', 0);
		this.input.setAttribute('autocomplete', 'off');
		this.input.cache = {};
		this.input.last_val = '';
		this.input.userInput = this.input.value;
		var announce = document.createElement('div');
		announce.setAttribute('id', this.options.menuId + '-announce');
		announce.setAttribute('aria-live', 'polite');
		announce.classList.add('sr-only');
		this.input.parentElement.insertBefore(announce, this.input);
		if (this.options.clearButton) {
			this.clearButton = document.createElement('button');
			this.clearButton.setAttribute('id', this.options.menuId + '-clear');
			this.clearButton.setAttribute('role', 'button');
			this.clearButton.setAttribute('aria-label', this.options.clearButton);
			this.clearButton.setAttribute('title', this.options.clearButton);
			this.clearButton.classList.add('autocomplete-input-clear-button');
			var iconclear = document.createElement('span');
			iconclear.classList.add('icon', 'icon-close');
			this.clearButton.append(iconclear);
			this.clearButton.style.display = 'none';
			this.clearButton.addEventListener('click', function(event) {
				event.preventDefault();
				self.options.onClear();
				self.clearSuggestions();
				this.style.display = 'none';
				return false;
			});
			var next = this.input.nextElementSibling;
			if (next !== null) {
				this.input.parentElement.appendChild(this.clearButton);
			} else {
				this.input.parentElement.insertBefore(this.clearButton, this.input.nextElementSibling);
			}
		}

		this.input.updateSC = function(resize, next){
			var positioner = self.options.alignOnParent ? self.input.parentElement : self.input; 
			self.input.sc.style.top = (positioner.offsetTop + positioner.offsetHeight) + 'px'; 
			self.input.sc.style.left = positioner.offsetLeft + 'px'; 
			self.input.sc.style.width = positioner.offsetWidth + 'px';  
			if (!resize) {
				self.input.sc.style.display = 'block';
				self.input.sc.removeAttribute('aria-hidden');
				if (next) {
					if (self.input.sc.scrollHeight > self.input.sc.clientHeight) {
						var scrollBottom = self.input.sc.clientHeight + self.input.sc.scrollTop;
						var elementBottom = next.offsetTop + next.offsetHeight;
						if (elementBottom > scrollBottom) {
							self.input.sc.scrollTop = elementBottom - self.input.sc.clientHeight;
						} else if (next.offsetTop < self.input.sc.scrollTop) {
							self.input.sc.scrollTop = next.offsetTop;
						}
					}
				}
			}
		}
		window.addEventListener('resize', this.input.updateSC);

		document.body.appendChild(this.input.sc);

		if (this.options.helpText) {
			var helpText = document.createElement('p');
			helpText.setAttribute('id', this.input.sc.getAttribute('id') + '-clear');
			helpText.classList.add('sr-only');
			helpText.appendChild(document.createTextNode(this.options.helpText));
			this.input.parentElement.insertBefore(helpText, this.input);
			this.input.setAttribute('aria-describedby', this.input.sc.getAttribute('id') + '-help');
			helpText.style.display = 'none';
		}

		var scSugestion =  this.input.sc;
		scSugestion.addEventListener('mouseleave', function (event) {
			if (event.target.classList.contains('autocomplete-suggestion')) {
				var selected = self.input.sc.querySelector(".autocomplete-suggestion[aria-selected='true']");
				if (selected !== null) {
					selected.removeAttribute('aria-selected');
				}
				self.input.removeAttribute('aria-activedescendant');
			}
		}, true);

		scSugestion.addEventListener('mouseenter', function (event) {
			if (event.target.classList.contains('autocomplete-suggestion')) {
				var selected = self.input.sc.querySelector(".autocomplete-suggestion[aria-selected='true']");
				if (selected !== null) {
					selected.removeAttribute('aria-selected');
				}
				event.target.setAttribute('aria-selected', 'true');
				self.input.setAttribute('aria-activedescendant', this.getAttribute('id'));
			}
		}, true);

		for (var mevent of ['mousedown', 'click']) {
			scSugestion.addEventListener(mevent, function (event) {
				if (event.target.classList.contains('autocomplete-suggestion')) {
					var item = event.target, v = item.dataset.val;
					if (v || item.classList.contains('autocomplete-suggestion')) {
						self.input.value = v;
						self.options.onSelect(event, v, item);
						updateAnnounce(self, '');
						setTimeout(function() {
							self.input.sc.style.display = 'none';
						}, 20);
						self.input.focus();
					}
					return false;
				}
			}, true);
		}

		function blur(event) {
			var over_sb;
			try {
				over_sb = document.querySelectorAll('.autocomplete-suggestions:hover').length;
			} 
			catch(e){
				over_sb = 0;
			}
			if (!over_sb) {
				self.input.last_val = self.input.value;
				self.input.sc.style.display = 'none';
				updateAnnounce(self, '');
				setTimeout(function() {
					self.input.sc.style.display = 'none';
				}, 350);
			} else if (self.input !== document.activeElement) {
				setTimeout(function(){
					self.input.focus();
				}, 20);
			}
		}
		this.input.addEventListener('blur', blur);

		function focus(event) {
			self.input.last_val = '\n';
			self.input.dispatchEvent(new Event('keyup'));
		}
		if (!this.options.minChars) {
			this.input.addEventListener('focus', focus);
		}

		function suggest(that, data){
			var val = that.input.value;
			that.input.userInput = that.input.value;
			that.input.cache[val] = data;
			that.data('suggestions', data.length);
			var newAnnounce = that.options.announce(data.length);
			if (data.length && val.length >= that.options.minChars) {
				that.input.sc.innerHTML = '';
				data.forEach( (d, i) => {
					var sugg = document.createElement('div');
					sugg.innerHTML = that.options.renderItem(d, val);
					sugg = sugg.firstChild;
					sugg.classList.add('autocomplete-suggestion');
					sugg.setAttribute('id', that.input.sc.getAttribute('id') + '-suggestion-' + (i + 1));
					sugg.setAttribute('role', 'option');
					sugg.setAttribute('tabindex', '-1');
					that.input.sc.appendChild(sugg);
				});
				that.input.updateSC(0);
				updateAnnounce(that, newAnnounce);
			} else {
				updateAnnounce(that, newAnnounce);
				if (data.length == 0) {
					that.input.sc.innerHTML = newAnnounce;
					that.input.updateSC(0);
				} else {
					that.input.sc.setAttribute('aria-hidden', true);
					that.input.sc.style.display = 'none';
				}
			}
		}

		function isVisible(obj) {
			if (! obj) {
				return false;
			}
			return window.getComputedStyle(obj).display !== "none"
				&& obj.offsetWidth > 0 
				&& obj.offsetHeight > 0;
		}

		function areSuggestionsVisible(that) {
			return that.input.sc.innerHTML &&
				isVisible(that.input.sc) &&
				that.data('suggestions') > 0;
		}

		function updateAnnounce(that, newAnnounce) {
			var oldAnnounce = document.querySelector('#' + that.options.menuId + '-announce p');
			oldAnnounce = oldAnnounce !== null ? oldAnnounce.innerText : '';
			if (oldAnnounce != newAnnounce) {
				setTimeout(function(){
					var announce = document.querySelector('#' + that.options.menuId + '-announce');
					if (announce !== null) {
						announce.innerHTML = '<p>' + newAnnounce + '</p>';
					}
				}, 20);
			}
		}

		function gotoSugg(that, sugg) {
			if (sugg !== null) {
				sugg.setAttribute('aria-selected', 'true');
				that.input.value = sugg.dataset.val; 
				that.input.setAttribute('aria-activedescendant', sugg.getAttribute('id'));
				that.input.updateSC(0, sugg);
			}
		}

		function selectSugg(that, event, sugg) {
			if (sugg !== null && isVisible(that.input.sc)) { 
				event.preventDefault();
				event.stopPropagation();
				that.options.onSelect(event, sugg.dataset.val, sugg); 
				setTimeout(function(){
					that.input.removeAttribute('aria-activedescendant');
					that.input.sc.innerHTML = '';
					that.input.sc.style.display = 'none'; 
					updateAnnounce(that, '');
				}, 20);
			}
		}

		function tabToThat(that, event) {
			event.preventDefault();
			event.stopPropagation();
			that.input.value = that.input.userInput;
			that.input.last_val = that.input.value;
			that.input.removeAttribute('aria-activedescendant');
			setTimeout(function(){ 
				that.input.sc.innerHTML = '';
				that.input.focus();
			}, 300);
		}

		function keydown(event) {
			var key = event.which || event.keyCode;
			if (key == 40 && areSuggestionsVisible(self)) { // down (40)
				var next, sel = self.input.sc.querySelector(".autocomplete-suggestion[aria-selected='true']");
				if (sel === null) {
					next = self.input.sc.querySelector('.autocomplete-suggestion');
					gotoSugg(self, next);
				} else {
					next = sel.nextElementSibling;
					while (next !== null && !next.classList.contains('autocomplete-suggestion')) {
						next = next.nextElementSibling;
					}
					sel.removeAttribute('aria-selected'); 
					if (next !== null) {
						gotoSugg(self, next);
					} else {
						next = self.input.sc.querySelector('.autocomplete-suggestion');
						gotoSugg(self, next);
					}
				}
				return false;
			} else if (key == 38 && areSuggestionsVisible(self)) { // up (38)
				var next, sel = self.input.sc.querySelector(".autocomplete-suggestion[aria-selected='true']");
				if (sel === null) {
					next = self.input.sc.querySelector('.autocomplete-suggestion:last-of-type');
					gotoSugg(self, next);
				} else {
					next = sel.previousElementSibling;
					while (next !== null && !next.classList.contains('autocomplete-suggestion')) {
						next = next.previousElementSibling;
					}
					sel.removeAttribute('aria-selected'); 
					if (next !== null) {
						gotoSugg(self, next);
					} else {
						next = self.input.sc.querySelector('.autocomplete-suggestion:last-of-type');
						gotoSugg(self, next);
					}
				}
				return false;
			} else if (key == 27) { // esc
				self.input.value = self.input.last_val;
				self.input.sc.style.display = 'none';
				updateAnnounce(self, '');
				self.input.focus();
			} else if (key == 13 || key == 32) { // enter or space
				var sel = self.input.sc.querySelector(".autocomplete-suggestion[aria-selected='true']");
				selectSugg(self, event, sel);
			} else if (key == 9) { // tab
				if (areSuggestionsVisible(self)) {
					if (event.shiftKey) { // up
						var next, sel = self.input.sc.querySelector(".autocomplete-suggestion[aria-selected='true']");
						if (sel === null) {
							next = self.input.sc.querySelector('.autocomplete-suggestion:last-of-type');
							gotoSugg(self, next);
							return false;
						} else {
							next = sel.previousElementSibling;
							while (next !== null && !next.classList.contains('autocomplete-suggestion')) {
								next = next.previousElementSibling;
							}
							sel.removeAttribute('aria-selected');
							if (next !== null) {
								gotoSugg(self, next);
								return false;
							} else {
								tabToThat(self, event);
							}
						}
					} else { // down
						var next, sel = self.input.sc.querySelector(".autocomplete-suggestion[aria-selected='true']");
						if (sel === null) {
							next = self.input.sc.querySelector('.autocomplete-suggestion');
							gotoSugg(self, next);
							return false;
						} else {
							next = sel.nextElementSibling;
							while (next !== null && !next.classList.contains('autocomplete-suggestion')) {
								next = next.nextElementSibling;
							}
							sel.removeAttribute('aria-selected');
							if (next !== null) {
								gotoSugg(self, next);
								return false;
							} else {
								tabToThat(self, event);
							}
						}
					}
				} else {
					if (! event.shiftKey) {
						if (! self.options.clearButton) {
							setTimeout(function(){ 
								self.input.sc.innerHTML = ''
								self.options.onTab();
							}, 300);
						}
					}
				}
			} else if (key == 8 || key == 46) { // del or backspace
				self.input.sc.innerHTML = '';
				updateAnnounce(self, '');
				setTimeout(function() { 
					if (self.input.value == '') {
						self.options.onClear();
						self.clearButton.style.display = 'none';
					} else {
						self.options.onInput(self.input.value);
					}
				}, 40);
			} else {
				if (self.input.value !== '') {
					self.clearButton.style.display = 'inline-block';
				}
				setTimeout(function() {
					self.options.onInput(self.input.value);
				}, 40);
			}
		}
		this.input.addEventListener('keydown', keydown);

		function keyup(event) {
			var key = event.which || event.keyCode;
			if ([9, 13, 16, 27, 32, 35, 36, 37, 38, 39, 40].indexOf(key) < 0) {
				var val = self.input.value;
				if (val.length >= self.options.minChars) {
					if (val != self.input.last_val) {
						self.input.last_val = val;
						clearTimeout(self.input.timer);
						if (self.options.cache) {
							if (val in self.input.cache) {
								suggest(self, self.input.cache[val]);
								return;
							}
							// no requests if previous suggestions were empty
							for (var i =1 ; i < val.length - self.options.minChars; i++) {
								var part = val.slice(0, val.length - i);
								if (part in self.input.cache && !self.input.cache[part].length) {
									suggest(self, []);
									return;
								}
							}
						}
						self.input.timer = setTimeout(function() {
							self.options.source(val, suggest) 
						}, self.options.delay);
					}
				} else {
					self.input.last_val = val;
					self.input.sc.style.display = 'none';
				}
			}
		}
		this.input.addEventListener('keyup', keyup);

	}

	// public methods
	autoComplete.prototype.destroy = function() {
		window.removeEventListener('resize', this.input.updateSC);
		this.input.removeEventListener('blur', blur);
		if (!this.options.minChars) {
			this.input.removeEventListener('focus', focus);
		}
		this.input.removeEventListener('keydown', keydown);
		this.input.removeEventListener('keyup', keyup);
		if (this.data('autocomplete')) {
			this.input.setAttribute('autocomplete', this.data('autocomplete'));
		} else {
			this.input.removeAttribute('autocomplete');
		}
		this.data('sc').parentElement.removeChild(this.data('sc'));
		delete this.input.dataStore['sc'];
		delete this.input.dataStore['autocomplete'];
	}

	autoComplete.prototype.clearSuggestions = function() {
		this.input.value = '';
		this.input.last_val = '\n';
	};

	global.autoComplete = autoComplete;

}(this));

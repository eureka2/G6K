/*
The MIT License (MIT)

Copyright (c) 2018 Jacques Archimède

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

if (typeof jQuery === 'undefined') {
	throw new Error('Choices.js requires jQuery library.');
}

(function (global, jQuery) {
	'use strict';

	function Choices(options) {
		this.options = $.extend(true, {}, Choices.DEFAULTS, options || {})

		var self = this;

		var id = self.options.classes.choices + '-' + (new Date()).getTime();
		this.container = jQuery('<div>', {
			'class': self.options.classes.container
		});
		this.button = jQuery('<button >', {
			'class': self.options.classes.button,
			'aria-haspopup': 'listbox',
			'aria-controls': id
		});
		this.button.append(jQuery('<span>', {
			'class': self.options.classes.buttonText
		}));
		this.button.append(jQuery('<span>', {
			'class': "float-right " + self.options.classes.buttonIcon
		}));
		this.choices = jQuery('<ul>', {
			'id': id, 'class': self.options.classes.choices,
			'role': 'listbox',
			'aria-expanded': 'false',
			'tabindex': '-1'
		});

		if (this.options.source) {
			if (this.options.source.is('select')) {
				this.options.source.children().each(function(index) {
					if (this.tagName == 'OPTGROUP') {
						self.addItemGroup($(this).attr('label'));
						$(this).find('option').each(function(index) {
							populateWithOption(self, $(this));
						});
					} else {
						populateWithOption(self, $(this));
					}
				});
				this.options.source.hide();
			}
		}

		this.container.append(this.button);
		this.container.append(this.choices);

		this.button.on('mousedown', function(e) {
			if (self.choices.is(':visible')) {
				self.closeList();
			} else {
				self.openList();
			}
			e.stopPropagation();
		});

		this.container.on('keydown', function(e) {
			var selected = self.choices.find('li[aria-selected]');
			if (selected.length == 0) {
				selected = self.choices.find('li[role=option]').first();
			}
			var key = e.keyCode || e.which || e.key;
			switch (key) {
				case 13: // enter
					e.preventDefault();
					e.stopPropagation();
					if (self.choices.is(':visible')) {
						self.val(selected.attr(self.options.attributes.value));
						self.hide();
						self.options.onChoose && self.options.onChoose(self, selected);
					}
					break;
				case 27: // Escape
					e.preventDefault();
					e.stopPropagation();
					if (self.choices.is(':visible')) {
						self.closeList();
					}
					break;
				case 32: // Espace
					e.preventDefault();
					if (! self.choices.is(':visible')) {
						self.openList();
					}
					break;
				case 35: // end
					e.preventDefault();
					self.select(self.choices.find('li[role=option]').last());
					break;
				case 36: // home
					e.preventDefault();
					self.select(self.choices.find('li[role=option]').first());
					break;
				case 38: // arrow up
					e.preventDefault();
					var prev = selected.prev();
					if (prev.hasClass(self.options.classes.itemGroup)) {
						prev = prev.prev();
					}
					if (prev.length == 0) {
						prev = self.choices.find('li[role=option]').last();
					}
					self.select(prev);
					break;
				case 40: // arrow down
					e.preventDefault();
					var next = selected.next();
					if (next.hasClass(self.options.classes.itemGroup)) {
						next = next.next();
					}
					if (next.length == 0) {
						next = self.choices.find('li[role=option]').first();
					}
					self.select(next);
					break;
			}
		}).on('blur', function(e) {
			if (self.choices.is(':visible')) {
				self.closeList();
			}
		}).on('focus', function(e) {
			self.button.focus();
		});

		$(document).on('click', function(e) {
			var parent = $(e.target).parents('.' + self.options.classes.container);
			if (e.target !== self.container[0] && (parent.length == 0 || parent[0] !== self.container[0])) {
				setTimeout(function() {
					self.container.trigger('blur');
				}, 0);
			}
		});

		$(window).on('scroll', function(e) {
			setTimeout(function() {
				self.container.trigger('blur');
			}, 0);
		});
	}


	Choices.VERSION  = '1.0.0'

	Choices.DEFAULTS = {
		source: null,
		onChoose: function(choices, item) { console.log('choosen'); },
		attributes: {
			type: 'item-type',
			value: 'item-value'
		},
		classes: {
			container: 'choices-container',
			button: 'choices-button',
			buttonText: 'choice-text',
			buttonIcon: 'fas fa-angle-down',
			choices: 'choices',
			itemGroup: 'choices-group'
		}
	}

	Choices.prototype.get = function () {
		return this.container;
	}

	Choices.prototype.destroy = function () {
		this.container.remove();
	}

	Choices.prototype.addItemGroup = function(label) {
		this.choices.append('<li aria-hidden="true" tabindex="-1" class="' + this.options.classes.itemGroup + '"><span>' + label + '</span></li>');
	}

	Choices.prototype.addItem = function(value, label, type) {
		var id = this.choices.attr('id') + '-' + (this.choices.find('li[role=option]').length + 1)
		var item = $('<li>', { 'id': id, 'role': 'option', 'tabindex': '-1', 'text': label });
		if (typeof type !== 'undefined'){
			item.attr(this.options.attributes.type, type);
		}
		item.attr(this.options.attributes.value, value);
		this.choices.append(item);
		var self = this;
		item.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			self.val(jQuery(this).attr(self.options.attributes.value));
			self.hide();
			self.options.onChoose && self.options.onChoose(self, jQuery(this));
		});
		return item;
	}

	Choices.prototype.hide = function() {
		this.closeList();
		this.container.hide();
	}

	Choices.prototype.show = function() {
		this.container.show();
		if (this.choices.is(':visible')) {
			var selected = this.container.find('li[aria-selected]');
			if (selected.length > 0) {
				this.scrollTo(selected);
			}
			this.container.focus();
		} else {
			this.button.focus();
		}
	}

	Choices.prototype.focus = function() {
		if (this.choices.is(':visible')) {
			this.container.focus();
		} else {
			this.button.focus();
		}
	}

	Choices.prototype.width = function() {
		return this.container.width();
	}

	Choices.prototype.outerWidth = function(margin) {
		margin = typeof margin == 'undefined' ? false : margin;
		return this.container.outerWidth(margin);
	}

	Choices.prototype.getList = function () {
		return this.choices;
	}

	Choices.prototype.openList = function () {
		this.choices.fadeIn().attr('aria-expanded', 'true');
		var listHeight = this.choices.outerHeight();
		var buttonTop = this.button.offset().top;
		var buttonHeight = this.button.outerHeight(true);
		var roomBefore = Math.floor(buttonTop - $(window).scrollTop());
		var roomAfter = Math.floor($(window).height() - (buttonTop + buttonHeight - $(window).scrollTop()));
		if (roomAfter < listHeight && roomAfter < roomBefore) {
			this.choices.css('top', (-listHeight + 1) + 'px'); // show list above group
		} else {
			this.choices.css('top', (buttonHeight) + 'px');  // show list below group
		}
		var selected = this.choices.find('li[aria-selected]');
		if (selected.length == 0) {
			selected = this.choices.find('li[role=option]').first();
		}
		this.select(selected);
	}

	Choices.prototype.closeList = function () {
		this.choices.fadeOut().attr('aria-expanded', 'false');
		this.button.focus();
	}

	Choices.prototype.select = function(item) {
		if (typeof item === 'string') {
			item = this.choices.find("li[" + this.options.attributes.value + "='" + item + "']");
		}
		this.choices.find('li[aria-selected]').removeAttr('aria-selected');
		item.attr('aria-selected', 'true');
		this.choices.attr('aria-activedescendant', item.attr('id'));
		this.button.find('.' + this.options.classes.buttonText).text(item.text());
		this.scrollTo(item);
	}

	Choices.prototype.scrollTo = function(item) {
		if (this.choices[0].scrollHeight > this.choices[0].clientHeight) {
			var scrollBottom = this.choices[0].clientHeight + this.choices[0].scrollTop;
			var elementBottom = item[0].offsetTop + item[0].offsetHeight;
			if (elementBottom > scrollBottom) {
				this.choices[0].scrollTop = elementBottom - this.choices[0].clientHeight;
			}
			else if (item[0].offsetTop < this.choices[0].scrollTop) {
				this.choices[0].scrollTop = item[0].offsetTop;
			}
		}
	}

	Choices.prototype.val = function(value) {
		if (typeof value == 'undefined') {
			return this.choices.find('li[aria-selected]').attr(this.options.attributes.value);
		} else {
			this.choices.find('li[aria-selected]').removeAttr('aria-selected');
			var item = this.choices.find("li[" + this.options.attributes.value + "='" + value + "']");
			item.attr('aria-selected', 'true');
			this.choices.attr('aria-activedescendant', item.attr('id'));
			this.button.find('.' + this.options.classes.buttonText).text(item.text());
		}
	}

	// private functions
	var populateWithOption = function(self, option) {
		var value = option.is('[value]') ? option.attr('value') : 
			option.is('[' + self.options.attributes.value + ']') ? 
			option.attr(self.options.attributes.value) : 
			option.text();
		var type = self.options.attributes.type && option.is('[' + self.options.attributes.type + ']') ?
			option.attr(self.options.attributes.type) :
			undefined;
		var item = self.addItem(value, option.text(), type);
		if (option.is('[selected]')) {
			self.select(item);
		}
	}

	global.Choices = Choices;
}(this, jQuery));

(function($) {
	'use strict';

	$.editable.addInputType('choices', {
		element : function(settings, original) {
			var input = $('<input>', { 'type': 'text', 'style': 'display: none;', 'aria-hidden': 'true' });
			$(this).append(input);
			settings.chosen = false;
			return(input);
		},
		submit: function(settings, original) {
			if (!settings.chosen) {
				return false;
			}
			settings.chosen = false;
			return true;
		},
		content : function(data, settings, original) {

			var form = this;
			var choices = new Choices({
				onChoose: function (choices, item) {
					var chosen = item.attr('field-name');
					$('input', form).val(chosen);
					settings.chosen = true;
					if (!settings.submit) {
						form.submit();
					}
				}, 
				attributes: {
					type: 'field-type',
					value: 'field-name'
				},
				classes: {
					container: 'field-choices-container',
					button: 'field-choices-button',
					buttonText: 'field-choice',
					buttonIcon: 'fas fa-angle-down',
					choices: 'field-choices',
					itemGroup: 'field-choices-group'
				}
			});
			if (String == data.constructor) {
				eval ('var json = ' + data);
			} else {
				var json = data;
			}
			var labels = [];
			$.each(json, function(value, label) {
				labels.push({label: label, value: value});
			});
			labels.sort(function (a, b) {
				return a.label.localeCompare(b.label);
			});
			$.each(labels, function(i, item) {
				if ('selected' != item.value) {
					choices.addItem(item.value, item.label, 'field');
				}
			});
			choices.select(json['selected']);
			$('input', this).before(choices.get());
		}
	});

})(jQuery);

/*
	jQuery autoComplete v1.0.7
	Copyright (c) 2014 Simon Steinberger / Pixabay
	GitHub: https://github.com/Pixabay/jQuery-autoComplete
	License: http://www.opensource.org/licenses/mit-license.php
*/

(function($){
	$.fn.autoComplete = function(options){
		var o = $.extend({}, $.fn.autoComplete.defaults, options);

		// public methods
		if (typeof options == 'string') {
			this.each(function(){
				var that = $(this);
				if (options == 'destroy') {
					$(window).off('resize.autocomplete', that.updateSC);
					that.off('blur.autocomplete focus.autocomplete keydown.autocomplete keyup.autocomplete');
					if (that.data('autocomplete')) {
						that.attr('autocomplete', that.data('autocomplete'));
					} else {
						that.removeAttr('autocomplete');
					}
					$(that.data('sc')).remove();
					that.removeData('sc').removeData('autocomplete');
				} else if (options == 'clearSuggestions') {
					that.val('');
					that.last_val = '\n';
					// setTimeout(function(){ that.focus(); }, o.delay + 360); // should we go back to the input field ?
				}
			});
			return this;
		}

		return this.each(function(){
			var that = $(this);
			// sc = 'suggestions container'
			that.sc = $('<div>', { id: o.menuId, role: 'listbox', class: 'autocomplete-suggestions' }); // modified by Eureka2
			that.attr({
				'role': 'combobox',
				'aria-owns': o.menuId,
				'aria-autocomplete': 'both',
				'autocorrect': 'off',
				'autocapitalize': 'off', 
				'spellcheck': 'false'
			});
			if (o.menuClass) {
				that.sc.addClass(o.menuClass);
			} // added by Eureka2
			that.data('sc', that.sc).data('autocomplete', that.attr('autocomplete')).data('suggestions', 0);
			that.attr('autocomplete', 'off');
			that.cache = {};
			that.last_val = '';
			that.userInput = that.val();
			var announce = $('<div>', { id: o.menuId + '-announce', 'class': 'sr-only', 'aria-live': 'polite'} );
			that.before(announce);

			if (o.clearButton) {
				var clearButton = $('<button>', { id: o.menuId + '-clear', class: "autocomplete-input-clear-button", role: "button", 'aria-label': o.clearButton, title: o.clearButton });
				clearButton.append('<span class="glyphicon glyphicon-remove"></span></a>');
				clearButton.on('click', function(e) {
					e.preventDefault();
					o.onClear();
					that.autoComplete('clearSuggestions');
					return false;
				});
				that.after(clearButton);
			}

			that.updateSC = function(resize, next){
				var positioner = o.alignOnParent ? that.parent() : that; // added by Eureka2
				that.sc.css({
					top:  positioner.offset().top + positioner.outerHeight(),
					left: positioner.offset().left,
					width: positioner.outerWidth()
				});
				if (!resize) {
					that.sc.show();
					that.sc.removeAttr('aria-hidden');
					if (!that.sc.maxHeight) that.sc.maxHeight = parseInt(that.sc.css('max-height'));
					if (!that.sc.suggestionHeight) that.sc.suggestionHeight = $('.autocomplete-suggestion', that.sc).first().outerHeight();
					if (that.sc.suggestionHeight)
						if (!next) that.sc.scrollTop(0);
						else {
							var scrTop = that.sc.scrollTop(), selTop = next.offset().top - that.sc.offset().top;
							if (selTop + that.sc.suggestionHeight - that.sc.maxHeight > 0)
								that.sc.scrollTop(selTop + that.sc.suggestionHeight + scrTop - that.sc.maxHeight);
							else if (selTop < 0)
								that.sc.scrollTop(selTop + scrTop);
						}
				}
			}
			$(window).on('resize.autocomplete', that.updateSC);

			that.sc.appendTo('body');

			if (o.helpText) {
				var helpText = $('<p>', { id: that.sc.attr('id') + '-help', class: 'sr-only', text: o.helpText }); // added by Eureka2
				that.before(helpText);
				that.attr('aria-describedby', that.sc.attr('id') + '-help');
				helpText.hide();
			}

			that.sc.on('mouseleave', '.autocomplete-suggestion', function (){
				$('.autocomplete-suggestion.selected').removeClass('selected');
				that.removeAttr('aria-activedescendant');
			});

			that.sc.on('mouseenter', '.autocomplete-suggestion', function (){
				$('.autocomplete-suggestion.selected').removeClass('selected');
				$(this).addClass('selected');
				that.attr('aria-activedescendant', $(this).attr('id'));
			});

			that.sc.on('mousedown click', '.autocomplete-suggestion', function (e){
				var item = $(this), v = item.data('val');
				if (v || item.hasClass('autocomplete-suggestion')) {
					that.val(v);
					o.onSelect(e, v, item);
					updateAnnounce('');
					setTimeout(function(){ that.sc.hide(); }, 20);
					that.focus();
				}
				return false;
			});

			that.on('blur.autocomplete', function(){
				try { over_sb = $('.autocomplete-suggestions:hover').length; } catch(e){ over_sb = 0; }
				if (!over_sb) {
					that.last_val = that.val();
					that.sc.hide();
					updateAnnounce('');
					setTimeout(function(){ that.sc.hide(); }, 350);
				} else if (!that.is(':focus')) setTimeout(function(){ that.focus(); }, 20);
			});

			if (!o.minChars) that.on('focus.autocomplete', function(){ that.last_val = '\n'; that.trigger('keyup.autocomplete'); });

			function suggest(data){
				var val = that.val();
				that.userInput = that.val();
				that.cache[val] = data;
				that.data('suggestions', data.length);
				var newAnnounce = o.announce(data.length);
				if (data.length && val.length >= o.minChars) {
					that.sc.empty();
					for (var i = 0; i < data.length; i++) {
						var sugg = $(o.renderItem(data[i], val));
						sugg.attr({
							 'id': that.sc.attr('id') + '-suggestion-' + (i + 1),
							 'role': 'option',
							 'tabindex': '-1'
						});
						that.sc.append(sugg);
					}
					that.updateSC(0);
					updateAnnounce(newAnnounce);
				} else {
					updateAnnounce(newAnnounce);
					if (data.length == 0) {
						that.sc.html(newAnnounce);
						that.updateSC(0);
					} else {
						that.sc.attr('aria-hidden', true);
						that.sc.hide();
					}
				}
			}

			function suggestionsVisible() {
				return that.sc.html() &&
					that.sc.is(':visible') &&
					that.data('suggestions') > 0;
			}

			function updateAnnounce(newAnnounce) {
				var oldAnnounce = $('#' + o.menuId + '-announce').find('p').text();
				if (oldAnnounce != newAnnounce) {
					setTimeout(function(){
						$('#' + o.menuId + '-announce').html('<p>' + newAnnounce + '</p>');
					}, 20);
				}
			}

			function gotoSugg(sugg) {
				if (sugg.length) {
					sugg.addClass('selected');
					that.val(sugg.data('val')); 
					that.attr('aria-activedescendant', sugg.attr('id'));
					that.updateSC(0, sugg);
				}
			}

			function selectSugg(e, sugg) {
				if (sugg.length && that.sc.is(':visible')) { 
					e.preventDefault();
					e.stopPropagation();
					o.onSelect(e, sugg.data('val'), sugg); 
					setTimeout(function(){
						that.removeAttr('aria-activedescendant');
						that.sc.empty();
						that.sc.hide(); 
						updateAnnounce('');
					}, 20);
				}
			}

			function tabToThat(e) {
				e.preventDefault();
				e.stopPropagation();
				that.val(that.userInput);
				that.last_val = that.val();
				that.removeAttr('aria-activedescendant');
				setTimeout(function(){ 
					that.sc.empty();
					that.focus();
				}, 300);
			}

			that.on('keydown.autocomplete', function(e){
				if (e.which == 40 && suggestionsVisible()) { // down (40)
					var next, sel = $('.autocomplete-suggestion.selected', that.sc);
					if (!sel.length) {
						next = $('.autocomplete-suggestion', that.sc).first();
						gotoSugg(next);
					} else {
						next = sel.next('.autocomplete-suggestion');
						sel.removeClass('selected'); 
						if (next.length) {
							gotoSugg(next);
						} else {
							next = $('.autocomplete-suggestion', that.sc).first();
							gotoSugg(next);
						}
					}
					return false;
				} else if (e.which == 38 && suggestionsVisible()) { // up (38)
					var next, sel = $('.autocomplete-suggestion.selected', that.sc);
					if (!sel.length) {
						next = $('.autocomplete-suggestion', that.sc).last();
						gotoSugg(next);
					} else {
						next = sel.prev('.autocomplete-suggestion');
						sel.removeClass('selected'); 
						if (next.length) {
							gotoSugg(next);
						} else {
							next = $('.autocomplete-suggestion', that.sc).last();
							gotoSugg(next);
						}
					}
					return false;
				} else if (e.which == 27) { // esc
					that.val(that.last_val).sc.hide();
					updateAnnounce('');
					that.focus();
				} else if (e.which == 13 || e.which == 32) { // enter or space
					var sel = $('.autocomplete-suggestion.selected', that.sc);
					selectSugg(e, sel);
				} else if (e.which == 9) { // tab
					if (suggestionsVisible()) {
						if (e.shiftKey) { // up
							var next, sel = $('.autocomplete-suggestion.selected', that.sc);
							if (!sel.length) {
								next = $('.autocomplete-suggestion', that.sc).last();
								gotoSugg(next);
								return false;
							} else {
								next = sel.prev('.autocomplete-suggestion');
								sel.removeClass('selected'); 
								if (next.length) {
									gotoSugg(next);
									return false;
								} else {
									tabToThat(e);
								}
							}
						} else { // down
							var next, sel = $('.autocomplete-suggestion.selected', that.sc);
							if (!sel.length) {
								next = $('.autocomplete-suggestion', that.sc).first();
								gotoSugg(next);
								return false;
							} else {
								next = sel.next('.autocomplete-suggestion');
								sel.removeClass('selected'); 
								if (next.length) {
									gotoSugg(next);
									return false;
								} else {
									tabToThat(e);
								}
							}
						}
					} else {
						if (! e.shiftKey) {
							if (! o.clearButton) {
								setTimeout(function(){ 
									that.sc.empty();
									o.onTab();
								}, 300);
							}
						}
					}
				} else if (e.which == 8 || e.which == 46) { // del or backspace
					that.sc.empty();
					updateAnnounce('');
					setTimeout(function(){ 
						if (that.val() == '') {
							o.onClear();
						} else {
							o.onInput(that.val());
						}
					}, 20);
				} else {
					setTimeout(function(){ o.onInput(that.val()); }, 20);
				}
			});

			that.on('keyup.autocomplete', function(e){
				if (!~$.inArray(e.which, [9, 13, 16, 27, 32, 35, 36, 37, 38, 39, 40])) {
					var val = that.val();
					if (val.length >= o.minChars) {
						if (val != that.last_val) {
							that.last_val = val;
							clearTimeout(that.timer);
							if (o.cache) {
								if (val in that.cache) { suggest(that.cache[val]); return; }
								// no requests if previous suggestions were empty
								for (var i=1; i<val.length-o.minChars; i++) {
									var part = val.slice(0, val.length-i);
									if (part in that.cache && !that.cache[part].length) { suggest([]); return; }
								}
							}
							that.timer = setTimeout(function(){ o.source(val, suggest) }, o.delay);
						}
					} else {
						that.last_val = val;
						that.sc.hide();
					}
				}
			});
		});
	}

	$.fn.autoComplete.defaults = {
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
			return '<div class="autocomplete-suggestion" data-val="' + item + '">' + item.replace(re, "<b>$1</b>") + '</div>';
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
		onSelect: function(e, term, item){},
		onClear: function() {},
		onInput: function(val) {},
		onTab: function() {}
	};

}(jQuery));

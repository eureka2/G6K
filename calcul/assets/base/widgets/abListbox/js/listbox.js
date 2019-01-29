/*!
 * Accessible Listbox v1.0.0 
 * Copyright 2015 Eureka2, Jacques Archimède.
 * Based on the example of the Open AJAX Alliance Accessibility Tools Task Force : http://oaa-accessibility.org/example/9/
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

 (function(factory){
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
		if (typeof jQuery === 'undefined') {
			throw new Error('Listbox\'s JavaScript requires jQuery')
		}
        factory(jQuery);
    }
}(function ($) {
	'use strict';

	var listboxContainer = [
		'<div class="listbox form-group" tabindex="0">',
		'	<div id="combobox-COMBOBOXID" class="input-group" role="combobox">',
		'		<div id="listbox-edit-COMBOBOXID" class="form-control" aria-autocomplete="none" aria-readonly="true" tabindex="-1">',
		'			<span class="listbox-edit" aria-live="assertive"> </span>',
		'		</div>',
		'		<a class="listbox-button input-group-addon" role="button" aria-haspopup="true" aria-controls="listbox-items-COMBOBOXID" tabindex="-1">',
		'			<span class="glyphicon glyphicon-menu-down" title="Ouvrir ou fermer la liste"></span>',
		'		</a>',
		'	</div>',
		'	<ul class="listbox-items" id="listbox-items-COMBOBOXID" tabindex="-1" aria-expanded="true" role="listbox">',
		'	</ul>',
		'	<input class="listbox-input" type="text" id="COMBOBOXID" name="" value="" aria-hidden="true" />',
		'</div>'
	];
	//
	// keyCodes() is an object to contain keycodes needed for the application
	//
	function keyCodes() {
		// Define values for keycodes
		this.backspace  = 8;
		this.tab        = 9;
		this.enter      = 13;
		this.esc        = 27;

		this.space      = 32;
		this.pageup     = 33;
		this.pagedown   = 34;
		this.end        = 35;
		this.home       = 36;

		this.up         = 38;
		this.down       = 40; 

		this.del        = 46;

	} // end keyCodes

	/** 
	 *	Function Listbox() is a class for an ARIA-enabled listbox widget
	 *
	 *	@param (target string) target is the HTML select.
	 *
	 *	@param (options array) array of options.
	 *
	 *	@return N/A
	 *
	 */
	function Listbox(target, options) {
		var self = this;
		var $target = $(target);  // The jQuery object of the select containing the listbox
		this.options = $.extend({}, Listbox.DEFAULTS, options)
		this.id = $target.attr('id') || 'listbox-' + Math.floor(Math.random() * 100000);
		this.size = $target.attr('size') || this.options.size;
		var listbox = listboxContainer.join("");
		listbox = listbox.replace(/COMBOBOXID/g, this.id + '');
		this.$listbox = $(listbox);
		$.each( $target[0].attributes, function( i, attr ) {
			if ($.inArray(attr.name, ["id", "name", "class", "style", "value", "tabindex", "required", "aria-controls"]) < 0) {
				self.$listbox.attr(attr.name, attr.value);
			}
        }); 
		this.$listbox.css('position', 'relative');
		this.hideObject(this.$listbox.find('input'));
		this.$label = $target.parents().find("label[for=" + this.id + "]");
		this.$label.attr('for', 'combobox-' + this.id)
		if (! this.$listbox.attr('aria-label') && this.$label.length && this.$label.attr('id')) {
			this.$listbox.attr('aria-labelledby', this.$label.attr('id')); 
		}
		if ($target.attr('required')) {
			this.$listbox.attr('aria-required', true); 
		}
		this.$listbox.attr('aria-controls', this.id); 
		this.$listbox.attr('aria-label', $target.attr('aria-label'));
		this.$listbox.addClass(this.options.theme);
		this.keys = new keyCodes();

		// Store jQuery objects for the elements of the listbox
		this.$edit = this.$listbox.find('.listbox-edit');  // The jQuery object of the edit box
		this.$button = this.$listbox.find('.listbox-button');  // The jQuery object of the button
		this.$list = this.$listbox.find('.listbox-items');  // The jQuery object of the option list
		var $options = $target.find('option');
		var hasSelected  = false;
		$target.children().each(function(index) {
			if (this.tagName == 'OPTGROUP') {
				var $li = $('<li class="listbox-itemgroup" tabindex="-1">' + $(this).attr('label') + '</li>');
				self.$list.append($li);
				$li.attr('id', 'itemgroup' + self.id + '-' + self.$list.children().length);
				$li.css('width', $(this).css('width'));
				$(this).find('option').each(function(index) {
					hasSelected = self.populateList($(this), true) || hasSelected;
				});
			} else {
				hasSelected = self.populateList($(this), false) || hasSelected;
			}
		});
		this.$items = this.$list.find('li.listbox-item');  // An array of jQuery objects for the listbox options
		if (!hasSelected) {
			this.$items.eq(0).addClass('selected');
			this.$items.eq(0).attr('aria-selected', true);
		}
		this.$group = this.$listbox.find('.input-group');
		this.$input = this.$listbox.find('input');
		this.$input.attr('name', $target.attr('name'));
		if ($target.parent('.input-group').length == 0) {
			$target.replaceWith(this.$listbox);
		} else {
			var $inputGroup = $target.parent('.input-group').eq(0);
			if ($inputGroup.parent('.form-group').length > 0) {
				this.$listbox.removeClass('form-group');
			}
			$inputGroup.replaceWith(this.$listbox);
		}
		this.$input.data('alb.listbox', this);
		// if (this.$items.length > this.size) {
			// this.$list.height(this.$items.eq(0).outerHeight(true) * this.size);
			// this.$list.css('overflow-y', 'scroll');
		// }
		// $( window ).resize(function() {
			// self.$list.width(self.$group.outerWidth());
		// });
		this.$initial; // the initial value of the listbox
		this.$selected; // the current value of the listbox
		this.$focused; // the currently selected option in the combo list
		this.timer = null; // stores the close list timer that is set when combo looses focus

		this.timer = null;
		this.keybuff = [];

		// Initalize the listbox
		this.init();

		// bind event handlers for the widget
		this.bindHandlers();

	} // end Listbox constructor


	Listbox.VERSION  = '1.0.0'

	Listbox.DEFAULTS = {
		size: 10,
		theme: 'default',
		onSelected: function (value, text) {
			
		}
	}

	/** 
	 *	Function init() is a member function to initialize the listbox elements. Hides the list
	 *	and sets ARIA attributes
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.init = function() {

		// Hide the list of options
		this.hideObject(this.$list);
		this.$list.attr('aria-expanded', 'false');
		// Set initial value for the edit box
		this.$selected = this.$initial = this.$items.filter('.selected');
		this.$list.attr('aria-activedescendant', this.$selected.attr('id'));
		if (this.$selected.length > 0) {
			this.$edit.text(this.$selected.text());
			this.$input.attr('value', this.$selected.attr('data-value'));
			this.$input.trigger('change');
		}

	} // end init()

	/** 
	 *	Function populateList() is a member function to populate the listbox items form the select box. 
	 *	@return true if the item is selected, false otherwise 
	 *
	 */
	Listbox.prototype.populateList = function($option, nested) {
		var self = this;
		var selected  = false;
		var value = $option.is('[value]') ? $option.attr('value') : $option.text();
		var nestedClass = nested ? " listbox-item-nested" : "";
		var $li = $('<li role="option" class="listbox-item' + nestedClass + '" tabindex="-1" data-value="' + value + '">' + $option.text() + '</li>');
		if ($option.attr('selected')) {
			$li.addClass('selected');
			$li.attr('aria-selected', true);
			selected  = true;
		}
		self.$list.append($li);
		$li.attr('id', 'item' + self.id + '-' + self.$list.children().length);
		$li.css('width', $option.css('width'));
		return selected;
	} // end populateList()

	/** 
	 *	bindEditboxHandlers() is a member function to bind event handlers for the edit box 
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.bindEditboxHandlers = function() {
		var self = this;
		this.$listbox.keydown(function(e) {
			return self.handleEditKeyDown($(this), e);
		});
		this.$listbox.keypress(function(e) {
			return self.handleEditKeyPress($(this), e);
		});
		this.$listbox.blur(function(e) {
			self.$edit.css('outline', 0);
			return self.handleListBlur($(this), e);
		});
		this.$listbox.focus(function(e) {
			self.$edit.css('outline', 'thin dotted');
			return false;
		});
		$("label[for=combobox-"+this.id+"]").click(function (e) {
			self.$listbox.focus();
		});
	} // end bindEditboxHandlers()

	/** 
	 *	bindButtonHandlers() is a member function to bind event handlers for the edit box 
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.bindButtonHandlers = function() {
		var self = this;
		this.$group.click(function(e) {
			return self.handleButtonClick($(this), e);
		});
		this.$group.mouseover(function(e) {
			return self.handleButtonMouseOver($(this), e);
		});
		this.$group.mouseout(function(e) {
			return self.handleButtonMouseOut($(this), e);
		});
		this.$group.mousedown(function(e) {
			return self.handleButtonMouseDown($(this), e);
		});
		this.$group.mouseup(function(e) {
			return self.handleButtonMouseUp($(this), e);
		});
	} // end bindButtonHandlers()

	/** 
	 *	bindListboxHandlers() is a member function to bind event handlers for the listbox itself
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.bindListboxHandlers = function() {
		var self = this;
		this.$list.focus(function(e) {
			return self.handleListFocus($(this), e);
		});
		this.$list.blur(function(e) {
			return self.handleListBlur($(this), e);
		});
	} // end bindListboxHandlers()

	/** 
	 *	bindOptionsHandlers() is a member function to bind event handlers for the list option
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.bindOptionsHandlers = function() {
		var self = this;
		this.$items.keydown(function(e) {
			return self.handleOptionKeyDown($(this), e);
		});
		this.$items.keypress(function(e) {
			return self.handleOptionKeyPress($(this), e);
		});
		this.$items.click(function(e) {
			return self.handleOptionClick($(this), e);
		});
		this.$items.focus(function(e) {
			return self.handleListFocus($(this), e);
		});
		this.$items.blur(function(e) {
			return self.handleListBlur($(this), e);
		});
	} // end bindOptionsHandlers()



	/** 
	 *	bindHandlers() is a member function to bind event handlers for the button
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.bindHandlers = function() {
		///////////////// bind editbox handlers /////////////////////////
		this.bindEditboxHandlers();

		///////////////// bind handlers for the button /////////////////////////
		this.bindButtonHandlers();

		///////////////// bind listbox handlers /////////////////////////
		this.bindListboxHandlers();

		///////////////// bind list option handlers /////////////////////////
		this.bindOptionsHandlers();
	} // end bindHandlers()

	/** 
	 *	isOpen() is a member function to get the current state of the list box
	 *
	 *	@return (boolean) returns true if list box is open; false if it is not
	 *
	 */
	Listbox.prototype.isOpen = function() {
		if (this.$list.attr('aria-expanded') == 'true') {
			return true;
		}
		else {
			return false;
		}
	} // end isOpen

	/** 
	 *	closeList() is a member function to close the list box if it is open
	 *
	 *	@param (restore booleam) restore is true if function should restore higlight to stored list selection
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.closeList = function(restore) {
		var $curOption = this.$items.filter('.selected');
		if (restore == true) {
			$curOption = this.$selected;

			// remove the selected class from the other list items
			this.$items.removeClass('selected');
			this.$items.removeAttr('aria-selected');

			// add selected class to the stored selection
			$curOption.addClass('selected');
			$curOption.attr('aria-selected', true);
		}
		this.$list.fadeOut().attr('aria-expanded', 'false');

		// set focus on the listbox box
		this.$listbox.focus();

	} // end closeList()

	/** 
	 *	openList() is a member function to open the list box if it is closed
	 *
	 *	@param (restore booleam) restore is true if function should restore higlight to stored list selection
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.openList = function(restore) {
		var $curOption = this.$items.filter('.selected');
		if (restore == true) {
			if (this.$selected.length == 0) {
				// select the first item
				this.selectOption(this.$items.first());
			}
			$curOption = this.$selected;
			// remove the selected class from the other list items
			this.$items.removeClass('selected');
			this.$items.removeAttr('aria-selected');
			// add selected class to the stored selection
			$curOption.addClass('selected');
			$curOption.attr('aria-selected', true);
		}

		// adjust the width of the list of items
		if (parseInt(this.$items.css('width'), 10) > parseInt(this.$group.css('width'), 10)) {
			this.$list.css('width', this.$items.css('width'));
		} else {
			this.$list.css('width', this.$group.css('width'));
			this.$items.css('width', this.$group.css('width'));
		}

		// adjust position of the list of items
		var listHeight = this.$list.outerHeight();
		var groupTop = this.$group.offset().top;
		var groupHeight = this.$group.outerHeight(true);
		var roomBefore = Math.floor(groupTop - $(window).scrollTop());
		var roomAfter = Math.floor($(window).height() - (groupTop + groupHeight - $(window).scrollTop()));
		if (roomAfter < listHeight && roomAfter < roomBefore) {
			this.$list.css('top', (- listHeight) + 'px'); // show list above group
		} else {
			this.$list.css('top', (groupHeight) + 'px');  // show list below group
		}
		this.$list.fadeIn().attr('aria-expanded', 'true');

		// scroll to the currently selected option
		this.$list.scrollTop(this.calcOffset($curOption));

		// set focus on the selected item
		this.$selected.focus();

	} // end openList();

	/** 
	 *	toggleList() is a member function to toggle the display of the listbox options.
	 *
	 *	@param (restore booleam) restore is true if toggle should restore higlight to stored list selection
	 *
	 *	Return N/A
	 *
	 */
	Listbox.prototype.toggleList = function(restore) {
		if (this.isOpen() == true) {
			this.closeList(restore);
		}
		else {
			this.openList(restore);
		}
	} // end toggleList()

	/** 
	 *	selectOption() is a member function to select a new listbox option.
	 *	The jQuery object for the new option is stored and the selected class is added
	 *
	 *	@param ($id object) $id is the jQuery object of the new option to select
	 *
	 *	@return N/A
	 *
	 */
	Listbox.prototype.selectOption = function($id) {
		// If there is a selected option, remove the selected class from it
		if (this.$selected.length > 0) {
			this.$selected.removeClass('selected');
			this.$selected.removeAttr('aria-selected');
		}

		// add the selected class to the new option
		$id.addClass('selected');
		$id.attr('aria-selected', true);

		// store the newly selected option
		this.$selected = $id;
		this.$list.attr('aria-activedescendant', this.$selected.attr('id'));

		// update the edit box
		this.$edit.text($id.text());
		this.$input.attr('value', $id.attr('data-value'));
		this.$input.trigger('change');
		this.options.onSelected($id.attr('data-value'), $id.text());
	} // end selectOption

	/** 
	 *	searchOption() is a member function to search the option whose text starts with the given keys.
	 *
	 *	@param (fromOption int) fromOption is the starting option 
	 *
	 *	@return The jQuery object for the matched option or null
	 *
	 */
	Listbox.prototype.searchOption = function(fromOption) {
		var search = this.keybuff.join("");
		this.keybuff = [];
		var $found = null;
		if (search !== "") {
			for (var i = fromOption + 1; i < this.$items.length; i++) {
				var $next = this.$items.eq(i);
				if (this.latinise($next.text()).toLocaleLowerCase().lastIndexOf(search, 0) === 0) {
					$found = $next;
					break;
				}
			}
			if ($found == null) {
				for (var i = 0; i < fromOption; i++) {
					var $next = this.$items.eq(i);
					if (this.latinise($next.text()).toLocaleLowerCase().lastIndexOf(search, 0) === 0) {
						$found = $next;
						break;
					}
				}
			}
		}
		return $found;
	} // end searchOption

	/** 
	 *	latinise() is a member function to replace all accented characters in a string.
	 *
	 *	@param (txt string) accented string
	 *
	 *	@return The unaccented string
	 *
	 */
	Listbox.prototype.latinise = function(txt) {
		var latin_map={"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};
		return txt.replace(/[^A-Za-z0-9\[\] ]/g,function(a){return latin_map[a]||a});
	}

	/** 
	 *	calcOffset() is a member function to calculate the pixel offset of a list option from the top
	 *	of the list
	 *
	 *	@param ($id obj) $id is the jQuery object of the option to scroll to
	 *
	 *	@return (integer) returns the pixel offset of the option
	 */
	Listbox.prototype.calcOffset = function($id) {
		var offset = 0;
		var selectedNdx = this.$items.index($id);
		for (var ndx = 0; ndx < selectedNdx; ndx++) {
			offset += this.$items.eq(ndx).outerHeight();
		}
		return offset;

	} // end calcOffset

	/** 
	 *	handleButtonClick() is a member function to consume button click events. This handler prevents
	 *	clicks on the button from reloading the page. This could also be done by adding 'onclick="false";' to the
	 *	button HTML markup.
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean)  returns false;
	 *
	 */
	Listbox.prototype.handleButtonClick = function($id,  e) {
		e.stopPropagation();
		return false;
	} // end handleButtonClick();

	/** 
	 *	handleButtonMouseOver() is a member function to process button mouseover events
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@return (boolean)  returns false;
	 *
	 */
	Listbox.prototype.handleButtonMouseOver = function($id,  e) {
		e.stopPropagation();
		return false;
	} // end handleButtonMouseOver();

	/** 
	 *	handleButtonMouseOut() is a member function to process button mouseout events
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean)  returns false;
	 *
	 */
	Listbox.prototype.handleButtonMouseOut = function($id,  e) {
		e.stopPropagation();
		return false;
	} // end handleButtonMouseOut();

	/** 
	 *	handleButtonMouseDown() is a member function to process button mousedown events
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean)  returns false;
	 *
	 */
	Listbox.prototype.handleButtonMouseDown = function($id,  e) {
		// toggle the display of the option list
		this.toggleList(true);
		e.stopPropagation();
		return false;

	} // end handleButtonMouseDown();

	/** 
	 *	handleButtonMouseUp() is a member function to process button mouseup events
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean)  returns false;
	 *
	 */
	Listbox.prototype.handleButtonMouseUp = function($id,  e) {
		e.stopPropagation();
		return false;
	} // end handleButtonMouseUp();

	/** 
	 *	handleOptionKeyDown() is a member function to process keydown events for
	 *	the listbox
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean) Returns false if consuming; true if not processing
	 *
	 */
	Listbox.prototype.handleOptionKeyDown = function($id,  e) {
		clearTimeout (this.timer);
		var curNdx = this.$items.index($id);
		if (e.ctrlKey) {
			// do not process
			return true;
		}
		switch(e.keyCode) {
			case this.keys.tab: {
				// update and close the listbox
				if ($id.text() != this.$selected.text()) {
					// store the new selection
					this.selectOption($id);
				}
				// Close the option list
				this.closeList(false);
				// allow tab to propagate
				return true;
			}
			case this.keys.esc: {
				// Do not change listbox value
				// Close the option list
				this.closeList(true);
				e.stopPropagation();
				return false;
			}
			case this.keys.enter:
			case this.keys.space: {
				// change the listbox value
				if ($id.text() != this.$selected.text()) {
					// store the new selection
					this.selectOption($id);
				}
				// Close the option list
				this.closeList(false);
				e.stopPropagation();
				return false;
			}
			case this.keys.up: {
				if (e.altKey) {
					// alt+up toggles the list
					this.toggleList(true);
				}
				else {
					// move to the previous item in the list
					if (curNdx > 0) {
						var $prev = this.$items.eq(curNdx - 1);

						// remove the selected class from the current selection
						$id.removeClass('selected');
						$id.removeAttr('aria-selected');

						// Add the selected class to the new selection
						$prev.addClass('selected');
						$prev.attr('aria-selected', true);

						// scroll the list window to the new option
						this.$list.scrollTop(this.calcOffset($prev));

						// Set focus on the new item
						$prev.focus();
					}
				}
				e.stopPropagation();
				return false;
			}
			case this.keys.down: {
				if (e.altKey) {
					// alt+up toggles the list
					this.toggleList(true);
				}
				else {
					// move to the next item in the list
					if (curNdx < this.$items.length - 1) {
						var $next = this.$items.eq(curNdx + 1);

						// remove the selected from the current selection
						$id.removeClass('selected');
						$id.removeAttr('aria-selected');

						// Add the selected class to the new selection
						$next.addClass('selected');
						$next.attr('aria-selected', true);

						// scroll the list window to the new option
						this.$list.scrollTop(this.calcOffset($next));

						// Set focus on the new item
						$next.focus();
					}
				}
				e.stopPropagation();
				return false;
			}
			case this.keys.home: {
				// select the first list item
				var $first = this.$items.first();

				// remove the selected class from the current selection
				this.$items.eq(curNdx).removeClass('selected');
				this.$items.eq(curNdx).removeAttr('aria-selected');

				// Add the selected class to the new selection
				$first.addClass('selected');
				$first.attr('aria-selected', true);

				// scroll the list window to the new option
				this.$list.scrollTop(0);

				// set focus on the first item
				$first.focus();

				e.stopPropagation();
				return false;
			}
			case this.keys.end: {
				// select the last list item
				var $last = this.$items.last();

				// remove the selected class from the current selection
				this.$items.eq(curNdx).removeClass('selected');
				this.$items.eq(curNdx).removeAttr('aria-selected');

				// Add the selected class to the new selection
				$last.addClass('selected');
				$last.attr('aria-selected', true);

				// scroll the list window to the new option
				this.$list.scrollTop(this.calcOffset($last));

				// set focus on last item
				$last.focus();
				e.stopPropagation();
				return false;
			}
			default: {
				var self = this;
				self.timer = setTimeout (function() {
					var $found = self.searchOption(curNdx);
					if ($found != null) {
						self.selectOption($found);
						e.stopPropagation();
						return false;
					}
				}, 1000);
				var charCode = e.which >= 96 && e.which <= 105 ? e.which - 48 : e.which;
				var c = String.fromCharCode(charCode).toLocaleLowerCase();
				self.keybuff.push(c);
			}
		}
		return true;

	} // end handleOptionKeyDown()

	/** 
	 *	handleOptionKeyPress() is a member function to process keypress events for
	 *	the listbox. Needed for browsers that use keypress to manipulate the window
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean) Returns false if consuming; true if not processing
	 *
	 */
	Listbox.prototype.handleOptionKeyPress = function($id,  e) {
		var curNdx = this.$items.index($id);
		if (e.altKey || e.ctrlKey || e.shiftKey) {
			// do not process
			return true;
		}
		switch(e.keyCode) {
			case this.keys.esc:
			case this.keys.enter:
			case this.keys.space:
			case this.keys.up:
			case this.keys.down:
			case this.keys.home:
			case this.keys.end: {
				e.stopPropagation();
				return false;
			}
		}
		return true;
	} // end handleOptionKeyPress()

	/** 
	 *	handleEditKeyDown() is a member function to process keydown events for
	 *	the edit box.
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@return (boolean) Returns false if consuming; true if not processing
	 *
	 */
	Listbox.prototype.handleEditKeyDown = function($id,  e) {
		var curNdx = this.$items.index(this.$selected);
		if (e.altKey && (e.keyCode == this.keys.up || e.keyCode == this.keys.down)) {
			this.toggleList(true);
			e.stopPropagation();
			return false;
		}
		switch (e.keyCode) {
			case this.keys.backspace:
			case this.keys.del: {
				this.$edit.text(this.$selected.text());
				this.$input.attr('value', this.$selected.attr('data-value'));
				this.$input.trigger('change');
				e.stopPropagation();
				return false;
			}
			case this.keys.enter:
			case this.keys.space: {
				// toggle the option list
				this.toggleList(false);
				e.stopPropagation();
				return false;
			}
			case this.keys.up: {
				// move to the previous item in the list
				if (curNdx > 0) {
					var $prev = this.$items.eq(curNdx - 1);
					this.selectOption($prev);
				}
				e.stopPropagation();
				return false;
			}
			case this.keys.down: {
				// move to the next item in the list
				if (curNdx < this.$items.length - 1) {
					var $next = this.$items.eq(curNdx + 1);
					this.selectOption($next);
				}
				e.stopPropagation();
				return false;
			}
			default: {
				var self = this;
				self.timer = setTimeout (function() {
					var $found = self.searchOption(curNdx);
					if ($found != null) {
						self.selectOption($found);
						e.stopPropagation();
						return false;
					}
				}, 600);
				var charCode = e.which >= 96 && e.which <= 105 ? e.which - 48 : e.which;
				var c = String.fromCharCode(charCode).toLocaleLowerCase();
				self.keybuff.push(c);
			}
		}
		return true;

	} // end handleEditKeyDown()

	/** 
	 *	handleEditKeyPress() is a member function to process keypress events for
	 *	the edit box. Needed for browsers that use keypress events to manipulate the window.
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean) Returns false if consuming; true if not processing
	 *
	 */
	Listbox.prototype.handleEditKeyPress = function($id,  e) {
		var curNdx = this.$items.index($id);
		if (e.altKey && (e.keyCode == this.keys.up || e.keyCode == this.keys.down)) {
			e.stopPropagation();
			return false;
		}
		switch(e.keyCode) {
			case this.keys.esc:
			case this.keys.space:
			case this.keys.enter: {
				e.stopPropagation();
				return false;
			}
		}
		return true;

	} // end handleOptionKeyPress()

	/** 
	 *	handleOptionClick() is a member function to process click events for
	 *	the listbox.
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean) Returns false
	 *
	 */
	Listbox.prototype.handleOptionClick = function($id, e) {
		// select the clicked item
		this.selectOption($id);
		// close the list
		this.closeList(false);
		e.stopPropagation();
		return false;
	} // end handleOptionClick()

	/** 
	 *	handleListFocus() is a member function to process focus events for
	 *	the list box
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean) Returns true
	 *
	 */
	Listbox.prototype.handleListFocus = function($id,  e) {
		if (this.timer != null) {
			window.clearTimeout(this.timer);
			this.timer = null;
		}
		return true;

	} // end handleListFocus()

	/** 
	 *	handleListBlur() is a member function to process blur events for
	 *	the listbox
	 *
	 *	@param (e object) e is the event object associated with the event
	 *
	 *	@param ($id object) $id is the jQuery object for the element firing the event
	 *
	 *	@return (boolean) Returns true
	 *
	 */
	Listbox.prototype.handleListBlur = function($id,  e) {
		var self = this;
		// store the currently selected value
		this.selectOption(this.$items.filter('.selected'));
		// close the list box
		if (this.isOpen() == true) {
			this.timer = window.setTimeout(function() {
				self.closeList(false);
			}, 40);
		}
		return true;
	} // end handleListBlur()

	/** 
	 *	hideObject() is a member function to hide an element of the listbox. 
	 *
	 *	@param ($element jQuery object) the element to hide
	 *	@return N/A
	 */
	Listbox.prototype.hideObject = function($element) {
		$element.attr('aria-hidden', true);
		$element.hide();
	} // end hideObject()

	/** 
	 *	showObject() is a member function to show an element of the listbox. 
	 *
	 *	@param ($element jQuery object) the element to show
	 *	@return N/A
	 */
	Listbox.prototype.showObject = function($element) {
		$element.attr('aria-hidden', false);
		$element.show();
	} // end showObject()

	/** 
	 *	theme() is a public member function which allow change the listbox theme. 
	 *
	 *	@param (value string) the new theme
	 *	@return the listbox theme
	 */
	Listbox.prototype.theme = function(value) {
		if (value != null) {
			this.$listbox.removeClass(this.options.theme);
			this.options.theme = value;
			this.$listbox.addClass(this.options.theme);
		}
		return this.options.theme;
	} // end theme()

	/** 
	 *	size() is a public member function which allow change the listbox size. 
	 *
	 *	@param (value string) the new size
	 *	@return the listbox size
	 */
	Listbox.prototype.size = function(value) {
		if (value != null) {
			this.options.size = parseInt(value, 10);
		}
		return this.options.size;
	} // end size()


	/** 
	 *	reset() is a public member function which allow setting the list box to its initial state. 
	 *
	 *	@return the initial value
	 *
	 */
	Listbox.prototype.reset = function() {
		// If there is a selected option, remove the selected class from it
		if (this.$selected.length > 0) {
			this.$selected.removeClass('selected');
			this.$selected.removeAttr('aria-selected');
		}

		// add the selected class to the initial option
		this.$initial.addClass('selected');
		this.$initial.attr('aria-selected', true);

		// store the newly selected option
		this.$selected = this.$initial;

		// update the edit box
		this.$edit.text(this.$initial.text());
		this.$input.attr('value', this.$initial.attr('data-value'));
		return this.$initial.attr('data-value');
	} // end reset



	/** 
	 *	update() is a public member function which allow uppate the list box according the input value. 
	 *
	 *	@return the input value
	 *
	 */
	Listbox.prototype.update = function() {
		var self = this;
		// If there is a selected option, remove the selected class from it
		if (this.$selected.length > 0) {
			this.$selected.removeClass('selected');
			this.$selected.removeAttr('aria-selected');
		}

		// search the option
		var val = this.$input.val();
		this.$list.children().each(function(index) {
			if ($(this).attr('data-value') == val) {
				$(this).addClass('selected');
				$(this).attr('aria-selected', true);
				self.$selected = $(this);
				self.$edit.text($(this).text());
				return false;
			}
		});
		return val;
	} // end update


	/** 
	 *	empty() is a public member function which allow removing all items of the list box. 
	 *
	 *	@return null
	 *
	 */
	Listbox.prototype.empty = function() {
		this.$list.empty();
		this.$items = null;
		return null;
	} // end empty

	/** 
	 *	addItems() is a public member function which allow adding items to the list box. 
	 *
	 *	@param (items array of objects) the array of items to add. for one item : value = item.value, text = item.text, selected = true|false
	 *	@return null
	 *
	 */
	Listbox.prototype.addItems = function(items) {
		var self = this;
		$.each(items, function(index) {
			var $li = $('<li role="option" class="listbox-item" tabindex="-1" data-value="' + this.value + '">' + this.text + '</li>');
			if (this.selected) {
				$li.addClass('selected');
				$li.attr('aria-selected', true);
			}
			self.$list.append($li);
			$li.attr('id', 'item' + self.id + '-' + self.$list.children().length);
		});
		this.$items = this.$list.find('li.listbox-item');  // An array of jQuery objects for the listbox options
		this.selectOption(this.$items.filter('.selected'));
		this.bindOptionsHandlers();
		return null;
	} // end addItems

	/** 
	 *	setItems() is a public member function which allow setting all items to the list box. 
	 *
	 *	@param (items array of objects) the array of items to set. for one item : value = item.value, text = item.text, selected = true|false
	 *	@return null
	 *
	 */
	Listbox.prototype.setItems = function(items) {
		this.empty();
		this.addItems(items);
	} // end setItems


	/** 
	 *	showItem() is a public member function which allow showing an item of the listbox. 
	 *
	 *	@param (value string) the value attr of the item
	 *	@return null
	 *
	 */
	Listbox.prototype.showItem = function(value) {
		var self = this;
		if (value != null) {
			var $item = self.$list.find("li[data-value=" + value + "]");
			if ($item.length > 0) {
				return; // already there
			}
			$item = self.$list.data('alb.item-' + value);
			if (!$item) {
				return; // hideItem has not been used yet
			}
			var targetIndex = $item.data('alb.pos');
			var lastIndex = self.$items.length - 1;
			if (lastIndex == -1) {
				self.$list.prepend($item);
			} else {
				self.$items.each(function (i, e) {
					var opt = $(e);
					if (opt.data('alb.pos') > targetIndex) {
						opt.before($item);
						return false;
					} else if (i == lastIndex) {
						opt.after($item);
						return false;
					}
				});
			}
			self.$items = self.$list.find('li.listbox-item');
			self.selectOption(self.$items.filter('.selected'));
			self.bindOptionsHandlers();
		}
	} // end showItem

	/** 
	 *	hideItem() is a public member function which allow hiding an item of the listbox. 
	 *
	 *	@param (value string) the value attr of the item
	 *	@return null
	 *
	 */
	Listbox.prototype.hideItem = function(value) {
		var self = this;
		if (value != null) {
			var $item = self.$list.find("li[data-value=" + value + "]");
			if (!$item.length) {
				return;
			}
			if (!self.$list.data('alb.itemsModified')) {
				// remember the order
				self.$items.each(function (i, e) {
					$(e).data('alb.pos', i);
				});
				self.$list.data('alb.itemsModified', true);
			}
			if ($item.hasClass("selected") && self.$items.length > 1) {
				var curNdx = self.$items.index($item), $sel;
				if (curNdx < self.$items.length - 1) {
					$sel = this.$items.eq(curNdx + 1);
				} else {
					$sel = self.$items.first();
				}
				$item.removeClass("selected");
				$item.removeAttr('aria-selected');
				$sel.addClass("selected");
				$sel.attr('aria-selected', true);
			}
			self.$list.data('alb.item-' + value, $item.detach());
			self.$items = self.$list.find('li.listbox-item');
			self.selectOption(self.$items.filter('.selected'));
			self.bindOptionsHandlers();
		}
	} // end hideItem

	// LISTBOX PLUGIN DEFINITION
	// ==========================

	var old = $.fn.listbox

	$.fn.listbox = function (option, value) {
		if (typeof option == 'string' && $(this).length == 1) {
			var $this = $(this);
			setTimeout(function() {
				var data = $this.eq(0).data('alb.listbox');
				if (data) return data[option](value);
			}, 0);
		} else {
			return this.each(function () {
				var $this   = $(this);
				var data    = $this.data('alb.listbox');
				var options = $.extend({}, Listbox.DEFAULTS, $this.data(), typeof option == 'object' && option);
				if (!data && options.toggle && option == 'show') option = !option;
				if (!data) $this.data('alb.listbox', (data = new Listbox(this, options)));
				if (typeof option == 'string') data[option](value);
			});
		}
	}

	$.fn.listbox.Constructor = Listbox

	// LISTBOX NO CONFLICT
	// ====================

	$.fn.listbox.noConflict = function () {
		$.fn.listbox = old
		return this
	}
  
}));

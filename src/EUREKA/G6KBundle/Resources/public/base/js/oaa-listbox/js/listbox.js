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
		'	<div class="input-group">',
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
	
		// Initalize the listbox
		this.init();
	
		// bind event handlers for the widget
		this.bindHandlers();
			
	} // end Listbox constructor
	
	
	Listbox.VERSION  = '1.0.0'

	Listbox.DEFAULTS = {
		size: 10,
		theme: 'default'
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
			selected  = true;
		}
		self.$list.append($li);
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
	
			// add selected class to the stored selection
			$curOption.addClass('selected');
		}
		this.$list.fadeOut().attr('aria-expanded', 'false');
	
		// set focus on the edit box
		this.$edit.focus();
	
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
			// add selected class to the stored selection
			$curOption.addClass('selected');
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
		}
		
		// add the selected class to the new option
		$id.addClass('selected');
	
		// store the newly selected option
		this.$selected = $id;
	
		// update the edit box
		this.$edit.text($id.text());
		this.$input.attr('value', $id.attr('data-value'));
		this.$input.trigger('change');
	} // end selectOption
	
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
	
						// Add the selected class to the new selection
						$prev.addClass('selected');
	
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
	
						// Add the selected class to the new selection
						$next.addClass('selected');
	
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
	
				// Add the selected class to the new selection
				$first.addClass('selected');
	
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
	
				// Add the selected class to the new selection
				$last.addClass('selected');
	
				// scroll the list window to the new option
				this.$list.scrollTop(this.calcOffset($last));
	
				// set focus on last item
				$last.focus();
				e.stopPropagation();
				return false;
			}
			default: {
				var $found = null;
				for (var i = curNdx + 1; i < this.$items.length; i++) {
					var $next = this.$items.eq(i);
					if ($next.text().toLowerCase().charAt(0) == e.key) {
						$found = $next;
						break;
					}
				}
				if ($found == null) {
					for (var i = 0; i < curNdx; i++) {
						var $next = this.$items.eq(i);
						if ($next.text().toLowerCase().charAt(0) == e.key) {
							$found = $next;
							break;
						}
					}
				}
				if ($found != null) {
					// remove the selected from the current selection
					$id.removeClass('selected');
	
					// Add the selected class to the new selection
					$found.addClass('selected');
	
					// scroll the list window to the new option
					this.$list.scrollTop(this.calcOffset($found));
	
						// Set focus on the new item
					$found.focus();
					e.stopPropagation();
					return false;
				}
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
				var $found = null;
				for (var i = curNdx + 1; i < this.$items.length; i++) {
					var $next = this.$items.eq(i);
					if ($next.text().toLowerCase().charAt(0) == e.key) {
						$found = $next;
						break;
					}
				}
				if ($found == null) {
					for (var i = 0; i < curNdx; i++) {
						var $next = this.$items.eq(i);
						if ($next.text().toLowerCase().charAt(0) == e.key) {
							$found = $next;
							break;
						}
					}
				}
				if ($found != null) {
					this.selectOption($found);
					e.stopPropagation();
					return false;
				}
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
		}
		
		// add the selected class to the initial option
		this.$initial.addClass('selected');
	
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
		}
		
		// search the option
		var val = this.$input.val();
		this.$list.children().each(function(index) {
			if ($(this).attr('data-value') == val) {
				$(this).addClass('selected');
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
			}
			self.$list.append($li);
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

	
	// LISTBOX PLUGIN DEFINITION
	// ==========================

	var old = $.fn.listbox

	$.fn.listbox = function (option, value) {
		if (typeof option == 'string' && $(this).length == 1) {
			var data = $(this).eq(0).data('alb.listbox');
			if (data) return data[option](value);
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

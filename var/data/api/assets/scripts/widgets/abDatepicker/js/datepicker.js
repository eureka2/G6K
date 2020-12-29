/*!
 * Accessible Datepicker v2.1.20
 * Copyright 2015-2019 Eureka2, Jacques Archimède.
 * Based on the example of the Open AJAX Alliance Accessibility Tools Task Force : http://www.oaa-accessibility.org/examplep/datepicker1/
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * Inspired by :
 * http://wet-boew.github.io/wet-boew/demos/datepicker/datepicker-fr.html
 * http://eternicode.github.io/bootstrap-datepicker
 */

/**
 *	Description:
 *	===========
 *	This DatePicker widget allows the user to select a date.
 *	The DatePicker shows one month at least.
 *
 *	The calendar portion of the date picker follows a table structure
 *	where days of the week and calendar day numbers are layed out in HTML table cells where WAI-ARIA semantics for a grid are applied.
 *	This provides context so an assistive technology can render the day of the week;
 *	its corresponding numeric calendar day, and week number if necessary.
 *
 *	The calendar portion can be displayed in a numbers of ways, including as a popup associated with another widget,
 *	or as a static region of a page.
 *
 * 	This component complies with the recommendations of the guide http://www.w3.org/TR/wai-aria-practices/#datepicker of W3C, namely :
 *
 *	Keyboard Interaction:
 *	=====================
 *
 *	Keyboard navigation on days that are not included the currently displayed month should move to the month automatically and lead to the day in the next or previous month.
 *
 *		- Tab - Like other widgets, the date picker widget receives focus by tabbing into it. Once focus is received, focus is repositioned on today's date in a grid of days and weeks. A second tab will take the user out of the date picker widget. Focus initially is placed on today's date.
 *		- Shift+Tab - reverses the direction of the tab order. Once in the widget, a Shift+Tab will take the user to the previous focusable element in the tab order.
 *		- Up Arrow and Down Arrow - goes to the same day of the week in the previous or next week respectively. If the user advances past the end of the month they continue into the next or previous month as appropriate.
 *		- Left Arrow and Right Arrow - advances one day to the next, also in a continuum. Visually focus is moved from day to day and wraps from row to row in a grid of days and weeks.
 *		- Alt+Page Up - Moves to the same date in the previous year.
 *		- Alt+Page Down - Moves to the same date in the next year.
 *		- Space -
 *			Singleton Mode: acts as a toggle either selecting or deselecting the date.
 *			Contiguous Mode: Similar to selecting a range of text. Space selects the first date. Shift+Arrows add to the selection. Pressing Space again deselects the previous selections and selects the current focused date.
 *		- Home - Moves to the first day of the current month.
 *		- End - Moves to the last day of the current month.
 *		- Page Up - Moves to the same date in the previous month.
 *		- Page Down - Moves to the same date in the next month.
 *		- Enter -
 *			If the the calendar is a popup attached to some other widget (e.g., a text field), then Enter dismisses the popup, and the selected date(s) are shown in the associated widget.
 *			If the calendar is a static region on the page, then Enter confirms the selected date(s).
 *		- Escape - in the case of a popup date picker, closes the widget without any action.
 *
 *
 *	WAI-ARIA Roles, States, and Properties:
 *	======================================
 *
 *		The current month has a label representing the month and year. It is advisable to use a role heading but is not essential. This "label" should have a unique ID.
 *		If the author would like to ensure that a label is announced by a screen reader, as the label changes, include live region properties with the label element: aria-live="assertive" and aria-atomic="true".
 *		The container for the day of week headers and numeric days of the week has a role of grid.
 *		The grid has an aria-labelledby property with a value equivalent to the id of the label for the grid.
 *		Each name for the day of the week has a role columnheader and is not navigable via the keyboard.
 *		Each numeric day of the week has the role gridcell.
 *		When a day is selected its aria-selected is set to true, otherwise it is set to false or removed.
 *		Changes in aria states, identified here, as well as focus, are clearly styled to show the user where their point of regard is and what days are selected.
 *
 *	When the datepicker is active a calender day of the week always has focus.
 *	This can be achieved by setting the tabindex on that day as appropriate and then using script to give it focus.
 *	The grid container set aria-activedescendant to the id of the currently focused gridcell.
 *
 */

(function () {
	"use strict";

	if (typeof Date.dp_locales === 'undefined') {
		Date.dp_locales = {
			"texts": {
				"buttonTitle": "Select date ...",
				"buttonLabel": "Click or press the Enter key or the spacebar to open the calendar",
				"prevButtonLabel": "Go to previous month",
				"prevMonthButtonLabel": "Go to the previous year",
				"prevYearButtonLabel": "Go to the previous twenty years",
				"nextButtonLabel": "Go to next month",
				"nextMonthButtonLabel": "Go to the next year",
				"nextYearButtonLabel": "Go to the next twenty years",
				"changeMonthButtonLabel": "Click or press the Enter key or the spacebar to change the month",
				"changeYearButtonLabel": "Click or press the Enter key or the spacebar to change the year",
				"changeRangeButtonLabel": "Click or press the Enter key or the spacebar to go to the next twenty years",
				"closeButtonTitle": "Close",
				"closeButtonLabel": "Close the calendar",
				"calendarHelp": "- Up Arrow and Down Arrow - goes to the same day of the week in the previous or next week respectively. If the end of the month is reached, continues into the next or previous month as appropriate.\r\n- Left Arrow and Right Arrow - advances one day to the next, also in a continuum. Visually focus is moved from day to day and wraps from row to row in the grid of days.\r\n- Control+Page Up - Moves to the same date in the previous year.\r\n- Control+Page Down - Moves to the same date in the next year.\r\n- Home - Moves to the first day of the current month.\r\n- End - Moves to the last day of the current month.\r\n- Page Up - Moves to the same date in the previous month.\r\n- Page Down - Moves to the same date in the next month.\r\n- Enter or Espace - closes the calendar, and the selected date is shown in the associated text box.\r\n- Escape - closes the calendar without any action."
			},
			"directionality": "LTR",
			"month_names": [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			],
			"month_names_abbreviated": [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			],
			"month_names_narrow": [
				"J",
				"F",
				"M",
				"A",
				"M",
				"J",
				"J",
				"A",
				"S",
				"O",
				"N",
				"D"
			],
			"day_names": [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			],
			"day_names_abbreviated": [
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat"
			],
			"day_names_short": [
				"Su",
				"Mo",
				"Tu",
				"We",
				"Th",
				"Fr",
				"Sa"
			],
			"day_names_narrow": [
				"S",
				"M",
				"T",
				"W",
				"T",
				"F",
				"S"
			],
			"day_periods": {
				"am": "AM",
				"noon": "noon",
				"pm": "PM"
			},
			"day_periods_abbreviated": {
				"am": "AM",
				"noon": "noon",
				"pm": "PM"
			},
			"day_periods_narrow": {
				"am": "a",
				"noon": "n",
				"pm": "p"
			},
			"quarter_names": [
				"1st quarter",
				"2nd quarter",
				"3rd quarter",
				"4th quarter"
			],
			"quarter_names_abbreviated": [
				"Q1",
				"Q2",
				"Q3",
				"Q4"
			],
			"quarter_names_narrow": [
				"1",
				"2",
				"3",
				"4"
			],
			"era_names": [
				"Before Christ",
				"Anno Domini"
			],
			"era_names_abbreviated": [
				"BC",
				"AD"
			],
			"era_names_narrow": [
				"B",
				"A"
			],
			"full_format": "EEEE, MMMM d, y",
			"long_format": "MMMM d, y",
			"medium_format": "MMM d, y",
			"short_format": "M/d/yy",
			"firstday_of_week": 0
		};
	}
})();

(function (global) {
	'use strict';

	var datepickerButton = [
		'<a class="datepicker-button default" role="button" aria-haspopup="true" tabindex="0" aria-labelledby="datepicker-bn-open-label-CALENDARID">',
		'	<span class="icon icon-calendar" title="Select Date..."></span>',
		'</a>'
	];
	var datepickerCalendar = [
		'<div class="datepicker-calendar default" id="datepicker-calendar-CALENDARID" aria-hidden="false">',
		'	<div class="datepicker-month-wrap">',
		'		<div>',
		'			<div class="datepicker-button datepicker-month-fast-next right" role="button" aria-labelledby="datepicker-bn-fast-next-label-CALENDARID" tabindex="0"><span class="icomoon icon-forward"></span></div>',
		'			<div class="datepicker-button datepicker-month-next right" role="button" aria-labelledby="datepicker-bn-next-label-CALENDARID" tabindex="0"><span class="icomoon icon-caret-right"></span></div>',
		'			<div class="datepicker-button datepicker-month-fast-prev left" role="button" aria-labelledby="datepicker-bn-fast-prev-label-CALENDARID" tabindex="0"><span class="icomoon icon-backward"></span></div>',
		'			<div class="datepicker-button datepicker-month-prev left" role="button" aria-labelledby="datepicker-bn-prev-label-CALENDARID" tabindex="0"><span class="icomoon icon-caret-left"></span></div>',
		'			<div id="datepicker-month-CALENDARID" class="datepicker-button datepicker-month" tabindex="0" role="heading" aria-live="assertive" aria-atomic="true" title="Click or press the Enter key or the spacebar to change the month">July 2015</div>',
		'		</div>',
		'	</div>',
		'	<table class="datepicker-grid" role="grid" aria-readonly="true" aria-activedescendant="datepicker-err-msg-CALENDARID" aria-labelledby="datepicker-month-CALENDARID" tabindex="0">',
		'		<thead role="presentation">',
		'			<tr class="datepicker-weekdays" role="row">',
		'				<th scope="col" id="day0-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Sunday"><abbr title="Sunday">Su</abbr></th>',
		'				<th scope="col" id="day1-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Monday"><abbr title="Monday">Mo</abbr></th>',
		'				<th scope="col" id="day2-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Tuesday"><abbr title="Tuesday">Tu</abbr></th>',
		'				<th scope="col" id="day3-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Wednesday"><abbr title="Wednesday">We</abbr></th>',
		'				<th scope="col" id="day4-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Thursday"><abbr title="Thursday">Th</abbr></th>',
		'				<th scope="col" id="day5-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Friday"><abbr title="Friday">Fr</abbr></th>',
		'				<th scope="col" id="day6-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Saturday"><abbr title="Saturday">Sa</abbr></th>',
		'			</tr>',
		'		</thead>',
		'		<tbody role="presentation">',
		'			<tr>',
		'				<td id="datepicker-err-msg-CALENDARID" colspan="7">Javascript must be enabled</td>',
		'			</tr>',
		'		</tbody>',
		'	</table>',
		'	<div class="datepicker-close-wrap">',
		'		<button class="datepicker-button datepicker-close" id="datepicker-close-CALENDARID" aria-labelledby="datepicker-bn-close-label-CALENDARID">Close</button>',
		'	</div>',
		'	<div id="datepicker-bn-open-label-CALENDARID" class="datepicker-bn-open-label offscreen">Click or press the Enter key or the spacebar to open the calendar</div>',
		'	<div id="datepicker-bn-prev-label-CALENDARID" class="datepicker-bn-prev-label offscreen">Go to previous month</div>',
		'	<div id="datepicker-bn-next-label-CALENDARID" class="datepicker-bn-next-label offscreen">Go to next month</div>',
		'	<div id="datepicker-bn-fast-prev-label-CALENDARID" class="datepicker-bn-fast-prev-label offscreen">Go to previous year</div>',
		'	<div id="datepicker-bn-fast-next-label-CALENDARID" class="datepicker-bn-fast-next-label offscreen">Go to next year</div>',
		'	<div id="datepicker-bn-close-label-CALENDARID" class="datepicker-bn-close-label offscreen">Close the date picker</div>',
		'</div>'
	];

	var datepickerButton3 = [
		'<a class="datepicker-button bootstrap3 input-group-addon btn" role="button" aria-haspopup="true" tabindex="0" aria-labelledby="datepicker-bn-open-label-CALENDARID">',
		'	<span class="glyphicon glyphicon-calendar" title="Select Date..."></span>',
		'</a>'
	];
	var datepickerCalendar3 = [
		'<div class="datepicker-calendar bootstrap3" id="datepicker-calendar-CALENDARID" aria-hidden="false">',
		'	<div class="datepicker-month-wrap">',
		'		<div class="datepicker-button datepicker-month-fast-next pull-right" role="button" aria-labelledby="datepicker-bn-fast-next-label-CALENDARID" tabindex="0"><span class="glyphicon glyphicon-forward"></span></div>',
		'		<div class="datepicker-button datepicker-month-next pull-right" role="button" aria-labelledby="datepicker-bn-next-label-CALENDARID" tabindex="0"><span class="glyphicon glyphicon-triangle-right"></span></div>',
		'		<div class="datepicker-button datepicker-month-fast-prev pull-left" role="button" aria-labelledby="datepicker-bn-fast-prev-label-CALENDARID" tabindex="0"><span class="glyphicon glyphicon-backward"></span></div>',
		'		<div class="datepicker-button datepicker-month-prev pull-left" role="button" aria-labelledby="datepicker-bn-prev-label-CALENDARID" tabindex="0"><span class="glyphicon glyphicon-triangle-left"></span></div>',
		'		<div id="datepicker-month-CALENDARID" class="datepicker-button datepicker-month" tabindex="0" role="heading" aria-live="assertive" aria-atomic="true" title="Click or press the Enter key or the spacebar to change the month">July 2015</div>',
		'	</div>',
		'	<table class="datepicker-grid" role="grid" aria-readonly="true" aria-activedescendant="datepicker-err-msg-CALENDARID" aria-labelledby="datepicker-month-CALENDARID" tabindex="0">',
		'		<thead role="presentation">',
		'			<tr class="datepicker-weekdays" role="row">',
		'				<th scope="col" id="day0-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Sunday"><abbr title="Sunday">Su</abbr></th>',
		'				<th scope="col" id="day1-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Monday"><abbr title="Monday">Mo</abbr></th>',
		'				<th scope="col" id="day2-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Tuesday"><abbr title="Tuesday">Tu</abbr></th>',
		'				<th scope="col" id="day3-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Wednesday"><abbr title="Wednesday">We</abbr></th>',
		'				<th scope="col" id="day4-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Thursday"><abbr title="Thursday">Th</abbr></th>',
		'				<th scope="col" id="day5-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Friday"><abbr title="Friday">Fr</abbr></th>',
		'				<th scope="col" id="day6-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Saturday"><abbr title="Saturday">Sa</abbr></th>',
		'			</tr>',
		'		</thead>',
		'		<tbody role="presentation">',
		'			<tr>',
		'				<td id="datepicker-err-msg-CALENDARID" colspan="7">Javascript must be enabled</td>',
		'			</tr>',
		'		</tbody>',
		'	</table>',
		'	<div class="datepicker-close-wrap">',
		'		<button class="datepicker-button datepicker-close" id="datepicker-close-CALENDARID" aria-labelledby="datepicker-bn-close-label-CALENDARID">Close</button>',
		'	</div>',
		'	<div id="datepicker-bn-open-label-CALENDARID" class="datepicker-bn-open-label offscreen">Click or press the Enter key or the spacebar to open the calendar</div>',
		'	<div id="datepicker-bn-prev-label-CALENDARID" class="datepicker-bn-prev-label offscreen">Go to previous month</div>',
		'	<div id="datepicker-bn-next-label-CALENDARID" class="datepicker-bn-next-label offscreen">Go to next month</div>',
		'	<div id="datepicker-bn-fast-prev-label-CALENDARID" class="datepicker-bn-fast-prev-label offscreen">Go to previous year</div>',
		'	<div id="datepicker-bn-fast-next-label-CALENDARID" class="datepicker-bn-fast-next-label offscreen">Go to next year</div>',
		'	<div id="datepicker-bn-close-label-CALENDARID" class="datepicker-bn-close-label offscreen">Close the date picker</div>',
		'</div>'
	];

	var datepickerButton4 = [
		'<a class="datepicker-button bootstrap4 input-group-append" role="button" aria-haspopup="true" tabindex="0" aria-labelledby="datepicker-bn-open-label-CALENDARID">',
		'	<span class="input-group-text"><i class="far fa-calendar-alt" title="Select Date..."></i></span>',
		'</a>'
	];
	var datepickerCalendar4 = [
		'<div class="datepicker-calendar bootstrap4" id="datepicker-calendar-CALENDARID" aria-hidden="false">',
		'	<div class="datepicker-month-wrap">',
		'		<div class="datepicker-button datepicker-month-fast-next float-right" role="button" aria-labelledby="datepicker-bn-fast-next-label-CALENDARID" tabindex="0"><i class="fas fa-forward"></i></div>',
		'		<div class="datepicker-button datepicker-month-next float-right" role="button" aria-labelledby="datepicker-bn-next-label-CALENDARID" tabindex="0"><i class="fas fa-caret-right"></i></div>',
		'		<div class="datepicker-button datepicker-month-fast-prev float-left" role="button" aria-labelledby="datepicker-bn-fast-prev-label-CALENDARID" tabindex="0"><i class="fas fa-backward"></i></div>',
		'		<div class="datepicker-button datepicker-month-prev float-left" role="button" aria-labelledby="datepicker-bn-prev-label-CALENDARID" tabindex="0"><i class="fas fa-caret-left"></i></div>',
		'		<div id="datepicker-month-CALENDARID" class="datepicker-button datepicker-month" tabindex="0" role="heading" aria-live="assertive" aria-atomic="true" title="Click or press the Enter key or the spacebar to change the month">July 2015</div>',
		'	</div>',
		'	<table class="datepicker-grid" role="grid" aria-readonly="true" aria-activedescendant="datepicker-err-msg-CALENDARID" aria-labelledby="datepicker-month-CALENDARID" tabindex="0">',
		'		<thead role="presentation">',
		'			<tr class="datepicker-weekdays" role="row">',
		'				<th scope="col" id="day0-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Sunday"><abbr title="Sunday">Su</abbr></th>',
		'				<th scope="col" id="day1-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Monday"><abbr title="Monday">Mo</abbr></th>',
		'				<th scope="col" id="day2-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Tuesday"><abbr title="Tuesday">Tu</abbr></th>',
		'				<th scope="col" id="day3-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Wednesday"><abbr title="Wednesday">We</abbr></th>',
		'				<th scope="col" id="day4-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Thursday"><abbr title="Thursday">Th</abbr></th>',
		'				<th scope="col" id="day5-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Friday"><abbr title="Friday">Fr</abbr></th>',
		'				<th scope="col" id="day6-header-CALENDARID" class="datepicker-day" role="columnheader" aria-label="Saturday"><abbr title="Saturday">Sa</abbr></th>',
		'			</tr>',
		'		</thead>',
		'		<tbody role="presentation">',
		'			<tr>',
		'				<td id="datepicker-err-msg-CALENDARID" colspan="7">Javascript must be enabled</td>',
		'			</tr>',
		'		</tbody>',
		'	</table>',
		'	<div class="datepicker-close-wrap">',
		'		<button class="datepicker-button datepicker-close" id="datepicker-close-CALENDARID" aria-labelledby="datepicker-bn-close-label-CALENDARID">Close</button>',
		'	</div>',
		'	<div id="datepicker-bn-open-label-CALENDARID" class="datepicker-bn-open-label offscreen">Click or press the Enter key or the spacebar to open the calendar</div>',
		'	<div id="datepicker-bn-prev-label-CALENDARID" class="datepicker-bn-prev-label offscreen">Go to previous month</div>',
		'	<div id="datepicker-bn-next-label-CALENDARID" class="datepicker-bn-next-label offscreen">Go to next month</div>',
		'	<div id="datepicker-bn-fast-prev-label-CALENDARID" class="datepicker-bn-fast-prev-label offscreen">Go to previous year</div>',
		'	<div id="datepicker-bn-fast-next-label-CALENDARID" class="datepicker-bn-fast-next-label offscreen">Go to next year</div>',
		'	<div id="datepicker-bn-close-label-CALENDARID" class="datepicker-bn-close-label offscreen">Close the date picker</div>',
		'</div>'
	];

	var Datepicker = function (target, options) {
		var self = target.datepicker = this;
		this.target = target; // textbox that will receive the selected date string and focus (if modal)
		this.options = Utils.extend({}, Datepicker.DEFAULTS, options)
		this.locales = Date.dp_locales;
		this.startview(this.options.startView);
		if (typeof this.options.inputFormat === 'string') {
			this.options.inputFormat = [this.options.inputFormat];
		}
		if (! Array.isArray(this.options.datesDisabled)) {
			this.options.datesDisabled = [this.options.datesDisabled];
		}
		this.options.datesDisabled.forEach(function(v, i) {
			if (typeof v === 'string') {
				var date = self.parseDate(v);
				if (date === null ) {
					self.options.datesDisabled[i] = null;
				} else {
					self.options.datesDisabled[i] = self.format(date);
				}
			} else if (v instanceof Date && !isNaN(v.valueOf())) {
				self.options.datesDisabled[i] = self.format(v);
			} else {
				self.options.datesDisabled[i] = null;
			}
		});
		if (this.options.min != null) {
			this.options.min = this.parseDate(this.options.min);
		} else if (this.target.getAttribute('min')) {
			this.options.min = this.parseDate(this.target.getAttribute('min'));
		}
		if (this.options.max != null) {
			this.options.max = this.parseDate(this.options.max);
		} else if (this.target.getAttribute('max')) {
			this.options.max = this.parseDate(this.target.getAttribute('max'));
		}
		if (typeof this.options.previous !== 'object') {
			this.options.previous = null;
		}
		if (typeof this.options.next !== 'object') {
			this.options.next = null;
		}
		if (this.options.next !== null) {
			this.target.classList.add('datepicker-linked');
		}
		this.id = this.target.getAttribute('id') || 'datepicker-' + Math.floor(Math.random() * 100000);
		var calendar;
		switch (this.options.markup) {
			case 'bootstrap3':
				calendar = datepickerCalendar3.join("");
				break;
			case 'bootstrap4':
				calendar = datepickerCalendar4.join("");
				break;
			default:
				calendar = datepickerCalendar.join("");
		}
		calendar = calendar.replace(/CALENDARID/g, this.id + '');

		// complete the target textbox if any
		if (this.target.closest('.field-group') === null) {
			var div = document.createElement('div');
			div.classList.add('field-group');
			this.target.parentElement.insertBefore(div, this.target);
			div.appendChild(this.target);
		}
		this.group = this.target.closest('.field-group');
		this.group.classList.add(this.options.markup);
		this.target.setAttribute('aria-autocomplete', 'none');
		this.target.style.minWidth = '7em';
		this.target.classList.add('datepicker-input', this.options.markup);

		if (! this.target.getAttribute('placeholder')) {
			this.target.setAttribute('placeholder', this.options.inputFormat[0]);
		}

		var button;
		switch (this.options.markup) {
			case 'bootstrap3':
				button = datepickerButton3.join("");
				this.target.classList.add('form-control');
				break;
			case 'bootstrap4':
				button = datepickerButton4.join("");
				this.target.classList.add('form-control');
				break;
			default:
				button = datepickerButton.join("");
		}
		this.button = document.createElement('div');
		this.button.innerHTML = button.replace(/CALENDARID/g, this.id + '');
		this.button = this.button.firstElementChild;
		this.button.classList.add(this.options.theme);
		this.calendar = document.createElement('div');
		this.calendar.innerHTML = calendar;
		this.calendar = this.calendar.firstElementChild;
		this.calendar.classList.add(this.options.theme);
		if (this.options.buttonLeft) {
			this.target.insertAdjacentElement('beforebegin', this.button);
		} else {
			this.target.insertAdjacentElement('afterend', this.button);
		}

		// be sure parent of the calendar is positionned  to calculate the position of the calendar
		if (this.calendar.parentElement.style.position === 'static') {
			this.calendar.parentElement.style.position = 'relative';
		}
		this.calendar.querySelector('.datepicker-bn-open-label').innerHTML = this.options.buttonLabel;
		if (this.target.getAttribute('id')) {
			this.calendar.setAttribute('aria-controls', this.target.getAttribute('id'));
		}
		this.button.querySelector('span').setAttribute('title', this.options.buttonTitle);
		this.calendar.style.left = this.target.parentElement.offsetLeft + 'px';
		this.monthObj = this.calendar.querySelector('.datepicker-month');
		this.prev = this.calendar.querySelector('.datepicker-month-prev');
		this.next = this.calendar.querySelector('.datepicker-month-next');
		this.fastprev = this.calendar.querySelector('.datepicker-month-fast-prev');
		this.fastnext = this.calendar.querySelector('.datepicker-month-fast-next');
		this.grid = this.calendar.querySelector('.datepicker-grid');
		if (this.locales.directionality === 'RTL') {
			this.grid.classList.add('rtl');
		}
		var days = this.grid.querySelectorAll('th.datepicker-day abbr');
		this.drawCalendarHeader();
		if (this.options.inline == false && this.options.modal == true) {
			this.close = this.calendar.querySelector('.datepicker-close');
			this.close.innerHTML = this.options.closeButtonTitle;
			this.close.setAttribute('title', this.options.closeButtonLabel);
			this.calendar.querySelector('.datepicker-bn-close-label').innerHTML = this.options.closeButtonLabel;
		} else {
			this.hideObject(this.calendar.querySelector('.datepicker-close-wrap'));
			this.hideObject(this.calendar.querySelector('.datepicker-bn-close-label'));
		}

		if (this.options.inline != false) {
			this.hideObject(this.button);
			var container = typeof this.options.inline === 'string'
				? document.querySelector('#' + this.options.inline)
				: this.options.inline;
			container.appendChild(this.calendar);
			this.calendar.style.position = 'relative';
			this.calendar.style.left = '0px';
			this.initializeDate();
		} else {
			this.calendar.style.display = 'none';
			this.target.parentElement.insertAdjacentElement('afterend', this.calendar);
			this.hide(!this.options.gainFocusOnConstruction);
		}

		this.keys = {
			tab: 9,
			enter: 13,
			esc: 27,
			space: 32,
			pageup: 33,
			pagedown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};

		this.bindHandlers();
		this.button.addEventListener('click', function(e) {
			if (!this.classList.contains('disabled')) {
				if (self.calendar.getAttribute('aria-hidden') === 'true') {
					self.initializeDate();
					self.show();
				} else {
					self.hide();
				}
				self.selectGridCell(self.grid.getAttribute('aria-activedescendant'));
			}
			e.stopPropagation();
			return false;
		}, false);
		document.addEventListener('keydown', function(e) {
			var ev = e || event;
			if (ev.target === self.button) {
				if (self.calendar.getAttribute('aria-hidden') == 'false') {
					self.grid.dispatchEvent(new KeyboardEvent('keydown', {
						ctrlKey: ev.ctrlKey,
						shiftKey: ev.shiftKey,
						altKey: ev.altKey,
						charCode: ev.charCode,
						keyCode: ev.keyCode || ev.which,
						which: ev.which || ev.keyCode
					}));
				} else if(ev.keyCode == self.keys.enter || ev.keyCode == self.keys.space) {
					self.button.dispatchEvent(new MouseEvent('click', {
						bubbles: true,
						cancelable: true
					}));
					return false;
				}  
			}
		}, false);
		this.calendar.addEventListener('blur', function(e) {
			if (self.calendar.getAttribute('aria-hidden') === 'false') {
				self.hide();
			}

		}, false);
		document.querySelectorAll("input.datepicker-linked").forEach ( input => {
			input.dispatchEvent(new CustomEvent('ab.datepicker.ready', {
				detail: [self.id]
			}));
		});
	}

	Datepicker.VERSION  = '2.1.20'

	Datepicker.DEFAULTS = {
		firstDayOfWeek: Date.dp_locales.firstday_of_week, // Determines the first column of the calendar grid
		weekDayFormat: 'short', // Display format of the weekday names - values are 'short' or 'narrow'
		startView: 0, // Initial calendar - values are 0 or 'days', 1 or 'months', 2 or 'years'
		daysOfWeekDisabled: [],
		datesDisabled: [],
		isDateDisabled: null,
		isMonthDisabled: null,
		isYearDisabled: null,
		inputFormat: [Date.dp_locales.short_format],
		outputFormat: Date.dp_locales.short_format,
		titleFormat: Date.dp_locales.full_format,
		buttonLeft: false,
		buttonTitle: Date.dp_locales.texts.buttonTitle,
		buttonLabel: Date.dp_locales.texts.buttonLabel,
		prevButtonLabel: Date.dp_locales.texts.prevButtonLabel,
		prevMonthButtonLabel: Date.dp_locales.texts.prevMonthButtonLabel,
		prevYearButtonLabel: Date.dp_locales.texts.prevYearButtonLabel,
		nextButtonLabel: Date.dp_locales.texts.nextButtonLabel,
		nextMonthButtonLabel: Date.dp_locales.texts.nextMonthButtonLabel,
		nextYearButtonLabel: Date.dp_locales.texts.nextYearButtonLabel,
		changeMonthButtonLabel: Date.dp_locales.texts.changeMonthButtonLabel,
		changeYearButtonLabel: Date.dp_locales.texts.changeYearButtonLabel,
		changeRangeButtonLabel: Date.dp_locales.texts.changeRangeButtonLabel,
		closeButtonTitle: Date.dp_locales.texts.closeButtonTitle,
		closeButtonLabel: Date.dp_locales.texts.closeButtonLabel,
		onUpdate: function (value) {},
		previous: null,
		next: null,
		allowSameDate: true,
		markup: 'default', // default, bootstrap3 or bootstrap4
		theme: 'default',
		modal: false,
		inline: false,
		gainFocusOnConstruction: true,
		min: null,
		max: null
	}

	/**
	 *	initializeDate() is a member function to initialize the Datepicker date with the content of the target textbox
	 *
	 *	@return N/A
	 *
	 */
	Datepicker.prototype.initializeDate = function() {
		var val = this.target.value;
		var date = val === '' ? new Date() :  this.parseDate(val);
		this.setDate(date, true);
	} // end initializeDate()

	/**
	 * getDate() is a member function to retrieve the current Datepicker date.
	 * @return the Date object
	 */
	Datepicker.prototype.getDate = function () {
		var val = this.target.value;
		var date = val === '' ? new Date() :  this.parseDate(val);
		return date;
	} // end getDate()

	/**
	 *	setDate() is a member function to set the Datepicker date with the content of newDate
	 *
	 *	@param	(newDate Date) the new value of the Datepicker date.
	 *	@return N/A
	 *
	 */
	Datepicker.prototype.setDate = function(newDate, init) {
		this.dateObj = newDate;
		init = (typeof init === 'undefined') ? false : init;
		if (this.dateObj == null) {
			this.target.setAttribute('aria-invalid', true);
			var formGroup = this.target.closest('.field-container');
			while (formGroup !== null) {
				formGroup.classList.add('has-error');
				formGroup = formGroup.parentElement.closest('.field-container');
			}
			this.dateObj = new Date();
			this.dateObj.setHours(0, 0, 0, 0);
		}
		if (this.options.min != null && this.dateObj < this.options.min) {
			this.target.setAttribute('aria-invalid', true);
			var formGroup = this.target.closest('.field-container');
			while (formGroup !== null) {
				formGroup.classList.add('has-error');
				formGroup = formGroup.parentElement.closest('.field-container');
			}
			this.dateObj = this.options.min;
		} else if (this.options.max != null && this.dateObj > this.options.max) {
			this.target.setAttribute('aria-invalid', true);
			var formGroup = this.target.closest('.field-container');
			while (formGroup !== null) {
				formGroup.classList.add('has-error');
				formGroup = formGroup.parentElement.closest('.field-container');
			}
			this.dateObj = this.options.max;
		}
		if (!init || this.target.value != '') {
			this.target.value = this.format(this.dateObj);
		}
		this.curYear = this.dateObj.getFullYear();
		this.year = this.curYear;
		this.curMonth = this.dateObj.getMonth();
		this.month = this.curMonth;
		this.date = this.dateObj.getDate();
		// populate the calendar grid
		switch (this.options.startView) {
			case 1: // months
				this.populateMonthsCalendar();
				// update the table's activedescdendant to point to the current month
				this.grid.setAttribute('aria-activedescendant', this.grid.querySelector('.curMonth').getAttribute('id'));
				break;
			case 2: // years
				this.populateYearsCalendar();
				// update the table's activedescdendant to point to the current year
				this.grid.setAttribute('aria-activedescendant', this.grid.querySelector('.curYear').getAttribute('id'));
				break;
			default:
				this.populateDaysCalendar();
				// update the table's activedescdendant to point to the current day
				this.grid.setAttribute('aria-activedescendant', this.grid.querySelector('.curDay').getAttribute('id'));
		}
	} // end setDate()

	/**
	 *	drawCalendarHeader() is a member function to populate the calendar header with the days name.
	 *
	 *	@return N/A
	 */
	Datepicker.prototype.drawCalendarHeader = function() {
		var days = this.grid.querySelectorAll('th.datepicker-day');
		var weekday = this.options.firstDayOfWeek;
		for (var i = 0; i < 7; i++) {
			days[i].setAttribute('aria-label', this.locales.day_names[weekday]);
			var abbr  = days[i].querySelector('abbr');
			abbr.setAttribute('title', this.locales.day_names[weekday]);
			abbr.textContent  = this.options.weekDayFormat === 'short'
				? this.locales.day_names_short[weekday]
				: this.locales.day_names_narrow[weekday];
			weekday = (weekday + 1) % 7;
		}
	} // end drawCalendarHeader()

	/**
	 *	populateDaysCalendar() is a member function to populate the datepicker grid with calendar days
	 *	representing the current month
	 *
	 *	@return N/A
	 *
	 */
	Datepicker.prototype.populateDaysCalendar = function() {
		this.calendar.querySelector('.datepicker-bn-prev-label').innerHTML = this.options.prevButtonLabel;
		this.calendar.querySelector('.datepicker-bn-next-label').innerHTML = this.options.nextButtonLabel;
		this.calendar.querySelector('.datepicker-bn-fast-prev-label').innerHTML = this.options.prevMonthButtonLabel;
		this.calendar.querySelector('.datepicker-bn-fast-next-label').innerHTML = this.options.nextMonthButtonLabel;
		if (this.options.min != null &&
			(	this.year - 1 < this.options.min.getFullYear() ||
				(this.year - 1 == this.options.min.getFullYear() && this.month < this.options.min.getMonth()))) {
			this.fastprev.setAttribute('title', '');
			this.fastprev.classList.add('disabled');
			this.fastprev.classList.remove('enabled');
		} else {
			this.fastprev.setAttribute('title', this.options.prevMonthButtonLabel);
			this.fastprev.classList.add('enabled');
			this.fastprev.classList.remove('disabled');
		}
		var previousMonth = this.previousMonth(this.year, this.month);
		if (this.options.min != null &&
			(	previousMonth.year < this.options.min.getFullYear() ||
				(previousMonth.year == this.options.min.getFullYear() && previousMonth.month < this.options.min.getMonth()))) {
			this.prev.setAttribute('title', '');
			this.prev.classList.add('disabled');
			this.prev.classList.remove('enabled');
		} else {
			this.prev.setAttribute('title', this.options.prevButtonLabel);
			this.prev.classList.add('enabled');
			this.prev.classList.remove('disabled');
		}
		this.monthObj.setAttribute('title', this.options.changeMonthButtonLabel);
		var nextMonth = this.nextMonth(this.year, this.month);
		if (this.options.max != null &&
			(	nextMonth.year > this.options.max.getFullYear() ||
				(nextMonth.year == this.options.max.getFullYear() && nextMonth.month > this.options.max.getMonth()))) {
			this.next.setAttribute('title', '');
			this.next.classList.add('disabled');
			this.next.classList.remove('enabled');
		} else {
			this.next.setAttribute('title', this.options.nextButtonLabel);
			this.next.classList.add('enabled');
			this.next.classList.remove('disabled');
		}
		if (this.options.max != null &&
			(	this.year + 1 > this.options.max.getFullYear() ||
				(this.year + 1 == this.options.max.getFullYear() && this.month > this.options.max.getMonth()))) {
			this.fastnext.setAttribute('title', '');
			this.fastnext.classList.add('disabled');
			this.fastnext.classList.remove('enabled');
		} else {
			this.fastnext.setAttribute('title', this.options.nextMonthButtonLabel);
			this.fastnext.classList.add('enabled');
			this.fastnext.classList.remove('disabled');
		}
		this.showObject(this.fastprev);
		this.showObject(this.fastnext);
		var numDays = this.getDaysInMonth(this.year, this.month);
		var numPrevDays = this.getDaysInMonth(previousMonth.year, previousMonth.month);
		var startWeekday = new Date(this.year, this.month, 1).getDay();
		var lastDayOfWeek = (this.options.firstDayOfWeek + 6) % 7;
		var curDay = 1;
		var rowCount = 1;
		this.monthObj.innerHTML = this.locales.month_names[this.month] + ' ' + this.year;
		this.showObject(this.grid.querySelector('thead'));
		// clear the grid
		var gridCells = '\t<tr id="row0-'+this.id+'" role="row">\n';
		// Insert the leading empty cells
		var numEmpties = 0;
		var weekday = this.options.firstDayOfWeek;
		while (weekday != startWeekday) {
			numEmpties++;
			weekday = (weekday + 1) % 7;
		}
		for ( ; numEmpties > 0; numEmpties--) {
			gridCells += '\t\t<td class="empty">' + (numPrevDays - numEmpties + 1) + '</td>\n';
		}
		var isYearDisabled = this.options.isYearDisabled && this.options.isYearDisabled(this.year);
		var isMonthDisabled = this.options.isMonthDisabled && this.options.isMonthDisabled(this.year, this.month + 1);
		// insert the days of the month.
		for (curDay = 1; curDay <= numDays; curDay++) {
			var date = new Date(this.year, this.month, curDay, 0, 0, 0, 0);
			var longdate = this.formatDate(date, this.options.titleFormat);
			var curDayClass = curDay == this.date && this.month == this.curMonth && this.year == this.curYear ? ' curDay' : '';
			if (isYearDisabled || isMonthDisabled) {
				gridCells += '\t\t<td id="cell' + curDay + '-' + this.id + '" class="day unselectable' + curDayClass + '"';
			} else if (this.options.daysOfWeekDisabled.indexOf(weekday) > -1) {
				gridCells += '\t\t<td id="cell' + curDay + '-' + this.id + '" class="day unselectable' + curDayClass + '"';
			} else if (this.options.min != null && date < this.options.min) {
				gridCells += '\t\t<td id="cell' + curDay + '-' + this.id + '" class="day unselectable' + curDayClass + '"';
			} else if (this.options.max != null && date > this.options.max) {
				gridCells += '\t\t<td id="cell' + curDay + '-' + this.id + '" class="day unselectable' + curDayClass + '"';
			} else if (this.options.datesDisabled.indexOf(this.format(date)) > -1) {
				gridCells += '\t\t<td id="cell' + curDay + '-' + this.id + '" class="day unselectable' + curDayClass + '"';
			} else if (this.options.isDateDisabled && this.options.isDateDisabled(date)) {
				gridCells += '\t\t<td id="cell' + curDay + '-' + this.id + '" class="day unselectable' + curDayClass + '"';
			} else {
				gridCells += '\t\t<td id="cell' + curDay + '-' + this.id + '" class="day selectable' + curDayClass + '"';
			}
			gridCells += ' data-value="' + curDay + '"';
			gridCells += ' title="' + longdate + '"';
			gridCells += ' aria-label="' + longdate + '"';
			gridCells += ' headers="day' + weekday + '-header-' + this.id + '" role="gridcell" tabindex="-1" aria-selected="false">' + curDay;
			gridCells +=  '</td>';
			if (weekday == lastDayOfWeek && curDay < numDays) {
				// This was the last day of the week, close it out
				// and begin a new one
				gridCells += '\t</tr>\n\t<tr id="row' + rowCount + '-' + this.id + '" role="row">\n';
				rowCount++;
			}
			if (curDay < numDays) {
				weekday = (weekday + 1) % 7;
			}
		}
		// Insert any trailing empty cells
		while (weekday != lastDayOfWeek) {
			gridCells += '\t\t<td class="empty">' + (++numEmpties) + '</td>\n';
			weekday = (weekday + 1) % 7;
		}
		gridCells += '\t</tr>';
		var tbody = this.grid.querySelector('tbody');
		tbody.innerHTML = gridCells;
		this.gridType = 0; // 0 = days grid, 1 = months grid, 2 = years Grid
	} // end populateDaysCalendar()

	/**
	 *	populateMonthsCalendar() is a member function to populate the datepicker grid with calendar months
	 *	representing the current year
	 *
	 *	@return N/A
	 *
	 */
	Datepicker.prototype.populateMonthsCalendar = function() {
		this.calendar.querySelector('.datepicker-bn-prev-label').innerHTML = this.options.prevMonthButtonLabel;
		this.calendar.querySelector('.datepicker-bn-next-label').innerHTML = this.options.nextMonthButtonLabel;
		this.hideObject(this.fastprev);
		this.hideObject(this.fastnext);
		if (this.options.min != null && this.year - 1 < this.options.min.getFullYear()) {
			this.prev.setAttribute('title', '');
			this.prev.classList.add('disabled');
			this.prev.classList.remove('enabled');
		} else {
			this.prev.setAttribute('title', this.options.prevMonthButtonLabel);
			this.prev.classList.add('enabled');
			this.prev.classList.remove('disabled');
		}
		this.monthObj.setAttribute('title', this.options.changeYearButtonLabel);
		if (this.options.max != null && this.year + 1 > this.options.max.getFullYear()) {
			this.next.setAttribute('title', '');
			this.next.classList.add('disabled');
			this.next.classList.remove('enabled');
		} else {
			this.next.setAttribute('title', this.options.nextMonthButtonLabel);
			this.next.classList.add('enabled');
			this.next.classList.remove('disabled');
		}
		var curMonth = 0;
		var rowCount = 1;
		this.monthObj.innerHTML = this.year;
		// clear the grid
		this.hideObject(this.grid.querySelector('thead'));
		var gridCells = '\t<tr id="row0-'+this.id+'" role="row">\n';
		var isYearDisabled = this.options.isYearDisabled && this.options.isYearDisabled(this.year);
		// insert the months of the year.
		for (curMonth = 0; curMonth < 12; curMonth++) {
			if (isYearDisabled) {
				gridCells += '\t\t<td id="cell' + (curMonth + 1) + '-' + this.id + '" class="month unselectable"';
			} else if (curMonth == this.month && this.year == this.curYear) {
				gridCells += '\t\t<td id="cell' + (curMonth + 1) + '-' + this.id + '" class="month curMonth selectable"';
			} else if (this.options.min != null && (this.year < this.options.min.getFullYear() || (this.year == this.options.min.getFullYear() && curMonth < this.options.min.getMonth()))) {
				gridCells += '\t\t<td id="cell' + (curMonth + 1) + '-' + this.id + '" class="month unselectable"';
			} else if (this.options.max != null && (this.year > this.options.max.getFullYear() || (this.year == this.options.max.getFullYear() && curMonth > this.options.max.getMonth()))) {
				gridCells += '\t\t<td id="cell' + (curMonth + 1) + '-' + this.id + '" class="month unselectable"';
			} else if (this.options.isMonthDisabled && this.options.isMonthDisabled(this.year, curMonth + 1)) {
				gridCells += '\t\t<td id="cell' + (curMonth + 1) + '-' + this.id + '" class="month unselectable"';
			} else {
				gridCells += '\t\t<td id="cell' + (curMonth + 1) + '-' + this.id + '" class="month selectable"';
			}
			gridCells += ' data-value="' + curMonth + '"';
			gridCells += ' title="' + this.locales.month_names[curMonth] + ' ' + this.year + '"';
			gridCells += ' aria-label="' + this.locales.month_names[curMonth] + ' ' + this.year + '"';
			gridCells += ' role="gridcell" tabindex="-1" aria-selected="false">' + this.locales.month_names_abbreviated[curMonth];
			gridCells +=  '</td>';
			if (curMonth == 3 || curMonth == 7) {
				gridCells += '\t</tr>\n\t<tr id="row' + rowCount + '-' + this.id + '" role="row">\n';
				rowCount++;
			}
		}
		gridCells += '\t</tr>';
		var tbody = this.grid.querySelector('tbody');
		tbody.innerHTML = gridCells;
		this.gridType = 1; // 0 = days grid, 1 = months grid, 2 = years Grid
	} // end populateMonthsCalendar()

	/**
	 *	populateYearsCalendar() is a member function to populate the datepicker grid with 20 calendar years
	 *	around the current year
	 *
	 *	@return N/A
	 *
	 */
	Datepicker.prototype.populateYearsCalendar = function() {
		this.calendar.querySelector('.datepicker-bn-prev-label').innerHTML = this.options.prevYearButtonLabel;
		this.calendar.querySelector('.datepicker-bn-next-label').innerHTML = this.options.nextYearButtonLabel;
		this.hideObject(this.fastprev);
		this.hideObject(this.fastnext);
		if (this.options.min != null && this.year - 20 < this.options.min.getFullYear()) {
			this.prev.setAttribute('title', '');
			this.prev.classList.add('disabled');
			this.prev.classList.remove('enabled');
		} else {
			this.prev.setAttribute('title', this.options.prevYearButtonLabel);
			this.prev.classList.add('enabled');
			this.prev.classList.remove('disabled');
		}
		this.monthObj.setAttribute('title', this.options.changeRangeButtonLabel);
		if (this.options.max != null && this.year + 20 > this.options.max.getFullYear()) {
			this.next.setAttribute('title', '');
			this.next.classList.add('disabled');
			this.next.classList.remove('enabled');
		} else {
			this.next.setAttribute('title', this.options.nextYearButtonLabel);
			this.next.classList.add('enabled');
			this.next.classList.remove('disabled');
		}
		var startYear = Math.floor(this.year / 10) * 10;
		var endYear = startYear + 19;
		var rowCount = 1;
		this.monthObj.innerHTML = startYear + '-' + endYear;
		// clear the grid
		this.hideObject(this.grid.querySelector('thead'));
		var gridCells = '\t<tr id="row0-'+this.id+'" role="row">\n';
		// insert the months of the year.
		for (var curYear = startYear; curYear <= endYear; curYear++) {
			if (curYear == this.year) {
				gridCells += '\t\t<td id="cell' + (curYear - startYear + 1) + '-' + this.id + '" class="year curYear selectable"';
			} else if (this.options.min != null && (curYear < this.options.min.getFullYear())) {
				gridCells += '\t\t<td id="cell' + (curYear - startYear + 1) + '-' + this.id + '" class="year unselectable"';
			} else if (this.options.max != null && (curYear > this.options.max.getFullYear())) {
				gridCells += '\t\t<td id="cell' + (curYear - startYear + 1) + '-' + this.id + '" class="year unselectable"';
			} else if (this.options.isYearDisabled && this.options.isYearDisabled(curYear)) {
				gridCells += '\t\t<td id="cell' + (curYear - startYear + 1) + '-' + this.id + '" class="year unselectable"';
			} else {
				gridCells += '\t\t<td id="cell' + (curYear - startYear + 1) + '-' + this.id + '" class="year selectable"';
			}
			gridCells += ' data-value="' + curYear + '"';
			gridCells += ' title="' + curYear + '"';
			gridCells += ' role="gridcell" tabindex="-1" aria-selected="false">' + curYear;
			gridCells +=  '</td>';
			var curPos = curYear - startYear;
			if (curPos == 4 || curPos == 9 || curPos == 14) {
				gridCells += '\t</tr>\n\t<tr id="row' + rowCount + '-' + this.id + '" role="row">\n';
				rowCount++;
			}
		}
		gridCells += '\t</tr>';
		var tbody = this.grid.querySelector('tbody');
		tbody.innerHTML = gridCells;
		this.gridType = 2; // 0 = days grid, 1 = months grid, 2 = years Grid
	} // end populateYearsCalendar()

	/**
	 *	showDaysOfPrevMonth() is a member function to show the days of the previous month
	 *
	 *	@param	(offset int) offset may be used to specify an offset for setting
	 *			focus on a day the specified number of days from the end of the month.
	 *	@return true if the previous month is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showDaysOfPrevMonth = function(offset) {
		// show the previous month
		var previousMonth = this.previousMonth(this.year, this.month);
		if (this.options.min != null &&
			(	previousMonth.year < this.options.min.getFullYear() ||
				(previousMonth.year == this.options.min.getFullYear() && previousMonth.month < this.options.min.getMonth()))) {
			return false;
		}
		this.month = previousMonth.month;
		this.year = previousMonth.year;
		// populate the calendar grid
		this.populateDaysCalendar();

		// if offset was specified, set focus on the last day - specified offset
		if (offset != null) {
			var allCells = this.grid.querySelectorAll('td');
			offset = allCells.length - offset;
			while (offset >= 0 && ! allCells[offset].classList.contains('selectable')) {
				offset--;
			}
			if (offset >= 0) {
				var day = allCells[offset].getAttribute('id');
				this.grid.setAttribute('aria-activedescendant', day);
				this.selectGridCell(day);
			}
		}
		return true;
	} // end showDaysOfPrevMonth()

	/**
	 *	showDaysOfMonth() is a member function to show the days of the specified month
	 *
	 *	@param	(month int) the month to show.
	 *	@return true if the  month is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showDaysOfMonth = function(month) {
		if (this.options.min != null &&
			(	this.year < this.options.min.getFullYear() ||
				(this.year == this.options.min.getFullYear() && month < this.options.min.getMonth()))) {
			return false;
		}
		if (this.options.max != null &&
			(	this.year > this.options.max.getFullYear() ||
				(this.year == this.options.max.getFullYear() && month > this.options.max.getMonth()))) {
			return false;
		}
		this.month = month;
		this.date = Math.min(this.date, this.getDaysInMonth(this.year, this.month));
		this.populateDaysCalendar();
		// update the table's activedescendant to point to the active day
		var active = this.grid.querySelector("tbody td[data-value='" + this.date + "']");
		this.selectGridCell(active.getAttribute('id'));
		return true;
	} // end showDaysOfMonth()

	/**
	 *	showMonthsOfPrevYear() is a member function to show the months of the previous year
	 *
	 *	@param	(offset int) offset may be used to specify an offset for setting
	 *			focus on a month the specified number of months from the end of the year.
	 *	@return true if the previous year is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showMonthsOfPrevYear = function(offset) {
		if (this.options.min != null && this.year - 1 < this.options.min.getFullYear()) {
			return false;
		}
		// show the previous year
		this.year--;
		// populate the calendar grid
		this.populateMonthsCalendar();

		// if offset was specified, set focus on the last month - specified offset
		if (offset != null) {
			var allCells = this.grid.querySelectorAll('td');
			offset = allCells.length - offset;
			while (offset >= 0 && ! allCells[offset].classList.contains('selectable')) {
				offset--;
			}
			if (offset >= 0) {
				var month = allCells[offset].getAttribute('id');
				this.grid.setAttribute('aria-activedescendant', month);
				this.selectGridCell(month);
			}
		}
		return true;
	} // end showMonthsOfPrevYear()

	/**
	 *	showMonthsOfYear() is a member function to show the months of the specified year
	 *
	 *	@param	(year int) the year to show.
	 *	@return true if the year is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showMonthsOfYear = function(year) {
		if (this.options.min != null && year < this.options.min.getFullYear()) {
			return false;
		}
		if (this.options.max != null && year > this.options.max.getFullYear()) {
			return false;
		}
		this.year = year;
		this.populateMonthsCalendar();
		// update the table's activedescendant to point to the active month
		var active = this.grid.querySelector("tbody td[data-value='" + this.month + "']");
		this.grid.setAttribute('aria-activedescendant', active.getAttribute('id'));
		this.selectGridCell(active.getAttribute('id'));
		return true;
	} // end showMonthsOfYear()

	/**
	 *	showYearsOfPrevRange() is a member function to show the years of the previous range of twenty years
	 *
	 *	@param	(offset int) offset may be used to specify an offset for setting
	 *			focus on a year the specified number of years from the end of the range.
	 *	@return true if the year - 20 is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showYearsOfPrevRange = function(offset) {
		if (this.options.min != null && this.year - 20 < this.options.min.getFullYear()) {
			return false;
		}
		// show the previous range
		this.year -= 20;
		// populate the calendar grid
		this.populateYearsCalendar();

		// if offset was specified, set focus on the last month - specified offset
		if (offset != null) {
			var allCells = this.grid.querySelectorAll('td');
			offset = allCells.length - offset;
			while (offset >= 0 && ! allCells[offset].classList.contains('selectable')) {
				offset--;
			}
			if (offset >= 0) {
				var year = allCells[offset].getAttribute('id');
				this.grid.setAttribute('aria-activedescendant', year);
				this.selectGridCell(year);
			}
		}
		return true;
	} // end showYearsOfPrevRange()

	/**
	 * showDaysOfNextMonth() is a member function to show the next month
	 *
	 *	@param	(offset int) offset may be used to specify an offset for setting
	 *			focus on a day the specified number of days from
	 *			the beginning of the month.
	 *	@return true if the nextmMonth is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showDaysOfNextMonth = function(offset) {
		// show the next month
		var nextMonth = this.nextMonth(this.year, this.month);
		if (this.options.max != null &&
			(	nextMonth.year > this.options.max.getFullYear() ||
				(nextMonth.year == this.options.max.getFullYear() && nextMonth.month > this.options.max.getMonth()))) {
			return false;
		}
		this.month = nextMonth.month;
		this.year = nextMonth.year;
		// populate the calendar grid
		this.populateDaysCalendar();

		// if offset was specified, set focus on the first day + specified offset
		if (offset != null) {
			var allCells = this.grid.querySelectorAll('td');
			offset--; // offset starts at 1 
			while (offset < allCells.length && ! allCells[offset].classList.contains('selectable')) {
				offset++;
			}
			if (offset < allCells.length) {
				var day = allCells[offset].getAttribute('id');
				this.grid.setAttribute('aria-activedescendant', day);
				this.selectGridCell(day);
			}
		}
		return true;
	} // end showDaysOfNextMonth()

	/**
	 * showMonthsOfNextYear() is a member function to show the months of next year
	 *
	 *	@param	(offset int) offset may be used to specify an offset for setting
	 *			focus on a month the specified number of month from
	 *			the beginning of the year.
	 *	@return true if the next year is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showMonthsOfNextYear = function(offset) {
		if (this.options.max != null && this.year + 1 > this.options.max.getFullYear()) {
			return false;
		}
		// show the next year
		this.year++;
		// populate the calendar grid
		this.populateMonthsCalendar();

		// if offset was specified, set focus on the first month + specified offset
		if (offset != null) {
			var allCells = this.grid.querySelectorAll('td');
			offset--; // offset starts at 1 
			while (offset < allCells.length && ! allCells[offset].classList.contains('selectable')) {
				offset++;
			}
			if (offset < allCells.length) {
				var month = allCells[offset].getAttribute('id');
				this.grid.setAttribute('aria-activedescendant', month);
				this.selectGridCell(month);
			}
		}
		return true;
	} // end showMonthsOfNextYear()

	/**
	 * showYearsOfNextRange() is a member function to show the years of next range of years
	 *
	 *	@param	(offset int) offset may be used to specify an offset for setting
	 *			focus on a year the specified number of years from
	 *			the beginning of the range.
	 *	@return true if the year + 20 is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showYearsOfNextRange = function(offset) {
		if (this.options.max != null && this.year + 20 > this.options.max.getFullYear()) {
			return false;
		}
		// show the next year
		this.year += 20;
		// populate the calendar grid
		this.populateYearsCalendar();

		// if offset was specified, set focus on the first day + specified offset
		if (offset != null) {
			var allCells = this.grid.querySelectorAll('td');
			offset--; // offset starts at 1 
			while (offset < allCells.length && ! allCells[offset].classList.contains('selectable')) {
				offset++;
			}
			if (offset < allCells.length) {
				var year = allCells[offset].getAttribute('id');
				this.grid.setAttribute('aria-activedescendant', year);
				this.selectGridCell(year);
			}
		}
		return true;
	} // end showYearsOfNextRange()

	/**
	 *	showDaysOfPrevYear() is a member function to show the previous year
	 *
	 *	@return true if the previous year is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showDaysOfPrevYear = function() {
		if (this.options.min != null &&
			(	this.year - 1 < this.options.min.getFullYear() ||
				(this.year - 1 == this.options.min.getFullYear() && this.month < this.options.min.getMonth()))) {
			return false;
		}
		// decrement the year
		this.year--;

		// populate the calendar grid
		this.populateDaysCalendar();
		return true;
	} // end showDaysOfPrevYear()

	/**
	 *	showDaysOfNextYear() is a member function to show the next year
	 *
	 *	@return true if the next year is between the minimum and the maximum date otherwise return false
	 */
	Datepicker.prototype.showDaysOfNextYear = function() {
		if (this.options.max != null &&
			(	this.year + 1 > this.options.max.getFullYear() ||
				(this.year + 1 == this.options.max.getFullYear() && this.month > this.options.max.getMonth()))) {
			return false;
		}
		// increment the year
		this.year++;

		// populate the calendar grid
		this.populateDaysCalendar();
		return true;
	} // end showDaysOfNextYear()

	/**
	 *	bindHandlers() is a member function to bind event handlers for the widget
	 *
	 *	@return N/A
	 */
	Datepicker.prototype.bindHandlers = function() {
		var self = this;

		// bind button handlers
		this.fastprev.addEventListener('click', function(e) {
			return self.handleFastPrevClick(e);
		}, false);
		this.prev.addEventListener('click', function(e) {
			return self.handlePrevClick(e);
		}, false);
		this.next.addEventListener('click', function(e) {
			return self.handleNextClick(e);
		}, false);
		this.fastnext.addEventListener('click', function(e) {
			return self.handleFastNextClick(e);
		}, false);
		this.monthObj.addEventListener('click', function(e) {
			return self.handleMonthClick(e);
		}, false);
		this.monthObj.addEventListener('keydown', function(e) {
			return self.handleMonthKeyDown(e);
		}, false);
		this.fastprev.addEventListener('keydown', function(e) {
			return self.handleFastPrevKeyDown(e);
		}, false);
		this.prev.addEventListener('keydown', function(e) {
			return self.handlePrevKeyDown(e);
		}, false);
		this.next.addEventListener('keydown', function(e) {
			return self.handleNextKeyDown(e);
		}, false);
		this.fastnext.addEventListener('keydown', function(e) {
			return self.handleFastNextKeyDown(e);
		}, false);
		if (this.options.modal == true) {
			this.close.addEventListener('click', function(e) {
				return self.handleCloseClick(e);
			}, false);
			this.close.addEventListener('keydown', function(e) {
				return self.handleCloseKeyDown(e);
			}, false);
		}

		// bind grid handlers
		this.grid.addEventListener('keydown', function(e) {
			return self.handleGridKeyDown(e);
		}, false);
		this.grid.addEventListener('keypress', function(e) {
			return self.handleGridKeyPress(e);
		}, false);
		this.grid.addEventListener('focus', function(e) {
			return self.handleGridFocus(e);
		}, false);
		this.grid.addEventListener('blur', function(e) {
			return self.handleGridBlur(e);
		}, false);
		this.grid.addEventListener('click', function(e) {
			// loop parent nodes from the target to the delegation node
			for (var target = e.target; target && target != this; target = target.parentNode) {
				if (target.matches('td')) {
					return self.handleGridClick(target, e);
				}
			}
		}, false);

		// bind target handlers
		this.target.addEventListener('change', function(e) {
			var date = self.parseDate(this.value);
			self.updateLinked(date);
		}, false);
	} // end bindHandlers();

	/**
	 *	handleFastPrevClick() is a member function to process click events for the fast prev month button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleFastPrevClick = function(e) {
		if (this.showDaysOfPrevYear()) {
			var active = this.grid.getAttribute('aria-activedescendant');
			if (this.month != this.curMonth || this.year != this.curYear) {
				this.grid.setAttribute('aria-activedescendant', 'cell1' + '-' + this.id);
				this.selectGridCell('cell1' + '-' + this.id);
			} else {
				this.grid.setAttribute('aria-activedescendant', active);
				this.selectGridCell(active);
			}
		}
		e.stopPropagation();
		return false;
	} // end handleFastPrevClick()

	/**
	 *	handlePrevClick() is a member function to process click events for the prev month button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handlePrevClick = function(e) {
		var active = this.grid.getAttribute('aria-activedescendant');
		switch (this.gridType) {
			case 0: // days grid
				var ok;
				if (e.ctrlKey) {
					ok = this.showDaysOfPrevYear();
				} else {
					ok = this.showDaysOfPrevMonth();
				}
				if (ok) {
					if (this.month != this.curMonth || this.year != this.curYear) {
						this.grid.setAttribute('aria-activedescendant', 'cell1' + '-' + this.id);
						this.selectGridCell('cell1' + '-' + this.id);
					} else {
						this.grid.setAttribute('aria-activedescendant', active);
						this.selectGridCell(active);
					}
				}
				break;
			case 1: // months grid
				if (this.showMonthsOfPrevYear()) {
					if (this.year != this.curYear) {
						this.grid.setAttribute('aria-activedescendant', 'cell1' + '-' + this.id);
						this.selectGridCell('cell1' + '-' + this.id);
					} else {
						this.grid.setAttribute('aria-activedescendant', active);
						this.selectGridCell(active);
					}
				}
				break;
			case 2: // years grid
				if (this.showYearsOfPrevRange()) {
					this.grid.setAttribute('aria-activedescendant', 'cell1' + '-' + this.id);
					this.selectGridCell('cell1' + '-' + this.id);
				}
				break;
		}
		e.stopPropagation();
		return false;
	} // end handlePrevClick()

	/**
	 *	handleMonthClick() is a member function to process click events for the month header
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleMonthClick = function(e) {
		this.changeGrid(e);
		e.stopPropagation();
		return false;
	} // end handleMonthClick()

	/**
	 *	handleNextClick() is a member function to process click events for the next month button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleNextClick = function(e) {
		var active = this.grid.getAttribute('aria-activedescendant');
		switch (this.gridType) {
			case 0: // days grid
				var ok;
				if (e.ctrlKey) {
					ok = this.showDaysOfNextYear();
				} else {
					ok = this.showDaysOfNextMonth();
				}
				if (ok) {
					if (this.month != this.curMonth || this.year != this.curYear) {
						this.grid.setAttribute('aria-activedescendant', 'cell1' + '-' + this.id);
						this.selectGridCell('cell1' + '-' + this.id);
					} else {
						this.grid.setAttribute('aria-activedescendant', active);
						this.selectGridCell(active);
					}
				}
				break;
			case 1: // months grid
				if (this.showMonthsOfNextYear()) {
					if (this.year != this.curYear) {
						this.grid.setAttribute('aria-activedescendant', 'cell1' + '-' + this.id);
						this.selectGridCell('cell1' + '-' + this.id);
					} else {
						this.grid.setAttribute('aria-activedescendant', active);
						this.selectGridCell(active);
					}
				}
				break;
			case 2: // years grid
				if (this.showYearsOfNextRange()) {
					this.grid.setAttribute('aria-activedescendant', 'cell1' + '-' + this.id);
					this.selectGridCell('cell1' + '-' + this.id);
				}
				break;
		}
		e.stopPropagation();
		return false;

	} // end handleNextClick()

	/**
	 *	handleFastNextClick() is a member function to process click events for the fast next month button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleFastNextClick = function(e) {
		if (this.showDaysOfNextYear()) {
			var active = this.grid.getAttribute('aria-activedescendant');
			if (this.month != this.curMonth || this.year != this.curYear) {
				this.grid.setAttribute('aria-activedescendant', 'cell1' + '-' + this.id);
				this.selectGridCell('cell1' + '-' + this.id);
			} else {
				this.grid.setAttribute('aria-activedescendant', active);
				this.selectGridCell(active);
			}
		}
		e.stopPropagation();
		return false;

	} // end handleFastNextClick()

	/**
	 *	handleCloseClick() is a member function to process click events for the close button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleCloseClick = function(e) {
		// dismiss the dialog box
		this.hide();
		e.stopPropagation();
		return false;
	} // end handleCloseClick()

	/**
	 *	handleFastPrevKeyDown() is a member function to process keydown events for the fast prev month button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleFastPrevKeyDown = function(e) {
		if (e.altKey) {
			return true;
		}
		switch (e.keyCode) {
			case this.keys.tab:
				{
					if (this.options.modal == false || e.ctrlKey) {
						return true;
					}
					if (e.shiftKey) {
						this.close.dispatchEvent(new FocusEvent('focus', {
							bubbles: true,
							cancelable: true
						}));
					} else {
						this.prev.dispatchEvent(new FocusEvent('focus', {
							bubbles: true,
							cancelable: true
						}));
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.enter:
			case this.keys.space:
				{
					if (e.shiftKey || e.ctrlKey) {
						return true;
					}
					this.showDaysOfPrevYear();
					e.stopPropagation();
					return false;

				}
			case this.keys.esc:
				{
					// dismiss the dialog box
					this.hide();
					e.stopPropagation();
					return false;
				}
		}
		return true;
	} // end handleFastPrevKeyDown()

	/**
	 *	handlePrevKeyDown() is a member function to process keydown events for the prev month button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handlePrevKeyDown = function(e) {
		if (e.altKey) {
			return true;
		}
		switch (e.keyCode) {
			case this.keys.tab:
				{
					if (this.options.modal == false || e.ctrlKey) {
						return true;
					}
					if (e.shiftKey) {
						if (this.gridType == 0) {
							this.fastprev.dispatchEvent(new FocusEvent('focus', {
								bubbles: true,
								cancelable: true
							}));
						} else {
							this.close.dispatchEvent(new FocusEvent('focus', {
								bubbles: true,
								cancelable: true
							}));
						}
					} else {
						this.monthObj.dispatchEvent(new FocusEvent('focus', {
							bubbles: true,
							cancelable: true
						}));
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.enter:
			case this.keys.space:
				{
					if (e.shiftKey) {
						return true;
					}
					switch (this.gridType) {
						case 0: // days grid
							if (e.ctrlKey) {
								this.showDaysOfPrevYear();
							} else {
								this.showDaysOfPrevMonth();
							}
							break;
						case 1: // months grid
							this.showMonthsOfPrevYear();
							break;
						case 2: // years grid
							this.showYearsOfPrevRange();
							break;
					}
					e.stopPropagation();
					return false;

				}
			case this.keys.esc:
				{
					// dismiss the dialog box
					this.hide();
					e.stopPropagation();
					return false;
				}
		}
		return true;
	} // end handlePrevKeyDown()

	/**
	 *	handleMonthKeyDown() is a member function to process keydown events for the month title
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleMonthKeyDown = function(e) {
		if (e.altKey) {
			return true;
		}
		switch (e.keyCode) {
			case this.keys.tab:
				{
					if (this.options.modal == false || e.ctrlKey) {
						return true;
					}
					if (e.shiftKey) {
						this.prev.dispatchEvent(new FocusEvent('focus', {
							bubbles: true,
							cancelable: true
						}));
					} else {
						this.next.dispatchEvent(new FocusEvent('focus', {
							bubbles: true,
							cancelable: true
						}));
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.enter:
			case this.keys.space:
				{
					this.changeGrid(e);
					e.stopPropagation();
					return false;

				}
			case this.keys.esc:
				{
					// dismiss the dialog box
					this.hide();
					e.stopPropagation();
					return false;
				}
		}
		return true;
	} // end handleMonthKeyDown()

	/**
	 *	handleNextKeyDown() is a member function to process keydown events for the next month button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleNextKeyDown = function(e) {
		if (e.altKey) {
			return true;
		}
		switch (e.keyCode) {
			case this.keys.tab:
				{
					if (this.options.modal == false || e.ctrlKey) {
						return true;
					}
					if (e.shiftKey) {
						this.monthObj.focus();
					} else {
						if (this.gridType == 0) {
							this.fastnext.dispatchEvent(new FocusEvent('focus', {
								bubbles: true,
								cancelable: true
							}));
						} else {
							this.grid.dispatchEvent(new FocusEvent('focus', {
								bubbles: true,
								cancelable: true
							}));
						}
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.enter:
			case this.keys.space:
				{
					switch (this.gridType) {
						case 0: // days grid
							if (e.ctrlKey) {
								this.showDaysOfNextYear();
							} else {
								this.showDaysOfNextMonth();
							}
							break;
						case 1: // months grid
							this.showMonthsOfNextYear();
							break;
						case 2: // years grid
							this.showYearsOfNextRange();
							break;
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.esc:
				{
					// dismiss the dialog box
					this.hide();
					e.stopPropagation();
					return false;
				}
		}
		return true;
	} // end handleNextKeyDown()

	/**
	 *	handleFastNextKeyDown() is a member function to process keydown events for the fast next month button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleFastNextKeyDown = function(e) {
		if (e.altKey) {
			return true;
		}
		switch (e.keyCode) {
			case this.keys.tab:
				{
					if (this.options.modal == false || e.ctrlKey) {
						return true;
					}
					if (e.shiftKey) {
						this.next.dispatchEvent(new FocusEvent('focus', {
							bubbles: true,
							cancelable: true
						}));
					} else {
						this.grid.dispatchEvent(new FocusEvent('focus', {
							bubbles: true,
							cancelable: true
						}));
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.enter:
			case this.keys.space:
				{
					this.showDaysOfNextYear();
					e.stopPropagation();
					return false;
				}
			case this.keys.esc:
				{
					// dismiss the dialog box
					this.hide();
					e.stopPropagation();
					return false;
				}
		}
		return true;
	} // end handleFastNextKeyDown()

	/**
	 *	handleCloseKeyDown() is a member function to process keydown events for the close button
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleCloseKeyDown = function(e) {
		if (e.altKey) {
			return true;
		}
		switch (e.keyCode) {
			case this.keys.tab:
				{
					if (e.ctrlKey) {
						return true;
					}
					if (e.shiftKey) {
						this.grid.focus();
					} else {
						if (this.gridType == 0) {
							this.fastprev.dispatchEvent(new FocusEvent('focus', {
								bubbles: true,
								cancelable: true
							}));
						} else {
							this.prev.dispatchEvent(new FocusEvent('focus', {
								bubbles: true,
								cancelable: true
							}));
						}
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.enter:
			case this.keys.esc:
			case this.keys.space:
				{
					if (e.shiftKey || e.ctrlKey) {
						return true;
					}
					// dismiss the dialog box
					this.hide();
					e.stopPropagation();
					return false;

				}
		}
		return true;
	} // end handlePrevKeyDown()

	/**
	 *	handleGridKeyDown() is a member function to process keydown events for the Datepicker grid
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleGridKeyDown = function(e) {
		var curCell = document.querySelector('#' + this.grid.getAttribute('aria-activedescendant'));
		var cells = this.grid.querySelectorAll('td.selectable');
		var colCount = this.grid.querySelector('tbody tr').querySelectorAll('td').length;
		if (e.altKey && e.keyCode != this.keys.pageup && e.keyCode != this.keys.pagedown) {
			return true;
		}
		switch (e.keyCode) {
			case this.keys.tab:
				{
					if (this.options.modal == true) {
						if (e.shiftKey) {
							if (this.gridType == 0) {
								this.fastnext.dispatchEvent(new FocusEvent('focus', {
									bubbles: true,
									cancelable: true
								}));
							} else {
								this.next.dispatchEvent(new FocusEvent('focus', {
									bubbles: true,
									cancelable: true
								}));
							}
						} else {
							this.close.dispatchEvent(new FocusEvent('focus', {
								bubbles: true,
								cancelable: true
							}));
						}
						e.stopPropagation()
						return false;
					} else {
						// dismiss the dialog box
						this.hide();
						this.handleTabOut(e);
						e.stopPropagation();
						return false;
					}
					break;
				}
			case this.keys.enter:
			case this.keys.space:
				{
					if (e.ctrlKey) {
						return true;
					}
					switch (this.gridType) {
						case 0: // days grid
							// update the target box
							this.update();
							// dismiss the dialog box
							this.hide();
							break;
						case 1: // months grid
							this.showDaysOfMonth(parseInt(curCell.getAttribute('data-value'), 10));
							break;
						case 2: // years grid
							this.showMonthsOfYear(parseInt(curCell.getAttribute('data-value'), 10));
							break;
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.esc:
				{
					// dismiss the dialog box
					this.hide();
					e.stopPropagation();
					return false;
				}
			case this.keys.left:
			case this.keys.right:
				{
					if ((e.keyCode == this.keys.left && this.locales.directionality === 'LTR')  || (e.keyCode == this.keys.right && this.locales.directionality === 'RTL')) {
						if (e.ctrlKey || e.shiftKey) {
							return true;
						}
						var cellIndex = Utils.index(curCell, cells) - 1;
						var prevCell = null;
						if (cellIndex >= 0) {
							prevCell = cells[cellIndex];
							this.unSelectGridCell(curCell.getAttribute('id'));
							this.grid.setAttribute('aria-activedescendant', prevCell.getAttribute('id'));
							this.selectGridCell(prevCell.getAttribute('id'));
						} else {
							switch (this.gridType) {
								case 0: // days grid
									this.showDaysOfPrevMonth(1);
									break;
								case 1: // months grid
									this.showMonthsOfPrevYear(1);
									break;
								case 2: // years grid
									this.showYearsOfPrevRange(1);
									break;
							}
						}
						e.stopPropagation();
						return false;
					} else {
						if (e.ctrlKey || e.shiftKey) {
							return true;
						}
						var cellIndex = Utils.index(curCell, cells) + 1;
						var nextCell = null;
						if (cellIndex < cells.length) {
							nextCell = cells[cellIndex];
							this.unSelectGridCell(curCell.getAttribute('id'));
							this.grid.setAttribute('aria-activedescendant', nextCell.getAttribute('id'));
							this.selectGridCell(nextCell.getAttribute('id'));
						} else {
							switch (this.gridType) {
								case 0: // days grid
									// move to the next month
									this.showDaysOfNextMonth(1);
									break;
								case 1: // months grid
									this.showMonthsOfNextYear(1);
									break;
								case 2: // years grid
									this.showYearsOfNextRange(1);
									break;
							}
						}
						e.stopPropagation();
						return false;
					}
				}
			case this.keys.up:
				{
					if (e.ctrlKey || e.shiftKey) {
						return true;
					}
					var allCells = this.grid.querySelectorAll('td');
					var cellIndex = Utils.index(curCell, allCells) - colCount;
					var prevCell = null;
					while (cellIndex >= 0 && ! allCells[cellIndex].classList.contains('selectable')) {
						cellIndex--;
					}
					if (cellIndex >= 0) {
						prevCell = allCells[cellIndex];
						this.unSelectGridCell(curCell.getAttribute('id'));
						this.grid.setAttribute('aria-activedescendant', prevCell.getAttribute('id'));
						this.selectGridCell(prevCell.getAttribute('id'));
					} else {
						// move to appropriate day in previous month
						cellIndex = colCount - Utils.index(curCell, allCells) % colCount;
						switch (this.gridType) {
							case 0: // days grid
								this.showDaysOfPrevMonth(cellIndex);
								break;
							case 1: // months grid
								this.showMonthsOfPrevYear(cellIndex);
								break;
							case 2: // years grid
								this.showYearsOfPrevRange(cellIndex);
								break;
						}
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.down:
				{
					if (e.ctrlKey || e.shiftKey) {
						return true;
					}
					var allCells = this.grid.querySelectorAll('td');
					var cellIndex = Utils.index(curCell, allCells) + colCount;
					while (cellIndex < allCells.length && ! allCells[cellIndex].classList.contains('selectable')) {
						cellIndex++;
					}
					if (cellIndex < allCells.length) {
						var nextCell = allCells[cellIndex];
						this.unSelectGridCell(curCell.getAttribute('id'));
						this.grid.setAttribute('aria-activedescendant', nextCell.getAttribute('id'));
						this.selectGridCell(nextCell.getAttribute('id'));
					} else {
						// move to appropriate day in next month
						cellIndex = Utils.index(curCell, allCells) % colCount + 1;
						switch (this.gridType) {
							case 0: // days grid
								this.showDaysOfNextMonth(cellIndex);
								break;
							case 1: // months grid
								this.showMonthsOfNextYear(cellIndex);
								break;
							case 2: // years grid
								this.showYearsOfNextRange(cellIndex);
								break;
						}
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.pageup:
				{
					var active = this.grid.getAttribute('aria-activedescendant');
					if (e.shiftKey || e.ctrlKey) {
						return true;
					}
					e.preventDefault();
					var ok = false;
					switch (this.gridType) {
						case 0: // days grid
							if (e.altKey) {
								e.stopImmediatePropagation();
								ok = this.showDaysOfPrevYear();
							} else {
								ok = this.showDaysOfPrevMonth();
							}
							break;
						case 1: // months grid
							ok = this.showMonthsOfPrevYear();
							break;
						case 2: // years grid
							ok = this.showYearsOfPrevRange();
							break;
					}
					if (ok) {
						if (document.querySelector('#' + active).getAttribute('id') == undefined) {
							cells = this.grid.querySelectorAll('td.selectable');
							var lastCell = cells[cells.length - 1];
							this.grid.setAttribute('aria-activedescendant', lastCell.getAttribute('id'));
							this.selectGridCell(lastCell.getAttribute('id'));
						} else {
							this.selectGridCell(active);
						}
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.pagedown:
				{
					var active = this.grid.getAttribute('aria-activedescendant');
					if (e.shiftKey || e.ctrlKey) {
						return true;
					}
					e.preventDefault();
					var ok = false;
					switch (this.gridType) {
						case 0: // days grid
							if (e.altKey) {
								e.stopImmediatePropagation();
								ok = this.showDaysOfNextYear();
							} else {
								ok = this.showDaysOfNextMonth();
							}
							break;
						case 1: // months grid
							ok = this.showMonthsOfNextYear();
							break;
						case 2: // years grid
							ok = this.showYearsOfNextRange();
							break;
					}
					if (ok) {
						if (document.querySelector('#' + active).getAttribute('id') == undefined) {
							cells = this.grid.querySelectorAll('td.selectable');
							var lastCell = cells[cells.length - 1];
							this.grid.setAttribute('aria-activedescendant', lastCell.getAttribute('id'));
							this.selectGridCell(lastCell.getAttribute('id'));
						} else {
							this.selectGridCell(active);
						}
					}
					e.stopPropagation();
					return false;
				}
			case this.keys.home:
				{
					if (e.ctrlKey || e.shiftKey) {
						return true;
					}
					var firstCell = cells[0];
					this.unSelectGridCell(curCell.getAttribute('id'));
					this.grid.setAttribute('aria-activedescendant', firstCell.getAttribute('id'));
					this.selectGridCell(firstCell.getAttribute('id'));
					e.stopPropagation();
					return false;
				}
			case this.keys.end:
				{
					if (e.ctrlKey || e.shiftKey) {
						return true;
					}
					var lastCell = cells[cells.length - 1];
					this.unSelectGridCell(curCell.getAttribute('id'));
					this.grid.setAttribute('aria-activedescendant', lastCell.getAttribute('id'));
					this.selectGridCell(lastCell.getAttribute('id'));
					e.stopPropagation();
					return false;
				}
		}
		return true;
	} // end handleGridKeyDown()

	/**
	 *	handleGridKeyPress() is a member function to consume keypress events for browsers that
	 *	use keypress to scroll the screen and manipulate tabs
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 * 	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleGridKeyPress = function(e) {
		if (e.altKey) {
			return true;
		}
		switch (e.keyCode) {
			case this.keys.tab:
			case this.keys.enter:
			case this.keys.space:
			case this.keys.esc:
			case this.keys.left:
			case this.keys.right:
			case this.keys.up:
			case this.keys.down:
			case this.keys.pageup:
			case this.keys.pagedown:
			case this.keys.home:
			case this.keys.end:
				{
					e.stopPropagation();
					return false;
				}
		}
		return true;
	} // end handleGridKeyPress()

	/**
	 *	handleGridClick() is a member function to process mouse click events for the Datepicker grid
	 *
	 *	@param (id string) id is the id of the object triggering the event
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	Datepicker.prototype.handleGridClick = function(id, e) {
		var cell = id;
		if (cell.matches('.empty') || cell.matches('.unselectable')) {
			return true;
		}
		this.grid.querySelectorAll('.focus').forEach( focused => {
			focused.classList.remove('focus');
			focused.setAttribute('aria-selected', 'false');
			focused.setAttribute('tabindex', -1);
		});
		switch (this.gridType) {
			case 0: // days grid
				this.grid.setAttribute('aria-activedescendant', cell.getAttribute('id'));
				this.selectGridCell(cell.getAttribute('id'));
				// update the target box
				this.update();
				// dismiss the dialog box
				this.hide();
				break;
			case 1: // months grid
				this.showDaysOfMonth(parseInt(cell.getAttribute('data-value'), 10));
				break;
			case 2: // years grid
				this.showMonthsOfYear(parseInt(cell.getAttribute('data-value'), 10));
				break;
		}
		e.stopPropagation();
		return false;
	} // end handleGridClick()

	/**
	 *	handleGridFocus() is a member function to process focus events for the Datepicker grid
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) true
	 */
	Datepicker.prototype.handleGridFocus = function(e) {
		var active = this.grid.getAttribute('aria-activedescendant');
		if (document.querySelector('#' + active).getAttribute('id') == undefined) {
			var cells = this.grid.querySelectorAll('td.selectable');
			var lastCell = cells[cells.length - 1];
			this.grid.setAttribute('aria-activedescendant', lastCell.getAttribute('id'));
			this.selectGridCell(lastCell.getAttribute('id'));
		} else {
			this.selectGridCell(active);
		}
		return true;
	} // end handleGridFocus()

	/**
	 *	handleGridBlur() is a member function to process blur events for the Datepicker grid
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) true
	 */
	Datepicker.prototype.handleGridBlur = function(e) {
		this.unSelectGridCell(this.grid.getAttribute('aria-activedescendant'));
		return true;
	} // end handleGridBlur()

	/**
	 *	handleTabOut() is a member function to process tab key in Datepicker grid
	 *
	 * @param (e obj) e is the event object associated with the event
	 * @return (boolean) true
	 */
	Datepicker.prototype.handleTabOut = function(e) {
		var fields = document.body.querySelectorAll('input, button, select, textarea, a[href]');
		fields = Array.prototype.filter.call(fields, (item) => {
			return item.tabIndex >= 0
				&& window.getComputedStyle(item).display !== "none"
				&& item.offsetWidth > 0
				&& item.offsetHeight > 0
				&& !item.classList.contains('datepicker-button');
		});
		var index = Array.prototype.indexOf.call(fields, this.target);
		if ( index > -1 && index < fields.length ) {
			if (e.shiftKey) {
				if (index > 0) {
					index--;
				}
			} else {
				if (index + 1 < fields.length) {
					index++;
				}
			}
			fields[index].focus();
			e.preventDefault();
		}
		return true;
	} // end handleTabOut()

	/**
	 *	changeGrid() is a member function to change the calendar after click or enter into the calendar title
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *	@return true
	 */
	Datepicker.prototype.changeGrid = function(e) {
		switch (this.gridType) {
			case 0: // days grid
				this.populateMonthsCalendar();
				if (this.year != this.curYear) {
					var cells = this.grid.querySelectorAll('td.selectable');
					this.grid.setAttribute('aria-activedescendant', cells[0].getAttribute('id'));
				} else {
					this.grid.setAttribute('aria-activedescendant', this.grid.querySelector('.curMonth').getAttribute('id'));
				}
				this.selectGridCell(this.grid.getAttribute('aria-activedescendant'));
				break;
			case 2: // years grid
				if (e.shiftKey) {
					// goto previous twenty years
					this.year -= 20;
				} else {
					// goto next twenty years
					this.year += 20;
				}
			case 1: // months grid
				this.populateYearsCalendar();
				if (this.year != this.curYear) {
					var cells = this.grid.querySelectorAll('td.selectable');
					this.grid.setAttribute('aria-activedescendant', cells[0].getAttribute('id'));
				} else {
					this.grid.setAttribute('aria-activedescendant', this.grid.querySelector('.curYear').getAttribute('id'));
				}
				this.selectGridCell(this.grid.getAttribute('aria-activedescendant'));
				break;
		}
		return true;
	} // end changeGrid()

	/**
	 *	selectGridCell() is a member function to put focus on the current cell of the grid.
	 *
	 *	@return N/A
	 */
	Datepicker.prototype.selectGridCell = function(cellId) {
		var cell = document.querySelector('#' + cellId);
		cell.classList.add('focus');
		cell.setAttribute('aria-selected', 'true');
		cell.setAttribute('tabindex', 0);
		cell.focus();
	} // end selectGridCell()

	/**
	 *	unSelectGridCell() is a member function to remove focus on the current cell of the grid.
	 *
	 *	@return N/A
	 */
	Datepicker.prototype.unSelectGridCell = function(cellId) {
		var cell = document.querySelector('#' + cellId);
		cell.classList.remove('focus');
		cell.setAttribute('aria-selected', 'false');
		cell.setAttribute('tabindex', -1);
	} // end unSelectGridCell()

	/**
	 *	update() is a member function to update the target textbox.
	 *
	 *	@return N/A
	 */
	Datepicker.prototype.update = function() {
		var curDay = document.querySelector('#' + this.grid.getAttribute('aria-activedescendant'));
		var date = new Date(this.year, this.month, parseInt(curDay.getAttribute('data-value'), 10));
		var val = this.formatDate(date, this.options.outputFormat);
		this.target.value = val;
		this.target.removeAttribute('aria-invalid');
		var formGroup = this.target.closest('.field-container');
		while (formGroup !== null) {
			formGroup.classList.remove('has-error');
			formGroup = formGroup.parentElement.closest('.field-container');
		}
		this.target.dispatchEvent(new Event('change'));
		if (this.options.onUpdate) {
			this.options.onUpdate(val);
		}
	} // end update()

	/**
	 *	updateLinked() is a member function to update the linked textbox.
	 *
	 *	@param	(date Date) the current value of this Datepicker date.
	 *	@return N/A
	 */
	Datepicker.prototype.updateLinked = function(date) {
		if (this.options.previous !== null && this.options.previous.value !== '') {
			var previousDate = this.options.previous.datepicker.getDate();
			if (this.options.allowSameDate) {
				if (previousDate > date) {
					var previousVal = this.formatDate(date, this.options.previous.datepicker.outputFormat());
					this.options.previous.value = previousVal;
				}
			} else {
				if (previousDate >= date) {
					var previousVal = this.formatDate(new Date(date.getTime() - 60*60*24*1000), this.options.previous.datepicker.outputFormat());
					this.options.previous.value = previousVal;
				}
			}
		}
		if (this.options.next !== null && this.options.next.value !== '') {
			var nextDate = this.options.next.datepicker.getDate();
			if (this.options.allowSameDate) {
				if (nextDate < date) {
					var nextVal = this.formatDate(date, this.options.next.datepicker.outputFormat());
					this.options.next.value = nextVal;
				}
			} else {
				if (nextDate <= date) {
					var nextVal = this.formatDate(new Date(date.getTime() + 60*60*24*1000), this.options.next.datepicker.outputFormat());
					this.options.next.value = nextVal;
				}
			}
		}
		if (this.options.next !== null) {
			if (this.options.allowSameDate) {
				this.options.next.datepicker.min(date);
			} else {
				this.options.next.datepicker.min(new Date(date.getTime() + 60*60*24*1000));
			}
		}
	} // end updateLinked()

	/**
	 *	hideObject() is a member function to hide an element of the datepicker.
	 *
	 *	@param element the element to hide
	 *	@return N/A
	 */
	Datepicker.prototype.hideObject = function(element) {
		element.setAttribute('aria-hidden', true);
		element.style.display= 'none';
	} // end hideObject()

	/**
	 *	showObject() is a member function to show an element of the datepicker.
	 *
	 *	@param element the element to show
	 *	@return N/A
	 */
	Datepicker.prototype.showObject = function(element) {
		element.setAttribute('aria-hidden', false);
		element.style.display = '';
	} // end showObject()

	/**
	 *	show() is a member function to show the Datepicker and give it focus.
	 *
	 *	@return N/A
	 */
	Datepicker.prototype.show = function() {
		var self = this;
		document.querySelectorAll('.datepicker-calendar').forEach( cal => {
			cal.dispatchEvent(new CustomEvent('ab.datepicker.opening', {
				detail: [self.id]
			}));
		});
		if (self.options.modal == true) {
			if (!self.modalEventHandler) {
				self.modalEventHandler = function(e) {
					//ensure focus remains on the dialog
					self.grid.focus();
					// Consume all mouse events and do nothing
					e.stopPropagation();
					return false;
				};
			}
			// Bind an event listener to the document to capture all mouse events to make dialog modal
			for (var eventName of ['click', 'mousedown', 'mouseup']) {
				document.addEventListener(eventName, self.modalEventHandler);
			}
			self.greyOut(true);
			var zIndex = parseInt(document.querySelector('#datepicker-overlay').style.zIndex, 10) || 40;
			this.calendar.style.zIndex = zIndex + 1;
		} else {
			// Bind an event listener to the document to capture only the mouse click event
			document.addEventListener('click',  self.handleDocumentClick.bind(self));
			self.calendar.addEventListener('ab.datepicker.opening', function openingListener (e, id) {
				if (id != self.id) {
					self.hide();
				} else {
					//ensure focus remains on the dialog
					self.grid.focus();
				}
				self.calendar.removeEventListener('ab.datepicker.opening', openingListener);
			}, false);
		}
		this.calendar.addEventListener('ab.datepicker.opened', function openedListener(e, id) {
			if (id == self.id) {
				self.grid.focus();
			}
			self.calendar.removeEventListener('ab.datepicker.opened', openedListener);
		}, false);

		// adjust position of the calendar
		var groupOffsetTop = Math.max(0, Math.floor(Utils.offsetTop(this.group)));
		var groupOffsetLeft = Math.max(0, Math.floor(Utils.offsetLeft(this.group)));
		var calendarHeight = Utils.outerHeight(this.calendar);
		var groupAbsoluteTop = this.group.getBoundingClientRect().top;
		var groupHeight = Utils.outerHeight(this.group, true);
		var roomBefore = Math.floor(groupAbsoluteTop);
		var roomAfter = Math.floor(window.innerHeight - (groupAbsoluteTop + groupHeight));
		if (roomAfter < calendarHeight && roomAfter < roomBefore) {
			// show calendar above group
			this.calendar.classList.add('above');
			this.calendar.style.top = (groupOffsetTop - calendarHeight) + 'px';
			this.calendar.style.left = groupOffsetLeft + 'px';
		} else {
			// show calendar below group
			this.calendar.classList.add('below');
			this.calendar.style.top = (groupOffsetTop + groupHeight) + 'px';
			this.calendar.style.left = groupOffsetLeft + 'px';
		}
		// show the dialog
		Utils.fadeIn(this.calendar, function () {
			this.style.display = '';
			this.setAttribute('aria-hidden', 'false');
		});
		document.querySelectorAll('.datepicker-calendar').forEach ( cal => {
			cal.dispatchEvent(new CustomEvent('ab.datepicker.opened', {
				detail: [self.id]
			}));
		});
	} // end show()

	/**
	 *	refresh() is a member function to refesh the datepicker content when an option change.
	 *
	 *	@return N/A
	 */
	Datepicker.prototype.refresh = function() {
		this.drawCalendarHeader();
		switch	(this.gridType) {
			case 0:
				this.populateDaysCalendar();
				break;
			case 1:
				this.populateMonthsCalendar();
				break;
			case 2:
				this.populateYearsCalendar();
				break;
		}
	} // end refresh()

	/**
	 *	handleDocumentClick() is a member function to handle click on document.
	 *
	 *	@param (e obj) e is the event object associated with the event
	 *
	 *	@return (boolean) false if consuming event, true if propagating
	 */
	 Datepicker.prototype.handleDocumentClick = function(e) {
		if (e.target.closest('#datepicker-calendar-' + this.id) === null) {
			this.hide();
			return true;
		} else {
			//ensure focus remains on the dialog
			this.grid.focus();
			// Consume all mouse events and do nothing
			e.stopPropagation();
			return false;
		}
	} // end handleDocumentClick()

	/**
	 *	hide() is a member function to hide the Datepicker and remove focus.
	 *
	 *	@return N/A
	 */
	 Datepicker.prototype.hide = function(omitSettingFocus) {
		if (this.options.inline == false) {
			var self = this;
			// unbind the modal event sinks
			if (this.options.modal == true) {
				if (this.modalEventHandler) {
					for (var eventName of ['click', 'mousedown', 'mouseup']) {
						document.removeEventListener(eventName, this.modalEventHandler);
					}
				}
				this.greyOut(false);
			} else {
				document.removeEventListener('click', self.handleDocumentClick);
			}
			// hide the dialog
			Utils.fadeOut(this.calendar, function () {
				this.style.display = 'none';
				this.setAttribute('aria-hidden', 'true');
				this.classList.remove('above', 'below');
			});
			document.querySelectorAll('.datepicker-calendar').forEach ( cal => {
				cal.dispatchEvent(new CustomEvent('ab.datepicker.closed', {
					detail: [self.id]
				}));
			});
			// set focus on the focus target
			if (!omitSettingFocus) {
				this.target.dispatchEvent(new FocusEvent('focus', {
					view: window,
					bubbles: true,
					cancelable: true
				}));
			}
		}
	} // end hide()

	/**
	 *	greyOut() is a member function to grey out the document background.
	 *
	 *	@return N/A
	 */
	Datepicker.prototype.greyOut = function(on) {
		var overlay = document.querySelector('#datepicker-overlay');
		if (overlay === null && on) {
			overlay = document.createElement('div');
			overlay.setAttribute('id', 'datepicker-overlay');
			overlay.classList.add('datepicker-overlay');
			document.querySelector('body').appendChild(overlay);
		}
		if (on) {
			Utils.fadeIn(overlay, 500);
		} else if (overlay !== null) {
			Utils.fadeOut(overlay, 500);
		}
	} // end greyOut()

	/**
	 *	getDaysInMonth() is a member function to calculate the number of days in a given month
	 *
	 *	@param (year int) the year
	 *	@param (month int) the given month
	 *
	 *	@return (integer) number of days
	 */
	Datepicker.prototype.getDaysInMonth = function(year, month) {
		return 32 - new Date(year, month, 32).getDate();
	} // end getDaysInMonth()

	/**
	 *	previousMonth() is a member function that compute the month
	 *	preceding a given month.
	 *
	 *	@param (year int) the given year
	 *	@param (month int) the given month
	 *	@return an object containing the properties year and month.
	 */
	Datepicker.prototype.previousMonth = function (year, month) {
		if (month == 0) {
			month = 11;
			year--;
		} else {
			month--;
		}
		return {year: year, month: month};
	} // end previousMonth()

	/**
	 *	nextMonth() is a member function that compute the month
	 *	following a given month.
	 *
	 *	@param (year int) the given year
	 *	@param (month int) the given month
	 *	@return an object containing the properties year and month.
	 */
	Datepicker.prototype.nextMonth = function (year, month) {
		if (month == 11) {
			month = 0;
			year++;
		} else {
			month++;
		}
		return {year: year, month: month};
	} // end nextMonth()

	/**
	 *	formatDate (date_object, format)
	 *	The format string uses the same abbreviations as in createDateFromFormat()
	 *
	 *	@param (date date object) the given date
	 *	@param (format string) the given output format
	 *	@returns a date in the output format specified.
	 */
	Datepicker.prototype.formatDate = function (date, format) {
		var zeroPad = function (x) {
			return(x < 0 || x > 9 ? "" : "0" ) + x;
		};
		var getWeekOfMonth = function(date) {
			return Math.ceil((date.getDate() - 1 - date.getDay()) / 7);
		};
		var getWeekOfYear = function(date) {
			var onejan = new Date(date.getFullYear(),0,1);
			return Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7);
		};
		var getDayOfYear = function(date) {
			var start = new Date(date.getFullYear(), 0, 0);
			return Math.floor((date - start) / 86400000);
		};
		var getMillisecondsInDay = function(date) {
			var date1 = new Date(date.getTime());
			date1.setHours( 0 );
			return date - date1;
		};
		var y = date.getFullYear() + "";
		var M = date.getMonth() + 1;
		var d = date.getDate();
		var D = getDayOfYear(date);
		var E = date.getDay();
		var H = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		var w = getWeekOfYear(date);
		var W = getWeekOfMonth(date);
		var F = Math.floor( date.getDate() / 7 ) + 1;
		var Q = Math.ceil( ( date.getMonth() + 1 ) / 3 );
		var era = date.getFullYear() < 1 ? 0 : 1;
		var values = {
			"y": "" + y,
			"yyyy": y,
			"yy": y.substring(2,4),
			"L": M,
			"LL": zeroPad(M),
			"LLL": this.locales.month_names_abbreviated[M - 1],
			"LLLL": this.locales.month_names[M - 1],
			"LLLLL": this.locales.month_names_narrow[M - 1],
			"M": M,
			"MM": zeroPad(M),
			"MMM": this.locales.month_names_abbreviated[M - 1],
			"MMMM": this.locales.month_names[M - 1],
			"MMMMM": this.locales.month_names_narrow[M - 1],
			"d": d,
			"dd": zeroPad(d),
			"D": D,
			"DD": D,
			"DDD": D,
			"A": Math.round( getMillisecondsInDay(date) * Math.pow( 10, -2 ) ),
			"AA": Math.round( getMillisecondsInDay(date) * Math.pow( 10, -1 ) ),
			"AAA": Math.round( getMillisecondsInDay(date) * Math.pow( 10, 0 ) ),
			"AAAA": Math.round( getMillisecondsInDay(date) * Math.pow( 10, 1 ) ),
			"AAAAA": Math.round( getMillisecondsInDay(date) * Math.pow( 10, 2 ) ),
			"AAAAAA": Math.round( getMillisecondsInDay(date) * Math.pow( 10, 3 ) ),
			"E": this.locales.day_names_abbreviated[E],
			"EE": this.locales.day_names_abbreviated[E],
			"EEE": this.locales.day_names_abbreviated[E],
			"EEEE": this.locales.day_names[E],
			"EEEEE": this.locales.day_names_narrow[E],
			"EEEEEE": this.locales.day_names_short[E],
			"e": E,
			"ee": E,
			"eee": this.locales.day_names_abbreviated[E],
			"eeee": this.locales.day_names[E],
			"eeeee": this.locales.day_names_narrow[E],
			"eeeeee": this.locales.day_names_short[E],
			"c": E,
			"cc": E,
			"ccc": this.locales.day_names_abbreviated[E],
			"cccc": this.locales.day_names[E],
			"ccccc": this.locales.day_names_narrow[E],
			"cccccc": this.locales.day_names_short[E],
			"F": F,
			"G": this.locales.era_names_abbreviated[era],
			"GG": this.locales.era_names_abbreviated[era],
			"GGG": this.locales.era_names_abbreviated[era],
			"GGGG": this.locales.era_names[era],
			"GGGGG": this.locales.era_names_narrow[era],
			"Q": Q,
			"QQ": zeroPad(Q),
			"QQQ": this.locales.quarter_names_abbreviated[Q - 1],
			"QQQQ": this.locales.quarter_names[Q - 1],
			"QQQQQ": this.locales.quarter_names_narrow[Q - 1],
			"q": Q,
			"qq": zeroPad(Q),
			"qqq": this.locales.quarter_names_abbreviated[Q - 1],
			"qqqq": this.locales.quarter_names[Q - 1],
			"qqqqq": this.locales.quarter_names_narrow[Q - 1],
			"H": H,
			"HH": zeroPad(H),
			"h": H == 0 ? 12 : H > 12 ? H - 12 : H,
			"hh": zeroPad(H == 0 ? 12 : H > 12 ? H - 12 : H),
			"K": H > 11 ? H - 12 : H,
			"k": H + 1,
			"KK": zeroPad(H > 11 ? H - 12 : H),
			"kk": zeroPad(H + 1),
			"a": H > 11 ? this.locales.day_periods.pm : this.locales.day_periods.am,
			"m": m,
			"mm": zeroPad(m),
			"s": s,
			"ss": zeroPad(s),
			"w": w,
			"ww": zeroPad(w),
			"W": W,
		};
		return format.replace(
			/('[^']+'|y{1,4}|L{1,5}|M{1,5}|c{1,6}|d{1,2}|D{1,3}|E{1,6}|e{1,6}|F{1,1}|G{1,5}|Q{1,5}|q{1,5}|H{1,2}|h{1,2}|K{1,2}|k{1,2}|m{1,2}|s{1,2}|w{1,2}|W{1,1}|A{1,6})/g,
			function (mask) {
				return mask.charAt(0) === "'" ? mask.substr(1, mask.length - 2) : values[mask] || mask;
			}
		);
	} // end formatDate()

	/**
	 *	createDateFromFormat( format_string, date_string )
	 *
	 *	This function takes a date string and a format string. It matches
	 *	If the date string matches the format string, it returns the
	 *	the date object. If it does not match, it returns null.
	 */
	Datepicker.prototype.createDateFromFormat = function(format, value) {
		var extractInteger = function(str, pos, minlength, maxlength) {
			for (var x = maxlength; x >= minlength; x--) {
				var integer = str.substring(pos, pos + x);
				if (integer.length < minlength) {
					return null;
				}
				if (/^\d+$/.test(integer)) {
					return integer;
				}
			}
			return null;
		};
		var skipName = function(names, pos) {
			for (var i = 0; i < names.length; i++) {
				var name = names[i];
				if (value.substring(pos, pos + name.length).toLowerCase() == name.toLowerCase()) {
					return name.length;
				}
			}
			return 0;
		};
		var pos = 0;
		var now = new Date();
		var year = now.getYear();
		var month = now.getMonth() + 1;
		var date = 1;
		var hh = 0;
		var mm = 0;
		var ss = 0;
		var ampm = "";
		var self = this;

		format.match(/(.).*?\1*/g).forEach(function(token, k) {
			// Extract contents of value based on format token
			switch (token) {
				case 'yyyy':
					year = extractInteger(value, pos, 4, 4);
					if (year != null) {
						pos += year.length;
					}
					break;
				case 'yy':
					year = extractInteger(value, pos, 2, 2);
					if (year != null) {
						pos += year.length;
					}
					break;
				case 'y':
					year = extractInteger(value, pos, 2, 4);
					if (year != null) {
						pos += year.length;
					}
					break;
				case 'MMM':
				case 'LLL':
					month = 0;
					for (var i = 0; i < self.locales.month_names_abbreviated.length; i++) {
						var month_name = self.locales.month_names_abbreviated[i];
						if (value.substring(pos, pos + month_name.length).toLowerCase() == month_name.toLowerCase()) {
							month = i + 1;
							pos += month_name.length;
							break;
						}
					}
					break;
				case 'MMMM':
				case 'LLLL':
					month = 0;
					for (var i = 0; i < self.locales.month_names.length; i++) {
						var month_name = self.locales.month_names[i];
						if (value.substring(pos, pos + month_name.length).toLowerCase() == month_name.toLowerCase()) {
							month = i + 1;
							pos += month_name.length;
							break;
						}
					}
					break;
				case 'EEE':
				case 'EE':
				case 'E':
				case 'eee':
					pos += skipName(self.locales.day_names_abbreviated, pos);
					break;
				case 'EEEE':
				case 'eeee':
				case 'cccc':
					pos += skipName(self.locales.day_names, pos);
					break;
				case 'EEEEEE':
				case 'eeeeee':
				case 'cccccc':
					pos += skipName(self.locales.day_names_short, pos);
					break;
				case 'MM':
				case 'M':
				case 'LL':
				case 'L':
					month = extractInteger(value, pos, token.length, 2);
					if (month == null || (month < 1) || (month > 12)){
						return null;
					}
					pos += month.length;
					break;
				case 'dd':
				case 'd':
					date = extractInteger(value, pos, token.length, 2);
					if (date == null || (date < 1) || (date > 31)){
						return null;
					}
					pos += date.length;
					break;
				case 'hh':
				case 'h':
					hh = extractInteger(value, pos, token.length, 2);
					if (hh == null || (hh < 1) || (hh > 12)){
						return null;
					}
					pos += hh.length;
					break;
				case 'HH':
				case 'H':
					hh = extractInteger(value, pos, token.length, 2);
					if (hh == null || (hh < 0) || (hh > 23)){
						return null;
					}
					pos += hh.length;
					break;
				case 'KK':
				case 'K':
					hh = extractInteger(value, pos, token.length, 2);
					if (hh == null || (hh < 0) || (hh > 11)){
						return null;
					}
					pos += hh.length;
					break;
				case 'kk':
				case 'k':
					hh = extractInteger(value, pos, token.length, 2);
					if (hh == null || (hh < 1) || (hh > 24)){
						return null;
					}
					pos += hh.length;
					hh--;
					break;
				case 'mm':
				case 'm':
					mm = extractInteger(value,pos,token.length,2);
					if (mm == null || (mm < 0) || (mm > 59)){
						return null;
					}
					pos += mm.length;
					break;
				case 'ss':
				case 's':
					ss = extractInteger(value, pos, token.length, 2);
					if (ss == null || (ss < 0) || (ss > 59)){
						return null;
					}
					pos += ss.length;
					break;
				case 'a':
					var amlength = self.locales.day_periods.am.length;
					var pmlength = self.locales.day_periods.pm.length;
					if (value.substring(pos, pos + amlength) == self.locales.day_periods.am) {
						ampm = "AM";
						pos += amlength;
					} else if (value.substring(pos, pos + pmlength) == self.locales.day_periods.pm) {
						ampm = "PM";
						pos += pmlength;
					} else {
						return null;
					}
					break;
				default:
					if (value.substring(pos, pos + token.length) != token) {
						return null;
					} else {
						pos += token.length;
					}
			}
		});
		// If there are any trailing characters left in the value, it doesn't match
		if (pos != value.length) {
			return null;
		}
		if (year == null) {
			return null;
		}
		if (year.length == 2) {
			if (year > 50) {
				year = 1900 + (year - 0);
			} else {
				year = 2000 + (year - 0);
			}
		}
		// Is date valid for month?
		if ((month < 1) || (month > 12)) {
			return null;
		}
		if (month == 2) {
			// Check for leap year
			if ( ( (year % 4 == 0) && (year % 100 != 0) ) || (year % 400 == 0) ) { // leap year
				if (date > 29) {
					return null;
				}
			} else {
				if (date > 28) {
					return null;
				}
			}
		}
		if ((month == 4) || (month == 6) || (month == 9) || (month==11)) {
			if (date > 30) {
				return null;
			}
		}
		// Correct hours value
		if (hh < 12 && ampm == "PM") {
			hh = hh - 0 + 12;
		} else if (hh > 11 && ampm == "AM") {
			hh -= 12;
		}
		return new Date(year, month - 1, date, hh, mm, ss);
	} // end createDateFromFormat()

	/**
	 *	parseDate() is a member function which parse a date string.
	 *
	 *	This function takes a date string and try to parse it with the input formats.
	 *	If the date string matches one of the format string, it returns the
	 *	the date object. Otherwise, it returns null.
	 *
	 *	@param (value string) the date string
	 *	@return a date objet or null
	 */
	Datepicker.prototype.parseDate = function(value) {
		var date = null;
		var self = this;
		this.options.inputFormat.forEach(function (format, i) {
			date = self.createDateFromFormat(format, value);
			if (date != null) {
				return false;
			}
		});
		if (date == null) { // last try with the output format
			date = self.createDateFromFormat(this.options.outputFormat, value);
		}
		return date;
	} // end parseDate()

	/**
	 *	min() is a public member function which allow change the smallest selectable date.
	 *
	 *	@param (value string) the new date
	 *	@return the smallest selectable date
	 */
	Datepicker.prototype.min = function(value) {
		if (value != null) {
			this.options.min = value instanceof Date ? value : this.parseDate(value);
			if (this.options.min != null && this.dateObj < this.options.min) {
				this.target.setAttribute('aria-invalid', true);
				var formGroup = this.target.closest('.field-container');
				while (formGroup !== null) {
					formGroup.classList.add('has-error');
					formGroup = formGroup.parentElement.closest('.field-container');
				}
				this.dateObj = this.options.min;
			}
			if (this.options.inline != false) {
				this.refresh();
			}
		}
		return this.options.min;
	} // end min()

	/**
	 *	max() is a public member function which allow change the biggest selectable date.
	 *
	 *	@param (value string) the new date
	 *	@return the biggest selectable date
	 */
	Datepicker.prototype.max = function(value) {
		if (value != null) {
			this.options.max = value instanceof Date ? value : this.parseDate(value);
			if (this.options.max != null && this.dateObj > this.options.max) {
				this.target.setAttribute('aria-invalid', true);
				var formGroup = this.target.closest('.field-container');
				while (formGroup !== null) {
					formGroup.classList.add('has-error');
					formGroup = formGroup.parentElement.closest('.field-container');
				}
				this.dateObj = this.options.max;
			}
			if (this.options.inline != false) {
				this.refresh();
			}
		}
		return this.options.max;
	} // end max()

	/**
	 *	next() is a public member function that allows you to define another input representing the end date
	 *
	 *	@param (value string|JQuery) the id or the JQuery object of the another input
	 *	@return the linked datepicker representing the end date
	 */
	Datepicker.prototype.next = function(value) {
		if (value != null) {
			if (typeof value === 'object') {
				this.options.next = value;
				this.target.classList.add('datepicker-linked');
			}
		}
		return this.options.next;
	} // end next()

	/**
	 *	previous() is a public member function that allows you to define another input representing the start date
	 *
	 *	@param (value string|JQuery) the id or the JQuery object of the another input
	 *	@return the linked datepicker representing the start date
	 */
	Datepicker.prototype.previous = function(value) {
		if (value != null) {
			if (typeof value === 'object') {
				this.options.previous = value;
			}
		}
		return this.options.previous;
	} // end previous()

	/**
	 *	theme() is a public member function which allow change the datepicker theme.
	 *
	 *	@param (value string) the new theme
	 *	@return the datepicker theme
	 */
	Datepicker.prototype.theme = function(value) {
		if (value != null) {
			this.button.classList.remove(this.options.theme);
			this.calendar.classList.remove(this.options.theme);
			this.options.theme = value;
			this.button.classList.add(this.options.theme);
			this.calendar.classList.add(this.options.theme);
		}
		return this.options.theme;
	} // end theme()

	/**
	 *	firstDayOfWeek() is a public member function which allow change the first Day Of Week.
	 *
	 *	@param (value integer) the new first Day Of Week
	 *	@return the first Day Of Week
	 */
	Datepicker.prototype.firstDayOfWeek = function(value) {
		if (value != null) {
			this.options.firstDayOfWeek = parseInt(value, 10);
			if (this.options.inline == false) {
				this.drawCalendarHeader();
			} else {
				this.refresh();
			}
		}
		return this.options.firstDayOfWeek;
	} // end firstDayOfWeek()

	/**
	 *	daysOfWeekDisabled() is a public member function which allow disabling of some weekdays.
	 *
	 *	@param (value string) the new disabled week days
	 *	@return the disabled week days
	 */
	Datepicker.prototype.daysOfWeekDisabled = function(value) {
		if (value != null) {
			this.options.daysOfWeekDisabled = [];
			if (! Array.isArray(value)) {
				value = [value];
			}
			var self = this;
			value.forEach(function(val, i) {
				if (typeof val === 'number') {
					self.options.daysOfWeekDisabled.push(val);
				} else if (typeof val === 'string') {
					self.options.daysOfWeekDisabled.push(parseInt(val, 10));
				}
			});
		}
		return this.options.daysOfWeekDisabled;
	} // end daysOfWeekDisabled()

	/**
	 *	weekDayFormat() is a public member function which allow change the format of weekdays name.
	 *
	 *	@param (value string) the new format. Allowed : 'short' or 'narrow'
	 *	@return the format of weekdays name
	 */
	Datepicker.prototype.weekDayFormat = function(value) {
		if (value != null) {
			this.options.weekDayFormat = value;
			this.drawCalendarHeader();
		}
		return this.options.weekDayFormat;
	} // end weekDayFormat()

	/**
	 *	inputFormat() is a public member function which allow change the input format.
	 *
	 *	@param (value string) the new format
	 *	@return the input format
	 */
	Datepicker.prototype.inputFormat = function(value) {
		if (value != null) {
			if (! Array.isArray(value)) {
				value = [value];
			}
			if (this.target.getAttribute('placeholder') == this.options.inputFormat[0]) {
				this.target.setAttribute('placeholder', value[0]);
			}
			this.options.inputFormat = value;
		}
		return this.options.inputFormat;
	} // end inputFormat()

	/**
	 *	outputFormat() is a public member function which allow change the output format.
	 *
	 *	@param (value string) the new format
	 *	@return the output format
	 */
	Datepicker.prototype.outputFormat = function(value) {
		if (value != null) {
			this.options.outputFormat = value;
		}
		return this.options.outputFormat;
	} // end outputFormat()

	/**
	 *	modal() is a public member function which allow to set or unset the modal mode.
	 *
	 *	@param (value boolean) the new modal mode
	 *	@return the modal mode
	 */
	Datepicker.prototype.modal = function(value) {
		if (value != null) {
			this.options.modal = value;
			if (this.options.modal == true) {
				if (this.options.inline == false) {
					this.showObject(this.calendar.querySelector('.datepicker-close-wrap'));
					this.showObject(this.calendar.querySelector('.datepicker-bn-close-label'));
				}
				this.close = this.calendar.querySelector('.datepicker-close');
				this.close.innerHTML = this.options.closeButtonTitle;
				this.close.setAttribute('title', this.options.closeButtonLabel);
				this.calendar.querySelector('.datepicker-bn-close-label').innerHTML = this.options.closeButtonLabel;
				var self = this;
				this.close.addEventListener('click', function(e) {
					return self.handleCloseClick(e);
				}, false);
				this.close.addEventListener('keydown', function(e) {
					return self.handleCloseKeyDown(e);
				}, false);
			} else {
				this.hideObject(this.calendar.querySelector('.datepicker-close-wrap'));
				this.hideObject(this.calendar.querySelector('.datepicker-bn-close-label'));
			}
		}
		return this.options.modal;
	} // end modal()

	/**
	 *	inline() is a public member function which allow to set or unset the inline mode.
	 *
	 *	@param (value string or false) the id of the datepicker container, false otherwise (not inline)
	 *	@return the given value
	 */
	Datepicker.prototype.inline = function(value) {
		if (value != null) {
			if (value != false) {
				this.hideObject(this.button);
				this.hideObject(this.calendar.querySelector('.datepicker-close-wrap'));
				this.hideObject(this.calendar.querySelector('.datepicker-bn-close-label'));
				var container = document.querySelector('#' + value);
				container.append(this.calendar);
				this.calendar.style.position = 'relative';
				this.calendar.style.left = '0px';
				this.calendar.style.top = '0px';
				this.options.inline = value;
				this.initializeDate();
				this.showObject(this.calendar);
			} else {
				this.target.parentElement.insertAdjacentElement('afterend', this.calendar);
				this.showObject(this.button);
				if (this.options.modal == true) {
					this.showObject(this.calendar.querySelector('.datepicker-close-wrap'));
					this.showObject(this.calendar.querySelector('.datepicker-bn-close-label'));
				}
				if (this.calendar.parentElement.style.position === 'static') {
					this.calendar.parentElement.style.position = 'relative';
				}
				this.calendar.style.position = 'absolute';
				this.options.inline = value;
				this.hide();
			}
		}
		return this.options.inline;
	} // end inline()

	/**
	 *	format() is a public member function to format a date according the output format.
	 *
	 *	@param (value date object) the date
	 *	@return formatted date string
	 */
	Datepicker.prototype.format = function(date) {
		return this.formatDate(date, this.options.outputFormat);
	} // end format()

	/**
	 *	enable() is a public member function to enable this datepicker.
	 */
	Datepicker.prototype.enable = function() {
		this.button.classList.remove('disabled');
		this.button.setAttribute('aria-disabled', false);
		this.button.setAttribute('tabindex', 0);
	} // end enable()

	/**
	 *	disable() is a public member function to disable this datepicker.
	 */
	Datepicker.prototype.disable = function() {
		this.hide();
		this.button.classList.add('disabled');
		this.button.setAttribute('aria-disabled', true);
		this.button.setAttribute('tabindex', -1);
	} // end enable()

	/**
	 *	datesDisabled() is a public member function to set dates to be disabled.
	 */
	Datepicker.prototype.datesDisabled = function(dates) {
		this.options.datesDisabled = [];
		if (! Array.isArray(dates)) {
			dates = [dates];
		}
		var self = this;
		dates.forEach(function(v ,i) {
			if (typeof v === 'string') {
				var date = self.parseDate(v);
				if (date !== null ) {
					self.options.datesDisabled.push(self.format(date));
				}
			} else if (v instanceof Date && !isNaN(v.valueOf())) {
				self.options.datesDisabled.push(self.format(v));
			}
		});
	} // end datesDisabled()

	/**
	 *	startview() is a public member function to format a date according the output format.
	 *
	 *	@param (value int|string) the new view
	 *	@return  N/A
	 */
	Datepicker.prototype.startview = function(view) {
		switch (view) {
			case 1:
			case 'months':
				this.options.startView = 1;
				break;
			case 2:
			case 'years':
				this.options.startView = 2;
				break;
			default:
				this.options.startView = 0;
		}
	} // end startview()

	/**
	 *	setLocales() is a public member function which allow change the locales.
	 *
	 *	@param (value obj) the new locales
	 *	@return N/A
	 */
	Datepicker.prototype.setLocales = function(value) {
		this.locales = value;
		this.options.inputFormat = [this.locales.short_format];
		this.options.outputFormat = this.locales.short_format;
		this.options.titleFormat = this.locales.full_format,
		this.options.firstDayOfWeek = this.locales.firstday_of_week;
		this.options.buttonTitle = this.locales.texts.buttonTitle;
		this.button.querySelector('span').setAttribute('title', this.options.buttonTitle);
		this.options.buttonLabel = this.locales.texts.buttonLabel;
		this.options.prevButtonLabel = this.locales.texts.prevButtonLabel;
		this.options.prevMonthButtonLabel = this.locales.texts.prevMonthButtonLabel;
		this.options.prevYearButtonLabel = this.locales.texts.prevYearButtonLabel;
		this.options.nextButtonLabel = this.locales.texts.nextButtonLabel;
		this.options.nextMonthButtonLabel = this.locales.texts.nextMonthButtonLabel;
		this.options.nextYearButtonLabel = this.locales.texts.nextYearButtonLabel;
		this.options.changeMonthButtonLabel = this.locales.texts.changeMonthButtonLabel;
		this.options.changeYearButtonLabel = this.locales.texts.changeYearButtonLabel;
		this.options.changeRangeButtonLabel = this.locales.texts.changeRangeButtonLabel;
		this.options.closeButtonTitle = this.locales.texts.closeButtonTitle;
		this.options.closeButtonLabel = this.locales.texts.closeButtonLabel;
		this.options.calendarHelp = this.locales.texts.calendarHelp;
		this.drawCalendarHeader();
		if (this.locales.directionality === 'RTL') {
			this.grid.classList.add('rtl');
		} else {
			this.grid.classList.remove('rtl');
		}
	} // end setLocales()

	global.Datepicker = Datepicker;

}(this));

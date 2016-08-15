/**
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

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

(function (global) {
	'use strict';

	function Admin() {
	};

	Admin.lang = 'en';
	Admin.locale = 'en-US';

	Admin.wysihtml5Options = {
		'locale': Admin.locale,
		'font-styles': false,
		'color': false,
		'emphasis': true,
		'blockquote': true,
		'lists': true,
		'html': false,
		'link': true,
		'image': false,
		'shortcuts': {
		   '83': 'small'     // S
		}
	};

	Admin.wysihtml5Options.locale = Admin.locale;

	Admin.types = { 
		array: 'array', 
		date: 'date', 
		day: 'day', 
		today: 'today', 
		month: 'month', 
		year: 'year', 
		'boolean': 'boolean', 
		integer: 'integer', 
		number: 'number', 
		text: 'text', 
		textarea: 'textarea', 
		money: 'money', 
		choice: 'choice', 
		multichoice: 'multichoice', 
		percent: 'percent', 
		table: 'table', 
		department: 'department', 
		region: 'region', 
		country: 'country'
	};

	Admin.updated = false;

	global.Admin = Admin;
}(this));


$(document).ready(function() {
	bootbox.setDefaults({
		locale: Admin.lang
	});
	function centerModal() {
		$('.modal').find('.modal-dialog').each(function(index) {
			$(this).css({
				'position': 'absolute',
				'top': function () {
					return (($(window).height() - $(this).outerHeight(true)) / 2) + 'px';
				},
				'left': function () {
					return (($(window).width() - $(this).outerWidth(true)) / 2) + 'px';
				}
			});
		});
	}
	$('body').on('shown.bs.modal', centerModal);
	$('a[data-confirm]').click(function(ev) {
		var href = $(this).attr('href');
		if (!$('#dataConfirmModal').length) {
			$('body').append('<div id="dataConfirmModal" class="modal" tabindex="-1" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 id="dataConfirmLabel" class="modal-title">Please Confirm</h4></div><div class="modal-body"></div><div class="modal-footer"><button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Cancel</button><a class="btn btn-primary" id="dataConfirmOK">OK</a></div></div></div></div>');
		} 
		$('#dataConfirmModal').find('.modal-body').text($(this).attr('data-confirm'));
		$('#dataConfirmOK').attr('href', href);
		$('#dataConfirmModal').modal({show:true});
		return false;
	});
	$(window).on("resize", function () {
		$('.modal:visible').each(centerModal);
	});
    $('body').append('<div id="toTop" class="btn btn-default"><i class="fa fa-arrow-up"></i>Back to Top</div>');
    $(window).scroll(function () {
		if ($(this).scrollTop() != 0) {
			$('#toTop').fadeIn();
		} else {
			$('#toTop').fadeOut();
		}
	}); 
	$(window).on('beforeunload', function() {
		var e = $.Event('webapp:page:closing');
		$(window).trigger(e); // let other modules determine whether to prevent closing
		if(e.isDefaultPrevented()) {
			// e.message is optional
			return e.message || 'You have unsaved stuff. Are you sure to leave?';
		}
	});
	$(window).on('webapp:page:closing', function(e) {
		if(Admin.updated) {
			e.preventDefault();
			e.message = 'Your update are not saved. Sure to leave?';
		}
	});
    $('#toTop').click(function(){
        $("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    });
});
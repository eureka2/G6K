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

	Admin.wysihtml5Custom = {
		insertData: function(context) {
			var locale = context.locale;
			var options = context.options;
			var datas = [];
			$.each(Simulators.dataset, function(name, d) {
				datas.push('<li><a data-wysihtml5-command="insertHTML" data-wysihtml5-command-value="<var class=data data-id=' + d.id + '>«' + d.label + '»</var>" tabindex="-1">' + d.label + '</a></li>');
			});
			return '<li class="dropdown">' +
				'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown">' + 
					'<span class="current-font">' + Translator.trans('Variables') + ' </span>' +
					'<b class="caret"></b>' + 
				'</a>' +
				'<ul class="dropdown-menu">' + 
				datas.join("")  +
				'</ul>' + 
			'</li>';
		}
	};

	Admin.wysihtml5Options = {
		toolbar: {
			'locale': Admin.locale,
			'font-styles': false,
			'color': false,
			'emphasis': true,
			'blockquote': true,
			'lists': true,
			'html': false,
			'link': true,
			'image': false,
			'insertData': false
		},
		customTemplates: Admin.wysihtml5Custom,
		shortcuts: {
		   '83': 'small'     // S
		},
		parserRules: {
			classes: {
				"data": 1
			},
			tags: {
				'var': {
					"check_attributes": {
						"data-id": "numbers"
					}
				}
			}
		},
		events: {
			'change': function(e) {
				var val = this.getValue();
				val = val.replace(/^(\s*\<br\>\s*)+/mi, '');
				val = val.replace(/(\s*\<br\>\s*)+$/mi, '');
				val = val.replace(/^\<p\>(\s*\<br\>\s*)+/mi, '<p>');
				val = val.replace(/(\s*\<br\>\s*)+\<\/p\>$/mi, '</p>');
				this.setValue(val);
			},
			"beforeload": function() { 
				if (typeof Simulators !== 'undefined') {
					var val = this.getValue();
					val = val.replace(
						/#(\d+)/g,
						function (match, m1, offs, str) {
							var data = Simulators.findDataById(m1);
							return '<var class="data" data-id="' + data.id + '">«' + data.label + '»</var>';
						}
					);
					this.setValue(val);
				}
			}
		}
	};

	Admin.types = { 
		date: Translator.trans('date'), 
		day: Translator.trans('day'), 
		month: Translator.trans('month'), 
		year: Translator.trans('year'), 
		'boolean': Translator.trans('boolean'), 
		integer: Translator.trans('integer'), 
		number: Translator.trans('number'), 
		text: Translator.trans('text'), 
		textarea: Translator.trans('textarea'), 
		money: Translator.trans('money'), 
		choice: Translator.trans('choice'), 
		multichoice: Translator.trans('multichoice'), 
		percent: Translator.trans('percent'), 
		array: Translator.trans('array'), 
		table: Translator.trans('table'), 
		department: Translator.trans('department'), 
		region: Translator.trans('region'), 
		country: Translator.trans('country')
	};

	Admin.updated = false;

	global.Admin = Admin;
}(this));


$(document).ready(function() {
	bootbox.setDefaults({
		locale: Admin.lang
	});

	Admin.wysihtml5Options.locale = Admin.locale;

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
	$('a[data-confirm], button[data-confirm]').click(function(ev) {
		var href = $(this).attr('href');
		if (!$('#dataConfirmModal').length) {
			$('body').append('<div id="dataConfirmModal" class="modal" tabindex="-1" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="' + Translator.trans('Close') + '"><span aria-hidden="true">&times;</span></button><h4 id="dataConfirmLabel" class="modal-title">' + Translator.trans('Please Confirm') + '</h4></div><div class="modal-body"></div><div class="modal-footer"><button class="btn btn-default" data-dismiss="modal" aria-hidden="true">' + Translator.trans('Cancel') + '</button><a class="btn btn-primary" id="dataConfirmOK">' + Translator.trans('OK') + '</a></div></div></div></div>');
		} 
		$('#dataConfirmModal').find('.modal-body').text($(this).attr('data-confirm'));
		$('#dataConfirmOK').attr('href', href);
		$('#dataConfirmModal').modal({show:true});
		return false;
	});
	$(window).on("resize", function () {
		$('.modal:visible').each(centerModal);
	});
	$('body').append('<div id="toTop" class="btn btn-default"><i class="fa fa-arrow-up"></i>' + Translator.trans("Back to Top") + '</div>');
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
			return e.message || Translator.trans("You have unsaved stuff. Are you sure to leave?");
		}
	});
	$(window).on('webapp:page:closing', function(e) {
		if(Admin.updated) {
			e.preventDefault();
			e.message = Translator.trans('Your update are not saved. Sure to leave?');
		}
	});
	$('#toTop').click(function(){
		$("html, body").animate({ scrollTop: 0 }, 600);
		return false;
	});
});
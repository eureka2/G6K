/**
The MIT License (MIT)

Copyright (c) 2019 Jacques Archimède

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

	function PDFForms() {
	};

	PDFForms.init = function() {
		var categoriesSugg = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.whitespace,
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			local: categories
		});
		$('#pdfform-category').typeahead({
			minLength: 0,
			hint: true,
			highlight: true
		},
		{
			name: 'categories-list',
			source: function (q, sync, async) {
				if (q === '') {
					sync(categories);
				} else {
					categoriesSugg.search(q, sync, async);
				}
			}
		});
		$('label.tree-toggler').click(function () {
			$(this).parent().toggleClass("closed");
			if ($(this).parent().hasClass("closed")) {
				$(this).attr('aria-expanded', 'false');
			} else {
				$(this).attr('aria-expanded', 'true');
			}
		});
		if ( $( "#pdfform" ).length ) {
			var pdfform = $("#pdfform").find('p[data-attribute=name]').attr('data-value');
			$('#pdfforms li.nav-item[data-pdfform]').each(function() {
				if ($(this).attr('data-pdfform') == pdfform) {
					$(this).closest('.closed').removeClass('closed');
					return false;
				}
			});
		}
		$('#edit-pdfform').on('submit', function(e) {
			var errors = PDFForms.checkPDFForm();
			if (errors.length > 0) {
				e.preventDefault();
				PDFForms.showErrors(errors, Translator.trans("To continue you must first correct your entry"));
				$("html, body").animate({ scrollTop: $('.alert.alert-danger').offset().top - $('#navbar').height() }, 500);
				return false;
			}
			PDFForms.hideErrors();
			return true;
		});
	}

	PDFForms.checkPDFForm = function() {
		var errors = [];
		var title = $("#pdfform-title").val();
		if (title == '') {
			errors.push(Translator.trans("The PDF Form title is required"));
		}
		var fields = $('#pdfform').find('td[data-field] input')
		fields.each(function() {
			var dataname = $(this).val().trim();
			var fieldname = $(this).parent().attr('data-field');
			if (dataname == '') {
				errors.push(Translator.trans("The simulator data name for « %field% » is required", {'field': fieldname}));
			} else if (! /^\w+$/.test(dataname)) {
				errors.push(Translator.trans("The simulator data name for « %field% » is invalid", {'field': fieldname}));
			}
		});
		return errors;
	}

	PDFForms.showErrors = function(errors, message) {
		if (message) {
			$('.alert .error-message').text(message);
		}
		var mess = $('.alert ul');
		mess.empty();
		$.each(errors, function( index, value ) {
			mess.append('<li>' + value + '</li>');
		});
		$('.alert').show();
	}

	PDFForms.hideErrors = function() {
		$('.alert .error-message').empty();
		$('.alert ul').empty();
		$('.alert').hide();
	}

	global.PDFForms = PDFForms;
}(this));

$(function(){
	if ( $( "#page-pdfforms" ).length ) {
		PDFForms.init();
	}
});
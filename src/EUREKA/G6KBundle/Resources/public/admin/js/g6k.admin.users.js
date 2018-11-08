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

	function Users() {
	};

	Users.doeditable = function() {
		$('#users').Tabledit({
			url: 'users',
			editButton: true,
			deleteButton: true,
			saveButton: true,
			restoreButton: true,
			autoFocus: false,
			hideIdentifier: true,
			buttons: {
				save: {
					html: Translator.trans('Save')
				},
				confirm: {
					html: Translator.trans('Confirm')
				},
				restore: {
					html: Translator.trans('Restore')
				}
			},
			columns: {
				identifier: [0, 'id'],
				editable: [
					[1, 'userName'], [2, 'email', 'email'], [3, 'password', 'password'], [4, 'enabled', 'checkbox', '{"1": "' + Translator.trans('Yes') + '", "0": "' + Translator.trans('No') + '"}', '1'], [5, 'roles', 'multiple', '{ "ROLE_USER": "' + Translator.trans("user") + '", "ROLE_MANAGER": "' + Translator.trans("manager") + '", "ROLE_CONTRIBUTOR": "' + Translator.trans("contributor") + '", "ROLE_ADMIN": "' + Translator.trans("admin") + '", "ROLE_SUPER_ADMIN": "' + Translator.trans("superadmin") + '" }']
				]
			},
			onDraw: function() {
				$('td.date input').datepicker({
					format: 'dd/mm/yyyy',
					autoclose: true,
					language: Admin.lang
				});
			},
			onReset: function() {
				$('.alert').hide();
			},
			onRowEdited: function(row) {
				var errors = [];
				var userName = row.find('input[name=userName]');
				var email = row.find('input[name=email]');
				var password = row.find('input[name=password]');
				if (userName.val() == '' || userName.val().length < 3) {
					errors.push(Translator.trans('Please enter a valid user name (3 car. min).'));
				}
				if (email.val() == '' || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.val())) {
					errors.push(Translator.trans('Please enter a valid email address.'));
				}
				if (password.val() == '' || password.val().length < 6) {
					errors.push(Translator.trans('Please enter a valid password (6 car. min).'));
				}
				var alert = $('.alert ul');
				alert.empty();
				if (errors.length > 0) {
					$.each(errors, function (i, error) { alert.append('<li>' + error + '</li>'); });
					$('.alert').show();
					return false;
				}
				$('.alert').hide();
				return true; 
			},
			onRowDeleted: function(row) {
				return true; 
			},
			onSuccess: function(data, row, textStatus, jqXHR) {
				if (data.error) {
					setTimeout(function() {
						row.find( 'button.tabledit-edit-button').trigger( "click" );;
						var alert = $('.alert ul');
						alert.empty();
						alert.append('<li>' +data.error + '</li>');
						$('.alert').show();
					}, 1500);
				} else if (data.action = 'edit' && data.id > 0) {
					if (row.attr('id') == 0) {
						row.find('.tabledit-input.tabledit-identifier').val(data.id);
						row.find('.tabledit-span.tabledit-identifier').text(data.id);
						row.attr('id', data.id);
					}
				}
				return; 
			},
		});
	}
	global.Users = Users;
}(this));

$(function(){
	if ( $( "#page-users" ).length ) {
		$('#page-users #btnAddNewRow').on('click', function(e) {
			e.preventDefault();
			$('#page-users .tabledit-toolbar-column').remove();
			$('#users tbody td').each(function() {
				var text = $(this).find('.tabledit-span').text();
				$(this).empty();
				$(this).text(text);
			});
			$('#users tbody').prepend('<tr><td class="integer">0</td><td class="text"></td><td class="text"></td><td class="password"></td><td class="boolean">' + Translator.trans('Yes') + '</td><td class="choice"></td><td class="date"></td></tr>');
			Users.doeditable();
			$('#users tbody tr:first-child').find('.tabledit-edit-button').trigger( "click" );
		});
		Users.doeditable();
		$('#page-users #users-table-form').find("select[name='itemsPerPage']").on('change', function(e) {
			e.preventDefault();
			$('#page-users #users-table-form').find("input[name='page']").val(1);
			$('#page-users #users-table-form').find('input[type=password]').val('******').attr('autocomplete', 'off').attr('type', 'text');
			$('#page-users #users-table-form').submit();
		});
		$('#page-users #users-table-form ul.pagination li a').on('click', function(e) {
			e.preventDefault();
			var pagenum = $(this).attr('data-page');
			if (pagenum > 0) {
				$('#page-users #users-table-form').find("input[name='page']").val(pagenum);
				$('#page-users #users-table-form').find('input[type=password]').val('******').attr('autocomplete', 'off').attr('type', 'text');
				$('#page-users #users-table-form').submit();
			}
		});
		$('#users').resizableColumns({
			store: store
		});
	}
});
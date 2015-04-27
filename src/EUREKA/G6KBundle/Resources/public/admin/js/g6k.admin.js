(function (global) {
	'use strict';
	
	function Admin() {
	};
	
	Admin.lang = 'en';
	Admin.locale = 'en-US';
	
	global.Admin = Admin;
}(this));

(function (global) {
	'use strict';
	
	function Simulators() {
	};
	
	Simulators.removeAttribute = function(attr) {
		var id =  attr.parent('label.control-label').attr('for');
		var input = $('#' + id);
		var ids  = input.attr('id').split('-');
		var name = ids.pop();
		var element = ids.join('-');
		var li = attr.parents('div.attributes-container').children('div.optional-attributes').children('ul').children("li[data-element='" + element +"'][data-name='" + name +"']");
		li.show();
		attr.parent('label').parent('div.form-group').remove();
	}
	
	Simulators.simpleAttribute = function(id, type, label, placeholder, options) {
		var attribute = '<div class="form-group col-sm-12">';
		attribute    += '    <label for="' + id + '"  class="col-sm-4 control-label"><span class="delete-attribute glyphicon glyphicon-remove text-danger"></span>&nbsp;' + label + '</label>';
		attribute    += '    <div class="col-sm-8">';
		if (type === 'text') {
			attribute    += '        <input type="text" name="' + id + '" id="' + id + '" class="form-control simple-value" placeholder="' + placeholder + '"  value="" />';
		} else if (type === 'checkbox') {
			attribute    += '        <input type="checkbox" name="' + id + '" id="' + id + '" class="form-control simple-value" value="1" checked="checked" />';
		} else if (type === 'select') {
			options = jQuery.parseJSON(options);
			attribute    += '        <select name="' + id + '" id="' + id + '" class="form-control simple-value" data-placeholder="' + placeholder + '">';
			$.each(options, function(index, value) {
				attribute    += '        <option value="' + index + '">' + value + '</option>';
			});
			attribute    += '        </select>';
		}
		attribute    += '    </div>';
		attribute    += '</div>';
		return $(attribute);
	}
	
	Simulators.expressionAttribute = function(id, label, placeholder) {
		var attribute = '<div class="form-group col-sm-12">';
		attribute    += '    <label for="' + id + '"  class="col-sm-4 control-label"><span class="delete-attribute glyphicon glyphicon-remove text-danger"></span>&nbsp;' + label + '</label>';
		attribute    += '    <div class="col-sm-8">';
		attribute    += '        <select id="' + id + '-expression-type" class="form-control col-sm-4 expression-type">';
		attribute    += '        	<option value="1">Constant</option>';
		attribute    += '        	<option value="2">Simple expression</option>';
		attribute    += '        	<option value="1">Conditional expression</option>';
		attribute    += '        </select>';
		attribute    += '        <input type="text" name="' + id + '" id="' + id + '" class="form-control col-sm-4 expression-value" placeholder="' + placeholder + '" />';
		attribute    += '    </div>';
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.dropAttribute = function(ui, target) {
		var element = ui.attr('data-element');
		var name = ui.attr('data-name');
		var type = ui.attr('data-type');
		var label = ui.text();
		var placeholder = ui.attr('data-placeholder');
		var id = element + '-' + name;
		var expression = ui.attr('data-expression') ? ui.attr('data-expression') === 'true' : false;
		var attribute = expression ?
			Simulators.expressionAttribute(id, label, placeholder) :
			Simulators.simpleAttribute(id, type, label, placeholder, ui.attr('data-options') );
		target.append(attribute);
		attribute.find('select. simple-value').select2({
			language: Admin.lang,
			minimumResultsForSearch: 50
		});
		attribute.find('span.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		ui.hide();
	}
	
	global.Simulators = Simulators;
}(this));

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
		             html: 'Enregistrer'
		        },
		        confirm: {
		            html: 'Confirmer'
		        }
		    },
			columns: {
				identifier: [0, 'id'],
				editable: [
					[1, 'userName'], [2, 'email', 'email'], [3, 'password', 'password'], [4, 'enabled', 'checkbox', '{"1": "Yes", "0": "No"}', '1'], [5, 'locked', 'checkbox', '{"1": "Yes", "0": "No"}', '1'], [6, 'expired', 'checkbox', '{"1": "Yes", "0": "No"}', '1'], [7, 'expiresAt'], [8, 'credentialsExpired', 'checkbox', '{"1": "Yes", "0": "No"}', '1'], [9, 'credentialExpireAt'], [10, 'roles', 'multiple', '{ "ROLE_USER": "user", "ROLE_MANAGER": "manager", "ROLE_CONTRIBUTOR": "contributor", "ROLE_ADMIN": "admin", "ROLE_SUPER_ADMIN": "superadmin" }']
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
				var expiresAt = row.find('input[name=expiresAt]');
				var credentialExpireAt = row.find('input[name=credentialExpireAt]').val();
				if (userName.val() == '' || userName.val().length < 3) {
					errors.push('Please enter a valid user name (3 car. min).');
				}
				if (email.val() == '' || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.val())) {
					errors.push('Please enter a valid email address.');
				}
				if (password.val() == '' || password.val().length < 6) {
					errors.push('Please enter a valid password (6 car. min).');
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
				// TODO: row validation here, if error returns false
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
					$('#users').find('.tabledit-input.tabledit-identifier').val(data.id);
				}
				return; 
			},
		});
	}	
	global.Users = Users;
}(this));

(function (global) {
	'use strict';
	
	function Datasources() {
	};
	
	Datasources.fields = {};
	Datasources.editFields = [];
	Datasources.emptyRow = "";
	
	Datasources.init = function(tablename, fields, locale) {
		Datasources.fields = {};
		Datasources.editFields = [];
		var cells = "";
		$.each(fields, function(k, v) {
			if (v[1] !== 'id'){
				var type = v[4] === 'choice' ? 'single' : v[4] === 'date' ? 'text' : v[4] === 'boolean' ? 'checkbox' : v[4] === 'textarea' ? 'text' : v[4] === 'integer' ? 'number' : v[4] === 'day' ? 'number' : v[4] === 'month' ? 'number' : v[4] === 'year' ? 'number' : v[4] === 'number' ? 'text' : v[4] === 'money' ? 'text' : v[4] === 'percent' ? 'text' : v[4];
				var editField = [];
				editField.push(v[0], v[1], type);
				if (v[3]) {
					editField.push(v[5]);
				}
				Datasources.editFields.push(editField);
			}
			var field = { type: v[4], label: v[2], required: v[3] == 1};
			if (v[5]) {
				field.choices = jQuery.parseJSON(v[5]);
			}
			Datasources.fields[v[1]] = field;
			cells +='<td class="' + v[4] + '">';
			if (v[1] === 'id') {
				cells += '0';
			}
			cells + '</td>';
		});
		Datasources.emptyRow = '<tr>' + cells + '</tr>';
		
		$('#page-datasources #btnAddNewRow').click(function() {
			$('#page-datasources .tabledit-toolbar-column').remove();
			$('#page-datasources #' + tablename + ' tbody td').each(function() {
				var text = $(this).find('.tabledit-span').text();
				$(this).empty();
				$(this).text(text);
			});
			$.each(fields, function(k, v) {
			});
			$('#page-datasources #' + tablename + ' tbody').prepend(Datasources.emptyRow);
			Datasources.doeditable(tablename, locale);
			$('#page-datasources #' + tablename + ' tbody tr:first-child').find('.tabledit-edit-button').trigger( "click" );
		});
		Datasources.doeditable(tablename, locale);
		$('#page-datasources #' + tablename).bdt({
		    pageRowCount: 20,
		    arrowDown: 'fa-angle-down',
		    arrowUp: 'fa-angle-up',
			entriesPerPageText : 'Lignes par page',
			previousText: 'Pécédent',
			nextText: 'Suivant',
			searchText: 'Recherche...'
		});
		$('#page-datasources #' + tablename).resizableColumns({
			store: store
		});
	}
	
	Datasources.doeditable = function(tablename, locale) {
		$('#page-datasources #' + tablename).Tabledit({
			url: tablename,
		    editButton: true,
		    deleteButton: true,
		    saveButton: true,
		    restoreButton: true,
			autoFocus: false,
			hideIdentifier: true,
		    buttons: {
		        save: {
		             html: 'Enregistrer'
		        },
		        confirm: {
		            html: 'Confirmer'
		        }
		    },
			columns: {
				identifier: [0, 'id'],
				editable: Datasources.editFields
			},
			onDraw: function() {
				$('#page-datasources td.date input').datepicker({
					format: 'dd/mm/yyyy',
					autoclose: true,
					language: locale
				});			
			},
			onReset: function() {
				$('.alert').hide();
			},
            onRowEdited: function(row) {
				var errors = Datasources.checkValues (row);
				// check fields and put error messages in errors array
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
				// TODO: row validation here, if error returns false
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
					$('#users').find('.tabledit-input.tabledit-identifier').val(data.id);
				}
				return; 
			},

		});
	}
	
	Datasources.checkValue = function(name, value) {
		var info = Datasources.fields[name];
		if (typeof value === "undefined" || $.trim(value).length == 0) {
			if (info.required) {
				return "The field '%s' is required".replace('%s', info.label);
			} else {
				return true;
			}
		}
		switch (info.type) {
			case 'date':
				if (! /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
					return "The field '%s' is not a valid date".replace('%s', info.label);
				}
				break;
			case 'boolean':
				if ( $.inArray(value, ['0', '1', 'false', 'true'] ) == -1) {
					return "The field '%s' is invalid".replace('%s', info.label);
				}
				break;
			case 'number': 
				value = value.replace(",", ".");
				if (! $.isNumeric(value)) {
					return "The field '%s' is not a number".replace('%s', info.label);
				}
				break;
			case 'integer': 
				if (! /^\d+$/.test(value)) {
					return "The field '%s' is not a number".replace('%s', info.label);
				}
				break;
			case 'day': 
				if (! /^\d+$/.test(value) || parseInt(value) > 31 ) {
					return "The field '%s' is invalid".replace('%s', info.label);
				}
				break;
			case 'month': 
				if (! /^\d+$/.test(value) || parseInt(value) > 12 ) {
					return "The field '%s' is invalid".replace('%s', info.label);
				}
				break;
			case 'year': 
				if (! /^\d+$/.test(value) || value.length != 4 ) {
					return "The field '%s' is not a valid year".replace('%s', info.label);
				}
				break;
			case 'text': 
			case 'textarea': 
				break;
			case 'money': 
				value = value.replace(",", ".");
				if (! /^\d+(\.\d{1,2})?$/.test(value)) {
					return "The field '%s' is not a valid currency".replace('%s', info.label);
				}
				break;
			case 'choice':
				var ok = false;
				$.each(info.choices, function(val, label) {
					if (value == val) {
						ok = true;
						return false; // break
					}
	            });
				if (! ok) {
					return "The field '%s' is invalid".replace('%s', info.label);
				}
				break;
			case 'percent':
				value = value.replace(",", ".");
				if (! $.isNumeric(value)) {
					return "The field '%s' is not numeric".replace('%s', info.label);
				}
				break;
		}
		return true;
	}
	
	Datasources.checkValues = function(row) {
		var errors = [], result;
		$.each(Datasources.fields, function(name, field) {
			var input = row.find("input[name='" + name + "'], select[name='" + name + "']");
			if ((result = Datasources.checkValue (name, input.val())) !== true) {
				errors.push(result);
			}
	    });
		return errors;	
	}
	
	global.Datasources = Datasources;
}(this));

$(document).ready(function() {
	$.blockUI({ message: '<h1>Loading...</h1>' });
	if ( $( "#page-users" ).length ) {
		$('#page-users #btnAddNewRow').click(function() {
			$('#page-users .tabledit-toolbar-column').remove();
			$('#users tbody td').each(function() {
				var text = $(this).find('.tabledit-span').text();
				$(this).empty();
				$(this).text(text);
			});
			$('#users tbody').prepend('<tr><td class="integer">0</td><td class="text"></td><td class="text"></td><td class="password"></td><td class="boolean">Yes</td><td class="boolean">No</td><td class="boolean">No</td><td class="date"></td><td class="boolean">No</td><td class="date"></td><td class="choice"></td><td class="date"></td></tr>');
			Users.doeditable();
			$('#users tbody tr:first-child').find('.tabledit-edit-button').trigger( "click" );
		});
		Users.doeditable();
		$('#users').bdt({
		    pageRowCount: 20,
		    arrowDown: 'fa-angle-down',
		    arrowUp: 'fa-angle-up',
			entriesPerPageText : 'Lignes par page',
			previousText: 'Pécédent',
			nextText: 'Suivant',
			searchText: 'Recherche...'
		});
		$('#users').resizableColumns({
			store: store
		});
	}
	if ( $( "#page-simulators" ).length ) {
		$('#page-simulators textarea').wysihtml5({
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
		});
		$('#page-simulators select').select2({
			language: Admin.lang,
			minimumResultsForSearch: 50
		});
		$( '#page-simulators #datas .sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		$('#page-simulators .delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		
		$( "#page-simulators .optional-attributes li" ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});

		$( "#page-simulators .optional-attributes li" ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		$( "#page-simulators .attributes-container > div:first-child" ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
	}
	$.unblockUI();
});
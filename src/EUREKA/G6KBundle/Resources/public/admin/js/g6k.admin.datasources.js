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

	function Datasources() {
	};

	Datasources.fields = {};
	Datasources.editFields = [];
	Datasources.emptyRow = "";

	Datasources.init = function(tablename, fields, locale) {
		if (tablename === 'new') {
			$("#page-datasources textarea[name='table-description']").wysihtml5(Admin.wysihtml5Options);
			$('#btnAddNewColumn').click(function(e) {
				Datasources.addNewColumn();
				e.preventDefault();
				return false;
			});
			$("#new-table-form").submit(function (e) {
				var errors = Datasources.checkNewTable();
				if (errors.length > 0) {
					e.preventDefault();
					Datasources.showErrors(errors);
					return false;
				}
				Datasources.hideErrors();
				Admin.updated = false;
				return true;
			});
			Datasources.addNewColumn();
		} else {
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
				previousText: 'Précédent',
				nextText: 'Suivant',
				searchText: 'Recherche...'
			});
			$('#page-datasources #' + tablename).resizableColumns({
				store: store
			});
		}
	}

	Datasources.simpleAttributeForInput = function(id, type, name, label, value, required, placeholder, options) {
		var attribute = '<div class="form-group col-sm-12">';
		attribute    += '    <label for="' + id + '" class="col-sm-2 control-label">';
		if (! required) {
			attribute    += '    <span class="delete-attribute glyphicon glyphicon-remove text-danger"></span>&nbsp;';
		}
		attribute    += '    ' + label + '</label>';
		attribute    += '    <div class="col-sm-10">';
		if (type === 'text' || type === 'number') {
			attribute    += '        <input type="' + type + '" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" placeholder="' + placeholder + '"  value="' + value + '" />';
		} else if (type === 'checkbox') {
			attribute    += '        <input type="checkbox" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" value="1" checked="checked" />';
		} else if (type === 'select') {
			options = jQuery.parseJSON(options);
			attribute    += '        <select name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" data-placeholder="' + placeholder + '">';
			$.each(options, function(ovalue, olabel) {
				if (ovalue == value) {
					attribute    += '        <option value="' + ovalue + '" selected="selected">' + olabel + '</option>';
				} else {
					attribute    += '        <option value="' + ovalue + '">' + olabel + '</option>';
				}
			});
			attribute    += '        </select>';
		}
		attribute    += '    </div>';
		attribute    += '</div>';
		return $(attribute);
	}

	Datasources.removeAttribute = function(attr) {
		var id =  attr.parent('label.control-label').attr('for');
		var input = $('#' + id);
		var ids  = input.attr('id').split('-');
		var name = ids.pop();
		var element = ids.join('-');
		var li = attr.parents('div.attributes-container').children('div.optional-attributes').children('ul').children("li[data-element='" + element +"'][data-name='" + name +"']");
		li.show();
		attr.parent('label').parent('div.form-group').remove();
	}

	Datasources.dropAttribute = function(ui, target) {
		var element = ui.attr('data-element');
		var name = ui.attr('data-name');
		var type = ui.attr('data-type');
		var label = ui.text();
		var placeholder = ui.attr('data-placeholder');
		var id = element + '-' + name;
		var attribute = Datasources.simpleAttributeForInput(id, type, name, label, '', false, placeholder, ui.attr('data-options') );
		target.append(attribute);
		attribute.find('select.simple-value').select2({
			language: Admin.lang,
			minimumResultsForSearch: 50
		});
		attribute.find('span.delete-attribute').click(function() {
			Datasources.removeAttribute($(this));
		});
		ui.hide();
	}

	Datasources.drawChoicesForInput = function(fieldId) {
		var choicesPanel = $('<div>', { 'class': 'panel panel-default choices-panel', id: 'field-' + fieldId + '-choices-panel' });
		choicesPanel.append('<div class="panel-heading"><button class="btn btn-default pull-right update-button delete-choice-source">Delete source <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-default pull-right update-button add-choice-source">Add source <span class="glyphicon glyphicon-plus-sign"></span></button><button class="btn btn-default pull-right update-button add-choice">Add choice <span class="glyphicon glyphicon-plus-sign"></span></button>Choices</div>');
		var choicesPanelBody = $('<div class="panel-body"></div>');
		choicesPanel.append(choicesPanelBody);
		return choicesPanel;
	}

	Datasources.bindChoices = function(choicesPanel) {
		choicesPanel.find('button.add-choice').click(function(e) {
			e.preventDefault();
			var choicesContainer = choicesPanel.find('> .panel-body');
			var id = choicesContainer.children('div.panel').length + 1;
			var fieldId = choicesPanel.attr('id').match(/^field-(\d+)/)[1];
			var choice = {
				id: id,
				fieldId: fieldId - 1,
				value: '',
				label: ''
			};
			var choicePanel = Datasources.drawChoiceForInput(choice);
			choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
			choicesContainer.append(choicePanel);
			Datasources.bindChoice(choicePanel);
		});
		choicesPanel.find('button.add-choice-source').click(function(e) {
			e.preventDefault();
			var choicesContainer = choicesPanel.find('> .panel-body');
			var fieldId = choicesPanel.attr('id').match(/^field-(\d+)/)[1];
			var choiceSource = {
				id: 1,
				fieldId: fieldId - 1,
				datasource: '',
				returnType: 'assocArray',
				valueColumn: '',
				labelColumn: '',
				request: '',
				returnPath: ''
			};
			var choicePanel = Datasources.drawChoiceSourceForInput(choiceSource);
			choicesPanel.find('button.add-choice').removeClass('update-button').hide();
			choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
			choicesPanel.find('button.delete-choice-source').addClass('update-button').show();
			choicesContainer.append(choicePanel);
			Datasources.bindChoiceSource(choicePanel);
		});
		choicesPanel.find('button.delete-choice-source').click(function(e) {
			e.preventDefault();
			var choicesContainer = choicesPanel.find('> .panel-body');
			choicesContainer.find('.attributes-container').remove();
			choicesPanel.find('button.add-choice').addClass('update-button').show();
			choicesPanel.find('button.add-choice-source').addClass('update-button').show();
			choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
		});
	}

	Datasources.drawChoiceForInput = function(choice) {
		var choicePanel = $('<div>', { 'class': 'panel panel-default choice-panel',  'data-id': choice.id  });
		choicePanel.append('<div class="panel-heading"><button class="btn btn-default pull-right update-button delete-choice">Delete <span class="glyphicon glyphicon-minus-sign"></span></button>Choice ' + choice.id + '</div>');
		var choicePanelBody = $('<div>', { 'class': 'panel-body', id: 'field-' + choice.fieldId + '-choice-' + choice.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append('<div class="form-group col-sm-12"><label for="field-' + choice.fieldId + '-choice-' + choice.id + '-value" class="col-sm-4 control-label">Value</label><div class="col-sm-8"><input type="text" name="field-' + choice.fieldId + '-choice-value[]" id="field-' + choice.fieldId + '-choice-' + choice.id + '-value" class="form-control simple-value" placeholder="Choice value"  value="' + choice.value + '" /></div></div>');
		attributes.append('<div class="form-group col-sm-12"><label for="field-' + choice.fieldId + '-choice-' + choice.id + '-label" class="col-sm-4 control-label">Label</label><div class="col-sm-8"><input type="text" name="field-' + choice.fieldId + '-choice-label[]" id="field-' + choice.fieldId + '-choice-' + choice.id + '-label" class="form-control simple-value" placeholder="Choice label"  value="' + choice.label + '" /></div></div>');
		attributesContainer.append(attributes);
		choicePanelBody.append(attributesContainer);
		choicePanel.append(choicePanelBody);
		return choicePanel;
	}

	Datasources.bindChoice = function(choicePanel) {
		choicePanel.find('button.delete-choice').click(function(e) {
			e.preventDefault();
			var choicesPanel = choicePanel.parents('.choices-panel');
			choicePanel.remove();
			if (choicesPanel.find('> .panel-body').children().length == 0) {
				var choicesPanelHeading = choicesPanel.find('> .panel-heading');
				choicesPanelHeading.find('button.add-choice-source').addClass('update-button').show();
			}
		});
	}

	Datasources.bindChoiceSource = function(choiceSourceContainer) {
		choiceSourceContainer.find('.delete-attribute').click(function() {
			Datasources.removeAttribute($(this));
		});
		choiceSourceContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		choiceSourceContainer.find('.optional-attributes li' ).dblclick(function() {
			Datasources.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		choiceSourceContainer.find('> div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Datasources.dropAttribute(ui.draggable, target);
			}
		});
	}

	Datasources.drawChoiceSourceForInput = function(choiceSource) {
		var attributesContainer = $('<div class="attributes-container choice-source-container" data-id="' + choiceSource.id + '"></div>');
		var attributes = $('<div></div>');
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-datasource', 'number', 'datasource', 'Datasource', choiceSource.datasource, true, 'Datasource'));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-returnType', 'select', 'returnType', 'Return type', choiceSource.returnType, true, 'Select a return type', JSON.stringify({'json':'JSON format', 'xml':'XML format', 'singleValue':'Single value', 'assocArray':'Associative array'})));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-valueColumn', 'text', 'valueColumn', 'Source column value', choiceSource.valueColumn, true, 'Source column value'));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-labelColumn', 'text', 'labelColumn', 'Source column label', choiceSource.labelColumn, true, 'Source column label'));
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">Optional attributes</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var requestAttribute = $('<li class="list-group-item" data-element="field" data-type="text" data-name="' + choiceSource.fieldId + '-choicesource-request" data-placeholder="SQL Request">Request</li>');
		optionalAttributes.append(requestAttribute);
		var returnPathAttribute = $('<li class="list-group-item" data-element="field" data-type="text" data-name="' + choiceSource.fieldId + '-choicesource-returnPath" data-placeholder="Return path value">Return path</li>');
		optionalAttributes.append(returnPathAttribute);
		optionalAttributesPanel.append(optionalAttributes);
		if (choiceSource.request) {
			attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-request', 'text', 'request', 'SQL Request', choiceSource.request, false, 'SQL Request'));
			requestAttribute.hide();
		}
		if (choiceSource.returnPath) {
			attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-returnPath', 'text', 'returnPath', 'Return path value', choiceSource.returnPath, false, 'Return path value'));
			returnPathAttribute.hide();
		}
		attributesContainer.append(attributes);
		attributesContainer.append(optionalAttributesPanel);
		return attributesContainer;
	}

	Datasources.addNewColumn = function() {
		var num = Math.floor($('#new-table tbody tr').length / 3) + 1;
		var column = '<tr>' +
			'<td class="new-field-id" rowspan="3">' + num + '</td>' +
			'<td class="new-field-name">' +
			'<input name="field[]" class="form-control input-sm">' +
			'</td>' +
			'<td class="new-type">' +
			'<select name="type[]" class="form-control input-sm">';
		$.each(Admin.types, function(index, value) {
			if (index != 'today' && index != 'table' && index != 'array') {
				column += '<option value="' + index + '">' + value + '</option>'
			}
		})
		column += 
			'</select>' +
			'</td>' +
			'<td class="new-notnull">' +
			'<select name="notnull[]" class="form-control input-sm">' +
			'<option value="1">Yes</option>' +
			'<option value="0">No</option>' +
			'</select>' +
			'</td>' +
			'<td class="new-field-label">' +
			'<input name="label[]" class="form-control input-sm">' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="new-field-description" colspan="5">' +
			'<textarea name="description[]" class="form-control input-sm" placeholder="Field description"></textarea>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="new-field-choices" colspan="5">' +
			'</td>' +
			'</tr>';
		var $column = $(column);
		$column.appendTo($('#new-table tbody'));
		$column.find('textarea').wysihtml5(Admin.wysihtml5Options);
		$column.find('select').select2({
			language: Admin.lang,
			minimumResultsForSearch: 100
		});
		$column.next().next().find("td.new-field-choices").hide();
		var type = $column.find("td.new-type").find("select");
		type.data('previous', type.val());
		type.change(function (e) {
			var prev = $(this).data('previous');
			var curr = $(this).val();
			if (prev === 'choice' || prev === 'multichoice') {
				if (curr != 'choice' && curr != 'multichoice') {
					$column.next().next().find("td.new-field-choices").hide().empty();
				}
			} else if (curr === 'choice' || curr === 'multichoice') {
				var choices = $('<td class="new-field-choices" colspan="5"></td>');
				var choicesPanel = Datasources.drawChoicesForInput(num);
				choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
				choicesPanel.find('.edit-choice-source').removeClass('update-button').hide();
				choices.append(choicesPanel);
				Datasources.bindChoices(choicesPanel);
				$column.next().next().find("td.new-field-choices").append(choices).show();
			}
			$(this).data('previous', curr);
		});
	}

	Datasources.checkNewTable = function() {
		var errors = [];
		var tablename = $('#new-table-form').find("input[name='table-name']").val();
		if (tablename == '' || ! /^\w+$/.test(tablename)) {
			errors.push("Incorrect table name");
		}
		var tablelabel = $('#new-table-form').find("input[name='table-label']").val();
		if (tablelabel == '') {
			errors.push("Missing table label");
		}
		var field = "";
		$('#new-table tbody tr').each(function(index) {
			if (index % 2 == 0) {
				field = $(this).find("input[name='field[]']").val();
				var label = $(this).find("input[name='label[]']").val();
				if (field !== '') {
					if (! /^\w+$/.test(field)) {
						errors.push("Incorrect field name for field " + (Math.floor(index / 3) + 1));
					}
					if (label === '') {
						errors.push("incorrect label for field " + (Math.floor(index / 3) + 1));
					}
				} else if (label !== '') { 
					errors.push("incorrect label for field " + (Math.floor(index / 3) + 1));
				}
			} else {
				var description = $(this).find("textarea").val();
				if (field === '' && description !== '') { 
					errors.push("incorrect description for field " + (Math.floor(index / 3) + 1));
				}
			}
			
		});
		return errors;
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
				var errors = Datasources.checkTableRowValues (row);
				// check fields and put error messages in errors array
				if (errors.length > 0) {
					Datasources.showErrors(errors);
					return false;
				}
				Datasources.hideErrors();
				return true; 
			},
			onRowDeleted: function(row) {
				// TODO: row validation here, if error returns false
				return true; 
			},
			onSuccess: function(data, row, textStatus, jqXHR) {
				if (data.error) {
					setTimeout(function() {
						row.find( 'button.tabledit-edit-button').trigger( "click" );
						Datasources.showErrors([data.error]);
					}, 1500);
				} else if (data.action = 'edit' && data.id > 0) {
					$('#users').find('.tabledit-input.tabledit-identifier').val(data.id);
				}
				return; 
			},
		});
	}

	Datasources.checkTableFieldValue = function(name, value) {
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
				if (! /^\d+$/.test(value) || parseInt(value, 10) > 31 ) {
					return "The field '%s' is invalid".replace('%s', info.label);
				}
				break;
			case 'month': 
				if (! /^\d+$/.test(value) || parseInt(value, 10) > 12 ) {
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
			case 'multichoice':
				var nbNOK = value.length;
				$.each(value, function(v, l) {
					$.each(info.choices, function(val, label) {
						if (v == val) {
							nbNOK--;
							return false; // break
						}
					});
				});
				if (nbNOK > 0) {
					return "The field '%s' is invalid".replace('%s', info.label);
				}
				break;
			case 'percent':
				value = value.replace(",", ".");
				if (! $.isNumeric(value)) {
					return "The field '%s' is not numeric".replace('%s', info.label);
				}
				break;
			case 'array':
				break;
		}
		return true;
	}

	Datasources.checkTableRowValues = function(row) {
		var errors = [], result;
		$.each(Datasources.fields, function(name, field) {
			var input = row.find("input[name='" + name + "'], select[name='" + name + "']");
			if ((result = Datasources.checkTableFieldValue (name, input.val())) !== true) {
				errors.push(result);
			}
	    });
		return errors;
	}
	
	Datasources.checkDatasource = function() {
		var errors = [];
		var name = $("#datasource-name").val();
		if (name == '' | name == 'New Datasource') {
			errors.push("The datasource name is required");
		}
		var type = $("#datasource-type").val();
		switch (type) {
			case 'internal':
			case 'database':
				var dbname = $("#datasource-database-name").val();
				if (dbname == '') {
					errors.push("The database name is required");
				} else if (! /^\w+(\.db)?$/.test(uri)) {
					errors.push("Incorrect database name");
				}
				var dblabel = $("#datasource-database-label").val();
				if (dblabel == '') {
					errors.push("The database label is required");
				}
				var dbtype = $("#datasource-database-type").val();
				if (dbtype == 'mysqli' || dbtype == 'pgsl') {
					if ($("#datasource-database-host").val() == '') {
						errors.push("The database host is required");
					} 
					if ($("#datasource-database-port").val() == '') {
						errors.push("The database port is required");
					}
					if ($("#datasource-database-user").val() == '') {
						errors.push("The database user is required");
					}
					if ($("#datasource-database-password").val() != '') {
						var dbconfirm = $("#datasource-database-confirm-password").val();
						if (dbconfirm == '') {
							errors.push("Please confirm the database password");
						} else if (dbconfirm != $("#datasource-database-password").val()) {
							errors.push("The two passwords do not match !");
						}
					} else if ($("#datasource-database-confirm-password").val() != '') {
						errors.push("The two passwords do not match !");
					}
				}
				break;
			case 'uri':
				var uri = $("#datasource-uri").val();
				if (uri == '') {
					errors.push("The Web Service URI is required");
				} else if (! /^(?:https?:\/\/)?(?:([\w-]+)\.)?([\w-]+)\.([\w]+)\/?(?:([^?#$]+))?(?:\?([^#$]+))?(?:#(.*))?$/.test(uri)) {
					errors.push("Incorrect Web Service URI");
				}
		}
		return errors;
	}

	Datasources.showErrors = function(errors) {
		var mess = $('.alert ul');
		mess.empty();
		$.each(errors, function( index, value ) {
			mess.append('<li>' + value + '</li>');
		});
		$('.alert').show();
	}

	Datasources.hideErrors = function() {
		$('.alert ul').empty();
		$('.alert').hide();
	}

	Datasources.toggleDatasourceFields = function(id) {
		if (id == 'datasource-type') {
			var type = $('#'+id).val();
			if (type == 'uri') {
				$('#datasource-uri-panel-holder').show();
				$('#datasource-database-panel-holder').hide();
			} else {
				$('#datasource-database-panel-holder').show();
				$('#datasource-uri-panel-holder').hide();
			}
		} else if (id == 'datasource-database-type') {
			var type = $('#'+id).val();
			if (type == 'jsonsql' || type == 'sqlite') {
				$('#datasource-database-host').parent().parent().hide();
				$('#datasource-database-port').parent().parent().hide();
				$('#datasource-database-user').parent().parent().hide();
				$('#datasource-database-password').parent().parent().hide();
				$('#datasource-database-confirm-password').parent().parent().hide();
			} else {
				$('#datasource-database-host').parent().parent().show();
				$('#datasource-database-port').parent().parent().show();
				$('#datasource-database-user').parent().parent().show();
				$('#datasource-database-password').parent().parent().show();
				$('#datasource-database-confirm-password').parent().parent().show();
			}
		}
	}

	global.Datasources = Datasources;
}(this));

$(document).ready(function() {
	if ( $( "#page-datasources" ).length ) {
		$( "#datasource-creation-form, #datasource-edition-form" ).find('select').select2({
			language: Admin.lang,
			minimumResultsForSearch: 100
		}).on("change", function (e) {
			Datasources.toggleDatasourceFields(this.id);
			Admin.updated = true;
		});
		$( "#datasource-creation-form, #datasource-edition-form" ).find('input, textarea').on("change propertychange", function (e) {
			Admin.updated = true;
		});
		if ( $("#datasource-creation-form, #datasource-edition-form" ).length) {
			$("#page-datasources textarea[name='datasource-description']").wysihtml5(Admin.wysihtml5Options);
			Datasources.toggleDatasourceFields('datasource-type');
			Datasources.toggleDatasourceFields('datasource-database-type');
			$("#datasource-database-password").on("input propertychange", function (e) {
				if ($(this).val() != '') {
					$("#datasource-database-confirm-password").show();
				} else {
					$("#datasource-database-confirm-password").hide();
				}
			});
			if ($("#datasource-database-password").val() != '') {
				$("#datasource-database-confirm-password").show();
			} else {
				$("#datasource-database-confirm-password").hide();
			}
			$("#datasource-creation-form, #datasource-edition-form").submit(function (e) {
				var errors = Datasources.checkDatasource();
				if (errors.length > 0) {
					e.preventDefault();
					Datasources.showErrors(errors);
					return false;
				}
				Datasources.hideErrors();
				Admin.updated = false;
				return true;
			});
		}
	}
});
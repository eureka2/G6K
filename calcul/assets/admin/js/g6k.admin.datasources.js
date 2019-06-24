/**
The MIT License (MIT)

Copyright (c) 2015-2018 Jacques Archimède

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
	Datasources.datasources = {};
	Datasources.datasourcesSelect = '';
	Datasources.editFields = [];
	Datasources.emptyRow = "";

	Datasources.init = function(action, tablename, fields, datasources, locale) {
		var datasourcesSelect = {};
		$.each(datasources, function(d, datasource) {
			Datasources.datasources[datasource.name] = datasource.type;
			datasourcesSelect[datasource.name] = datasource.name;
		});
		Datasources.datasourcesSelect = JSON.stringify(datasourcesSelect);
		if (action === 'create-table') {
			$("#page-datasources textarea[name='table-description']").wysihtml(Admin.wysihtml5InlineOnlyOptions);
			$('#btnAddNewColumn').on('click', function(e) {
				Datasources.addNewColumn([0, '', '', '', '', '']);
				e.preventDefault();
				return false;
			});
			$('#btnSaveNewTable').on('click', function(e) {
				$('textarea.richtext').each(function() {
					$(this).val(Admin.clearHTML($(this)));
				});
				var errors = Datasources.checkNewTable();
				if (errors.length > 0) {
					e.preventDefault();
					Datasources.showErrors(errors);
					return false;
				}
				Datasources.hideErrors();
				Admin.updated = false;
				e.preventDefault();
				$(this).parent('form').submit();
			});
			Datasources.addNewColumn([0, '', '', '', '', '']);
			$('#btnSaveEditedTable').on('click', function (e) {
				$('textarea.richtext').each(function() {
					$(this).val(Admin.clearHTML($(this)));
				});
				e.preventDefault();
				$(this).parent('form').submit();
			});
		} else if (action === 'edit-table') {
			$("#page-datasources textarea[name='table-description']").wysihtml(Admin.wysihtml5InlineOnlyOptions);
			$('#btnAddNewColumn').on('click', function(e) {
				Datasources.addNewColumn([0, '', '', '', '-1', '']);
				e.preventDefault();
				return false;
			});
			$("#edit-table-form").submit(function (e) {
				var errors = Datasources.checkEditedTable();
				if (errors.length > 0) {
					e.preventDefault();
					Datasources.showErrors(errors);
					return false;
				}
				Datasources.hideErrors();
				Admin.updated = false;
				return true;
			});
			$.each(fields, function(index, field) {
				Datasources.addNewColumn(field);
			});
			$('#btnSaveEditedTable').on('click', function (e) {
				$('textarea.richtext').each(function() {
					$(this).val(Admin.clearHTML($(this)));
				});
				e.preventDefault();
				$(this).parent('form').submit();
			});
		} else if (action !== 'import-table') {
			Datasources.fields = {};
			Datasources.editFields = [];
			var cells = "";
			$.each(fields, function(k, v) {
				if (v[1] !== 'id'){
					var type = v[5] === 'choice' ? 'single' : v[5] === 'date' ? 'text' : v[5] === 'boolean' ? 'checkbox' : v[5] === 'textarea' ? 'text' : v[5] === 'integer' ? 'number' : v[5] === 'day' ? 'number' : v[5] === 'month' ? 'number' : v[5] === 'year' ? 'number' : v[5] === 'number' ? 'text' : v[5] === 'money' ? 'text' : v[5] === 'percent' ? 'text' : v[5];
					var editField = [];
					editField.push(v[0], v[1], type);
					if (v[5] == 'boolean') {
						editField.push('{"1": "' + Translator.trans('Yes') + '", "0": "' + Translator.trans('No') + '"}', '1');
					} else if (v[6]) {
						editField.push(v[6]);
					}
					Datasources.editFields.push(editField);
				}
				var field = { type: v[5], label: v[2], required: v[4] == 1};
				if (v[6]) {
					field.choices = JSON.parse(v[6]);
				}
				Datasources.fields[v[1]] = field;
				cells +='<td class="' + v[5] + '">';
				if (v[1] === 'id') {
					cells += '0';
				}
				cells + '</td>';
			});
			Datasources.emptyRow = '<tr>' + cells + '</tr>';
	
			$('#page-datasources #btnAddNewRow').on('click', function(e) {
				e.preventDefault();
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
			Datasources.sortColumn($('#page-datasources #' + tablename));
			$('#page-datasources #' + tablename).resizableColumns({
				store: store
			});
			$('#page-datasources thead tr:eq(1) th.date input').datepicker({
				format: 'dd/mm/yyyy',
				autoclose: true,
				language: locale
			});
			$('#page-datasources #edit-table-rows-form ul.pagination li a').on('click', function(e) {
				e.preventDefault();
				var form = $('#page-datasources #edit-table-rows-form').find("input[name='page']")
				var pagenum = $(this).attr('data-page');
				if (pagenum > 0) {
					$('#page-datasources #edit-table-rows-form').find("input[name='page']").val(pagenum);
					$('#page-datasources #edit-table-rows-form').submit();
				}
			});
			$('#page-datasources #edit-table-rows-form').find("select[name='itemsPerPage']").on('change', function(e) {
				e.preventDefault();
				$('#page-datasources #edit-table-rows-form').find("input[name='page']").val(1);
				$('#page-datasources #edit-table-rows-form').submit();
			});
			$('#page-datasources #edit-table-rows-form').find("button[name='btnFilter']").on('click', function(e) {
				e.preventDefault();
				$('#page-datasources #edit-table-rows-form').find("input[name='page']").val(1);
				$('#page-datasources #edit-table-rows-form').submit();
			});
		}
	}

	Datasources.sortColumn = function(obj) {
		var table = obj;
		var arrowDown = 'fa-angle-down';
		var arrowUp = 'fa-angle-up';
		var oldIndex = 0;
		obj
			.find('thead > tr:first-child th')
			.wrapInner('<span class="sort-element"/>')
			.append($('<span/>').addClass('sort-icon fa'))
			.css({cursor: 'pointer'})
			.each(function () {
				var th = $(this);
				var thIndex = th.index();
				var inverse = false;
				var addOrRemove = true;
				th.on('click', function () {
					if(!$(this).hasClass('disable-sorting')) {
						if($(this).find('.sort-icon').hasClass(arrowDown)) {
							$(this)
								.find('.sort-icon')
								.removeClass( arrowDown )
								.addClass(arrowUp);
						} else {
							$(this)
								.find('.sort-icon')
								.removeClass( arrowUp )
								.addClass(arrowDown);
						}
						if(oldIndex != thIndex) {
							obj.find('.sort-icon').removeClass(arrowDown);
							obj.find('.sort-icon').removeClass(arrowUp);
							$(this)
								.find('.sort-icon')
								.toggleClass( arrowDown, addOrRemove );
						}
						table.find('td').filter(function () {
							return $(this).index() === thIndex;
						}).sortElements(function (a, b) {
							return $.text([a]) > $.text([b]) ?
								inverse ? -1 : 1
								: inverse ? 1 : -1;
						}, function () {
							// parentNode is the element we want to move
							return this.parentNode;
						});
						inverse = !inverse;
						oldIndex = thIndex;
					}
				});
			});
	}

	Datasources.simpleAttributeForInput = function(id, type, name, label, value, required, placeholder, options) {
		var attribute = '<div class="form-group row" data-attribute="' + name + '">';
		attribute    += '	<label for="' + id + '" class="col-sm-2 col-form-label">';
		if (! required) {
			attribute    += '    <span class="delete-attribute fas fa-times text-danger"></span>&nbsp;';
		}
		attribute    += '    ' + label + '</label>';
		attribute    += '    <div class="col-sm-10">';
		if (type === 'text' || type === 'number') {
			attribute    += '        <input type="' + type + '" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" placeholder="' + placeholder + '"  value="' + value + '" />';
		} else if (type === 'checkbox') {
			attribute    += '        <input type="checkbox" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" value="1" checked="checked" />';
		} else if (type === 'select') {
			options = JSON.parse(options);
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
		var id =  attr.parent('label.col-form-label').attr('for');
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
		attribute.find('span.delete-attribute').on('click', function() {
			Datasources.removeAttribute($(this));
		});
		ui.hide();
	}

	Datasources.drawChoicesForInput = function(fieldId) {
		var choicesPanel = $('<div>', { 'class': 'card bg-light choices-panel', id: 'field-' + fieldId + '-choices-panel' });
		choicesPanel.append('<div class="card-header"><button class="btn btn-secondary pull-right update-button delete-choice-source" title="' + Translator.trans('Delete source') + '"><span class="button-label">' + Translator.trans('Delete source') + '</span><span class="fas fa-minus-circle"></span></button><button class="btn btn-secondary pull-right update-button add-choice-source" title="' + Translator.trans('Add source') + '"><span class="button-label">' + Translator.trans('Add source') + '</span><span class="fas fa-plus-circle"></span></button><button class="btn btn-secondary pull-right update-button add-choice" title="' + Translator.trans('Add choice') + '"><span class="button-label">' + Translator.trans('Add choice') + '</span><span class="fas fa-plus-circle"></span></button>' + Translator.trans('Choices') + '</div>');
		var choicesPanelBody = $('<div class="card-body"></div>');
		choicesPanel.append(choicesPanelBody);
		return choicesPanel;
	}

	Datasources.bindChoices = function(choicesPanel) {
		choicesPanel.find('button.add-choice').on('click', function(e) {
			e.preventDefault();
			var choicesContainer = choicesPanel.find('> .card-body');
			var id = choicesContainer.children('div.card').length + 1;
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
		choicesPanel.find('button.add-choice-source').on('click', function(e) {
			e.preventDefault();
			var choicesContainer = choicesPanel.find('> .card-body');
			var fieldId = choicesPanel.attr('id').match(/^field-(\d+)/)[1];
			var choiceSource = {
				id: 1,
				fieldId: fieldId - 1,
				datasource: '',
				returnType: 'assocArray',
				separator: '',
				delimiter: '',
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
		choicesPanel.find('button.delete-choice-source').on('click', function(e) {
			e.preventDefault();
			var choicesContainer = choicesPanel.find('> .card-body');
			choicesContainer.find('.attributes-container').remove();
			choicesPanel.find('button.add-choice').addClass('update-button').show();
			choicesPanel.find('button.add-choice-source').addClass('update-button').show();
			choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
		});
	}

	Datasources.drawChoiceForInput = function(choice) {
		var choicePanel = $('<div>', { 'class': 'card bg-light choice-panel',  'data-id': choice.id  });
		choicePanel.append('<div class="card-header"><button class="btn btn-secondary pull-right update-button delete-choice" title="' + Translator.trans('Delete') + '"><span class="button-label">' + Translator.trans('Delete') + '</span><span class="fas fa-minus-circle"></span></button>' + Translator.trans('Choice %id%', { 'id' : choice.id }) + '</div>');
		var choicePanelBody = $('<div>', { 'class': 'card-body', id: 'field-' + choice.fieldId + '-choice-' + choice.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append('<div class="form-group row"><label for="field-' + choice.fieldId + '-choice-' + choice.id + '-value" class="col-sm-4 col-form-label">' + Translator.trans('Value') + '</label><div class="col-sm-8"><input type="text" name="field-' + choice.fieldId + '-choice-value[]" id="field-' + choice.fieldId + '-choice-' + choice.id + '-value" class="form-control simple-value" placeholder="Choice value"  value="' + choice.value + '" /></div></div>');
		attributes.append('<div class="form-group row"><label for="field-' + choice.fieldId + '-choice-' + choice.id + '-label" class="col-sm-4 col-form-label">' + Translator.trans('Label') + '</label><div class="col-sm-8"><input type="text" name="field-' + choice.fieldId + '-choice-label[]" id="field-' + choice.fieldId + '-choice-' + choice.id + '-label" class="form-control simple-value" placeholder="Choice label"  value="' + choice.label + '" /></div></div>');
		attributesContainer.append(attributes);
		choicePanelBody.append(attributesContainer);
		choicePanel.append(choicePanelBody);
		return choicePanel;
	}

	Datasources.bindChoice = function(choicePanel) {
		choicePanel.find('button.delete-choice').on('click', function(e) {
			e.preventDefault();
			var choicesPanel = choicePanel.parents('.choices-panel');
			choicePanel.remove();
			if (choicesPanel.find('> .card-body').children().length == 0) {
				var choicesPanelHeading = choicesPanel.find('> .card-header');
				choicesPanelHeading.find('button.add-choice-source').addClass('update-button').show();
			}
		});
	}

	Datasources.bindChoiceSource = function(choiceSourceContainer) {
		choiceSourceContainer.find('.delete-attribute').on('click', function() {
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
		choiceSourceContainer.find('div[data-attribute=datasource], div[data-attribute=returnType]').find('select').on('change', function (e) {
			Datasources.fixShowingChoiceSourceForInput(choiceSourceContainer);
		});
	}

	Datasources.drawChoiceSourceForInput = function(choiceSource) {
		var attributesContainer = $('<div class="attributes-container choice-source-container" data-id="' + choiceSource.id + '"></div>');
		var attributes = $('<div></div>');
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-datasource', 'select', 'datasource', Translator.trans('Datasource'), choiceSource.datasource, true, Translator.trans('Select a datasource'), Datasources.datasourcesSelect));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-returnType', 'select', 'returnType', Translator.trans('Return format'), choiceSource.returnType, true, Translator.trans('Select a format'), JSON.stringify({'json':'JSON format', 'xml':'XML format', 'assocArray':'Associative array', 'csv':'CSV format'})));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-request', 'text', 'request', Translator.trans('SQL Request'), choiceSource.request, true, Translator.trans('SQL Request')));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-valueColumn', 'text', 'valueColumn', Translator.trans('Value column'), choiceSource.valueColumn, true, Translator.trans('Value column')));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-labelColumn', 'text', 'labelColumn', Translator.trans('Label column'), choiceSource.labelColumn, true, Translator.trans('Label column')));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-returnPath', 'text', 'returnPath', Translator.trans('Return path value'), choiceSource.returnPath, true, Translator.trans('Return path value')));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-separator', 'text', 'separator', Translator.trans('Separator'), choiceSource.separator, true, Translator.trans('Separator value')));
		attributes.append(Datasources.simpleAttributeForInput('field-' + choiceSource.fieldId + '-choicesource-delimiter', 'text', 'delimiter', Translator.trans('Delimiter'), choiceSource.delimiter, true, Translator.trans('Delimiter value')));
		attributesContainer.append(attributes);
		Datasources.fixShowingChoiceSourceForInput(attributesContainer);
		return attributesContainer;
	}

	Datasources.fixShowingChoiceSourceForInput = function(attributesContainer) {
		var datasourceAttribute = attributesContainer.find('div[data-attribute=datasource]');
		var returnTypeAttribute = attributesContainer.find('div[data-attribute=returnType]');
		var requestAttribute = attributesContainer.find('div[data-attribute=request]');
		var valueColumnAttribute = attributesContainer.find('div[data-attribute=valueColumn]');
		var labelColumnAttribute = attributesContainer.find('div[data-attribute=labelColumn]');
		var returnPathAttribute = attributesContainer.find('div[data-attribute=returnPath]');
		var separatorAttribute = attributesContainer.find('div[data-attribute=separator]');
		var delimiterAttribute = attributesContainer.find('div[data-attribute=delimiter]');
		var choiceSourceType = Datasources.datasources[datasourceAttribute.find('select').val()];
		if (choiceSourceType == 'internal' || choiceSourceType == 'database') {
			returnTypeAttribute.find('select').val('assocArray');
			returnTypeAttribute.hide();
			requestAttribute.show();
			valueColumnAttribute.find('input').attr('type', 'text');
			valueColumnAttribute.find('label').text(Translator.trans('Value column'));
			valueColumnAttribute.find('input').attr('placeholder', Translator.trans('column in the select list that corresponds to the value of the choice'));
			labelColumnAttribute.find('input').attr('type', 'text');
			labelColumnAttribute.find('label').text(Translator.trans('Label column'));
			labelColumnAttribute.find('input').attr('placeholder', Translator.trans('column in the select list that corresponds to the label of the choice'));
			returnPathAttribute.hide();
			separatorAttribute.hide();
			delimiterAttribute.hide();
		} else {
			returnTypeAttribute.show();
			requestAttribute.hide();
			returnPathAttribute.show();
			if (returnTypeAttribute.find('select').val() == 'csv') {
				valueColumnAttribute.find('input').attr('type', 'number');
				valueColumnAttribute.find('label').text(Translator.trans('Value column'));
				valueColumnAttribute.find('input').attr('placeholder', Translator.trans('column number of the csv data that corresponds to the value of the choice'));
				labelColumnAttribute.find('input').attr('type', 'number');
				labelColumnAttribute.find('label').text(Translator.trans('Label column'));
				labelColumnAttribute.find('input').attr('placeholder', Translator.trans('column number of the csv data that corresponds to the label of the choice'));
				returnPathAttribute.find('label').text(Translator.trans('Lines filter'));
				returnPathAttribute.find('input').attr('placeholder', Translator.trans('example: 3-9/11/21-25 ...'));
				separatorAttribute.show();
				delimiterAttribute.show();
			} else {
				valueColumnAttribute.find('input').attr('type', 'text');
				labelColumnAttribute.find('input').attr('type', 'text');
				separatorAttribute.hide();
				delimiterAttribute.hide();
				if (returnTypeAttribute.find('select').val() == 'json') {
					valueColumnAttribute.find('label').text(Translator.trans('Value property'));
					valueColumnAttribute.find('input').attr('placeholder', Translator.trans('property of the json data that corresponds to the value of the choice'));
					labelColumnAttribute.find('label').text(Translator.trans('Label property'));
					labelColumnAttribute.find('input').attr('placeholder', Translator.trans('property of the json data that corresponds to the label of the choice'));
					returnPathAttribute.find('label').text(Translator.trans('Path filter'));
					returnPathAttribute.find('input').attr('placeholder', Translator.trans('JSONPath (see http://goessner.net/articles/JsonPath/) or XPath(see https://www.w3.org/TR/xpath/) filter'));
				} else if (returnTypeAttribute.find('select').val() == 'xml') {
					valueColumnAttribute.find('label').text(Translator.trans('Value node'));
					valueColumnAttribute.find('input').attr('placeholder', Translator.trans('XML node or attribute that corresponds to the value of the choice'));
					labelColumnAttribute.find('label').text(Translator.trans('Label node'));
					labelColumnAttribute.find('input').attr('placeholder', Translator.trans('XML node or attribute that corresponds to the label of the choice'));
					returnPathAttribute.find('label').text(Translator.trans('XPath filter'));
					returnPathAttribute.find('input').attr('placeholder', Translator.trans('see https://www.w3.org/TR/xpath/'));
				} else { // assocArray
					valueColumnAttribute.find('label').text(Translator.trans('Value key'));
					valueColumnAttribute.find('input').attr('placeholder', Translator.trans('key of the associative array that corresponds to the value of the choice'));
					labelColumnAttribute.find('label').text(Translator.trans('Label key'));
					labelColumnAttribute.find('input').attr('placeholder', Translator.trans('key of the associative array that corresponds to the label of the choice'));
					returnPathAttribute.find('label').text(Translator.trans('Rows filter'));
					returnPathAttribute.find('input').attr('placeholder', Translator.trans('example: 3-9/11/21-25 ...'));
				}
			}
		}
	}

	Datasources.addNewColumn = function(field) {
		var num = Math.floor($('#edition-table > tbody > tr').length / 3) + 1;
		var column = '<tr>' +
			'<td class="new-field-id" rowspan="3">' + num + '</td>' +
			'<td class="new-field-name">' +
			'<input name="field[]" class="form-control form-control-sm" value="' + field[1] + '">' +
			'</td>' +
			'<td class="new-type">' +
			'<select name="type[]" class="form-control form-control-sm">';
		$.each(Admin.types, function(index, value) {
			if (index != 'today' && index != 'table' && index != 'array') {
				column += '<option value="' + index + '"';
				if (field[5] == index) {
					column += ' selected="selected"';
				}
				column += '>' + value + '</option>'
			}
		})
		column += 
			'</select>' +
			'</td>' +
			'<td class="new-notnull">' +
			'<select name="notnull[]" class="form-control form-control-sm"';
		if (field[4] == '-1') {
			column += ' disabled="disabled"';
			field[4] = '0';
		}
		column += ">";
		column += 
			'<option value="1"';
		if (field[4] == '1') {
			column += ' selected="selected"';
		}
		column += 
			'>' + Translator.trans('Yes') + '</option>' +
			'<option value="0"';
		if (field[4] == '0') {
			column += ' selected="selected"';
		}
		column += 
			'>' + Translator.trans('No') + '</option>' +
			'</select>' +
			'</td>' +
			'<td class="new-field-label">' +
			'<input name="label[]" class="form-control form-control-sm" value="' + field[2] + '">' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="new-field-description" colspan="5">' +
			'<textarea rows="1" name="description[]" class="richtext form-control form-control-sm" placeholder="' + Translator.trans('Field description') + '">' + field[3] + '</textarea>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td class="new-field-choices" colspan="5">' +
			'</td>' +
			'</tr>';
		var $column = $(column);
		$column.appendTo($('#edition-table > tbody'));
		$column.find('textarea').wysihtml(Admin.wysihtml5InlineOnlyOptions);
		$column.find('select').select2({
			language: Admin.lang,
			minimumResultsForSearch: 100
		});
		$column.next().next().find("td.new-field-choices").hide();
		if (field[5] === 'choice' || field[5] === 'multichoice') {
			var choicesPanel = Datasources.drawChoicesForInput(num);
			choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
			choicesPanel.find('.edit-choice-source').removeClass('update-button').hide();
			Datasources.bindChoices(choicesPanel);
			$column.next().next().find("td.new-field-choices").append(choicesPanel).show();
			if (field[7]) {
				var choiceSource = JSON.parse(field[7]);
				var choicesContainer = choicesPanel.find('> .card-body');
				var fieldId = choicesPanel.attr('id').match(/^field-(\d+)/)[1];
				choiceSource['fieldId'] = fieldId - 1;
				var choicePanel = Datasources.drawChoiceSourceForInput(choiceSource);
				choicesPanel.find('button.add-choice').removeClass('update-button').hide();
				choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
				choicesPanel.find('button.delete-choice-source').addClass('update-button').show();
				choicesContainer.append(choicePanel);
				Datasources.bindChoiceSource(choicePanel);
			} else if (field[6]) {
				var choices = JSON.parse(field[6]);
				var choicesContainer = choicesPanel.find('> .card-body');
				var fieldId = choicesPanel.attr('id').match(/^field-(\d+)/)[1];
				$.each(choices, function(value, label) {
					var id = choicesContainer.children('div.card').length + 1;
					var choice = {
						id: id,
						fieldId: fieldId - 1,
						value: value,
						label: label
					};
					var choicePanel = Datasources.drawChoiceForInput(choice);
					choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
					choicesContainer.append(choicePanel);
					Datasources.bindChoice(choicePanel);
				});
			}
		}
		var type = $column.find("td.new-type").find("select");
		type.data('previous', type.val());
		type.on('change', function (e) {
			var prev = $(this).data('previous');
			var curr = $(this).val();
			if (prev === 'choice' || prev === 'multichoice') {
				if (curr != 'choice' && curr != 'multichoice') {
					$column.next().next().find("td.new-field-choices").hide().empty();
				}
			} else if (curr === 'choice' || curr === 'multichoice') {
				var choicesPanel = Datasources.drawChoicesForInput(num);
				choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
				choicesPanel.find('.edit-choice-source').removeClass('update-button').hide();
				Datasources.bindChoices(choicesPanel);
				$column.next().next().find("td.new-field-choices").append(choicesPanel).show();
			}
			$(this).data('previous', curr);
		});
		$("html, body").animate({ scrollTop: $column.offset().top - $('#navbar').height() }, 500);
	}

	Datasources.checkNewTable = function() {
		var errors = [];
		var tablename = $('#new-table-form').find("input[name='table-name']").val();
		if (tablename == '' || ! /^\w+$/.test(tablename)) {
			errors.push(Translator.trans("Incorrect table name"));
		}
		var tablelabel = $('#new-table-form').find("input[name='table-label']").val();
		if (tablelabel == '') {
			errors.push(Translator.trans("Missing table label"));
		}
		var field = "";
		$('#edition-table tbody tr').each(function(index) {
			if (index % 2 == 0) {
				field = $(this).find("input[name='field[]']").val();
				var label = $(this).find("input[name='label[]']").val();
				if (field !== '') {
					if (! /^\w+$/.test(field)) {
						errors.push(Translator.trans("Incorrect field name for field %field%", {'field': (Math.floor(index / 3) + 1)}));
					}
					if (label === '') {
						errors.push(Translator.trans("incorrect label for field %field%", {'field': (Math.floor(index / 3) + 1)}));
					}
				} else if (label !== '') { 
					errors.push(Translator.trans("incorrect label for field %field%", {'field': (Math.floor(index / 3) + 1)}));
				}
			} else {
				var description = Admin.clearHTML($(this).find("textarea"));
				if (field === '' && description !== '') { 
					errors.push(Translator.trans("incorrect description for field %field%", {'field': (Math.floor(index / 3) + 1)}));
				}
			}
			
		});
		return errors;
	}

	Datasources.checkEditedTable = function() {
		var errors = [];
		var tablename = $('#edit-table-form').find("input[name='table-name']").val();
		if (tablename == '' || ! /^\w+$/.test(tablename)) {
			errors.push(Translator.trans("Incorrect table name"));
		}
		var tablelabel = $('#new-table-form').find("input[name='table-label']").val();
		if (tablelabel == '') {
			errors.push(Translator.trans("Missing table label"));
		}
		var field = "";
		$('#edition-table tbody tr').each(function(index) {
			if (index % 2 == 0) {
				field = $(this).find("input[name='field[]']").val();
				var label = $(this).find("input[name='label[]']").val();
				if (field !== '') {
					if (! /^\w+$/.test(field)) {
						errors.push(Translator.trans("Incorrect field name for field %field%", {'field': (Math.floor(index / 3) + 1)}));
					}
					if (label === '') {
						errors.push(Translator.trans("incorrect label for field %field%", {'field': (Math.floor(index / 3) + 1)}));
					}
				} else if (label !== '') { 
					errors.push(Translator.trans("incorrect label for field %field%", {'field': (Math.floor(index / 3) + 1)}));
				}
			} else {
				var description = Admin.clearHTML($(this).find("textarea"));
				if (field === '' && description !== '') { 
					errors.push(Translator.trans("incorrect description for field %field%", {'field': (Math.floor(index / 3) + 1)}));
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
				return true; 
			},
			onSuccess: function(data, row, textStatus, jqXHR) {
				if (data.error) {
					setTimeout(function() {
						row.find( 'button.tabledit-edit-button').trigger( "click" );
						Datasources.showErrors([data.error]);
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
		$('#page-datasources #' + tablename).find('thead tr:eq(1)').append('<th class="tabledit-toolbar-column"><button name="btnFilter" class="btn btn-secondary" style="white-space: nowrap; margin:0;padding:0.3em;width:100%"><span class="button-label" style="font-size: 0.8em;">' + Translator.trans('Filtrate') + '</span> <span style="float:none;" class="fas fa-filter"></span></button></th>');

	}

	Datasources.checkTableFieldValue = function(name, value) {
		var info = Datasources.fields[name];
		if (typeof value === "undefined" || $.trim(value).length == 0) {
			if (info.required) {
				return Translator.trans("The field '%field%' is required", { 'field' : info.label});
			} else {
				return true;
			}
		}
		switch (info.type) {
			case 'date':
				if (! /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
					return Translator.trans("The field '%field%' is not a valid date", { 'field' : info.label});
				}
				break;
			case 'boolean':
				if ( $.inArray(value, ['0', '1', 'false', 'true'] ) == -1) {
					return Translator.trans("The field '%field%' is invalid", { 'field' : info.label});
				}
				break;
			case 'number': 
				value = value.replace(",", ".");
				if (! $.isNumeric(value)) {
					return Translator.trans("The field '%field%' is not a number", { 'field' : info.label});
				}
				break;
			case 'integer': 
				if (! /^\d+$/.test(value)) {
					return Translator.trans("The field '%field%' is not a number", { 'field' : info.label});
				}
				break;
			case 'day': 
				if (! /^\d+$/.test(value) || parseInt(value, 10) > 31 ) {
					return Translator.trans("The field '%field%' is invalid", { 'field' : info.label});
				}
				break;
			case 'month': 
				if (! /^\d+$/.test(value) || parseInt(value, 10) > 12 ) {
					return Translator.trans("The field '%field%' is invalid", { 'field' : info.label});
				}
				break;
			case 'year': 
				if (! /^\d+$/.test(value) || value.length != 4 ) {
					return Translator.trans("The field '%field%' is not a valid year", { 'field' : info.label});
				}
				break;
			case 'text': 
			case 'textarea': 
				break;
			case 'money': 
				value = value.replace(",", ".");
				if (! /^\d+(\.\d{1,2})?$/.test(value)) {
					return Translator.trans("The field '%field%' is not a valid currency", { 'field' : info.label});
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
					return Translator.trans("The field '%field%' is invalid", { 'field' : info.label});
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
					return Translator.trans("The field '%field%' is invalid", { 'field' : info.label});
				}
				break;
			case 'percent':
				value = value.replace(",", ".");
				if (! $.isNumeric(value)) {
					return Translator.trans("The field '%field%' is not numeric", { 'field' : info.label});
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
		if (name == '' || name == Translator.trans('New Datasource')) {
			errors.push(Translator.trans("The datasource name is required"));
		}
		if (! /^[\w\-]+$/.test(name)) {
			errors.push(Translator.trans("Incorrect datasource name"));
		}
		if (name == 'all') {
			errors.push(Translator.trans("The name of the data source can't be 'all'"));
		}
		var type = $("#datasource-type").val();
		switch (type) {
			case 'internal':
			case 'database':
				var dbname = $("#datasource-database-name").val();
				if (dbname == '') {
					errors.push(Translator.trans("The database name is required"));
				} else if (! /^\w+(\.db)?$/.test(uri)) {
					errors.push(Translator.trans("Incorrect database name"));
				}
				var dblabel = $("#datasource-database-label").val();
				if (dblabel == '') {
					errors.push(Translator.trans("The database label is required"));
				}
				var dbtype = $("#datasource-database-type").val();
				if (dbtype == 'mysql' || dbtype == 'mysqli' || dbtype == 'pgsl') {
					if ($("#datasource-database-host").val() == '') {
						errors.push(Translator.trans("The database host is required"));
					} 
					if ($("#datasource-database-port").val() == '') {
						errors.push(Translator.trans("The database port is required"));
					}
					if ($("#datasource-database-user").val() == '') {
						errors.push(Translator.trans("The database user is required"));
					}
					if ($("#datasource-database-password").val() != '') {
						var dbconfirm = $("#datasource-database-confirm-password").val();
						if (dbconfirm == '') {
							errors.push(Translator.trans("Please confirm the database password"));
						} else if (dbconfirm != $("#datasource-database-password").val()) {
							errors.push(Translator.trans("The two passwords do not match !"));
						}
					} else if ($("#datasource-database-confirm-password").val() != '') {
						errors.push(Translator.trans("The two passwords do not match !"));
					}
				}
				break;
			case 'uri':
				var uri = $("#datasource-uri").val();
				if (uri == '') {
					errors.push(Translator.trans("The Web Service URI is required"));
				} else if (! /^(?:https?:\/\/)?(?:([\w-]+)\.)?([\w-]+)\.([\w]+)\/?(?:([^?#$]+))?(?:\?([^#$]+))?(?:#(.*))?$/.test(uri)) {
					errors.push(Translator.trans("Incorrect Web Service URI"));
				}
		}
		return errors;
	}

	Datasources.showErrors = function(errors, message) {
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

	Datasources.hideErrors = function() {
		$('.alert .error-message').empty();
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

$(function(){
	if ( $( "#page-datasources" ).length ) {
		$( "#datasource-creation-form, #datasource-edition-form" ).find('select').select2({
			language: Admin.lang,
			minimumResultsForSearch: 100
		}).on("change", function (e) {
			Datasources.toggleDatasourceFields(this.id);
			Admin.updated = true;
		});
		$( "#datasource-creation-form, #datasource-edition-form, #datasource-import-form, #edit-table-form, #import-table-form" ).find('input, textarea').on("change propertychange", function (e) {
			Admin.updated = true;
		});
		if ( $("#datasource-creation-form, #datasource-edition-form" ).length) {
			$("#page-datasources textarea[name='datasource-description']").wysihtml(Admin.wysihtml5InlineOnlyOptions);
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
				if ($("#datasource-database-type").val() == 'sqlite') {
					var dbname = $("#datasource-database-name").val();
					if (! /\.db$/.test(dbname)) {
						$("#datasource-database-name").val(dbname + '.db');
					}
				}
				Datasources.hideErrors();
				Admin.updated = false;
				return true;
			});
			$('#btnSaveDatasource').on('click', function(e) {
				$('textarea.richtext').each(function() {
					$(this).val(Admin.clearHTML($(this)));
				});
				e.preventDefault();
				$(this).parent('form').submit();
			});
		}
		if ( $("#datasource-import-form" ).length) {
			if (Admin.lang == 'de' || Admin.lang == 'es' || Admin.lang == 'fr') { 
				tv4.language(Admin.lang);
			}
			$("#datasource-import-form input[name='datasource-schema-file'], #datasource-import-form input[name='datasource-data-file']").on('change', function (e) {
			Datasources.hideErrors();
			var files = e.target.files;
				var $file = $(this);
				var reader = new FileReader();
				reader.onload = function(e) {
					$file.data('content', e.target.result);
				};
				reader.onerror  = function(e) {
					$file.data('error', e.target.error.name);
				};
				reader.readAsText(files[0], "UTF-8");
			});
			$("#datasource-import-form").submit(function (e) {
				var errors = [];
				var name = '';
				var schemainput = $("#datasource-import-form input[name='datasource-schema-file']");
				var schemafile = schemainput.val();
				messageheader = '';
				if (schemafile == '') {
					errors.push(Translator.trans("Please, choose a JSON schema file"));
				} else if (! /\.schema\.json$/.test(schemafile)) {
					errors.push(Translator.trans("The JSON schema file extension must be '.schema.json'"));
				} else {
					var m = schemafile.match(/^(.+)\.schema\.json$/);
					name = m[1];
				}
				var datainput = $("#datasource-import-form input[name='datasource-data-file']");
				var datafile = datainput.val();
				if (datafile == '') {
					errors.push(Translator.trans("Please, choose a JSON data file"));
				} else if (! /\.json$/.test(datafile)) {
					errors.push(Translator.trans("The JSON data file extension must be '.json'"));
				} else if (name != '') {
					var m = datafile.match(/^(.+)\.json$/);
					if (name != m[1]) {
						errors.push(Translator.trans("The names of the two files without extension should be the same."));
					} else {
						var metaschema = JSON.parse('{"id": "http://json-schema.org/draft-04/schema#", "$schema": "http://json-schema.org/draft-04/schema#", "description": "Core schema meta-schema", "definitions": {"schemaArray": {"type": "array", "minItems": 1, "items": {"$ref": "#"}}, "positiveInteger": {"type": "integer", "minimum": 0}, "positiveIntegerDefault0": {"allOf": [{"$ref": "#/definitions/positiveInteger"}, {"default": 0}]}, "simpleTypes": {"enum": ["array", "boolean", "integer", "null", "number", "object", "string"]}, "stringArray": {"type": "array", "items": {"type": "string"}, "minItems": 1, "uniqueItems": true}}, "type": "object", "properties": {"id": {"type": "string", "format": "uri"}, "$schema": {"type": "string", "format": "uri"}, "title": {"type": "string"}, "description": {"type": "string"}, "default": {}, "multipleOf": {"type": "number", "minimum": 0, "exclusiveMinimum": true}, "maximum": {"type": "number"}, "exclusiveMaximum": {"type": "boolean", "default": false}, "minimum": {"type": "number"}, "exclusiveMinimum": {"type": "boolean", "default": false}, "maxLength": {"$ref": "#/definitions/positiveInteger"}, "minLength": {"$ref": "#/definitions/positiveIntegerDefault0"}, "pattern": {"type": "string", "format": "regex"}, "additionalItems": {"anyOf": [{"type": "boolean"}, {"$ref": "#"}], "default": {}}, "items": {"anyOf": [{"$ref": "#"}, {"$ref": "#/definitions/schemaArray"}], "default": {}}, "maxItems": {"$ref": "#/definitions/positiveInteger"}, "minItems": {"$ref": "#/definitions/positiveIntegerDefault0"}, "uniqueItems": {"type": "boolean", "default": false}, "maxProperties": {"$ref": "#/definitions/positiveInteger"}, "minProperties": {"$ref": "#/definitions/positiveIntegerDefault0"}, "required": {"$ref": "#/definitions/stringArray"}, "additionalProperties": {"anyOf": [{"type": "boolean"}, {"$ref": "#"}], "default": {}}, "definitions": {"type": "object", "additionalProperties": {"$ref": "#"}, "default": {}}, "properties": {"type": "object", "additionalProperties": {"$ref": "#"}, "default": {}}, "patternProperties": {"type": "object", "additionalProperties": {"$ref": "#"}, "default": {}}, "dependencies": {"type": "object", "additionalProperties": {"anyOf": [{"$ref": "#"}, {"$ref": "#/definitions/stringArray"}]}}, "enum": {"type": "array", "minItems": 1, "uniqueItems": true}, "type": {"anyOf": [{"$ref": "#/definitions/simpleTypes"}, {"type": "array", "items": {"$ref": "#/definitions/simpleTypes"}, "minItems": 1, "uniqueItems": true}]}, "allOf": {"$ref": "#/definitions/schemaArray"}, "anyOf": {"$ref": "#/definitions/schemaArray"}, "oneOf": {"$ref": "#/definitions/schemaArray"}, "not": {"$ref": "#"}}, "dependencies": {"exclusiveMaximum": ["maximum"], "exclusiveMinimum": ["minimum"]}, "default": {}}');
						var schema = JSON.parse(schemainput.data('content'));
						var data = JSON.parse(datainput.data('content'));

						var result = tv4.validateMultiple(data, schema, true, true);
						if (!result.valid) {
							messageheader = Translator.trans('Validation errors') + ' : ';
							$.each(result.errors, function (e, error) {
								var dataPath = "";
								if (error.dataPath) {
									var table = "";
									var row = 0;
									var paths = error.dataPath.split("/");
									var len = paths.length
									$.each(paths, function (p, path) {
										switch (p) {
											case 1:
												table = path;
												dataPath += Translator.trans("Table") + " '" + table + "'";
												break;
											case 2:
												row = parseInt(path);
												dataPath += Translator.trans("Row") + " " + (row + 1);
												break;
											case 3:
												dataPath += Translator.trans("Field") + " '" + path + "', ";
												dataPath += Translator.trans("Data") + " '" + data[table][row][path] + "'";
												break;
										}
										dataPath += p == 0 || p == len - 1 ? '' : ', ';
									});
									dataPath += " : ";
								}
								errors.push(dataPath + error.message);
							});
						}
					}
				}
				if (errors.length > 0) {
					e.preventDefault();
					Datasources.showErrors(errors, messageheader);
					return false;
				}
				Datasources.hideErrors();
				Admin.updated = false;
				return true;
			});
		}
		if ( $("#import-table-form" ).length) {
			$("#import-table-form input[name='table-data-file']").on('change', function (e) {
				Datasources.hideErrors();
				var files = e.target.files;
				var $file = $(this);
				if (/\.txt$/.test(files[0].name)) {
					$("#import-table-form select[name='table-data-separator']").val('t');
				} else if (/\.csv$/.test(files[0].name)) {
					$("#import-table-form select[name='table-data-separator']").val(';');
				}
				var reader = new FileReader();
				reader.onload = function(e) {
					$file.data('content', e.target.result);
				};
				reader.onerror  = function(e) {
					$file.data('error', e.target.error.name);
				};
				reader.readAsText(files[0], "UTF-8");
			});
			$("#import-table-form").submit(function (e) {
				var errors = [];
				var name = '';
				messageheader = Translator.trans('Text file');
				var datainput = $("#import-table-form input[name='table-data-file']");
				var datafile = datainput.val();
				if (datafile == '') {
					errors.push(Translator.trans("Please, choose a file"));
				} else if (! /\.(csv|txt)$/.test(datafile)) {
					errors.push(Translator.trans("The data file extension must be '.csv' or '.txt'"));
				}
				if (errors.length > 0) {
					e.preventDefault();
					Datasources.showErrors(errors, messageheader);
					return false;
				}
				Datasources.hideErrors();
				Admin.updated = false;
				return true;
			});
		}
	}
});
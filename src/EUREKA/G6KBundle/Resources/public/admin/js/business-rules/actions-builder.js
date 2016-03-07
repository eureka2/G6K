/*
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

(function($) {
	"use strict";
	
	$.fn.actionsBuilder = function(options) {
	    if (options == "actions") {
			var builder = $(this).eq(0).data("actionsBuilder");
			return builder.collectData();
	    } else {
			return $(this).each(function() {
				var builder = new ActionsBuilder(this, options);
				$(this).data("actionsBuilder", builder);
			});
	    }
	};
	
	function ActionsBuilder(element, options) {
	    this.element = $(element);
	    this.options = options || {};
	    this.init();
	}
	
	ActionsBuilder.prototype = {
	    init: function() {
			this.actions = this.options.actions;
			this.fields = this.options.fields;
			this.expressionOptions = this.options.expressionOptions;
			this.data = this.options.data || [];
			this.element.html(this.buildActions(this.data));
	    },
	
	    buildActions: function(data) {
			var container = $("<div>", {"class": "actions"});
			var buttons = $("<div>", {"class": "action-buttons"});
			var addButton = $("<button>", {"class": "add btn-primary fa fa-plus-square", "text": "  Add Action"});
			var self = this;
	
			addButton.click(function(e) {
				e.preventDefault();
				container.append(self.buildAction({}));
			});
	
			buttons.append(addButton);
			container.append(buttons);
	
			for (var i=0; i < data.length; i++) {
				var actionObj = data[i];
				var actionDiv = this.buildAction(actionObj);
	
				// Add values to fields
				var fields = [actionObj];
				var field;
				while(field = fields.shift()) {
					var input = actionDiv.find(":input[name='" + field.name + "'], span[name='" + field.name + "']");
					if (input.hasClass('expression')) {
						input.expressionbuilder('val', field.value);
					} else if (input.is(':checkbox')) {
						input.prop('checked', field.value == input.attr('value'));
					} else {
						input.val(field.value).change();
					}
					if (field.fields) {
						fields = fields.concat(field.fields);
					}
				}
				container.append(actionDiv);
			}
			return container;
	    },
	
	    buildAction: function(data) {
			var field = this.findField(data.name);
			var div = $("<div>", {"class": "action"});
			var fieldsDiv = $("<div>", {"class": "subfields"});
			var select = $("<select>", {"class": "action-select form-control", "name": "action-select"});
	
			for (var i=0; i < this.actions.length; i++) {
				var possibleField = this.actions[i];
				var option = $("<option>", {"text": possibleField.label, "value": possibleField.name});
				select.append(option);
			}
	
			var self = this;
			select.change(function() {
				var val = $(this).val();
				var newField = self.findField(val);
				fieldsDiv.empty();
				if (newField.fields) {
					for (var i=0; i < newField.fields.length; i++) {
						fieldsDiv.append(self.buildField(newField.fields[i]));
					}
				}
				div.attr("class", "action " + val);
			});
	
			var removeLink = $("<button>", {"class": "remove btn-danger glyphicon glyphicon-remove", "text": " ", "title": "Remove this Action"});
			removeLink.click(function(e) {
				e.preventDefault();
				div.remove();
			});
	
			div.append(select);
			div.append(fieldsDiv);
			div.append(removeLink);
			return div;
	    },
	
	    buildField: function(field) {
			var div = $("<div>", {"class": "field"});
			var subfields = $("<div>", {"class": "subfields"});
			var self = this;
	
			var label = $("<label>", {"text": field.label});
			div.append(label);
	
			if (field.fieldType == "field") {
				field.options = [];
				$.each(self.options.fields, function(name, fieldOptions) {
					var fieldType = 'expression', fields, options = null;
					if (field.newValue) {
						if (fieldOptions.type === 'choice') {
							fieldType = 'select';
							options = fieldOptions.options;
						}
						field.options.push({
							label: fieldOptions.label,
							name: name,
							fields: [{
										label: 'to', 
										name: 'newValue',
										fieldType: fieldType,
										options: options
									}]
						});
					} else {
						field.options.push({
							label: fieldOptions.label,
							name: name
						});
					}
				});
				field.fieldType = "select";
			}
			if (field.fieldType == "select") {
				var label = $("<label>", {"text": field.label});
				var select = $("<select>", {"name": field.name, "class": "form-control"});
	
				for (var i=0; i < field.options.length; i++) {
					var optionData = field.options[i];
					var option = $("<option>", {"text": optionData.label, "value": optionData.name});
					option.data("optionData", optionData);
					select.append(option);
				}
	
				select.change(function() {
					var option = $(this).find("> :selected");
					var optionData = option.data("optionData");
					subfields.empty();
					if (optionData.fields) {
						for (var i=0; i < optionData.fields.length; i++) {
							var f = optionData.fields[i];
							subfields.append(self.buildField(f));
						}
					}
				});
	
				select.change();
				div.append(select);
			} else if (field.fieldType == "text") {
				var input = $("<input>", {"type": "text", "name": field.name, "class": "form-control"});
				div.append(input);
			} else if (field.fieldType == "number" || field.fieldType == "integer") {
				var input = $("<input>", {"type": "number", "name": field.name, "class": "form-control"});
				div.append(input);
			} else if (field.fieldType == "textarea") {
				var id = "textarea-" + Math.floor(Math.random() * 100000);
				var area = $("<textarea>", {"name": field.name, "id": id});
				div.append(area);
			} else if (field.fieldType == "expression") {
				var expression = $('<span>', {"name": field.name, "class": "expression"}); 
				expression.expressionbuilder({
					fields: self.fields,
					constants: self.expressionOptions.constants,
					functions: self.expressionOptions.functions,
					operators:  self.expressionOptions.operators,
					onCompleted: self.expressionOptions.onCompleted,
					onEditing: self.expressionOptions.onEditing,
					onError: self.expressionOptions.onError,
					language: self.expressionOptions.language,
					operandHolder: self.expressionOptions.operandHolder,
					operatorHolder: self.expressionOptions.operatorHolder,
					nestedExpression: self.expressionOptions.nestedExpression
				});
				div.append(expression);
			}
			if (field.hint) {
				div.append($("<p>", {"class": "hint", "text": field.hint}));
			}
	
			div.append(subfields);
			return div;
	    },
	                        
	
	    collectData: function(fields) {
			var self = this;
			fields = fields || this.element.find(".action");
			var out = [];
			fields.each(function() {
				var input = $(this).find("> :input, > .expression, > .jstEditor > :input");
				var val = input.hasClass('expression') ? input.expressionbuilder('val') : input.val();
				var subfields = $(this).find("> .subfields > .field");
				var action = {name: input.attr("name"), value: val};
				if (subfields.length > 0) {
					action.fields = self.collectData(subfields);
				}
				out.push(action);
			});
			return out;
	    },
	
	    findField: function(fieldName) {
			for (var i=0; i < this.actions.length; i++) {
				var field = this.actions[i];
				if (field.name == fieldName) {
					return field;
				}
			}
	    }
	};

})(jQuery);

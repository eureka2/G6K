/*
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
			this.addButton = this.options.addButton || null;
			this.data = this.options.data || [];
			this.element.html(this.buildActions(this.data));
		},

		buildActions: function(data) {
			var self = this;
			var container = $("<div>", {"class": "actions"});
			if (this.addButton == null) {
				var buttons = $("<div>", {"class": "action-buttons"});
				this.addButton = $("<button>", {
					"class": "add btn-primary fas fa-plus-square", 
					"text": "  " + Translator.trans("Add Action")
				});
				buttons.append(this.addButton);
				container.append(buttons);
			}
			this.addButton.on('click', function(e) {
				e.preventDefault();
				var actionDiv = self.buildAction({});
				actionDiv.find('> .end-action-mark').remove();
				container.append(actionDiv);
				container[0].scrollIntoView({ behavior: 'smooth' });
				actionDiv.find('.action-select')
					.css('background', '#f7bb07')
					.animate({
						'opacity': '0.5'
					}, 1000, function () {
						actionDiv.find('.action-select').css({
							'backgroundColor': '#fff',
							'opacity': '1'
						});
					})
					.focus();
			});
			for (var i = 0; i < data.length; i++) {
				var actionObj = data[i];
				var actionDiv = this.buildAction(actionObj);
				
				// Add values to fields
				var fields = [actionObj];
				var field;
				while(field = fields.shift()) {
					var input = actionDiv.find(":input[name='" + field.name + "'], span[name='" + field.name + "']");
					if (input.hasClass('expression')) {
						input.expressionbuilder('val', field.value);
					} else if (input.hasClass('editable-select') || input.hasClass('editable-textarea')) {
						input.attr('data-value', field.value);
						var newField = this.findField(field.value);
						if (newField && field.fields) {
							for (var j = 0; j < field.fields.length; j++) {
								actionDiv.find('> .end-action-mark').before(this.buildSubfields(field.fields[j], newField.fields[j]));
							}
						}
					} else if (input.is(':checkbox')) {
						input.prop('checked', field.value == input.attr('value'));
					} else {
						input.val(field.value).change();
					}
					if (field.fields) {
						fields = fields.concat(field.fields);
					}
				}
				actionDiv.find('> .end-action-mark').remove();
				container.append(actionDiv);
			}
			return container;
		},

		buildSubfields: function(field, fieldaction) {
			var fieldsDiv = $("<div>", {"class": "subfields"});
			var fieldDiv = this.buildField(fieldaction);
			var input = fieldDiv.find("span[name='" + field.name + "']");
			if (input.hasClass('editable-select')) {
				input.attr('data-value', field.value);
				for (var i = 0; i < fieldaction.options.length; i++) {
					if (fieldaction.options[i].name == field.value) {
						input.text(fieldaction.options[i].label);
						if (field.fields && field.fields.length > 0) {
							field = field.fields[0];
							fieldDiv.find("div.subfields").replaceWith(this.buildSubfields(field, fieldaction.options[i].fields[0]));
						}
						break;
					}
				}
			} else if (input.hasClass('editable-textarea')) {
				input.attr('data-value', field.value).text(field.value);
			}
			fieldsDiv.append(fieldDiv);
			return fieldsDiv;
		},

		buildAction: function(actionObj) {
			var actionDiv = $("<div>", {"class": "action"});
			var data = {'': ''};
			$.each(this.actions, function(i, action) {
				data[action.name] = action.label;
			});
			var self = this;
			var $editable = $("<span>", { 
				"name": "action-select", 
				"class": "editable-select action-select", 
				"tabindex": "0", 
				"data-value": ""
			});
			if (actionObj.value) {
				$editable.attr("data-value", actionObj.value);
				$editable.text(data[actionObj.value]);
				data['selected'] = actionObj.value;
			}
			$editable.editable(
				function (val, settings) {
					var newField = self.findField(val);
					settings.container.find("> .subfields:not(:first)").remove();
					var subfields = settings.container.find("> .subfields");
					subfields.empty();
					if (newField.fields) {
						for (var i=0; i < newField.fields.length; i++) {
							subfields.append(self.buildField(newField.fields[i]));
						}
					}
					actionDiv.attr("class", "action " + val);
					$(this).attr("data-value", val);
					settings.data.selected = val;
					$(this).focus();
					return settings.data[val];
				},
				{
					data: data,
					container : actionDiv,
					name: "action-select",
					type: "select",
					placeholder: Translator.trans('Choose an Action...'),
					tooltip: Translator.trans('click to change the action'),
					submit: "",
					cancel: "",
					cssclass: "action-select",
					style: "inherit"
				}
			);
			$editable.on("keydown", function(e) {
				var key = e.keyCode || e.which || e.key;
				if (key == 13) {
					$editable.trigger('click');
				} else if (key == 32) {
					e.preventDefault();
				}
			});
			var removeLink = $("<button>", {
				"class": "btn btn-light remove fas fa-times float-left", 
				"text": " ",
				"title": Translator.trans("Remove this Action")
			});
			removeLink.on('click', function(e) {
				e.preventDefault();
				actionDiv.remove();
			});

			actionDiv.append($editable);
			if (! actionObj.name) {
				actionDiv.append($("<div>", {"class": "subfields"}));
			}
			actionDiv.prepend(removeLink);
			var mark = $("<div>", { 'class': 'end-action-mark' });
			actionDiv.append(mark);
			return actionDiv;
		},

		buildField: function(field) {
			var fieldDiv = $("<div>", {"class": "field"});
			var subfields = $("<div>", {"class": "subfields"});
			var self = this;

			var label = $("<label>", {"text": field.label});
			fieldDiv.append(label);

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
										label: Translator.trans('to'), 
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
				field.fieldType = "choices";
			}
			if (field.fieldType == "select" || field.fieldType == "choices") {
				var data = {'': ''};
				var options = {};
				$.each(field.options, function(i, optionData) {
					data[optionData.name] = optionData.label;
					options[optionData.name] = optionData;
				});
				data['selected'] = '';
				var $editable = $("<span>", {
					"name": field.name,
					"class": "editable-select",
					"tabindex": "0", 
					"data-value": ""
				});
				$editable.editable(
					function (val, settings) {
						var option = $editable.find('select').find("> :selected");
						var optionData = settings.options[val];
						var subfields = settings.container.find("> .subfields");
						subfields.empty();
						if (optionData.fields) {
							for (var i=0; i < optionData.fields.length; i++) {
								var f = optionData.fields[i];
								subfields.append(self.buildField(f));
							}
						}
						$(this).attr("data-value", val);
						settings.data.selected = val;
						$(this).focus();
						$editable.trigger('change');
						return settings.data[val];
					},
					{
						data: data,
						options: options,
						container : fieldDiv,
						name: "action-select",
						type: field.fieldType,
						select: true,
						placeholder: Translator.trans("click to select ..."),
						tooltip: Translator.trans("click to change ..."),
						submit: "",
						cancel: "",
						cssclass: "action-select",
						style: "inherit"
					}
				);
				$editable.on("keydown", function(e) {
					var key = e.keyCode || e.which || e.key;
					if (key == 13) {
						$editable.trigger('click');
					} else if (key == 32) {
						e.preventDefault();
					}
				});
				$editable.change();
				fieldDiv.append($editable);
			} else if (field.fieldType == "text") {
				var input = $("<input>", {
					"type": "text",
					"name": field.name,
					"class": "form-control"
				});
				fieldDiv.append(input);
			} else if (field.fieldType == "number" || field.fieldType == "integer") {
				var input = $("<input>", {
					"type": "number", 
					"name": field.name, 
					"class": "form-control"
				});
				fieldDiv.append(input);
			} else if (field.fieldType == "textarea") {
				var $editable = $("<span>", {
					"name": field.name,
					"class": "editable-textarea",
					"tabindex": "0",
					"data-value": ""
				});
				$editable.editable(
					function (val, settings) {
						$(this).attr("data-value", val);
						return val;
					},
					{
						name: field.name,
						id: "textarea-" + Math.floor(Math.random() * 100000),
						type: "textarea",
						placeholder: Translator.trans("click to enter the message"),
						tooltip: Translator.trans("click to edit the message"),
						submit : Translator.trans('Ok'),
						cancel : Translator.trans('Cancel'),
						style: "inherit"
					}
				);
				$editable.on("keydown", function(e) {
					var key = e.keyCode || e.which || e.key;
					if (key == 13) {
						$editable.trigger('click');
					}
				});
				fieldDiv.append($editable);
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
				fieldDiv.append(expression);
			}
			if (field.hint) {
				fieldDiv.append($("<p>", {"class": "hint", "text": field.hint}));
			}

			fieldDiv.append(subfields);
			return fieldDiv;
		},

		collectData: function(fields) {
			var self = this;
			fields = fields || this.element.find(".action");
			var out = [];
			fields.each(function() {
				var input = $(this).find("> :input:not(button), > .editable-select, > .editable-textarea, > .expression, > .jstEditor > :input");
				var val;
				if (input.hasClass('expression')) {
					val = input.expressionbuilder('val');
				} else if (input.hasClass('editable-select') || input.hasClass('editable-textarea')) {
					val = input.attr('data-value');
				} else {
					val = input.val();
				}
				val = val.replace(
					/'(\d{1,2}\/\d{1,2}\/\d{4})'/g,
					function (match, m1, offs, str) {
						return m1;
					}
				);
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

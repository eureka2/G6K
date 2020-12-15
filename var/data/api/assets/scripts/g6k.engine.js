(function (global) {
	'use strict';

	function G6k(options) {
		this.isMobile = options.mobile;
		Date.setRegionalSettings(options);
		MoneyFunction.setRegionalSettings(options);
		this.locale = Translator.locale = Date.locale = options.locale;
		this.dateFormat = Date.format;
		this.inputDateFormat = Date.inputFormat;
		this.decimalPoint = MoneyFunction.decimalPoint;
		this.moneySymbol = MoneyFunction.moneySymbol;
		this.symbolPosition = MoneyFunction.symbolPosition;
		this.groupingSeparator = MoneyFunction.groupingSeparator;
		this.groupingSize = MoneyFunction.groupingSize;
		this.parser = new ExpressionParser();
		this.rulesengine = null;
		this.simu = options.simulator;
		this.currentStep = this.simu.steps[0]['id'];
		this.form = options.form;
		this.currentProfil = null;
		this.variables = {};
		this.sourceRequestsQueue = [];
		this.sourceRequestRunning = false;
		this.sourceRequestsCache = {};
		this.lastUserInputName = "";
		this.lastSubmitBtnId = null;
		this.hasFatalError = false;
		this.hasGlobalError = false;
		this.hasError = false;
		this.basePath = window.location.pathname.replace(/\/[^\/]+$/, "");
 		var view = this.form.querySelector("input[name='view']").value;
		this.internalSourceURI = options.internalSourceURI
			|| window.location.pathname
				.replace(new RegExp('\\/' + view + '(\\/\\w+)?'), "")
				.replace(/\/+$/, "") + "/Default/source";
		this.publicURI = options.publicURI;
		this.recaptchaSiteKey = options.recaptchaSiteKey;
		this.theme = options.theme;
		this.preloadCounter = 0;
	};

	G6k.prototype = {
		run: function () {
			this.createPreloader();
			this.hideAlertFields();
			this.hideNonCurrentSteps();
			this.initializeSourcedDatas();
			this.initializeResetButton();
			this.initializeExpandAllButtons();
			this.initializeWidgets();
			this.processFields();
			this.initializeExternalFunctions();
		},

		createPreloader: function() {
			var self = this;
			var preloader = document.createElement('div');
			preloader.classList.add('simulator-preloader');
			var image = document.createElement('div');
			image.classList.add('image');
			preloader.appendChild(image);
			document.querySelector('article.simulator-container').appendChild(preloader);
			setTimeout(function(){
				if (self.preloadCounter !== false) {
					alert(Translator.trans("Simulator server takes too long to respond"));
				}
			}, 5000);
		},

		removePreloader: function() {
			this.preloadCounter = false;
			var preloader = document.querySelector('.simulator-preloader');
			preloader.parentElement.removeChild(preloader);
			document.querySelector('article.simulator-container .outer-wrap').classList.remove('hidden');
		},

		incPreloadCounter: function() {
			if (this.preloadCounter !== false) {
				this.preloadCounter++;
			}
		},

		decPreloadCounter: function() {
			if (this.preloadCounter !== false) {
				this.preloadCounter--;
				if (this.preloadCounter == 0) {
					this.removePreloader();
				}
			}
		},

		hideAlertFields: function() {
			this.form.querySelectorAll('.global-alert, .group-alert, .field-alert').forEach( alert => {
				this.hideObject(alert);;
			});
		},

		hideNonCurrentSteps: function() {
			for (var step of this.simu.steps) {
				if (step.id != this.currentStep) {
					this.hideObject(this.form.querySelector('#' + step.elementId));
				}
			}
		},

		initializeSourcedDatas: function() {
			var self = this;
			self.incPreloadCounter();
			for (const name in self.simu.datas) {
				var data = self.simu.datas[name];
				if (data.type === 'choice' || data.type === 'multichoice') {
					if (data.choices && data.choices.source) {
						var completed = self.checkSourceParameters(data.choices.source.id);
						if (completed) {
							var type = self.simu.sources[data.choices.source.id]['datasource']['type'];
							var returnType = self.simu.sources[data.choices.source.id]['returnType'];
							if (type === 'uri' && (returnType === 'json' || returnType === 'csv' || (document.evaluate && (returnType === 'xml'|| returnType === 'html')))) {
								self.getUriSource(data.choices.source.id);
							} else {
								self.getInternalSource(data.choices.source.id);
							}
						}
					}
				} else if (typeof data.unparsedSource !== "undefined" && data.unparsedSource !== "") {
					var source = self.evaluate(data.unparsedSource);
					if (source !== false) {
						var completed = self.checkSourceParameters(source);
						if (completed) {
							var type = self.simu.sources[source]['datasource']['type'];
							var returnType = self.simu.sources[source]['returnType'];
							if (type === 'uri' && (returnType === 'json' || returnType === 'csv' || (document.evaluate && (returnType === 'xml'|| returnType === 'html')))) {
								self.getUriSource(source);
							} else {
								self.getInternalSource(source);
							}
						}
					}
				}
			}
			self.decPreloadCounter();
		},

		initializeResetButton: function() {
			var self = this;
			var inputs = self.form.querySelectorAll("input[type='reset'], button[type='reset']");
			inputs.forEach((input) => {
				input.addEventListener('click', function(event) {
					self.clearForm(self.form);
					var resettables = self.form.querySelectorAll("input.resettable, button[type='reset']");
					resettables.forEach((resettable) => {
						resettable.value = "";
					});
					self.variables = {};
					for (const name in self.simu.datas) {
						var data = self.simu.datas[name];
						data.modifiedByUser = false;
						self.form.querySelectorAll("span.output[data-name='" + name + "']").forEach( span => {
							span.innerText = "";
						});
						self.resetDataValue(data);
						self.removeError(name);
						self.removeWarning(name);
						if (typeof data.unparsedContent !== "undefined" && data.unparsedContent !== "") {
							var content = self.evaluate(data.unparsedContent);
							if (content !== false) {
								if (content && data.type === "multichoice" && ! Array.isArray(content)) {
									if (/\[\]$/.test(content)) {
										content = JSON.parse(content);
									} else {
										content = [content];
									}
								} else if (content && (data.type === "money" || data.type === "percent")) {
									content = self.unFormatValue(content);
									content = parseFloat(content).toFixed(data.round || 2);
								} else if (content && data.type === "number") {
									content = self.unFormatValue(content);
									if (data.round) {
										content = parseFloat(content).toFixed(data.round);
									}
								}
								data.value = content;
								self.setVariable(name, data);
							} else if (data.value !== '') {
								data.value = '';
								self.setVariable(name, data);
							}
						}
						self.reevaluateFields(name);
					}
					self.removeGlobalError();
				}, false);
			});
		},

		initializeExpandAllButtons: function() {
			var collapseExpandAllTools = this.form.querySelectorAll(".blockinfo .collapse-expand-all-tools");
			collapseExpandAllTools.forEach( collapseExpandAllTool => {
				var collapseAllButton = collapseExpandAllTool.firstElementChild;
				collapseAllButton.addEventListener("click", function(e) {
					var scope = this.closest('.blockinfo');
					var expandeds = scope.querySelectorAll(".chapter-label > h3 > button[aria-expanded='true']");
					expandeds.forEach( expanded => expanded.dispatchEvent(new MouseEvent('click')));
					e.stopPropagation();
					e.preventDefault();
				});
				var expandAllButton = collapseExpandAllTool.lastElementChild;
				expandAllButton.addEventListener("click", function(e) {
					var scope = this.closest('.blockinfo');
					var collapseds = scope.querySelectorAll(".chapter-label > h3 > button[aria-expanded='false']");
					collapseds.forEach( collapsed => collapsed.dispatchEvent(new MouseEvent('click')));
					e.stopPropagation();
					e.preventDefault();
				});
			});
		},

		setCurrentStep: function(stepId) {
			this.currentStep = stepId;
		},

		setProfile: function(profile) {
			var self = this;
			var id = profile.getAttribute('data-profile-id');
			if (self.currentProfil == null || self.currentProfil.getAttribute('data-profile-id') != id) {
				if (self.currentProfil != null) {
					self.currentProfil.classList.remove('active');
				}
				self.currentProfil = profile;
				profile.classList.add('active');
				self.simu.profiles.profiles.forEach( aprofile => {
					if (aprofile.elementId == id) {
						aprofile.datas.forEach( (data) => {
							self.setValue(data.name, data.default);
						});
					}
				});
			}
		},

		normalizeName: function(name) {
			if (/\[\]$/.test(name)) {
				name = name.substr(0, name.length - 2);
			}
			return name;
		},

		getData: function(name) {
			name = this.normalizeName(name);
			var data = this.simu.datas[name];
			return data;
		},

		getInputByName: function(name) {
			name = this.normalizeName(name);
			return this.form.querySelector("input[name='"+ name +"'], select[name='"+ name +"'], textarea[name='"+ name +"']");
		},

		getDataNameById: function(id) {
			for (const name in this.simu.datas) {
				var data = this.simu.datas[name];
				if (data.id == id) {
					return name;
				}
			}
			return null;
		},

		getStep: function() {
			for (var s = 0; s < this.simu.steps.length; s++) {
				var step = this.simu.steps[s];
				if (step.id == this.currentStep) {
					return step;
				}
			}
			return null;
		},

		getPreviousStep: function() {
			for (var s = 0; s < this.simu.steps.length; s++) {
				var step = this.simu.steps[s];
				if (step.id == this.currentStep) {
					if (s > 0) {
						return this.simu.steps[s - 1];
					}
				}
			}
			return null;
		},

		getNextStep: function() {
			for (var s = 0; s < this.simu.steps.length; s++) {
				var step = this.simu.steps[s];
				if (step.id == this.currentStep) {
					if (s < this.simu.steps.length - 1) {
						return this.simu.steps[s + 1];
					}
				}
			}
			return null;
		},

		getStepChildElement: function(parameters) {
			var element = parameters.step;
			if (parameters.panel) {
				element += '-' + parameters.panel;
				if (parameters.blockgroup) {
					var blockinfo = element + '-' + parameters.blockgroup;
					if (document.getElementById(blockinfo) !== null) {
						element = blockinfo;
					} else {
						element += '-' + parameters.blockgroup;
					}
					element = document.getElementById(element);
					if (element) {
						element = element.parentElement;
					}
				} else if (parameters.blockinfo) {
					var prefix = 'blockinfo';
					element += '-' + parameters.blockinfo;
					if (parameters.chapter) {
						prefix = 'chapter';
						element += '-' + parameters.chapter;
						if (parameters.section) {
							prefix = 'section';
							element += '-' + parameters.section;
						} else if (parameters.content) {
							prefix = 'section';
							element += '-' + parameters.content + '-content';
						} else if (parameters.annotations) {
							prefix = 'section';
							element += '-' + parameters.annotations + '-annotations';
						}
					}
					element = document.getElementById(prefix + element);
				} else if (parameters.fieldset) {
					var prefix = 'fieldset';
					element += '-' + parameters.fieldset;
					if (parameters.fieldrow) {
						prefix = 'fieldrow';
						element += '-' + parameters.fieldrow;
					} else if (parameters.field) {
						element += '-0';
					}
					if (parameters.field) {
						var selector = '#field' + element + "-" + parameters.field;
						element = document.querySelector(selector);
					} else if (parameters.prenote) {
						var selector = '#prenote' + element + "-" + parameters.prenote;
						element = document.querySelector(selector);
					} else if (parameters.postnote) {
						var selector = '#postnote' + element + "-" + parameters.postnote;
						element = document.querySelector(selector);
					} else {
						element = document.getElementById(prefix + element);
					}
				} else {
					element = document.getElementById('panel' + element);
				}
			} else if (parameters.footnote) {
				element = document.getElementById('footnote' + parameters.footnote);
			} else {
				element = document.getElementById('step' + element);
			}
			return element;
		},

		isFieldVisible: function (name) {
			var input = this.form.querySelector("input[name='"+ name +"'], select[name='"+ name +"'], textarea[name='"+ name +"']");
			if (! input) {
				return false;
			}
			if (input.classList.contains('listbox-input')) {
				input = input.parentElement;
			}
			return this.isObjectVisible(input);
		},

		isObjectVisible: function (obj) {
			if (! obj) {
				return false;
			}
			return window.getComputedStyle(obj).display !== "none" && obj.offsetWidth > 0 && obj.offsetHeight > 0;
		},

		check: function(data) {
			if (!data || !data.value || data.value.length == 0) {
				return true;
			}
			switch (data.type) {
				case 'date':
					try {
						var d = Date.createFromFormat(Date.inputFormat, data.value);
					} catch (e) {
						return false;
					}
					break;
				case 'money':
					if (! /^-{0,1}\d+(\.\d{1,2})?$/.test(data.value)) {
						return false;
					}
					break;
				case 'integer':
					if (! /^\d+$/.test(data.value)) {
						return false;
					}
					break;
				case 'number':
				case 'percent':
					if (! /^-{0,1}\d*\.{0,1}\d+$/.test(data.value)) {
						return false;
					}
					break;
				case 'text':
					if (data.pattern) {
						var re = new RegExp(data.pattern);
						return re.test(data.value);
					}
					break;
			}
			return true;
		},

		resetMin: function(name) {
			var input = this.getInputByName(name);
			var data = this.getData(name);
			if (null !== input && data.unparsedMin) {
				var min = this.evaluate(data.unparsedMin);
				if (min !== false) {
					if (data.type === 'text' || data.type === 'textarea') {
						min = parseInt(min, 10);
						if (min) {
							input.setAttribute('minlength', min);
						}
					} else if (data.type === 'date') {
						input.setAttribute('min', min);
					} else {
						min = data.type === 'integer' ? parseInt(min, 10) : parseFloat(min);
						if (min) {
							input.setAttribute('min', min);
						}
					}
				}
			}
		},

		checkMin: function(data) {
			if (!data || !data.value || data.value.length == 0) {
				return true;
			}
			if (data.type != 'number' && data.type != 'integer' && data.type != 'percent' && data.type != 'money' && data.type != 'date' && data.type != 'text' && data.type != 'textarea') {
				return true;
			}
			if (data.unparsedMin) {
				var min = this.evaluate(data.unparsedMin);
				if (min !== false) {
					if (data.type === 'text' || data.type === 'textarea') {
						min = parseInt(min, 10);
						if (min && data.value.length < min) {
							return false;
						}
					} else if (data.type === 'date') {
						min = Date.createFromFormat(Date.inputFormat, min);
						var val = Date.createFromFormat(Date.inputFormat, data.value);
						if (val < min ) {
							return false;
						}
					} else {
						min = data.type === 'integer' ? parseInt(min, 10) : parseFloat(min);
						var val  = data.type === 'integer' ? parseInt(data.value, 10) : parseFloat(data.value);
						if (min && val < min ) {
							return false;
						}
					}
				}
			}
			return true;
		},

		resetMax: function(name) {
			var input = this.getInputByName(name);
			var data = this.getData(name);
			if (null !== input && data.unparsedMax) {
				var max = this.evaluate(data.unparsedMax);
				if (max !== false) {
					if (data.type === 'text' || data.type === 'textarea') {
						max = parseInt(max, 10);
						if (max) {
							input.setAttribute('maxlength', max);
						}
					} else if (data.type === 'date') {
						input.setAttribute('max', max);
					} else {
						max = data.type === 'integer' ? parseInt(max, 10) : parseFloat(max);
						if (max) {
							input.setAttribute('max', max);
						}
					}
				}
			}
		},

		checkMax: function(data) {
			if (!data || !data.value || data.value.length == 0) {
				return true;
			}
			if (data.type != 'number' && data.type != 'integer' && data.type != 'percent' && data.type != 'money' && data.type != 'date' && data.type != 'text' && data.type != 'textarea') {
				return true;
			}
			if (data.unparsedMax) {
				var max = this.evaluate(data.unparsedMax);
				if (max !== false) {
					if (data.type === 'text' || data.type === 'textarea') {
						max = parseInt(max, 10);
						if (max && data.value.length > max) {
							return false;
						}
					} else if (data.type === 'date') {
						max = Date.createFromFormat(Date.inputFormat, max);
						var val = Date.createFromFormat(Date.inputFormat, data.value);
						if (val > max ) {
							return false;
						}
					} else {
						max = data.type === 'integer' ? parseInt(max, 10) : parseFloat(max);
						var val  = data.type === 'integer' ? parseInt(data.value, 10) : parseFloat(data.value);
						if (max && val > max) {
							return false;
						}
					}
				}
			}
			return true;
		},

		validate: function(name) {
			var ok = true;
			name = this.normalizeName(name);
			var data = this.getData(name);
			if (data.inputField) {
				var field = this.findFieldProperties(data.inputField);
				if (field.usage === 'input') {
					this.removeError(name);
					this.removeWarning(name);
					if (!this.check(data)) {
						ok = false;
						switch (data.type) {
							case 'date':
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans(Date.format) }, 'messages'));
								break;
							case 'number': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
								break;
							case 'integer': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
								break;
							case 'money': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("amount") }, 'messages'));
								break;
							case 'percent':
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("percentage") }, 'messages'));
								break;
							default:
								this.setError(name, Translator.trans("This value is not in the expected format"));
						}
					} else if (field.required && (!data.value || data.value.length == 0)) {
						this.setError(name, Translator.trans("The '%field%' field is required",  { "field": field.label }, 'messages'));
					} else if (field.visibleRequired && this.isFieldVisible(name) && (!data.value || data.value.length == 0)) {
						this.setError(name, Translator.trans("The '%field%' field is required",  { "field": field.label }, 'messages'));
					} else if (!this.checkMin(data)) {
						var min = this.evaluate(data.unparsedMin);
						if (data.type === 'text' || data.type === 'textarea') {
							this.setError(name, Translator.trans("The length of the field '%field%' cannot be less than %min%",  { "field": field.label, "min": min }, 'messages'));
						} else {
							this.setError(name, Translator.trans("The value of the field '%field%' cannot be less than %min%",  { "field": field.label, "min": min }, 'messages'));
						}
					} else if (!this.checkMax(data)) {
						var max = this.evaluate(data.unparsedMax);
						if (data.type === 'text' || data.type === 'textarea') {
							this.setError(name, Translator.trans("The length of the field '%field%' cannot be greater than %max%",  { "field": field.label, "max": max }, 'messages'));
						} else {
							this.setError(name, Translator.trans("The value of the field '%field%' cannot be greater than %max%",  { "field": field.label, "max": max }, 'messages'));
						}
					}
				}
			}
			return ok;
		},

		setGlobalWarning: function(warning) {
			if (!document.getElementById('global-alert').classList.contains('has-error')) {
				var globalError = document.getElementById('global-alert');
				if (globalError) {
					globalError.classList.replace('hidden', 'has-warning');
					globalError.innerHTML = warning;
					this.showObject(globalError);
					globalError.removeAttribute('aria-hidden');
				}
			}
		},

		removeGlobalWarning: function() {
			if (!document.getElementById('global-alert').classList.contains('has-error')) {
				var globalError = document.getElementById('global-alert');
				if (globalError) {
					globalError.classList.replace('has-warning', 'hidden');
					globalError.innerText = "";
					globalError.setAttribute('aria-hidden', true);
					this.hideObject(globalError);
				}
			}
		},

		setGroupWarning: function(name, warning) {
			var errorContainer = document.getElementById(name + "-alert");
			if (errorContainer !== null && ! errorContainer.classList.contains('has-error')) {
				errorContainer.classList.replace('hidden', 'has-warning');
				errorContainer.innerHTML = warning;
				this.showObject(errorContainer);
				errorContainer.removeAttribute('aria-hidden');
			}
		},

		removeGroupWarning: function(name) {
			var errorContainer = document.getElementById(name + "-alert");
			if (errorContainer !== null && ! errorContainer.classList.contains('has-error')) {
				errorContainer.classList.replace('has-warning', 'hidden');
				errorContainer.innerText = "";
				errorContainer.setAttribute('aria-hidden', true);
				this.hideObject(errorContainer);
			}
		},

		setWarning: function(name, warning) {
			var self = this;
			var field = self.getInputByName(name);
			if (null !== field && field.getAttribute('type') !== 'hidden' && field.hasAttribute('id')) {
				var fieldContainer = field.closest(".field-container");
				var visible = this.isObjectVisible(fieldContainer);
				var inputs = self.form.querySelectorAll("input[name='" + name + "'], input[type='checkbox'], select[name='" + name + "']");
				for (var input of inputs) {
					if (input.type === 'checkbox') {
						var n = self.normalizeName(input.getAttribute('name'));
						if (n != name) continue;
					}
					if (visible && !input.classList.contains('has-error')) {
						input.classList.add('has-warning');
						input.closest('.field-group').classList.replace('hidden', 'has-warning');
						input.focus();
					}
				}
				if (this.getData(name).datagroup) {
					this.setGroupWarning(this.getData(name).datagroup, warning);
				} else if (visible) {
					var fieldError = fieldContainer.querySelectorAll("div.field-alert");
					fieldError = fieldError.item(fieldError.length - 1);
					fieldError.classList.replace('hidden', 'has-warning');
					fieldError.innerHTML = warning;
					this.showObject(fieldContainer);
					fieldContainer.removeAttribute('aria-hidden');
					this.showObject(fieldContainer.parentElement);
					fieldContainer.parentElement.removeAttribute('aria-hidden');
					this.hasWarning = true;
				}
			}
		},

		removeWarning: function(name) {
			var self = this;
			var field = self.getInputByName(name);
			if (null !== field && field.getAttribute('type') !== 'hidden' && field.hasAttribute('id')) {
				if (this.getData(name).datagroup) {
					this.removeGroupWarning(this.getData(name).datagroup);
				} else {
					var fieldContainer = field.closest(".field-container");
					var fieldError = fieldContainer.querySelectorAll("div.field-alert");
					fieldError = fieldError.item(fieldError.length - 1);
					fieldError.classList.replace('has-warning', 'hidden');
					fieldError.innerText = "";
				}
				var inputs = self.form.querySelectorAll("input[name='" + name + "'], input[type='checkbox'], select[name='" + name + "']");
				for (var input of inputs) {
					if (input.type === 'checkbox') {
						var n = self.normalizeName(input.getAttribute('name'));
						if (n != name) return true;
					}
					input.classList.remove('has-warning');
					input.closest('.field-group').classList.remove('has-warning');
				}
			}
		},

		setFatalError: function(error) {
			this.hasFatalError = true;
			this.hasGlobalError = true;
			this.hasError = true;
			var globalError = document.getElementById('global-alert');
			globalError.classList.add("fatal-error");
			this.form.querySelectorAll("input, select, textarea").forEach( (input) => input.setAttribute( "disabled", true ));
			var errorhtml = "";
			if (Array.isArray(error)) {
				errorhtml = '<p>' + error.join('</p><p>') + '</p>';
			} else {
				errorhtml = '<p>' + error + '</p>';
			}
			globalError.classList.replace('hidden', 'has-error');
			globalError.innerHTML = errorhtml;
			this.showObject(globalError);
			globalError.removeAttribute('aria-hidden');
		},

		setGlobalError: function(error) {
			this.hasGlobalError = true;
			this.hasError = true;
			var errorhtml = "";
			if (Array.isArray(error)) {
				errorhtml = '<p>' + error.join('</p><p>') + '</p>';
			} else {
				errorhtml = '<p>' + error + '</p>';
			}
			var globalError = document.getElementById('global-alert');
			globalError.classList.replace('hidden', 'has-error');
			globalError.innerHTML = errorhtml;
			this.showObject(globalError);
			globalError.removeAttribute('aria-hidden');
		},

		removeGlobalError: function() {
			this.form.querySelectorAll("input, select, textarea").forEach( (input) => input.removeAttribute( "disabled"));
			var globalError = document.getElementById('global-alert');
			globalError.classList.replace('has-error', 'hidden')
			globalError.innerText = "";
			globalError.setAttribute('aria-hidden', true);
			this.hideObject(globalError);
			this.hasGlobalError = false;
		},

		setGroupError: function(name, error) {
			this.hasError = true;
			var errorContainer = document.getElementById(name + "-alert");
			if (errorContainer !== null) {
				var errorhtml = "";
				if (Array.isArray(error)) {
					errorhtml = '<p>' + error.join('</p><p>') + '</p>';
				} else {
					errorhtml = '<p>' + error + '</p>';
				}
				errorContainer.classList.replace('hidden', 'has-error');
				errorContainer.innerHTML = errorhtml;
				this.showObject(errorContainer);
				errorContainer.removeAttribute('aria-hidden');
			}
		},

		removeGroupError: function(name) {
			var errorContainer = document.getElementById(name + "-alert");
			if (errorContainer !== null) {
				errorContainer.classList.replace('has-error', 'hidden')
				errorContainer.innerText = "";
				errorContainer.setAttribute('aria-hidden', true);
				this.hideObject(errorContainer);
			}
		},

		setError: function(name, error) {
			var self = this;
			var field = self.getInputByName(name);
			if (null !== field && field.getAttribute('type') !== 'hidden' && field.hasAttribute('id')) {
				var fieldContainer = field.closest(".field-container");
				var visible = this.isObjectVisible(fieldContainer);
				var inputs = self.form.querySelectorAll("input[name='" + name + "'], input[type='checkbox'], select[name='" + name + "']");
				for (var input of inputs) {
					if (input.type === 'checkbox') {
						var n = self.normalizeName(input.getAttribute('name'));
						if (n != name) continue;
					}
					if (visible) {
						input.classList.add('has-error');
						if (self.getData(name).datagroup) {
							input.setAttribute('aria-describedby', self.getData(name).datagroup + '-error');
						} else {
							input.setAttribute('aria-describedby', field.id + '-alert');
						}
						input.closest('.field-group').classList.replace('hidden', 'has-error');
						input.setAttribute('aria-invalid', true);
						input.focus();
					}
				}
				if (self.getData(name).datagroup) {
					self.setGroupError(self.getData(name).datagroup, error);
				} else if (visible) {
					var errorhtml = "";
					if (Array.isArray(error)) {
						errorhtml = '<p>' + error.join('</p><p>') + '</p>';
					} else {
						errorhtml = '<p>' + error + '</p>';
					}
					var fieldError = fieldContainer.querySelectorAll("div.field-alert");
					fieldError = fieldError.item(fieldError.length - 1);
					fieldError.classList.replace('hidden', 'has-error');
					fieldError.innerHTML = errorhtml;
					this.showObject(fieldContainer);
					fieldContainer.removeAttribute('aria-hidden');
					self.showObject(fieldContainer.parentElement);
					fieldContainer.parentElement.removeAttribute('aria-hidden');
					self.hasError = true;
				}
			}
		},

		removeError: function(name) {
			var self = this;
			var field = self.getInputByName(name);
			if (null !== field && field.getAttribute('type') !== 'hidden' && field.hasAttribute('id')) {
				if (self.getData(name).datagroup) {
					self.removeGroupError(self.getData(name).datagroup);
				} else {
					var fieldContainer = field.closest(".field-container");
					var fieldError = fieldContainer.querySelectorAll("div.field-alert");
					fieldError = fieldError.item(fieldError.length - 1);
					fieldError.classList.replace('has-error', 'hidden');
					fieldError.innerText = "";
				}
				var inputs = self.form.querySelectorAll("input[name='" + name + "'], input[type='checkbox'], select[name='" + name + "']");
				for (var input of inputs) {
					if (input.type === 'checkbox') {
						var n = self.normalizeName(input.getAttribute('name'));
						if (n != name) continue;
					}
					input.classList.remove('has-error');
					input.removeAttribute('aria-describedby');
					input.closest('.field-group').classList.remove('has-error');
					if (input.hasAttribute('type') && input.type === 'number') {
						input.removeAttribute('aria-invalid');
					} else {
						input.setAttribute('aria-invalid', false);
					}
				}
			}
		},

		setFormValue: function(name, data) {
			var self = this;
			if (data.type === "multichoice") {
				self.form.querySelectorAll("input[type='checkbox']").forEach( (input) => {
					var n = self.normalizeName(input.getAttribute('name'));
					if (n == name) {
						if (data.value.includes(input.value)) {
							if (! input.checked) input.setAttribute('checked', true);
						} else {
							if (input.checked) input.removeAttribute('checked');
						}
					}
				});
				return;
			}
			var inputsSelector = "span.output[data-name=" + name + "]";
			if (name !== self.lastUserInputName || data.type === "integer" || data.type === "number" || data.type === "date") {
				inputsSelector += ", input[name=" + name + "], select[name=" + name + "], textarea[name=" + name + "]";
			}
			self.form.querySelectorAll(inputsSelector).forEach( (input) => {
				var tag = input.tagName.toLowerCase();
				if (tag === 'span') {
					input.innerText = self.formatValue(data);
				} else if (tag === 'select') {
					if (input.value != data.value) input.value = data.value;
				} else if (input.type === 'radio') {
					var fieldset = input.closest('fieldset');
					var radio = fieldset.querySelector("input[value='" + data.value + "']");
					if (! (radio && radio.checked)) {
						fieldset.querySelectorAll('input').forEach (radio => {
							radio.checked = false;
							radio.closest('label').classList.remove('checked');
						});
						fieldset.querySelectorAll('input').forEach (radio => {
							if (radio.value == data.value) {
								radio.checked = true;
								radio.closest('label').classList.add('checked');
							}
						});
					}
				} else if (input.type === 'checkbox') {
					if (input.value != data.value) input.value = data.value;
				} else if (input.type === 'date') {
					var value = Date.createFromFormat(Date.inputFormat, data.value).format('Y-m-d')
					if (input.value != value) input.value = value;
				} else if (input.classList.contains('listbox-input')) {
					if (input.value != data.value) {
						input.value = data.value;
						input.listbox.update();
					}
				} else {
					if (input.value != data.value) input.value = data.value;
				}
			});
		},

		resetDataValue: function (data) {
			if (data.type === "multichoice") {
				data.value = [];
			} else {
				data.value = "";
			}
		},

		unsetChoiceValue: function(name, value) { // only for type = 'multichoice'
			var data = this.getData(name);
			if (value && data && data.type === "multichoice" && ! Array.isArray(value)) {
				var ovalues = data.value ? data.value : [];
				var pos = ovalues.indexOf(value);
				if (pos >= 0) {
					ovalues.splice( pos, 1 );
					data.value = ovalues;
					this.setVariable(name, data);
					this.validate(name);
					if (this.simu.memo && this.simu.memo == "1" && data.memorize && data.memorize == "1") {
						if (! cookie.exists(name) || cookie.get(name) != value) {
							cookie.create(name, value, { expires: 365, path: this.basePath });
						}
					}
					this.lastUserInputName = "";
					this.reevaluateFields(name);
				}
			}
		},

		unsetValue: function(name) {
			var self = this;
			var data = self.getData(name);
			if (data.value !== '') {
				setTimeout(function() { 
					self.setValue(name, '');
				}, 0);
			}
		},
		
		isPlainObject: function (obj) {
			return Object.prototype.toString.call(obj) === '[object Object]';
		},

		setValue: function(name, value) {
			var self = this;
			var data = self.getData(name);
			if ((Array.isArray(value) || self.isPlainObject(value)) && data.type != "array" && data.type != "multichoice") {
				var avalue = value;
				value = "";
				if (Array.isArray(value)) {
					value = value[0];
				} else {
					for (const val in avalue) {
						value = val;
						break;
					}
				}
			}
			if (value && (data.type === "money" || data.type === "percent")) {
				value = self.unFormatValue(value);
				value = parseFloat(value).toFixed(data.round || 2);
			} else if (value && (data.type === "number")) {
				value = self.unFormatValue(value);
				if (data.round) {
					value = parseFloat(value).toFixed(data.round);
				}
			} else if (value && data.type === "multichoice" && ! Array.isArray(value)) {
				if (/\[\]$/.test(value)) {
					value = JSON.parse(value);
				} else {
					var ovalues = data.value ? data.value : [];
					ovalues.push(value);
					value = ovalues;
				}
			}
			data.value = value;
			self.setVariable(name, data);
			self.validate(name);
			self.setFormValue(name, data);
			if (self.simu.memo && self.simu.memo == "1" && data.memorize && data.memorize == "1") {
				if (! cookie.exists(name) || cookie.get(name) != value) {
					cookie.create(name, value, { expires: 365, path: self.basePath });
				}
			}
			self.lastUserInputName = "";
			self.reevaluateFields(name);
		},

		setVariable: function (name, data) {
			this.variables[name] = data.value;
			if (! data.value && data.deflt) {
				this.variables[name] = data.deflt;
			}
		},

		evaluate: function (expression) {
			var expr = this.parser.parse(expression);
			expr.postfix();
			expr.setVariables(this.variables);
			return expr.evaluate();
		},

		evaluateDefaults: function() {
			var self = this;
			for (var name in self.simu.datas) {
				var data = self.simu.datas[name];
				if (typeof data.unparsedDefault !== "undefined" && data.unparsedDefault !== "") {
					var value = self.evaluate(data.unparsedDefault);
					if (value !== false) {
						data.deflt = value;
					}
				}
			}
		},

		reevaluateFields: function (name) {
			var self = this;
			var data = this.getData(name);
			if (typeof data.unparsedExplanation !== "undefined" && data.unparsedExplanation !== "") {
				var explanation = this.evaluate(data.unparsedExplanation);
				this.form.querySelectorAll("span.explanation[data-name='" + name + "']").forEach( span => {
					if (explanation === false) {
						span.innerText = "";
					} else {
						span.innerHTML = explanation;
					}
				});
			}
			if (data.defaultDependencies) {
				data.defaultDependencies.forEach( dependency => {
					var field = self.getData(dependency);
					if (typeof field.unparsedDefault !== "undefined" && field.unparsedDefault !== "") {
						var value = self.evaluate(field.unparsedDefault);
						if (value !== false) {
							field.deflt = value;
						}
					}
				});
			}
			if (data.minDependencies) {
				data.minDependencies.forEach( dependency => {
					var field = self.getData(dependency);
					if (field.unparsedMin !== "undefined" && field.unparsedMin !== "") {
						self.resetMin(dependency);
					}
				});
			}
			if (data.maxDependencies) {
				data.maxDependencies.forEach( dependency => {
					var field = self.getData(dependency);
					if (field.unparsedMax !== "undefined" && field.unparsedMax !== "") {
						self.resetMax(dependency);
					}
				});
			}
			if (data.indexDependencies) {
				data.indexDependencies.forEach( dependency => {
					var field = self.getData(dependency);
					if (field.unparsedIndex !== "undefined" && field.unparsedIndex !== "") {
						self.reevaluateFields(dependency);
					}
				});
			}
			if (data.contentDependencies) {
				data.contentDependencies.forEach( dependency => {
					var field = self.getData(dependency);
					if ((! field.modifiedByUser || field.value === '') && typeof field.unparsedContent !== "undefined" && field.unparsedContent !== "") {
						var content = self.evaluate(field.unparsedContent);
						if (content !== false) {
							if (content && field.type === "multichoice" && ! Array.isArray(content)) {
								if (/\[\]$/.test(content)) {
									content = JSON.parse(content);
								} else {
									content = [content];
								}
							}
							if (field.value !== content) {
								self.setValue(dependency, content);
							}
						} else {
							self.unsetValue(dependency);
						}
					}
				});
			}
			if (data.noteDependencies) {
				data.noteDependencies.forEach( dependency => {
					var fieldId = dependency.replace(/^(prenote|postnote)/, 'field');
					var field = self.findFieldProperties(fieldId);
					if (field.prenote) {
						var prenote = self.replaceVariables(field.prenote);
						if (prenote !== false) {
							var prenoteElt = self.form.querySelector('#' + fieldId + '-container .prenote');
							var oldNote = prenoteElt.innerHTML;
							if (prenote != oldNote) {
								prenoteElt.innerHTML = prenote;
								prenoteElt.setAttribute('aria-live', 'polite');
							} else {
								prenoteElt.removeAttribute('aria-live');
							}
						}
					}
					if (field.postnote) {
						var postnote = self.replaceVariables(field.postnote);
						if (postnote !== false) {
							var postnoteElt = self.form.querySelector('#' + fieldId + '-container .postnote');
							var oldNote = postnoteElt.innerHTML;
							if (postnote != oldNote) {
								postnoteElt.innerHTML = postnote;
								postnoteElt.setAttribute('aria-live', 'polite');
							} else {
								postnoteElt.removeAttribute('aria-live');
							}
						}
					}
				});
			}
			if (data.sectionContentDependencies) {
				data.sectionContentDependencies.forEach( dependency => {
					var sectionId = dependency;
					var section = self.findSectionProperties(sectionId);
					var content = section.content;
					var newcontent = self.replaceVariablesOrBlank(content);
					var contentElt = self.form.querySelector('#' + sectionId + '-content');
					var oldContent = contentElt.innerHTML;
					if (newcontent != oldContent) {
						contentElt.innerHTML = newcontent;
						contentElt.setAttribute('aria-live', 'polite');
					} else {
						contentElt.removeAttribute('aria-live');
					}
				});
			}
			if (data.footNoteDependencies) {
				data.footNoteDependencies.forEach( dependency => {
					var footnote = self.findFootnoteProperties(dependency);
					var footnotetext = self.replaceVariables(footnote.text);
					if (footnotetext !== false) {
						var footnoteElt = self.form.querySelector("#" + dependency);
						var oldNote = footnoteElt.innerHTML;
						if (footnotetext != oldNote) {
							footnoteElt.innerHTML = footnotetext;
							footnoteElt.setAttribute('aria-live', 'polite');
						} else {
							footnoteElt.removeAttribute('aria-live');
						}
					}
				});
				var footnotes = self.form.querySelector("#footnotes" + self.currentStep);
				if (null !== footnotes) {
					if ( Array.from(footnotes.children).some(node => self.isObjectVisible(node)) ) {
						self.showObjectLater(footnotes);
					} else {
						self.hideObject(footnotes);
					}
				}
			}
			if (data.sourceDependencies) {
				data.sourceDependencies.forEach( dependency => {
					var completed = self.checkSourceParameters(dependency);
					if (completed) {
						var type = self.simu.sources[dependency]['datasource']['type'];
						var returnType = self.simu.sources[dependency]['returnType'];
						if (type === 'uri' && (returnType === 'json' || returnType === 'csv' || (document.evaluate && (returnType === 'xml'|| returnType === 'html')))) {
							self.getUriSource(dependency);
						} else {
							self.getInternalSource(dependency);
						}
					} else {
						self.resetSourceDatas(dependency);
						self.populateChoiceDependencies(dependency, []);
					}
				});
			}
			if (data.rulesConditionsDependency) {
				data.rulesConditionsDependency.forEach( rule => {
					self.rulesengine.run(
						rule - 1, 
						self.variables, 
						function(err, result) {
							if (err) {  }
						}
					);
				});
			}
			if (data.rulesActionsDependency) {
				data.rulesActionsDependency.forEach( rule => {
					self.rulesengine.run(
						rule - 1, 
						self.variables, 
						function(err, result) {
							if (err) {  }
						}
					);
				});
			}
		},

		formatParamValue: function (param) {
			var data = this.getData(param.data);
			if (typeof data.value === "undefined" || data.value === "") {
				return null;
			}
			var value = data.value;
			switch (data.type) {
				case "date":
					var format = param.format;
					if (format != "" && value != "") {
						var date = Date.createFromFormat(Date.inputFormat, value);
						value = date.format(format);
					}
					break;
				case "day":
					var format = param.format;
					if (format != "" && value != "") {
						var date = Date.createFromFormat("j/n/Y", value + "/1/2015");
						value = date.format(format);
					}
					break;
				case "month":
					var format = param.format;
					if (format != "" && value != "") {
						var date = Date.createFromFormat("j/n/Y", "1/" + value + "/2015");
						value = date.format(format);
					}
					break;
				case "year":
					var format = param.format;
					if (format != "" && value != "") {
						var date = Date.createFromFormat("j/n/Y", "1/1/" + value);
						value = date.format(format);
					}
					break;
			}
			return value;
		},

		str_getcsv: function(input, delimiter, enclosure, escape) {
			// Thanks to Locutus
			// https://github.com/kvz/locutus/blob/master/src/php/strings/str_getcsv.js
			var output = [];
			var _backwards = function (str) {
				return str.split('').reverse().join('');
			}
			var _pq = function (str) {
				return String(str).replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}=!<>\|:])/g, '\\$1');
			}
			delimiter = delimiter || ',';
			enclosure = enclosure || '"';
			escape = escape || '\\';
			var pqEnc = _pq(enclosure);
			var pqEsc = _pq(escape);
			input = input.replace(new RegExp('^\\s*' + pqEnc), '').replace(new RegExp(pqEnc + '\\s*$'), '');
			input = _backwards(input).split(new RegExp(pqEnc + '\\s*' + _pq(delimiter) + '\\s*' + pqEnc + '(?!' + pqEsc + ')', 'g')).reverse();
			for (var i = 0, inpLen = input.length; i < inpLen; i++) {
				output.push(_backwards(input[i]).replace(new RegExp(pqEsc + pqEnc, 'g'), enclosure));
			}
			return output;
		},

		xmlToObject: function (node) {
			switch (node.nodeType) {
				case 9: // document
				case 1: // element
					var object = {};
					var attributes = node.attributes;
					for (var a = 0; a < attributes.length; a++) {
						var attr = attributes.item(a);
						object[attr.name] = attr.value;
					}
					var children = node.childNodes;
					var hasChildOrAttributes = node.attributes.length > 0;
					var text = '';
					if (! hasChildOrAttributes) {
						for (var c = 0; c < children.length; c++) {
							var child = children.item(c);
							if (child.nodeType == 3) {
								text += child.nodeValue;
							} else if (child.nodeType == 1 || child.nodeType == 2) {
								hasChildOrAttributes = true;
								break;
							}
						}
					}
					var nodeObj = {};
					if (! hasChildOrAttributes) {
						nodeObj[node.nodeName] = text;
					} else {
						for (var c = 0; c < children.length; c++) {
							var child = children.item(c);
							var childObj = self.xmlToObject(child);
							if (childObj != null) {
								object[child.nodeName] = childObj;
							}
						}
						nodeObj[node.nodeName] = object;
					}
					return nodeObj;
				case 2: // attribute
					var object = {};
					object[node.name] = node.value;
					return object;
				case 3: // text
					return node.nodeValue;
				default:
					return null;
			}
		},

		checkSourceParameters: function (source) {
			var self = this;
			var completed = true;
			var params = self.simu.sources[source]['parameters'];
			params.forEach( param => {
				if (param.origin === 'data' && param.optional == '0') {
					var d = self.getData(param.data);
					if (typeof d.value === "undefined" || d.value === "") {
						completed = false;
						return false;
					} else if ((d.type === 'text' || d.type === 'textarea') && d.unparsedMin) {
						var min = self.evaluate(d.unparsedMin);
						if (min === false || d.value.length < parseInt(min, 10)) {
							completed = false;
							return false;
						}
					}
				}
			});
			return completed;
		},

		getUriSource: function (source) {
			var self = this;
			var path = '';
			var query = '';
			var headers = [];
			var datas = {};
			var ok = true;
			var params = self.simu.sources[source]['parameters'];
			params.forEach( param => {
				var value;
				if (param.origin == 'data') {
					value = self.formatParamValue(param);
				} else {
					value = param.constant;
				}
				if (value == null) { 
					if (param.optional == '0') {
						ok = false;
						return false;
					}
					value = '';
				}
				if (param.type == 'path') {
					if (value != '' || param.optional == '0') {
						path += "/" + value.replace(/\s+/g, '+');
					}
				} else if (param.type === 'data') {
					var name = param.name;
					if (datas[name]) {
						datas[name].push(value);
					} else {
						datas[name] = [value];
					}
					query += '&' + encodeURI(name) + '=' + encodeURI(value);
				} else if (param.type === 'header') {
					if (value != '') {
						headers[param.name] = value;
					}
				} else if (value != '' || param.optional == '0') {
					datas[param.name] = value;
					query += '&' + encodeURI(param.name) + '=' + encodeURI(value);
				}
			});
			if (! ok) {
				return null;
			}
			var uri = self.simu.sources[source]['datasource']['uri'];
			if (/^https:/.test(window.location.href) && /^http:/.test(uri)) {
				uri = uri.replace(/^http/, 'https');
			}
			if (path != "") {
				uri += encodeURI(path);
			}
			if (query != '') {
				uri += '?' + query.substr(1);
			}
			var method = self.simu.sources[source]['datasource']['method'];
			var returnType = self.simu.sources[source]['returnType'];
			self.enqueueSourceRequest(source, method.toUpperCase(), uri, datas, returnType, headers,
				function (source, returnType, result) {
					var returnPath = self.simu.sources[source]['returnPath'];
					returnPath = self.replaceVariables(returnPath);
					if (returnType == 'json') {
						if (returnPath != '') {
							if (/^\\$/.test(returnPath)) { // jsonpath
								result = JSONPath({path: returnPath, json: result});
							} else { // xpath
								result = defiant.json.search(result, returnPath);
								if (Array.isArray(result) && result.length == 1) {
									result = result[0];
								}
							}
						}
					} else if (returnType == 'csv') {
						var separator = self.simu.sources[source]['separator'];
						var delimiter = self.simu.sources[source]['delimiter'];
						var lines = result.split(/\n/);
						result = [];
						for (var l = 0; l < lines.length; l++) {
							var line = trim(lines[l]);
							if (line != '') {
								var csv = self.str_getcsv(line, separator, delimiter);
								var cols = csv.map( c => {
									return trim(c);
								});
								result.push(cols);
							}
						}
						if (returnPath) {
							var indices = returnPath.split("/");
							indices.forEach( index => {
								result = result[parseInt(index, 10) - 1];
							});
						}
					} else if (returnType == 'xml'|| returnType == 'html') {
						result = extractXMLResult(result, returnPath);
					}
					self.processSource(source, result, returnType);
				},
				function(source, returnType, result) {
					self.resetSourceDatas(source);
					self.populateChoiceDependencies(source, []);
				}
			);
		},

		extractXMLResult: function (result, returnPath) {
			var snapshot = document.evaluate(returnPath, result[0], null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
			result = [];
			try {
				for (var i = 0, len = snapshot.snapshotLength; i < len; i++) {
					var node = snapshot.snapshotItem(i);
					switch (node.nodeType) {
						case 9: // document
						case 1: // element
							result.push(self.xmlToObject(node));
							break;
						case 2: // attribute
							var object = {};
							object[node.name] = node.value;
							result.push(object);
							break;
						case 3: // text
							result.push(node.nodeValue);
					}
				}
			}
			catch (e) {
			}
			return result;
		},

		getInternalSource: function (source) {
			var self = this;
			var post = {};
			post['source'] = source;
			var returnPath = self.simu.sources[source]['returnPath'];
			var replacedPath = self.replaceVariables(returnPath);
			if (replacedPath != returnPath) {
				post['returnPath'] = replacedPath;
			}
			var params = self.simu.sources[source]['parameters'];
			params.forEach( param => {
				if (param.origin === 'data') {
					var d = self.getData(param.data);
					if (typeof d.value !== "undefined" && d.value !== "") {
						post[param.name] = d.value;
					}
				} else if (param.origin === 'constant') {
					post[param.name] = param.constant;
				}
			});
			var token = self.form.querySelector("input[name='_csrf_token']");
			if (token && token.value) {
				post['_csrf_token'] = token.value;
			}
			self.enqueueSourceRequest(source, 'POST', self.internalSourceURI, post, 'json',[],
				function (source, returnType, result) {
					self.processSource(source, result, 'assocArray');
				},
				function(source, returnType, result) {
					self.resetSourceDatas(source);
					self.populateChoiceDependencies(source, []);
				}
			);

		},

		enqueueSourceRequest: function(source, method, uri, data, returnType, headers, success, error) {
			var self = this;

			self.sourceRequestsQueue.push({
				source: source, 
				method: method, 
				uri: uri, 
				data: data, 
				returnType: returnType, 
				headers: headers, 
				success: success,
				error: error
			});

			function runSourceRequest() {
				if (self.sourceRequestRunning) {
					return;
				}
				if (self.sourceRequestsQueue.length > 0) {
					self.sourceRequestRunning = true;
					var q = self.sourceRequestsQueue.shift();
					var qs = "";
					for (var key in q.data) {
						if (qs != "") {
							qs += "&";
						}
						qs += key + "=" + encodeURIComponent(q.data[key]);
					}
					var key = q.uri + '?' +qs;
					if (self.sourceRequestsCache[key]) {
						if (self.sourceRequestsCache[key]['error']) {
							q.error.call(self, q.source, "json", self.sourceRequestsCache[key]);
						} else {
							q.success.call(self, q.source, q.returnType, self.sourceRequestsCache[key]);
						}
						self.sourceRequestRunning = false;
						runSourceRequest();
					} else {
						self.incPreloadCounter();
						ajax({
							method: q.method,
							url: q.uri,
							dataType: q.returnType,
							data: q.data,
							headers: q.headers
						}).then(function( response, xhr, textStatus ) {
							self.sourceRequestsCache[key] = response;
							q.success.call(self, q.source, q.returnType, response);
						}).catch(function(response, xhr, textStatus) {
							if ((xhr.status != 0 && xhr.status >= 500) || textStatus === 'timeout') {
								self.setFatalError( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
							} else {
								var result = { 'error': xhr.statusText };
								self.sourceRequestsCache[key] = result;
								q.error.call(self, q.source, "json", result);
							}
						}).always(function( response, xhr, textStatus ) {
							self.sourceRequestRunning = false;
							runSourceRequest();
							self.decPreloadCounter();
						});
					}
				}
			}

			runSourceRequest();
		},

		processSource: function(source, result, returnType) {
			var self = this;
			for (const name in self.simu.datas) {
				var data = self.simu.datas[name];
				if (typeof data.unparsedSource !== "undefined" && data.unparsedSource !== "") {
					var s = self.evaluate(data.unparsedSource);
					if (s == source) {
						if (typeof data.unparsedIndex !== "undefined" && data.unparsedIndex !== "") {
							var index;
							if (returnType == 'assocArray') {
								index = self.evaluate(data.unparsedIndex);
							} else {
								index = data.unparsedIndex.replace(/^'/, '').replace(/'$/, '');
								index = self.replaceVariables(index);
							}
							if (index !== false) {
								var value = result;
								if (returnType == 'assocArray') {
									if (value[index]) {
										self.setValue(name, value[index]);
									} else {
										self.setValue(name, value[index.toLowerCase()]);
									}
								} else if (returnType == 'json') {
									if (index != '') {
										if (/^\\$/.test(index)) { // jsonpath
											value = JSONPath({path: index, json: value});
										} else { // xpath
											value = defiant.json.search(value, index);
											if (Array.isArray(value) && value.length == 1) {
												value = value[0];
											}
										}
									}
									self.setValue(name, value);
								} else if (returnType == 'csv') {
									var indices = index.split("/");
									indices.forEach( ind => {
										value = value[parseInt(ind, 10) - 1];
									});
									self.setValue(name, value);
								} else if (returnType == 'xml'|| returnType == 'html') {
									value = extractXMLResult(value, index);
									if (Array.isArray(value) && value.length == 1) {
										value = value[0];
									}
									self.setValue(name, value);
								}
							} else {
								self.unsetValue(name);
							}
						} else {
							self.setValue(name, result);
						}
					}
				}
			}
			this.populateChoiceDependencies(source, result);
		},

		resetSourceDatas: function(source) {
			var self = this;
			for (const name in self.simu.datas) {
				var data = self.simu.datas[name];
				if (typeof data.unparsedSource !== "undefined" && data.unparsedSource !== "") {
					var s = self.evaluate(data.unparsedSource);
					if (s == source) {
						self.unsetValue(name);
					}
				}
			}
		},

		populateChoiceDependencies : function (source, result) {
			var self = this;
			var dependencies = this.simu.sources[source]['choiceDependencies'];
			if (dependencies) {
				dependencies.forEach( dependency => {
					var data = self.getData(dependency);
					var field = self.findFieldProperties(data.inputField);
					var input = document.getElementById(field.elementId);
					if (input.tagName.toLowerCase() === 'select') {
						var valueColumn = data.choices.source.valueColumn.toLowerCase();
						var labelColumn = data.choices.source.labelColumn.toLowerCase();
						var prompt = field.prompt || '-----'
						var options = ['<option value="">' + prompt + '</option>'];
						for (var r in result) {
							var row = result[r];
							var value = '';
							var label = '';
							for (var key in row) {
								if (key.toLowerCase() == valueColumn) {
									value = row[key];
								} else if (key.toLowerCase() == labelColumn) {
									label = row[key];
								}
							}
							var selected = data.value && value == data.value ? ' selected="selected"' : '';
							options.push('<option value="', value, '"' + selected + '>', label, '</option>');
						}
						input.innerHTML = options.join('');
					} else if (input.classList.contains('listbox-input')) {
						var valueColumn = data.choices.source.valueColumn.toLowerCase();
						var labelColumn = data.choices.source.labelColumn.toLowerCase();
						var prompt = field.prompt || '-----'
						var items = [];
						items.push({ value: "", text: prompt, selected: true});
						for (var r in result) {
							var row = result[r];
							var value = '';
							var label = '';
							for (var key in row) {
								if (key.toLowerCase() == valueColumn) {
									value = row[key];
								} else if (key.toLowerCase() == labelColumn) {
									label = row[key];
								}
							}
							items.push({ value: value, text: label });
						}
						input.listbox.setItems(items);
					}
					// self.setValue(dependency, "");
				});
			}
		},

		validateAll: function() {
			var self = this;
			var ok = true;
			this.hasError = false;
			for (const name in self.simu.datas) {
				ok = self.validate(name) && ok;
			}
			if (ok) self.rulesengine.runAll(self.variables,
				function(err, result) {
					if (err) {
					}
				}
			);
			return ok && !self.hasError;
		},

		processFields: function () {
			var self = this;
			self.variables['script'] = 1;
			self.variables['dynamic'] = 1;

			self.evaluateDefaults();
			self.form.querySelectorAll("input[name]:not([type='radio']):not([type='checkbox']), input[type='radio'][name]:checked, input[type='checkbox'][name]:checked, select[name], textarea[name]").forEach( input => {
				var name = self.normalizeName(input.getAttribute('name'));
				var data = self.getData(name);
				if (data) {
					var value = input.value;
					if (value && (data.type === "money" || data.type === "percent" || data.type === "number")) {
						value = self.unFormatValue(value);
					}
					if (data.type === 'multichoice') {
						if (input.getAttribute('type') === 'checkbox') {
							var ovalues = self.variables[name] || [];
							ovalues.push(value);
							value = ovalues;
						} else if (/^\[.*\]$/.test(value)) {
							value = JSON.parse(value);
						}
					}
					self.variables[name] = value;
				}
			});

			var rulesData = [];
			this.simu.rules.forEach( rule => {
				rulesData.push(
					{
						conditions: rule.conditions,
						ifActions: rule.ifdata,
						elseActions: rule.elsedata
					}
				);
			});
			var actionsAdapter = {
				notifyError: function(data) {
					var errorMessage = data.find("message"); 
					var target = data.find("target");
					switch (target) {
						case 'data':
							var fieldName = data.find("target", "fieldName");
							self.setError(fieldName, self.replaceVariables(errorMessage));
							break;
						case 'datagroup':
							var datagroupName = data.find("target", "datagroupName");
							self.setGroupError(datagroupName, self.replaceVariables(errorMessage));
							break;
						case 'dataset':
							self.setGlobalError(self.replaceVariables(errorMessage));
							break;
					}
				},
				notifyWarning: function(data) {
					var warningMessage = data.find("message"); 
					var target = data.find("target");
					switch (target) {
						case 'data':
							var fieldName = data.find("target", "fieldName");
							self.setWarning(fieldName, self.replaceVariables(warningMessage));
							break;
						case 'datagroup':
							var datagroupName = data.find("target", "datagroupName");
							self.setGroupWarning(datagroupName, self.replaceVariables(warningMessage));
							break;
						case 'dataset':
							self.setGlobalWarning(self.replaceVariables(warningMessage));
							break;
					}
				},
				setAttribute: function(data) {
					var attribute = data.find("attributeId");
					var fieldName = data.find("attributeId", "fieldName");
					var newValue = data.find("attributeId", "fieldName", "newValue");
					switch (attribute) {
						case 'content':
							var data = self.getData(fieldName);
							data.unparsedContent = newValue;
							if (data.unparsedContent !== "") {
								if ((! data.modifiedByUser || ! data.value || data.value.length == 0)) {
									var content = self.evaluate(data.unparsedContent);
									if (content !== false) {
										if (content && data.type === "multichoice" && ! Array.isArray(content)) {
											if (/\[\]$/.test(content)) {
												content = JSON.parse(content);
											} else {
												content = [content];
											}
										}
										if (data.value !== content) {
											self.setValue(fieldName, content);
										}
									}
								}
							} else {
								self.unsetValue(fieldName);
							}
							break;
						case 'default':
							self.getData(fieldName).unparsedDefault = newValue;
							break;
						case 'explanation':
							self.getData(fieldName).unparsedExplanation = newValue;
							break;
						case 'index':
							self.getData(fieldName).unparsedIndex = newValue;
							self.reevaluateFields(fieldName);
							break;
						case 'min':
							self.getData(fieldName).unparsedMin = newValue;
							self.resetMin(fieldName);
							break;
						case 'max':
							self.getData(fieldName).unparsedMax = newValue;
							self.resetMax(fieldName);
							break;
						case 'source':
							self.getData(fieldName).unparsedSource = newValue;
							break;
					}
				},
				unsetAttribute: function(data) {
					var attribute = data.find("attributeId");
					var fieldName = data.find("attributeId", "fieldName");
					switch (attribute) {
						case 'content':
							var data = self.getData(fieldName);
							data.unparsedContent = '';
							self.unsetValue(fieldName);
							break;
						case 'default':
							self.getData(fieldName).unparsedDefault = '';
							break;
						case 'explanation':
							self.getData(fieldName).unparsedExplanation = '';
							break;
						case 'index':
							self.getData(fieldName).unparsedIndex = '';
							self.reevaluateFields(fieldName);
							break;
						case 'min':
							self.getData(fieldName).unparsedMin = '';
							self.resetMin(fieldName);
							break;
						case 'max':
							self.getData(fieldName).unparsedMax = '';
							self.resetMax(fieldName);
							break;
						case 'source':
							self.getData(fieldName).unparsedSource = '';
							break;
					}
				},
				hideObject: function(data) {
					var objectId = data.find("objectId");
					var stepId = data.find("objectId", "stepId");
					switch (objectId) {
						case 'step':
							self.hideObject(document.getElementById("step" + stepId));
							break;
						case 'panel':
							var panelId = data.find("objectId", "stepId", "panelId");
							self.hideObject(document.getElementById("panel" + stepId + "-" + panelId));
							break;
						case 'fieldset':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							self.hideObject(document.getElementById("fieldset" + stepId + "-" + panelId + "-" + fieldsetId));
							break;
						case 'fieldrow':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId");
							self.hideObject(document.getElementById("fieldrow" + stepId + "-" + panelId + "-" + fieldsetId + "-" + fieldrowId));
							break;
						case 'field':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId");
							var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId");
							self.hideObject(document.getElementById("field" + stepId + "-" + panelId + "-" + fieldsetId+ "-" + fieldrowId + "-" + fieldId + "-container"));
							break;
						case 'blockinfo':
							var panelId = data.find("objectId", "stepId", "panelId");
							var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
							self.hideObject(document.getElementById("blockinfo" + stepId + "-" + panelId + "-" + blockinfoId));
							break;
						case 'chapter':
							var panelId = data.find("objectId", "stepId", "panelId");
							var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
							var chapterId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId");
							self.hideObject(document.getElementById("chapter" + stepId + "-" + panelId + "-" + blockinfoId + "-" + chapterId));
							break;
						case 'section':
							var panelId = data.find("objectId", "stepId", "panelId");
							var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
							var chapterId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId");
							var sectionId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId", "sectionId");
							self.hideObject(document.getElementById("section" + stepId + "-" + panelId + "-" + blockinfoId + "-" + chapterId + "-" + sectionId));
							break;
						case 'prenote':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId") || 0;
							var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId");
							self.hideObject(document.getElementById("prenote" + stepId + "-" + panelId + "-" + fieldsetId + "-" + fieldrowId + "-" + fieldId));
							break;
						case 'postnote':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId") || 0;
							var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId");
							self.hideObject(document.getElementById("postnote" + stepId + "-" + panelId + "-" + fieldsetId + "-" + fieldrowId + "-" + fieldId));
							break;
						case 'action':
							var actionId = data.find("objectId", "stepId", "actionId");
							var action = document.getElementById("action" + stepId + '-' + actionId);
							action.setAttribute('aria-hidden', true);
							action.setAttribute('disabled', true);
							self.hideObject(action);
							break;
						case 'footnote':
							var footnoteId = data.find("objectId", "stepId", "footnoteId");
							var footnote = document.getElementById("footnote" + stepId + "-" + footnoteId);
							if (null !== footnote) {
								self.hideObject(footnote);
								var footnotes = self.form.querySelector("#footnotes" + stepId);
								if (Array.from(footnotes.children).some( note => self.isObjectVisible(note))) {
									self.showObjectLater(footnotes);
								} else {
									self.hideObject(footnotes);
								}
							}
							break;
						case 'choice':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId");
							var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId");
							var choiceId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId", "choiceId");
							var fieldContainer = document.getElementById("field" + stepId + "-" + panelId + "-" + fieldsetId + "-" + fieldrowId + "-" + fieldId + "-container");
							var input = fieldContainer.querySelector("select");
							if (input !== null) {
								var option = input.querySelector("option[value='" + choiceId + "']");
								self.hideObject(option);
							} else {
								input = fieldContainer.querySelector("input[value='" + choiceId + "']");
								if (input.classList.contains('listbox-input')) {
									input.listbox.hideItem(choiceId);
								} else {
									var label = input.closest('label');
									label.setAttribute('aria-hidden', true);
									self.hideObject(label);
								}
							}
							break;
					}
				},
				showObject: function(data) {
					var objectId = data.find("objectId");
					var stepId = data.find("objectId", "stepId");
					switch (objectId) {
						case 'step':
							self.showObject(document.getElementById("step" + stepId));
							break;
						case 'panel':
							var panelId = data.find("objectId", "stepId", "panelId");
							self.showObjectLater(document.getElementById("panel" + stepId + "-" + panelId));
							break;
						case 'fieldset':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							self.showObject(document.getElementById("fieldset" + stepId + "-" + panelId + "-" + fieldsetId));
							break;
						case 'fieldrow':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId");
							self.showObject(document.getElementById("fieldrow" + stepId + "-" + panelId + "-" + fieldsetId + "-" + fieldrowId));
							break;
						case 'field':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId");
							var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId");
							self.showObject(document.getElementById("field" + stepId + "-" + panelId + "-" + fieldsetId+ "-" + fieldrowId + "-" + fieldId + "-container"));
							break;
						case 'blockinfo':
							var panelId = data.find("objectId", "stepId", "panelId");
							var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
							self.showObjectLater(document.getElementById("blockinfo" + stepId + "-" + panelId + "-" + blockinfoId));
							break;
						case 'chapter':
							var panelId = data.find("objectId", "stepId", "panelId");
							var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
							var chapterId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId");
							self.showObjectLater(document.getElementById("chapter" + stepId + "-" + panelId + "-" + blockinfoId + "-" + chapterId));
							break;
						case 'section':
							var panelId = data.find("objectId", "stepId", "panelId");
							var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
							var chapterId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId");
							var sectionId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId", "sectionId");
							self.showObjectLater(document.getElementById("section" + stepId + "-" + panelId + "-" + blockinfoId + "-" + chapterId + "-" + sectionId));
							break;
						case 'prenote':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId") || 0;
							var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId");
							self.showObject(document.getElementById("prenote" + stepId + "-" + panelId + "-" + fieldsetId + "-" + fieldrowId + "-" + fieldId));
							break;
						case 'postnote':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId") || 0;
							var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId");
							self.showObject(document.getElementById("postnote" + stepId + "-" + panelId + "-" + fieldsetId + "-" + fieldrowId + "-" + fieldId));
							break;
						case 'action':
							var actionId = data.find("objectId", "stepId", "actionId");
							var action = document.getElementById("action" + stepId + '-' + actionId);
							self.showObject(action);
							action.removeAttribute('aria-hidden');
							action.removeAttribute('disabled');
							break;
						case 'footnote':
							var footnoteId = data.find("objectId", "stepId", "footnoteId");
							var footnote = document.getElementById("footnote" + stepId + "-" + footnoteId);
							if (null !== footnote) {
								self.showObject(footnote);
								footnote.removeAttribute('aria-hidden');
								var footnotes = self.form.querySelector("#footnotes" + stepId);
								self.showObjectLater(footnotes);
							}
							break;
						case 'choice':
							var panelId = data.find("objectId", "stepId", "panelId");
							var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
							var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId");
							var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId");
							var choiceId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId", "fieldId", "choiceId");
							var fieldContainer = document.getElementById("field" + stepId + "-" + panelId + "-" + fieldsetId + "-" + fieldrowId + "-" + fieldId + "-container");
							var input = fieldContainer.querySelector("select");
							if (input !== null) {
								var option = input.querySelector("option[value='" + choiceId + "']");
								self.showObject(option);
							} else {
								input = fieldContainer.querySelector("input[value='" + choiceId + "']");
								if (input.classList.contains('listbox-input')) {
									input.listbox.showItem(choiceId);
								} else {
									var label = input.closest('label');
									self.showObject(label);
									label.removeAttribute('aria-hidden', true);
								}
							}
							break;
					}
				}
			};
			self.rulesengine = new RuleEngine({
				rulesData: rulesData,
				actionsAdapter: actionsAdapter
			});

			self.rulesengine.runAll(this.variables,
				function(err, result) {
					if (err) {  }
				}
			);

			self.form.querySelectorAll(".profiles ul li").forEach( li => {
				li.addEventListener("click", function(event) {
					self.setProfile(this);
				});
			}); 

			self.form.querySelectorAll(".profiles ul li").forEach( li => {
				li.addEventListener("keydown", function(event) {
					if (event.keyCode == 13 || event.keyCode == 32) {
						self.setProfile(this);
					}
				});
			}); 

			self.form.querySelectorAll("input[name], select[name], textarea[name]").forEach( input => {
				input.addEventListener("change", function(event) {
					clearTimeout(self.inputTimeoutId);
					var name = self.normalizeName(this.getAttribute('name'));
					self.lastUserInputName = name;
					var data = self.getData(name);
					data.modifiedByUser = true;
					self.removeGlobalError();
					var value = this.value;
					if (this.getAttribute('type') === 'date') {
						var date = new Date(value);
						var value = date.format(self.inputDateFormat);
					}
					if (this.getAttribute('type') === 'checkbox') {
						if (data.type === 'boolean') {
							value = this.checked ? 'true' : 'false';
							self.setValue(name, value);
						} else if (data.type === 'multichoice') {
								if (this.checked) {
									self.setValue(name, value);
								} else {
									self.unsetChoiceValue(name, value);
								}
						}
					} else {
						self.setValue(name, value);
					}
				});
			});
			self.form.querySelectorAll("input[name], select[name], textarea[name]").forEach( input => {
				input.addEventListener("focusout", function(event) {
					var name = self.normalizeName(this.getAttribute('name'));
					var data = self.getData(name);
					if (!self.check(data)) {
						switch (data.type) {
							case 'date':
								self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans(Date.format) }, 'messages'));
								break;
							case 'number': 
								self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
								break;
							case 'integer': 
								self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
								break;
							case 'money': 
								self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("amount") }, 'messages'));
								break;
							case 'percent':
								self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("percentage") }, 'messages'));
								break;
							default:
								self.setError(name, Translator.trans("This value is not in the expected format"));
						}
					} else if (!self.checkMin(data)) {
						var min = self.evaluate(data.unparsedMin);
						if (data.type === 'text' || data.type === 'textarea') {
							self.setError(name, Translator.trans("The length of this value can not be less than %min%",  { "min": min }, 'messages'));
						} else {
							self.setError(name, Translator.trans("This value can not be less than %min%",  { "min": min }, 'messages'));
						}
					} else if (!self.checkMax(data)) {
						var max = self.evaluate(data.unparsedMax);
						if (data.type === 'text' || data.type === 'textarea') {
							self.setError(name, Translator.trans("The length of this value can not be greater than %max%",  { "max": max }, 'messages'));
						} else {
							self.setError(name, Translator.trans("This value can not be greater than %max%",  { "max": max }, 'messages'));
						}
					}
				});
			});
			self.form.querySelectorAll("input[type='text'][name], input[type='date'][name], input[type='money'][name], input[type='number'][name]").forEach( input => {
				input.addEventListener("keypress", function(event) {
					if (event.keyCode == 13) {
						event.preventDefault();
						self.getData(this.getAttribute('name')).modifiedByUser = true;
						this.dispatchEvent(new Event('change'));
						self.focusNextInputField(this);
					}
				});
				input.addEventListener('input', function(event) {
					if (!this.hasAttribute('data-widget')) {
						if (!this.hasAttribute('minlength') || this.value.length >= parseInt(this.getAttribute('minlength'), 10)) {
							self.triggerChange(this, true, true);
						}
					}
				});
				input.addEventListener('propertychange', function(event) {
					if (!this.hasAttribute('data-widget')) {
						if (!this.hasAttribute('minlength') || this.value.length >= parseInt(this.getAttribute('minlength'), 10)) {
							self.triggerChange(this, true, true);
						}
					}
				});
			});
			self.form.querySelectorAll("input[type='text'][name], input[type='date'][name], input[type='money'][name]").forEach( input => {
				input.addEventListener('paste', function(event) {
					var elt = this;
					self.getData(this.getAttribute('name')).modifiedByUser = true;
					clearTimeout(self.inputTimeoutId);
					self.inputTimeoutId = setTimeout( () => {
						elt.dispatchEvent(new Event('change'));
						self.focusNextInputField(elt);
					}, 0);
				});
			});
			self.form.querySelectorAll("fieldset label.choice input[type='radio'][name]").forEach( input => {
				input.addEventListener('change', function(event) {
					var label = this.closest('label.choice');
					label.closest('fieldset').querySelectorAll('label.choice').forEach( alabel => {
						alabel.classList.remove('checked');
					});
					if (this.checked) {
						label.classList.add('checked');
					}
				});
			});
			self.form.querySelectorAll("fieldset input[type='checkbox'][name]").forEach( input => {
				input.addEventListener('change', function(event) {
					var id = this.getAttribute('id');
					var label = this.closest('fieldset').querySelector("label[for='" + id + "']");
					if (this.checked) {
						label.classList.add('checked');
					} else {
						label.classList.remove('checked');
					}
				});
			});
			self.form.querySelectorAll("fieldset label.choice input[type='radio'][name]").forEach( input => {
				input.addEventListener('focus', function(event) {
					var label = this.closest('label.choice');
					label.closest('fieldset').classList.add('focused');
					var checked = false;
					label.closest('fieldset').querySelectorAll("label.choice input[type='radio'][name]").forEach( ainput => {
						if ( ainput.checked ) {
							checked = true;
						}
					});
					if (!checked) {
						label.classList.add('checked-candidate');
					}
				});
			});
			self.form.querySelectorAll("fieldset label.choice input[type='radio'][name]").forEach( input => {
				input.addEventListener('blur', function(event) {
					var fieldset = this.closest('label.choice').closest('fieldset');
					var focused = false;
					fieldset.querySelectorAll("label.choice input[type='radio'][name]").forEach( ainput => {
						if ( document.hasFocus() && ainput === document.activeElement ) {
							focused = true;
						}
					});
					if (!focused) {
						fieldset.classList.remove('focused');
					}
					fieldset.querySelectorAll('label.choice').forEach( alabel => {
						alabel.classList.remove('checked-candidate')
					});
				});
			});
			self.form.querySelectorAll("input[type='submit'][name], button[type='submit'][name]").forEach( input => {
				input.addEventListener('click', function(event) {
					self.lastSubmitBtnId = this.id;
				});
				input.addEventListener('keypress', function(event) {
					var key = event.which || event.keyCode;
					if (key == 13) {
						self.lastSubmitBtnId = this.id;
					}
				});
			});
			self.form.addEventListener('submit', function(event) {
				var buttonId = self.lastSubmitBtnId;
				var bwhat = self.getStep().actions[buttonId].what;
				var bfor = self.getStep().actions[buttonId].for;
				var buri = self.getStep().actions[buttonId].uri;
				if (bwhat == 'submit' && bfor == 'priorStep') {
					event.preventDefault();
					self.priorStep();
					return;
				}
				if (bwhat == 'submit' && bfor == 'newSimulation') {
					self.clearForm(self.form);
					self.form.querySelectorAll("input.resettable").forEach( input => {
						input.value = "";
					});
					event.preventDefault();
					return;
				}
				if (self.hasFatalError || ! self.validateAll()) {
					self.setGlobalError(Translator.trans("To continue you must first correct your entry"));
					event.preventDefault();
					return;
				}
				if (bwhat == 'submit' && bfor == 'nextStep') {
					event.preventDefault();
					self.nextStep();
				} else if (bwhat == 'submit' && bfor == 'jumpToStep') {
					event.preventDefault();
					self.jumpToStep(parseInt(buri, 10));
				} else if (bwhat == 'submit' && bfor == 'currentStep') {
					event.preventDefault();
				} else if (bwhat == 'submit' && bfor == 'externalPage') {
					self.form.action = buri;
					self.form.target = '_blank';
				}
			});
			for (const name in this.simu.datas) {
				var data = this.simu.datas[name];
				data.value = self.variables[name];
				if (typeof data.unparsedContent !== "undefined" && data.unparsedContent !== "") {
					var content = self.evaluate(data.unparsedContent);
					if (content !== false) {
						if (content && data.type === "multichoice" && ! Array.isArray(content)) {
							if (/\[\]$/.test(content)) {
								content = JSON.parse(content);
							} else {
								content = [content];
							}
						} else if (content && (data.type === "money" || data.type === "percent")) {
							content = self.unFormatValue(content);
							content = parseFloat(content).toFixed(data.round || 2);
						} else if (content && data.type === "number") {
							content = self.unFormatValue(content);
							if (data.round) {
								content = parseFloat(content).toFixed(data.round);
							}
						}
						data.value = content;
						self.setVariable(name, data);
					} else if (data.value !== '') {
						data.value = '';
						self.setVariable(name, data);
					}

				}
			}
			var scriptInput = this.form.querySelector("input[name='script']");
			if (scriptInput !== null && scriptInput.value == 0) {
				for (var name in self.simu.datas) {
					self.reevaluateFields(name);
				}
				scriptInput.value = 1;
			} else {
				for (var name in self.simu.datas) {
					self.reevaluateFields(name);
				}
			}
			self.checkFootnotesVisibility();
		},

		activateBreadcrumbItem: function() {
			var breadcrumb = this.form.querySelector('.simulator-breadcrumb');
			var current = null;
			if (null !== breadcrumb) {
				current = breadcrumb.querySelector('li.current');
				if (null !== current) {
					current.classList.remove('current');
					current.removeAttribute('title');
					current.setAttribute('aria-hidden', 'true');
				}
				current = breadcrumb.querySelector("[data-step='" + this.currentStep + "']");
				if (null !== current) {
					current.classList.add('current');
					current.setAttribute('title', Translator.trans('Current step : %step%', { step: this.currentStep }));
					current.removeAttribute('aria-hidden');
				}
			}
		},

		nextStep: function() {
			this.hideObject(document.getElementById(this.getStep().elementId));
			this.currentStep = this.getNextStep().id;
			this.activateBreadcrumbItem();
			this.showObject(document.getElementById(this.getStep().elementId));
		},

		priorStep: function() {
			this.hideObject(document.getElementById(this.getStep().elementId));
			this.currentStep = this.getPreviousStep().id;
			this.activateBreadcrumbItem();
			this.showObject(document.getElementById(this.getStep().elementId));
		},

		jumpToStep: function(stepId) {
			this.hideObject(document.getElementById(this.getStep().elementId));
			this.currentStep = stepId;
			this.activateBreadcrumbItem();
			this.showObject(document.getElementById(this.getStep().elementId));
		},

		triggerChange: function(input, delayed, modifiedByUser) {
			var self = this;
			clearTimeout(self.inputTimeoutId);
			if (typeof modifiedByUser !== "undefined") {
				self.getData(input.getAttribute('name')).modifiedByUser = modifiedByUser;
			}
			if (delayed) {
				self.inputTimeoutId = setTimeout(function () {
					input.dispatchEvent(new Event('change'));
				}, 500);
			} else {
				input.dispatchEvent(new Event('change'));
			}
		},

		initializeWidgets: function() {
			var self = this;
			var options = { 
				locale: self.locale,
				mobile: self.isMobile,
				dateFormat: self.dateFormat,
				decimalPoint: self.decimalPoint,
				moneySymbol: self.moneySymbol,
				symbolPosition: self.symbolPosition,
				groupingSeparator: self.groupingSeparator,
				groupingSize: self.groupingSize,
				publicURI: self.publicURI,
				recaptchaSiteKey: self.recaptchaSiteKey,
				theme: self.theme
			};
			self.form.querySelectorAll('input[data-widget], select[data-widget], textarea[data-widget]').forEach((input) => {
				var widget = window[input.getAttribute('data-widget')];
				widget.call(self, input, options, function (value, text, preserveVal, delayed) {
					if (!preserveVal) {
						input.value = value;
					}
					self.triggerChange(input, delayed);
				});
			});
		},

		initializeExternalFunctions: function() {
			var self = this;
			var options = { 
				locale: self.locale,
				mobile: self.isMobile,
				dateFormat: self.dateFormat,
				decimalPoint: self.decimalPoint,
				moneySymbol: self.moneySymbol,
				symbolPosition: self.symbolPosition,
				groupingSeparator: self.groupingSeparator,
				groupingSize: self.groupingSize,
				publicURI: self.publicURI,
				recaptchaSiteKey: self.recaptchaSiteKey,
				theme: self.theme
			};
			self.form.querySelectorAll('div.actionbuttons > [data-function]').forEach( funcElt => {
				var func = funcElt.getAttribute('data-function');
				func = func.replace(/'/g, '"');
				func = JSON.parse(func);
				var funct = window[func.function];
				var that = funcElt;
				funct.call(self, that, func, options, function(ok, message) {
					if (self.hasGlobalError) {
						self.removeGlobalError();
					}
					if (message) {
						if (ok) {
							var mess = document.createElement('div');
							mess.classList.add(func.function.toLowerCase() + '-function-status', );
							mess.setAttribute('aria-live', 'assertive');
							mess.innerHTML = '<p>' + Translator.trans(message) + '</p>';
							that.parentElement.parentElement.insertBefore(mess, that.parentElement.nextSibling);
							mess.fadeOut(7000, function() {
								setTimeout(function() {
									mess.remove();
								}, 10);
							});
						} else {
							self.setGlobalError(Translator.trans(message));
						}
					}
				});
			});
		},

		findFieldProperties: function(elementId) {
			var steps = this.simu.steps;
			for (var step of this.simu.steps) {
				for (var panel of step.panels) {
					for (var block of panel.blocks) {
						if (block.type === 'fieldset') {
							for (var fieldrow of block.fieldrows) {
								for (var field of fieldrow.fields) {
									if (field.elementId == elementId) {
										return field;
									}
								}
							}
						}
					}
				}
			}
			return null;
		},

		findSectionProperties: function(elementId) {
			var steps = this.simu.steps;
			for (var step of this.simu.steps) {
				for (var panel of step.panels) {
					for (var block of panel.blocks) {
						if (block.type === 'blockinfo') {
							for (var chapter of block.chapters) {
								for (var section of chapter.sections) {
									if (section.elementId == elementId) {
										return section;
									}
								}
							}
						}
					}
				}
			}
			return null;
		},

		findFootnoteProperties: function(footnoteId) {
			var steps = this.simu.steps;
			for (var step of this.simu.steps) {
				if (! Array.isArray(step.footnotes) && typeof step.footnotes === 'object') {
					var footnotes = step.footnotes.footnotes;
					for (var footnote in footnotes) {
						if (footnote == footnoteId) {
							return footnotes[footnote];
						}
					}
				}
			}
			return null;
		},

		checkFootnotesVisibility: function() {
			var self = this;
			self.form.querySelectorAll(".footnotes").forEach( footnotes => {
				if ( Array.from(footnotes.children).some(node => self.isObjectVisible(node)) ) {
					self.showObjectLater(footnotes);
				} else {
					self.hideObject(footnotes);
				}
			});
		},

		showObject: function(obj) {
			if (obj) {
				obj.classList.remove('hidden');
				obj.removeAttribute('aria-hidden');
			}
			return obj;
		},

		hideObject: function(obj) {
			if (obj) {
				obj.setAttribute('aria-hidden', true);
				obj.classList.add('hidden');
			}
			return obj;
		},

		showObjectLater: function(obj, delay) {
			delay = delay || 120;
			var self = this;
			setTimeout(function(){
				self.showObject(obj);
			}, delay);
			return obj;
		},

		choiceLabel: function(data) {
			var label = '';
			if (data.choices) {
				for (var c in data.choices) {
					var choice = data.choices[c];
					if (choice[data.value]) {
						label = choice[data.value];
						break;
					}
				}
			}
			return label;
		},

		formatValue: function(data) {
			var value = data.value;
			if (value && Number.isNumeric(value) && (data.type === "money" || data.type === "percent")) {
				value = new Intl.NumberFormat(this.locale, {
					minimumFractionDigits: data.round || 2,
					maximumFractionDigits: data.round || 2
				}).format(parseFloat(value));
			}
			if (value && data.type === "number") {
				value = new Intl.NumberFormat(this.locale, {
						minimumFractionDigits: data.round || 2,
						maximumFractionDigits: data.round || 2
				}).format(value);
			}
			if (value && data.type === "text") {
				if (/^https?\:\/\//.test(value)) {
					if (/(jpg|jpeg|gif|png|svg)$/i.test(value)) {
						value = '<img src="'+value+'" alt="'+value+'">';
					} else {
						value = '<a href="'+value+'">'+value+'</a>';
					}
				} else if (/^data\:image\//.test(value)) {
					value = '<img src="'+value+'" alt="*">';
				}
			}
			if (value && data.type === "choice") {
				var name = this.getDataNameById(data.id);
				var input = this.getInputByName(name);
				if (input !== null) {
					var tag = input.tagName.toLowerCase();
					if (tag === 'select') {
						var options = input.querySelectorAll('option');
						for (var option of options) {
							if (option.value == value) {
								value = option.innerText.trim();
								break;
							}
						}
					} else if (input.type === 'radio') {
						var radios = input.closest('fieldset').querySelectorAll("input[type='radio']");
						for (var radio of radios) {
							if (radio.value == value) {
								value = radio.parentElement.innerText.trim();
								break;
							}
						}
					}
				}
			}
			if (Array.isArray(value)) {
				value = value.join(", ");
			}
			return value;
		},

		unFormatValue: function(value) {
			if (typeof value === 'string') {
				var ts = new RegExp(this.groupingSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
				var dp = new RegExp(this.decimalPoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
				value = value.replace(ts, '').replace(dp, '.');
			}
			return value;
		},

		replaceVariablesBase: function(target) {
			var self = this;
			var result = target.replace(
				/\<data\s+[^\s]*\s*value="(\d+)"[^\>]*\>[^\<]+\<\/data\>(L?)/g,
				function (match, m1, m2, offs, str) {
					var name = self.getDataNameById(m1);
					return (name) ? '#(' + name + ')' + m2 : match;
				}
			);
			result = result.replace(
				/#\(([^\)]+)\)(L?)/g,
				function (match, m1, m2, offs, str) {
					var data = self.getData(m1);
					if (data && data.value) {
						if (m2 === 'L') {
							var label = self.choiceLabel(data);
							if (label !== '') {
								return label;
							}
						}
						return self.formatValue(data);
					} else {
						return match;
					}
				}
			);
			return result;
		},

		replaceVariables: function(target) {
			var result = this.replaceVariablesBase(target);
			return /#\(([^\)]+)\)/.test(result) ? false : result;
		},

		replaceVariablesOrBlank: function(target) {
			var self = this;
			var result = self.replaceVariablesBase(target);
			result = result.replace(
				/#\(([^\)]+)\)(L?)/g,
				function (match, m1, m2, offs, str) {
					var data = self.getData(m1);
					switch (data.type) {
						case 'integer':
						case 'number':
							return '0';
						case 'percent':
						case 'money':
							var v = data.value;
							data.value = '0';
							var formatted =  self.formatValue(data);
							data.value = v;
							return formatted;
						default:
							return '';
					}
				}
			);
			result = result.replace(
				/\<data\s+[^\s]*\s*value="(\d+)"[^\>]*\>[^\<]+\<\/data\>(L?)/g,
				function (match, m1, m2, offs, str) {
					var data = self.getData(m1);
					switch (data.type) {
						case 'integer':
						case 'number':
							return '0';
						case 'percent':
						case 'money':
							var v = data.value;
							data.value = '0';
							var formatted =  self.formatValue(data);
							data.value = v;
							return formatted;
						default:
							return '';
					}
				}
			);
			return result;
		},

		focusNextInputField: function (input) {
			var form = input.closest('form');
			var inputs = form.querySelectorAll('input, button, select, textarea, a[href]');
			inputs = Array.prototype.filter.call(inputs, (item) => {
				return item.tabIndex >= 0;
			});
			var index = Array.prototype.indexOf.call(inputs, input);
			var next = inputs[index + 1] || inputs[0];
			next.focus();
		},

		clearForm: function(input) {
			var self = this;
			var tag = input.tagName.toLowerCase();
			if (tag == 'form') {
				var inputs = input.querySelectorAll("input[name], select[name], textarea[name]");
				inputs.forEach((input) => {
					self.clearForm(input);
				});
				return;
			}
			var type = input.type;
			if (type === 'text' || type === 'password'  || type === 'number'|| tag === 'textarea') {
				input.value = "";
				if (input.classList.contains('listbox-input')) {
					input.listbox.update();
				}
			} else if (type === 'checkbox' || type === 'radio') {
				input.removeAttribute('checked');
			} else if (type === 'select-one' || tag === 'select') {
				var options = input.querySelectorAll("option");
				options.forEach((option) => {
					option.removeAttribute('selected');
					input.value = "";
				});
			}
		}

	};

	global.G6k = G6k;

}(this));

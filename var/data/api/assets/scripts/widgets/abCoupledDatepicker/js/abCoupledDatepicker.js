(function (global) {
	"use strict";

	function abCoupledDatepicker (input, options, onComplete) {
		var g6k;
		if (typeof input === "object" && input && input["jquery"]) {
			g6k = input.data('g6k');
			input = input[0];
		} else {
			g6k = this;
		}
		var input2 = coupledDatepicker(input);
		if (input2 !== false) {
			input.addEventListener('ab.datepicker.ready', function readyListener (e, id) {
				var orig = document.getElementById(id);
				if (orig && orig === input2) {
					input2.datepicker.previous(input);
					input.removeEventListener('ab.datepicker.ready', readyListener);
				}
			});
			var dateOptions = {
				weekDayFormat: 'narrow',
				inputFormat: options.dateFormat,
				next: input2,
				theme: 'default',
				onUpdate: function (value) {
					onComplete(value, value);
				}
			};
			if (input.hasAttribute('data-min')) {
				var min = g6k.evaluate(input.getAttribute('data-min'));
				if (min !== false) {
					dateOptions.min = min;
				}
			}
			if (input.hasAttribute('data-max')) {
				var max = g6k.evaluate(input.getAttribute('data-max'));
				if (max !== false) {
					dateOptions.max = max;
				}
			}
			var scripts = document.querySelectorAll('script[src]');
			var localeScript = null;
			var re = new RegExp("/abDatepicker/js/locales/" + options.locale + ".min.js");
			for (var script of scripts) {
				if (re.test(script.src)) {
					localeScript = script;
					break;
				}
			}
			if (null === localeScript) {
				delete Date['dp_locales'];
				localeScript = document.createElement("script");
				localeScript.type = "text/javascript";
				localeScript.src = options.publicURI + "/assets/base/widgets/abDatepicker/js/locales/" + options.locale + ".min.js";
				scripts[0].insertAdjacentElement('beforebegin', localeScript);
				localeScript.addEventListener('load', () => {
					localeScript.dataset.loaded = true;
					instantiatePicker(g6k, input, dateOptions);
				});
			} else {
				var localeScriptTimer = setInterval(function() {
					if (localeScript.dataset.loaded) {
						clearInterval(localeScriptTimer);
						instantiatePicker(g6k, input, dateOptions);
					}
				}, 40);
			}
		}
	}

	function instantiatePicker(g6k, input, dateOptions) {
		input.setAttribute('type', 'text');
		var picker = new Datepicker(input, dateOptions);
		picker.outputFormat(Date.dp_locales.short_format);
		for (var eventName of ['input', 'propertychange']) {
			input.addEventListener(eventName, function(event) {
				g6k.triggerChange(input, true, true);
			});
		}
	}

	function coupledDatepicker(input) {
		var fields = input.closest('form').querySelectorAll('input.date[data-widget]');
		var index;
		for (index = 0; index < fields.length; index++) {
			if (fields[index] === input) {
				break;
			}
		}
		if ( index > -1 && ( index + 1 ) < fields.length
			&& ['abDatepicker', 'abCoupledDatepicker'].indexOf(fields[index + 1].getAttribute('data-widget')) >= 0) {
			return fields[index + 1];
		}
		return false;
	}

	global.abCoupledDatepicker = abCoupledDatepicker;
}(this));
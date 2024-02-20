(function (global) {
	"use strict";
		
	function jEditable (input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			input = input[0];
		}
		var editable;
		if (input.matches('select')) {
			var data = {};
			var selected  = '';
			var text = '';
			for (var child of input.children) {
				var value = child.hasAttribute('value') ? child.getAttribute('value') : child.textContent;
				data[value] = child.textContent;
				if (child.hasAttribute('selected')) {
					selected = value;
					text = child.textContent;
				}
			}
			data.selected = selected;
			editable = document.createElement('span'); 
			editable.setAttribute('class', 'editable-select');
			editable.setAttribute('data-value', selected);
			editable.setAttribute('tabindex', input.tabIndex);
			editable.innerHTML = text;
			input.style.display = 'none';
			input.setAttribute('aria-hidden', 'true');
			input.insertAdjacentElement('beforebegin', editable);
			input.parentElement.classList.remove('native');
			new Editable(editable,
				function (val, settings) {
					this.setAttribute("data-value", val);
					settings.data.selected = val;
					onComplete(val, settings.data[val]);
					return settings.data[val];
				},
				{
					data: data,
					name: input.getAttribute('name'),
					type: "select",
					placeholder: Translator.trans("click to enter a value"),
					tooltip: Translator.trans("click to edit this value"),
					style: "inherit",
					options: options
				}
			);
		} else {
			var type = input.getAttribute('type');
			var placeholder = Translator.trans("click to enter a value");
			if (type == 'text') {
				if (input.classList.contains('date')) {
					type = 'date';
					options.placeholder = input.getAttribute('placeholder');
				} else {
					type = 'autogrow';
				}
			} else if (type == 'date') {
				options.placeholder = input.getAttribute('placeholder');
			}
			options.title = input.getAttribute('title') || '';
			input.style.display = 'none';
			input.setAttribute('aria-hidden', 'true');
			editable = document.createElement('span'); 
			editable.setAttribute('class', 'editable-' + type);
			editable.setAttribute('data-value', input.getAttribute('value'));
			editable.setAttribute('tabindex', input.tabIndex);
			editable.textContent = input.getAttribute('value');
			input.insertAdjacentElement('beforebegin', editable);
			new Editable(editable,
				function (val, settings) {
					this.setAttribute("data-value", val);
					onComplete(val, val);
					return val;
				},
				{
					name: input.getAttribute('name'),
					id: "text-" + Math.floor(Math.random() * 100000),
					type: type,
					placeholder: placeholder,
					tooltip: Translator.trans("click to edit this value"),
					style: "inherit",
					options: options,
					onblur: 'submit',
					callback: function() {
					}
				}
			);
		}
		editable.addEventListener('keydown', function(e) {
			if (e.keyCode == 13 && e.target.tagName == 'SPAN' && /\beditable-/.test(e.target.className) ) {
				e.preventDefault();
				this.dispatchEvent(new MouseEvent('click'));
			}
		});
 	}

	global.jEditable = jEditable;
}(this));
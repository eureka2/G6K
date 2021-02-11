(function (document, window) {
	'use strict';

	function bootstrapify (options) {
		options = options || {};
		var version = options.version || '4.5.2';
		var addBootstrapStylesheet = options.addBootstrapStylesheet;
		var addBootstrapScript = options.addBootstrapScript;
		var addJQueryScript = options.addJQueryScript;
		var container = document.querySelector(options.container || 'body');
		container.classList.add('container');
		if (addBootstrapStylesheet) {
			addStylesheet(version);
		}
		if (addBootstrapScript) {
			addScript(version, addJQueryScript);
		}
	}

	function addStylesheet(version) {
		var links = document.querySelectorAll('link[rel=stylesheet][href]');
		for (var link of links) {
			if (/bootstrap/.test(link.href)) {
				return;
			}
		}
		var bootstrap = document.createElement("link");
		bootstrap.type = "text/css";
		bootstrap.rel = "stylesheet";
		bootstrap.href = "https://maxcdn.bootstrapcdn.com/bootstrap/" + version + "/css/bootstrap.min.css";
		document.querySelector("head").appendChild(bootstrap);
	}

	function addScript(version, addJQueryScript) {
		var jqueryScript = null
		var bootstrapScript = null
		var scripts = document.querySelectorAll('script[src]');
		for (var script of scripts) {
			if (/bootstrap/.test(script.src)) {
				bootstrapScript = script;
				break;
			}
		}
		if (null === bootstrapScript) {
			for (var script of scripts) {
				if (/jquery/.test(script.src)) {
					jqueryScript = script;
					break;
				}
			}
			if (null === jqueryScript && addJQueryScript) {
				var jqueryScript = document.createElement("script");
				jqueryScript.type = "text/javascript";
				jqueryScript.src = "https://code.jquery.com/jquery-3.3.1.slim.min.js";
				document.querySelector("body").appendChild(jqueryScript);
				jqueryScript.addEventListener('load', () => {
					doAddScript();
				});
			} else {
				doAddScript();
			}
		}
		
		function doAddScript() {
			var bundle = version[0] == '3' ? '' : '.bundle';
			var bootstrap = document.createElement("script");
			bootstrap.type = "text/javascript";
			bootstrap.src = "https://maxcdn.bootstrapcdn.com/bootstrap/" + version + "/js/bootstrap" + bundle + ".min.js";
			if (null == jqueryScript.nextSibling) {
				document.querySelector("body").appendChild(bootstrap);
			} else {
				jqueryScript.parentElement.insertBefore(bootstrap, jqueryScript.nextSibling);
			}
		}
	}

	function styleFields(container) {
		var fields = container.querySelectorAll('input');
		fields.forEach( field => {
			field.classList.add('form-control');
			if (field.type == 'date') {
				field.classList.add('col-sm-2');
			}
		});
		fields = container.querySelectorAll('select');
		fields.forEach( field => {
			field.classList.add('form-control');
			field.classList.add('custom-select');
		});
		fields = container.querySelectorAll('textarea');
		fields.forEach( field => {
			field.classList.add('form-control');
		});
		var labels = container.querySelectorAll('label');
		labels.forEach( label => {
			label.classList.add('col-form-label');
		});
		var fieldcontainers = container.querySelectorAll('.field-container');
		fieldcontainers.forEach( fieldcontainer => {
			fieldcontainer.classList.add('form-group');
			fieldcontainer.classList.add('row');
		});
		var fieldgroups = container.querySelectorAll('.field-group');
		fieldgroups.forEach( fieldgroup => {
			fieldgroup.classList.add('input-group');
		});
	}

	function styleButtons(container) {
		var buttons = container.querySelectorAll('button');
		buttons.forEach( button => {
			button.classList.add('btn');
			if (button.classList.contains('btn-default')) {
				button.classList.add('btn-secondary');
			}
		});
	}

	window.bootstrapify = bootstrapify;

}(document, window));

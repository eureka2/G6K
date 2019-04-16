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

	function Admin() {
	};

	Admin.lang = 'en';
	Admin.locale = 'en-US';
	Admin.editorCSS = '';

	Admin.wysihtml5Custom = {
		insertData: function(context) {
			var locale = context.locale;
			var options = context.options;
			var labels = [];
			$.each(Simulators.dataset, function(name, d) {
				labels.push({id: d.id, label: d.label});
			});
			labels.sort(function (a, b) {
				return a.label.localeCompare(b.label);
			});
			var datas = [];
			$.each(labels, function(i, d) {
				datas.push("\n\t\t\t\t" + '<li><a class="dropdown-item" data-wysihtml-command="insertDataReference" data-wysihtml-command-value="' + d.id + '|' + d.label + '">' + d.label + '</a></li>');
			});
			return `
		<li class="custom dropdown" tabindex="0">
			<button title="Insert a data" type="button" tabindex="-1" data-wysihtml-command-group="insertDataReference" class="btn btn-light dropdown-toggle" aria-haspopup="true" aria-expanded="false">
				<span class="current-font">Datas </span>
				<b class="caret"></b>
			</button>
			<ul class="wysihtml-custom-data-list dropdown-menu" style="display: none;">` + 
			datas.join("") + `
			</ul> 
		</li>`;
		},
		insertFootnoteReference: function(context) {
			var locale = context.locale;
			var options = context.options;
			return '<li class="foot-note-reference"><a title="Insert a reference to a footnote" class="btn btn-light" data-wysihtml-command="insertFootnoteReference"><img width="16" height="16" alt="!" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAcCAYAAACOGPReAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gQeDg4P1ryLUAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAABWklEQVRIx+2WMUvDUBDH/xeCq5MRpKAfwA6FuKhT45ZN51bi4urYQUjBqVBHhy4KXYNQv4CL4FBBRTcHwdFufoK/Q3jh+ZqkNU3AwYODR97d713ucvciJCEiRElCUgRAaUAltn7CojD1xhYqEGveCJSaUaXVI8kpSdENiqRD+dtm5dKM748k2LnCKgCgEQKb75ccDiczC5UnSys4AOADANbWgebGNYDJQjmtpFD/0GJtmjVUsj6zvCFkldHzZhB20e7J86muUPrAEBG22+Ic18QXifX2EcuJx9cL0O9vxXs1X85u6lMDh4znia6tFpzoEA/m8yl1u0Q09lL24gVJ6DoaoT7Yw0c28IQYPPm6z0yoAl808TkFdPaJ3ltg2s8FJYm7IXZPGxrY8YjwuZNmmwo118p4HMHruiDgEp3X0IT8OtIEfA4P270gz0axflwnf/o2reRnopKB8g3K/kUKbv6tqAAAAABJRU5ErkJggg=="></a></li>';
		}
	};

	Admin.wysihtml5CustomDialog = {
		insertFootnoteReference:
			`<div>
				<label class="col-form-label">
					<span>Footnote:</span>
					<input type="number" min="1" class="form-control form-control-sm" data-wysihtml-dialog-field="data-footnote" value="1">
				</label>
				<label class="control-label">
					<span>Title:</span>
					<input class="form-control form-control-sm" data-wysihtml-dialog-field="title" value="">
				</label>
			</div>`,
	};

	Admin.wysihtml5Options = {
		toolbar: {
			'locale': Admin.locale,
			'blocks': [
				// 'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'h6',
			],
			'font-names': true,
			// 'font-fixed-sizes': true,
			'font-named-sizes': true,
			'color': true,
			'hilite': true,
			'emphasis': [
				'bold',
				'italic',
				'underline',
				// 'superscript',
				// 'subscript',
			],
			'lists': true,
			'align': [
				'alignLeft',
				'alignCenter',
				'alignRight',
				// 'justifyFull'
			],
			'link': true,
			'image': true,
			// 'code': true,
			'table': true,
			'undo': true,
			'fullscreen': true,
			// 'html': true,
			'insertData': false,
			'insertFootnoteReference': false
		},
		customTemplates: Admin.wysihtml5Custom,
		customDialogs: Admin.wysihtml5CustomDialog,
		stylesheets: [ Admin.editorCSS ],
		shortcuts: {
		   '83': 'small'     // S
		},
		parserRules: {
			tags: {
				"data": {
					"unwrap": 0,
					"check_attributes": {
						"value": "numbers",
						"title": "any",
						"contenteditable": "any"
					}
				},
				"dfn": {
					"unwrap": 0,
					"check_attributes": {
						"data-footnote": "numbers",
						"title": "any",
						"contenteditable": "any"
					}
				}
			}
		},
		pasteParserRulesets: window.wysihtmlParserPasteRulesets,
		translate: function(term, locale) {
			return Translator.trans(term);
		},
		events: {
			'beforecommand:composer': function(e) {
				var editor = this;
				if ($.inArray(e.command, ['indent', 'insertUnorderedList', 'insertOrderedList']) >= 0) {
					$(editor.composer.doc.body).find('data.data-reference, data.foot-note-reference').removeAttr('contenteditable');
				}
			},
			'aftercommand:composer': function(e) {
				var editor = this;
				if ($.inArray(e.command, ['indent', 'insertUnorderedList', 'insertOrderedList']) >= 0) {
					$(editor.composer.doc.body).find('data.data-reference, data.foot-note-reference').attr('contenteditable', 'false');
				}
			},
			'interaction': function(e) {
				var editor = this;
				if (editor.composer.commands.state('insertDataReference')) {
					var value = editor.composer.commands.stateValue('insertDataReference');
					setTimeout(function() {
						var selecteds = editor.toolbar.container.querySelectorAll('ul.wysihtml-custom-data-list a.wysihtml-command-active');
						for (var i = 0; i < selecteds.length; i++) {
							if (selecteds[i].getAttribute('data-wysihtml-command-value') !== value) {
								selecteds[i].classList.remove('wysihtml-command-active');
							}
						}
					}, 0);
				}
			},
			'save:dialog': function(e) {
				var editor = this;
				var command = e.command;
				var dialog = $(e.dialogContainer);
			},
			'load': function(e) {
			},
			"beforeload": function() { 
				var val = this.getValue();
				val = val.replace(
					/\<data\s+(.*)\s*class="data"/g,
					'<data contenteditable="false" $1 class="data-reference"'
				);
				val = val.replace(
					/#(\d+)/g,
					function (match, m1, offs, str) {
						var data = Simulators.findDataById(m1);
						return '<data contenteditable="false" class="data-reference" title="' + data.label + '" value="' + data.id + '">« ' + data.label + ' »</data>';
					}
				);
				val = val.replace(
					/\<dfn\s+([^\>]*)\>/g,
					'<dfn contenteditable="false" $1>'
				);
				val = val.replace(
					/\[([^\^]+)\^(\d+)\(([^\)]+)\)\]/g,
					function (match, m1, m2, m3, offs, str) {
						return '<dfn contenteditable="false" class="foot-note-reference" title="' + m3 + '" data-footnote="' + m2 + '">« ' + m1 + ' »</dfn>';
					}
				);
				this.setValue(val);
			}
		}
	};

	Admin.wysihtml5InlineOnlyOptions = $.extend(true, {}, Admin.wysihtml5Options, {
		toolbar: {
			'blocks': false,
			'lists': false,
			'align': false,
			'fullscreen': false,
			'image': false,
			'table': false
		},
		parserRules: {
			tags: {
				"h1": {
					"unwrap": 1
				},
				"h2": {
					"unwrap": 1
				},
				"h3": {
					"unwrap": 1
				},
				"h4": {
					"unwrap": 1
				},
				"h5": {
					"unwrap": 1
				},
				"h6": {
					"unwrap": 1
				},
				"hr": {
					"remove": 1
				},
				"p": {
					"unwrap": 1
				}
			}
		},
		events: {
			'load': function(e) {
				var editor = this;
				wysihtml.dom.observe(editor.composer.doc.body, 'keydown', function(e) {
					var key = e.keyCode || e.which || e.key;;
					if (key == 13) {
						e.preventDefault();
					}
				});
			}
		}
	});

	var addTitleToExternalLink = function(richtext) {
		var $richtext = $('<div></div>');
		$richtext.append($.parseHTML(richtext));
		var links = $richtext.find('a');
		links.each(function() {
			if (this.hasAttribute("target") && $(this).attr('target') == '_blank') {
				$(this).attr('title', Translator.trans('%title% - New window', { 'title': $.trim($(this).html()) }));
			} else if (this.hasAttribute("title")) {
				$(this).removeAttr("title");
			}
		});
		return $richtext.html();
	}

	Admin.clearHTML = function(editable) {
		editable.wysihtml('cleanUp');
		var div = $('<div>');
		div.append(editable.wysihtml('getHTML', true)); // true = beautify
		div.find("data[class=data-reference]").addClass('data').removeClass('data-reference').removeAttr('contenteditable');
		div.find("dfn[class=foot-note-reference]").removeAttr('contenteditable');
		return div.html();
	}

	Admin.types = { 
		date: Translator.trans('date'), 
		day: Translator.trans('day'), 
		month: Translator.trans('month'), 
		year: Translator.trans('year'), 
		'boolean': Translator.trans('boolean'), 
		integer: Translator.trans('integer'), 
		number: Translator.trans('number'), 
		text: Translator.trans('text'), 
		textarea: Translator.trans('textarea'), 
		money: Translator.trans('money'), 
		choice: Translator.trans('choice'), 
		multichoice: Translator.trans('multichoice'), 
		percent: Translator.trans('percent'), 
		array: Translator.trans('array'), 
		table: Translator.trans('table'), 
		department: Translator.trans('department'), 
		region: Translator.trans('region'), 
		country: Translator.trans('country')
	};

	Admin.updated = false;

	global.Admin = Admin;
}(this));

wysihtml.commands.insertFootnoteReference = (function() {
	var nodeOptions = {
		nodeName: "DFN",
		className: "foot-note-reference",
		classRegExp: /foot-note-reference/g,
		toggle: true
	};

	return {
		exec: function(composer, command, value) {
			var node = composer.selection.getSelectedNode(), html;
			if (node.nodeType == Node.TEXT_NODE) {
				node = node.parentNode;
			}
			if (value && value['data-footnote'] && value.title) {
				if (node.nodeName == "DFN") {
					if (node.classList.contains("foot-note-reference")) {
						var dfn = composer.doc.createElement("dfn");
						dfn.className = "foot-note-reference";
						dfn.setAttribute('data-footnote', value['data-footnote']);
						dfn.setAttribute('title', value.title);
						dfn.setAttribute('contenteditable', 'false');
						dfn.appendChild(composer.doc.createTextNode(node.textContent));
						node.replaceWith(dfn);
					}
				} else {
					var text = composer.selection.getText();
					var espace = '';
					if (/\s+$/.test(text)) {
						text = text.replace(/\s+$/, '');
						espace = ' ';
					}
					text = text.replace(/^« /, '').replace(/ »$/, '');
					html = '<dfn contenteditable="false" class="foot-note-reference" data-footnote="';
					html += value['data-footnote'];
					html += '" title="';
					html += value.title;
					html += '">« ';
					html += text;
					html += ' »</dfn>';
					html += espace;
					composer.commands.exec('insertHTML', html);
				}
			}
		},

		state: function(composer, command) {
			var node =  wysihtml.commands.formatInline.state(composer, command, nodeOptions);
			return node === false || ! node[0].classList.contains("foot-note-reference")? false : node;
		}
	};

})();

wysihtml.commands.insertDataReference = (function() {
	var nodeOptions = {
		nodeName: "DATA",
		className: "data-reference",
		classRegExp: /data-reference/g,
		toggle: true
	};

	return {
		exec: function(composer, command, value) {
			var node = composer.selection.getSelectedNode(), html;
			if (node.nodeType == Node.TEXT_NODE) {
				node = node.parentNode;
			}
			if (value) {
				value = value.split(/\|/);
				if (node.nodeName == "DATA") {
					if (node.classList.contains("data-reference")) {
						var data = composer.doc.createElement("data");
						data.className = "data-reference";
						data.setAttribute('value', value[0]);
						data.setAttribute('title', value[1]);
						data.setAttribute('contenteditable', 'false');
						data.appendChild(composer.doc.createTextNode(value[1]));
						node.replaceWith(data);
					}
				} else {
					html = '<data contenteditable="false" class="data-reference" value="';
					html += value[0];
					html += '" title="';
					html += value[1];
					html += '">« ';
					html += value[1];
					html += ' »</data>';
					composer.commands.exec('insertHTML', html);
				}
			}
		},

		state: function(composer, command) {
			var node =  wysihtml.commands.formatInline.state(composer, command, nodeOptions);
			return node === false || ! node[0].classList.contains("data-reference")? false : [node[0]];
		},

		stateValue: function(composer, command, props) {
			var st = this.state(composer, command);
			if (st && wysihtml.lang.object(st).isArray()) {
				st = st[0];
			}
			if (st) {
				return st.getAttribute("value") + '|' + st.getAttribute("title");
			}
			return false;
		}
	};

})();


$(function(){
	bootbox.setDefaults({
		locale: Admin.lang
	});

	Admin.wysihtml5Options.locale = Admin.locale;
	Admin.wysihtml5Options.stylesheets = [Admin.editorCSS];

	function centerModal() {
		$('.modal').find('.modal-dialog').each(function(index) {
			$(this).css({
				'position': 'absolute',
				'top': function () {
					return (($(window).height() - $(this).outerHeight(true)) / 2) + 'px';
				},
				'left': function () {
					return (($(window).width() - $(this).outerWidth(true)) / 2) + 'px';
				}
			});
		});
	}
	$('body').on('shown.bs.modal', centerModal);
	$('a[data-confirm], button[data-confirm]').on('click', function(ev) {
		var href = $(this).attr('href');
		if (!$('#dataConfirmModal').length) {
			$('body').append('<div id="dataConfirmModal" class="modal" tabindex="-1" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h4 id="dataConfirmLabel" class="modal-title">' + Translator.trans('Please Confirm') + '</h4><button type="button" class="close" data-dismiss="modal" aria-label="' + Translator.trans('Close') + '"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"></div><div class="modal-footer"><button class="btn btn-secondary" data-dismiss="modal" aria-hidden="true">' + Translator.trans('Cancel') + '</button><a class="btn btn-primary" id="dataConfirmOK">' + Translator.trans('OK') + '</a></div></div></div></div>');
		} 
		$('#dataConfirmModal').find('.modal-body').text($(this).attr('data-confirm'));
		$('#dataConfirmOK').attr('href', href);
		$('#dataConfirmModal').modal({show:true});
		return false;
	});
	$(window).on("resize", function () {
		$('.modal:visible').each(centerModal);
	});
	$(window).on('beforeunload', function() {
		var e = $.Event('webapp:page:closing');
		$(window).trigger(e); // let other modules determine whether to prevent closing
		if(e.isDefaultPrevented()) {
			// e.message is optional
			return e.message || Translator.trans("You have unsaved stuff. Are you sure to leave?");
		}
	});
	$(window).on('webapp:page:closing', function(e) {
		if(Admin.updated) {
			e.preventDefault();
			e.message = Translator.trans('Your update are not saved. Sure to leave?');
		}
	});
});

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

	function Views() {
	};

	Views.fileMode = 'twig';

	Views.checkNodeName = function(node) {
		var nodeName = node.val();
		var errors = [], result;
		if (nodeName === '') {
			errors.push(Translator.trans("The name is required"));
			node.parents('.form-group').first().addClass('has-error');
		} else if (! /^[A-Za-z0-9_\-\.]+$/.test(nodeName)) {
			errors.push(Translator.trans("The name must not contains any space or special character"));
			node.parents('.form-group').first().addClass('has-error');
		}
		return errors;
	}

	Views.showErrors = function(errors, message, errorContainer) {
		var container = errorContainer || $('#view').eq(0);
		if (message) {
			container.find('.alert .error-message').text(message);
		}
		var mess = container.find('.alert ul');
		mess.empty();
		$.each(errors, function( index, value ) {
			mess.append('<li>' + value + '</li>');
		});
		container.find('.alert').show();
		$("html, body").animate({ scrollTop: container.find('.alert').offset().top - $('#navbar').outerHeight() }, 500);
	}

	Views.hideErrors = function(errorContainer) {
		var container = errorContainer || $('#view').eq(0);
		container.find('.alert .error-message').empty();
		container.find('.alert ul').empty();
		container.find('.alert').hide();
		$('.has-error').removeClass('has-error');
	}

	global.Views = Views;
}(this));

$(function(){
	if ( $( "#page-views" ).length ) {
		if ( $( ".tree" ).length ) {
			$('.tree').treegrid({
				expanderExpandedClass: 'fas fa-folder-open',
				expanderCollapsedClass: 'fas fa-folder'
			});
		}
		if ( $( "#view-create-form" ).length ) {
			$("#view-create-form input[name='view-templates-file'], #view-create-form input[name='view-assets-file']").on('change', function (e) {
				Views.hideErrors();
				var files = e.target.files;
				var $file = $(this);
				var reader = new FileReader();
				reader.onload = function(e) {
					$file.data('content', e.target.result);
				};
				reader.onerror  = function(e) {
					$file.data('error', e.target.error.name);
				};
			});
			$( "#view-create-form" ).submit(function(e) {
				var viewName = $("#new-view-name").val();
				var errors = Views.checkNodeName($("#new-view-name"));
				if ($.inArray(viewName, views) >= 0) {
					errors.push(Translator.trans("This view already exists"));
					$("#new-view-name").parents('.form-group').first().addClass('has-error');
				}
				if ($.inArray(viewName, ['all', 'admin', 'base', 'bundles']) >= 0) {
					errors.push(Translator.trans("View name can not be 'admin', 'all', 'base' or 'bundles'"));
					$("#new-view-name").parents('.form-group').first().addClass('has-error');
				}
				var templatesinput = $("#view-create-form input[name='view-templates-file']");
				var templatesfile = templatesinput.val();
				if (templatesfile != '') {
					if (! /\.zip$/.test(templatesfile)) {
						errors.push(Translator.trans("The file extension of the templates file must be '.zip'"));
						templatesinput.parents('.form-group').first().addClass('has-error');
					}
				}
				var assetsinput = $("#view-create-form input[name='view-assets-file']");
				var assetsfile = assetsinput.val();
				if (assetsfile != '') {
					if (! /\.zip$/.test(assetsfile)) {
						errors.push(Translator.trans("The file extension of the assets file must be '.zip'"));
						assetsinput.parents('.form-group').first().addClass('has-error');
					}
				}
				var viewSite = $("#view-site").val();
				if (/[\/\?]/.test(viewSite.replace(/^https?:\/\//, ""))) {
					errors.push(Translator.trans("The url must not contain '/' or '?'"));
					$("#view-site").parents('.form-group').first().addClass('has-error');
				}
				if (errors.length > 0) {
					Views.showErrors(errors);
					return false;
				}
				return true;
			});
		}
		if ( $( ".add-folder-or-file-form" ).length ) {
			$("input[name='add-folder-or-file']").on('change', function(e) {
				var container = $(this).parents('.add-node-container');
				var nodeType = container.attr('data-node-type');
				switch($(this).val()) {
					case 'folder':
						container.find('.file').remove();
						break;
					case 'file':
						var formgroup = $('<div>', {'class': 'form-group file'});
						var label = $('<label>', {'class': 'col-form-label', 'text' : Translator.trans('File')});
						var input = $('<input>', {'type': 'file', 'name': 'add-node-file', 'class': 'form-control form-control-sm'});
						if (nodeType === 'template') {
							input.attr('accept', '.twig');
						}
						label.append(input);
						formgroup.append(label);
						container.append(formgroup);
						input.on('change', function (e) {
							var file = e.target.files[0];
							if (file.name != '') {
								var nodeName = container.find("input[name='add-node-name']");
								if (nodeName.val() == '') {
									nodeName.val(file.name);
								}
							}
						});
						break;
				}
			});
			$('.popin-add-tree-node').on('show.bs.modal', function () {
				$(this).find("input[name='add-folder-or-file']").eq(0).prop( "checked", true );
				$(this).find("input[name='add-node-name']").val('');
				$(this).find(".form-group.file").remove();
			});
			$(".modal-footer button.submit").on('click', function(e) {
				$(this).parents('form').submit();
			});
			$(".add-folder-or-file-form").submit(function(e) {
				Views.hideErrors($(this).find('.modal-body'));
				var container = $(this).find('.add-node-container');
				var nodeType = container.attr('data-node-type');
				var folderOrFile = $(this).find("input[name='add-folder-or-file']:checked").val();
				var errors = Views.checkNodeName($(this).find("input[name='add-node-name']"));
				if (folderOrFile == 'file') {
					var fileinput = $(this).find("input[type='file']");
					var file = fileinput.val();
					if (file == '') {
						errors.push(Translator.trans("Please select a file !"));
						fileinput.parents('.form-group').first().addClass('has-error');
					} else if (nodeType == 'template' && ! /\.twig$/.test(file)) {
						errors.push(Translator.trans("The file extension of the template file must be '.twig'"));
						fileinput.parents('.form-group').first().addClass('has-error');
					}
				}
				if (errors.length > 0) {
					Views.showErrors(errors, null, $(this).find('.modal-body'));
					return false;
				}
				$(this).find('.modal').modal('hide');
				return true;
			});
			$(".rename-node-form").submit(function(e) {
				Views.hideErrors($(this).find('.modal-body'));
				var container = $(this).find('.rename-node-container');
				var nodeType = container.attr('data-node-type');
				var $nodeName = $(this).find("input[name='node-name']");
				var $newNodeName = $(this).find("input[name='rename-node-name']");
				var errors = Views.checkNodeName($newNodeName);
				if (nodeType === 'file') {
					var extension = $nodeName.val().match(/\.[0-9a-z]+$/i);
					var newExtension = $newNodeName.val().match(/\.[0-9a-z]+$/i);
					if (!newExtension || newExtension[0] != extension[0]) {
						errors.push(Translator.trans("The file extension can not be changed"));
						$newNodeName.parents('.form-group').first().addClass('has-error');
					}
				}
				if (errors.length > 0) {
					Views.showErrors(errors, null, $(this).find('.modal-body'));
					return false;
				}
				$(this).find('.modal').modal('hide');
				return true;
			});
		}
		if ( $( "#file-editor" ).length ) {
			var fileEditor = CodeMirror.fromTextArea(document.getElementById('file-editor'), {
				lineNumbers: true,
				styleActiveLine: true,
				theme: "elegant",
				matchBrackets: true,
				extraKeys: {
					"F11": function(cm) {
						cm.setOption("fullScreen", !cm.getOption("fullScreen"));
					},
					"Esc": function(cm) {
						if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
					}
				}
			});
			window.setTimeout(function() {
				fileEditor.setOption("mode", Views.fileMode);
			}, 1000);
		}
		if ( $( "#file-viewer" ).length ) {
			var fileViewer = CodeMirror.fromTextArea(document.getElementById('file-viewer'), {
				lineNumbers: true,
				styleActiveLine: true,
				theme: "base16-light",
				readOnly: 'nocursor'
			});
			window.setTimeout(function() {
				fileViewer.setOption("mode", Views.fileMode);
			}, 1000);
		}
	}
});
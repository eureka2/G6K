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

	Simulators.profilesBackup = null;
	Simulators.profileBackup = null;
	Simulators.profileDataBackup = null;

	Simulators.isDataInProfiles = function(id) {
		var inProfile = false;
		var profileDataContainers = $('#profiles').find('.profile-data-container');
		profileDataContainers.each(function(p) {
			if (this.hasAttribute('data-id') && $(this).attr('data-id') == id) {
				inProfile = $(this).attr('data-profile');
				return false;
			}
		});
		return inProfile;
	}


	Simulators.changeDataIdInProfiles = function(oldId, id) {
		var re = new RegExp("-data-" + oldId + '\\b', 'g');
		var profileDataContainers = $('#profiles').find('.profile-data-container');
		profileDataContainers.each(function(p) {
			if (re.test($(this).attr('id'))) {
				var val = $(this).attr('id');
				val = val.replace(re, "-data-" + id);
				$(this).attr('id', val);
			}
			if (this.hasAttribute('data-id') && $(this).attr('data-id') == oldId) {
				$(this).attr('data-id', id);
			}
			var descendants = $(this).find('*');
			descendants.each(function(d) {
				if (this.hasAttribute('id') && re.test($(this).attr('id'))) {
					var val = $(this).attr('id');
					val = val.replace(re, "-data-" + id);
					$(this).attr('id', val);
				}
			});
		});
	}

	Simulators.changeDataLabelInProfiles = function(id, label) {
		var datas = $('#profiles').find('.profile-data-container');
		datas.each(function(p) {
			if (this.hasAttribute('data-id') && $(this).attr('data-id') == id) {
				var pdatas = $(this).find("p[data-attribute='data']");
				pdatas.each(function(d) {
					$(this).attr('data-value', label);
					$(this).html(label);
				});
			}
		});
	}

	Simulators.changeDataChoiceLabelInProfiles = function(id, value, label) {
		var datas = $('#profiles').find('.profile-data-container');
		datas.each(function(p) {
			if (this.hasAttribute('data-id') && $(this).attr('data-id') == id) {
				var pdatas = $(this).find("p[data-attribute='default']");
				pdatas.each(function(d) {
					if (this.hasAttribute('data-value') && $(this).attr('data-value') == value) {
						$(this).html(label);
					}
				});
			}
		});
	}

	Simulators.changeDataChoiceValueInProfiles = function(id, oldValue, value) {
		var datas = $('#profiles').find('.profile-data-container');
		datas.each(function(p) {
			if (this.hasAttribute('data-id') && $(this).attr('data-id') == id) {
				var pdatas = $(this).find("p[data-attribute='default']");
				pdatas.each(function(d) {
					if (this.hasAttribute('data-value') && $(this).attr('data-value') == oldValue) {
						$(this).attr('data-value', value);
					}
				});
			}
		});
	}

	Simulators.maxProfileId = function() {
		var maxId = 0;
		var profiles = $('#profiles').find('.profile-container');
		profiles.each(function() {
			var id = parseInt($(this).attr('data-id'));
			if (id > maxId) {
				maxId = id;
			}
		});
		return maxId;
	}

	Simulators.renumberProfiles = function(panelGroups) {
		panelGroups.each(function(index) {
			var dataContainer = $(this).find("div.profile-container");
			var oldId = dataContainer.attr('data-id');
			var id = index + 1;
			if (id != oldId) {
				$(this).attr('id', 'profile-' + id);
				var re = new RegExp("profile-" + oldId + '\\b', 'g');
				var a = $(this).find('> .card > .card-header').find('> h4 > a');
				var label = a.text();
				label = label.replace("#" + oldId, "#" + id);
				a.text(label);
				var descendants = $(this).find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('data-profile') && $(this).attr('data-profile') == oldId) {
						$(this).attr('data-profile', id);
					}
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "profile-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "profile-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "profile-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "profile-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "profile-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
			}
		});
		panelGroups.each(function(index) {
			var dataContainer = $(this).find("div.profile-container");
			var oldId = dataContainer.attr('data-id');
			var id = index + 1;
			if (id != oldId) {
				dataContainer.attr('data-id', id);
			}
		});
	}

	Simulators.bindSortableProfiles = function(container) {
		if (! container ) {
			container = $("#profiles-profiles-panel");
		}
		container.find("> .sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			sort: function(event, ui) {
				if (Simulators.updating) {
					Simulators.toast(Translator.trans('An update is in progress,'), Translator.trans('first click «Cancel» or «Validate»'));
					setTimeout(function() {
						container.find("> .sortable").sortable('cancel');
					}, 0);
				}
			},
			update: function( e, ui ) {
				if (!Simulators.updating) {
					var self = $(this);
					var container = $(ui.item).find('.profile-container');
					var id = container.attr('data-id');
					Simulators.renumberProfiles($(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawProfilesForDisplay = function(profiles) {
		var profilesContainer = $('<div class="card bg-light profiles-container" id="profiles-attributes-panel"></div>');
		var profilesContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var attribute = '<div class="form-group row">';
		attribute    += '    <label class="col-sm-2 col-form-label">' + Translator.trans('Title') + '</label>';
		attribute    += '    <div class="col-sm-10">';
		attribute    += '        <p data-attribute="label" data-value="' + profiles.label + '" class="form-control-plaintext simple-value">' + profiles.label + '</p>';
		attribute    += '    </div>';
		attribute    += '</div>';
		attributes.append(attribute);
		attributesContainer.append(attributes);
		attributesContainer.append('<button class="btn btn-secondary float-right update-button edit-profiles-label" data-parent="#profiles-attributes-panel" title="' + profiles.label + '"><span class="button-label">' + Translator.trans('Edit') + '</span> <span class="fas fa-pencil-alt"></span></button>');
		profilesContainerBody.append(attributesContainer);
		profilesContainer.append(profilesContainerBody);
		return profilesContainer;
	}

	Simulators.drawProfilesForInput = function(profiles) {
		var profilesContainer = $('<div class="card bg-light profiles-container"></div>');
		var profilesContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForInput('profiles-label', 'text', 'label', Translator.trans('Title'), profiles.label, true, Translator.trans('Enter profiles title')));
		attributesContainer.append(attributes);
		profilesContainerBody.append(attributesContainer);
		var profilesButtonsPanel = $('<div class="card bg-light buttons-panel" id="profiles-buttons-panel"></div>');
		var profilesButtonsBody = $('<div class="card-body profiles-buttons"></div>');
		profilesButtonsBody.append('<button class="btn btn-success float-right validate-edit-profiles-label">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		profilesButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-profiles-label">' + Translator.trans('Cancel') + '</span></button>');
		profilesButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		profilesButtonsPanel.append(profilesButtonsBody);
		profilesContainerBody.append(profilesButtonsPanel);
		profilesContainer.append(profilesContainerBody);
		return profilesContainer;
	}

	Simulators.bindProfiles = function(profilesPanelContainer) {
		profilesPanelContainer.find('.cancel-edit-profiles-label').click(function() {
			profilesPanelContainer.replaceWith(Simulators.profilesBackup);
			Simulators.profilesBackup.find('button.edit-profiles-label').click(function(e) {
				e.preventDefault();
				Simulators.editProfilesLabel($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		profilesPanelContainer.find('.validate-edit-profiles-label').click(function() {
			if (! Simulators.checkProfilesLabel(profilesPanelContainer)) {
				return false;
			}
			var attributes = profilesPanelContainer.find('.attributes-container');
			var profiles = {
				label: attributes.find('input[data-attribute=label]').val()
			}
			var newProfilesPanel = Simulators.drawProfilesForDisplay(profiles);
			profilesPanelContainer.replaceWith(newProfilesPanel);
			newProfilesPanel.find('button.edit-profiles-label').click(function(e) {
				e.preventDefault();
				Simulators.editProfilesLabel($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
		});
	}

	Simulators.checkProfilesLabel = function(profilesPanelContainer) {
		var profilesLabel = $.trim(profilesPanelContainer.find('.attributes-container input[data-attribute=label]').val());
		if (profilesLabel === '') {
			profilesPanelContainer.find('.error-message').text(Translator.trans('The profiles title is required'));
			profilesPanelContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.editProfilesLabel = function(profilesContainer) {
		try {
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var profiles = {
				label: profilesContainer.find('p[data-attribute=label]').attr('data-value') || ''
			};
			var profilesInputContainer = Simulators.drawProfilesForInput(profiles);
			Simulators.profilesBackup = profilesContainer.replaceWith(profilesInputContainer);
			Simulators.bindProfiles(profilesInputContainer);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.drawProfileForDisplay = function(profile) {
		var profileElementId = 'profile-' + profile.id;
		var profilePanelContainer = Simulators.openCollapsiblePanel(profileElementId, '#' + profile.id + ' : ' + profile.label, 'info', '', '', [{ 'class': 'delete-profile', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-profile', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		var profilePanelBody = profilePanelContainer.find('.card-body');
		var profileContainer = $('<div class="card bg-light profile-container" id="' + profileElementId + '-attributes-panel" data-id="' + profile.id + '"></div>');
		var profileContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay(profileElementId, 'text', 'name', Translator.trans('Name'), profile.name, profile.name, true, Translator.trans('Name')));
		attributes.append(Simulators.simpleAttributeForDisplay(profileElementId, 'text', 'label', Translator.trans('Label'), profile.label, profile.label, true, Translator.trans('Label')));
		attributesContainer.append(attributes);
		profileContainerBody.append(attributesContainer);
		profileContainerBody.append('<div class="card bg-light description-panel" id="' + profileElementId + '-description-panel"><div class="card-header">' + Translator.trans('Description') + '</div><div class="card-body profile-description rich-text" data-edition="' + profile.description.edition + '">' + profile.description.content + '</div></div>');
		profileContainer.append(profileContainerBody);
		profilePanelBody.append(profileContainer);
		return profilePanelContainer;
	}

	Simulators.drawProfileForInput = function(profile) {
		var profileElementId = 'profile-' + profile.id;
		var profilePanelContainer = Simulators.openCollapsiblePanel(profileElementId, '#' + profile.id + ' : ' + profile.label, 'info', '', '', [] );
		var profilePanelBody = profilePanelContainer.find('.card-body');
		var profileContainer = $('<div class="card bg-light profile-container" id="' + profileElementId + '-attributes-panel" data-id="' + profile.id + '" data-name="' + profile.name + '"></div>');
		var profileContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var name = Simulators.simpleAttributeForInput(profileElementId + '-name', 'text', 'name', Translator.trans('Name'), profile.name, true, Translator.trans('Enter profile name'));
		attributes.append(name);
		var label = Simulators.simpleAttributeForInput(profileElementId + '-label', 'text', 'label', Translator.trans('Label'), profile.label, true, Translator.trans('Enter profile label'));
		attributes.append(label);
		attributesContainer.append(attributes);
		profileContainerBody.append(attributesContainer);
		profileContainer.append(profileContainerBody);
		profilePanelBody.append(profileContainer);
		profileContainerBody.append('<div class="card bg-light description-panel elements-container" id="' + profileElementId + '-description-panel"><div class="card-header">' + Translator.trans('Description') + '</div><div class="card-body"><textarea rows="5" name="' + profileElementId + '-description" id="' + profileElementId + '-description" wrap="hard" class="form-control profile-description">' + profile.description.content + '</textarea></div></div>');
		var profileButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + profileElementId + '-buttons-panel"></div>');
		var profileButtonsBody = $('<div class="card-body profile-buttons"></div>');
		profileButtonsBody.append('<button class="btn btn-success float-right validate-edit-profile">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		profileButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-profile">' + Translator.trans('Cancel') + '</span></button>');
		profileButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		profileButtonsPanel.append(profileButtonsBody);
		profileContainerBody.append(profileButtonsPanel);
		return profilePanelContainer;
	}

	Simulators.bindProfileButtons = function(container) {
		if (! container ) {
			container = $("#profiles");
		}
		container.find('button.edit-profiles-label').click(function(e) {
			e.preventDefault();
			Simulators.editProfilesLabel($($(this).attr('data-parent')));
		});
		container.find('button.edit-profile').click(function(e) {
			e.preventDefault();
			Simulators.editProfile($($(this).attr('data-parent')));
		});
		container.find('button.delete-profile').click(function(e) {
			e.preventDefault();
			Simulators.deleteProfile($($(this).attr('data-parent')));
		});
		container.find('button.add-profile-data').click(function(e) {
			e.preventDefault();
			Simulators.addProfileData($($(this).attr('data-parent')));
		});
	}

	Simulators.bindProfile = function(profilePanelContainer) {
		profilePanelContainer.find('textarea').wysihtml(Admin.wysihtml5Options);
		profilePanelContainer.find('.cancel-edit-profile').click(function() {
			profilePanelContainer.find('.profile-container').replaceWith(Simulators.profileBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		profilePanelContainer.find('.cancel-add-profile').click(function() {
			profilePanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		profilePanelContainer.find('.validate-edit-profile, .validate-add-profile').click(function() {
			var profileContainerGroup = profilePanelContainer.parent();
			var profileContainer = profilePanelContainer.find('.profile-container');
			if (! Simulators.checkProfile(profilePanelContainer)) {
				return false;
			}
			var id = profileContainer.attr('data-id');
			var attributes = profileContainer.find('.attributes-container');
			var profile = { id: id };
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				profile[$(this).attr('data-attribute')] =  $(this).val();
			});
			profile.description= {
				content: Admin.clearHTML(profilePanelContainer.find('.profile-description')),
				edition: 'wysihtml'
			};
			if ($(this).hasClass('validate-edit-profile')) {
				profile['datas'] = Simulators.collectProfileDatas(Simulators.profileBackup);
			} else {
				profile['datas'] = [];
			}
			var newProfilePanel = Simulators.drawProfileForDisplay(profile);
			if ($(this).hasClass('validate-edit-profile')) {
				var oldLabel = Simulators.profileBackup.find("p[data-attribute='label']").attr('data-value');
				if (profile.label != oldLabel) {
					var title = profilePanelContainer.find('> .card > .card-header').find('> h4 > a');
					title.text('#' + profile.id + ' : ' + profile.label);
				}
				profileContainer.replaceWith(newProfilePanel.find('.profile-container'));
				newProfilePanel = profilePanelContainer;
			} else {
				var datasPanel = $('<div class="card bg-success profile-datas-panel" id="profile-' + profile.id + '-profile-datas-panel"><div class="card-header"><button class="btn btn-success float-right update-button add-profile-data" title="' + Translator.trans('Add') + '" data-parent="#profile-' + profile.id + '-profile-datas-panel"><span class="button-label">' + Translator.trans('Add') + '</span> <span class="fas fa-plus-circle"></span></button><h4 class="card-title">' + Translator.trans('Datas') + '</h4></div><div class="card-body sortable"></div></div>');
				newProfilePanel.find('.profile-container').after(datasPanel);
				profilePanelContainer.replaceWith(newProfilePanel);
				Simulators.bindProfileButtons(newProfilePanel);
				
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newProfilePanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newProfilePanel.offset().top - $('#navbar').height() }, 500);
		});
	}

	Simulators.checkProfile = function(profilePanelContainer) {
		var profileElementId = profilePanelContainer.attr('id');
		var profileId = profilePanelContainer.find('.profile-container').attr('data-id');
		var profileOldName = profilePanelContainer.find('.profile-container').attr('data-name');
		var profileName = $.trim($('#' + profileElementId + '-name').val());
		if (profileName === '') {
			profilePanelContainer.find('.error-message').text(Translator.trans('The profile name is required'));
			profilePanelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(profileName)) {
			profilePanelContainer.find('.error-message').text(Translator.trans('Incorrect profile name'));
			profilePanelContainer.find('.alert').show();
			return false;
		}
		if (profileName != profileOldName) {
			var exists = false;
			$('#profiles').find('div.profile-container').each(function(i) {
				var attributesContainer = $(this).find('.attributes-container');
				var name =  $(this).find(".attributes-container p[data-attribute=name]").attr('data-value');
				if (profileName == name && profileId != $(this).attr('data-id')) {
					exists = true;
					return false;
				}
			});
			if (exists) {
				profilePanelContainer.find('.error-message').text(Translator.trans('This profile name already exists'));
				profilePanelContainer.find('.alert').show();
				return false;
			}
		}
		var profileLabel = $.trim($('#' + profileElementId + '-label').val());
		if (profileLabel === '') {
			profilePanelContainer.find('.error-message').text(Translator.trans('The profile label is required'));
			profilePanelContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addProfile = function(profileContainerGroup) {
		try {
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var profile = {
				id: Simulators.maxProfileId() + 1, 
				name: '',
				label: '',
				description: {
					content: '',
					edition: ''
				}
			};
			var profilePanelContainer = Simulators.drawProfileForInput(profile);
			profilePanelContainer.find('button.cancel-edit-profile').addClass('cancel-add-profile').removeClass('cancel-edit-profile');
			profilePanelContainer.find('button.validate-edit-profile').addClass('validate-add-profile').removeClass('validate-edit-profile');
			var profilesPanel;
			$("#profiles-profiles-panel").find("> div.sortable").append(profilePanelContainer);
			Simulators.bindProfile(profilePanelContainer);
			$("#collapseprofiles").collapse('show');
			profilePanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID=$(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: profilePanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editProfile = function(profileContainerGroup) {
		try {
			var profileContainer = profileContainerGroup.find('.profile-container');
			var id = profileContainer.attr('data-id');
			var attributesContainer = profileContainer.find('.attributes-container');
			var profile = {
				id: id, 
				name: attributesContainer.find("p[data-attribute='name']").attr('data-value'),
				label: attributesContainer.find("p[data-attribute='label']").attr('data-value'),
				description: {
					content: profileContainer.find(".profile-description").html(),
					edition: profileContainer.find(".profile-description").attr('data-edition')
				}
			};
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var profilePanelContainer = Simulators.drawProfileForInput(profile);
			Simulators.profileBackup = profileContainer.replaceWith(profilePanelContainer.find('.profile-container'));
			Simulators.bindProfile(profileContainerGroup);
			$("#collapseprofile-" + id).collapse('show');
			$("html, body").animate({ scrollTop: profileContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteProfile = function(profileContainerGroup) {
		try {
			var profileContainer = profileContainerGroup.find('.profile-container');
			var attributesContainer = profileContainer.find('.attributes-container');
			var label = attributesContainer.find("p[data-attribute='label']").attr('data-value');
			bootbox.confirm({
				title: Translator.trans('Deleting profile'),
				message: Translator.trans("Are you sure you want to delete the profile : %label%", { 'label' : label}), 
				callback: function(confirmed) {
					if (confirmed) {
						var pparent = profileContainerGroup.parent();
						profileContainerGroup.remove();
						Simulators.renumberProfiles(pparent.find('> div'));
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.renumberProfileDatas = function(panelGroups) {
		panelGroups.each(function(index) {
			var dataContainer = $(this).find("div.profile-data-container");
			var profileId = dataContainer.attr('data-profile');
			var oldId = dataContainer.attr('data-id');
			var label = Simulators.findDataById(dataContainer.find('p[data-attribute=data]').attr('data-value')).label;
			var id = index + 1;
			if (id != oldId) {
				dataContainer.attr('data-id', id);
				$(this).attr('id', 'profile-' + profileId + '-profile-data-' + id);
				var re = new RegExp("profile-data-" + oldId + '([^\\d])?', 'g');
				var a = $(this).find('> .card > .card-header').find('> h4 > a');
				a.text(' ' + Translator.trans('Data %id%', { 'id': id }) + ' : ' + label);
				var descendants = $(this).find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "profile-data-" + id + '$1');
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "profile-data-" + id + '$1');
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "profile-data-" + id + '$1');
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "profile-data-" + id + '$1');
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "profile-data-" + id + '$1');
						$(this).attr('aria-labelledby', attr);
					}
				});
			}
		});
	}

	Simulators.bindSortableProfileDatas = function(container) {
		if (! container ) {
			container = $("#page-simulators .profile-datas-panel");
		}
		container.find(".sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			sort: function(event, ui) {
				if (Simulators.updating) {
					Simulators.toast(Translator.trans('An update is in progress,'), Translator.trans('first click «Cancel» or «Validate»'));
					setTimeout(function() {
						container.find(".sortable").sortable('cancel');
					}, 0);
				}
			},
			update: function( e, ui ) {
				if (!Simulators.updating) {
					Simulators.renumberProfileDatas($(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawProfileDataForDisplay = function(data) {
		var profileDataElementId = 'profile-' + data.profileId + '-profile-data-' + data.id;
		var dataPanelContainer = Simulators.openCollapsiblePanel(profileDataElementId, Translator.trans('Data %id%', { 'id': data.id }) + ' : ' + Simulators.findDataById(data.data).label, 'light', 'in', 'sortable', [{ 'class': 'delete-profile-data', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-profile-data', 'label': Translator.trans('Edit'), 'icon': 'fa-plus-circle' }] );
		var dataPanelBody = dataPanelContainer.find('.card-body');
		var dataContainer = $('<div class="card bg-light profile-data-container" id="' + profileDataElementId + '-attributes-panel" data-profile="' + data.profileId + '" data-id="' + data.id + '"></div>');
		var dataContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var datasList = {};
		var choices = {};
		$.each(Simulators.dataset, function( name, dt) {
			datasList[dt.id] = dt.label;
			if (dt.id == data.data && dt.type == 'choice') {
				$.each(dt.options, function(o, option) {
					choices[option.name] = option.label;
				});
			}
		});
		attributes.append(Simulators.simpleAttributeForDisplay(profileDataElementId, 'select', 'data', Translator.trans('Data'), data.data, data.data, true, Translator.trans('Profile data'), JSON.stringify(datasList)));
		if ( ! $.isEmptyObject(choices)) {
			attributes.append(Simulators.simpleAttributeForDisplay(profileDataElementId, 'select', 'default', Translator.trans('Profile data value'), data.default, data.default, true, Translator.trans('Profile data value'), JSON.stringify(choices)));
		} else {
			attributes.append(Simulators.simpleAttributeForDisplay(profileDataElementId, 'text', 'default', Translator.trans('Profile data value'), data.default, data.default, true, Translator.trans('Profile data value')));
		}
		attributesContainer.append(attributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		return dataPanelContainer;
	}

	Simulators.drawProfileDataForInput = function(data) {
		var profileDataElementId = 'profile-' + data.profileId + '-profile-data-' + data.id;
		var dataPanelContainer = Simulators.openCollapsiblePanel(profileDataElementId, Translator.trans('Data %id%', { 'id': data.id }), 'light', 'in', 'sortable', [{ 'class': 'delete-profile-data', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-profile-data', 'label': Translator.trans('Edit'), 'icon': 'fa-plus-circle' }] );
		var dataPanelBody = dataPanelContainer.find('.card-body');
		var dataContainer = $('<div class="card bg-light profile-data-container" id="' + profileDataElementId + '-attributes-panel" data-profile="' + data.profileId + '" data-id="' + data.id + '"></div>');
		var dataContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var usedDatas = [];
		$('#collapseprofile-' + data.profileId).find('.profile-data-container').each(function(d) {
			if ($(this).attr('data-id') != data.id) {
				usedDatas.push($(this).find('p[data-attribute=data]').attr('data-value'));
			}
		});
		var datasList = {};
		if (data.data == 0) {
			datasList[0] = Translator.trans('Select a data')
		}
		var choices = {};
		$.each(Simulators.dataset, function( name, dt) {
			if ($.inArray(dt.id, usedDatas) == -1) {
				datasList[dt.id] = dt.label;
				if (dt.id == data.data && dt.type == 'choice') {
					$.each(dt.options, function(o, option) {
						choices[option.name] = option.label;
					});
				}
			}
		});
		attributes.append(Simulators.simpleAttributeForInput(profileDataElementId + '-data', 'select', 'data', Translator.trans('Data'), data.data, true, Translator.trans('Select a data'), JSON.stringify(datasList)));
		if ( ! $.isEmptyObject(choices)) {
			attributes.append(Simulators.simpleAttributeForInput(profileDataElementId + '-default', 'select', 'default', Translator.trans('Profile data value'), data.default, true, Translator.trans('Select a value'), JSON.stringify(choices)));
		} else {
			attributes.append(Simulators.simpleAttributeForInput(profileDataElementId + '-default', 'text', 'default', Translator.trans('Profile data value'), data.default, true, Translator.trans('Profile data value')));
		}
		attributesContainer.append(attributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		var dataButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + profileDataElementId + '-buttons-panel"></div>');
		var dataButtonsBody = $('<div class="card-body data-buttons"></div>');
		dataButtonsBody.append('<button class="btn btn-success float-right validate-edit-profile-data">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		dataButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-profile-data">' + Translator.trans('Cancel') + '</span></button>');
		dataButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		dataButtonsPanel.append(dataButtonsBody);
		dataContainer.append(dataButtonsPanel);
		return dataPanelContainer;
	}

	Simulators.bindProfileDataButtons = function(container) {
		if (! container ) {
			container = $("#simulator");
		}
		container.find('button.edit-profile-data').click(function(e) {
		    e.preventDefault();
			Simulators.editProfileData($($(this).attr('data-parent')));
		});
		container.find('button.delete-profile-data').click(function(e) {
		    e.preventDefault();
			Simulators.deleteProfileData($($(this).attr('data-parent')));
		});
	}

	Simulators.bindProfileData = function(dataPanelContainer) {
		dataPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		dataPanelContainer.find('.cancel-edit-profile-data').click(function() {
			dataPanelContainer.find('.profile-data-container').replaceWith(Simulators.profileDataBackup);
			Simulators.profileDataBackup.find('button.edit-profile-data').click(function(e) {
				e.preventDefault();
				Simulators.editProfileData($($(this).attr('data-parent')));
			});
			Simulators.profileDataBackup.find('button.delete-profile-data').click(function(e) {
				e.preventDefault();
				Simulators.deleteProfileData($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.cancel-add-profile-data').click(function() {
			dataPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.validate-edit-profile-data, .validate-add-profile-data').click(function() {
			var dataContainer = dataPanelContainer.find('.profile-data-container');
			if (! Simulators.checkProfileData(dataPanelContainer)) {
				return false;
			}
			var profileId = dataContainer.attr('data-profile');
			var id = dataContainer.attr('data-id');
			var attributes = dataContainer.find('.attributes-container');
			var data = { 
				profileId: profileId,
				id: id,
				data: '',
				default: ''
			};
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				data[$(this).attr('data-attribute')] = $(this).val();
			});
			var newProfileDataPanel = Simulators.drawProfileDataForDisplay(data);
			if ($(this).hasClass('validate-edit-profile-data')) {
				dataContainer.replaceWith(newProfileDataPanel.find('.profile-data-container'));
				newProfileDataPanel = dataPanelContainer;
			} else {
				dataPanelContainer.replaceWith(newProfileDataPanel);
				Simulators.bindProfileDataButtons(newProfileDataPanel);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newProfileDataPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newProfileDataPanel.offset().top - $('#navbar').height() }, 500);
		});
		dataPanelContainer.find('select[data-attribute=data]').change(function(e) {
			var data = Simulators.findDataById($(this).val());
			var defaultContainer = dataPanelContainer.find('*[data-attribute=default]');
			if (data) {
				if (data.type == 'choice' || data.type == 'multichoice') {
					var newDefaultContainer = $('<select>', { id: defaultContainer.attr('id'), 'class' : 'form-control simple-value', 'name': defaultContainer.attr('name'), 'data-attribute': defaultContainer.attr('data-attribute'), 'placeholder':  defaultContainer.attr('placeholder') });
					$.each(data.options, function(o, option) {
						newDefaultContainer.append($('<option>', { 'value': option.name, text: option.label }));
					});
				} else {
					var newDefaultContainer = $('<input>', { id: defaultContainer.attr('id'), 'class' : 'form-control simple-value', 'name': defaultContainer.attr('name'), 'data-attribute': defaultContainer.attr('data-attribute'), 'placeholder':  defaultContainer.attr('placeholder') });
				}
				defaultContainer.replaceWith(newDefaultContainer);
			}
		});
	}

	Simulators.checkProfileData = function(dataContainer) {
		var dataElementId = dataContainer.attr('id');
		var dataId = $('#' + dataElementId + '-data').val();
		if (dataId == 0) {
			dataContainer.find('.error-message').text(Translator.trans('The profile data is required'));
			dataContainer.find('.alert').show();
			return false;
		}
		var deflt = $.trim($('#' + dataElementId + '-default').val());
		if (deflt === '') {
			dataContainer.find('.error-message').text(Translator.trans('The data value is required'));
			dataContainer.find('.alert').show();
			return false;
		}
		var data = Simulators.findDataById(dataId);
		switch (data.type) {
			case 'date':
				if (! /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(deflt)) {
					dataContainer.find('.error-message').text(Translator.trans('Incorrect data value'));
					dataContainer.find('.alert').show();
					return false;
				}
				break;
			case 'money':
				if (! /^\d+(\,\d{1,2})?$/.test(deflt)) {
					dataContainer.find('.error-message').text(Translator.trans('Incorrect data value'));
					dataContainer.find('.alert').show();
					return false;
				}
				break;
			case 'integer':
				if (! /^\d+$/.test(deflt)) {
					dataContainer.find('.error-message').text(Translator.trans('Incorrect data value'));
					dataContainer.find('.alert').show();
					return false;
				}
				break;
			case 'number':
			case 'percent':
				if (! /^-{0,1}\d*\,{0,1}\d+$/.test(deflt)) {
					dataContainer.find('.error-message').text(Translator.trans('Incorrect data value'));
					dataContainer.find('.alert').show();
					return false;
				}
				break;
		}
		return true;
	}

	Simulators.addProfileData = function(profileContainerGroup) {
		try {
			var profileContainer = profileContainerGroup.parent().parent().find('.profile-container');
			var profileId = profileContainer.attr('data-id');
			var datasContainer = profileContainerGroup.find('> .card-body > div');
			var data = {
				id: datasContainer.length + 1,
				profileId: profileId,
				data: 0,
				default: ''
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var panelProfileDataContainer = Simulators.drawProfileDataForInput(data);
			panelProfileDataContainer.find('button.cancel-edit-profile-data').addClass('cancel-add-profile-data').removeClass('cancel-edit-profile-data');
			panelProfileDataContainer.find('button.validate-edit-profile-data').addClass('validate-add-profile-data').removeClass('validate-edit-profile-data');
			var datasPanel = profileContainerGroup.find("> div.sortable");
			datasPanel.append(panelProfileDataContainer);
			Simulators.bindProfileData(panelProfileDataContainer);
			panelProfileDataContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: panelProfileDataContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editProfileData = function(dataContainerGroup) {
		try {
			var dataContainer = dataContainerGroup.find('.profile-data-container');
			var profileId = dataContainer.attr('data-profile');
			var id = dataContainer.attr('data-id');
			var data = Simulators.collectProfileData(dataContainer);
			data.data = data.id;
			data.id = id;
			data['profileId'] = profileId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var panelProfileDataContainer = Simulators.drawProfileDataForInput(data);
			Simulators.profileDataBackup = dataContainer.replaceWith(panelProfileDataContainer.find('.profile-data-container'));
			Simulators.bindProfileData(dataContainerGroup);
			$("#collapse" + dataContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: dataContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteProfileData = function(dataContainerGroup) {
		try {
			var dataContainer = dataContainerGroup.find('.profile-data-container');
			var profileId = dataContainer.attr('data-profile');
			var id = dataContainer.attr('data-id');
			bootbox.confirm({
				title: Translator.trans('Deleting profile data'),
				message: Translator.trans("Are you sure you want to delete the profile data : %id%", { 'id': id }), 
				callback: function(confirmed) {
					if (confirmed) {
						var dparent = dataContainerGroup.parent();
						dataContainerGroup.remove();
						Simulators.renumberProfileDatas(dparent.find('> div'));
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.collectProfileData = function(container) {
		return {
			id: container.find("p[data-attribute='data']").attr('data-value'),
			default: container.find("p[data-attribute='default']").attr('data-value')
		};
	}

	Simulators.collectProfileDatas = function(container) {
		var datas = [];
		var dataContainers = container.parent().find('div.profile-data-container');
		dataContainers.each(function(c) {
			datas.push(Simulators.collectProfileData($(this)));
		});
		return datas;
	}

	Simulators.collectProfiles = function() {
		var label = $('#profiles').find('p[data-attribute=label]').attr('data-value');
		var profiles = [];
		var containers = $('#profiles').find('div.profile-container');
		containers.each(function(i) {
			var attributesContainer = $(this).find('.attributes-container');
			profiles.push({
				id: i + 1, 
				name: attributesContainer.find("p[data-attribute='name']").attr('data-value'),
				label: attributesContainer.find("p[data-attribute='label']").attr('data-value') || '',
				description: {
					content: $(this).parent().find(".profile-description").html() || '',
					edition: $(this).parent().find(".profile-description").attr('data-edition') || 'wysihtml'
				},
				datas: Simulators.collectProfileDatas($(this))
			});
		});
		return {
			label: label,
			profiles: profiles
		};
	}

}(this));


(function (document, window) {
	'use strict';

	var uniqueId = function(prefix) {
		return (prefix || 'ui-id') + '-' + Math.floor((Math.random()*1000)+1);
	};

	var closePanel = function(panel) {
		slide.up(panel, status => {
			panel.setAttribute('aria-hidden', 'true');
			panel.setAttribute('tabIndex', '-1');
			panel.classList.add('hidden');
			panel.classList.remove('in');
		});
	};

	var openPanel = function(panel) {
		slide.down(panel, status => {
			panel.setAttribute('aria-hidden', 'false');
			panel.setAttribute('tabIndex', '0');
			panel.classList.remove('hidden');
			panel.classList.add('in');
		});
	};

	var togglePanel = function(tab) {
		var target = tab.hasAttribute('data-target')
				? tab.getAttribute('data-target')
				: tab.getAttribute('href');
		var curPanel = document.querySelector(target);
		if (curPanel.classList.contains('in')) {
			tab.setAttribute('aria-selected' , 'false');
			tab.setAttribute('aria-expanded', 'false');
			closePanel(curPanel);
		} else {
			if (tab.hasAttribute('data-parent')) {
				var tablist = document.querySelector(tab.getAttribute('data-parent'));
				if (tablist !== null) {
					var openedPanel = tablist.querySelector('.in');
					if (openedPanel !== null) {
						closePanel(openedPanel);
					}
				}
			}
			openPanel(curPanel);
			tab.setAttribute('aria-selected', 'true');
			tab.setAttribute('aria-expanded', 'true');
		}
	};

	var tabs =  document.querySelectorAll('[data-toggle="expand"]');
	tabs.forEach( tab => {
		var tabid = tab.getAttribute('id') || uniqueId('ui-expand');
		tab.setAttribute('id', tabid);
		tab.setAttribute('role', 'tab');
		tab.setAttribute('aria-selected', 'false');
		tab.setAttribute('aria-expanded', 'false');
		if (tab.hasAttribute('data-parent')) {
			var tablist = document.querySelector(tab.getAttribute('data-parent'));
			if (tablist){
				tablist.setAttribute('role', 'tablist');
				tablist.setAttribute('aria-multiselectable', 'true');
			}
		}
		var target = tab.hasAttribute('data-target')
				? tab.getAttribute('data-target')
				: tab.getAttribute('href');
		tab.setAttribute('aria-controls', target.substr(1));
		var panel = document.querySelector(target);
		panel.setAttribute('role', 'tabpanel');
		panel.setAttribute('aria-labelledby', tabid);
		panel.style.transition = 'height 2s ease';
		if (panel.classList.contains('in')) {
			tab.setAttribute('aria-selected', 'true');
			tab.setAttribute('aria-expanded', 'true');
			panel.setAttribute('tabindex', '0');
			panel.setAttribute('aria-hidden', 'false');
		} else {
			closePanel(panel);
		}
		tab.addEventListener('keydown', function (event) {
			var key = event.which || event.keyCode;
			if ([37, 38, 39, 40].indexOf(key) < 0) {
				return;
			}
			if (! this.hasAttribute('data-parent')) {
				return;
			}
			var tablist = document.querySelector(this.getAttribute('data-parent'));
			if (tablist === null) {
				return;
			}
			var tabs = tablist.querySelectorAll("[data-parent='" + this.getAttribute('data-parent') + "']");
			var index = -1;
			tabs.forEach( (that, i) => {
				if (that === this) {
					index = i;
				}
			});
			if (key == 38 || key == 37) { // up & left
				index--;
			}
			if (key == 39 || key == 40) { // down & right
				index++;
			}
			if (index < 0) {
				index = tabs.length -1;
			}
			if (index == tabs.length) {
				index = 0;
			}
			tabs[index].focus();
			event.preventDefault();
			event.stopPropagation();
		});
		tab.addEventListener('click', function(event) {
			togglePanel(this);
			event.preventDefault();
			event.stopPropagation();
		});
	});
}(document, window));

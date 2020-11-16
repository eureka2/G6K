(function (document, window) {
	'use strict';

	var uniqueId = function(prefix) {
		return (prefix || 'ui-id') + '-' + Math.floor((Math.random()*1000)+1);
	};

	var closePanel = function(panel) {
		panel.setAttribute('aria-hidden', 'true');
		panel.setAttribute('tabIndex', '-1');
		panel.classList.add('hidden');
		panel.classList.remove('active');
	};

	var openPanel = function(panel) {
		panel.setAttribute('aria-hidden', 'false');
		panel.setAttribute('tabIndex', '0');
		panel.classList.remove('hidden');
		panel.classList.add('active');
	};

	var selectTab = function(tab) {
		if (tab.parentElement.classList.contains('active')) {
			return;
		}
		var active = tab.closest('.step-panels-list').querySelector('.active');
		if (null !== active) {
			var openedTab = active.querySelector('[data-toggle="tab"]');
			var openedTarget = openedTab.hasAttribute('data-target')
					? openedTab.getAttribute('data-target')
					: openedTab.getAttribute('href');
			var openedPanel = document.querySelector(openedTarget);
			if (openedPanel !== null) {
				closePanel(openedPanel);
				openedTab.setAttribute('tabIndex', '-1');
				openedTab.setAttribute('aria-selected', 'false');
				openedTab.setAttribute('aria-expanded', 'false');
				openedTab.parentElement.classList.remove('active');
			}
		}
		var target = tab.hasAttribute('data-target')
				? tab.getAttribute('data-target')
				: tab.getAttribute('href');
		var panel = document.querySelector(target);
		openPanel(panel);
		tab.parentElement.classList.add('active');
		tab.setAttribute('tabIndex', '0');
		tab.setAttribute('aria-selected', 'true');
		tab.setAttribute('aria-expanded', 'true');
	};

	var tablist = document.querySelector('.simulator-container .step-panels-list');
	if (null !== tablist) {
		var lis = tablist.querySelectorAll('li');
		var tabs = tablist.querySelectorAll('[data-toggle="tab"]');

		tablist.setAttribute('role', 'tablist');
		lis.forEach( li => li.setAttribute('role', 'presentation'));

		tabs.forEach( (tab, index) => {
			var target = tab.hasAttribute('data-target')
				? tab.getAttribute('data-target')
				: tab.getAttribute('href');
			var panel = document.querySelector(target);
			var tabid = tab.getAttribute('id') || uniqueId('ui-tab');
			tab.setAttribute('id', tabid);
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-controls', target.substr(1));
			panel.setAttribute('role', 'tabpanel');
			panel.setAttribute('aria-labelledby', tabid);
			if (tab.parentElement.classList.contains('active')) {
				tab.setAttribute('tabIndex', '0');
				tab.setAttribute('aria-selected', 'true');
				panel.setAttribute('tabIndex', '0');
				panel.setAttribute('aria-hidden', 'false');
			} else {
				tab.setAttribute('tabIndex', '-1');
				tab.setAttribute('aria-selected', 'false');
				closePanel(panel);
				tab.parentElement.classList.remove('active');
			}

			tab.addEventListener('keydown', function (event) {
				var key = event.which || event.keyCode;
				if ([37, 38, 39, 40].indexOf(key) < 0) {
					return;
				}
				var tablist = this.closest('ul[role=tablist] ');
				if (tablist === null) {
					return;
				}
				var tabs = tablist.querySelectorAll('[role=tab]');
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
				var nextTab = tabs[index];
				if (nextTab.getAttribute('role') === 'tab') {
					selectTab(nextTab);			//Comment this line for dynamically loaded tabPabels, to save Ajax requests on arrow key navigation
					nextTab.focus();
				}
				event.preventDefault();
				event.stopPropagation();
			});

			tab.addEventListener('click', function(event) {
				selectTab(this);
				event.preventDefault();
				event.stopPropagation();
			});

		});
	}

}(document, window));

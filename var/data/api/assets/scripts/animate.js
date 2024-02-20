(function (document, window) {
	'use strict';

	const getCssPropUnitMap = (v) => {
		v = v.trim();
		const numParts = v.match('[0-9.]+');
		let unit = 'ms';
		let num;
		const numString = numParts ? numParts[0] : '';
		if (numString) {
			unit = v.split(numString)[1];
			num = Number(numString);
		}
		return { num, unit };
	};

	const convertCssTimeValueToMilliseconds = (val) => {
		const map = getCssPropUnitMap(val);
		const num = map ? map.num : undefined;
		if (!num) {
			return '';
		}
		const unit = val.replace(num + '', '');
		let value = num;
		if (unit === 's') {
			value = num * 1000;
		}
		return value + 'ms';
	};

	var getTransitionDuration = function(element) {
		const getJsPropName = (cssProp) => {
			return cssProp.replace(/-([a-z])/g, (letter) => {
				return letter[1].toUpperCase();
			});
		};
		const getCssComputedProperty = (prop) => {
			const style = window.getComputedStyle(element);
			return (style.getPropertyValue(prop) ||
				element.style[getJsPropName(prop)]);
		};
		const delayProp = getCssComputedProperty('transition-delay') || '0ms';
		const durationProp = getCssComputedProperty('transition-duration') || '0ms';
		const times = Array.isArray(durationProp) ? durationProp : [durationProp];
		const delay = Array.isArray(delayProp) ? delayProp : [delayProp];
		let highest = 0;
		let map;
		times.push.apply(times, delay); // account for delay
		times.forEach((value) => {
			value.split(',').forEach((v) => {
				v = convertCssTimeValueToMilliseconds(v);
				map = getCssPropUnitMap(v);
				if (map.num && map.num > highest) {
					highest = map.num;
				}
			});
		});
		return highest;
	}

	var waitForElementTransition = function (element) {
		const duration = getTransitionDuration(element);
		return new Promise((resolve) => {
			if (duration > 0) {
				setTimeout(() => {
					resolve(element);
				}, duration);
			}
			else {
				resolve(element);
			}
		});
	}

	var slide = {

		// Show an element
		down: function(element, callback, duration) {
			duration = duration || 0.3;
			element.style.overflowY = element.downoverflowY || 'visible';
			element.classList.remove('hidden'); 
			element.style.transition = 'height ' + duration + 's ease-in-out';
			element.style.height =  element.downheight || 'auto';
			waitForElementTransition(element).then(() => {
				element.style.transition = '';
				element.style.height = "";
				callback && callback.call(element, "complete");
			}, false);
		},

		// Hide an element
		up: function (element, callback, duration) {
			duration = duration || 0.3;
			if (!element.downheight) {
				element.downheight = element.scrollHeight + 'px';
			}
			if (!element.downoverflowY) {
				element.downoverflowY = element.style.overflowY || 'visible';
			}
			element.style.overflowY = "hidden";
			element.style.transition = 'height ' + duration + 's ease-in-out';
			element.style.height = "0px";
			waitForElementTransition(element).then(() => {
				element.style.transition = '';
				element.style.height = "";
				callback && callback.call(element, "complete");
			}, false);
		}

	}
	window.slide = slide;

}(document, window));

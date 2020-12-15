(function (global) {
	"use strict";

	function ChoiceSlider (select, options, onComplete) {
		if (typeof select === "object" && select && select["jquery"]) {
			select = select[0];
		}
		select.closest('.field-container').classList.add('ChoiceSlider-field');
		var nIntervals = select.querySelectorAll('option').length - 1;
		var range = document.createElement('div');
		range.classList.add('range');
		var labels = document.createElement('ul');
		labels.classList.add('range-labels');
		var value = 1;
		select.querySelectorAll('option').forEach(function(v, i) {
			if (v.value != '') {
				var li = document.createElement('li');
				li.textContent = v.textContent;
				li.setAttribute('data-value', v.value);
				labels.appendChild(li);
				if (v.hasAttribute('selected')) {
					value = i + 1;
				}
			} else {
				nIntervals--;
			}
		});
		var rangeInput = document.createElement('input');
		rangeInput.setAttribute('type', 'range');
		rangeInput.setAttribute('min', '1');
		rangeInput.setAttribute('max', nIntervals + 1);
		rangeInput.setAttribute('step', '1');
		rangeInput.setAttribute('value', value);
		range.appendChild(rangeInput);
		select.insertAdjacentElement('afterend', range);
		range.insertAdjacentElement('afterend', labels);
		select.addEventListener('change', function(e) {
			rangeInput.dispatchEvent(new Event('input'));
		});
		select.style.display = 'none';

		var sheet = document.createElement('style'),  
		rangeInput = document.querySelector('.range input'),
		prefs = ['webkit-slider-runnable-track', 'moz-range-track', 'ms-track'];
		document.body.appendChild(sheet);

		var interval;
		var getTrackStyle = function (el) {
			var curVal = el.value,
				val = ((curVal - 1) * interval + 9) / (nIntervals * interval + 9) * 100,
				style = '';

			// Set active label
			document.querySelectorAll('.range-labels li').forEach( li => li.classList.remove('active', 'selected') );
			var curLabel = document.querySelector('.range-labels').querySelector('li:nth-child(' + curVal + ')');
			curLabel.classList.add('active', 'selected');
			var prev = curLabel.previousElementSibling;
			while (prev !== null) {
				prev.classList.add('selected');
				prev = prev.previousElementSibling;
			}

			if (curLabel.getAttribute('data-value') != select.value) {
				onComplete && onComplete(curLabel.getAttribute('data-value'), curLabel.textContent);
			}

			var color = curLabel.style.display.color;
			// Change background gradient
			for (var i = 0; i < prefs.length; i++) {
				style += '.range {background: linear-gradient(to right, ' + color + ' 0%, ' + color + ' ' + val + '%, #fff ' + val + '%, #fff 100%)}';
				style += '.range input::-' + prefs[i] + '{background: linear-gradient(to right, ' + color + ' 0%, ' + color + ' ' + val + '%, #b2b2b2 ' + val + '%, #b2b2b2 100%)}';
			}

			return style;
		}

		var resize = function () {
			var labels = document.querySelector('.range-labels');
			labels.parentElement.style.display = 'inline-block';
			var width = parseFloat(getComputedStyle(labels.parentElement, null).width.replace("px", ""));
			interval = (width - 9) / nIntervals;
			document.querySelector('.range').style.width = (nIntervals * interval + 9) + 'px';
			var margin = -Math.ceil((interval - 9) / 2);
			labels.style.marginLeft = margin + 'px';
			labels.style.marginRight = margin + 'px';
			document.querySelectorAll('.range-labels li').forEach( li => {
				li.style.width = interval + 'px';
			});
		}
		resize();

		rangeInput.addEventListener('input', function () {
			sheet.textContent = getTrackStyle(this);
		});

		// Change input value on label click
		document.querySelectorAll('.range-labels li').forEach( li => {
			li.addEventListener('click', function () {
				var index = -1, prev = this;
				do {
					index++;
				} while (prev = prev.previousElementSibling);
				rangeInput.value = index + 1;
				rangeInput.dispatchEvent(new Event('input'));
			});
		});

		window.addEventListener('resize', function () {
			resize();
		});
		rangeInput.dispatchEvent(new Event('input'));
	}

	global.ChoiceSlider = ChoiceSlider;
}(this));
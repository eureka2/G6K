(function (global) {
	"use strict";

	function ChoiceSlider (select, options, onComplete) {
		select.closest('.field-container').addClass('ChoiceSlider-field');
		var nIntervals = select.find('option').length - 1;
		var $range = $('<div>', { 'class': 'range' });
		var $labels = $('<ul>', { 'class': 'range-labels'});
		var value = 1;
		select.find('option').each(function(i, v) {
			if (this.value != '') {
				$labels.append($('<li>', { 'data-value': this.value, 'text': $(this).text() }));
				if ($(this).is(':selected')) {
					value = i + 1;
				}
			} else {
				nIntervals--;
			}
		});
		var $rangeInput = $('<input>', { 'type': 'range', 'min': 1, 'max': nIntervals + 1, 'step': 1, 'value': value });
		$range.append($rangeInput);
		select.after($range);
		$range.after($labels);
		select.on('change', function(e) {
			$rangeInput.trigger('input');
		});
		select.hide();

		var sheet = document.createElement('style'),  
		$rangeInput = $('.range input'),
		prefs = ['webkit-slider-runnable-track', 'moz-range-track', 'ms-track'];
		document.body.appendChild(sheet);

		var interval;
		var getTrackStyle = function (el) {
			var curVal = el.value,
				val = ((curVal - 1) * interval + 9) / (nIntervals * interval + 9) * 100,
				style = '';

			// Set active label
			$('.range-labels li').removeClass('active selected');
			var curLabel = $('.range-labels').find('li:nth-child(' + curVal + ')');
			curLabel.addClass('active selected');
			curLabel.prevAll().addClass('selected');

			if (curLabel.attr('data-value') != select.val()) {
				onComplete && onComplete(curLabel.attr('data-value'), curLabel.text());
			}

			var color = curLabel.css('color');
			// Change background gradient
			for (var i = 0; i < prefs.length; i++) {
				style += '.range {background: linear-gradient(to right, ' + color + ' 0%, ' + color + ' ' + val + '%, #fff ' + val + '%, #fff 100%)}';
				style += '.range input::-' + prefs[i] + '{background: linear-gradient(to right, ' + color + ' 0%, ' + color + ' ' + val + '%, #b2b2b2 ' + val + '%, #b2b2b2 100%)}';
			}

			return style;
		}

		var resize = function () {
			var width = $('.range-labels').parent().css('display', 'inline-block').width();
			interval = (width - 9) / nIntervals;
			$('.range').css('width', (nIntervals * interval + 9) + 'px');
			var margin = -Math.ceil((interval - 9) / 2);
			$('.range-labels').css({'margin-left': margin + 'px', 'margin-right':  margin + 'px'});
			$('.range-labels li').css('width', interval + 'px');
		}
		resize();

		$rangeInput.on('input', function () {
			sheet.textContent = getTrackStyle(this);
		});

		// Change input value on label click
		$('.range-labels li').on('click', function () {
			var index = $(this).index();
			$rangeInput.val(index + 1).trigger('input');
		});

		$(window).on('resize', function () {
			resize();
		});
		$rangeInput.trigger('input');
	}

	global.ChoiceSlider = ChoiceSlider;
}(this));
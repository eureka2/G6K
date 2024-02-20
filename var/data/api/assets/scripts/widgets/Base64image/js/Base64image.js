(function (global) {
	"use strict";

	function Base64image (input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			input = input[0];
		}
		var imageFile = document.createElement('input');
		imageFile.setAttribute('type', 'file');
		imageFile.setAttribute('id', input.getAttribute('name') + '-Base64image');
		imageFile.setAttribute('accept', 'image/png, image/jpeg, image/gif, image/svg+xml');
		var imageFileLabel = document.createElement('label');
		var imageTag = document.createElement('img');
		imageTag.setAttribute('src', input.value);
		imageTag.setAttribute('alt', Translator.trans('Click to choose an image'));
		imageFileLabel.appendChild(imageFile);
		imageFileLabel.appendChild(imageTag);
		input.insertAdjacentElement('afterend', imageFileLabel);
		input.closest('.field-container').classList.add('Base64image');
		if (input.value != '') {
			imageLoaded(imageTag);
		}
		input.style.dispay = 'none';
		imageFile.addEventListener('change', function() {
			if (this.files && this.files[0]) {
				var reader = new FileReader();
				reader.addEventListener("load", function(e) {
					imageTag.setAttribute('src', e.target.result);
					imageLoaded(imageTag);
					onComplete && onComplete(e.target.result, '', false, true);
				}); 
				reader.readAsDataURL(this.files[0] );
			  }
		});
	}
	
	function imageLoaded(image) {
		image.setAttribute('title', Translator.trans('Click to select another image'));
		image.closest('.Base64image').classList.add('image-loaded');
	}

	global.Base64image = Base64image;
}(this));
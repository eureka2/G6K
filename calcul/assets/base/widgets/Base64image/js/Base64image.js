(function (global) {
	"use strict";

	function Base64image (input, options, onComplete) {
		var imageFile = $('<input>', { 'type': 'file', 'id': input.attr('name') + '-Base64image', 'accept': 'image/png, image/jpeg, image/gif, image/svg+xml'});
		var imageFileLabel = $('<label>');
		var imageTag = $('<img>', { 'src': input.val(), 'alt': Translator.trans('Click to choose an image')});
		imageFileLabel.append(imageFile);
		imageFileLabel.append(imageTag);
		input.after(imageFileLabel);
		input.closest('.field-container').addClass('Base64image');
		if (input.val() != '') {
			imageLoaded(imageTag);
		}
		input.hide();
		imageFile.on('change', function() {
			if (this.files && this.files[0]) {
				var reader = new FileReader();
				reader.addEventListener("load", function(e) {
					imageTag.attr('src', e.target.result);
					imageLoaded(imageTag);
					onComplete && onComplete(e.target.result, '', false, true);
				}); 
				reader.readAsDataURL(this.files[0] );
			  }
		});
	}
	
	function imageLoaded(image) {
		image.attr('title', Translator.trans('Click to select another image'));
		image.closest('.Base64image').addClass('image-loaded');
	}

	global.Base64image = Base64image;
}(this));
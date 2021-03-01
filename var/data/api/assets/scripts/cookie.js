(function (document, window) {
	'use strict';

	var cookie = {

		get: function(name) {
			if (!name) return;
			var parts = document.cookie.split(name + '=');
			if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
			return;
		},

		create: function(name, value, params) {
			name = name || false; // test
			value = value || '';
			params.expires = params.expires || false;
			params.path = params.path || '/';
			if (name) {
				var cooky = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';
				var path = 'path=' + params.path + ';';
				var domain = params.domain ? 'domain=' + params.domain + ';' : '';
				var secure = params.secure ? 'secure;' : '';
				var httpOnly = params.httpOnly ? 'httpOnly;' : '';
				var expires = '';
				if (params.expires) {
					params.expires = new Date(new Date().getTime() +
						parseInt(params.expires, 10) * 1000 * 60 * 60 * 24);
					expires = 'expires=' + params.expires.toUTCString() + ';';
				}
				document.cookie = cooky + expires + path + domain + secure + httpOnly;
				return true;
			}
			return false;
		},

		exists: function(name) {
			if (this.get(name)) return true;
			return false;
		},

		delete: function(params) {
			if (!params) return;
			if (this.get(params)) {
				return this.create({
					name: params.name,
					value: '',
					expires: -1,
					path: params.path,
					domain: params.domain
				});
			}
			return false;
		}

	}
	window.cookie = cookie;

}(document, window));

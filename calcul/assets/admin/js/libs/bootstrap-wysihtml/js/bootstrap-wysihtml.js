/* 
* see 
* https://github.com/Voog/wysihtml/wiki
* https://developer.mozilla.org/fr/docs/Web/API/Document/execCommand
* http://scruffles.github.io/BootstrapModalPopover/#
* https://www.quackit.com/html/codes/color/color_names.cfm
*/

(function (global) {
	'use strict';

	var colorTable = [
		["indianred", "Indian Red", "#CD5C5C", false],
		["lightcoral", "Light Coral", "#F08080", false],
		["salmon", "Salmon", "#FA8072", false],
		["darksalmon", "Dark Salmon", "#E9967A", false],
		["lightsalmon", "Light Salmon", "#FFA07A", false],
		["crimson", "Crimson", "#DC143C", false],
		["red", "Red", "#FF0000", true],
		["fireBrick", "Fire Brick", "#B22222", false],
		["darkred", "Dark Red", "#8B0000", false],
		["pink", "Pink", "#FFC0CB", false],
		["lightpink", "Light Pink", "#FFB6C1", false],
		["hotpink", "Hot Pink", "#FF69B4", false],
		["deeppink", "Deep Pink", "#FF1493", false],
		["mediumvioletred", "Medium Violet Red", "#C71585", false],
		["palevioletred", "Pale Violet Red", "#DB7093", false],
		["coral", "Coral", "#FF7F50", false],
		["tomato", "Tomato", "#FF6347", false],
		["orangered", "Orange Red", "#FF4500", false],
		["darkorange", "Dark Orange", "#FF8C00", false],
		["orange", "Orange", "#FFA500", false],
		["gold", "Gold", "#FFD700", false],
		["yellow", "Yellow", "#FFFF00", true],
		["lightyellow", "Light Yellow", "#FFFFE0", false],
		["lemonchiffon", "Lemon Chiffon", "#FFFACD", false],
		["lightgoldenrodyellow", "Light Goldenrod Yellow", "#FAFAD2", false],
		["papayawhip", "Papaya Whip", "#FFEFD5", false],
		["moccasin", "Moccasin", "#FFE4B5", false],
		["peachpuff", "Peach Puff", "#FFDAB9", false],
		["palegoldenrod", "Pale Goldenrod", "#EEE8AA", false],
		["khaki", "Khaki", "#F0E68C", false],
		["darkkhaki", "Dark Khaki", "#BDB76B", false],
		["lavender", "Lavender", "#E6E6FA", false],
		["thistle", "Thistle", "#D8BFD8", false],
		["plum", "Plum", "#DDA0DD", false],
		["violet", "Violet", "#EE82EE", false],
		["orchid", "Orchid", "#DA70D6", false],
		["fuchsia", "Fuchsia", "#FF00FF", true],
		["mediumorchid", "Medium Orchid", "#BA55D3", false],
		["mediumpurple", "Medium Purple", "#9370DB", false],
		["amethyst", "Amethyst", "#9966CC", false],
		["rebeccapurple", "Rebecca Purple", "#663399", false],
		["blueviolet", "Blue Violet", "#8A2BE2", false],
		["darkviolet", "Dark Violet", "#9400D3", false],
		["darkorchid", "Dark Orchid", "#9932CC", false],
		["darkmagenta", "Dark Magenta", "#8B008B", false],
		["purple", "Purple", "#800080", true],
		["indigo", "Indigo", "#4B0082", false],
		["slateblue", "SlateBlue", "#6A5ACD", false],
		["darkslateblue", "Dark Slate Blue", "#483D8B", false],
		["mediumslateblue", "Medium Slate Blue", "#7B68EE", false],
		["greenyellow", "Green Yellow", "#ADFF2F", false],
		["chartreuse", "Chartreuse", "#7FFF00", false],
		["lawngreen", "Lawn Green", "#7CFC00", false],
		["lime", "Lime", "#00FF00", true],
		["limegreen", "Lime Green", "#32CD32", false],
		["palegreen", "Pale Green", "#98FB98", false],
		["lightgreen", "Light Green", "#90EE90", false],
		["mediumspringgreen", "Medium Spring Green", "#00FA9A", false],
		["springgreen", "Spring Green", "#00FF7F", false],
		["mediumseagreen", "Medium Sea Green", "#3CB371", false],
		["seagreen", "Sea Green", "#2E8B57", false],
		["forestgreen", "Forest Green", "#228B22", false],
		["green", "Green", "#008000", true],
		["darkgreen", "Dark Green", "#006400", false],
		["yellowgreen", "Yellow Green", "#9ACD32", false],
		["olivedrab", "Olive Drab", "#6B8E23", false],
		["olive", "Olive", "#808000", true],
		["darkolivegreen", "Dark Olive Green", "#556B2F", false],
		["mediumaquamarine", "Medium Aquamarine", "#66CDAA", false],
		["darkseagreen", "Dark Sea Green", "#8FBC8F", false],
		["lightseagreen", "Light Sea Green", "#20B2AA", false],
		["darkcyan", "Dark Cyan", "#008B8B", false],
		["teal", "Teal", "#008080", true],
		["aqua", "Aqua", "#00FFFF", true],
		["lightcyan", "Light Cyan", "#E0FFFF", false],
		["paleturquoise", "Pale Turquoise", "#AFEEEE", false],
		["aquamarine", "Aquamarine", "#7FFFD4", false],
		["turquoise", "Turquoise", "#40E0D0", false],
		["mediumturquoise", "Medium Turquoise", "#48D1CC", false],
		["darkturquoise", "Dark Turquoise", "#00CED1", false],
		["cadetblue", "Cadet Blue", "#5F9EA0", false],
		["steelblue", "Steel Blue", "#4682B4", false],
		["lightsteelblue", "Light Steel Blue", "#B0C4DE", false],
		["powderblue", "Powder Blue", "#B0E0E6", false],
		["lightblue", "Light Blue", "#ADD8E6", false],
		["skyblue", "Sky Blue", "#87CEEB", false],
		["lightskyblue", "Light Sky Blue", "#87CEFA", false],
		["deepskyblue", "Deep Sky Blue", "#00BFFF", false],
		["dodgerblue", "Dodger Blue", "#1E90FF", false],
		["cornflowerblue", "Cornflower Blue", "#6495ED", false],
		["royalblue", "Royal Blue", "#4169E1", false],
		["blue", "Blue", "#0000FF", true],
		["mediumblue", "Medium Blue", "#0000CD", false],
		["darkblue", "Dark Blue", "#00008B", false],
		["navy", "Navy", "#000080", true],
		["midnightblue", "Midnight Blue", "#191970", false],
		["cornsilk", "Cornsilk", "#FFF8DC", false],
		["blanchedalmond", "Blanched Almond", "#FFEBCD", false],
		["bisque", "Bisque", "#FFE4C4", false],
		["navajowhite", "Navajo White", "#FFDEAD", false],
		["wheat", "Wheat", "#F5DEB3", false],
		["burlywood", "Burly Wood", "#DEB887", false],
		["tan", "Tan", "#D2B48C", false],
		["rosybrown", "Rosy Brown", "#BC8F8F", false],
		["sandybrown", "Sandy Brown", "#F4A460", false],
		["goldenrod", "Goldenrod", "#DAA520", false],
		["darkgoldenrod", "Dark Goldenrod", "#B8860B", false],
		["peru", "Peru", "#CD853F", false],
		["chocolate", "Chocolate", "#D2691E", false],
		["saddlebrown", "Saddle Brown", "#8B4513", false],
		["sienna", "Sienna", "#A0522D", false],
		["brown", "Brown", "#A52A2A", false],
		["maroon", "Maroon", "#800000", true],
		["white", "White", "#FFFFFF", true],
		["snow", "Snow", "#FFFAFA", false],
		["honeydew", "Honeydew", "#F0FFF0", false],
		["mintcream", "Mint Cream", "#F5FFFA", false],
		["azure", "Azure", "#F0FFFF", false],
		["aliceblue", "Alice Blue", "#F0F8FF", false],
		["ghostwhite", "Ghost White", "#F8F8FF", false],
		["whitesmoke", "White Smoke", "#F5F5F5", false],
		["seashell", "Sea shell", "#FFF5EE", false],
		["beige", "Beige", "#F5F5DC", false],
		["oldlace", "Old Lace", "#FDF5E6", false],
		["floralwhite", "Floral White", "#FFFAF0", false],
		["ivory", "Ivory", "#FFFFF0", false],
		["antiquewhite", "Antique White", "#FAEBD7", false],
		["linen", "Linen", "#FAF0E6", false],
		["lavenderblush", "Lavender Blush", "#FFF0F5", false],
		["mistyrose", "Misty Rose", "#FFE4E1", false],
		["gainsboro", "Gainsboro", "#DCDCDC", false],
		["lightgrey", "Light Grey", "#D3D3D3", false],
		["silver", "Silver", "#C0C0C0", true],
		["darkgray", "Dark Gray", "#A9A9A9", false],
		["gray", "Gray", "#808080", true],
		["dimgray", "Dim Gray", "#696969", false],
		["lightslategray", "Light Slate Gray", "#778899", false],
		["slategray", "Slate Gray", "#708090", false],
		["darkslategray", "Dark Slate Gray", "#2F4F4F", false],
		["black", "Black", "#000000", true]
	];

	var baseColorTable = [];
	var colorNameTable = {};
	var colorHexTable = {};

	$.each(colorTable, function(i, c) {
		var name = c[0];
		var label = c[1];
		var hex = c[2];
		var base = c[3];
		colorNameTable[name] = [hex, label, base];
		colorHexTable[hex] = [name, label, base];
		if (base) {
			baseColorTable.push([name, label, hex]);
		}
	});

	var rgbToHex = function(rgb) { 
		var RGB = rgb.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
		return '#' + toHex(RGB[1]) + toHex(RGB[2]) + toHex(RGB[3]); 
	}

	var toHex = function(n) {
		n = parseInt(n,10);
		if (isNaN(n)) return "00";
		n = Math.max(0,Math.min(n,255));
		return "0123456789ABCDEF".charAt((n-n%16)/16)
			 + "0123456789ABCDEF".charAt(n%16);
	}

	function BootStrapWysiHtmlPalette(base) {
		this.base = typeof base == 'undefined' ? false : base;
	}

	BootStrapWysiHtmlPalette.prototype.isBase = function() {
		return this.base;
	}

	BootStrapWysiHtmlPalette.prototype.setBase = function(base) {
		this.base = typeof base == 'undefined' ? true : base;
	}

	BootStrapWysiHtmlPalette.prototype.getColors = function() {
		return this.base ? baseColorTable : colorTable;
	}

	BootStrapWysiHtmlPalette.prototype.nameToHex = function(name) {
		return colorNameTable[name] ? colorNameTable[name][0] : '';
	}

	BootStrapWysiHtmlPalette.prototype.hexToName = function(hex) {
		if (/^rgb\s*\(/.test(hex)) {
			hex = rgbToHex(hex);
		}
		return colorHexTable[hex] ? colorHexTable[hex][0] : '';
	}

	BootStrapWysiHtmlPalette.prototype.isBaseColor = function(color) {
		if (/^#/.test(color)) {
			color = this.hexToName(color);
		} 
		return colorNameTable[color] ? colorNameTable[color][2] : false;
	}

	global.BootStrapWysiHtmlPalette = BootStrapWysiHtmlPalette;
}(this));

(function (global) {
	'use strict';

	var fontTable = [
		['arial', 'Arial', 'sans-serif'],
		['bookman', 'Bookman', 'serif'],
		['comicsansms', 'Comic Sans MS', 'cursive'],
		['couriernew', 'Courier New', 'monospace'],
		['garamond', 'Garamond', 'serif'],
		['georgia', 'Georgia', 'serif'],
		['helvetica', 'Helvetica', 'sans-serif'],
		['impact', 'Impact', 'fantasy'],
		['palatino', 'Palatino', 'serif'],
		['timesnewroman', 'Times New Roman', 'serif'],
		['trebuchetms', 'Trebuchet MS', 'sans-serif'],
		['verdana', 'Verdana', 'sans-serif']
	];

	var fontNameTable = {};
	var fontLabelTable = {};

	$.each(fontTable, function(i, f) {
		var name = f[0];
		var label = f[1];
		var serif = f[2];
		fontNameTable[name] = [label, serif];
		fontLabelTable[label] = [name, serif];
	});

	function BootStrapWysiHtmlFonts() {
	}

	BootStrapWysiHtmlFonts.prototype.getFonts = function() {
		return fontTable;
	}

	BootStrapWysiHtmlFonts.prototype.getName = function(label) {
		return fontLabelTable[label] ? fontLabelTable[label][0] : '';
	}

	BootStrapWysiHtmlFonts.prototype.getLabel = function(font) {
		return fontNameTable[font] ? fontNameTable[font][0] : '';
	}

	BootStrapWysiHtmlFonts.prototype.getFamily = function(font) {
		return '"' + this.getLabel(font) + '", ' + this.getGenericFamily(font);
	}

	BootStrapWysiHtmlFonts.prototype.getGenericFamily = function(font) {
		return fontNameTable[font] ? fontNameTable[font][1] : '';
	}

	BootStrapWysiHtmlFonts.prototype.isSerif = function(font) {
		return fontNameTable[font] ? fontNameTable[font][1] == 'serif' : false;
	}

	global.BootStrapWysiHtmlFonts = BootStrapWysiHtmlFonts;
}(this));

(function(factory){
	if (typeof define === "function" && define.amd) {
		define(["jquery"], factory);
	} else if (typeof exports === 'object') {
		factory(require('jquery'));
	} else {
		if (typeof jQuery === 'undefined') {
			throw new Error('BootStrapWysiHtml\'s JavaScript requires jQuery')
		}
		factory(jQuery);
	}
}(function($, undefined){
	'use strict';

	var BootStrapWysiHtml = function(editable, options) {
		this.editable = $(editable);
		this.palette = new BootStrapWysiHtmlPalette(false); // true = 16 base colors, 140 colors otherwise
		this.fonts = new BootStrapWysiHtmlFonts();
		this.options = $.extend({},
			BootStrapWysiHtml.DEFAULTS, 
			options
		);
		initialize(this);
	}

	// private variables
	var toolbar = {
		'emphasis':
			`<div class="btn-group">
				<a class="btn btn-light" data-wysihtml-command="bold" title="Bold [CTRL+B]">bold</a>
				<a class="btn btn-light" data-wysihtml-command="italic" title="Italic [CTRL+I]">italic</a>
				<a class="btn btn-light" data-wysihtml-command="underline" title="Underline [CTRL+U]">underline</a>
				<a class="btn btn-light" data-wysihtml-command="superscript" title="Superscript"><span class="fa fa-superscript">
				<a class="btn btn-light" data-wysihtml-command="subscript" title="Subscript"><span class="fa fa-subscript">
			</div>`,

		'link':
			`<div class="btn-group">
				<a class="btn btn-light" data-wysihtml-command="createLink" title="Add a hyperlink"><span class="fa fa-link"></span></a>
				<a class="btn btn-light" data-wysihtml-command="removeLink" title="Delete hyperlink"><span class="fa fa-unlink"></span></a>
			</div>`,

		'image':
			`<a class="btn btn-light" data-wysihtml-command="insertImage" title="Add an image"><span class="fa fa-image"></span></a>`,

		'lists':
			`<div class="btn-group">
				<a class="btn btn-light" data-wysihtml-command="insertUnorderedList" title="Create / delete a bulleted list"><span class="fa fa-list-ul"></span></a>
				<a class="btn btn-light" data-wysihtml-command="insertOrderedList" title="Create / delete a numbered list"><span class="fa fa-list-ol"></span></a>
				<a class="btn btn-light" data-wysihtml-command="indent" title="Indent"><span class="fa fa-indent"></span></a>
				<a class="btn btn-light" data-wysihtml-command="outdent" title="Deindent"><span class="fa fa-outdent"></span></a>
			</div>`,

		'align':
			`<div class="btn-group">
				<a class="btn btn-light" data-wysihtml-command="alignLeftStyle" title="Align to the left"><span class="fa fa-align-left"></span></a>
				<a class="btn btn-light" data-wysihtml-command="alignCenterStyle" title="Center the content"><span class="fa fa-align-center"></span></a>
				<a class="btn btn-light" data-wysihtml-command="alignRightStyle" title="Align to the right"><span class="fa fa-align-right"></span></a>
				<a class="btn btn-light" data-wysihtml-command="justifyFull" title="Justify"><span class="fa fa-align-justify"></span></a>
			</div>`,

		'hilite':
			`<button style="padding: 4px 6px 4px 6px" type="button" class="btn btn-light" tabindex="-1" aria-haspopup="true" aria-expanded="false">
				<span style="display: inline-table; margin: 0; padding: 0; height: 20px;">
					<span style="display: table-row; margin: 0; padding: 0;">
						<span class="fa fa-font" style="display: table-cell; color: white; background: black;"></span>
						<b style="display: table-cell; vertical-align: middle; float:right; margin: 0" class="caret"></b>
					</span>
					<span style="display: table-row; margin: 0; padding: 0; margin-top: -2px">
						<span class="current-color" style="display: table-row; background: black; width: 15px; height: 1px; line-height: 1px; padding: 0; margin: 0;">&nbsp;&nbsp;&nbsp;</span>
					</span>
				</span>
			</button>
			<div class="colors-16 dropdown-menu popover bottom">
				<div class="arrow"></div>
				<table style="table-layout:fixed; border: 1px solid #444">
					<tbody>
						<tr>
							<td colspan="3" style="border: 1px solid #444;" class="wysihtml-background-transparent"><a title="No color" data-wysihtml-command="foreColor" data-wysihtml-command-blank-value="true">&nbsp;</a></td>
							<td style="background:white;text-align:center;border:1px solid #444;"><a class="close-popover" href="" title="Close">&nbsp;<span class="fa fa-close"></span></a></td>
						</tr>
					</tbody>
				</table>
			</div>`,

		'color':
			`<button style="padding: 4px 6px 4px 6px" type="button" class="btn btn-light" tabindex="-1" aria-haspopup="true" aria-expanded="false">
				<span style="display: inline-table; margin: 0; padding: 0; height: 20px;">
					<span style="display: table-row; margin: 0; padding: 0;">
						<span class="fa fa-font" style="display: table-cell; color: black;"></span>
						<b style="display: table-cell; vertical-align: middle; float:right; margin: 0" class="caret"></b>
					</span>
					<span style="display: table-row; margin: 0; padding: 0; margin-top: -2px">
						<span class="current-color" style="display: table-row; background: black; width: 15px; height: 1px; line-height: 1px; padding: 0; margin: 0;">&nbsp;&nbsp;&nbsp;</span>
					</span>
				</span>
			</button>
			<div class="colors-140 dropdown-menu popover bottom">
				<div class="arrow"></div>
				<table style="table-layout:fixed; border: 1px solid #444;">
					<tbody>
						<tr>
							<td colspan="16" style="border: 1px solid #444;" class="wysihtml-background-transparent"><a title="no color" data-wysihtml-command="foreColor" data-wysihtml-command-blank-value="true">&nbsp;</a></td>
							<td colspan="4" style="background:white;text-align:center;border:1px solid #444;"><a class="close-popover" href="" title="Close">&nbsp;<span class="fa fa-close"></span></a></td>
						</tr>
					</tbody>
				</table>
			</div>`,

		'blocks':
			`<button title="Styles" id="wysiwyg-font-style" type="button" tabindex="-1" data-wysihtml-command-group="formatBlock" class="btn btn-light dropdown-toggle" aria-haspopup="true" aria-expanded="false">
				<span class="fa fa-font"></span>
				<span class="current-block">Normal text</span>
			</button>
			<ul class="dropdown-menu" aria-labelledby="wysiwyg-font-style" style="display: none;">
				<li><a class="dropdown-item" data-wysihtml-command="formatBlock" data-wysihtml-command-blank-value="true">Normal text</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="formatBlock" data-wysihtml-command-value="h1">Heading 1</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="formatBlock" data-wysihtml-command-value="h2">Heading 2</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="formatBlock" data-wysihtml-command-value="h3">Heading 3</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="formatBlock" data-wysihtml-command-value="h4">Heading 4</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="formatBlock" data-wysihtml-command-value="h5">Heading 5</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="formatBlock" data-wysihtml-command-value="h6">Heading 6</a></li>
			</ul>`,

		'font-named-sizes':
			`<button title="Font size" id="wysiwyg-font-size" type="button" tabindex="-1" data-wysihtml-command-group="fontSize" class="btn btn-light dropdown-toggle" aria-haspopup="true" aria-expanded="false">
				<span class="fa fa-text-height"></span>
				<span class="current-font-named-size">Normal</span>
			</button>
			<ul class="dropdown-menu" aria-labelledby="wysiwyg-font-size" style="display: none;">
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-blank-value="true">Normal</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="smaller">smaller</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="larger">larger</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="small">small</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="x-small">x-small</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="xx-small">xx-small</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="medium">medium</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="large">large</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="x-large">x-large</a></li>
				<li><a class="dropdown-item" data-wysihtml-command="fontSize" data-wysihtml-command-value="xx-large">xx-large</a></li>
			</ul>`,

		'font-names':
			`<div class="btn-group">
				<div>
					<button title="Fonts" id="wysiwyg-font-name" type="button" tabindex="-1" data-wysihtml-command-group="fontNameStyle" class="btn btn-light dropdown-toggle" aria-haspopup="true" aria-expanded="false">
						<span class="current-font-name">Font...</span>
					</button>
					<ul class="dropdown-menu" aria-labelledby="wysiwyg-font-name" style="display: none;">
						<li><a class="sr-only" data-wysihtml-command="fontNameStyle" data-wysihtml-command-blank-value="true">Font...</a></li>
					</ul>
				</div>
			</div>`,

		'font-fixed-sizes':
			`<div class="btn-group">
				<div>
					<input title="Font size" type="text" list="wysihtml-size-list" class="wysihtml-size-input form-control form-control-sm value="10.5">
					<datalist id="wysihtml-size-list">
						<option value="8">
						<option value="9">
						<option value="10">
						<option value="11">
						<option value="12">
						<option value="14">
						<option value="16">
						<option value="18">
						<option value="20">
						<option value="22">
						<option value="24">
						<option value="26">
						<option value="28">
						<option value="36">
						<option value="48">
						<option value="72">
					</datalist>
				</div>
			</div>`,

		'code':
			`<a title="Add a piece of computer code" class="btn btn-light" data-wysihtml-command="formatCode" data-wysihtml-command-value="language-html"><span class="fa fa-code"></span></a>`,

		'table':
			`<button title="Create table" id="wysiwyg-create-table" style="padding: 4px 6px 4px 6px" type="button" data-wysihtml-command-group="createTable" class="btn btn-light" tabindex="-1" aria-haspopup="true" aria-expanded="false">
				<span style="display: inline-table; margin: 0; padding: 0; height: 20px;">
					<span style="display: table-row; margin: 0; padding: 0;">
						<span class="fa fa-table" style="display: table-cell; color: black;"></span>
						<b style="display: table-cell; vertical-align: middle; float:right; margin: 0 0 0 6px; padding-bottom: 2px;" class="caret"></b>
					</span>
				</span>
			</button>
			<div class="dropdown-menu wysihtml-table popover bottom" role="list" aria-label="Table">
				<div class="arrow"></div>
				<div class="wysihtml-dimension-picker">
					<div class="wysihtml-dimension-picker-mousecatcher" data-cols="1" data-rows="1"></div>
					<div class="wysihtml-dimension-picker-highlighted"></div>  
					<div class="wysihtml-dimension-picker-unhighlighted"></div>
				</div>
				<div class="wysihtml-dimension-display">1 x 1</div>
			</div>`,

		'undo':
			`<div class="btn-group">
				<a title="Undo" class="btn btn-light" data-wysihtml-command="undo"><span class="fa fa-undo"></span></a>
				<a title="Redo" class="btn btn-light" data-wysihtml-command="redo"><span class="fa fa-redo"></span></a>
			</div>`,

		'fullscreen':
			`<a title="Full screen" class="btn btn-light" data-wysihtml-command="fullscreen"><span class="fa fa-expand"></span></a>`,

		'html':
			`<a title="HTML view" class="btn btn-light" data-wysihtml-action="change_view"><span class="fa fa-chevron-left"></span><span class="fa fa-chevron-right"></span></a>`
	};

	var dialogs = {
		'createLink':
			`<div class="row" data-wysihtml-dialog="createLink" style="display: none;">
				<label class="col-form-label">
					<span>Link:</span>
					<input type="url" class="form-control form-control-sm" data-wysihtml-dialog-field="href" value="http://">
				</label>
				<label class="col-form-label">
					<span>Open in:</span>
					<select class="form-control form-control-sm" data-wysihtml-dialog-field="target">
						<option value="">the same window</option>
						<option value="_blank">a new window</option>
					</select>
				</label>
				<label class="col-form-label">
					<span>Title:</span>
					<input class="form-control form-control-sm" data-wysihtml-dialog-field="title" value="">
				</label>
				<a class="btn btn-primary btn-sm" tabindex="0" data-wysihtml-dialog-action="save">OK</a>&nbsp;<a class="btn btn-secondary btn-sm" tabindex="0" data-wysihtml-dialog-action="cancel">Cancel</a>
				<div class="alert" role="alert" style="display: none;"></div>
				</div>`,

		'insertImage':
			`<div class="row" data-wysihtml-dialog="insertImage" style="display: none;">
				<label class="col-form-label">
					<span>Local ?</span>
					<input type="checkbox" class="form-control form-control-sm" data-wysihtml-dialog-field="data-local" style="display: inline; margin-top: -1px" value="false">
				</label>
				<label class="col-form-label">
					<span>Image:</span>
					<span class="local-image-name form-control btn btn-light form-control-sm" tabindex="0"></span>
					<input type="text" class="form-control form-control-sm" data-wysihtml-dialog-field="src" value="http://">
				</label>
				<label class="col-form-label">
					<span>Alignment:</span>
					<select class="form-control form-control-sm" data-wysihtml-dialog-field="className">
						<option value="">default</option>
						<option value="wysiwyg-float-left">left</option>
						<option value="wysiwyg-float-right">right</option>
					</select>
				</label>
				<label class="col-form-label">
					<span>Alt:</span>
					<input class="form-control form-control-sm" data-wysihtml-dialog-field="alt" value="">
				</label>
				<a class="btn btn-primary btn-sm" tabindex="0" data-wysihtml-dialog-action="save">OK</a>&nbsp;<a class="btn btn-secondary btn-sm" tabindex="0" data-wysihtml-dialog-action="cancel">Cancel</a>
				<div class="alert" role="alert" style="display: none;"></div>
			</div>`,

		'tableTools':
			`<div class="popover data-wysihtml-hiddentools" data-placement="top" style="display: none;">
				<div class="arrow"></div>
				<ul data-wysihtml-hiddentools="table" style="display: none;">
					<li><a title="Table properties" data-wysihtml-extra-command="tableProperties"><span class="wysicon wysicon-table-properties"></span></a></li>
					<li><a title="Insert a row before" data-wysihtml-command="addTableCells" data-wysihtml-command-value="above"><span class="wysicon wysicon-row-before"></span></a></li>
					<li><a title="Add a row after" data-wysihtml-command="addTableCells" data-wysihtml-command-value="below"><span class="wysicon wysicon-row-after"></span></a></li>
					<li><a title="Insert a column before" data-wysihtml-command="addTableCells" data-wysihtml-command-value="before"><span class="wysicon wysicon-column-before"></span></a></li>
					<li><a title="Add a column after" data-wysihtml-command="addTableCells" data-wysihtml-command-value="after"><span class="wysicon wysicon-column-after"></span></a></li>
					<li><a title="Merge table cells" data-wysihtml-command="mergeTableCells"><span class="wysicon wysicon-merge-cells"></span></a></li>
					<li><a title="Delete the selected row" data-wysihtml-command="deleteTableCells" data-wysihtml-command-value="row"><span class="wysicon wysicon-delete-row"></span></a></li>
					<li><a title="Delete the selected column" data-wysihtml-command="deleteTableCells" data-wysihtml-command-value="column"><span class="wysicon wysicon-delete-column"></span></a></li>
					<li><a title="Delete this table" data-wysihtml-extra-command="deleteTable"><span class="wysicon wysicon-delete-table"></span></a></li>
				</ul>
			</div>`,

		'tableProperties':
			`<div class="row" data-wysihtml-dialog="tableProperties" style="display: none;">
				<label class="col-form-label">
					<span>Caption</span>
					<input name="caption" type="checkbox" class="form-control form-control-sm">
				</label>
				<label class="col-form-label">
					<span>Header</span>
					<input name="thead" type="checkbox" class="form-control form-control-sm">
				</label>
				<label class="col-form-label">
					<span>Full width</span>
					<input name="full-width" type="checkbox" class="form-control form-control-sm">
				</label>
				<label class="col-form-label">
					<span>Alignment</span>
					<select name="align" class="form-control form-control-sm">
						<option value=''>None</option>
						<option value='left'>Left</option>
						<option value='center'>Center</option>
						<option value='right'>Right</option>
					</select>
				</label>
			</div>`,

		'modalDialog':
			`<div class="modal" data-wysihtml-dialog="modalDialog" tabindex="-1" role="dialog" aria-labelledby="wysihtml-modal-title" aria-hidden="true">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<h4 id="wysihtml-modal-title" class="modal-title">TITLE</h4>
							<button type="button" class="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<div class="body-content"></div>
							<div class="alert" role="alert" style="display: none;"></div>
						</div>
						<div class="modal-footer">
							<button class="btn btn-secondary modal-cancel" data-dismiss="modal" aria-hidden="true">Cancel</button>
							<button class="btn btn-primary modal-ok">OK</button>
						</div>
					</div>
				</div>
			</div>`

	};

	var wysihtmlEditorStyles = `
		.wysiwyg-color-indianred { color: indianred; }
		.wysiwyg-color-lightcoral { color: lightcoral; }
		.wysiwyg-color-salmon { color: salmon; }
		.wysiwyg-color-darksalmon { color: darksalmon; }
		.wysiwyg-color-lightsalmon { color: lightsalmon; }
		.wysiwyg-color-crimson { color: crimson; }
		.wysiwyg-color-red { color: red; }
		.wysiwyg-color-firebrick { color: firebrick; }
		.wysiwyg-color-darkred { color: darkred; }
		.wysiwyg-color-pink { color: pink; }
		.wysiwyg-color-lightpink { color: lightpink; }
		.wysiwyg-color-hotpink { color: hotpink; }
		.wysiwyg-color-deeppink { color: deeppink; }
		.wysiwyg-color-mediumvioletred { color: mediumvioletred; }
		.wysiwyg-color-palevioletred { color: palevioletred; }
		.wysiwyg-color-coral { color: coral; }
		.wysiwyg-color-tomato { color: tomato; }
		.wysiwyg-color-orangered { color: orangered; }
		.wysiwyg-color-darkorange { color: darkorange; }
		.wysiwyg-color-orange { color: orange; }
		.wysiwyg-color-gold { color: gold; }
		.wysiwyg-color-yellow { color: yellow; }
		.wysiwyg-color-lightyellow { color: lightyellow; }
		.wysiwyg-color-lemonchiffon { color: lemonchiffon; }
		.wysiwyg-color-lightgoldenrodyellow { color: lightgoldenrodyellow; }
		.wysiwyg-color-papayawhip { color: papayawhip; }
		.wysiwyg-color-moccasin { color: moccasin; }
		.wysiwyg-color-peachpuff { color: peachpuff; }
		.wysiwyg-color-palegoldenrod { color: palegoldenrod; }
		.wysiwyg-color-khaki { color: khaki; }
		.wysiwyg-color-darkkhaki { color: darkkhaki; }
		.wysiwyg-color-lavender { color: lavender; }
		.wysiwyg-color-thistle { color: thistle; }
		.wysiwyg-color-plum { color: plum; }
		.wysiwyg-color-violet { color: violet; }
		.wysiwyg-color-orchid { color: orchid; }
		.wysiwyg-color-fuchsia { color: fuchsia; }
		.wysiwyg-color-mediumorchid { color: mediumorchid; }
		.wysiwyg-color-mediumpurple { color: mediumpurple; }
		.wysiwyg-color-amethyst { color: amethyst; }
		.wysiwyg-color-rebeccapurple { color: rebeccapurple; }
		.wysiwyg-color-blueviolet { color: blueviolet; }
		.wysiwyg-color-darkviolet { color: darkviolet; }
		.wysiwyg-color-darkorchid { color: darkorchid; }
		.wysiwyg-color-darkmagenta{ color: darkmagenta; }
		.wysiwyg-color-purple { color: purple; }
		.wysiwyg-color-indigo { color: indigo; }
		.wysiwyg-color-slateblue { color: slateblue; }
		.wysiwyg-color-darkslateblue { color: darkslateblue; }
		.wysiwyg-color-mediumslateblue { color: mediumslateblue; }
		.wysiwyg-color-greenyellow { color: greenyellow; }
		.wysiwyg-color-chartreuse { color: chartreuse; }
		.wysiwyg-color-lawngreen { color: lawngreen; }
		.wysiwyg-color-lime { color: lime; }
		.wysiwyg-color-limegreen { color: limegreen; }
		.wysiwyg-color-palegreen { color: palegreen; }
		.wysiwyg-color-lightgreen { color: lightgreen; }
		.wysiwyg-color-mediumspringgreen { color: mediumspringgreen; }
		.wysiwyg-color-springgreen { color: springgreen; }
		.wysiwyg-color-mediumseagreen { color: mediumseagreen; }
		.wysiwyg-color-seagreen { color: seagreen; }
		.wysiwyg-color-forestgreen { color: forestgreen; }
		.wysiwyg-color-green { color: green; }
		.wysiwyg-color-darkgreen { color: darkgreen; }
		.wysiwyg-color-yellowgreen { color: yellowgreen; }
		.wysiwyg-color-olivedrab { color: olivedrab; }
		.wysiwyg-color-olive { color: olive; }
		.wysiwyg-color-darkolivegreen { color: darkolivegreen; }
		.wysiwyg-color-mediumaquamarine { color: mediumaquamarine; }
		.wysiwyg-color-darkseagreen { color: darkseagreen; }
		.wysiwyg-color-lightseagreen { color: lightseagreen; }
		.wysiwyg-color-darkcyan { color: darkcyan; }
		.wysiwyg-color-teal { color: teal; }
		.wysiwyg-color-aqua { color: aqua; }
		.wysiwyg-color-lightcyan { color: lightcyan; }
		.wysiwyg-color-paleturquoise { color: paleturquoise; }
		.wysiwyg-color-aquamarine { color: aquamarine; }
		.wysiwyg-color-turquoise { color: turquoise; }
		.wysiwyg-color-mediumturquoise { color: mediumturquoise; }
		.wysiwyg-color-darkturquoise { color: darkturquoise; }
		.wysiwyg-color-cadetblue { color: cadetblue; }
		.wysiwyg-color-steelblue { color: steelblue; }
		.wysiwyg-color-lightsteelblue { color: lightsteelblue; }
		.wysiwyg-color-powderblue { color: powderblue; }
		.wysiwyg-color-lightblue { color: lightblue; }
		.wysiwyg-color-skyblue { color: skyblue; }
		.wysiwyg-color-lightskyblue { color: lightskyblue; }
		.wysiwyg-color-deepskyblue { color: deepskyblue; }
		.wysiwyg-color-dodgerblue { color: dodgerblue; }
		.wysiwyg-color-cornflowerblue { color: cornflowerblue; }
		.wysiwyg-color-royalblue { color: royalblue; }
		.wysiwyg-color-blue { color: blue; }
		.wysiwyg-color-mediumblue { color: mediumblue; }
		.wysiwyg-color-darkblue { color: darkblue; }
		.wysiwyg-color-navy { color: navy; }
		.wysiwyg-color-midnightblue { color: midnightblue; }
		.wysiwyg-color-cornsilk { color: cornsilk; }
		.wysiwyg-color-blanchedalmond { color: blanchedalmond; }
		.wysiwyg-color-bisque { color: bisque; }
		.wysiwyg-color-navajowhite { color: navajowhite; }
		.wysiwyg-color-wheat { color: wheat; }
		.wysiwyg-color-burlywood { color: burlywood; }
		.wysiwyg-color-tan { color: tan; }
		.wysiwyg-color-rosybrown { color: rosybrown; }
		.wysiwyg-color-sandybrown { color: sandybrown; }
		.wysiwyg-color-goldenrod { color: goldenrod; }
		.wysiwyg-color-darkgoldenrod { color: darkgoldenrod; }
		.wysiwyg-color-peru { color: peru; }
		.wysiwyg-color-chocolate { color: chocolate; }
		.wysiwyg-color-saddlebrown { color: saddlebrown; }
		.wysiwyg-color-sienna { color: sienna; }
		.wysiwyg-color-brown { color: brown; }
		.wysiwyg-color-maroon { color: maroon; }
		.wysiwyg-color-white { color: white; }
		.wysiwyg-color-snow { color: snow; }
		.wysiwyg-color-honeydew { color: honeydew; }
		.wysiwyg-color-mintcream { color: mintcream; }
		.wysiwyg-color-azure { color: azure; }
		.wysiwyg-color-aliceblue { color: aliceblue; }
		.wysiwyg-color-ghostwhite { color: ghostwhite; }
		.wysiwyg-color-whitesmoke { color: whitesmoke; }
		.wysiwyg-color-seashell { color: seashell; }
		.wysiwyg-color-beige { color: beige; }
		.wysiwyg-color-oldlace { color: oldlace; }
		.wysiwyg-color-floralwhite { color: floralwhite; }
		.wysiwyg-color-ivory { color: ivory; }
		.wysiwyg-color-antiquewhite { color: antiquewhite; }
		.wysiwyg-color-linen { color: linen; }
		.wysiwyg-color-lavenderblush { color: lavenderblush; }
		.wysiwyg-color-mistyrose { color: mistyrose; }
		.wysiwyg-color-gainsboro { color: gainsboro; }
		.wysiwyg-color-lightgrey { color: lightgrey; }
		.wysiwyg-color-silver { color: silver; }
		.wysiwyg-color-darkgray { color: darkgray; }
		.wysiwyg-color-gray { color: gray; }
		.wysiwyg-color-dimgray { color: dimgray; }
		.wysiwyg-color-lightslategray { color: lightslategray; }
		.wysiwyg-color-slategray { color: slategray; }
		.wysiwyg-color-darkslategray { color: darkslategray; }
		.wysiwyg-color-black { color: black; }
		.wysiwyg-hilite-color-indianred { background-color: indianred; }
		.wysiwyg-hilite-color-lightcoral { background-color: lightcoral; }
		.wysiwyg-hilite-color-salmon { background-color: salmon; }
		.wysiwyg-hilite-color-darksalmon { background-color: darksalmon; }
		.wysiwyg-hilite-color-lightsalmon { background-color: lightsalmon; }
		.wysiwyg-hilite-color-crimson { background-color: crimson; }
		.wysiwyg-hilite-color-red { background-color: red; }
		.wysiwyg-hilite-color-firebrick { background-color: firebrick; }
		.wysiwyg-hilite-color-darkred { background-color: darkred; }
		.wysiwyg-hilite-color-pink { background-color: pink; }
		.wysiwyg-hilite-color-lightpink { background-color: lightpink; }
		.wysiwyg-hilite-color-hotpink { background-color: hotpink; }
		.wysiwyg-hilite-color-deeppink { background-color: deeppink; }
		.wysiwyg-hilite-color-mediumvioletred { background-color: mediumvioletred; }
		.wysiwyg-hilite-color-palevioletred { background-color: palevioletred; }
		.wysiwyg-hilite-color-coral { background-color: coral; }
		.wysiwyg-hilite-color-tomato { background-color: tomato; }
		.wysiwyg-hilite-color-orangered { background-color: orangered; }
		.wysiwyg-hilite-color-darkorange { background-color: darkorange; }
		.wysiwyg-hilite-color-orange { background-color: orange; }
		.wysiwyg-hilite-color-gold { background-color: gold; }
		.wysiwyg-hilite-color-yellow { background-color: yellow; }
		.wysiwyg-hilite-color-lightyellow { background-color: lightyellow; }
		.wysiwyg-hilite-color-lemonchiffon { background-color: lemonchiffon; }
		.wysiwyg-hilite-color-lightgoldenrodyellow { background-color: lightgoldenrodyellow; }
		.wysiwyg-hilite-color-papayawhip { background-color: papayawhip; }
		.wysiwyg-hilite-color-moccasin { background-color: moccasin; }
		.wysiwyg-hilite-color-peachpuff { background-color: peachpuff; }
		.wysiwyg-hilite-color-palegoldenrod { background-color: palegoldenrod; }
		.wysiwyg-hilite-color-khaki { background-color: khaki; }
		.wysiwyg-hilite-color-darkkhaki { background-color: darkkhaki; }
		.wysiwyg-hilite-color-lavender { background-color: lavender; }
		.wysiwyg-hilite-color-thistle { background-color: thistle; }
		.wysiwyg-hilite-color-plum { background-color: plum; }
		.wysiwyg-hilite-color-violet { background-color: violet; }
		.wysiwyg-hilite-color-orchid { background-color: orchid; }
		.wysiwyg-hilite-color-fuchsia { background-color: fuchsia; }
		.wysiwyg-hilite-color-mediumorchid { background-color: mediumorchid; }
		.wysiwyg-hilite-color-mediumpurple { background-color: mediumpurple; }
		.wysiwyg-hilite-color-amethyst { background-color: amethyst; }
		.wysiwyg-hilite-color-blueviolet { background-color: blueviolet; }
		.wysiwyg-hilite-color-darkviolet { background-color: darkviolet; }
		.wysiwyg-hilite-color-darkorchid { background-color: darkorchid; }
		.wysiwyg-hilite-color-darkmagenta{ background-color: darkmagenta; }
		.wysiwyg-hilite-color-purple { background-color: purple; }
		.wysiwyg-hilite-color-indigo { background-color: indigo; }
		.wysiwyg-hilite-color-slateblue { background-color: slateblue; }
		.wysiwyg-hilite-color-darkslateblue { background-color: darkslateblue; }
		.wysiwyg-hilite-color-mediumslateblue { background-color: mediumslateblue; }
		.wysiwyg-hilite-color-greenyellow { background-color: greenyellow; }
		.wysiwyg-hilite-color-chartreuse { background-color: chartreuse; }
		.wysiwyg-hilite-color-lawngreen { background-color: lawngreen; }
		.wysiwyg-hilite-color-lime { background-color: lime; }
		.wysiwyg-hilite-color-limegreen { background-color: limegreen; }
		.wysiwyg-hilite-color-palegreen { background-color: palegreen; }
		.wysiwyg-hilite-color-lightgreen { background-color: lightgreen; }
		.wysiwyg-hilite-color-mediumspringgreen { background-color: mediumspringgreen; }
		.wysiwyg-hilite-color-springgreen { background-color: springgreen; }
		.wysiwyg-hilite-color-mediumseagreen { background-color: mediumseagreen; }
		.wysiwyg-hilite-color-seagreen { background-color: seagreen; }
		.wysiwyg-hilite-color-forestgreen { background-color: forestgreen; }
		.wysiwyg-hilite-color-green { background-color: green; }
		.wysiwyg-hilite-color-darkgreen { background-color: darkgreen; }
		.wysiwyg-hilite-color-yellowgreen { background-color: yellowgreen; }
		.wysiwyg-hilite-color-olivedrab { background-color: olivedrab; }
		.wysiwyg-hilite-color-olive { background-color: olive; }
		.wysiwyg-hilite-color-darkolivegreen { background-color: darkolivegreen; }
		.wysiwyg-hilite-color-mediumaquamarine { background-color: mediumaquamarine; }
		.wysiwyg-hilite-color-darkseagreen { background-color: darkseagreen; }
		.wysiwyg-hilite-color-lightseagreen { background-color: lightseagreen; }
		.wysiwyg-hilite-color-darkcyan { background-color: darkcyan; }
		.wysiwyg-hilite-color-teal { background-color: teal; }
		.wysiwyg-hilite-color-aqua { background-color: aqua; }
		.wysiwyg-hilite-color-lightcyan { background-color: lightcyan; }
		.wysiwyg-hilite-color-paleturquoise { background-color: paleturquoise; }
		.wysiwyg-hilite-color-aquamarine { background-color: aquamarine; }
		.wysiwyg-hilite-color-turquoise { background-color: turquoise; }
		.wysiwyg-hilite-color-mediumturquoise { background-color: mediumturquoise; }
		.wysiwyg-hilite-color-darkturquoise { background-color: darkturquoise; }
		.wysiwyg-hilite-color-cadetblue { background-color: cadetblue; }
		.wysiwyg-hilite-color-steelblue { background-color: steelblue; }
		.wysiwyg-hilite-color-lightsteelblue { background-color: lightsteelblue; }
		.wysiwyg-hilite-color-powderblue { background-color: powderblue; }
		.wysiwyg-hilite-color-lightblue { background-color: lightblue; }
		.wysiwyg-hilite-color-skyblue { background-color: skyblue; }
		.wysiwyg-hilite-color-lightskyblue { background-color: lightskyblue; }
		.wysiwyg-hilite-color-deepskyblue { background-color: deepskyblue; }
		.wysiwyg-hilite-color-dodgerblue { background-color: dodgerblue; }
		.wysiwyg-hilite-color-cornflowerblue { background-color: cornflowerblue; }
		.wysiwyg-hilite-color-royalblue { background-color: royalblue; }
		.wysiwyg-hilite-color-blue { background-color: blue; }
		.wysiwyg-hilite-color-mediumblue { background-color: mediumblue; }
		.wysiwyg-hilite-color-darkblue { background-color: darkblue; }
		.wysiwyg-hilite-color-navy { background-color: navy; }
		.wysiwyg-hilite-color-midnightblue { background-color: midnightblue; }
		.wysiwyg-hilite-color-cornsilk { background-color: cornsilk; }
		.wysiwyg-hilite-color-blanchedalmond { background-color: blanchedalmond; }
		.wysiwyg-hilite-color-bisque { background-color: bisque; }
		.wysiwyg-hilite-color-navajowhite { background-color: navajowhite; }
		.wysiwyg-hilite-color-wheat { background-color: wheat; }
		.wysiwyg-hilite-color-burlywood { background-color: burlywood; }
		.wysiwyg-hilite-color-tan { background-color: tan; }
		.wysiwyg-hilite-color-rosybrown { background-color: rosybrown; }
		.wysiwyg-hilite-color-sandybrown { background-color: sandybrown; }
		.wysiwyg-hilite-color-goldenrod { background-color: goldenrod; }
		.wysiwyg-hilite-color-darkgoldenrod { background-color: darkgoldenrod; }
		.wysiwyg-hilite-color-peru { background-color: peru; }
		.wysiwyg-hilite-color-chocolate { background-color: chocolate; }
		.wysiwyg-hilite-color-saddlebrown { background-color: saddlebrown; }
		.wysiwyg-hilite-color-sienna { background-color: sienna; }
		.wysiwyg-hilite-color-brown { background-color: brown; }
		.wysiwyg-hilite-color-maroon { background-color: maroon; }
		.wysiwyg-hilite-color-white { background-color: white; }
		.wysiwyg-hilite-color-snow { background-color: snow; }
		.wysiwyg-hilite-color-honeydew { background-color: honeydew; }
		.wysiwyg-hilite-color-mintcream { background-color: mintcream; }
		.wysiwyg-hilite-color-azure { background-color: azure; }
		.wysiwyg-hilite-color-aliceblue { background-color: aliceblue; }
		.wysiwyg-hilite-color-ghostwhite { background-color: ghostwhite; }
		.wysiwyg-hilite-color-whitesmoke { background-color: whitesmoke; }
		.wysiwyg-hilite-color-seashell { background-color: seashell; }
		.wysiwyg-hilite-color-beige { background-color: beige; }
		.wysiwyg-hilite-color-oldlace { background-color: oldlace; }
		.wysiwyg-hilite-color-floralwhite { background-color: floralwhite; }
		.wysiwyg-hilite-color-ivory { background-color: ivory; }
		.wysiwyg-hilite-color-antiquewhite { background-color: antiquewhite; }
		.wysiwyg-hilite-color-linen { background-color: linen; }
		.wysiwyg-hilite-color-lavenderblush { background-color: lavenderblush; }
		.wysiwyg-hilite-color-mistyrose { background-color: mistyrose; }
		.wysiwyg-hilite-color-gainsboro { background-color: gainsboro; }
		.wysiwyg-hilite-color-lightgrey { background-color: lightgrey; }
		.wysiwyg-hilite-color-silver { background-color: silver; }
		.wysiwyg-hilite-color-darkgray { background-color: darkgray; }
		.wysiwyg-hilite-color-gray { background-color: gray; }
		.wysiwyg-hilite-color-dimgray { background-color: dimgray; }
		.wysiwyg-hilite-color-lightslategray { background-color: lightslategray; }
		.wysiwyg-hilite-color-slategray { background-color: slategray; }
		.wysiwyg-hilite-color-darkslategray { background-color: darkslategray; }
		.wysiwyg-hilite-color-black { background-color: black; }

		.wysiwig-font-name-couriernew { font-family: "Courier New", monospace; }
		.wysiwig-font-name-arial { font-family: "Arial", sans-serif; }
		.wysiwig-font-name-bookman { font-family: "Bookman", serif; }
		.wysiwig-font-name-comicsansms { font-family: "Comic Sans MS", cursive; }
		.wysiwig-font-name-garamond { font-family: "Garamond", serif; }
		.wysiwig-font-name-georgia { font-family: "Georgia", serif; }
		.wysiwig-font-name-helvetica { font-family: "Helvetica", sans-serif; }
		.wysiwig-font-name-impact { font-family: "Impact", fantasy; }
		.wysiwig-font-name-palatino { font-family: "Palatino", serif; }
		.wysiwig-font-name-timesnewroman { font-family: "Times New Roman", serif; }
		.wysiwig-font-name-trebuchetms { font-family: "Trebuchet MS", sans-serif; }
		.wysiwig-font-name-verdana { font-family: "Verdana", sans-serif; }

		.wysiwyg-font-size-smaller { font-size: smaller; }
		.wysiwyg-font-size-larger { font-size: larger; }
		.wysiwyg-font-size-xx-large { font-size: xx-large; }
		.wysiwyg-font-size-x-large { font-size: x-large; }
		.wysiwyg-font-size-large { font-size: large; }
		.wysiwyg-font-size-medium { font-size: medium; }
		.wysiwyg-font-size-small { font-size: small; }
		.wysiwyg-font-size-x-small { font-size: x-small; }
		.wysiwyg-font-size-xx-small { font-size: xx-small; }

		.wysiwyg-text-align-right { text-align: right; }
		.wysiwyg-text-align-center { text-align: center; }
		.wysiwyg-text-align-left { text-align: left; }
		.wysiwyg-text-align-justify { text-align: justify; }
		.wysiwyg-float-left { float: left; margin: 0 8px 8px 0; }
		.wysiwyg-float-right { float: right; margin: 0 0 8px 8px; }
		.wysiwyg-clear-right { clear: right; }
		.wysiwyg-clear-left { clear: left; }
		.wysihtml-editor table caption {min-height: 1em;background: #eee;font-weight: bold; }
		.wysihtml-editor table thead th { background: #ddd; }
		.wysihtml-editor table th, .wysihtml-editor table td, .wysihtml-editor table caption { outline: 1px dotted #abc;min-width: 5em;min-height: 1em;}
		.wysihtml-editor table th.wysiwyg-tmp-selected-cell, .wysihtml-editor table td.wysiwyg-tmp-selected-cell {	outline: 2px solid green;}

		a[target="_blank"]:after { content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAGYktHRAD/AP8A/6C9p5MAAAAHdElNRQfiBB0VEhso1+EPAAAAHWlUWHRDb21tZW50AAAAAABDcmVhdGVkIHdpdGggR0lNUGQuZQcAAACzSURBVChTjY9BCsJADEV/xlZFulGh7b4LryNeSvBEvYFXEXVmoMthNGZSlVa68MHPZD5JSGDtkwE70vkcuGm8qvccE2Z35rjFFEROYhRlMOr8gdk12TsdQ3SRGBBCiaKQwviQFX4gukqcg7lGngNdt0625SHATQ+QxVX7Q6c+9eYmdSip1Binb4IoSl5OHzNs/GAWKxk6gL7fNCOpH21Ox6Us7FRV5VGWHnXtpYFVbZumAy/r82LbZKakwAAAAABJRU5ErkJggg=="); }
		`;

	var insertEditorStyles = function(self) {
		var head = self.iframe.contents().find("head");
		var style = head.find("style");
		if (style.length == 0) {
			style = $('<style>', { type: 'text/css' });
			head.append(style);
		}
		style.append(wysihtmlEditorStyles);
	}

	// private functions
	var makeColorsTool = function(self, command, base, title) {
		command = command || 'foreColor';
		self.palette.setBase(base);
		var style = /Style$/.test(command);
		var colors = self.palette.getColors(), ncols, n = 0;
		var li = $('<li>', {
			'class': 'color-picker dropdown',
			'tabindex': '0'
		});
		if (self.palette.isBase()) {
			li.attr('data-wysihtml-template', 'hilite');
			li.append($(toolbar.hilite));
			ncols = 4;
		} else {
			li.attr('data-wysihtml-template', 'color');
			li.append($(toolbar.color));
			ncols = 20;
		}
		li.find('button').attr('title', title).attr('data-wysihtml-command-group', command);
		if (/^(hiliteColor|bgColor)/.test(command)) {
			li.attr('data-wysihtml-option', 'hilite');
			li.find('button span.fa-font').attr('class', 'fa fa-font');
		} else {
			li.attr('data-wysihtml-option', 'color');
		}
		var nrows = colors.length / ncols;
		var lastrow = li.find('tbody tr:last-child');
		for (var r = 0; r < nrows; r++) {
			var tr = $('<tr>');
			for (var c = 0; c < ncols; c++) {
				var td = $('<td>');
				var a = $('<a>', {
					'data-wysihtml-command': command,
				});
				var color = colors[n++];
				if (color) {
					var name = style ? self.palette.nameToHex(color[0]) : color[0];
					a.attr('data-wysihtml-command-value', name);
					td.attr('title', self.options.translate(color[1]));
					td.css( { 'background': name, 'border': '1px solid #444' } );
				} else {
					a.attr('data-wysihtml-command-blank-value', 'true');
					td.attr('title', self.options.translate('no color'));
					td.addClass('wysihtml-background-transparent');
					td.css( { 'border': '1px solid #444' } );
				}
				a.append('&nbsp;');
				td.append(a);
				tr.append(td);
			}
			lastrow.before(tr);
		}
		lastrow.find('a[data-wysihtml-command]').attr('data-wysihtml-command', command);
		return li;
	}

	var makeToolCreateTable = function(self, container) {
		var option = getOption('table');
		if (self.options.toolbar[option]) {
			var li = $('<li>', {
				'class': 'create-table dropdown',
				'tabindex': '0',
				'data-wysihtml-template': 'table',
				'data-wysihtml-option': 'table'
			});
			li.append($(toolbar['table']));
			li.find('button').attr('data-wysihtml-command-group', 'createTable');
			li.find('.wysihtml-dimension-picker-mousecatcher').css({
				width: self.options.createTableMaxSize.col + 'em',
				height: self.options.createTableMaxSize.row + 'em'
			});
			li.find('.wysihtml-dimension-picker-unhighlighted').css({
				width: self.options.createTableMaxSize.col + 'em'
			});
			container.append(li);
		}
	}

	var makeFontsTool = function(self, command) {
		command = command || 'fontName';
		var fonts = self.fonts.getFonts();
		var li = $('<li>', {
			'class': 'font-names',
			'tabindex': '0',
			'data-wysihtml-template': 'font-names',
			'data-wysihtml-option': 'font-names'
		});
		li.append($(toolbar['font-names']));
		li.find('button').attr('data-wysihtml-command-group', command);
		var menu = li.find('ul.dropdown-menu');
		var a = $('<a>', {
			'class': 'dropdown-item',
			'data-wysihtml-command': command,
			'data-wysihtml-command-blank-value': 'true',
			'text':  self.options.translate('Current font')
		});
		var item = $('<li>');
		item.append(a);
		menu.append(item);
		$.each(fonts, function(f, font) {
			var name = font[0];
			var item = $('<li>');
			var a = $('<a>', {
				'class': 'dropdown-item',
				'data-wysihtml-command': command,
				'data-wysihtml-command-value': name
			});
			a.append(self.fonts.getLabel(name));
			item.append(a);
			menu.append(item);
		});
		return li;
	}

	var checkUrl = function(url) {
		var expression = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
		var regexp = new RegExp(expression);
		return regexp.test(url);
	}

	var checkImgSrc = function(url) {
		if (/^data:image\//.test(url)) {
			return true;
		}
		return checkUrl(url);
	}

	var UNITS_REGEX = /(\d*\.?\d+)\s?(px|em|rem|ex|%|in|cm|mm|pt|pc+)/i;

	var convertToPt = function(value, decimals) {
		if (typeof decimals == 'undefined') decimals = 2;
		var res = UNITS_REGEX.exec($.trim(value));
		if (! res) {
			return value;
		} else {
			var val = res[1];
			var unit = res[2] || 'px';
			var formulas = {
					'px' : val * 72 / 96,
					'em' : val * 11.955168,
					'%'  : val * 12 / 100,
					'in' : val / 0.014842519685,
					'cm' : val * 28.3464566929,
					'mm' : val / 0.352777777778,
					'pc' : val / 0.0836458341698,
					'rem': val / 0.0836458341698
				};
			var result = formulas[unit];
			if (isNaN(result)) {
				return value;
			} else {
				result = Math.ceil(result * Math.pow(10, decimals)) / Math.pow(10, decimals);
				return result + 'pt'
			}
		}
	}

	var addMoreShortcuts = function(editor, el, shortcuts) {
		wysihtml.dom.observe(el, 'keydown', function(event) {
			var keyCode  = event.keyCode,
			command  = shortcuts[keyCode];
			if ((event.ctrlKey || event.metaKey || event.altKey) &&
				command && wysihtml.commands[command]) {
				var commandObj = editor.toolbar.commandMapping[command + ':null'];
				if (commandObj && commandObj.dialog && !commandObj.state) {
					commandObj.dialog.show();
				} else {
					wysihtml.commands[command].exec(editor.composer, command);
				}
				event.preventDefault();
			}
		});
	  }

	BootStrapWysiHtml.DEFAULTS = {
		toolbar: {
			'locale': 'en',
			'blocks': true,
			'font-names': true,
			'font-fixed-sizes': true,
			'font-named-sizes': true,
			'color': true,
			'hilite': true,
			'emphasis': true,
			'lists': true,
			'align': true,
			'link': true,
			'image': true,
			'code': true,
			'table': true,
			'undo': true,
			'fullscreen': true,
			'html': true
		},
		customTemplates: {},
		customDialogs: {},
		shortcuts: {
		   '83': 'small' // S
		},
		stylesheets: [],
		parserRules: {},
		events: {
			'change': function(e) {
			},
			"beforeload": function() { 
			}
		},
		translate: function(term, locale) {
			return term; // no translation
		},
		name: true,
		showToolbarAfterInit: true,
		showToolbarDialogsOnSelection: false,
		autoLink: true,
		handleTabKey: true,
		handleTables: true,
		tableToolsOffset: {
			top: 0,
			left: 0
		},
		createTableMaxSize: {
			col: 10,
			row: 10
		},
		pasteParserRulesets: null,
		copyedFromMarking: '<meta name="copied-from" content="wysihtml">',
		// parser: wysihtml5.dom.parse,
		classNames: {
			// Class name which should be set on the contentEditable element in the created sandbox iframe, can be styled via the 'stylesheets' option
			composer: "wysihtml-editor",
			// Class name to add to the body when the wysihtml5 editor is supported
			body: "wysihtml-supported",
			// classname added to editable area element (iframe/div) on creation
			sandbox: "wysihtml-sandbox",
			// class on editable area with placeholder
			placeholder: "wysihtml-placeholder",
			// Classname of container that editor should not touch and pass through. Pass false to disable 
			uneditableContainer: "wysihtml-uneditable-container"
		},
		cleanUp: true,
		useLineBreaks: true,
		placeholderText: undefined,
	}

	var getOption = function(tools) {
		if ($.type(tools) === 'string') { 
			return tools;
		} else {
			return tools.attr('data-wysihtml-option');
		}
	}

	var getTemplate = function(tools) {
		if ($.type(tools) === 'string') { 
			return tools;
		} else {
			return tools.attr('data-wysihtml-template');
		}
	}

	var getTemplateObj = function(template) {
		if ($.type(template) === 'string') { 
			var templateObj = $('<li>', {
				'class': template,
				'data-wysihtml-template': template,
				'data-wysihtml-option': template
			});
			templateObj.append("\n\t\t\t");
			templateObj.append(toolbar[template]);
			return templateObj;
		} else {
			return template;
		}
	}

	var makeToolCommands = function(self, tools, container) {
		var template = getTemplate(tools);
		var option = getOption(tools);
		if (self.options.toolbar[option]) {
			var li = getTemplateObj(tools);
			var commands = li.find('a[data-wysihtml-command], a[data-wysihtml-action]');
			commands.attr('tabindex', '0');
			var ncommands = commands.length;
			if ($.isArray(self.options.toolbar[option])) {
				commands.each(function(c) {
					var command = $(this).attr('data-wysihtml-command') || $(this).attr('data-wysihtml-action');
					command = command.replace(/Style$/, '');
					if ($.inArray(command, self.options.toolbar[option]) < 0) {
						$(this).remove();
						ncommands--;
					}
				});
			}
			if (ncommands > 0) {
				container.append(li);
			}
		}
	}

	var makeToolDropdownCommands = function(self, tools, container) {
		var template = getTemplate(tools);
		var option = getOption(tools);
		if (self.options.toolbar[option]) {
			var li = getTemplateObj(tools);
			li.attr('tabindex', '0');
			li.addClass('dropdown');
			var values = li.find('a[data-wysihtml-command-value]');
			var nvalues = values.length;
			if ($.isArray(self.options.toolbar[option])) {
				values.each(function(v) {
					var value = $(this).attr('data-wysihtml-command-value');
					if ($.inArray(value, self.options.toolbar[option]) < 0) {
						$(this).parent().remove();
						nvalues--;
					}
				});
			}
			if (nvalues > 0) {
				container.append("\n\t\t\t\t");
				container.append(li);
				li.find('button[id]').each(function() {
					var id = $(this).attr('id');
					$(this).attr('id', id + self.identificationNumber);
					li.find('[aria-labelledby=' + id + ']').attr('aria-labelledby', id + self.identificationNumber);
				});
			}
		}
	}

	var makeToolCustom = function(self, tools, container) {
		var template = getTemplate(tools);
		var option = getOption(tools);
		if (self.options.toolbar[option]) {
			var li = getTemplateObj(tools);
			li.addClass('custom');
			container.append(li);
		}
	}

	var makeToolDropdownCustom = function(self, tools, container) {
		var template = getTemplate(tools);
		var option = getOption(tools);
		if (self.options.toolbar[option]) {
			var li = getTemplateObj(tools);
			li.attr('tabindex', '0');
			li.addClass('custom');
			li.addClass('dropdown');
			container.append(li);
		}
	}

	var translate = function(self) {
		if (self.options.translate) {
			self.toolbar.find('a, button span').each(function() {
				var title = $(this).attr('title');
				if (title) {
					$(this).attr('title', self.options.translate(title));
				}
				var text = $.trim($(this).text());
				if (text) {
					$(this).text(self.options.translate(text));
				}
			});
			self.toolbar.find('button').each(function() {
				var title = $(this).attr('title');
				if (title) {
					$(this).attr('title', self.options.translate(title));
				}
			});
			self.toolbar.find('label.col-form-label > span').each(function() {
				var label = $(this).text();
				$(this).text(self.options.translate(label));
			});
			self.toolbar.find('select > option').each(function() {
				var option = $(this).text();
				$(this).text(self.options.translate(option));
			});
			self.modal.find('button.close').attr('aria-label', self.options.translate('Close'));
			self.modal.find('button.modal-cancel').text(self.options.translate('Cancel'));
			self.modal.find('button.modal-ok').text(self.options.translate('OK'));
		}
	}

	var getElementPosition = function(self, element) {
		var rect = element[0].getBoundingClientRect(); 
		var scroll = {
			left: self.iframe[0].offsetLeft + self.iframe[0].scrollLeft,
			top: self.iframe[0].offsetTop + self.iframe[0].scrollTop
		};
		return {
			left: rect.left + scroll.left,
			top: rect.top + scroll.top,
			width: rect.right - rect.left,
			height: rect.bottom - rect.top
		};
	}

	var getTableToolsPlacement = function(self) {
		if (self.tableTools.hasClass('right')) {
			return 'right';
		} else if (self.tableTools.hasClass('bottom')) { 
			return 'bottom';
		} else if (self.tableTools.hasClass('left')) { 
			return 'left';
		} else { 
			return 'top';
		}
		
	}

	var replaceTableTools = function(self) {
		var table = self.tableTools.data('table');
		var cell = self.tableTools.data('cell');
		if (! (cell && cell.visible(true, self.editable))) {
			self.tableTools.hide();
		} else {
			if (self.tableTools.is(':hidden') && cell.hasClass('wysiwyg-tmp-selected-cell')) {
				self.tableTools.find('ul[data-wysihtml-hiddentools]').show();
				self.tableTools.show();
			}
			var tool = self.tableTools.find('li');
			var ntools = self.tableTools.find('a:visible').length;
			var pos = {
				cell: getElementPosition(self, cell),
				tool: {
					width: tool.outerWidth(true),
					height: tool.outerHeight(true)
				},
				tableTools: {
					width: self.tableTools.width(),
					height: self.tableTools.height()
				},
				win : {
					width: self.editable.width(),
					height: self.editable.height()
				}
			};
			var placement = getTableToolsPlacement(self);
			if (placement == 'left' && pos.cell.left - pos.tool.width < 0) {
				if (pos.cell.left + pos.cell.width + pos.tool.width > pos.win.width) {
					self.tableTools.removeClass('left').addClass('top');
					placement = 'top';
				} else {
					self.tableTools.removeClass('left').addClass('right');
					placement = 'right';
				}
			} else if (placement == 'right' && pos.cell.left + pos.cell.width + pos.tool.width > pos.win.width ) {
				if (pos.cell.left - pos.tableTools.width < 0) {
					self.tableTools.removeClass('right').addClass('top');
					placement = 'top';
				} else {
					self.tableTools.removeClass('right').addClass('left');
					placement = 'left';
				}
			}
			switch(placement) {
				case 'right': 
					self.tableTools.css({ 
						top: pos.cell.top + (pos.cell.height / 2 - (pos.tool.height * ntools) / 2) + 4,
						left: Math.min(pos.win.width - pos.tool.width, pos.cell.left + pos.cell.width) + 8,
						maxWidth: pos.tool.width + 'px'
					});
					break;
				case 'bottom':
					var left = Math.max(0, pos.cell.left + (pos.cell.width / 2 - (pos.tool.width * ntools) / 2));
					if (left + pos.tool.width * ntools > pos.win.width) {
						left = pos.win.width - pos.tool.width * ntools;
					}
					self.tableTools.css({ 
						top: pos.cell.top + pos.cell.height + 8,
						left: left
					});
					var pourcent = (((pos.cell.left + pos.cell.width / 2) - left) / (pos.tool.width * ntools)) * 100;
					self.tableTools.find('.arrow').css('left', pourcent + '%');
					break;
				case 'left':
					self.tableTools.css({
						top: pos.cell.top + (pos.cell.height / 2 - (pos.tool.height * ntools) / 2) + 4,
						left: pos.cell.left - pos.tool.width,
						maxWidth: pos.tool.width + 'px'
					});
					break;
				default:
					var left = Math.max(0, pos.cell.left + (pos.cell.width / 2 - (pos.tool.width * ntools) / 2));
					if (left + pos.tool.width * ntools > pos.win.width) {
						left = pos.win.width - pos.tool.width * ntools;
					}
					self.tableTools.css({
						top: pos.cell.top - pos.tool.height,
						left: left
					});
					var pourcent = (((pos.cell.left + pos.cell.width / 2) - left) / (pos.tool.width * ntools)) * 100;
					self.tableTools.find('.arrow').css('left', pourcent + '%');
			}
		}
	}

	var bindTableToolsEvents = function(self) {
		self.tableTools.find('[data-wysihtml-extra-command]').attr('href', 'javascript:;').on('click', function(e) {
			e.preventDefault();
			var table = self.tableTools.data('table');
			var command = $(this).attr('data-wysihtml-extra-command');
			switch (command) {
				case 'deleteTable':
					self.tableTools.hide();
					showModal(self,
						self.options.translate('Table deletion'),
						self.options.translate('Please, confirm deletion of this table'),
						function(ok) {
							if (ok) {
								table.remove();
							} else {
								self.tableTools.show();
							}
						}
					);
					break;
				case 'tableProperties':
					self.tableTools.hide();
					var tableProperties = self.toolbar.find('[data-wysihtml-dialog="tableProperties"]').clone(true);
					if (table.find('>caption').length > 0) {
						tableProperties.find('input[name=caption]').attr('checked', true);
					}
					if (table.find('>thead').length > 0) {
						tableProperties.find('input[name=thead]').attr('checked', true);
					}
					if (table.hasStylePropertyValue('width', '100%')) {
						tableProperties.find('input[name="full-width"]').attr('checked', true);
					}
					if (table.hasClass('wysiwyg-float-left')) {
						tableProperties.find('select[name="align"]').val('left');
					} else if (table.hasClass('wysiwyg-float-right')) {
						tableProperties.find('select[name="align"]').val('right');
					}
					if (table.hasStylePropertyValue('margin-left', 'auto') &&
						table.hasStylePropertyValue('margin-right', 'auto')) {
						tableProperties.find('select[name="align"]').val('center');
					}
					showModal(self,
						self.options.translate('Table properties'),
						tableProperties,
						function(ok) {
							if (ok) {
								self.tableTools.show();
								if (tableProperties.find('input[name=caption]').is(':checked')) {
									if (table.find('>caption').length == 0) {
										table.prepend($('<caption>&nbsp;</caption>'));
									}
								} else {
									table.find('>caption').remove();
								}
								if (tableProperties.find('input[name=thead]').is(':checked')) {
									if (table.find('>thead').length == 0) {
										var cells = table.find('>tbody > tr:first-child td'), ncells = '';
										cells.each(function(n) {
											var colspan = $(this).attr('colspan') || 1;
											for (var i = 0; i < colspan; i++) {
												ncells += '<th>&nbsp;</th>';
											}
										});
										table.find('>tbody').before($('<thead>' + ncells + '</thead>'));
									}
								} else {
									table.find('thead').remove();
								}
								if (tableProperties.find('input[name="full-width"]').is(':checked')) {
									table.css('width', '100%');
									table.find('>caption').css('width', '100%');
								} else {
									table.removeStyleProperty('width');
									table.find('>caption').removeStyleProperty('width');
								}
								switch (tableProperties.find('select[name="align"]').val()) {
									case 'left':
										if (! table.hasClass('wysiwyg-float-left')) {
											table.removeClass('wysiwyg-float-right');
											table.removeStyleProperty('margin-left', 'margin-right');
											table.addClass('wysiwyg-float-left');
										}
										break;
									case 'center':
										table.removeClass('wysiwyg-float-left wysiwyg-float-right');
										table.removeStyleProperty('float');
										table.css({
											'margin-left': 'auto',
											'margin-right': 'auto'
										});
										break;
									case 'right':
										if (! table.hasClass('wysiwyg-float-right')) {
											table.removeClass('wysiwyg-float-left');
											table.removeStyleProperty('margin-left', 'margin-right');
											table.addClass('wysiwyg-float-right');
										}
										break;
									default:
										table.removeClass('wysiwyg-float-left wysiwyg-float-right');
										table.removeStyleProperty('margin-left', 'margin-right');
								}
								replaceTableTools(self);
							} else {
								self.tableTools.show();
							}
						},
						function() {
							if (tableProperties.find('input[name="full-width"]').is(':checked') && 
								tableProperties.find('select[name="align"]').val()) {
								return self.options.translate('Full width and alignment are incompatible!');
							}
							return false;
						}
					);
					break;
				default:
			}
		});
	}

	var bindDocumentEvents = function(self) {
		$(document).on("click", function(e) {
			self.toolbar.find('li.dropdown button[aria-expanded=true]').each(function () {
				if (this !== e.target) {
					$(this).parent().find('.dropdown-menu').hide();
					$(this).attr('aria-expanded', false);
				}
			});
		});
		$(document).on("keydown", function(e) {
			if (e.which == 27) {
				self.toolbar.find('li.dropdown button[aria-expanded=true]').each(function () {
					$(this).parent().find('.dropdown-menu').hide();
					$(this).attr('aria-expanded', false);
				});
			}
		});
	}

	var bindToolbarEvents = function(self) {
		// font size actions  
		var selBookmark = null;
		self.toolbar.find('.wysihtml-size-input').on('focus', function() {
			if (selBookmark == null) {
				selBookmark = self.editor.composer.selection.getBookmark();
			}
		});
		self.toolbar.find('.wysihtml-size-input').on('change', function(){
			if (selBookmark) {
				var input = this;
				setTimeout(function() {
					var size = $.trim($(input).val());
					if (size.length > 0) {
						size = parseInt(size, 10) + 'pt';
						self.editor.composer.selection.setBookmark(selBookmark);
						self.editor.composer.commands.exec("fontSizeStyle", size);
					}
					selBookmark = null;
				},0);
			}
		});
		self.toolbar.find('.wysihtml-size-input').on('keydown', function(e) {
			var key = e.keyCode || e.which || e.key;
			if (key == 13) {
				e.preventDefault();
				$(this).trigger('blur');
			}
		});
		self.toolbar.find('li[data-wysihtml-option]:not(.dropdown)').on('keydown', function(e) {
			var key = e.keyCode || e.which || e.key;
			switch(key) {
				case 13:
					if (! e.target.hasAttribute('data-wysihtml-command')) {
						e.stopPropagation();
						e.preventDefault();
						$(this).find('button').trigger('click');
					}
					break;
				case 32:
					e.preventDefault();
					break;
			}
		});
		self.toolbar.find('li.dropdown[data-wysihtml-option], li.custom.dropdown').on('keydown', function(e) {
			var key = e.keyCode || e.which || e.key;
			switch(key) {
				case 13:
					if ($(e.target).hasClass('dropdown')) {
						e.stopPropagation();
						e.preventDefault();
						$(this).find('button').trigger('click');
					}
					break;
				case 32:
					if ($(e.target).hasClass('dropdown')) {
						e.preventDefault();
						$(this).find('button').trigger('click');
					}
					break;
				case 35: // end
					e.preventDefault();
					break;
				case 36: // home
					e.preventDefault();
					break;
				case 38: // arrow up
					e.preventDefault();
					break;
				case 40: // arrow down
					e.preventDefault();
					break;
			}
		});
		self.toolbar.find('a[data-wysihtml-command]').on('keydown', function(e) {
			var key = e.keyCode || e.which || e.key;
			switch(key) {
				case 13:
					$(this).trigger('click');
					break;
				case 32:
					e.preventDefault();
					break;
			} 
		});
		self.toolbar.find('a[data-wysihtml-action]').on('keydown', function(e) {
			var key = e.keyCode || e.which || e.key;
			switch(key) {
				case 13:
					self.editor.toolbar.execAction(this.getAttribute('data-wysihtml-action'));
					break;
				case 32:
					e.preventDefault();
					break;
			} 
		});
		self.toolbar.find('span.local-image-name').on('keydown', function(e) {
			var key = e.keyCode || e.which || e.key;
			if (key == 13) {
				e.stopPropagation();
				e.preventDefault();
				$(this).trigger('click');
			}
		});
		self.toolbar.find('li.dropdown[data-wysihtml-option], li.custom.dropdown').on('click', function(e) {
			$(this).find('button').trigger('click');
		});
		self.toolbar.find('li.dropdown button').on('click', function(e) {
			if ($(this).attr('aria-haspopup') && $(this).attr('aria-haspopup') === 'true') {
				e.stopPropagation();
				if ($(this).attr('aria-expanded') === 'false') {
					self.toolbar.find('li.dropdown button[aria-expanded=true]').each(function() {
						$(this).parent().find('.dropdown-menu').hide();
						$(this).attr('aria-expanded', false);
					});
					$(this).parent().find('.dropdown-menu').show();
					$(this).attr('aria-expanded', true);
					var active = $(this).parent().find('a.wysihtml-command-active');
					if (active.length == 0) {
						active = $(this).parent().find('.dropdown-menu').children().first().find('a');
					}
					active.eq(0).focus();
				} else {
					$(this).parent().find('.dropdown-menu').hide();
					$(this).attr('aria-expanded', false);
				}
			}
		});
		self.toolbar.find('[data-wysihtml-hiddentools]').on("click", function(e) {
			self.toolbar.find('li.dropdown button[aria-expanded=true]').each(function () {
				$(this).parent().find('.dropdown-menu').hide();
				$(this).attr('aria-expanded', false);
			});
		});
		self.toolbar.find('li.dropdown:not(.color-picker) .dropdown-menu a').on('click', function(e) {
			var dropdownMenu = $(this).parents('.dropdown-menu');
			dropdownMenu.hide();
			dropdownMenu.parents('li.dropdown').find('button').attr('aria-expanded', false);
		}).on('keydown', function(e) {
			var key = e.keyCode || e.which || e.key;
			switch (key) {
				case 13: // enter
					$(this).trigger('click');
					break;
				case 35: // end
					e.preventDefault();
					e.stopPropagation();
					$(this).parent().parent().children().last().find('a').focus();
					break;
				case 36: // home
					e.preventDefault();
					e.stopPropagation();
					$(this).parent().parent().children().first().find('a').focus();
					break;
				case 38: // arrow up
					e.preventDefault();
					e.stopPropagation();
					var prev = $(this).parent().prev();
					if (prev.length == 0) {
						prev = $(this).parent().parent().children().last();
					}
					prev.find('a').focus();
					break;
				case 40: // arrow down
					e.preventDefault();
					e.stopPropagation();
					var next = $(this).parent().next();
					if (next.length == 0) {
						next = $(this).parent().parent().children().first();
					}
					next.find('a').focus();
					break;
			}
		});
		self.toolbar.find('li.create-table .wysihtml-dimension-picker-mousecatcher').on('click', function(e) {
			var cols = $(this).attr('data-cols');
			var rows = $(this).attr('data-rows');
			self.editor.composer.commands.exec("createTable", { cols: cols, rows: rows });
		});
		self.toolbar.find('li.create-table .wysihtml-dimension-picker-mousecatcher').on('mousemove', function(e) {
			var offset;
			if (e.offsetX === undefined) {
				var pos = $(this).offset();
				offset = {
					x: e.pageX - pos.left,
					y: e.pageY - pos.top
				};
			} else {
				offset = {
					x: e.offsetX,
					y: e.offsetY
				};
			}
			var pixelsPerEm = 18;
			var dim = {
				c: Math.ceil(offset.x / pixelsPerEm) || 1,
				r: Math.ceil(offset.y / pixelsPerEm) || 1
			};
			$(this).next().css({ width: dim.c + 'em', height: dim.r + 'em' });
			$(this).attr('data-cols', dim.c);
			$(this).attr('data-rows', dim.r);
			if (dim.r > 3 && dim.r < self.options.createTableMaxSize.row) {
				$(this).next().next().css({ height: dim.r + 1 + 'em' });
			}
			$(this).parent().next().html(dim.c + ' x ' + dim.r);
		});
		self.toolbar.find('li.color-picker .dropdown-menu tbody tr td a').on('click', function(e) {
			var dropdownMenu = $(this).parents('.dropdown-menu');
			if ($(this).hasClass('close-popover')) {
				e.preventDefault();
			} else {
				dropdownMenu.parents('li.color-picker').find('button span.current-color').css('background', $(this).attr('data-wysihtml-command-value'));
			}
		}).on('keydown', function(e) {
			var key = e.keyCode || e.which || e.key;
			switch (key) {
				case 13: // enter
					$(this).trigger('click');
					break;
				case 35: // end
					e.preventDefault();
					e.stopPropagation();
					$(this).parent().parent().parent().children().last().children().last().find('a').focus();
					break;
				case 36: // home
					e.preventDefault();
					e.stopPropagation();
					$(this).parent().parent().parent().children().first().children().first().find('a').focus();
					break;
				case 37: // arrow left
					e.preventDefault();
					e.stopPropagation();
					var prev = $(this).parent().prev();
					if (prev.length == 0) {
						prev = $(this).parent().parent().children().last();
					}
					prev.find('a').focus();
					break;
				case 38: // arrow up
					e.preventDefault();
					e.stopPropagation();
					var td = $(this).parent();
					var tr = td.parent();
					var index = td.index();
					if (tr.is(':last-child') && index == 1) {
						index = parseInt(td.prev().attr('colspan'), 10);
					}
					var prev = tr.prev();
					if (prev.length == 0) {
						prev = tr.parent().children().last();
						index = index >= parseInt(prev.children().first().attr('colspan'), 10) ? 1 : 0;
					}
					prev = prev.children().eq(index);
					prev.find('a').focus();
					break;
				case 39: // arrow right
					e.preventDefault();
					e.stopPropagation();
					var next = $(this).parent().next();
					if (next.length == 0) {
						next = $(this).parent().parent().children().first();
					}
					next.find('a').focus();
					break;
				case 40: // arrow down
					e.preventDefault();
					e.stopPropagation();
					var td = $(this).parent();
					var tr = td.parent();
					var index = td.index();
					var next = tr.next();
					if (next.length == 0) {
						next = tr.parent().children().first();
						if (index == 1) {
							index = parseInt(td.prev().attr('colspan'), 10);
						}
					}
					if (next.is(':last-child')) {
						index = index >= parseInt(next.children().first().attr('colspan'), 10) ? 1 : 0;
					}
					next = next.children().eq(index);
					next.find('a').focus();
					break;
			}
		});
	}

	var bindFileInput = function(self, input) {
		input.on('change', function(e) {
			var dialog = $(this).parent().parent();
			var src = dialog.find('input[data-wysihtml-dialog-field=src]');
			var local = dialog.find('input[data-wysihtml-dialog-field=data-local]');
			var name = dialog.find('span.local-image-name');
			var files = e.target.files;
			var reader = new FileReader();
			reader.onload = function(e) {
				src.val(e.target.result);
				local.val(files[0].name);
				name.text(files[0].name);
			};
			reader.onerror  = function(e) {
				dialog.find('div.alert').addClass('alert-danger').text(e.target.error.name).show();
			};
			reader.readAsDataURL(files[0]);
		});
	}

	var bindDialogsEvents = function(self) {
		self.toolbar.find('div[data-wysihtml-dialog=insertImage] input[type=checkbox]').on('change', function(e) {
			var dialog = $(this).parent().parent();
			var src = dialog.find('input[data-wysihtml-dialog-field=src]');
			var alt = dialog.find('input[data-wysihtml-dialog-field=alt]');
			var name = dialog.find('span.local-image-name');
			if ($(this).is(':checked')) {
				if (dialog.find('input[type=file]').length == 0) {
					var input = $('<input>', {
						"type": "file",
						"accept": "image/*",
						"class": "form-control form-control-sm",
						"value": "" 
					});
					src.before(input);
					bindFileInput(self, input);
					input.hide();
				}
				if ($(this).val() == 'false') {
					name.text(self.options.translate('Select an image file ...')).show();
					name.removeAttr('title');
				} else {
					name.text($(this).val()).show();
					name.attr('title', self.options.translate('Click if you want to replace this image'));
				}
				src.hide();
			} else {
				if (/^data\:image/.test(src.val())) {
					src.val('http://');
				}
				$(this).val('false');
				name.hide();
				dialog.find('input[type=file]').remove();
				src.show();
			}
		});
		self.toolbar.find('div[data-wysihtml-dialog=insertImage] a[data-wysihtml-dialog-action=save]').on('click', function(e) {
			var dialog = $(this).parent();
			var src = dialog.find('input[data-wysihtml-dialog-field=src]');
			if (checkImgSrc(src.val())) {
				var alt = dialog.find('input[data-wysihtml-dialog-field=alt]').val();
				if ($.trim(alt) === '') {
					dialog.find('div.alert').addClass('alert-danger').text(self.options.translate("The alt attribute is mandatory!")).show();
					e.preventDefault();
					e.stopPropagation();
				} else {
					dialog.find('input[type=file]').remove();
					dialog.find('span.local-image-name').hide();
					dialog.find('div.alert').removeClass('alert-danger').text("").hide();
				}
			} else {
				if (dialog.find('input[data-wysihtml-dialog-field=data-local]').is(':checked')) {
					dialog.find('div.alert').addClass('alert-danger').text(self.options.translate("You have not selected a file or it is invalid!")).show();
				} else {
					dialog.find('div.alert').addClass('alert-danger').text(self.options.translate("You have entered an invalid url!")).show();
				}
				e.preventDefault();
				e.stopPropagation();
			}
		});
		self.toolbar.find('div[data-wysihtml-dialog=insertImage] a[data-wysihtml-dialog-action=cancel]').on('click keydown', function(e) {
			if (e.type == 'click' || (e.keyCode || e.which || e.key) == 13) {
				e.preventDefault();
				e.stopPropagation();
				var dialog = $(this).parent();
				dialog.find('input[type=file]').remove();
				dialog.find('span.local-image-name').hide();
				dialog.find('div.alert').removeClass('alert-danger').text("").hide();
				dialog.hide();
			} else if (e.type == 'keydown' && (e.keyCode || e.which || e.key) == 32) {
				e.preventDefault();
			}
		});
		self.toolbar.find('div[data-wysihtml-dialog=createLink] a[data-wysihtml-dialog-action=save]').on('click', function(e) {
			var dialog = $(this).parent();
			var url = dialog.find('input[data-wysihtml-dialog-field=href]').val();
			if (checkUrl(url)) {
				var title = $.trim(dialog.find('input[data-wysihtml-dialog-field=title]').val());
				var target =  dialog.find('select[data-wysihtml-dialog-field=target]').val();
				var neww = self.options.translate('New window');
				var re = new RegExp('\\s*-\\s*' + neww + '$');
				if (target == '_blank') {
					if (title == '' || ! re.test(title)) {
						var text = self.editor.composer.selection.getText();
						if (title == '') {
							dialog.find('input[data-wysihtml-dialog-field=title]').val(text + ' - ' + neww);
						} else {
							dialog.find('input[data-wysihtml-dialog-field=title]').val(title + ' - ' + neww);
						}
					}
				} else if (title !== '' && re.test(title)) {
					dialog.find('input[data-wysihtml-dialog-field=title]').val(title.replace(re, ''));
				}
				dialog.find('div.alert').removeClass('alert-danger').text("").hide();
			} else {
				dialog.find('div.alert').addClass('alert-danger').text(self.options.translate("You have entered an invalid url!")).show();
				e.preventDefault();
				e.stopPropagation();
			}
		});
		self.toolbar.find('div[data-wysihtml-dialog=createLink] a[data-wysihtml-dialog-action=cancel]').on('click keydown', function(e) {
			if (e.type == 'click') {
				e.preventDefault();
				e.stopPropagation();
				$(this).parent().hide();
			} else {
				var key = e.keyCode || e.which || e.key;
				switch(key) {
					case 13:
						e.preventDefault();
						e.stopPropagation();
						$(this).parent().hide();
						break;
					case 32:
						e.preventDefault();
						break;
				} 
			}
		});
		self.toolbar.find('div[data-wysihtml-dialog=tableProperties] a[data-wysihtml-dialog-action=save]').on('click', function(e) {
			$(this).parent().hide();
		});
		self.toolbar.find('div[data-wysihtml-dialog=tableProperties] a[data-wysihtml-dialog-action=cancel]').on('click', function(e) {
			$(this).parent().hide();
		});
	}

	var bindEditorEvents = function(self) {
		self.editor.on("tableselect", function() {
			setTimeout(function(){ 
				var selection = self.editor.composer.selection.getSelection();
				var mergeCommand = self.tableTools.find('a[data-wysihtml-command="mergeTableCells"]');
				if (mergeCommand.is('.wysihtml-command-active')) {
					mergeCommand.attr('title', self.options.translate('Cancel table cells merging'));
				} else {
					mergeCommand.attr('title', self.options.translate('Merge table cells'));
				}
				if (selection && selection.anchorNode) {
					self.tableTools.removeClass('top right bottom left').addClass(self.tableTools.attr('data-placement')).show();
					var anchor = $(selection.anchorNode);
					var cell = anchor.is('td, th') ? anchor : anchor.parents('td, th');
					var table = cell.parents('table');
					self.tableTools.data('table', table);
					self.tableTools.data('cell', cell);
					replaceTableTools(self);
				}
				if (!self.options.handleTables) {
					self.tableTools.find('ul[data-wysihtml-hiddentools]').show();
				}
				self.tableTools.show();
			}, 50);
		});
		self.editor.on("tableselectchange", function() {
			var mergeCommand = self.tableTools.find('a[data-wysihtml-command="mergeTableCells"]');
			mergeCommand.attr('title', self.options.translate('Merge table cells'));
		});
		self.editor.on("tableunselect:composer", function() {
			self.tableTools.hide();
			if (!self.options.handleTables) {
				self.tableTools.find('ul[data-wysihtml-hiddentools]').hide();
			}
		});
		self.editor.on("beforeload", function(e) {
			internalizeHTML(self);
		});
		self.editor.on('change_view', function() {
			self.toolbar.find('a.btn, button').not('[data-wysihtml-action="change_view"]').toggleClass('disabled');
		});
		self.editor.on('interaction', function() {
			setTimeout(function(){ 
				$.each([ 'block', 'font-name', 'font-named-size' ], function(i, item) {
					self.editable.parent().find('li.' + item + 's').each(function(){
						var dropdown = $(this);
						var button = dropdown.find('button');
						var active;
						if (button.hasClass('wysihtml-command-active')) {
							active = dropdown.find('.dropdown-menu a.wysihtml-command-active');
						} else {
							active = dropdown.find('.dropdown-menu a[data-wysihtml-command-blank-value]');
						}
						if (active.length > 1) {
							active.first().removeClass('wysihtml-command-active');
							active = active.last();
						}
						button.find('span.current-' + item).text(active.text());
					});
				});
				self.editable.parent().find('li.color-picker').each(function(){
					var dropdown = $(this);
					var button = dropdown.find('button');
					var color;
					if (button.hasClass('wysihtml-command-active')) {
						color = dropdown.find('.dropdown-menu a.wysihtml-command-active').attr('data-wysihtml-command-value');
					} else {
						color = 'black';
					}
					button.find('span.current-color').css('background', color);
				});
				// font size state 
				if (self.editor.composer.commands.state('fontSizeStyle')) {
					var size = parseInt(self.editor.composer.commands.stateValue('fontSizeStyle'), 10);
					self.toolbar.find('.wysihtml-size-input').val(size);
					self.toolbar.find('.wysihtml-size-input').parent().addClass('wysihtml-command-active');
				} else {
					var size = '';
					if (self.editor.composer.commands.state('formatBlock')) {
						var sel = self.editor.composer.commands.state('formatBlock')[0];
						var fontSize = window.getComputedStyle(
							sel, ':first-line'
						).getPropertyValue('font-size');
						fontSize = convertToPt(fontSize, 0);
						if (/pt$/i.test(fontSize)) {
							size = fontSize.replace(/pt$/i, "");
						}
					}
					self.toolbar.find('.wysihtml-size-input').val(size);
					self.toolbar.find('.wysihtml-size-input').parent().removeClass('wysihtml-command-active');
				}
			}, 20);
		});
		self.editor.on('change:dialog', function(e) { // this event was added by Eureka2 in wysihtml.toobar.js : line 152, 544-547
			if (e.command == 'insertImage') {
				var dialog= self.toolbar.find('div[data-wysihtml-dialog=insertImage]');
				var local = dialog.find('input[data-wysihtml-dialog-field=data-local]');
				var alt = dialog.find('input[data-wysihtml-dialog-field=alt]');
				var src = dialog.find('input[data-wysihtml-dialog-field=src]');
				if (dialog.is(':visible')) {
					local.prop('checked', local.val() !== 'false' || /^data\:image/.test(src.val()));
					local.trigger('change');
				}
			}
		});
		self.editor.on('show:dialog', function(e) {
			if (e.command == 'insertImage') {
				var dialog= self.toolbar.find('div[data-wysihtml-dialog=insertImage]');
				var local = dialog.find('input[data-wysihtml-dialog-field=data-local]');
				var alt = dialog.find('input[data-wysihtml-dialog-field=alt]');
				if (alt.val() == '') {
					local.prop('checked', false);
				} else if (local.val() != 'false' && ! local.is(':checked')) {
					local.prop('checked', true);
				} else if (local.val() == 'false' && local.is(':checked')) {
					local.prop('checked', false);
				}
				local.trigger('change');
			}
		});
		self.editor.on('drop:composer', function(e) {
			var target = $(e.target);
			var imagesList = {};
			for (var i = 0, image; image = e.dataTransfer.files[i]; i++) {
				if (image.type.match('image.*')) {
					var reader = new FileReader();
					reader.onload = (function(theFile) {
						return function(e) {
							imagesList[theFile.name] = e.target.result;
						};
					})(image);
					reader.onerror  = (function(theFile) {
						return function(e) {
							console.log(e.target.error.name);
						};
					})(image);
					reader.readAsDataURL(image);
				}
			}
			setTimeout(function() {
				target.find('img').each(function () {
					if (! $(this).attr('data-local')) {
						var src = $(this).attr('src'), name = '';;
						$.each(imagesList, function(n, s) {
							if (s == src) {
								name = n;
								return false;
							}
						});
						if (name != '') {
							$(this).attr('data-local', name);
							$(this).attr('alt', name);
						}
					}
				});
			}, 100);
		});
		self.editor.on('load', function() {
			insertEditorStyles(self);
			self.scrollable.on('scroll', function(e) {
				if (self.options.toolbar.table) {
					replaceTableTools(self);
				}
			});
			self.iwindow.on("click", function(e) {
				self.toolbar.find('li.dropdown button[aria-expanded=true]').each(function () {
					$(this).parent().find('.dropdown-menu').hide();
					$(this).attr('aria-expanded', false);
				});
			});
		});
		self.editor.on('fullscreen:composer', function(button) {
			$(button).find('span').removeClass('fa-expand');
			$(button).find('span').addClass('fa-compress');
			$(button).attr('title', self.options.translate('Exit full screen mode'));
		});
		self.editor.on('normalscreen:composer', function(button) {
			$(button).find('span').removeClass('fa-compress');
			$(button).find('span').addClass('fa-expand');
			$(button).attr('title', self.options.translate('Full screen'));
		});
	}

	var initialize = function(self) {
		var wysitoolbar = $('<div>', {
			'class': 'wysihtml-toolbar btn-toolbar',
			'role': 'toolbar',
			'style': 'display: none;'
		});
		self.identificationNumber = Math.floor(Math.random() * Math.floor(10000));
		var tools = $('<ul>');
		makeToolCommands(self, 'emphasis', tools);
		makeToolCommands(self, 'link', tools);
		makeToolCommands(self, 'image', tools);
		makeToolCommands(self, 'lists', tools);
		makeToolCommands(self, 'align', tools);
		makeToolDropdownCommands(self, 'blocks', tools);
		makeToolDropdownCommands(self, makeFontsTool(self, 'fontNameStyle'), tools);
		makeToolDropdownCustom(self, 'font-fixed-sizes', tools);
		makeToolDropdownCommands(self, 'font-named-sizes', tools);
		makeToolCreateTable(self, tools);
		makeToolCommands(self, 'code', tools);
		makeToolDropdownCommands(self, makeColorsTool(self, 'foreColor', false, 'Text color'), tools);
		makeToolDropdownCommands(self, makeColorsTool(self, 'hiliteColor', true, 'Text highlight color'), tools);
		var context = {locale: self.options.locale, options: self.options};
		$.each(self.options.customTemplates, function(name, template) {
			if (self.options.toolbar[name]) {
				tools.append(template(context));
			}
		});
		makeToolCommands(self, 'undo', tools);
		makeToolCommands(self, 'fullscreen', tools);
		makeToolCommands(self, 'html', tools);
		wysitoolbar.append(tools);
		$.each(dialogs, function(key, dialog) {
			wysitoolbar.append(dialog);
		});
		$.each(self.options.customDialogs, function(key, dialog) {
			dialog  = '<div class="row" data-wysihtml-dialog="' + key + '" style="display: none;">' + dialog;
			dialog += '<a class="btn btn-primary btn-sm" tabindex="0" data-wysihtml-dialog-action="save">OK</a>&nbsp;<a class="btn btn-secondary btn-sm" tabindex="0" data-wysihtml-dialog-action="cancel">Cancel</a>';
			dialog += '<div class="alert" role="alert" style="display: none;"></div>';
			wysitoolbar.append(dialog);
		});
		wysitoolbar.find('[data-wysihtml-dialog=modalDialog]').each(function() {
			$(this).find('[id=wysihtml-modal-title]').attr('id', 'wysihtml-modal-title' + self.identificationNumber);
			$(this).attr('aria-labelledby', 'wysihtml-modal-title' + self.identificationNumber);
		});
		self.editable.wrap($('<div>', { 'class': 'container-fluid', 'style': 'padding: 0; margin: 0;' }));
		self.editable.before(wysitoolbar);
		self.editable.addClass('wysihtml-editable');
		self.toolbar = wysitoolbar;
		self.modal = self.toolbar.find('div[data-wysihtml-dialog="modalDialog"]').modal({show:false});
		translate(self);
		$.each(['bold', 'italic', 'underline'], function(e, emphasis) {
			if (self.options.toolbar.emphasis === true ||
				(	$.isArray(self.options.toolbar.emphasis) &&
					$.inArray(emphasis, self.options.toolbar.emphasis) >= 0
				)
			) {
				var command = self.toolbar.find('a[data-wysihtml-command="' + emphasis + '"]');
				command.text(command.text()[0].toUpperCase());
			}
		});
		var parserRules = $.extend(true, {}, wysihtmlParserRules, self.options.parserRules);
		self.options.classNames.sandbox += self.identificationNumber;
		self.editor = new wysihtml.Editor(
			self.editable.get(0), {
				toolbar: self.toolbar.get(0),
				parserRules: parserRules,
				stylesheets: self.options.stylesheets,
				name: self.options.name,
				showToolbarAfterInit: self.options.showToolbarAfterInit,
				showToolbarDialogsOnSelection: self.options.showToolbarDialogsOnSelection,
				autoLink: self.options.autoLink,
				handleTabKey: self.options.handleTabKey,
				handleTables: self.options.handleTables,
				pasteParserRulesets: self.options.pasteParserRulesets,
				copyedFromMarking: self.options.copyedFromMarking,
				// parser: self.options.parser,
				classNames: self.options.classNames,
				cleanUp: self.options.cleanUp,
				useLineBreaks: self.options.useLineBreaks,
				placeholderText: self.options.placeholderText
			}
		);
		self.iframe = $('.' + self.options.classNames.sandbox);
		if (self.iframe.is('iframe')) {
			self.iwindow = self.scrollable = $(self.iframe[0].contentWindow);
			self.idocument = $(self.iwindow[0].document);
		} else {
			self.scrollable = self.editable.css('overflow', 'scroll');
			self.iframe = $('body');
			self.iwindow = self.editable;
			self.idocument = $(document);
			$.each(self.options.stylesheets, function(s, stylesheet) {
				if ($("head").find('link[href="' + stylesheet + '"]').length == 0) {
					if (document.createStyleSheet) {
						document.createStyleSheet(stylesheet);
					} else {
						$("head").append($("<link rel='stylesheet' href='" + stylesheet + "' type='text/css' media='screen' />"));
					}
				}
			});
		}
		self.tableTools = wysitoolbar.find('div.data-wysihtml-hiddentools');
		bindEditorEvents(self);
		bindTableToolsEvents(self);
		if(self.editor.composer.editableArea.contentDocument) {
			addMoreShortcuts(
				self.editor, 
				self.editor.composer.editableArea.contentDocument.body || self.editor.composer.editableArea.contentDocument, 
				self.options.shortcuts
			);
		} else {
			addMoreShortcuts(self.editor, self.editor.composer.editableArea, self.options.shortcuts);    
		}
		bindDialogsEvents(self);
		if (self.options.events) {
			for(var eventName in self.options.events) {
				if (self.options.events.hasOwnProperty(eventName)) {
					self.editor.on(eventName, self.options.events[eventName]);
				}
			}
		}
		bindToolbarEvents(self);
		bindDocumentEvents(self);
	}

	var renameTag = function(oldTag, newTag, container) {
		container = container || $('body');
		container.find(oldTag).each(function(){
			var newElem = $('<' + newTag + '>', {html: $(this).html()});
			$.each(this.attributes, function() {
				newElem.attr(this.name, this.value);
			});
			$(this).replaceWith(newElem);
		});
	}

	var parseStyle = function(style) {
		var props = style.replace(/;\s*$/, '').split(/;\s*/);
		var parsed = {};
		$.each(props, function(p, prop) {
			var pr = prop.split(/\s*:\s*/);
			parsed[pr[0]] = pr[1];
		});
		return parsed;
	}

	var dedupStyle = function(style) {
		var temp = parseStyle(style);
		var props = [];
		$.each(temp, function(name, value) {
			props.push(name + ': ' + value.replace(/"/g, "'") + ';');
		});
		return props.join(" ");
	}

	var mergeAttributes = function(element) {
		var attributes = {};
		$.each(element.attributes, function(n, attrs) {
			$.each(attrs, function(a, attr) {
				$.each(attr, function(name, value) {
					if (! attributes[name]) {
						attributes[name] = '';
					}
					attributes[name] = $.trim(attributes[name] + ' ' + value);
				});
			});
		});
		if (attributes.style) {
			attributes.style = dedupStyle(attributes.style);
		}
		element.attributes = attributes;
	}

	var captureTarget = function(element, target) {
		var json = [];
		$.each(target.prop("attributes"), function() {
			if (this.value) {
				var attr = {};
				attr[this.name] = this.value;
				json.push(attr);
			}
		});
		element.depth++;
		element.attributes.push(json);
		element.html = target.html(); 
	}
	
	var deepestTag = function($this, tag, element) {
		var $target = $this.children();
		if ($target.length != 1) {
			return;
		}
		if (!$target.is(tag)) {
			return;
		}
		captureTarget(element, $target); 
		deepestTag($target, tag, element);
	}

	var INDENT = "    ";
	var BLOCKTAGS = ['address', 'article', 'aside', 'blockquote', 'br', 'caption', 'canvas', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'tfoot', 'ul', 'video'];
	var INLINETAGS = ['a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'q', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'var', ];
	var EMPTYTAGS = ['area', 'base', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
	var beautifyElement = function(element, level) {
		level = (typeof level == 'undefined') ? 0 : level;
		var output = "", indent = "";
		for (var i = 0; i < level; i++) {
			indent += INDENT; 
		}
		element.each(function() {
			var node = this;
			if (node.nodeType == Node.TEXT_NODE) {
				output += $(node).text();
			} else if (node.nodeType == Node.ELEMENT_NODE) {
				var name = node.nodeName.toLowerCase();
				if ($.inArray(name, BLOCKTAGS) >= 0) {
					output += "\n" + indent;
				}
				output += "<" + name;
				var attributes = "";
				$.each(node.attributes, function() {
					attributes += " " + this.name + '="' + this.value + '"';
				});
				output += attributes + ">";
				if ($.inArray(name, EMPTYTAGS) < 0 || node.childNodes.length > 0) {
					var children = $(node).contents();
					var hasBlockTag = false;
					children.each(function() {
						if (this.nodeType == Node.ELEMENT_NODE && $.inArray(this.nodeName.toLowerCase(), BLOCKTAGS) >= 0 ){
							hasBlockTag = true;
						}
						output += beautifyElement($(this), level + 1);
					});
					if (hasBlockTag) {
						output += "\n" + indent;
					}
					output += "</" + name+ ">";
				}
				if ($.inArray(name, BLOCKTAGS) >= 0) {
					output += "\n";
				}
			}
		});
		return output;
	}

	var beautify = function(html) {
		html = html.replace(/[\r\n]+/g, "")
				.replace(/\<(caption|th|td)\>&nbsp;/g, "<$1>");
		$.each(BLOCKTAGS, function(t, tag) {
			var re = new RegExp("(\\<br\\>)+\\<\\/" + tag + "\\>", "g");
			html = html.replace(re, "</" + tag + ">");
		});
		$.each(INLINETAGS, function(t, tag) {
			var re = new RegExp("\\<" + tag + "\\>\\s*\\<\\/" + tag + "\\>", "g");
			html = html.replace(re, "");
		});
		html = $('<div>', { html: html });
		return	beautifyElement(html.contents())
				.replace(/\>[\t ]+\</g, '> <')
				.replace(/\>[\r\t\n]+( *)\</g, ">\n$1<")
				.replace(/\<p\>\<\/p\>/g, '<br>')
				.replace(/(\<br\>\s*)+$/, "")
				.replace(/^\s*$(?:\r\n?|\n)/gm, "")
				.replace(/\s+$/gm, "")
				.replace(/\s+\<\/(caption|th|td)\>/g, "</$1>");
	}

	var internalizeHTML = function(self) {
		var types = self.editor.config.parserRules.type_definitions;
		var div = $('<div>');
		div.append(self.editor.getValue());
		div.find("span[style]").each(function(elt) {
			var styles = parseStyle($(this).attr('style'));
			if (Object.keys(styles).length > 1) {
				var spansStart = "", spansEnd = "";
				$.each(styles, function(property, value) {
					spansStart += '<span style="' + property + ': ' + value + ';">';
					spansEnd += '</span>';
				});
				$(this).replaceWith(spansStart + $(this).html() + spansEnd);
			}
		});
		div.find("p[style*='margin-left']").each(function(elt) {
			var margin = $(this).getStylePropertyValue('margin-left');
			if (/em$/.test(margin)) {
				var nbq = parseFloat(margin.replace(/em$/, '')) / 1.5;
				var bqStart = "", bqEnd = "";
				for (var n = 0; n < nbq; n++) {
					bqStart += '<blockquote>';
					bqEnd += '</blockquote>';
				}
				$(this).replaceWith(bqStart + $(this).html() + bqEnd);
			}
		});
		div.find("[style]").each(function(elt) {
			var property;
			if ((property = $(this).getStylePropertyValue('background-color')) !== false) {
				property = self.palette.hexToName(property);
				if (types.text_hilite_object.classes['wysiwyg-hilite-color-' + property]) {
					$(this).removeStyleProperty('background-color');
					$(this).addClass('wysiwyg-hilite-color-' + property);
				}
			}
			if ((property = $(this).getStylePropertyValue('color')) !== false) {
				property = self.palette.hexToName(property);
				if (types.text_color_object.classes['wysiwyg-color-' + property]) {
					$(this).removeStyleProperty('color');
					$(this).addClass('wysiwyg-color-' + property);
				}
			}
			if ((property = $(this).getStylePropertyValue('text-align')) !== false) {
				if (property == 'justify' && types.alignment_object.classes['wysiwyg-text-align-' + property]) {
					$(this).removeStyleProperty('text-align');
					$(this).addClass('wysiwyg-text-align-' + property);
				}
			}
			if ((property = $(this).getStylePropertyValue('float')) !== false &&
				$(this).hasStyleProperty('margin')) {
				if (types.alignment_object.classes['wysiwyg-float-' + property]) {
					$(this).removeStyleProperty('float');
					$(this).removeStyleProperty('margin');
					$(this).addClass('wysiwyg-float-' + property);
				}
			}
			if ((property = $(this).getStylePropertyValue('clear')) !== false) {
				$(this).removeStyleProperty('clear');
				$(this).addClass('wysiwyg-clear-' + property);
			}
			if ((property = $(this).getStylePropertyValue('font-family')) !== false) {
				property = property.replace(/^['"]/, '').replace(/['"].+$/, '');
				property = self.fonts.getName(property);
				$(this).css('font-family', property);
			}
			if ((property = $(this).getStylePropertyValue('font-size')) !== false) {
				if (types.text_fontsize_object.classes['wysiwyg-font-size-' + property]) {
					$(this).removeStyleProperty('font-size');
					$(this).addClass('wysiwyg-font-size-' + property);
				}
			}
		});
		self.editor.setValue(div.html());
	}

	var externalizeHTML = function(self) {
		var div = $('<div>');
		div.append(self.editor.getValue());
		// div.contents()
			// .filter(function() {
				// if (this.nodeType === 3) {
				// }
				// return this.nodeType === 3 && this.nodeValue && $.trim(this.nodeValue) != '';
			// })
			// .wrap( "<p></p>" )
			// .end()
			// .filter( "br" )
			// .remove();
		div.find("[class*=wysiwyg-color-]").each(function(elt) {
			var element = $(this);
			var classes = element.attr('class').split(/\s+/);
			$.each(classes, function(c, clazz) {
				var color = clazz.match(/wysiwyg-color-(.+)$/);
				if (color) {
					color = self.palette.nameToHex(color[1]);
					element.css('color', color);
					element.removeClass(clazz);
				}
			});
		});
		div.find("[class*=wysiwyg-hilite-color-]").each(function(elt) {
			var element = $(this);
			var classes = element.attr('class').split(/\s+/);
			$.each(classes, function(c, clazz) {
				var color = clazz.match(/wysiwyg-hilite-color-(.+)$/);
				if (color) {
					color = self.palette.nameToHex(color[1]);
					element.css('background-color', color);
					element.removeClass(clazz);
				}
			});
		});
		div.find("[class*=wysiwyg-text-align-]").each(function(elt) {
			var element = $(this);
			var classes = element.attr('class').split(/\s+/);
			$.each(classes, function(c, clazz) {
				var align = clazz.match(/wysiwyg-text-align-(.+)$/);
				if (align) {
					element.css('text-align', align[1]);
					element.removeClass(clazz);
				}
			});
		});
		div.find("[class*=wysiwyg-float-]").each(function(elt) {
			var element = $(this);
			var classes = element.attr('class').split(/\s+/);
			$.each(classes, function(c, clazz) {
				var flot = clazz.match(/wysiwyg-float-(.+)$/);
				if (flot) {
					if (flot[1] == 'right') {
						element.css({ 'float': 'right', 'margin': '0 0 8px 8px' });
					} else {
						element.css({ 'float': 'left', 'margin': '0 8px 8px 0' });
					}
					element.removeClass(clazz);
				}
			});
		});
		div.find("[class*=wysiwyg-clear-]").each(function(elt) {
			var element = $(this);
			var classes = element.attr('class').split(/\s+/);
			$.each(classes, function(c, clazz) {
				var clear = clazz.match(/wysiwyg-clear-(.+)$/);
				if (clear) {
					element.css('clear', clear[1]);
					element.removeClass(clazz);
				}
			});
		});
		div.find("[class*=wysiwyg-font-name-]").each(function(elt) {
			var element = $(this);
			var classes = element.attr('class').split(/\s+/);
			$.each(classes, function(c, clazz) {
				var name = clazz.match(/wysiwyg-font-name-(.+)$/);
				if (name) {
					name = self.fonts.getFamily(name[1]);
					element.css('font-family', name);
					element.removeClass(clazz);
				}
			});
		});
		div.find("[style*='font-family:']").each(function(elt) {
			var element = $(this);
			var styles = element.attr('style').split(/\s*;\s*/);
			$.each(styles, function(s, style) {
				var name = style.match(/font-family:\s*(.+)$/);
				if (name) {
					name = self.fonts.getFamily(name[1]);
					element.css('font-family', name);
				}
			});
		});
		div.find("[class*=wysiwyg-font-size-]").each(function(elt) {
			var element = $(this);
			var classes = element.attr('class').split(/\s+/);
			$.each(classes, function(c, clazz) {
				var size = clazz.match(/wysiwyg-font-size-(.+)$/);
				if (size) {
					element.css('font-size', size[1]);
					element.removeClass(clazz);
				}
			});
		});
		var blockquotes = div.find("blockquote");
		while (blockquotes.length) {
			blockquotes.each(function(i) {
				var element = { depth: 0, attributes: [], html: '' };
				captureTarget(element, $(this)); 
				deepestTag($(this), "blockquote", element);
				var margin = (element.depth * 1.5) + 'em';
				var p = $('<p>').css('margin-left', margin).append(element.html);
				$(this).replaceWith(p);
				return false;
			});
			blockquotes = div.find("blockquote");
		}
		var spans = div.find("span");
		while (spans.length) {
			spans.each(function(i) {
				var element = { depth: 0, attributes: [], html: '' };
				captureTarget(element, $(this)); 
				deepestTag($(this), "span", element);
				mergeAttributes(element);
				var temp = $('<var>').addClass('temporary-var').attr(element.attributes).append(element.html);
				$(this).replaceWith(temp);
				return false;
			});
			spans = div.find("span");
		}
		renameTag('var.temporary-var', 'span', div);
		div.find('.temporary-var').removeAttr('class');
		return div.html().replace(/ class=""/g, '');
	}

	var centerModal = function() {
		$('.modal').find('.modal-dialog').each(function(index) {
			$(this).css({
				'position': 'absolute',
				'top': function () {
					return (($(window).height() - $(this).outerHeight(true)) / 2) + 'px';
				},
				'left': function () {
					return (($(window).width() - $(this).outerWidth(true)) / 2) + 'px';
				}
			});
		});
	}

	var showModal = function(self, title, body, callback, check) {
		check = check || function() { return false; };
		self.modal.find('.modal-title').text(title);
		if (typeof(body) === 'string') {
			self.modal.find('.modal-body .body-content').html(body);
		} else {
			self.modal.find('.modal-body .body-content').append(body.show());
		}
		self.modal.find('.alert').hide();
		self.modal.find('.modal-ok, .modal-cancel').off('click');
		self.modal.find('.modal-cancel').on('click', function(e) {
			callback(false);
			self.modal.find('.modal-body .body-content').empty();
		});
		self.modal.find('.modal-ok').on('click', function(e) {
			var error;
			if (error = check()) {
				self.modal.find('.alert').addClass('alert-danger').text(error).show();
			} else {
				callback(true);
				self.modal.find('.modal-body .body-content').empty();
				self.modal.modal('hide');
			};
		});
		self.modal.modal('show');
	}

	$('body').on('shown.bs.modal', centerModal);
	$(window).on("resize", function () {
		$('.modal:visible').each(centerModal);
	});
	
	// public variables

	BootStrapWysiHtml.prototype.VERSION  = '1.0.0';

	// public methods

	BootStrapWysiHtml.prototype.config = function() {
		return this.editor.config;
	}

	BootStrapWysiHtml.prototype.namedColorToHex = function(name) {
		return this.palette.nameToHex(name);
	}

	BootStrapWysiHtml.prototype.hexColorToName = function(hex) {
		return this.palette.hexToName(hex);
	}

	BootStrapWysiHtml.prototype.getFontName = function(label) {
		return this.fonts.getName(label);
	}

	BootStrapWysiHtml.prototype.getFontLabel = function(name) {
		return this.fonts.getLabel(name);
	}

	BootStrapWysiHtml.prototype.getFontFamily = function(name) {
		return this.fonts.getFamily(name);
	}

	BootStrapWysiHtml.prototype.cleanUp = function(rules) {
		this.editor.cleanUp(rules);
	}

	BootStrapWysiHtml.prototype.disable = function() {
		this.editor.disable();
	}

	BootStrapWysiHtml.prototype.enable = function() {
		this.editor.enable();
	}

	BootStrapWysiHtml.prototype.focus = function() {
		this.editor.focus();
	}

	BootStrapWysiHtml.prototype.getValue = function(parse) {
		parse = typeof parse == 'undefined' ? true : parse;
		return this.editor.getValue(parse);
	}

	BootStrapWysiHtml.prototype.getHTML = function(beautified) {
		beautified = typeof beautified == 'undefined' ? false : beautified;
		var html = externalizeHTML(this);
		if (beautified) {
			html = beautify(html);
		}
		return html;
	}

	BootStrapWysiHtml.prototype.hasPlaceholderSet = function() {
		return this.editor.hasPlaceholderSet();
	}

	BootStrapWysiHtml.prototype.isCompatible = function() {
		return this.editor.isCompatible();
	}

	BootStrapWysiHtml.prototype.setValue = function(html, parse) {
		this.editor.setValue(html, parse || true);
	}

	BootStrapWysiHtml.prototype.destroy = function() {
		this.editor.destroy();
	}

	// WYSIHTML PLUGIN DEFINITION
	// ==========================

	var old = $.fn.wysihtml

	$.fn.wysihtml = function (option /*, value */) {
		if (typeof option == 'string' && $(this).length == 1) {
			var data = $(this).eq(0).data('bs.wysihtml');
			if (data) {
				return typeof data[option] == 'function' ?
					data[option].apply(
						data, 
						Array.prototype.slice.call( arguments, 1 )
					) :
					data[option];
			}
		} else {
			return this.each(function () {
				var $this   = $(this);
				var data    = $this.data('bs.wysihtml');
				var options = $.extend({}, 
					BootStrapWysiHtml.DEFAULTS, 
					$this.data(), 
					typeof option == 'object' && option
				);
				if (!data) {
					$this.data('bs.wysihtml', (data = new BootStrapWysiHtml(this, options)));
				}
				if (typeof option == 'string' && typeof data[option] == 'function') { 
					data[option].apply(
						data,
						Array.prototype.slice.call( arguments, 1 )
					);
				}
			});
		}
	}

	$.fn.wysihtml.Constructor = BootStrapWysiHtml

	// DATEPICKER NO CONFLICT
	// ====================

	$.fn.wysihtml.noConflict = function () {
		$.fn.wysihtml = old
		return this
	}

}));

// EXTRA COMMANDS FOR WYSIHTML
// ===========================
wysihtml.commands.fontName = (function() {
	var REG_EXP = /wysiwyg-font-name-[0-9a-z\-]+/g;

	return {
		exec: function(composer, command, name) {
			wysihtml.commands.formatInline.exec(composer, command, {className: "wysiwyg-font-name-" + name, classRegExp: REG_EXP, toggle: true});
		},

		state: function(composer, command, name) {
			return wysihtml.commands.formatInline.state(composer, command, {className: "wysiwyg-font-name-" + name});
		}
	};
})();

wysihtml.commands.fontNameStyle = (function() {
	return {
		exec: function(composer, command, name) {
			if (!(/^\s*$/).test(name)) {
				wysihtml.commands.formatInline.exec(composer, command, {styleProperty: "font-family", styleValue: name, toggle: false});
			}
		},

		state: function(composer, command, name) {
			return wysihtml.commands.formatInline.state(composer, command, {styleProperty: "font-family", styleValue: name || undefined});
		},

		remove: function(composer, command) {
			return wysihtml.commands.formatInline.remove(composer, command, {styleProperty: "font-family"});
		},

		stateValue: function(composer, command) {
			var styleStr,
				st = this.state(composer, command);

			if (st && wysihtml.lang.object(st).isArray()) {
				st = st[0];
			}
			if (st) {
				styleStr = st.getAttribute("style");
				if (styleStr) {
					var re = new RegExp("(^|\\s|;)font-family\\s*:\\s*[^;$]+", "gi");
					var params = stylesStr.match(re);
					if (params) {
						params = params[params.length - 1].split(":")[1];
						params = params.replace(/^\s+/, '').replace(/\s+$/, '');
						return params;
					}
				}
			}
			return false;
		}
	};
})();

wysihtml.commands.hiliteColor = (function() {
	var REG_EXP = /wysiwyg-hilite-color-[0-9a-z]+/g;

	return {
		exec: function(composer, command, color) {
			wysihtml.commands.formatInline.exec(composer, command, {className: "wysiwyg-hilite-color-" + color, classRegExp: REG_EXP, toggle: true});
		},

		state: function(composer, command, color) {
			return wysihtml.commands.formatInline.state(composer, command, {className: "wysiwyg-hilite-color-" + color});
		}
	};
})();

wysihtml.commands.fullscreen = (function() {

	return {
		exec: function(composer, command) {

			var editor = composer.commands.editor;
			var elem = composer.editableArea.parentElement;
			var editable = elem.querySelector('.wysihtml-editable');
			var toolbar = elem.querySelector('.wysihtml-toolbar');

			function onResize() {
				composer.editableArea.style.height = editable.style.height = (window.innerHeight - toolbar.offsetHeight) + 'px';
				wysihtml.dom.copyStyles(['height', 'width']).from(composer.editableArea).to(composer.blurStylesHost).andTo(composer.focusStylesHost);
			}
			
			if (elem.classList.contains('fullscreen')) {
				window.removeEventListener('resize', onResize, false);
				elem.classList.remove('fullscreen');
				composer.editableArea.style.height = editable.style.height = editable.getAttribute('data-original-height');
				composer.editableArea.style.width = editable.style.width = editable.getAttribute('data-original-width');
				wysihtml.dom.copyStyles(['height', 'width']).from(composer.editableArea).to(composer.blurStylesHost).andTo(composer.focusStylesHost);
				document.querySelector('body').style.overflow = 'visible';
				editor.fire("normalscreen:composer", elem.querySelector('.wysihtml-toolbar .fullscreen a'));
			} else {
				elem.classList.add('fullscreen');
				editable.setAttribute('data-original-height', composer.editableArea.style.height);
				editable.setAttribute('data-original-width', composer.editableArea.style.width);
				composer.editableArea.style.width = editable.style.width = '100%';
				editor.fire("fullscreen:composer", elem.querySelector('.wysihtml-toolbar .fullscreen a'));
				document.querySelector('body').style.overflow = 'hidden';
				window.addEventListener('resize', onResize, false);
				window.dispatchEvent(new Event('resize'));
			}
		}
	};
})();

(function($){
	$.fn.visible = function(evenPartially, container){
		if (this.length < 1) {
			return false;
		}
		container = container || $(this).parents('body');
		var pos = { 
			top: container.offset().top,
			left: container.offset().left,
			width: container.outerWidth(),
			height: container.outerHeight()
		};
		var t = $(this).get(0),
			clientSize = t.offsetWidth * t.offsetHeight ;
		var rect = t.getBoundingClientRect(),
			topVisibility = rect.top >= 0 && rect.top < pos.height,
			bottomVisibility = rect.bottom > 0 && rect.bottom <= pos.height,
			leftVisibility = rect.left >= 0 && rect.left <  pos.width,
			rightVisibility = rect.right > 0 && rect.right <= pos.width,
			verticalVisibility = evenPartially ? 
				topVisibility || bottomVisibility :
				topVisibility && bottomVisibility,
			horizontalVisibility = evenPartially ?
				leftVisibility || rightVisibility :
				leftVisibility && rightVisibility,
			verticalVisibility = (rect.top < 0 && rect.bottom > pos.height) ?
				true :
				verticalVisibility,
			horizontalVisibility = (rect.left < 0 && rect.right > pos.width) ?
				true : 
				horizontalVisibility;
		return clientSize && verticalVisibility && horizontalVisibility;
	};

	$.fn.hasStyleProperty = function(property) {
		var style = $(this).attr('style');
		var re = new RegExp('\\b' + property + '\\s*:\\s*[^;]+;');
		return style && property && re.test(style);
	};

	$.fn.hasStylePropertyValue = function(property, value) {
		var style = $(this).attr('style');
		var re = new RegExp('\\b' + property + '\\s*:\\s*'+ value + '\\s*;');
		return style && property && value && re.test(style);
	};

	$.fn.getStylePropertyValue = function(property) {
		var style = $(this).attr('style');
		var re = new RegExp('\\b' + property + '\\s*:\\s*([^;]+);');
		var match = style.match(re);
		return match ? $.trim(match[1]) : false;
	};

	$.fn.removeStyleProperty = function() {
		for (var p = 0; p < arguments.length; p++) {
			$(this).css(arguments[p], '');
		}
		var style = $(this).attr('style');
		if (style && style == '') {
			$(this).removeAttr('style');
		}
	};


})(jQuery);
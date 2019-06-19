/*
The MIT License (MIT)

Copyright (c) 2019 Jacques Archimède

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

(function () {
	"use strict";

	Date.msPERDAY = 1000 * 60 * 60 * 24;

	Date.locale = "en-us";

	Date.format = "d/m/Y";
	Date.inputFormat = "j/n/Y";

	Date.makeRegExp = function() {
		var matches = Date.inputFormat.match(/(j|n|Y)([^jnY]+)(j|n|Y)([^jnY]+)(j|n|Y)/);
		var regPart = [];
		var replacePart = [];
		for (var i = 1; i <= 5; i += 2) {
			if (matches[i] == 'j') {
				regPart.push('(\\d{1,2})');
				replacePart.push('$1');
			} else if (matches[i] == 'n') {
				regPart.push('(\\d{1,2})');
				replacePart.push('$2');
			} else {
				regPart.push('(\\d{4})');
				replacePart.push('$3');
			}
		}
		Date.regexp = regPart[0] + matches[2] + regPart[1] + matches[4] + regPart[2];
		Date.replacement = replacePart.join('.');
	}

	Date.setRegionalSettings = function(settings) {
		var locale = settings.locale.toLowerCase();
		if (! Date.locales[locale]) {
			locale = locale.substr(0, 2);
		}
		Date.locale = locale;
		Date.format = settings.dateFormat;
		Date.inputFormat = settings.dateFormat.replace('d', 'j').replace('m', 'n');
		Date.makeRegExp();
	}

	Date.easter = function(year) {
		try {
			year = Number( year );
			if ( year != year ) { 
				throw new TypeError( "Value must be a number." );
			}
			else if ( year > 275760 || year < -271820 ) {
				throw new RangeError( "Value be between -271820 and 275760 due to technical limitations of Date constructor." );
			}
		}
		catch ( e ) { console && console.log( e ); }
	 
		year = Math.floor( year );
		var c = Math.floor( year / 100 );
		var n = year - 19 * Math.floor( year / 19 );
		var k = Math.floor( ( c - 17 ) / 25 );
		var i = c - Math.floor( c / 4 ) - Math.floor( ( c - k ) / 3 ) + 19 * n + 15;
		i = i - 30 * Math.floor( i / 30 );
		i = i - Math.floor( i / 28 ) * ( 1 - Math.floor( i / 28 ) * Math.floor( 29 / ( i + 1 ) ) * Math.floor( ( 21 - n ) / 11 ) );
		var j = year + Math.floor( year / 4 ) + i + 2 - c + Math.floor( c / 4 );
		j = j - 7 * Math.floor( j / 7 );
		var l = i - j;
		var m = 3 + Math.floor( ( l + 40 ) / 44 );
		var d = l + 28 - 31 * Math.floor( m / 4 );
		var z = new Date();
		z.setFullYear( year, m-1, d );
		z.setHours(0,0,0,0);
		return z;
	};

	Date.nthDayOfMonth = function(nth, day, month, year) {
		var date = Date.createFromFormat("Y-n-j", year + "-" + month + "-01" );
		while(date.getDay()!=day){
			date.setDate(date.getDate()+1) ;
		}
		date.setDate(date.getDate() + (nth - 1) * 7);
		return date;
	}

	Date.holidaysOfYear = function(year, lang) {
		var country = "US";
		if (lang) {
			var c = lang.split("-");
			c = c[c.length - 1].toUpperCase();
			if (Date.holidays[c]) {
				country = c;
			}
		}
		var fixed =  Date.holidays[country].fixed_holidays;
		var holidays =  Date.holidays[country].moveable_holidays(year);
		$.each(fixed, function( d, monthday ) {
			holidays.push(Date.createFromFormat("Y-n-j", year + "-" + monthday));
		});
		return holidays;
	};

	Date.prototype.msPERDAY = Date.msPERDAY;

	Date.prototype.copy = function () { 
		return new Date( +this ); 
	};

	Date.prototype.workingDaysBefore = function(endDate) {
		// Validate input
		if (endDate < this)
			return 0;

		// Calculate days between dates
		var startDate = this.copy();
		startDate.setHours(0,0,0,1);  // Start just after midnight
		endDate.setHours(23,59,59,999);  // End just before midnight

		var diff = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());  // Milliseconds between datetime objects    
		var days = Math.ceil(diff / this.msPERDAY) + 1;

		// Subtract two weekend days for every week in between
		var weeks = Math.floor(days / 7);
		var days = days - (weeks * 2);

		// Handle special cases
		var startDay = startDate.getDay();
		var endDay = endDate.getDay();

		// Remove weekend not previously removed.   
		if (startDay - endDay > 1)
			days = days - 2;

		// Remove start day if span starts on Sunday but ends before Saturday
		if (startDay == 0 && endDay != 6)
			days = days - 1;

		// Remove end day if span ends on Saturday but starts after Sunday
		if (endDay == 6 && startDay != 0)
			days = days - 1;  

		var locale = Date.locale ? Date.locale : "en-us";
		var startYear = startDate.getFullYear();
		var endYear = endDate.getFullYear();
		startDate.setHours(0,0,0,0);
		for (var y = startYear; y <= endYear; y++) {
			var holidays = Date.holidaysOfYear(y, locale);
			$.each(holidays, function( h, holiday ) {
				var d = holiday.getDay();
				if (d != 0 && d != 6 && holiday >= startDate && holiday <= endDate)
					days = days - 1;
			});
		}
		return days;
	};

	Date.prototype.isWorkingDay = function() {
		var day = this.getDay();
		if (day == 0 || day == 6) {
			return false; 
		}
		var locale = Date.locale ? Date.locale : "en-us";
		var holidays = Date.holidaysOfYear(this.getFullYear(), locale);
		var isHoliday = false;
		var self = this;
		$.each(holidays, function( h, holiday ) {
			if (holiday == self) {
				isHoliday = true;
				return false;
			}
		});
		return ! isHoliday;
	}

	Date.prototype.nextWorkingDay = function() {
		var d = new Date(+this);
		while (! d.isWorkingDay()) {
			d.addDays(1); 
		}
		return d;
	};

	Date.prototype.firstDayOfMonth = function() {
		return new Date(this.getFullYear(), this.getMonth(), 1);
	};

	Date.prototype.lastDayOfMonth = function() {
		return new Date(this.getFullYear(), this.getMonth() + 1, 0);
	};

	Date.prototype.lastday = function() {
		var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
		return d.getDate();
	};

	Date.prototype.getDaysBetween = function(d) {
		var tmp = d.copy();
		tmp.setHours(this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
		var diff = tmp.getTime() - this.getTime();
		return Math.ceil(diff/this.msPERDAY);
	};

	Date.prototype.getDayOfYear = function() {
		var start = new Date(this.getFullYear(), 0, 0);
		return this.getDaysBetween(start) * -1;
	};

	Date.prototype.getDaysInMonth = function(){
		var d = new Date(this.getFullYear(), this.getMonth()+1, 0);
		return d.getDate();
	};

	Date.prototype.getWeekNumber = function(){
		var d = new Date(+this);
		d.setHours(0,0,0);
		d.setDate(d.getDate()+4-(d.getDay()||7));
		return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
	};

	Date.prototype.isLeapYear = function(utc) {
		var y = utc ? this.getUTCFullYear() : this.getFullYear();
		return !(y % 4) && (y % 100) || !(y % 400) ? true : false;
	};

	Date.prototype.addDays = function(d) {
		this.setTime( this.getTime() + d * Date.msPERDAY );
		return this;
	};

	Date.prototype.addWeeks = function(w) {
		this.addDays(w * 7);
		return this;
	};

	Date.prototype.addMonths = function(m) {
		var d = this.getDate();
		this.setMonth(this.getMonth() + m);
		if (this.getDate() < d)
			 this.setDate(0);
		return this;
	};

	Date.prototype.addYears = function(y) {
		var m = this.getMonth();
		this.setFullYear(this.getFullYear() + y);
		if (m < this.getMonth()) {
			this.setDate(0);
		}
		return this;
	};

	Date.prototype.addWeekDays = function(d) {
		var startDay = this.getDay();  //current weekday 0 thru 6
		var wkEnds = 0;                //# of weekends needed
		var partialWeek = d % 5;       //# of weekdays for partial week
		if (d < 0) {                   //subtracting weekdays 
			wkEnds = Math.ceil(d/5);   //negative number weekends
			switch (startDay) {
				case 6:                  //start Sat. 1 less weekend
					if (partialWeek == 0 && wkEnds < 0) 
					wkEnds++;
					break;
				case 0:                   //starting day is Sunday
					if (partialWeek == 0) 
						d++;              //decrease days to add
					else 
						d--;              //increase days to add
					break;
				default:
					if (partialWeek <= -startDay) 
						wkEnds--;
			}
		} else if (d > 0) {            //adding weekdays
			wkEnds = Math.floor(d/5);
			var w = wkEnds;
			switch (startDay) {
				case 6:
					/* If staring day is Sat. and
					 * no partial week one less day needed
					 * if partial week one more day needed
					 */
					if (partialWeek == 0) 
						d--;
					else 
						d++;
					break;
				case 0:        //Sunday
					if (partialWeek == 0 && wkEnds > 0) 
					wkEnds--;
					break;
				default:
					if (5 - day < partialWeek) 
						wkEnds++;
			}
		}
		d += wkEnds * 2;
		this.addDays(d);
		return this;
	};

	Date.prototype.getWeekDays = function(d) {
		var wkEnds = 0;
		var days = Math.abs(this.getDaysBetween(d));
		var startDay = 0, endDay = 0;
		if (days) {
			if (d < this) {
				startDay = d.getDay();
				endDay = this.getDay();
			} else {
				startDay = this.getDay();
				endDay = d.getDay();
			}
			wkEnds = Math.floor(days/7);
			if (startDay != 6 && startDay > endDay) 
				wkEnds++;
			if (startDay != endDay && (startDay == 6 || endDay == 6) ) 
				days--;
			days -= (wkEnds * 2);
		}
		return days;
	};

	Date.prototype.getMonthsBetween = function(d) {
		var sDate, eDate;   
		var d1 = this.getFullYear() * 12 + this.getMonth();
		var d2 = d.getFullYear() * 12 + d.getMonth();
		var sign;
		var months = 0;
		if (this == d) {
			months = 0;
		} else if (d1 == d2) { //same year and month
			months = (d.getDate() - this.getDate())/this.lastday();
		} else {
			if (d1 <  d2) {
				sDate = this;
				eDate = d;
				sign = 1;
			} else {
				sDate = d;
				eDate = this;
				sign = -1;
			}
			var sAdj = sDate.lastday() - sDate.getDate();
			var eAdj = eDate.getDate();
			var adj = (sAdj + eAdj)/sDate.lastday() -1;
			months = Math.abs(d2 - d1) + adj;
			months = (months * sign);
		}
		return months;
	};

	Date.prototype.getYearsBetween = function(d) {
		var months = this.getMonthsBetween(d);
		return months/12;
	};

	Date.prototype.getAge = function() {
		var today = new Date();
		return this.getYearsBetween(today).toFixed(2);
	};

	Date.prototype.sameDayEachWeek = function (day, date) {
		var aDays = new Array();
		var eDate, nextDate, adj;
		if (this > date) {
			eDate = this;
			nextDate = date.copy();
		} else {
			eDate = date;
			nextDate = this.copy();
		}
		adj = (day - nextDate.getDay() + 7) %7;
		nextDate.setDate(nextDate.getDate() + adj);
		while (nextDate < eDate) {
			aDays[aDays.length] = nextDate.copy();
			nextDate.setDate(nextDate.getDate() + 7);
		}
		return aDays;
	};

	Date.toDate = function(d) {
		var newDate;
		if (arguments.length == 0) {
			newDate = new Date();
		} else if (d instanceof Date) {
			newDate = new Date(d.getTime());
		} else if (typeof d == "string") {
			newDate = new Date(d);
		} else if (arguments.length >= 3) {
			var dte = [0, 0, 0, 0, 0, 0];
			for (var i = 0; i < arguments.length && i < 7; i++) {
				dte[i] = arguments[i];
			}
			newDate = new Date(dte[0], dte[1], dte[2], dte[3], dte[4], dte[5]);
		} else if (typeof d == "number") {
			newDate = new Date(d);
		} else {
			newDate = null;
		}  
		if (newDate == "Invalid Date")
			return null;
		else
			return newDate;
	};

	Date.prototype.setLocale = function (lang) {
		if (lang && lang in Date.locales) {
			Date.locale = lang;
		}
		return this;
	};

	Date.prototype.getLocale = function () {
		return Date.locale || "en";
	};

	Date.prototype.getMonthName = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (Date.locale && Date.locale in Date.locales) {
			locale = Date.locale;
		}
		return Date.locales[locale].month_names[this.getMonth()];
	};

	Date.prototype.getMonthNameShort = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (Date.locale && Date.locale in Date.locales) {
			locale = Date.locale;
		}
		return Date.locales[locale].month_names_short[this.getMonth()];
	};

	Date.prototype.getDayName = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (Date.locale && Date.locale in Date.locales) {
			locale = Date.locale;
		}
		return Date.locales[locale].day_names[this.getDay()];
	};

	Date.prototype.getDayNameShort = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (Date.locale && Date.locale in Date.locales) {
			locale = Date.locale;
		}
		return Date.locales[locale].day_names_short[this.getDay()];
	};

	Date.prototype.getDateSuffix = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (Date.locale && Date.locale in Date.locales) {
			locale = Date.locale;
		}
		return Date.locales[locale].date_suffix(this.getDate());
	};

	Date.prototype.getMeridiem = function (isLower, lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (Date.locale && Date.locale in Date.locales) {
			locale = Date.locale;
		}
		return Date.locales[locale].meridiem(this.getHours(), this.getMinutes(), isLower);
	};

	Date.prototype.getLastDate = function () {
		return (new Date(this.getFullYear(), this.getMonth() + 1, 0)).getDate();
	};

	/* languages from http://momentjs.com */

	Date.locales = {
		"en": {
			month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			month_names_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			day_names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			day_names_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			date_suffix: function (date) {
				var day10 = ~~ (date % 100 / 10);
				var day1 = date % 10;
				if (day10 === 1) {
					return "th";
				} else if (day1 === 1) {
					return "st";
				} else if (day1 === 2) {
					return "nd";
				} else if (day1 === 3) {
					return "rd";
				} else {
					return "th";
				}
			},
			meridiem : function (hour, minute, isLower) {
				if (hour < 12) {
					return isLower ? "am" : "AM";
				} else {
					return isLower ? "pm" : "PM";
				}
			}
		},
		"en-us": {
			month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			month_names_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			day_names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			day_names_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			date_suffix: function (date) {
				var day10 = ~~ (date % 100 / 10);
				var day1 = date % 10;
				if (day10 === 1) {
					return "th";
				} else if (day1 === 1) {
					return "st";
				} else if (day1 === 2) {
					return "nd";
				} else if (day1 === 3) {
					return "rd";
				} else {
					return "th";
				}
			},
			meridiem : function (hour, minute, isLower) {
				if (hour < 12) {
					return isLower ? "am" : "AM";
				} else {
					return isLower ? "pm" : "PM";
				}
			}
		},
		"ar-ma": {
			month_names: "يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر".split("_"),
			month_names_short: "يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر".split("_"),
			day_names: "الأحد_الإتنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),
			day_names_short: "احد_اتنين_ثلاثاء_اربعاء_خميس_جمعة_سبت".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem : function (hour, minute, isLower) {
				return "";
			}
		},
		"ar": {
			month_names: "يناير/ كانون الثاني_فبراير/ شباط_مارس/ آذار_أبريل/ نيسان_مايو/ أيار_يونيو/ حزيران_يوليو/ تموز_أغسطس/ آب_سبتمبر/ أيلول_أكتوبر/ تشرين الأول_نوفمبر/ تشرين الثاني_ديسمبر/ كانون الأول".split("_"),
			month_names_short: "يناير/ كانون الثاني_فبراير/ شباط_مارس/ آذار_أبريل/ نيسان_مايو/ أيار_يونيو/ حزيران_يوليو/ تموز_أغسطس/ آب_سبتمبر/ أيلول_أكتوبر/ تشرين الأول_نوفمبر/ تشرين الثاني_ديسمبر/ كانون الأول".split("_"),
			day_names: "الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),
			day_names_short: "الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"bg": {
			month_names: "януари_февруари_март_април_май_юни_юли_август_септември_октомври_ноември_декември".split("_"),
			month_names_short: "янр_фев_мар_апр_май_юни_юли_авг_сеп_окт_ное_дек".split("_"),
			day_names: "неделя_понеделник_вторник_сряда_четвъртък_петък_събота".split("_"),
			day_names_short: "нед_пон_вто_сря_чет_пет_съб".split("_"),
			date_suffix: function (date) {
				var lastDigit = date % 10,
					last2Digits = date % 100;
				if (date === 0) {
					return '-ев';
				} else if (last2Digits === 0) {
					return '-ен';
				} else if (last2Digits > 10 && last2Digits < 20) {
					return '-ти';
				} else if (lastDigit === 1) {
					return '-ви';
				} else if (lastDigit === 2) {
					return '-ри';
				} else if (lastDigit === 7 || lastDigit === 8) {
					return '-ми';
				} else {
					return '-ти';
				}
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"br": {
			month_names: "Genver_C'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu".split("_"),
			month_names_short: "Gen_C'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker".split("_"),
			day_names: "Sul_Lun_Meurzh_Merc'her_Yaou_Gwener_Sadorn".split("_"),
			day_names_short: "Sul_Lun_Meu_Mer_Yao_Gwe_Sad".split("_"),
			date_suffix: function (date) {
				return (date === 1) ? 'añ' : 'vet';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"bs": {
			month_names: "januar_februar_mart_april_maj_juni_juli_avgust_septembar_oktobar_novembar_decembar".split("_"),
			month_names_short: "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
			day_names: "nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),
			day_names_short: "ned._pon._uto._sri._čet._pet._sub.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ca": {
			month_names: "gener_febrer_març_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre".split("_"),
			month_names_short: "gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.".split("_"),
			day_names: "diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte".split("_"),
			day_names_short: "dg._dl._dt._dc._dj._dv._ds.".split("_"),
			date_suffix: function (date) {
				return "º";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"cs": {
			month_names: "leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec".split("_"),
			month_names_short: "led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro".split("_"),
			day_names: "neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota".split("_"),
			day_names_short: "ne_po_út_st_čt_pá_so".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"cv": {
			month_names: "кăрлач_нарăс_пуш_ака_май_çĕртме_утă_çурла_авăн_юпа_чӳк_раштав".split("_"),
			month_names_short: "кăр_нар_пуш_ака_май_çĕр_утă_çур_ав_юпа_чӳк_раш".split("_"),
			day_names: "вырсарникун_тунтикун_ытларикун_юнкун_кĕçнерникун_эрнекун_шăматкун".split("_"),
			day_names_short: "выр_тун_ытл_юн_кĕç_эрн_шăм".split("_"),
			date_suffix: function (date) {
				return "-мĕш";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"cy": {
			month_names: "Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr".split("_"),
			month_names_short: "Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag".split("_"),
			day_names: "Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn".split("_"),
			day_names_short: "Sul_Llun_Maw_Mer_Iau_Gwe_Sad".split("_"),
			date_suffix: function (date) {
				var b = date,
					output = '',
					lookup = [
						'', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
						'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
					];

				if (b > 20) {
					if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
						output = 'fed'; // not 30ain, 70ain or 90ain
					} else {
						output = 'ain';
					}
				} else if (b > 0) {
					output = lookup[b];
				}

				return output;
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"da": {
			month_names: "januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december".split("_"),
			month_names_short: "jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),
			day_names: "søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),
			day_names_short: "søn_man_tir_ons_tor_fre_lør".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"de": {
			month_names: "Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
			month_names_short: "Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
			day_names: "Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),
			day_names_short: "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"el": {
			month_names: "Ιανουαρίου_Φεβρουαρίου_Μαρτίου_Απριλίου_Μαΐου_Ιουνίου_Ιουλίου_Αυγούστου_Σεπτεμβρίου_Οκτωβρίου_Νοεμβρίου_Δεκεμβρίου".split("_"),
			month_names_short: "Ιαν_Φεβ_Μαρ_Απρ_Μαϊ_Ιουν_Ιουλ_Αυγ_Σεπ_Οκτ_Νοε_Δεκ".split("_"),
			day_names: "Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο".split("_"),
			day_names_short: "Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ".split("_"),
			date_suffix: function (date) {
				return "η";
			},
			meridiem: function (hour, minute, isLower) {
				if (hour > 11) {
					return isLower ? 'μμ' : 'ΜΜ';
				} else {
					return isLower ? 'πμ' : 'ΠΜ';
				}
			}
		},
		"en-au": {
			month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			month_names_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			day_names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			day_names_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			date_suffix: function (date) {
				var day10 = ~~ (date % 100 / 10);
				var day1 = date % 10;
				if (day10 === 1) {
					return "th";
				} else if (day1 === 1) {
					return "st";
				} else if (day1 === 2) {
					return "nd";
				} else if (day1 === 3) {
					return "rd";
				} else {
					return "th";
				}
			},
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return isLower ? "am" : "AM";
				} else {
					return isLower ? "pm" : "PM";
				}
			}
		},
		"en-ca": {
			month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			month_names_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			day_names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			day_names_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			date_suffix: function (date) {
				var day10 = ~~ (date % 100 / 10);
				var day1 = date % 10;
				if (day10 === 1) {
					return "th";
				} else if (day1 === 1) {
					return "st";
				} else if (day1 === 2) {
					return "nd";
				} else if (day1 === 3) {
					return "rd";
				} else {
					return "th";
				}
			},
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return isLower ? "am" : "AM";
				} else {
					return isLower ? "pm" : "PM";
				}
			}
		},
		"en-gb": {
			month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			month_names_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			day_names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			day_names_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			date_suffix: function (date) {
				var day10 = ~~ (date % 100 / 10);
				var day1 = date % 10;
				if (day10 === 1) {
					return "th";
				} else if (day1 === 1) {
					return "st";
				} else if (day1 === 2) {
					return "nd";
				} else if (day1 === 3) {
					return "rd";
				} else {
					return "th";
				}
			},
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return isLower ? "am" : "AM";
				} else {
					return isLower ? "pm" : "PM";
				}
			}
		},
		"eo": {
			month_names: "januaro_februaro_marto_aprilo_majo_junio_julio_aŭgusto_septembro_oktobro_novembro_decembro".split("_"),
			month_names_short: "jan_feb_mar_apr_maj_jun_jul_aŭg_sep_okt_nov_dec".split("_"),
			day_names: "Dimanĉo_Lundo_Mardo_Merkredo_Ĵaŭdo_Vendredo_Sabato".split("_"),
			day_names_short: "Dim_Lun_Mard_Merk_Ĵaŭ_Ven_Sab".split("_"),
			date_suffix: function (date) {
				return "a";
			},
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return isLower ? 'a.t.m.' : 'A.T.M.';
				} else {
					return isLower ? 'p.t.m.' : 'P.T.M.';
				}
			}
		},
		"es": {
			month_names: "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),
			month_names_short: "ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_"),
			day_names: "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),
			day_names_short: "dom._lun._mar._mié._jue._vie._sáb.".split("_"),
			date_suffix: function (date) {
				return "º";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"et": {
			month_names: "jaanuar_veebruar_märts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember".split("_"),
			month_names_short: "jaan_veebr_märts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets".split("_"),
			day_names: "pühapäev_esmaspäev_teisipäev_kolmapäev_neljapäev_reede_laupäev".split("_"),
			day_names_short: "P_E_T_K_N_R_L".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"eu": {
			month_names: "urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua".split("_"),
			month_names_short: "urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.".split("_"),
			day_names: "igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata".split("_"),
			day_names_short: "ig._al._ar._az._og._ol._lr.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"fa": {
			month_names: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
			month_names_short: 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
			day_names: 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
			day_names_short: 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return "قبل از ظهر";
				} else {
					return "بعد از ظهر";
				}
			},
			date_suffix: function (date) {
				return 'م';
			}
		},
		"fi": {
			month_names: "tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),
			month_names_short: "tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu".split("_"),
			day_names: "sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai".split("_"),
			day_names_short: "su_ma_ti_ke_to_pe_la".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"fo": {
			month_names: "januar_februar_mars_apríl_mai_juni_juli_august_september_oktober_november_desember".split("_"),
			month_names_short: "jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),
			day_names: "sunnudagur_mánadagur_týsdagur_mikudagur_hósdagur_fríggjadagur_leygardagur".split("_"),
			day_names_short: "sun_mán_týs_mik_hós_frí_ley".split("_"),
			date_suffix: function () {
				return '.';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"fr-ca": {
			month_names: "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
			month_names_short: "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
			day_names: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
			day_names_short: "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
			date_suffix: function (date) {
				return (date === 1 ? 'er' : '');
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"fr": {
			month_names: "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
			month_names_short: "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
			day_names: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
			day_names_short: "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
			date_suffix: function (date) {
				return (date === 1 ? 'er' : '');
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"fr-fr": {
			month_names: "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
			month_names_short: "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
			day_names: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
			day_names_short: "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
			date_suffix: function (date) {
				return (date === 1 ? 'er' : '');
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"gl": {
			month_names: "Xaneiro_Febreiro_Marzo_Abril_Maio_Xuño_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro".split("_"),
			month_names_short: "Xan._Feb._Mar._Abr._Mai._Xuñ._Xul._Ago._Set._Out._Nov._Dec.".split("_"),
			day_names: "Domingo_Luns_Martes_Mércores_Xoves_Venres_Sábado".split("_"),
			day_names_short: "Dom._Lun._Mar._Mér._Xov._Ven._Sáb.".split("_"),
			date_suffix: function (date) {
				return 'º';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"he": {
			month_names: "ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר".split("_"),
			month_names_short: "ינו׳_פבר׳_מרץ_אפר׳_מאי_יוני_יולי_אוג׳_ספט׳_אוק׳_נוב׳_דצמ׳".split("_"),
			day_names: "ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת".split("_"),
			day_names_short: "א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"hi": {
			month_names: 'जनवरी_फ़रवरी_मार्च_अप्रैल_मई_जून_जुलाई_अगस्त_सितम्बर_अक्टूबर_नवम्बर_दिसम्बर'.split("_"),
			month_names_short: 'जन._फ़र._मार्च_अप्रै._मई_जून_जुल._अग._सित._अक्टू._नव._दिस.'.split("_"),
			day_names: 'रविवार_सोमवार_मंगलवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split("_"),
			day_names_short: 'रवि_सोम_मंगल_बुध_गुरू_शुक्र_शनि'.split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "रात";
				} else if (hour < 10) {
					return "सुबह";
				} else if (hour < 17) {
					return "दोपहर";
				} else if (hour < 20) {
					return "शाम";
				} else {
					return "रात";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"hr": {
			month_names: "sječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac".split("_"),
			month_names_short: "sje._vel._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.".split("_"),
			day_names: "nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),
			day_names_short: "ned._pon._uto._sri._čet._pet._sub.".split("_"),
			date_suffix: function () {
				return '.';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"hu": {
			month_names: "január_február_március_április_május_június_július_augusztus_szeptember_október_november_december".split("_"),
			month_names_short: "jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec".split("_"),
			day_names: "vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat".split("_"),
			day_names_short: "vas_hét_kedd_sze_csüt_pén_szo".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return isLower === true ? 'de' : 'DE';
				} else {
					return isLower === true ? 'du' : 'DU';
				}
			},
			date_suffix: function () {
				return '.';
			}
		},
		"hy-am": {
			month_names: 'հունվար_փետրվար_մարտ_ապրիլ_մայիս_հունիս_հուլիս_օգոստոս_սեպտեմբեր_հոկտեմբեր_նոյեմբեր_դեկտեմբեր'.split('_'),
			month_names_short: 'հնվ_փտր_մրտ_ապր_մյս_հնս_հլս_օգս_սպտ_հկտ_նմբ_դկտ'.split('_'),
			day_names: 'կիրակի_երկուշաբթի_երեքշաբթի_չորեքշաբթի_հինգշաբթի_ուրբաթ_շաբաթ'.split('_'),
			day_names_short: "կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "գիշերվա";
				} else if (hour < 12) {
					return "առավոտվա";
				} else if (hour < 17) {
					return "ցերեկվա";
				} else {
					return "երեկոյան";
				}
			}
		},
		"id": {
			month_names: "Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember".split("_"),
			month_names_short: "Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des".split("_"),
			day_names: "Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu".split("_"),
			day_names_short: "Min_Sen_Sel_Rab_Kam_Jum_Sab".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 11) {
					return 'pagi';
				} else if (hour < 15) {
					return 'siang';
				} else if (hour < 19) {
					return 'sore';
				} else {
					return 'malam';
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"is": {
			month_names: "janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember".split("_"),
			month_names_short: "jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des".split("_"),
			day_names: "sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur".split("_"),
			day_names_short: "sun_mán_þri_mið_fim_fös_lau".split("_"),
			date_suffix: function () {
				return '.';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"it": {
			month_names: "Gennaio_Febbraio_Marzo_Aprile_Maggio_Giugno_Luglio_Agosto_Settembre_Ottobre_Novembre_Dicembre".split("_"),
			month_names_short: "Gen_Feb_Mar_Apr_Mag_Giu_Lug_Ago_Set_Ott_Nov_Dic".split("_"),
			day_names: "Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato".split("_"),
			day_names_short: "Dom_Lun_Mar_Mer_Gio_Ven_Sab".split("_"),
			date_suffix: function () {
				return 'º';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ja": {
			month_names: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
			month_names_short: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
			day_names: "日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日".split("_"),
			day_names_short: "日_月_火_水_木_金_土".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return "午前";
				} else {
					return "午後";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"ka": {
			month_names: 'იანვარი_თებერვალი_მარტი_აპრილი_მაისი_ივნისი_ივლისი_აგვისტო_სექტემბერი_ოქტომბერი_ნოემბერი_დეკემბერი'.split('_'),
			month_names_short: "იან_თებ_მარ_აპრ_მაი_ივნ_ივლ_აგვ_სექ_ოქტ_ნოე_დეკ".split("_"),
			day_names: 'კვირა_ორშაბათი_სამშაბათი_ოთხშაბათი_ხუთშაბათი_პარასკევი_შაბათი'.split('_'),
			day_names_short: "კვი_ორშ_სამ_ოთხ_ხუთ_პარ_შაბ".split("_"),
			date_suffix: function (date) {
				if (date === 0) {
					return "";
				}

				if (date === 1) {
					return "-ლი";
				}

				if ((date < 20) || (date <= 100 && (date % 20 === 0)) || (date % 100 === 0)) {
					return "მე-";
				}

				return "-ე";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"km": {
			month_names: "មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ".split("_"),
			month_names_short: "មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ".split("_"),
			day_names: "អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍".split("_"),
			day_names_short: "អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ko": {
			month_names: "1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),
			month_names_short: "1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),
			day_names: "일요일_월요일_화요일_수요일_목요일_금요일_토요일".split("_"),
			day_names_short: "일_월_화_수_목_금_토".split("_"),
			date_suffix: function (date) {
				return "일";
			},
			meridiem: function (hour, minute, isLower) {
				return hour < 12 ? '오전' : '오후';
			}
		},
		"lb": {
			month_names: "Januar_Februar_Mäerz_Abrëll_Mee_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
			month_names_short: "Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
			day_names: "Sonndeg_Méindeg_Dënschdeg_Mëttwoch_Donneschdeg_Freideg_Samschdeg".split("_"),
			day_names_short: "So._Mé._Dë._Më._Do._Fr._Sa.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"lt": {
			month_names: "sausio_vasario_kovo_balandžio_gegužės_biržėlio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio".split("_"),
			month_names_short: "sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd".split("_"),
			day_names: "pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis_sekmadienis".split("_"),
			day_names_short: "Sek_Pir_Ant_Tre_Ket_Pen_Šeš".split("_"),
			date_suffix: function (date) {
				return "-oji";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"lv": {
			month_names: "janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris".split("_"),
			month_names_short: "jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec".split("_"),
			day_names: "svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena".split("_"),
			day_names_short: "Sv_P_O_T_C_Pk_S".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"mk": {
			month_names: "јануари_февруари_март_април_мај_јуни_јули_август_септември_октомври_ноември_декември".split("_"),
			month_names_short: "јан_фев_мар_апр_мај_јун_јул_авг_сеп_окт_ное_дек".split("_"),
			day_names: "недела_понеделник_вторник_среда_четврток_петок_сабота".split("_"),
			day_names_short: "нед_пон_вто_сре_чет_пет_саб".split("_"),
			date_suffix: function (date) {
				var lastDigit = date % 10,
					last2Digits = date % 100;
				if (date === 0) {
					return '-ев';
				} else if (last2Digits === 0) {
					return '-ен';
				} else if (last2Digits > 10 && last2Digits < 20) {
					return '-ти';
				} else if (lastDigit === 1) {
					return '-ви';
				} else if (lastDigit === 2) {
					return '-ри';
				} else if (lastDigit === 7 || lastDigit === 8) {
					return '-ми';
				} else {
					return '-ти';
				}
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ml": {
			month_names: 'ജനുവരി_ഫെബ്രുവരി_മാർച്ച്_ഏപ്രിൽ_മേയ്_ജൂൺ_ജൂലൈ_ഓഗസ്റ്റ്_സെപ്റ്റംബർ_ഒക്ടോബർ_നവംബർ_ഡിസംബർ'.split("_"),
			month_names_short: 'ജനു._ഫെബ്രു._മാർ._ഏപ്രി._മേയ്_ജൂൺ_ജൂലൈ._ഓഗ._സെപ്റ്റ._ഒക്ടോ._നവം._ഡിസം.'.split("_"),
			day_names: 'ഞായറാഴ്ച_തിങ്കളാഴ്ച_ചൊവ്വാഴ്ച_ബുധനാഴ്ച_വ്യാഴാഴ്ച_വെള്ളിയാഴ്ച_ശനിയാഴ്ച'.split("_"),
			day_names_short: 'ഞായർ_തിങ്കൾ_ചൊവ്വ_ബുധൻ_വ്യാഴം_വെള്ളി_ശനി'.split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "രാത്രി";
				} else if (hour < 12) {
					return "രാവിലെ";
				} else if (hour < 17) {
					return "ഉച്ച കഴിഞ്ഞ്";
				} else if (hour < 20) {
					return "വൈകുന്നേരം";
				} else {
					return "രാത്രി";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"mr": {
			month_names: 'जानेवारी_फेब्रुवारी_मार्च_एप्रिल_मे_जून_जुलै_ऑगस्ट_सप्टेंबर_ऑक्टोबर_नोव्हेंबर_डिसेंबर'.split("_"),
			month_names_short: 'जाने._फेब्रु._मार्च._एप्रि._मे._जून._जुलै._ऑग._सप्टें._ऑक्टो._नोव्हें._डिसें.'.split("_"),
			day_names: 'रविवार_सोमवार_मंगळवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split("_"),
			day_names_short: 'रवि_सोम_मंगळ_बुध_गुरू_शुक्र_शनि'.split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "रात्री";
				} else if (hour < 10) {
					return "सकाळी";
				} else if (hour < 17) {
					return "दुपारी";
				} else if (hour < 20) {
					return "सायंकाळी";
				} else {
					return "रात्री";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"ms-my": {
			month_names: "Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember".split("_"),
			month_names_short: "Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis".split("_"),
			day_names: "Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu".split("_"),
			day_names_short: "Ahd_Isn_Sel_Rab_Kha_Jum_Sab".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 11) {
					return 'pagi';
				} else if (hour < 15) {
					return 'tengahari';
				} else if (hour < 19) {
					return 'petang';
				} else {
					return 'malam';
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"nb": {
			month_names: "januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),
			month_names_short: "jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.".split("_"),
			day_names: "søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),
			day_names_short: "sø._ma._ti._on._to._fr._lø.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ne": {
			month_names: 'जनवरी_फेब्रुवरी_मार्च_अप्रिल_मई_जुन_जुलाई_अगष्ट_सेप्टेम्बर_अक्टोबर_नोभेम्बर_डिसेम्बर'.split("_"),
			month_names_short: 'जन._फेब्रु._मार्च_अप्रि._मई_जुन_जुलाई._अग._सेप्ट._अक्टो._नोभे._डिसे.'.split("_"),
			day_names: 'आइतबार_सोमबार_मङ्गलबार_बुधबार_बिहिबार_शुक्रबार_शनिबार'.split("_"),
			day_names_short: 'आइत._सोम._मङ्गल._बुध._बिहि._शुक्र._शनि.'.split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 3) {
					return "राती";
				} else if (hour < 10) {
					return "बिहान";
				} else if (hour < 15) {
					return "दिउँसो";
				} else if (hour < 18) {
					return "बेलुका";
				} else if (hour < 20) {
					return "साँझ";
				} else {
					return "राती";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"nl": {
			month_names: "januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),
			month_names_short: "jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.".split("_"),
			day_names: "zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),
			day_names_short: "zo._ma._di._wo._do._vr._za.".split("_"),
			date_suffix: function (date) {
				return ((date === 1 || date === 8 || date >= 20) ? 'ste' : 'de');
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"nn": {
			month_names: "januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),
			month_names_short: "jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),
			day_names: "sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag".split("_"),
			day_names_short: "sun_mån_tys_ons_tor_fre_lau".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"pl": {
			month_names: "styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień".split("_"),
			month_names_short: "sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru".split("_"),
			day_names: "niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota".split("_"),
			day_names_short: "nie_pon_wt_śr_czw_pt_sb".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"pt-br": {
			month_names: "janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),
			month_names_short: "jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),
			day_names: "domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado".split("_"),
			day_names_short: "dom_seg_ter_qua_qui_sex_sáb".split("_"),
			date_suffix: function (date) {
				return "º";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"pt": {
			month_names: "janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),
			month_names_short: "jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),
			day_names: "domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado".split("_"),
			day_names_short: "dom_seg_ter_qua_qui_sex_sáb".split("_"),
			date_suffix: function (date) {
				return "º";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ro": {
			month_names: "ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie".split("_"),
			month_names_short: "ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.".split("_"),
			day_names: "duminică_luni_marți_miercuri_joi_vineri_sâmbătă".split("_"),
			day_names_short: "Dum_Lun_Mar_Mie_Joi_Vin_Sâm".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ru": {
			month_names: 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
			month_names_short: 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split('_'),
			day_names: 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
			day_names_short: "вс_пн_вт_ср_чт_пт_сб".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "ночи";
				} else if (hour < 12) {
					return "утра";
				} else if (hour < 17) {
					return "дня";
				} else {
					return "вечера";
				}
			},
			date_suffix: function (date) {
				return '-го';
			}
		},
		"sk": {
			month_names: "január_február_marec_apríl_máj_jún_júl_august_september_október_november_december".split("_"),
			month_names_short: "jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec".split("_"),
			day_names: "nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota".split("_"),
			day_names_short: "ne_po_ut_st_št_pi_so".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"sl": {
			month_names: "januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december".split("_"),
			month_names_short: "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
			day_names: "nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota".split("_"),
			day_names_short: "ned._pon._tor._sre._čet._pet._sob.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"sq": {
			month_names: "Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_Nëntor_Dhjetor".split("_"),
			month_names_short: "Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_Nën_Dhj".split("_"),
			day_names: "E Diel_E Hënë_E Martë_E Mërkurë_E Enjte_E Premte_E Shtunë".split("_"),
			day_names_short: "Die_Hën_Mar_Mër_Enj_Pre_Sht".split("_"),
			meridiem: function (hour, minute, isLower) {
				return hour < 12 ? 'PD' : 'MD';
			},
			date_suffix: function (date) {
				return ".";
			}
		},
		"sr-cyr": {
			month_names: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
			month_names_short: ['јан.', 'феб.', 'мар.', 'апр.', 'мај', 'јун', 'јул', 'авг.', 'сеп.', 'окт.', 'нов.', 'дец.'],
			day_names: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
			day_names_short: ['нед.', 'пон.', 'уто.', 'сре.', 'чет.', 'пет.', 'суб.'],
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"sr": {
			month_names: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
			month_names_short: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
			day_names: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'],
			day_names_short: ['ned.', 'pon.', 'uto.', 'sre.', 'čet.', 'pet.', 'sub.'],
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"sv": {
			month_names: "januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),
			month_names_short: "jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),
			day_names: "söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag".split("_"),
			day_names_short: "sön_mån_tis_ons_tor_fre_lör".split("_"),
			date_suffix: function (number) {
				var b = number % 10,
					output = (~~(number % 100 / 10) === 1) ? 'e' :
					(b === 1) ? 'a' :
					(b === 2) ? 'a' :
					(b === 3) ? 'e' : 'e';
				return output;
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ta": {
			month_names: 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split("_"),
			month_names_short: 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split("_"),
			day_names: 'ஞாயிற்றுக்கிழமை_திங்கட்கிழமை_செவ்வாய்கிழமை_புதன்கிழமை_வியாழக்கிழமை_வெள்ளிக்கிழமை_சனிக்கிழமை'.split("_"),
			day_names_short: 'ஞாயிறு_திங்கள்_செவ்வாய்_புதன்_வியாழன்_வெள்ளி_சனி'.split("_"),
			date_suffix: function (date) {
				return 'வது';
			},
			meridiem: function (hour, minute, isLower) {
				if (hour >= 6 && hour <= 10) {
					return " காலை";
				} else if (hour >= 10 && hour <= 14) {
					return " நண்பகல்";
				} else if (hour >= 14 && hour <= 18) {
					return " எற்பாடு";
				} else if (hour >= 18 && hour <= 20) {
					return " மாலை";
				} else if (hour >= 20 && hour <= 24) {
					return " இரவு";
				} else if (hour >= 0 && hour <= 6) {
					return " வைகறை";
				}
			}
		},
		"th": {
			month_names: "มกราคม_กุม� าพันธ์_มีนาคม_เมษายน_พฤษ� าคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),
			month_names_short: "มกรา_กุม� า_มีนา_เมษา_พฤษ� า_มิถุนา_กรกฎา_สิงหา_กันยา_ตุลา_พฤศจิกา_ธันวา".split("_"),
			day_names: "อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์".split("_"),
			day_names_short: "อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return "ก่อนเที่ยง";
				} else {
					return "หลังเที่ยง";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"tl-ph": {
			month_names: "Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre".split("_"),
			month_names_short: "Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis".split("_"),
			day_names: "Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado".split("_"),
			day_names_short: "Lin_Lun_Mar_Miy_Huw_Biy_Sab".split("_"),
			date_suffix: function (number) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"tr": {
			month_names: "Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık".split("_"),
			month_names_short: "Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara".split("_"),
			day_names: "Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi".split("_"),
			day_names_short: "Paz_Pts_Sal_Çar_Per_Cum_Cts".split("_"),
			date_suffix: function (number) {
				if (number === 0) { // special case for zero
					return number + "'ıncı";
				}
				var a = number % 10,
					b = number % 100 - a,
					c = number >= 100 ? 100 : null;

				return (suffixes[a] || suffixes[b] || suffixes[c]);
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"tzm-la": {
			month_names: "innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir".split("_"),
			month_names_short: "innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir".split("_"),
			day_names: "asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas".split("_"),
			day_names_short: "asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"tzm": {
			month_names: "ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ".split("_"),
			month_names_short: "ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ".split("_"),
			day_names: "ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ".split("_"),
			day_names_short: "ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"uk": {
			month_names: 'січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень'.split('_'),
			month_names_short: "січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд".split("_"),
			day_names: 'неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота'.split('_'),
			day_names_short: "нд_пн_вт_ср_чт_пт_сб".split("_"),
			date_suffix: function (date) {
				return "-го";
			},
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "ночі";
				} else if (hour < 12) {
					return "ранку";
				} else if (hour < 17) {
					return "дня";
				} else {
					return "вечора";
				}
			}
		},
		"uz": {
			month_names: "январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),
			month_names_short: "янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек".split("_"),
			day_names: "Якшанба_Душанба_Сешанба_Чоршанба_Пайшанба_Жума_Шанба".split("_"),
			day_names_short: "Якш_Душ_Сеш_Чор_Пай_Жум_Шан".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"vi": {
			month_names: "tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split("_"),
			month_names_short: "Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),
			day_names: "chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy".split("_"),
			day_names_short: "CN_T2_T3_T4_T5_T6_T7".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"zh-cn": {
			month_names: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
			month_names_short: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
			day_names: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
			day_names_short: "周日_周一_周二_周三_周四_周五_周六".split("_"),
			meridiem: function (hour, minute, isLower) {
				var hm = hour * 100 + minute;
				if (hm < 600) {
					return "凌晨";
				} else if (hm < 900) {
					return "早上";
				} else if (hm < 1130) {
					return "上午";
				} else if (hm < 1230) {
					return "中午";
				} else if (hm < 1800) {
					return "下午";
				} else {
					return "晚上";
				}
			},
			date_suffix: function (number, period) {
				return number + "日";

			}
		},
		"zh-tw": {
			month_names: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
			month_names_short: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
			day_names: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
			day_names_short: "週日_週一_週二_週三_週四_週五_週六".split("_"),
			meridiem: function (hour, minute, isLower) {
				var hm = hour * 100 + minute;
				if (hm < 900) {
					return "早上";
				} else if (hm < 1130) {
					return "上午";
				} else if (hm < 1230) {
					return "中午";
				} else if (hm < 1800) {
					return "下午";
				} else {
					return "晚上";
				}
			},
			date_suffix: function (number, period) {
				return number + "日";
			}

		}
	};

	Date.holidays = {
		"FR": {
			fixed_holidays: ["01-01", "05-01", "05-08", "07-14", "08-15", "11-01", "11-11", "12-25"],
			moveable_holidays: function(year) {
				var holidays = [];
				var easter = Date.easter(year);
				holidays.push(easter.copy());
				holidays.push(easter.addDays(1).copy());
				holidays.push(easter.addDays(38).copy());
				holidays.push(easter.addDays(10).copy());
				holidays.push(easter.addDays(1).copy());
				return holidays;
			}
		},
		"US": {
			fixed_holidays: [],
			moveable_holidays: function(year) {
				return [];
			}
		},
	};

	Date.prototype.format = function (formatString) {

		var addPadding = function (value, length) {
			var negative = ((value < 0) ? "-" : "");
			var zeros = "0";
			for (var i = 2; i < length; i++) {
				zeros += "0";
			}
			return negative + (zeros + Math.abs(value).toString()).slice(-length);
		};

		var replacements = {
			date: this,
			d: function () {
				return addPadding(this.date.getDate(), 2);
			},
			D: function () {
				return this.date.getDayNameShort();
			},
			j: function () {
				return this.date.getDate();
			},
			l: function () {
				return this.date.getDayName();
			},
			N: function () {
				return this.date.getDay() + 1;
			},
			S: function () {
				return this.date.getDateSuffix();
			},
			w: function () {
				return this.date.getDay();
			},
			z: function () {
				return this.date.getDayOfYear();
			},
			W: function () {
				return this.date.getWeekNumber();
			},
			F: function () {
				return this.date.getMonthName();
			},
			m: function () {
				return addPadding((this.date.getMonth() + 1), 2);
			},
			M: function () {
				return this.date.getMonthNameShort();
			},
			n: function () {
				return this.date.getMonth() + 1;
			},
			t: function () {
				return this.date.getDaysInMonth();
			},
			L: function () {
				return this.date.isLeapYear() ? 1 : 0;
			},
			o: function () {
				return this.date.getFullYear();
			},
			Y: function () {
				return this.date.getFullYear();
			},
			y: function () {
				return this.date.getFullYear() % 100;
			},
			a: function () {
				return this.date.getMeridiem(true);
			},
			A: function () {
				return this.date.getMeridiem(false);
			},
			H: function () {
				return addPadding(this.date.getHours(), 2);
			},
			G: function () {
				return this.date.getHours();
			},
			h: function () {
				var hour = this.date.getHours();
				if (hour > 12) {
					hour -= 12;
				} else if (hour < 1) {
					hour = 12;
				}
				return addPadding(hour, 2);
			},
			g: function () {
				var hour = this.date.getHours();
				if (hour > 12) {
					hour -= 12;
				} else if (hour < 1) {
					hour = 12;
				}
				return hour;
			},
			i: function () {
				return addPadding(this.date.getMinutes(), 2);
			},
			s: function () {
				return addPadding(this.date.getSeconds(), 2);
			},
			u: function () {
				return Math.floor(this.date.getMilliseconds() * 1000);
			},
			Z: function () {
				return this.date.getTimezoneOffset() * 60;
			},
			P: function () {
				return Math.floor(-this.date.getTimezoneOffset() / 60) + ":" + addPadding(-this.date.getTimezoneOffset() % 60, 2);
			}
		};


		var formats = new Array();
		while (formatString.length > 0) {
			if (formatString[0] === "\"") {
				var temp = /"[^"]*"/m.exec(formatString);
				if (temp === null) {
					formats.push(formatString.substring(1));
					formatString = "";
				} else {
					temp = temp[0].substring(1, temp[0].length - 1);
					formats.push(temp);
					formatString = formatString.substring(temp.length + 2);
				}
			} else if (formatString[0] === "'") {
				var temp = /'[^']*'/m.exec(formatString);
				if (temp === null) {
					formats.push(formatString.substring(1));
					formatString = "";
				} else {
					temp = temp[0].substring(1, temp[0].length - 1);
					formats.push(temp);
					formatString = formatString.substring(temp.length + 2);
				}
			} else if (formatString[0] === "\\") {
				if (formatString.length > 1) {
					formats.push(formatString.substring(1, 2));
					formatString = formatString.substring(2);
				} else {
					formats.push("\\");
					formatString = "";
				}
			} else {
				var foundMatch = false;
				for (var i = formatString.length; i > 0; i--) {
					if (formatString.substring(0, i) in replacements) {
						formats.push(replacements[formatString.substring(0, i)]());
						formatString = formatString.substring(i);
						foundMatch = true;
						break;
					}
				}
				if (!foundMatch) {
					formats.push(formatString[0]);
					formatString = formatString.substring(1);
				}
			}
		}

		return formats.join("");
	};

	Date.createFromFormat = function (format, value) {
		var now = new Date();
		var parsed = {
			date: now.getDate(),
			year: now.getFullYear(),
			month: now.getMonth(),
			hours: 0,
			minutes:  0,
			seconds:  0,
			milliseconds: 0
		};
		try { 
			for(var i = 0; i < format.length; i++) {
				var f = format.charAt(i);
				switch (f) {
					case 'd':
						parsed.date = parseInt(value.substring(0, 2), 10);
						value = value.substring(2);
						break;
					case 'j':
						var next = parseInt(value.charAt(1), 10);
						var len = (next >= 0 && next <= 9 ) ? 2 : 1;
						parsed.date = parseInt(value.substring(0, len), 10);
						value = value.substring(len);
						break;
					case 'F':
						var months = Date.locales[this.getLocale()].month_names;
						var len = months[0].length;
						var month = value.substring(0, len);
						value = value.substring(len);
						for (var m = 0; m < 12; m++) {
							if (months[m] == month) {
								parsed.month = m;
								break;
							}
						}
						break;
					case 'M':
						var months = Date.locales[this.getLocale()].month_names_short;
						var len = months[0].length;
						var month = value.substring(0, len);
						value = value.substring(len);
						for (var m = 0; m < 12; m++) {
							if (months[m] == month) {
								parsed.month = m;
								break;
							}
						}
						break;
					case 'm':
						parsed.month = parseInt(value.substring(0, 2), 10) - 1;
						value = value.substring(2);
						break;
					case 'n':
						var next = parseInt(value.charAt(1), 10);
						var len = (next >= 0 && next <= 9 ) ? 2 : 1;
						parsed.month = parseInt(value.substring(0, len), 10) - 1;
						if (parsed.month > 11) {
							throw new Error('Invalid month');
						}
						value = value.substring(len);
						break;
					case 'o':
					case 'Y':
						parsed.year = parseInt(value.substring(0, 4), 10);
						value = value.substring(4);
						break;
					case 'y':
						var year = parseInt(value.substring(0, 2), 10);
						parsed.year = (year > 50 ) ? year + 1900 : year + 2000;
						value = value.substring(2);
						break;
					case 'H':
						parsed.hours = parseInt(value.substring(0, 2), 10);
						value = value.substring(2);
						break;
					case 'G':
						var next = parseInt(value.charAt(1), 10);
						var len = (next >= 0 && next <= 9 ) ? 2 : 1;
						parsed.hours = parseInt(value.substring(0, len), 10);
						value = value.substring(len);
						break;
					case 'i':
						parsed.minutes = parseInt(value.substring(0, 2), 10);
						value = value.substring(2);
						break;
					case 's':
						parsed.seconds = parseInt(value.substring(0, 2), 10);
						value = value.substring(2);
						break;
					case 'u':
						var len = 0;
						for (var i = 0; i < value.length; i++) {
							if (value.charAt(i) < '0' || value.charAt(i) > '9') {
								break;
							}
							len++;
						}
						parsed.milliseconds = parseInt(value.substring(0, len), 10) / 1000;
						value = value.substring(len);
					   break;
					default:
						value = value.substring(1);
				}
			}
			if (parsed.year > 9999) {
				throw 'Invalid year';
			}
			if (parsed.month > 11) {
				throw 'Invalid month';
			}
			if (!(parsed.year % 4) && (parsed.year % 100) || !(parsed.year % 400)) { // leap year
				if (parsed.date < 1 || (parsed.month == 1 && parsed.date > 29)) {
					throw 'Invalid day';
				}
			} else {
				if (parsed.date < 1 || (parsed.month == 1 && parsed.date > 28)) {
					throw 'Invalid day';
				}
			}
			if (parsed.hours > 23) {
				throw 'Invalid hours';
			}
			if (parsed.minutes > 59) {
				throw 'Invalid minutes';
			}
			if (parsed.seconds > 59) {
				throw 'Invalid seconds';
			}
			return new Date(parsed.year, parsed.month, parsed.date, parsed.hours, parsed.minutes, parsed.seconds, parsed.milliseconds);
		} catch(err) {
			throw "Date parsing error : " + err;
		}
	};

	Date.isDate = function(value){
		var re = new RegExp("^" + Date.regexp + "$");
		return re.test(value);
	};

})();

(function (global) {
	'use strict';

	function MoneyFunction() {
	};

	MoneyFunction.decimalPoint = '.';
	MoneyFunction.moneySymbol = '$';
	MoneyFunction.symbolPosition = 'before';
	MoneyFunction.groupingSeparator = ',';
	MoneyFunction.groupingSize = 3;

	MoneyFunction.setRegionalSettings = function(settings) {
		MoneyFunction.decimalPoint = settings.decimalPoint;
		MoneyFunction.moneySymbol = settings.moneySymbol;
		MoneyFunction.symbolPosition = settings.symbolPosition;
		MoneyFunction.groupingSeparator = settings.groupingSeparator;
		MoneyFunction.groupingSize = settings.groupingSize;
	}

	global.MoneyFunction = MoneyFunction;

}(this));

(function (global) {
	'use strict';

	function Token(type, value) {
		this.type  = type;
		this.arity = 0;
		this.value = value;
	};

	Token.TYPE = {
		T_UNDEFINED			: 0,
		T_NUMBER	  		: 1,  
		T_DATE				: 2, 
		T_BOOLEAN			: 3, 
		T_TEXT				: 4, 
		T_ANY				: 5, 
		T_IDENT				: 6,  
		T_FUNCTION			: 7,  
		T_ARRAY				: 8,  
		T_POPEN				: 9,  
		T_PCLOSE			: 10, 
		T_SBOPEN			: 11,  
		T_SBCLOSE			: 12, 
		T_COMMA				: 13, 
		T_NOOP				: 14, 
		T_PLUS				: 15, 
		T_MINUS				: 16, 
		T_TIMES				: 17, 
		T_DIV				: 18, 
		T_MOD				: 19, 
		T_POW				: 20, 
		T_UNARY_PLUS		: 21, 
		T_UNARY_MINUS		: 22, 
		T_NOT				: 23, 
		T_FIELD				: 24, 
		T_EQUAL				: 25,
		T_NOT_EQUAL			: 26,
		T_LESS_THAN			: 27,
		T_LESS_OR_EQUAL		: 28,
		T_GREATER_THAN		: 29,
		T_GREATER_OR_EQUAL	: 30,
		T_CONTAINS			: 31,
		T_NOT_CONTAINS		: 32,
		T_BITWISE_AND		: 33,
		T_BITWISE_OR		: 34,
		T_BITWISE_XOR		: 35,
		T_LOGICAL_AND		: 36,
		T_LOGICAL_OR		: 37,
		T_TERNARY			: 38,
		T_TERNARY_ELSE		: 39,
		T_DEGRE				: 40,

		A_NONE				: 0,
		A_LEFT				: 1,
		A_RIGHT				: 2
	};

	Token.prototype = {
		isUnaryOperator: function (){
			switch (this.type) {
				case Token.TYPE.T_NOT:
				case Token.TYPE.T_UNARY_PLUS:
				case Token.TYPE.T_UNARY_MINUS:
				case Token.TYPE.T_TERNARY_ELSE:
				case Token.TYPE.T_DEGRE:
					return true;
			}
			return false;
		},

		isBinaryOperator: function (){
			switch (this.type) {
				case Token.TYPE.T_POW:
				case Token.TYPE.T_TIMES:
				case Token.TYPE.T_DIV:
				case Token.TYPE.T_MOD:
				case Token.TYPE.T_PLUS:
				case Token.TYPE.T_MINUS:
				case Token.TYPE.T_BITWISE_AND:
				case Token.TYPE.T_BITWISE_OR:
				case Token.TYPE.T_BITWISE_XOR:
				case Token.TYPE.T_LOGICAL_AND:
				case Token.TYPE.T_LOGICAL_OR:
					return true;
			}
			return false;
		},

		isTernaryOperator: function (){
			switch (this.type) {
				case Token.TYPE.T_TERNARY:
					return true;
			}
			return false;
		},

		isOperator: function (){
			return this.isUnaryOperator() 
				|| this.isBinaryOperator() 
				|| this.isTernaryOperator();
		},

		isComparator: function (){
			switch (this.type) {
				case Token.TYPE.T_EQUAL:
				case Token.TYPE.T_NOT_EQUAL:
				case Token.TYPE.T_LESS_THAN:
				case Token.TYPE.T_LESS_OR_EQUAL:
				case Token.TYPE.T_GREATER_THAN:
				case Token.TYPE.T_GREATER_OR_EQUAL:
				case Token.TYPE.T_CONTAINS:
				case Token.TYPE.T_NOT_CONTAINS:
					return true;
			}
			return false;
		},

		isVariable: function(){
			switch (this.type) {
				case Token.TYPE.T_IDENT:
				case Token.TYPE.T_FIELD:
				case Token.TYPE.T_UNDEFINED:
					return true;
			}
			return false;
		},

		isUndefined: function(){
			return this.type == Token.TYPE.T_UNDEFINED;
		},

		isBeforeFunctionArgument: function (){
			switch (this.type) {
				case Token.TYPE.T_POPEN:
				case Token.TYPE.T_COMMA:
				case Token.TYPE.T_NOOP:
					return true;
			}
			return false;
		},

		precedence: function (){
			switch (this.type) {
				case Token.TYPE.T_POPEN:
				case Token.TYPE.T_PCLOSE:
				case Token.TYPE.T_POW:
					return 1;
				case Token.TYPE.T_NOT:
				case Token.TYPE.T_UNARY_PLUS:
				case Token.TYPE.T_UNARY_MINUS:
				case Token.TYPE.T_DEGRE:
					return 2;
				case Token.TYPE.T_TIMES:
				case Token.TYPE.T_DIV:
				case Token.TYPE.T_MOD:
					return 3;
				case Token.TYPE.T_PLUS:
				case Token.TYPE.T_MINUS:
					return 4;
				case Token.TYPE.T_LESS_THAN:
				case Token.TYPE.T_LESS_OR_EQUAL:
				case Token.TYPE.T_GREATER_THAN:
				case Token.TYPE.T_GREATER_OR_EQUAL:
					return 6;
				case Token.TYPE.T_EQUAL:
				case Token.TYPE.T_NOT_EQUAL:
				case Token.TYPE.T_CONTAINS:
				case Token.TYPE.T_NOT_CONTAINS:
					return 7;
				case Token.TYPE.T_BITWISE_AND:
					return 8;
				case Token.TYPE.T_BITWISE_XOR:
					return 9;
				case Token.TYPE.T_BITWISE_OR:
					return 10;
				case Token.TYPE.T_LOGICAL_AND:
					return 11;
				case Token.TYPE.T_LOGICAL_OR:
					return 12;
				case Token.TYPE.T_TERNARY_ELSE:
					return 13;
				case Token.TYPE.T_TERNARY:
					return 14;
				case Token.TYPE.T_COMMA:
					return 15;
			}
			return 16;
		},

		associativity: function (){
			switch (this.type) {
				case Token.TYPE.T_POW:
				case Token.TYPE.T_NOT:
				case Token.TYPE.T_UNARY_PLUS:
				case Token.TYPE.T_UNARY_MINUS:
					return Token.TYPE.A_RIGHT;
				case Token.TYPE.T_DEGRE:
				case Token.TYPE.T_TIMES:
				case Token.TYPE.T_DIV:
				case Token.TYPE.T_MOD:
				case Token.TYPE.T_PLUS:
				case Token.TYPE.T_MINUS:
				case Token.TYPE.T_LESS_THAN:
				case Token.TYPE.T_LESS_OR_EQUAL:
				case Token.TYPE.T_GREATER_THAN:
				case Token.TYPE.T_GREATER_OR_EQUAL:
				case Token.TYPE.T_EQUAL:
				case Token.TYPE.T_NOT_EQUAL:
				case Token.TYPE.T_CONTAINS:
				case Token.TYPE.T_NOT_CONTAINS:
				case Token.TYPE.T_BITWISE_AND:
				case Token.TYPE.T_BITWISE_XOR:
				case Token.TYPE.T_BITWISE_OR:
				case Token.TYPE.T_LOGICAL_AND:
				case Token.TYPE.T_LOGICAL_OR:
				case Token.TYPE.T_TERNARY:
					return Token.TYPE.A_LEFT;
				case Token.TYPE.T_TERNARY_ELSE:
					return Token.TYPE.A_RIGHT;
				case Token.TYPE.T_COMMA:
					return Token.TYPE.A_LEFT;
			}
			return Token.TYPE.A_NONE;
		},

		toString: function () {
			switch (this.type) {
				case Token.TYPE.T_DATE:
					return this.value.format(Date.format);
					break;
				case Token.TYPE.T_BOOLEAN:
					return this.value ? 'true' : 'false';
					break;
				case Token.TYPE.T_FUNCTION:
					return this.value;
					break;
				case Token.TYPE.T_ARRAY:
					return JSON.stringify(this.value);
					break;
				default:
					return this.value.toString();
			}
		}
	};

	global.Token = Token;

}(this));

(function (global) {
	'use strict';

	function Expression(expression) {
		this.expression = expression;
		this.tokens = [];
		this.postfixed = false;
	};

	Expression.prototype = {
		get: function (){
			return this.tokens;
		},

		push: function (t){
			this.tokens.push(t);
		},

		pop: function (){
			return this.tokens.pop();
		},

		peek: function (){
			return this.tokens[this.tokens.length - 1];
		},

		postfix : function () {
			var stack = [];
			var rpn = [];

			$.each(this.tokens, function( t, token ) {
				switch (token.type) {
					case Token.TYPE.T_COMMA:
						while (stack.length != 0 && stack[stack.length-1].type != Token.TYPE.T_POPEN) {
							rpn.push(stack.pop());
						}
						if (stack.length > 1
							&& stack[stack.length-2].type == Token.TYPE.T_FUNCTION) {
							stack[stack.length-2].arity++;
						}
						break;
					case Token.TYPE.T_NUMBER:
					case Token.TYPE.T_DATE:
					case Token.TYPE.T_BOOLEAN:
					case Token.TYPE.T_TEXT:
					case Token.TYPE.T_ANY:
					case Token.TYPE.T_IDENT:
					case Token.TYPE.T_FIELD:
					case Token.TYPE.T_ARRAY:
					case Token.TYPE.T_UNDEFINED:
						rpn.push(token);
						break;
					case Token.TYPE.T_PCLOSE:
						while (stack.length != 0 && stack[stack.length-1].type != Token.TYPE.T_POPEN) {
							rpn.push(stack.pop());
						}
						if (stack.length == 0) {
							throw new Error("Closing parenthesis without opening parenthesis");
						}
						stack.pop();
						if (stack.length != 0
							&& stack[stack.length-1].type == Token.TYPE.T_FUNCTION) {
							stack[stack.length-1].arity++;
							rpn.push(stack.pop());
						}
						break;
					case Token.TYPE.T_POPEN:
					case Token.TYPE.T_FUNCTION:
						stack.push(token);
						break;
					default:
						if (token.isOperator() || token.isComparator()) {
							while (stack.length != 0
								&& (stack[stack.length-1].isOperator() || stack[stack.length-1].isComparator())
								&& ((token.associativity() == Token.TYPE.A_LEFT && token.precedence() >= stack[stack.length-1].precedence()) || (token.associativity() == Token.TYPE.A_RIGHT && token.precedence() > stack[stack.length-1].precedence()))) {
								rpn.push(stack.pop());
							}
							stack.push(token);
						} else {
							throw new Error("Unrecognized token " + token.value);
						}
						break;
				}
			});
			while (stack.length != 0 && stack[stack.length-1].type != Token.TYPE.T_POPEN) {
				rpn.push(stack.pop());
			}
			if (stack.length != 0) {
				throw new Error("Opening parenthesis without closing parenthesis");
			}
			this.tokens = rpn;
			this.postfixed = true;
		},

		setFields: function (fields) {
			$.each(this.tokens, function( t, token ) {
				if (token.type == Token.TYPE.T_FIELD && fields.length >= token.value) {
					var value = fields[token.value - 1];
					if ($.isArray(value)) {
						token.type = Token.TYPE.T_ARRAY;
						token.value = value;
					} else if ($.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = parseFloat(value);
					} else if (Date.isDate(value)) {
						token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat(Date.inputFormat, value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			});
		},

		setNamedFields: function (fields) {
			$.each(this.tokens, function( t, token ) {
				if (token.type == Token.TYPE.T_IDENT && typeof fields[token.value] !== 'undefined' && fields[token.value] !== null) {
					var value = fields[token.value];
					if ($.isArray(value)) {
						token.type = Token.TYPE.T_ARRAY;
						token.value = value;
					} else if ($.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = parseFloat(value);
					} else if (Date.isDate(value)) {
						token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat(Date.inputFormat, value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			});
		},

		setVariables: function (variables) {
			var completed = true;
			$.each(this.tokens, function( t, token ) {
				if (token.type == Token.TYPE.T_FIELD) {
					var value = variables['' + token.value];
					if (typeof value === 'undefined' || value === null || value.length == 0) {
						completed = false;
					} else if ($.isArray(value)) {
						token.type = Token.TYPE.T_ARRAY;
						token.value = value;
					} else if ($.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = parseFloat(value);
					} else if (Date.isDate(value)) {
						token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat(Date.inputFormat, value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				} else if (token.type == Token.TYPE.T_IDENT) {
					var value = variables[token.value];
					if (typeof value === 'undefined' || value === null || value.length == 0) {
						completed = false;
					} else if ($.isArray(value)) {
						token.type = Token.TYPE.T_ARRAY;
						token.value = value;
					} else if ($.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = parseFloat(value);
					} else if (Date.isDate(value)) {
						token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat(Date.inputFormat, value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			});
			return completed;
		},

		evaluate: function () {
			try {
				var ops = [];
				var self = this;
				$.each(this.tokens, function( t, token ) {
					if (token.isOperator()) {
						ops.push(self.operation(token, ops));
					} else if (token.isComparator()) {
						ops.push(self.comparison(token, ops));
					} else {
						switch (token.type) {
							case Token.TYPE.T_NUMBER:
							case Token.TYPE.T_DATE:
							case Token.TYPE.T_BOOLEAN:
							case Token.TYPE.T_TEXT:
							case Token.TYPE.T_ANY:
							case Token.TYPE.T_IDENT:
							case Token.TYPE.T_FIELD:
							case Token.TYPE.T_ARRAY:
							case Token.TYPE.T_UNDEFINED:
								ops.push(token);
								break;
							case Token.TYPE.T_FUNCTION:
								ops.push(self.func(token, ops));
								break;
							default:
								throw new Error("Unrecognized token " + token.value);
						}
					}
				});
				var result = ops[ops.length-1];
				return result.isVariable() ? false : '' + result;
			} catch (e) {
				return false;
			}
		},

		operation: function (op, args) {
			if (op.isUnaryOperator()) {
				if (args.length < 1) {
					throw new Error("Illegal number (" + args.length + ") of operands for " + op);
				}
				var arg1 = args.pop();
			} else if (op.isBinaryOperator()) {
				if (args.length < 2) {
					throw new Error("Illegal number (" + args.length + ") of operands for " + op);
				}
				var arg2 = args.pop();
				var arg1 = args.pop();
			} else if (op.isTernaryOperator()) {
				if (args.length < 3) {
					throw new Error("Illegal number (" + args.length + ") of operands for " + op);
				}
				var arg3 = args.pop();
				var arg2 = args.pop();
				var arg1 = args.pop();
			}
			var result = new Token(Token.TYPE.T_NUMBER, 0);
			switch (op.type) {
				case Token.TYPE.T_PLUS:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type == Token.TYPE.T_NUMBER) { 
						if (arg2.type == Token.TYPE.T_NUMBER) {
							result.value = arg1.value + arg2.value;
						} else if (arg2.type == Token.TYPE.T_DATE) {
							var date = arg2.value;
							date.addDays(arg1.value);
							result.type = Token.TYPE.T_DATE;
							result.value = date;
						} else if (arg2.type == Token.TYPE.T_TEXT) {
							result.type = Token.TYPE.T_TEXT;
							result.value = arg1.value.toString() + arg2.value;
						} else {
							throw  new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else if (arg1.type == Token.TYPE.T_DATE) {
						if (arg2.type == Token.TYPE.T_NUMBER) {
							var date = arg1.value;
							date.addDays(arg2.value);
							result.type = Token.TYPE.T_DATE;
							result.value = date;
						} else if (arg2.type == Token.TYPE.T_TEXT) {
							result.type = Token.TYPE.T_TEXT;
							result.value = arg1.value.format(Date.format) + arg2.value;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else if (arg1.type == Token.TYPE.T_TEXT) {
						result.type = Token.TYPE.T_TEXT;
						if (arg2.type == Token.TYPE.T_NUMBER) {
							result.value = arg1.value + arg2.value.toString();
						} else if (arg2.type == Token.TYPE.T_DATE) {
							result.value = arg1.value + arg2.value.format(Date.format);
						} else if (arg2.type == Token.TYPE.T_TEXT) {
							result.value = arg1.value + arg2.value;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else {
						throw new Error("Illegal argument '" + arg1 + "' for " + op);
					}
					break;
				case Token.TYPE.T_MINUS:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type == Token.TYPE.T_NUMBER) { 
						if (arg2.type == Token.TYPE.T_NUMBER) {
							result.value = arg1.value - arg2.value;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else if (arg1.type == Token.TYPE.T_DATE) {
						if (arg2.type == Token.TYPE.T_NUMBER) {
							var date = arg1.value;
							date.addDays(-arg2.value);
							result.type = Token.TYPE.T_DATE;
							result.value = date;
						} else if (arg2.type == Token.TYPE.T_DATE) {
							result.value = (arg1.value > arg2.value)
								? arg2.value.getDaysBetween(arg1.value)
								: 0;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else {
						throw new Error("Illegal argument '" + arg1 + "' for " + op);
					}
					break;
				case Token.TYPE.T_TIMES:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument '" + arg2 + "' : operands must be numbers for " + op);
					} else {
						result.value = arg1.value * arg2.value;
					}
					break;
				case Token.TYPE.T_DIV:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value / arg2.value;
					}
					break;
				case Token.TYPE.T_MOD:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value % arg2.value;
					}
					break;
				case Token.TYPE.T_POW:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = Math.pow(arg1.value, arg2.value);
					}
					break;
				case Token.TYPE.T_BITWISE_AND:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value & arg2.value;
					}
					break;
				case Token.TYPE.T_BITWISE_XOR:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value ^ arg2.value;
					}
					break;
				case Token.TYPE.T_BITWISE_OR:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value | arg2.value;
					}
					break;
				case Token.TYPE.T_LOGICAL_AND:
					result.type = Token.TYPE.T_BOOLEAN;
					if (arg1.type == Token.TYPE.T_BOOLEAN && arg2.type == Token.TYPE.T_BOOLEAN) {
						result.value = arg1.value && arg2.value;
					} else if (arg1.type == Token.TYPE.T_BOOLEAN) {
						if (! arg1.value) {
							result.value = false;
						} else if (arg2.isVariable()) {
							result.type = Token.TYPE.T_UNDEFINED;
							result.value = [arg1, arg2];
						} else {
							throw new Error("Illegal argument 2 : operand must be boolean for "+ op);
						}
					} else if (arg2.type == Token.TYPE.T_BOOLEAN) {
						if (! arg2.value) {
							result.value = false;
						} else if (arg1.isVariable()) {
							result.type = Token.TYPE.T_UNDEFINED;
							result.value = [arg1, arg2];
						} else {
							throw new Error("Illegal argument 1 : operand must be boolean for " + op);
						}
					} else if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else {
						throw new Error("Illegal argument : operands must be boolean for " + op);
					}
					break;
				case Token.TYPE.T_LOGICAL_OR:
					result.type = Token.TYPE.T_BOOLEAN;
					if (arg1.type == Token.TYPE.T_BOOLEAN && arg2.type == Token.TYPE.T_BOOLEAN) {
						result.value = arg1.value || arg2.value;
					} else if (arg1.type == Token.TYPE.T_BOOLEAN) {
						if (arg1.value) {
							result.value = true;
						} else if (arg2.isVariable()) {
							result.type = Token.TYPE.T_UNDEFINED;
							result.value = [arg1, arg2];
						} else {
							throw new Error("Illegal argument 2 : operand must be boolean for " + op);
						}
					} else if (arg2.type == Token.TYPE.T_BOOLEAN) {
						if (arg2.value) {
							result.value = true;
						} else if (arg1.isVariable()) {
							result.type = Token.TYPE.T_UNDEFINED;
							result.value = [arg1, arg2];
						} else {
							throw new Error("Illegal argument 1 : operand must be boolean for " + op);
						}
					} else if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else {
						throw new Error("Illegal argument : operands must be boolean for " + op);
					}
					break;
				case Token.TYPE.T_UNARY_PLUS:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1];
					} else if (arg1.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand must be a number for " + op);
					} else {
						result.value = arg1.value;
					}
					break;
				case Token.TYPE.T_UNARY_MINUS:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1];
					} else if (arg1.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand must be a number for " + op);
					} else {
						result.value = -arg1.value;
					}
					break;
				case Token.TYPE.T_NOT:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1];
					} else if (arg1.type != Token.TYPE.T_NUMBER && arg1.type != Token.TYPE.T_BOOLEAN) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand must be a number or a boolean for " + op);
					} else {
						result.type = arg1.type;
						result.value = !arg1.value;
					}
					break;
				case Token.TYPE.T_DEGRE:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1];
					} else if (arg1.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand must be a number for " + op);
					} else {
						result.value = arg1.value * Math.PI / 180;
					}
					break;
				case Token.TYPE.T_TERNARY_ELSE:
					result = arg1;
					break;
				case Token.TYPE.T_TERNARY:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2, arg3];
					} else if (arg1.type != Token.TYPE.T_BOOLEAN) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand 1 must be a condition for " + op);
					} else {
						result = arg1.value ? arg2 : arg3;
					}
					break;
			}
			this.guessType(result);
			return result;
		},

		comparison: function (op, args) {
			if (args.length < 2) {
				throw new Error("Illegal number (" + args.length + ") of operands for " + op);
			}
			var arg2 = args.pop();
			var arg1 = args.pop();
			var result;
			if (arg1.isVariable() || arg2.isVariable()) {
				result = new Token(Token.TYPE.T_UNDEFINED, [arg1, arg2]);
			} else if (op.type != Token.TYPE.T_CONTAINS && arg1.type != arg2.type) { 
				throw new Error("operand types for '" + op + "' are not identical");
			} else if (op.type == Token.TYPE.T_CONTAINS && arg1.type != Token.TYPE.T_ARRAY) { 
				throw new Error("first operand type for '" + op + "' is not an array");
			} else {
				result = new Token(Token.TYPE.T_BOOLEAN, false);
				switch (op.type) {
					case Token.TYPE.T_EQUAL:
						result.value = (arg1.value == arg2.value);
						break;
					case Token.TYPE.T_NOT_EQUAL:
						result.value = (arg1.value != arg2.value);
						break;
					case Token.TYPE.T_LESS_THAN:
						result.value = (arg1.value < arg2.value);
						break;
					case Token.TYPE.T_LESS_OR_EQUAL:
						result.value = (arg1.value <= arg2.value);
						break;
					case Token.TYPE.T_GREATER_THAN:
						result.value = (arg1.value > arg2.value);
						break;
					case Token.TYPE.T_GREATER_OR_EQUAL:
						result.value = (arg1.value >= arg2.value);
						break;
					case Token.TYPE.T_CONTAINS:
						result.value = $.isArray(arg1.value) && $.inArray(arg2.value.toString(), arg1.value) >= 0;
						break;
					case Token.TYPE.T_NOT_CONTAINS:
						result.value = ! $.isArray(arg1.value) || $.inArray(arg2.value.toString(), arg1.value) < 0;
						break;
				}
			}
			return result;
		},

		guessType : function (token) {
			if (token.type == Token.TYPE.T_TEXT) {
				if ($.isNumeric(token.value)) {
					token.type = Token.TYPE.T_NUMBER;
					token.value = parseFloat(token.value);
				} else if (Date.isDate(token.value)) {
					token.type = Token.TYPE.T_DATE;
					token.value = Date.createFromFormat(Date.inputFormat, token.value);
				} else if (token.value === 'true' || token.value === 'false') {
					token.type = Token.TYPE.T_BOOLEAN;
					token.value = token.value === 'true';
				}
			}
		},

		func: function (func, args) {
			var functions = {
				"abs": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.abs(a); }],
				"acos": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.acos(a); }],
				"acosh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.acosh(a); }],
				"addMonths": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_DATE], Token.TYPE.T_DATE, function(a, b) { return b.addMonths(a); }],
				"asin": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.asin(a); }],
				"asinh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.asinh(a); }],
				"atan": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.atan(a); }],
				"atan2": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { return Math.atan2(a, b); }],
				"atanh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.atanh(a); }],
				"ceil": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.ceil(a); }],
				"concat": [-1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) {
					var c = '';
					$.each(a, function(i, v) {
						c += v !== undefined ? v : '';
					});
					return c; 
				}],
				"cos": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.cos(a); }],
				"cosh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.cosh(a); }],
				"count": [-1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) {
					var c = 0;
					$.each(a, function(i, v) {
						if (v !== undefined) {
							c += 1;
						}
					});
					return c; 
				}],
				"day": [1, [Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a) { return a.getDate(); }],
				"exp": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.exp(a); }],
				"firstDayOfMonth": [1, [Token.TYPE.T_DATE], Token.TYPE.T_DATE, function(a) { return a.firstDayOfMonth(); }],
				"floor": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.floor(a); }],
				"fullmonth": [1, [Token.TYPE.T_DATE], Token.TYPE.T_TEXT, function(a) { return a.getMonthName('fr') + ' ' + a.format('Y'); }],
				"get": [2, [Token.TYPE.T_ARRAY, Token.TYPE.T_NUMBER], Token.TYPE.T_TEXT, function(a, b) { return b < a.lengh + 1 ? a[b - 1] : ''; }],
				"lastday": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { var d = Date.createFromFormat('Y-n-j', a + '-' + b + '-1' );return d.lastday(false); }],
				"lastDayOfMonth": [1, [Token.TYPE.T_DATE], Token.TYPE.T_DATE, function(a) { return a.lastDayOfMonth(); }],
				"lcfirst": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return a.replace(/(^[A-Z])/,function (p) { return p.toLowerCase(); } ); }],
				"length": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_NUMBER, function(a) { return a.length; }],
				"log": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.log(a); }],
				"log10": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.log10(a); }],
				"lower": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return a.toLowerCase(); }],
				"match": [2, [Token.TYPE.T_TEXT, Token.TYPE.T_TEXT], Token.TYPE.T_BOOLEAN, function(a, b) { return b.match(a) != null; }],
				"max": [-1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.max.apply(null, a); }],
				"min": [-1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.min.apply(null, a); }],
				"money": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_TEXT, function(a) { 
					return AutoNumeric.format(a, {
						currencySymbol: '',
						currencySymbolPlacement: MoneyFunction.symbolPosition == 'before' ? 'p' :'s',
						decimalCharacter: MoneyFunction.decimalPoint,
						decimalPlaces: 2,
						digitGroupSeparator: MoneyFunction.groupingSeparator,
						digitalGroupSpacing: MoneyFunction.groupingSize
					});
				}],
				"month": [1, [Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a) { return a.getMonth() + 1; }],
				"nextWorkDay": [1, [Token.TYPE.T_DATE], Token.TYPE.T_DATE, function(a) { return a.nextWorkingDay(); }],
				"pow": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { return Math.pow(a, b); }],
				"rand": [0, [], Token.TYPE.T_NUMBER, function() { return Math.random(); }],
				"replace": [3, [Token.TYPE.T_TEXT, Token.TYPE.T_TEXT, Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a, b, c) {
					var d = c;
					while (d.indexOf(a) >= 0){
						d = d.replace(a, b);
					}
					return d;
				}],
				"round": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.round(a); }],
				"sin": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sin(a); }],
				"sinh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sinh(a); }],
				"size": [1, [Token.TYPE.T_ARRAY], Token.TYPE.T_NUMBER, function(a) { return a.length; }],
				"split": [2, [Token.TYPE.T_TEXT, Token.TYPE.T_TEXT], Token.TYPE.T_ARRAY, function(a, b) { return b.split(a); }],
				"sqrt": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sqrt(a); }],
				"substr": [3, [Token.TYPE.T_TEXT, Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_TEXT, function(a, b, c) {
					if (b > 0) {
						b--;
					}
					return a.substr(b, c);
				}],
				"sum": [-1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) {
					var s = 0;
					$.each(a, function(i, v) {
						if (v !== undefined) {
							s += v;
						}
					});
					return s; 
				}],
				"tan": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.tan(a); }],
				"tanh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.tanh(a); }],
				"titlecase": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) {
					return a.toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|[-\s][\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function(letter) {
						return letter.toUpperCase();
					});
				}],
				"trim": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return $.trim(a); }],
				"ucfirst": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return a.replace(/(^[a-z])/,function (p) { return p.toUpperCase(); } ); }],
				"upper": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return a.toUpperCase(); }],
				"workdays": [2, [Token.TYPE.T_DATE, Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a, b) { return a.workingDaysBefore(b); }],
				"workdaysofmonth": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) {
					var d1 = Date.createFromFormat('Y-n-j', a + '-' + b + '-1' );
					var d2 = new Date(d1.getFullYear(), d1.getMonth() + 1, 0);
					return d1.workingDaysBefore(d2); 
				}],
				"year": [1, [Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a) { return a.getFullYear(); }]
			};
			if (func.value === "defined") {
				if (args.length < 1) { 
					throw new Error("Illegal number (" + args.length + ") of operands for function" + func);
				}
				var arg = args.pop();
				if (arg.isVariable()) {
					return new Token(Token.TYPE.T_BOOLEAN, false);
				}
				if (typeof arg.value === "undefined" || arg.value === null || arg.value === "") {
					return new Token(Token.TYPE.T_BOOLEAN, false);
				}
				return new Token(Token.TYPE.T_BOOLEAN, true);
			}
			if (typeof functions[func.value] === "undefined" || functions[func.value] === null) {
				throw new Error("Unknown function : " + func);
			}
			var argc = functions[func.value][0];
			var variableArgsCount = false;
			if (argc == -1) {
				argc = func.arity;
				variableArgsCount = true;
			}
			if (args.length < argc) {
				throw new Error("Illegal number (" + args.length + ") of operands for function" + func);
			}
			var argv = [];
			for (; argc > 0; --argc) {
				var arg = args.pop();
				if (! variableArgsCount) {
					if (arg.isVariable()) {
						return new Token(Token.TYPE.T_UNDEFINED, [arg]);
					}
					var type = functions[func.value][1][argc - 1];
					if (type == Token.TYPE.T_TEXT && (arg.type == Token.TYPE.T_NUMBER || arg.type == Token.TYPE.T_DATE)) {
						arg.value += '';
					} else if (arg.type != type) { 
						var expected = "";
						switch (type) {
							case Token.TYPE.T_NUMBER:
								expected = "number";
								break;
							case Token.TYPE.T_DATE: 
								expected = "date";
								break;
							case Token.TYPE.T_BOOLEAN:
								expected = "boolean";
								break;
							case Token.TYPE.T_TEXT: 
								expected = "text";
								break;
							case Token.TYPE.T_ARRAY: 
								expected = "array";
								break;
						}
						throw new Error("Illegal type for argument '" + arg + "' : operand must be a " + expected + " for " + func);
					}
				} else if (arg.isVariable()) {
					if (func.value == 'sum' || func.value == 'count' || func.value == 'concat') {
						arg.value = undefined;
					} else {
						return new Token(Token.TYPE.T_UNDEFINED, [arg]);
					}
				}
				argv.unshift(arg.value); 
			}
			if (variableArgsCount) {
				argv = [argv];
			}
			return new Token(functions[func.value][2], functions[func.value][3].apply(this, argv));
		}
	};

	global.Expression = Expression;

}(this));

(function (global) {
	'use strict';

	var PATTERN = /([\s!,\+\-\*\/\^%\(\)\[\]=<\>\~\&\^\|\?\:°])/g;

    var lookup = {
        '+': Token.TYPE.T_PLUS,
        '-': Token.TYPE.T_MINUS,
        '/': Token.TYPE.T_DIV,
        '%': Token.TYPE.T_MOD,
        '(': Token.TYPE.T_POPEN,
        ')': Token.TYPE.T_PCLOSE,
        '[': Token.TYPE.T_SBOPEN,
        ']': Token.TYPE.T_SBCLOSE,
        '*': Token.TYPE.T_TIMES,
        '!': Token.TYPE.T_NOT,
        ',': Token.TYPE.T_COMMA,
        '=': Token.TYPE.T_EQUAL,
        '<': Token.TYPE.T_LESS_THAN,
        '>': Token.TYPE.T_GREATER_THAN,
        '~': Token.TYPE.T_CONTAINS,
        '&': Token.TYPE.T_BITWISE_AND,
        '^': Token.TYPE.T_BITWISE_XOR,
        '|': Token.TYPE.T_BITWISE_OR,
        '?': Token.TYPE.T_TERNARY,
        ':': Token.TYPE.T_TERNARY_ELSE,
        '°': Token.TYPE.T_DEGRE
    };

	function ExpressionParser() {
		this.text = [];
	};

	ExpressionParser.prototype = {
		parse: function (infix) {
			var constants = {
				'pi'	: new Token(Token.TYPE.T_NUMBER, Math.PI),
				'now'	: new Token(Token.TYPE.T_DATE, new Date()),
				'today'	: new Token(Token.TYPE.T_DATE, new Date()),
				'true'	: new Token(Token.TYPE.T_BOOLEAN, true),
				'false'	: new Token(Token.TYPE.T_BOOLEAN, false)
			};
			var expr = new Expression(infix);
			var self = this;
			infix = infix.replace(/\\\'/g, '`');
			infix = infix.replace(/('[^']*')/g, function (match, m1, str) {
				self.text.push(m1.substr(1, m1.length - 2).replace(/`/g, "\'"));
				return "¤" + self.text.length;
			});
			infix = infix.replace(/\\\"/g, '`');
			infix = infix.replace(/("[^"]*")/g, function (match, m1, str) {
				self.text.push(m1.substr(1, m1.length - 2).replace(/`/g, '\"'));
				return "¤" + self.text.length;
			});
			infix = this.maskDate(infix);
			var toks = infix.split(PATTERN);
			var prev = new Token(Token.TYPE.T_NOOP, 'noop');
			$.each(toks, function( t, value ) {
				value = value.replace(/^\s+|\s+$/g, '');
				var matches;
				if ($.isNumeric(value)) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					expr.push(prev = new Token(Token.TYPE.T_NUMBER, parseFloat(value)));
				} else if (value.match(/^#\d+/)) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					expr.push(prev = new Token(Token.TYPE.T_FIELD, parseInt(value.substr(1), 10)));
				} else if (matches = value.match(/^¤(\d+)/)) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					var i = parseInt(matches[1], 10);
					expr.push(prev = new Token(Token.TYPE.T_TEXT, self.text[i - 1]));
				} else if (matches = value.match(/^D(\d{1,2})\.(\d{1,2})\.(\d{4})/)) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					var date = Date.createFromFormat("j/n/Y", matches[1] + "/" + matches[2] + "/" + matches[3]);
					expr.push(prev = new Token(Token.TYPE.T_DATE, date));
				} else if (constants[value]) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					expr.push(prev = constants[value]);
				} else if (value !== "") {
					var type;
					switch (type = lookup[value] ? lookup[value] : Token.TYPE.T_IDENT) {
						case Token.TYPE.T_EQUAL:
							switch (prev.type) {
								case Token.TYPE.T_NOT:
									expr.pop();
									type = Token.TYPE.T_NOT_EQUAL;
									value = "!=";
									break;
								case Token.TYPE.T_LESS_THAN:
									expr.pop();
									type = Token.TYPE.T_LESS_OR_EQUAL;
									value = "<=";
									break;
								case Token.TYPE.T_GREATER_THAN:
									expr.pop();
									type = Token.TYPE.T_GREATER_OR_EQUAL;
									value = ">=";
									break;
							}
							break;
						case Token.TYPE.T_CONTAINS:
							if (prev.type == Token.TYPE.T_NOT) {
								expr.pop();
								type = Token.TYPE.T_NOT_CONTAINS;
								value = "!~";
								break;
							}
						case Token.TYPE.T_BITWISE_AND:
							if (prev.type == Token.TYPE.T_BITWISE_AND) {
								expr.pop();
								type = Token.TYPE.T_LOGICAL_AND;
								value = "&&";
							}
							break;
						case Token.TYPE.T_BITWISE_OR:
							if (prev.type == Token.TYPE.T_BITWISE_OR) {
								expr.pop();
								type = Token.TYPE.T_LOGICAL_OR;
								value = "||";
							}
							break;
						case Token.TYPE.T_TIMES:
							if (prev.type == Token.TYPE.T_TIMES) {
								expr.pop();
								type = Token.TYPE.T_POW;
								value = "**";
							}
							break;
						case Token.TYPE.T_PLUS:
							if (prev.isOperator() || prev.isComparator() || prev.isBeforeFunctionArgument())
								type = Token.TYPE.T_UNARY_PLUS;
							break;

						case Token.TYPE.T_MINUS:
							if (prev.isOperator() || prev.isComparator() || prev.isBeforeFunctionArgument())
								type = Token.TYPE.T_UNARY_MINUS;
							break;

						case Token.TYPE.T_POPEN:
							switch (prev.type) {
								case Token.TYPE.T_IDENT:
									prev.type = Token.TYPE.T_FUNCTION;
									break;

								case Token.TYPE.T_NUMBER:
								case Token.TYPE.T_DATE:
								case Token.TYPE.T_BOOLEAN:
								case Token.TYPE.T_TEXT:
								case Token.TYPE.T_ARRAY:
								case Token.TYPE.T_PCLOSE:
									expr.push(new Token(Token.TYPE.T_TIMES, '*'));
									break;
							}
							break;

						case Token.TYPE.T_SBOPEN:
							t = expr.pop();
							expr.push(new Token(Token.TYPE.T_FUNCTION, 'get'));
							expr.push(new Token(Token.TYPE.T_POPEN, '('));
							expr.push(t);
							type = Token.TYPE.T_COMMA;
							value = ',';
							break;

						case Token.TYPE.T_SBCLOSE:
							type = Token.TYPE.T_PCLOSE;
							value = '(';
							break;

					}
					expr.push(prev = new Token(type, value));
				}
			});
			return expr;
		},

		maskDate: function (infix) {
			var re = new RegExp(Date.regexp, "g");
			return infix.replace(re, "D"+Date.replacement);
		}

	};

	global.ExpressionParser = ExpressionParser;
}(this));

(function (global) {
	'use strict';

	function RuleEngine(rules) {
		this.rulesData = rules.rulesData || [];
		this.actionsAdapter = rules.actionsAdapter;
	}

	RuleEngine.prototype = { 
		runAll: function(conditionsAdapter, cb) {
			var self = this;
			$.each(self.rulesData, function(r, rule) {
				self.run(r, conditionsAdapter, cb);
			});
		},

		run: function(ruleIndex, conditionsAdapter, cb) {
			var self = this;
			var rule = self.rulesData[ruleIndex];
			self.ifActions = rule.ifActions || [];
			self.elseActions = rule.elseActions || [];
			self.conditions = rule.conditions || {all: []};
			var out, error;
			self.matches(conditionsAdapter, function(err, result) {
				out = result;
				error = err;
				if (!err) {
					if (result) {
						self.runIfActions(self.actionsAdapter);
					} else {
						self.runElseActions(self.actionsAdapter);
					}
				}
				if (cb) {
					cb(err, result);
				}
			});
			if (!cb) {
				if (error) {
					throw error;
				}
				return out;
			}
		},

		matches: function(conditionsAdapter, cb) {
			var parser = new ExpressionParser();
			var expr = parser.parse(this.conditions);
			expr.postfix();
			expr.setVariables(conditionsAdapter);
			var result = expr.evaluate();
			if (result === false) {
				var e = "Syntax error";
				if (cb) {
					cb(e, result);
				}
			} else {
				if (cb) {
					cb(null, result === 'true');
				} else {
					return result === 'true';
				}
			}
		},

		runIfActions: function(actionsAdapter) {
			for (var i=0; i < this.ifActions.length; i++) {
				var actionData = this.ifActions[i];
				var actionName = actionData.value;
				var actionFunction = actionsAdapter[actionName]
				if (actionFunction) { 
					actionFunction(new Finder(actionData)); 
				}
			}
		},

		runElseActions: function(actionsAdapter) {
			for (var i=0; i < this.elseActions.length; i++) {
				var actionData = this.elseActions[i];
				var actionName = actionData.value;
				var actionFunction = actionsAdapter[actionName]
				if (actionFunction) { 
					actionFunction(new Finder(actionData)); 
				}
			}
		},

	 
	};

	function Finder(data) {
		this.data = data;
	}

	Finder.prototype = {
		find: function() {
		  var currentNode = this.data;
		  for (var i=0; i < arguments.length; i++) {
			var name = arguments[i];
			currentNode = findByName(name, currentNode);
			if (!currentNode) { 
				return null; 
			}
		  }
		  return currentNode.value;
		}
	};

	function findByName(name, node) {
		var fields = node.fields || [];
		for (var i=0; i < fields.length; i++) {
			var field = fields[i];
			if (field.name === name) {
				return field;
			}
		}
		return null;
	}

	global.RuleEngine = RuleEngine;
}(this));

(function (global) {
	'use strict';

	function G6k(options) {
		this.isDynamic = options.dynamic;
		this.isMobile = options.mobile;
		Date.setRegionalSettings(options);
		MoneyFunction.setRegionalSettings(options);
		this.locale = Date.locale;
		this.dateFormat = Date.format;
		this.inputDateFormat = Date.inputFormat;
		this.decimalPoint = MoneyFunction.decimalPoint;
		this.moneySymbol = MoneyFunction.moneySymbol;
		this.symbolPosition = MoneyFunction.symbolPosition;
		this.groupingSeparator = MoneyFunction.groupingSeparator;
		this.groupingSize = MoneyFunction.groupingSize;
		this.parser = new ExpressionParser();
		this.rulesengine = null;
		this.simu = null;
		this.currentProfil = null;
		this.variables = {};
		this.sourceRequestsQueue = [];
		this.sourceRequestRunning = false;
		this.sourceRequestsCache = {};
		this.lastUserInputName = "";
		this.lastSubmitBtn = null;
		this.hasFatalError = false;
		this.hasGlobalError = false;
		this.hasError = false;
		this.basePath = window.location.pathname.replace(/\/[^\/]+$/, "");
	};

	G6k.prototype = {
		run: function () {
			var self = this;
			this.variables['script'] = 1;
			$("div.help-panel dl dt").append('<a title="Fermer" href="javascript:">X</a>');
			$("div.help-panel dl dt a").click(function() {
				$(this).parents(".help-panel").parent().find('[data-toggle=collapse]').trigger('click');
			});
			$("input[type='reset'], button[type='reset']").click(function() {
				$('#g6k_form').clearForm();
				$("input.resettable").val("");
				if (self.isDynamic) {
					self.variables = {};
					$.each(self.simu.datas, function( name, data ) {
						self.getData(name).modifiedByUser = false;
						$("#" + name + ".output").text("");
						self.resetDataValue(data);
						self.removeError(name);
						self.removeWarning(name);
						if (typeof data.unparsedContent !== "undefined" && data.unparsedContent !== "") {
							var content = self.evaluate(data.unparsedContent);
							if (content !== false) {
								if (content && data.type === "multichoice" && ! $.isArray(content)) {
									if (/\[\]$/.test(content)) {
										content = JSON.parse(content);
									} else {
										content = [content];
									}
								} else if (content && (data.type === "money" || data.type === "percent")) {
									content = self.unFormatValue(content);
									content = parseFloat(content).toFixed(data.round || 2);
								} else if (content && data.type === "number") {
									content = self.unFormatValue(content);
									if (data.round) {
										content = parseFloat(content).toFixed(data.round);
									}
								}
								data.value = content;
								self.setVariable(name, data);
							} else if (data.value !== '') {
								data.value = '';
								self.setVariable(name, data);
							}
						}
						self.reevaluateFields(name);
					});
					self.removeGlobalError();
					if ( $("div.foot-notes").children("div.foot-note").filter(":visible").length) {
						$("div.foot-notes").show().removeAttr('aria-hidden');
					} else {
						$("div.foot-notes").attr('aria-hidden', true).hide();
					}
				}
			});
			var collapseAllButton = $(".step-page .blockinfo-container .collapse-expand-all-tools button:first-child"),
				expandAllButton = $(".step-page .blockinfo-container .collapse-expand-all-tools button:last-child");
			collapseAllButton.on("click", function(e) {
				var scope = $(this).parents('.blockinfo-container');
				scope.find(".chapter-label > h3 > button.btn-collapse[aria-expanded=true]").trigger("click");
				e.stopPropagation();
				return false;
			});
			expandAllButton.on("click", function(e) {
				var scope = $(this).parents('.blockinfo-container');
				scope.find(".chapter-label > h3 > button.btn-collapse[aria-expanded=false]").trigger("click");
				e.stopPropagation();
				return false;
			});
			this.initializeWidgets();
			if (this.isDynamic) {
				var view = $('input[name=view]').eq(0).val();
				var step = $('input[name=step]').eq(0).val();
				var token = $('input[name=_csrf_token]').eq(0).val();
				var path = $(location).attr('pathname').replace("/"+view, "").replace(/\/+$/, "") + "/Default/fields";
				$.post(path,
					{stepId: step, _csrf_token: token },
					function(simu){
						self.simu = simu;
						self.processFields();
						self.initializeExternalFunctions();
					},
					"json"
				).fail(function(jqXHR, textStatus, errorThrown) {
					if ((jqXHR.status != 0 && jqXHR.status != 200) || textStatus === 'timeout') {
						self.setFatalError( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
					}
				});
			}
		},

		setProfile: function(profile) {
			var self = this;
			var id = profile.attr('data-profile-id');
			if (self.currentProfil == null || self.currentProfil.attr('data-profile-id') != id) {
				if (self.currentProfil != null) {
					self.currentProfil.removeClass('active');
				}
				self.currentProfil = profile;
				profile.addClass('active');
				$.each(self.simu.profiles.profiles, function(p, profile) {
					if (profile.id == id) {
						$.each(profile.datas, function(d, data) {
							self.setValue(data.name, data.default);
						});
					}
				});
			}
		},

		normalizeName: function(name) {
			if (/\[\]$/.test(name)) {
				name = name.substr(0, name.length - 2);
			}
			return name;
		},

		getData: function(name) {
			name = this.normalizeName(name);
			var data = this.simu.datas[name];
			return data;
		},

		getDataNameById: function(id) {
			var dataName = null;
			$.each(this.simu.datas, function(name, data) {
				if (data.id == id) {
					dataName = name;
					return false;
				}
			});
			return dataName;
		},

		getStep: function() {
			return this.simu.step;
		},

		getStepChildElement: function(parameters) {
			var element = this.simu.step.name;
			if (parameters.panel) {
				element += '-panel-' + parameters.panel;
				if (parameters.blockgroup) {
					var blockinfo = element + '-blockinfo-' + parameters.blockgroup;
					if ($('#' + blockinfo).length > 0) {
						element = blockinfo;
					} else {
						element += '-fieldset-' + parameters.blockgroup;
					}
					element = document.getElementById(element);
					if (element) {
						element = element.parentElement;
					}
				} else if (parameters.blockinfo) {
					element += '-blockinfo-' + parameters.blockinfo;
					if (parameters.chapter) {
						element += '-chapter-' + parameters.chapter;
						if (parameters.section) {
							element += '-section-' + parameters.section;
						} else if (parameters.content) {
							element += '-section-' + parameters.content + '-content';
						} else if (parameters.annotations) {
							element += '-section-' + parameters.annotations + '-annotations';
						}
					}
					element = document.getElementById(element);
				} else if (parameters.fieldset) {
					element += '-fieldset-' + parameters.fieldset;
					if (parameters.fieldrow) {
						element += '-fieldrow-' + parameters.fieldrow;
					}
					if (parameters.field) {
						var elementObj = $('#' + element).find("[data-field-position='" + parameters.field + "']");
						element = elementObj[0];
					} else if (parameters.prenote) {
						var elementObj = $('#' + element).find("[data-field-position='" + parameters.prenote + "']");
						element = elementObj.find('.pre-note')[0];
					} else if (parameters.postnote) {
						var elementObj = $('#' + element).find("[data-field-position='" + parameters.postnote + "']");
						element = elementObj.find('.post-note')[0];
					} else {
						element = document.getElementById(element);
					}
				} else {
					element = document.getElementById(element);
				}
			} else if (parameters.footnote) {
				element = document.getElementById('foot-note-' + parameters.footnote);
			} else {
				element = document.getElementById(element);
			}
			return element;
		},

		isVisible: function (name) {
			var input = $("input[name='"+ name +"']");
			if (input.hasClass('listbox-input')) {
				input = input.parent();
			}
			return input.is(':visible');
		},

		check: function(data) {
			if (!data || !data.value || data.value.length == 0) {
				return true;
			}
			switch (data.type) {
				case 'date':
					try {
						var d = Date.createFromFormat(Date.inputFormat, data.value);
					} catch (e) {
						return false;
					}
					break;
				case 'money':
					if (! /^-{0,1}\d+(\.\d{1,2})?$/.test(data.value)) {
						return false;
					}
					break;
				case 'integer':
					if (! /^\d+$/.test(data.value)) {
						return false;
					}
					break;
				case 'number':
				case 'percent':
					if (! /^-{0,1}\d*\.{0,1}\d+$/.test(data.value)) {
						return false;
					}
					break;
				case 'text':
					if (data.pattern) {
						var re = new RegExp(data.pattern);
						return re.test(data.value);
					}
					break;
			}
			return true;
		},

		resetMin: function(name) {
			var input = $(":input[name='" + name + "']");
			var data = this.getData(name);
			if (input.length > 0 && data.unparsedMin) {
				var min = this.evaluate(data.unparsedMin);
				if (min !== false) {
					if (data.type == 'text' || data.type == 'textarea') {
						min = parseInt(min, 10);
						if (min) {
							input.attr('minlength', min);
						}
					} else if (data.type == 'date') {
						input.attr('min', min);
					} else {
						min = data.type == 'integer' ? parseInt(min, 10) : parseFloat(min);
						if (min) {
							input.attr('min', min);
						}
					}
				}
			}
		},

		checkMin: function(data) {
			if (!data || !data.value || data.value.length == 0) {
				return true;
			}
			if (data.type != 'number' && data.type != 'integer' && data.type != 'percent' && data.type != 'money' && data.type != 'date' && data.type != 'text' && data.type != 'textarea') {
				return true;
			}
			if (data.unparsedMin) {
				var min = this.evaluate(data.unparsedMin);
				if (min !== false) {
					if (data.type == 'text' || data.type == 'textarea') {
						min = parseInt(min, 10);
						if (min && data.value.length < min) {
							return false;
						}
					} else if (data.type == 'date') {
						min = Date.createFromFormat(Date.inputFormat, min);
						var val = Date.createFromFormat(Date.inputFormat, data.value);
						if (val < min ) {
							return false;
						}
					} else {
						min = data.type == 'integer' ? parseInt(min, 10) : parseFloat(min);
						var val  = data.type == 'integer' ? parseInt(data.value, 10) : parseFloat(data.value);
						if (min && val < min ) {
							return false;
						}
					}
				}
			}
			return true;
		},

		resetMax: function(name) {
			var input = $(":input[name='" + name + "']");
			var data = this.getData(name);
			if (input.length > 0 && data.unparsedMax) {
				var max = this.evaluate(data.unparsedMax);
				if (max !== false) {
					if (data.type == 'text' || data.type == 'textarea') {
						max = parseInt(max, 10);
						if (max) {
							input.attr('maxlength', max);
						}
					} else if (data.type == 'date') {
						input.attr('max', max);
					} else {
						max = data.type == 'integer' ? parseInt(max, 10) : parseFloat(max);
						if (max) {
							input.attr('max', max);
						}
					}
				}
			}
		},

		checkMax: function(data) {
			if (!data || !data.value || data.value.length == 0) {
				return true;
			}
			if (data.type != 'number' && data.type != 'integer' && data.type != 'percent' && data.type != 'money' && data.type != 'date' && data.type != 'text' && data.type != 'textarea') {
				return true;
			}
			if (data.unparsedMax) {
				var max = this.evaluate(data.unparsedMax);
				if (max !== false) {
					if (data.type == 'text' || data.type == 'textarea') {
						max = parseInt(max, 10);
						if (max && data.value.length > max) {
							return false;
						}
					} else if (data.type == 'date') {
						max = Date.createFromFormat(Date.inputFormat, max);
						var val = Date.createFromFormat(Date.inputFormat, data.value);
						if (val > max ) {
							return false;
						}
					} else {
						max = data.type == 'integer' ? parseInt(max, 10) : parseFloat(max);
						var val  = data.type == 'integer' ? parseInt(data.value, 10) : parseFloat(data.value);
						if (max && val > max) {
							return false;
						}
					}
				}
			}
			return true;
		},

		validate: function(name) {
			var ok = true;
			name = this.normalizeName(name);
			var data = this.getData(name);
			if (data.inputField) {
				var field = this.simu.step.panels[data.inputField[0]].fields[data.inputField[1]];
				if (field.usage === 'input') {
					this.removeError(name);
					this.removeWarning(name);
					if (!this.check(data)) {
						ok = false;
						switch (data.type) {
							case 'date':
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans(Date.format) }, 'messages'));
								break;
							case 'number': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
								break;
							case 'integer': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
								break;
							case 'money': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("amount") }, 'messages'));
								break;
							case 'percent':
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("percentage") }, 'messages'));
								break;
							default:
								this.setError(name, Translator.trans("This value is not in the expected format"));
						}
					} else if (field.required && (!data.value || data.value.length == 0)) {
						this.setError(name, Translator.trans("The '%field%' field is required",  { "field": field.label }, 'messages'));
					} else if (field.visibleRequired && this.isVisible(name) && (!data.value || data.value.length == 0)) {
						this.setError(name, Translator.trans("The '%field%' field is required",  { "field": field.label }, 'messages'));
					} else if (!this.checkMin(data)) {
						var min = this.evaluate(data.unparsedMin);
						if (data.type == 'text' || data.type == 'textarea') {
							this.setError(name, Translator.trans("The length of the field '%field%' cannot be less than %min%",  { "field": field.label, "min": min }, 'messages'));
						} else {
							this.setError(name, Translator.trans("The value of the field '%field%' cannot be less than %min%",  { "field": field.label, "min": min }, 'messages'));
						}
					} else if (!this.checkMax(data)) {
						var max = this.evaluate(data.unparsedMax);
						if (data.type == 'text' || data.type == 'textarea') {
							this.setError(name, Translator.trans("The length of the field '%field%' cannot be greater than %max%",  { "field": field.label, "max": max }, 'messages'));
						} else {
							this.setError(name, Translator.trans("The value of the field '%field%' cannot be greater than %max%",  { "field": field.label, "max": max }, 'messages'));
						}
					}
				}
			}
			return ok;
		},

		setGlobalWarning: function(warning) {
			if (!$("#global-error").hasClass('has-error')) {
				$("#global-error").removeClass('hidden').addClass('has-warning').html(warning);
				$("#global-error").show().removeAttr('aria-hidden');
			}
		},

		removeGlobalWarning: function() {
			if (!$("#global-error").hasClass('has-error')) {
				$("#global-error").addClass('hidden').removeClass('has-warning').text("");
				$("#global-error").attr('aria-hidden', true).hide();
			}
		},

		setGroupWarning: function(name, warning) {
			var errorContainer = $("#"+name+"-error");
			if (! errorContainer.hasClass('has-error')) {
				errorContainer.removeClass('hidden').addClass('has-warning').html(warning);
				errorContainer.show().removeAttr('aria-hidden');
			}
		},

		removeGroupWarning: function(name) {
			var errorContainer = $("#"+name+"-error");
			if (! errorContainer.hasClass('has-error')) {
				errorContainer.addClass('hidden').removeClass('has-warning').text("");
				errorContainer.attr('aria-hidden', true).hide();
			}
		},

		setWarning: function(name, warning) {
			var self = this;
			var fieldContainer = $("#"+name+"-container");
			var visible = fieldContainer.is(':visible');
			$("input[name=" + name + "], input[type=checkbox], select[name=" + name + "]").each(function (index) {
				if ($(this).is(':checkbox')) {
					var n = self.normalizeName($(this).attr('name'));
					if (n != name) return true;
				}
				if (visible && !$(this).hasClass('has-error')) {
					$(this).addClass('has-warning');
					$(this).parent('.input-group').removeClass('hidden').addClass('has-warning');
					$(this).focus();
				}
			});
			if (this.getData(name).datagroup) {
				this.setGroupWarning(this.getData(name).datagroup, warning);
			} else if (visible) {
				fieldContainer.find("div.field-error").last().removeClass('hidden').addClass('has-warning').html(warning);
				fieldContainer.show().removeAttr('aria-hidden');
				fieldContainer.parent().show().removeAttr('aria-hidden');
				this.hasWarning = true;
			}
		},

		removeWarning: function(name) {
			var self = this;
			if (this.getData(name).datagroup) {
				this.removeGroupWarning(this.getData(name).datagroup);
			} else {
				var fieldContainer = $("#"+name+"-container");
				fieldContainer.find("div.field-error").last().addClass('hidden').removeClass('has-warning').text("");
			}
			$("input[name=" + name + "], input[type=checkbox], select[name=" + name + "]").each(function (index) {
				if ($(this).is(':checkbox')) {
					var n = self.normalizeName($(this).attr('name'));
					if (n != name) return true;
				}
				$(this).removeClass('has-warning');
				$(this).parent('.input-group').removeClass('has-warning');
			});
		},

		setFatalError: function(error) {
			this.hasFatalError = true;
			this.hasGlobalError = true;
			this.hasError = true;
			$("#global-error").addClass("fatal-error");
			$("#g6k_form input, #g6k_form select, #g6k_form textarea" ).prop( "disabled", true );
			var errorhtml = "";
			if ($.isArray(error)) {
				errorhtml = '<p>' + error.join('</p><p>') + '</p>';
			} else {
				errorhtml = '<p>' + error + '</p>';
			}
			$("#global-error").removeClass('hidden').addClass('has-error').html(errorhtml);
			$("#global-error").show().removeAttr('aria-hidden');
		},

		setGlobalError: function(error) {
			this.hasGlobalError = true;
			this.hasError = true;
			var errorhtml = "";
			if ($.isArray(error)) {
				errorhtml = '<p>' + error.join('</p><p>') + '</p>';
			} else {
				errorhtml = '<p>' + error + '</p>';
			}
			$("#global-error").removeClass('hidden').addClass('has-error').html(errorhtml);
			$("#global-error").show().removeAttr('aria-hidden');
		},

		removeGlobalError: function() {
			$("#g6k_form input, #g6k_form select, #g6k_form textarea" ).prop( "disabled", false );
			$("#global-error").addClass('hidden').removeClass('has-error').text("");
			$("#global-error").attr('aria-hidden', true).hide();
			this.hasGlobalError = false;
		},

		setGroupError: function(name, error) {
			this.hasError = true;
			var errorContainer = $("#"+name+"-error");
			var errorhtml = "";
			if ($.isArray(error)) {
				errorhtml = '<p>' + error.join('</p><p>') + '</p>';
			} else {
				errorhtml = '<p>' + error + '</p>';
			}
			errorContainer.removeClass('hidden').addClass('has-error').html(errorhtml);
			errorContainer.show().removeAttr('aria-hidden');
		},

		removeGroupError: function(name) {
			var errorContainer = $("#"+name+"-error");
			errorContainer.addClass('hidden').removeClass('has-error').text("");
			errorContainer.attr('aria-hidden', true).hide();
		},

		setError: function(name, error) {
			var self = this;
			var fieldContainer = $("#"+name+"-container");
			var visible = fieldContainer.is(':visible');
			$("input[name=" + name + "], input[type=checkbox], select[name=" + name + "]").each(function (index) {
				if ($(this).is(':checkbox')) {
					var n = self.normalizeName($(this).attr('name'));
					if (n != name) return true;
				}
				if (visible) {
					$(this).addClass('has-error');
					if (self.getData(name).datagroup) {
						$(this).attr('aria-describedby', self.getData(name).datagroup + '-error');
					} else {
						$(this).attr('aria-describedby', name + '-field-error');
					}
					$(this).parent('.input-group').removeClass('hidden').addClass('has-error');
					$(this).attr('aria-invalid', true);
					$(this).focus();
				}
			});
			if (this.getData(name).datagroup) {
				this.setGroupError(this.getData(name).datagroup, error);
			} else if (visible) {
				var errorhtml = "";
				if ($.isArray(error)) {
					errorhtml = '<p>' + error.join('</p><p>') + '</p>';
				} else {
					errorhtml = '<p>' + error + '</p>';
				}
				fieldContainer.find("div.field-error").last().removeClass('hidden').addClass('has-error').html(errorhtml);
				fieldContainer.show().removeAttr('aria-hidden');
				fieldContainer.parent().show().removeAttr('aria-hidden');
				this.hasError = true;
			}
		},

		removeError: function(name) {
			var self = this;
			if (this.getData(name).datagroup) {
				this.removeGroupError(this.getData(name).datagroup);
			} else {
				var fieldContainer = $("#"+name+"-container");
				fieldContainer.find("div.field-error").last().addClass('hidden').removeClass('has-error').text("");
			}
			$("input[name=" + name + "], input[type=checkbox], select[name=" + name + "]").each(function (index) {
				if ($(this).is(':checkbox')) {
					var n = self.normalizeName($(this).attr('name'));
					if (n != name) return true;
				}
				$(this).removeClass('has-error');
				$(this).removeAttr('aria-describedby');
				$(this).parent('.input-group').removeClass('has-error');
				if (this.hasAttribute('type') && $(this).attr('type') == 'number') {
					$(this).removeAttr('aria-invalid');
				} else {
					$(this).attr('aria-invalid', false);
				}
			});
		},

		setFormValue: function(name, data) {
			var self = this;
			if (data.type === "multichoice") {
				$("input[type=checkbox]").each(function (index) {
					var n = self.normalizeName($(this).attr('name'));
					if (n == name) {
						if ($.inArray($(this).val(), data.value)) {
							if (! $(this).is(':checked')) $(this).prop('checked', true);
						} else {
							if ($(this).is(':checked')) $(this).prop('checked', false);
						}
					}
				});
				return;
			}
			$("input[name=" + name + "], select[name=" + name + "], span[id=" + name + "]").each(function (index) {
				if ($(this).is('span')) {
					$(this).text(self.formatValue(data));
				} else if ($(this).is('select')) {
					if ($(this).val() != data.value) $(this).val(data.value);
				} else if ($(this).is(':radio')) {
					$(this).val([data.value]);
					$(this).parent('label').parent('fieldset').find('label.choice').removeClass('checked');
					if ( $(this).is(':checked') ) {
						$(this).parent('label').addClass('checked');
					}
				} else if ($(this).is(':checkbox')) {
					if ($(this).val() != data.value) $(this).val(data.value);
				} else if ($(this).hasClass('listbox-input')) {
					if ($(this).val() != data.value) {
						$(this).val(data.value);
						$(this).listbox('update');
					}
				} else {
					if ($(this).val() != data.value) $(this).val(data.value);
				}
			});
		},

		resetDataValue: function (data) {
			if (data.type === "multichoice") {
				data.value = [];
			} else {
				data.value = "";
			}
		},

		unsetChoiceValue: function(name, value) { // only for type = 'multichoice'
			var data = this.getData(name);
			if (value && data && data.type === "multichoice" && ! $.isArray(value)) {
				var ovalues = data.value ? data.value : [];
				var pos = $.inArray(value, ovalues);
				if (pos >= 0) {
					ovalues.splice( pos, 1 );
					data.value = ovalues;
					this.setVariable(name, data);
					this.validate(name);
					if (this.simu.memo && this.simu.memo == "1" && data.memorize && data.memorize == "1") {
						if (! $.cookie(name) || $.cookie(name) != value) {
							$.cookie(name, value, { expires: 365, path: this.basePath });
						}
					}
					this.lastUserInputName = "";
					this.reevaluateFields(name);
				}
			}
		},

		unsetValue: function(name) {
			var self = this;
			var data = self.getData(name);
			if (data.value !== '') {
				setTimeout(function(){ self.setValue(name, ''); }, 0);
			}
		},

		setValue: function(name, value) {
			var self = this;
			var data = self.getData(name);
			if (($.isArray(value) || $.isPlainObject(value)) && data.type != "array" && data.type != "multichoice") {
				var avalue = value;
				value = "";
				$.each(avalue, function(key, val) {
					value = val;
					return false;
				});
			}
			if (value && (data.type === "money" || data.type === "percent")) {
				value = self.unFormatValue(value);
				value = parseFloat(value).toFixed(data.round || 2);
			} else if (value && (data.type === "number")) {
				value = self.unFormatValue(value);
				if (data.round) {
					value = parseFloat(value).toFixed(data.round);
				}
			} else if (value && data.type === "multichoice" && ! $.isArray(value)) {
				if (/\[\]$/.test(value)) {
					value = JSON.parse(value);
				} else {
					var ovalues = data.value ? data.value : [];
					ovalues.push(value);
					value = ovalues;
				}
			}
			data.value = value;
			self.setVariable(name, data);
			self.validate(name);
			if (name !== self.lastUserInputName || data.type === "integer" || data.type === "number" || data.type === "date") {
				self.setFormValue(name, data);
			}
			if (self.simu.memo && self.simu.memo == "1" && data.memorize && data.memorize == "1") {
				if (! $.cookie(name) || $.cookie(name) != value) {
					$.cookie(name, value, { expires: 365, path: self.basePath });
				}
			}
			self.lastUserInputName = "";
			self.reevaluateFields(name);
		},

		setVariable: function (name, data) {
			this.variables[name] = data.value;
			if (! data.value && data.deflt) {
				this.variables[name] = data.deflt;
			}
		},

		evaluate: function (expression) {
			var expr = this.parser.parse(expression);
			expr.postfix();
			expr.setVariables(this.variables);
			return expr.evaluate();
		},

		evaluateDefaults: function() {
			var self = this;
			$.each(self.simu.datas, function( name, data ) {
				if (typeof data.unparsedDefault !== "undefined" && data.unparsedDefault !== "") {
					var value = self.evaluate(data.unparsedDefault);
					if (value !== false) {
						data.deflt = value;
					}
				}
			});
		},

		reevaluateFields: function (name) {
			var self = this;
			var data = this.getData(name);
			if (typeof data.unparsedExplanation !== "undefined" && data.unparsedExplanation !== "") {
				var explanation = this.evaluate(data.unparsedExplanation);
				if (explanation === false) {
					$("#" + name + "-explanation").text("");
				} else {
					$("#" + name + "-explanation").html(explanation);
				}
			}
			if (data.defaultDependencies) {
				$.each(data.defaultDependencies, function( d, dependency ) {
					var field = self.getData(dependency);
					if (typeof field.unparsedDefault !== "undefined" && field.unparsedDefault !== "") {
						var value = self.evaluate(field.unparsedDefault);
						if (value !== false) {
							field.deflt = value;
						}
					}
				});
			}
			if (data.minDependencies) {
				$.each(data.minDependencies, function( d, dependency ) {
					var field = self.getData(dependency);
					if (field.unparsedMin !== "undefined" && field.unparsedMin !== "") {
						self.resetMin(dependency);
					}
				});
			}
			if (data.maxDependencies) {
				$.each(data.maxDependencies, function( d, dependency ) {
					var field = self.getData(dependency);
					if (field.unparsedMax !== "undefined" && field.unparsedMax !== "") {
						self.resetMax(dependency);
					}
				});
			}
			if (data.indexDependencies) {
				$.each(data.indexDependencies, function( d, dependency ) {
					var field = self.getData(dependency);
					if (field.unparsedIndex !== "undefined" && field.unparsedIndex !== "") {
						self.reevaluateFields(dependency);
					}
				});
			}
			if (data.contentDependencies) {
				$.each(data.contentDependencies, function( d, dependency ) {
					var field = self.getData(dependency);
					if ((! field.modifiedByUser || field.value === '') && typeof field.unparsedContent !== "undefined" && field.unparsedContent !== "") {
						var content = self.evaluate(field.unparsedContent);
						if (content !== false) {
							if (content && field.type === "multichoice" && ! $.isArray(content)) {
								if (/\[\]$/.test(content)) {
									content = JSON.parse(content);
								} else {
									content = [content];
								}
							}
							if (field.value !== content) {
								self.setValue(dependency, content);
							}
						} else {
							self.unsetValue(dependency);
						}
					}
				});
			}
			if (data.noteDependencies) {
				$.each(data.noteDependencies, function( d, dependency ) {
					var datad = self.getData(dependency);
					if (datad.inputField) {
						var field = self.simu.step.panels[datad.inputField[0]].fields[datad.inputField[1]];
						if (field.prenote) {
							var prenote = self.replaceVariables(field.prenote);
							if (prenote !== false) {
								var id = '#' + dependency + '-container .pre-note';
								var oldNote = $(id).html();
								if (prenote != oldNote) {
									$(id).html(prenote);
									$(id).attr('aria-live', 'polite');
								} else {
									$(id).removeAttr('aria-live');
								}
							}
						}
						if (field.postnote) {
							var postnote = self.replaceVariables(field.postnote);
							if (postnote !== false) {
								var id = '#' + dependency + '-container .post-note';
								var oldNote = $(id).html();
								if (postnote != oldNote) {
									$(id).html(postnote);
									$(id).attr('aria-live', 'polite');
								} else {
									$(id).removeAttr('aria-live');
								}
							}
						}
					}
				});
			}
			if (data.sectionContentDependencies) {
				$.each(data.sectionContentDependencies, function( d, dependency ) {
					var sectionId = dependency;
					var chapterId = dependency.replace(/-section-.*$/, '');
					var blockinfoId = dependency.replace(/-chapter-.*$/, '');
					var content = self.simu.step.panels[blockinfoId].chapters[chapterId].sections[sectionId].content;
					var newcontent = self.replaceVariablesOrBlank(content);
					var id = '#' + sectionId + '-content';
					var oldContent = $(id).html();
					if (newcontent != oldContent) {
						$(id).html(newcontent);
						$(id).attr('aria-live', 'polite');
					} else {
						$(id).removeAttr('aria-live');
					}
				});
			}
			if (data.footNoteDependencies) {
				$.each(data.footNoteDependencies, function( d, dependency ) {
					var footnote = self.simu.step.footnotes[dependency];
					var footnotetext = self.replaceVariables(footnote.text);
					if (footnotetext !== false) {
						var id = "#foot-note-" + dependency;
						var oldNote = $(id).html();
						if (footnotetext != oldNote) {
							$(id).html(footnotetext);
							$(id).attr('aria-live', 'polite');
						} else {
							$(id).removeAttr('aria-live');
						}
					}
				});
				if ( $("div.foot-notes").children("div.foot-note").has(":visible")) {
					self.showObjectLater($("div.foot-notes"));
				} else {
					self.hideObject($("div.foot-notes"));
				}
			}
			if (data.sourceDependencies) {
				$.each(data.sourceDependencies, function( d, dependency ) {
					var completed = true;
					var params = self.simu.sources[dependency]['parameters'];
					$.each(params, function( p, param ) {
						if (param.origin === 'data' && param.optional == '0') {
							var d = self.getData(param.data);
							if (typeof d.value === "undefined" || d.value === "") {
								completed = false;
								return false;
							} else if ((d.type == 'text' || d.type == 'textarea') && d.unparsedMin) {
								var min = self.evaluate(d.unparsedMin);
								if (min === false || d.value.length < parseInt(min, 10)) {
									completed = false;
									return false;
								}
							}
						}
					});
					if (completed) {
						var type = self.simu.sources[dependency]['datasource']['type'];
						var returnType = self.simu.sources[dependency]['returnType'];
						if (type === 'uri' && (returnType === 'json' || returnType === 'csv' || (document.evaluate && (returnType === 'xml'|| returnType === 'html')))) {
							self.getUriSource(dependency);
						} else {
							self.getInternalSource(dependency);
						}
					} else {
						self.resetSourceDatas(dependency);
						self.populateChoiceDependencies(dependency, []);
					}
				});
			}
			if (data.rulesConditionsDependency) {
				$.each(data.rulesConditionsDependency, function(r) {
					self.rulesengine.run(
						data.rulesConditionsDependency[r] - 1, 
						self.variables, 
						function(err, result) {
							if (err) {  }
						}
					);
				});
			}
			if (data.rulesActionsDependency) {
				$.each(data.rulesActionsDependency, function(r) {
					self.rulesengine.run(
						data.rulesActionsDependency[r] - 1, 
						self.variables, 
						function(err, result) {
							if (err) {  }
						}
					);
				});
			}
		},

		formatParamValue: function (param) {
			var data = this.getData(param.data);
			if (typeof data.value === "undefined" || data.value === "") {
				return null;
			}
			var value = data.value;
			switch (data.type) {
				case "date":
					var format = param.format;
					if (format != "" && value != "") {
						var date = Date.createFromFormat(Date.inputFormat, value);
						value = date.format(format);
					}
					break;
				case "day":
					var format = param.format;
					if (format != "" && value != "") {
						var date = Date.createFromFormat("j/n/Y", value + "/1/2015");
						value = date.format(format);
					}
					break;
				case "month":
					var format = param.format;
					if (format != "" && value != "") {
						var date = Date.createFromFormat("j/n/Y", "1/" + value + "/2015");
						value = date.format(format);
					}
					break;
				case "year":
					var format = param.format;
					if (format != "" && value != "") {
						var date = Date.createFromFormat("j/n/Y", "1/1/" + value);
						value = date.format(format);
					}
					break;
			}
			return value;
		},

		str_getcsv: function(input, delimiter, enclosure, escape) {
			// Thanks to Locutus
			// https://github.com/kvz/locutus/blob/master/src/php/strings/str_getcsv.js
			var output = [];
			var _backwards = function (str) {
				return str.split('').reverse().join('');
			}
			var _pq = function (str) {
				return String(str).replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}=!<>\|:])/g, '\\$1')
			}
			delimiter = delimiter || ',';
			enclosure = enclosure || '"';
			escape = escape || '\\';
			var pqEnc = _pq(enclosure);
			var pqEsc = _pq(escape);
			input = input.replace(new RegExp('^\\s*' + pqEnc), '').replace(new RegExp(pqEnc + '\\s*$'), '');
			input = _backwards(input).split(new RegExp(pqEnc + '\\s*' + _pq(delimiter) + '\\s*' + pqEnc + '(?!' + pqEsc + ')', 'g')).reverse();
			for (var i = 0, inpLen = input.length; i < inpLen; i++) {
				output.push(_backwards(input[i]).replace(new RegExp(pqEsc + pqEnc, 'g'), enclosure));
			}
			return output;
		},

		xmlToObject: function (node) {
			switch (node.nodeType) {
				case 9: // document
				case 1: // element
					var object = {};
					var attributes = node.attributes;
					for (var a = 0; a < attributes.length; a++) {
						var attr = attributes.item(a);
						object[attr.name] = attr.value;
					}
					var children = node.childNodes;
					var hasChildOrAttributes = node.attributes.length > 0;
					var text = '';
					if (! hasChildOrAttributes) {
						for (var c = 0; c < children.length; c++) {
							var child = children.item(c);
							if (child.nodeType == 3) {
								text += child.nodeValue;
							} else if (child.nodeType == 1 || child.nodeType == 2) {
								hasChildOrAttributes = true;
								break;
							}
						}
					}
					var nodeObj = {};
					if (! hasChildOrAttributes) {
						nodeObj[node.nodeName] = text;
					} else {
						for (var c = 0; c < children.length; c++) {
							var child = children.item(c);
							var childObj = self.xmlToObject(child);
							if (childObj != null) {
								object[child.nodeName] = childObj;
							}
						}
						nodeObj[node.nodeName] = object;
					}
					return nodeObj;
				case 2: // attribute
					var object = {};
					object[node.name] = node.value;
					return object;
				case 3: // text
					return node.nodeValue;
				default:
					return null;
			}
		},

		getUriSource: function (source) {
			var self = this;
			var path = '';
			var query = '';
			var headers = [];
			var datas = {};
			var ok = true;
			var params = self.simu.sources[source]['parameters'];
			$.each(params, function( p, param ) {
				var value;
				if (param.origin == 'data') {
					value = self.formatParamValue(param);
				} else {
					value = param.constant;
				}
				if (value == null) { 
					if (param.optional == '0') {
						ok = false;
						return false;
					}
					value = '';
				}
				if (param.type == 'path') {
					if (value != '' || param.optional == '0') {
						path += "/" + value.replace(/\s+/g, '+');
					}
				} else if (param.type == 'data') {
					var name = param.name;
					if (datas[name]) {
						datas[name].push(value);
					} else {
						datas[name] = [value];
					}
					query += '&' + encodeURI(name) + '=' + encodeURI(value);
				} else if (param.type == 'header') {
					if (value != '') {
						headers.push({ name: param.name, value: value });
					}
				} else if (value != '' || param.optional == '0') {
					datas[param.name] = value;
					query += '&' + encodeURI(param.name) + '=' + encodeURI(value);
				}
			});
			if (! ok) {
				return null;
			}
			var uri = self.simu.sources[source]['datasource']['uri'];
			if (path != "") {
				uri += encodeURI(path);
			}
			if (query != '') {
				query = uri + '?' + query.substr(1);
			}
			var method = self.simu.sources[source]['datasource']['method'];
			var returnType = self.simu.sources[source]['returnType'];
			self.enqueueSourceRequest(source, method.toUpperCase(), uri, datas, returnType, headers,
				function (source, returnType, result) {
					var returnPath = self.simu.sources[source]['returnPath'];
					returnPath = self.replaceVariables(returnPath);
					if (returnType == 'json') {
						if (returnPath != '') {
							if (/^\\$/.test(returnPath)) { // jsonpath
								result = JSONPath({path: returnPath, json: result});
							} else { // xpath
								result = defiant.json.search(result, returnPath);
								if ($.isArray(result) && result.length == 1) {
									result = result[0];
								}
							}
						}
					} else if (returnType == 'csv') {
						var separator = self.simu.sources[source]['separator'];
						var delimiter = self.simu.sources[source]['delimiter'];
						var lines = result.split(/\n/);
						result = [];
						for (var l = 0; l < lines.length; l++) {
							var line = $.trim(lines[l]);
							if (line != '') {
								var csv = self.str_getcsv(line, separator, delimiter);
								var cols = $.map(csv, function (c) {
									return $.trim(c);
								});
								result.push(cols);
							}
						}
						if (returnPath) {
							var indices = returnPath.split("/");
							$.each(indices, function (i, index) {
								result = result[parseInt(index, 10) - 1];
							});
						}
					} else if (returnType == 'xml'|| returnType == 'html') {
						result = extractXMLResult(result, returnPath);
					}
					self.processSource(source, result, returnType);
				},
				function(source, returnType, result) {
					self.resetSourceDatas(source);
					self.populateChoiceDependencies(source, []);
				}
			);
		},

		extractXMLResult: function (result, returnPath) {
			var snapshot = document.evaluate(returnPath, $(result).get(0), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
			result = [];
			try {
				for (var i = 0, len = snapshot.snapshotLength; i < len; i++) {
					var node = snapshot.snapshotItem(i);
					switch (node.nodeType) {
						case 9: // document
						case 1: // element
							result.push(self.xmlToObject(node));
							break;
						case 2: // attribute
							var object = {};
							object[node.name] = node.value;
							result.push(object);
							break;
						case 3: // text
							result.push(node.nodeValue);
					}
				}
			}
			catch (e) {
			}
			return result;
		},

		getInternalSource: function (source) {
			var self = this;
			var post = {};
			post['source'] = source;
			var returnPath = self.simu.sources[source]['returnPath'];
			var replacedPath = self.replaceVariables(returnPath);
			if (replacedPath != returnPath) {
				post['returnPath'] = replacedPath;
			}
			var params = self.simu.sources[source]['parameters'];
			$.each(params, function( p, param ) {
				if (param.origin === 'data') {
					var d = self.getData(param.data);
					if (typeof d.value !== "undefined" && d.value !== "") {
						post[param.name] = d.value;
					}
				} else if (param.origin === 'constant') {
					post[param.name] = param.constant;
				}
			});
			var view = $('input[name=view]').eq(0).val();
			var token = $('input[name=_csrf_token]').eq(0).val();
			if (token) {
				post['_csrf_token'] = token;
			}
			var path = $(location).attr('pathname').replace("/"+view, "").replace(/\/+$/, "") + "/Default/source";
			self.enqueueSourceRequest(source, 'POST', path, post, 'json',[],
				function (source, returnType, result) {
					self.processSource(source, result, 'assocArray');
				},
				function(source, returnType, result) {
					self.resetSourceDatas(source);
					self.populateChoiceDependencies(source, []);
				}
			);

		},

		enqueueSourceRequest: function(source, method, uri, data, returnType, headers, success, error) {
			var self = this;

			self.sourceRequestsQueue.push({
				source: source, 
				method: method, 
				uri: uri, 
				data: data, 
				returnType: returnType, 
				headers: headers, 
				success: success,
				error: error
			});

			function runSourceRequest() {
				if (self.sourceRequestRunning) {
					return;
				}
				if (self.sourceRequestsQueue.length > 0) {
					self.sourceRequestRunning = true;
					var q = self.sourceRequestsQueue.shift();
					var key = q.uri + '?' + $.param(q.data);
					if (self.sourceRequestsCache[key]) {
						if (self.sourceRequestsCache[key]['error']) {
							q.error.call(self, q.source, "json", self.sourceRequestsCache[key]);
						} else {
							q.success.call(self, q.source, q.returnType, self.sourceRequestsCache[key]);
						}
						self.sourceRequestRunning = false;
						runSourceRequest();
					} else {
						$.ajax({
							method: q.method,
							url: q.uri,
							dataType: q.returnType,
							data: q.data,
							beforeSend: function(xhr){
								$.each(q.headers, function(h, header) {
									xhr.setRequestHeader(header.name, header.value);
								});
							}
						}).done(function( result ) {
							self.sourceRequestsCache[key] = result;
							q.success.call(self, q.source, q.returnType, result);
						}).fail(function(jqXHR, textStatus, errorThrown) {
							if ((jqXHR.status != 0 && jqXHR.status >= 500) || textStatus === 'timeout') {
								self.setFatalError( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
							} else {
								var result = { 'error': jqXHR.status};
								self.sourceRequestsCache[key] = result;
								q.error.call(self, q.source, "json", result);
							}
						}).always(function() {
							self.sourceRequestRunning = false;
							runSourceRequest();
						});
					}
				}
			}

			runSourceRequest();
		},

		processSource: function(source, result, returnType) {
			var self = this;
			$.each(this.simu.datas, function( name, data ) {
				if (typeof data.unparsedSource !== "undefined" && data.unparsedSource !== "") {
					var s = self.evaluate(data.unparsedSource);
					if (s == source) {
						if (typeof data.unparsedIndex !== "undefined" && data.unparsedIndex !== "") {
							var index;
							if (returnType == 'assocArray') {
								index = self.evaluate(data.unparsedIndex);
							} else {
								index = data.unparsedIndex.replace(/^'/, '').replace(/'$/, '');
								index = self.replaceVariables(index);
							}
							if (index !== false) {
								var value = result;
								if (returnType == 'assocArray') {
									if (value[index]) {
										self.setValue(name, value[index]);
									} else {
										self.setValue(name, value[index.toLowerCase()]);
									}
								} else if (returnType == 'json') {
									if (index != '') {
										if (/^\\$/.test(index)) { // jsonpath
											value = JSONPath({path: index, json: value});
										} else { // xpath
											value = defiant.json.search(value, index);
											if ($.isArray(value) && value.length == 1) {
												value = value[0];
											}
										}
									}
									self.setValue(name, value);
								} else if (returnType == 'csv') {
									var indices = index.split("/");
									$.each(indices, function (i, ind) {
										value = value[parseInt(ind, 10) - 1];
									});
									self.setValue(name, value);
								} else if (returnType == 'xml'|| returnType == 'html') {
									value = extractXMLResult(value, index);
									if ($.isArray(value) && value.length == 1) {
										value = value[0];
									}
									self.setValue(name, value);
								}
							} else {
								self.unsetValue(name);
							}
						} else {
							self.setValue(name, result);
						}
					}
				}
			});
			this.populateChoiceDependencies(source, result);
		},

		resetSourceDatas: function(source) {
			var self = this;
			$.each(this.simu.datas, function( name, data ) {
				if (typeof data.unparsedSource !== "undefined" && data.unparsedSource !== "") {
					var s = self.evaluate(data.unparsedSource);
					if (s == source) {
						self.unsetValue(name);
					}
				}
			});
		},

		populateChoiceDependencies : function (source, result) {
			var self = this;
			var dependencies = this.simu.sources[source]['choiceDependencies'];
			if (dependencies) {
				$.each(dependencies, function( d, dependency ) {
					var valueColumn = self.getData(dependency).choices.source.valueColumn;
					var labelColumn = self.getData(dependency).choices.source.labelColumn;
					var choice = $("#"+dependency);
					if (choice.is('select')) {
						choice.empty();
						var options = ['<option value="">-----</option>'];
						for (var r in result) {
							var row = result[r];
							options.push('<option value="', row[valueColumn] || row[valueColumn.toLowerCase()], '">', row[labelColumn] || row[labelColumn.toLowerCase()], '</option>');
						}
						choice.html(options.join(''));
					} else if (choice.hasClass('listbox-input')) {
						var items = [];
						items.push({ value: "", text: "-----", selected: true});
						for (var r in result) {
							var row = result[r];
							items.push({ value: row[valueColumn] || row[valueColumn.toLowerCase()], text: row[labelColumn] || row[labelColumn.toLowerCase()] });
						}
						choice.listbox('setItems', items);
					}
					self.setValue(dependency, "");
				});
			}
		},

		validateAll: function() {
			var self = this;
			var ok = true;
			this.hasError = false;
			$.each(this.simu.datas, function( name, data ) {
				ok = self.validate(name) && ok;
			});
			if (ok) this.rulesengine.runAll(this.variables,
				function(err, result) {
					if (err) {
					}
				}
			);
			return ok && !this.hasError;
		},

		processFields: function () {
			this.variables['script'] = 1;
			this.variables['dynamic'] = 1;

			this.evaluateDefaults();
			var self = this;
			$("#g6k_form input[type!=checkbox][type!=radio][name], #g6k_form input:radio:checked[name], #g6k_form input:checkbox:checked[name], #g6k_form select[name], #g6k_form textarea[name]").each(function() {
				var name = self.normalizeName($(this).attr('name'));
				var data = self.getData(name);
				if (data) {
					var value = $(this).val();
					if (value && (data.type === "money" || data.type === "percent" || data.type === "number")) {
						value = self.unFormatValue(value);
					}
					if (data.type === 'multichoice') {
						if ($(this).attr('type') === 'checkbox') {
							var ovalues = self.variables[name] || [];
							ovalues.push(value);
							value = ovalues;
						} else if (/^\[.*\]$/.test(value)) {
							value = JSON.parse(value);
						}
					}
					self.variables[name] = value;
				}
			});

			var rulesData = [];
			$.each(this.simu.rules, function(r, rule) {
				rulesData.push(
					{
						conditions: rule.conditions,
						ifActions: rule.ifdata,
						elseActions: rule.elsedata
					}
				);
			});
			var actionsAdapter = {
				notifyError: function(data) {
					var errorMessage = data.find("message"); 
					var target = data.find("target");
					switch (target) {
						case 'data':
							var fieldName = data.find("target", "fieldName");
							self.setError(fieldName, self.replaceVariables(errorMessage));
							break;
						case 'datagroup':
							var datagroupName = data.find("target", "datagroupName");
							self.setGroupError(datagroupName, self.replaceVariables(errorMessage));
							break;
						case 'dataset':
							self.setGlobalError(self.replaceVariables(errorMessage));
							break;
					}
				},
				notifyWarning: function(data) {
					var warningMessage = data.find("message"); 
					var target = data.find("target");
					switch (target) {
						case 'data':
							var fieldName = data.find("target", "fieldName");
							self.setWarning(fieldName, self.replaceVariables(warningMessage));
							break;
						case 'datagroup':
							var datagroupName = data.find("target", "datagroupName");
							self.setGroupWarning(datagroupName, self.replaceVariables(warningMessage));
							break;
						case 'dataset':
							self.setGlobalWarning(self.replaceVariables(warningMessage));
							break;
					}
				},
				setAttribute: function(data) {
					var attribute = data.find("attributeId");
					var fieldName = data.find("attributeId", "fieldName");
					var newValue = data.find("attributeId", "fieldName", "newValue");
					switch (attribute) {
						case 'content':
							var data = self.getData(fieldName);
							data.unparsedContent = newValue;
							if (data.unparsedContent !== "") {
								if ((! data.modifiedByUser || ! data.value || data.value.length == 0)) {
									var content = self.evaluate(data.unparsedContent);
									if (content !== false) {
										if (content && data.type === "multichoice" && ! $.isArray(content)) {
											if (/\[\]$/.test(content)) {
												content = JSON.parse(content);
											} else {
												content = [content];
											}
										}
										if (data.value !== content) {
											self.setValue(fieldName, content);
										}
									}
								}
							} else {
								self.unsetValue(fieldName);
							}
							break;
						case 'default':
							self.getData(fieldName).unparsedDefault = newValue;
							break;
						case 'explanation':
							self.getData(fieldName).unparsedExplanation = newValue;
							break;
						case 'index':
							self.getData(fieldName).unparsedIndex = newValue;
							self.reevaluateFields(fieldName);
							break;
						case 'min':
							self.getData(fieldName).unparsedMin = newValue;
							self.resetMin(fieldName);
							break;
						case 'max':
							self.getData(fieldName).unparsedMax = newValue;
							self.resetMax(fieldName);
							break;
						case 'source':
							self.getData(fieldName).unparsedSource = newValue;
							break;
					}
				},
				unsetAttribute: function(data) {
					var attribute = data.find("attributeId");
					var fieldName = data.find("attributeId", "fieldName");
					switch (attribute) {
						case 'content':
							var data = self.getData(fieldName);
							data.unparsedContent = '';
							self.unsetValue(fieldName);
							break;
						case 'default':
							self.getData(fieldName).unparsedDefault = '';
							break;
						case 'explanation':
							self.getData(fieldName).unparsedExplanation = '';
							break;
						case 'index':
							self.getData(fieldName).unparsedIndex = '';
							self.reevaluateFields(fieldName);
							break;
						case 'min':
							self.getData(fieldName).unparsedMin = '';
							self.resetMin(fieldName);
							break;
						case 'max':
							self.getData(fieldName).unparsedMax = '';
							self.resetMax(fieldName);
							break;
						case 'source':
							self.getData(fieldName).unparsedSource = '';
							break;
					}
				},
				hideObject: function(data) {
					var currStepId = $('input[name=step]').eq(0).val();
					var objectId = data.find("objectId");
					var stepId = data.find("objectId", "stepId");
					if (stepId == currStepId) {
						switch (objectId) {
							case 'step':
								break;
							case 'panel':
								var panelId = data.find("objectId", "stepId", "panelId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId));
								break;
							case 'fieldset':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId));
								break;
							case 'fieldrow':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId + "-fieldrow-" + fieldrowId));
								break;
							case 'field':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId).find("div[data-field-position=" + fieldId + "]"));
								break;
							case 'blockinfo':
								var panelId = data.find("objectId", "stepId", "panelId");
								var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId + "-blockinfo-" + blockinfoId));
								break;
							case 'chapter':
								var panelId = data.find("objectId", "stepId", "panelId");
								var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
								var chapterId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId + "-blockinfo-" + blockinfoId + "-chapter-" + chapterId));
								break;
							case 'section':
								var panelId = data.find("objectId", "stepId", "panelId");
								var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
								var chapterId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId");
								var sectionId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId", "sectionId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId + "-blockinfo-" + blockinfoId + "-chapter-" + chapterId + "-section-" + sectionId));
								break;
							case 'prenote':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId).find("div[data-field-position=" + fieldId + "] .pre-note"));
								break;
							case 'postnote':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId");
								self.hideObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId).find("div[data-field-position=" + fieldId + "] .post-note"));
								break;
							case 'action':
								var actionId = data.find("objectId", "stepId", "actionId");
								var action = "#g6k_form button[name=" + actionId + "], #g6k_form input[name=" + actionId + "]";
								$(action).attr('aria-hidden', true).prop('disabled', true).hide();
								break;
							case 'footnote':
								var footnoteId = data.find("objectId", "stepId", "footnoteId");
								var footnote = "#foot-note-" + footnoteId;
								self.hideObject($(footnote));
								if ( $("div.foot-notes").has("div.foot-note:visible").length) {
									self.showObjectLater($("div.foot-notes"));
								} else {
									self.hideObject($("div.foot-notes"));
								}
								break;
							case 'choice':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId");
								var choiceId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId", "choiceId");
								var field = $("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId).find("div[data-field-position=" + fieldId + "]");
								if (field.attr('data-type') === 'choice' && (!field.attr('data-expanded') || field.attr('data-expanded') === 'false')) {
									var input = field.find("input.listbox-input, select");
									if (input.is('select')) {
										input.hideOption(choiceId); 
									} else {
										input.listbox('hideItem', choiceId);
									}
								} else {
									var input = field.find("input[value=" + choiceId + "]");
									input.parent('label').attr('aria-hidden', true).hide();
								}
								break;
						}
					}
				},
				showObject: function(data) {
					var currStepId = $('input[name=step]').eq(0).val();
					var objectId = data.find("objectId");
					var stepId = data.find("objectId", "stepId");
					if (stepId == currStepId) {
						switch (objectId) {
							case 'step':
								break;
							case 'panel':
								var panelId = data.find("objectId", "stepId", "panelId");
								self.showObjectLater($("#" + self.simu.step.name + "-panel-" + panelId));
								break;
							case 'fieldset':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								self.showObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId));
								break;
							case 'fieldrow':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldrowId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldrowId");
								self.showObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId + "-fieldrow-" + fieldrowId));
								break;
							case 'field':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId");
								self.showObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId).find("div[data-field-position=" + fieldId + "]"));
								break;
							case 'blockinfo':
								var panelId = data.find("objectId", "stepId", "panelId");
								var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
								self.showObjectLater($("#" + self.simu.step.name + "-panel-" + panelId + "-blockinfo-" + blockinfoId));
								break;
							case 'chapter':
								var panelId = data.find("objectId", "stepId", "panelId");
								var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
								var chapterId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId");
								self.showObjectLater($("#" + self.simu.step.name + "-panel-" + panelId + "-blockinfo-" + blockinfoId + "-chapter-" + chapterId));
								break;
							case 'section':
								var panelId = data.find("objectId", "stepId", "panelId");
								var blockinfoId = data.find("objectId", "stepId", "panelId", "blockinfoId");
								var chapterId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId");
								var sectionId = data.find("objectId", "stepId", "panelId", "blockinfoId", "chapterId", "sectionId");
								self.showObjectLater($("#" + self.simu.step.name + "-panel-" + panelId + "-blockinfo-" + blockinfoId + "-chapter-" + chapterId + "-section-" + sectionId));
								break;
							case 'prenote':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId");
								self.showObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId).find("div[data-field-position=" + fieldId + "] .pre-note"));
								break;
							case 'postnote':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId");
								self.showObject($("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId).find("div[data-field-position=" + fieldId + "] .post-note"));
								break;
							case 'action':
								var actionId = data.find("objectId", "stepId", "actionId");
								var action = "#g6k_form button[name=" + actionId + "], #g6k_form input[name=" + actionId + "]";
								$(action).show().removeAttr('aria-hidden').prop('disabled', false);
								break;
							case 'footnote':
								var footnoteId = data.find("objectId", "stepId", "footnoteId");
								var footnote = "#foot-note-" + footnoteId;
								$(footnote).show().removeAttr('aria-hidden');
								self.showObjectLater($("div.foot-notes"));
								break;
							case 'choice':
								var panelId = data.find("objectId", "stepId", "panelId");
								var fieldsetId = data.find("objectId", "stepId", "panelId", "fieldsetId");
								var fieldId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId");
								var choiceId = data.find("objectId", "stepId", "panelId", "fieldsetId", "fieldId", "choiceId");
								var field = $("#" + self.simu.step.name + "-panel-" + panelId + "-fieldset-" + fieldsetId).find("div[data-field-position=" + fieldId + "]");
								if (field.attr('data-type') === 'choice' && (!field.attr('data-expanded') || field.attr('data-expanded') === 'false')) {
									var input = field.find("input.listbox-input, select");
									if (input.is('select')) {
										input.showOption(choiceId); 
									} else {
										input.listbox('showItem', choiceId);
									}
								} else {
									var input = field.find("input[value=" + choiceId + "]");
									input.parent('label').show().removeAttr('aria-hidden');
								}
								break;
						}
					}
				}
			};
			this.rulesengine = new RuleEngine({
				rulesData: rulesData,
				actionsAdapter: actionsAdapter
			});

			this.rulesengine.runAll(this.variables,
				function(err, result) {
					if (err) {  }
				}
			);

			$(".simulator-profiles ul li").on("click", function () {
				self.setProfile($(this));
				return true;
			}); 

			$(".simulator-profiles ul li").on("keydown", function (event) {
				if (event.keyCode == 13 || event.keyCode == 32) {
					self.setProfile($(this));
				}
				return true;
			}); 

			$("#g6k_form input[name], #g6k_form select[name], #g6k_form textarea[name]").change(function () {
				clearTimeout(self.inputTimeoutId);
				var name = self.normalizeName($(this).attr('name'));
				self.lastUserInputName = name;
				var data = self.getData(name);
				data.modifiedByUser = true;
				self.removeGlobalError();
				var value = $(this).val();
				if ($(this).attr('type') === 'checkbox') {
					if (data.type === 'boolean') {
						value = $(this).is(':checked') ? 'true' : 'false';
						self.setValue(name, value);
					} else if (data.type === 'multichoice') {
							if ($(this).is(':checked')) {
								self.setValue(name, value);
							} else {
								self.unsetChoiceValue(name, value);
							}
					}
				} else {
					self.setValue(name, value);
				}
			});
			$("#g6k_form input[name], #g6k_form select[name], #g6k_form textarea[name]").focusout(function () {
				var name = self.normalizeName($(this).attr('name'));
				var data = self.getData(name);
				if (!self.check(data)) {
					switch (data.type) {
						case 'date':
							self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans(Date.format) }, 'messages'));
							break;
						case 'number': 
							self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
							break;
						case 'integer': 
							self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
							break;
						case 'money': 
							self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("amount") }, 'messages'));
							break;
						case 'percent':
							self.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("percentage") }, 'messages'));
							break;
						default:
							self.setError(name, Translator.trans("This value is not in the expected format"));
					}
				} else if (!self.checkMin(data)) {
					var min = self.evaluate(data.unparsedMin);
					if (data.type == 'text' || data.type == 'textarea') {
						self.setError(name, Translator.trans("The length of this value can not be less than %min%",  { "min": min }, 'messages'));
					} else {
						self.setError(name, Translator.trans("This value can not be less than %min%",  { "min": min }, 'messages'));
					}
				} else if (!self.checkMax(data)) {
					var max = self.evaluate(data.unparsedMax);
					if (data.type == 'text' || data.type == 'textarea') {
						self.setError(name, Translator.trans("The length of this value can not be greater than %max%",  { "max": max }, 'messages'));
					} else {
						self.setError(name, Translator.trans("This value can not be greater than %max%",  { "max": max }, 'messages'));
					}
				}
			});
			$("#g6k_form input[type=text][name], #g6k_form input[type=money][name], #g6k_form input[type=number][name]").on("keypress", function(event) {
				if (event.keyCode == 13) {
					event.preventDefault();
					self.getData($(this).attr('name')).modifiedByUser = true;
					$(this).trigger("change");
					$(this).focusNextInputField();
				}
			});
			$("#g6k_form input[type=text][name]:not([data-widget]), #g6k_form input[type=money][name]:not([data-widget]), #g6k_form input[type=number][name]:not([data-widget])").on('input propertychange', function(event) {
				var elt = this;
				if (!this.hasAttribute('minlength') || $(this).val().length >= parseInt($(this).attr('minlength'), 10)) {
					self.triggerChange($(this), true, true);
				}
			});
			$("#g6k_form input[type=text][name], #g6k_form input[type=money][name]").on('paste', function(event) {
				var elt = this;
				self.getData($(this).attr('name')).modifiedByUser = true;
				clearTimeout(self.inputTimeoutId);
				self.inputTimeoutId = setTimeout(function () {
					$(elt).trigger("change");
					$(elt).focusNextInputField();
				}, 0);
			});
			$("#g6k_form fieldset label.choice input[type=radio][name]").change(function(event) {
				var $label = $(this).parent('label.choice');
				$label.parent('fieldset').find('label.choice').removeClass('checked');
				if ( $(this).is(':checked') ) {
					$label.addClass('checked');
				}
			});
			$("#g6k_form fieldset input[type=checkbox][name]").change(function(event) {
				var id = $(this).attr('id');
				var label = $(this).closest('fieldset').find("label[for='" + id + "']");
				if ($(this).is(':checked')) {
					label.addClass('checked');
				} else {
					label.removeClass('checked');
				}
			});
			$("#g6k_form fieldset label.choice input[type=radio][name]").focus(function(event) {
				var $label = $(this).parent('label.choice');
				$label.parent('fieldset').addClass('focused');
				var checked = false;
				var $this = $(this);
				$label.parent('fieldset').find('label.choice input[type=radio][name]').each(function() {
					if ( $(this).is(':checked') ) {
						checked = true;
					}
				});
				if (!checked) {
					$label.eq(0).addClass('checked-candidate');
				}
			});
			$("#g6k_form fieldset label.choice input[type=radio][name]").blur(function(event) {
				var $fieldset = $(this).parent('label.choice').parent('fieldset');
				var focused = false;
				var $this = $(this);
				$fieldset.find('label.choice input[type=radio][name]').each(function() {
					if ( $(this).is(':focus') ) {
						focused = true;
					}
				});
				if (!focused) {
					$fieldset.removeClass('focused');
				}
				$fieldset.find('label.choice').removeClass('checked-candidate');
			});
			$( "#g6k_form input[type=submit][name], #g6k_form button[type=submit][name]" ).click(function( event ) {
				self.lastSubmitBtn = this.name;
			});
			$( "#g6k_form input[type=submit][name], #g6k_form button[type=submit][name]" ).keypress(function( event ) {
				var key = event.which || event.keyCode;
				if (key == 13) {
					self.lastSubmitBtn = this.name;
				}
			});
			$( "#g6k_form").submit(function( event ) {
				var bname = self.lastSubmitBtn;
				var bwhat = self.simu.step.actions[bname].what;
				var bfor = self.simu.step.actions[bname].for;
				if (bwhat == 'submit' && bfor == 'priorStep') {
					return;
				}
				if (bwhat == 'submit' && bfor == 'newSimulation') {
					$('#g6k_form').clearForm();
					$("input.resettable").val("");
					return;
				}
				if (self.hasFatalError || ! self.validateAll()) {
					self.setGlobalError(Translator.trans("To continue you must first correct your entry"));
					event.preventDefault();
				}
			});
			$.each(this.simu.datas, function( name, data ) {
				data.value = self.variables[name];
				if (typeof data.unparsedContent !== "undefined" && data.unparsedContent !== "") {
					var content = self.evaluate(data.unparsedContent);
					if (content !== false) {
						if (content && data.type === "multichoice" && ! $.isArray(content)) {
							if (/\[\]$/.test(content)) {
								content = JSON.parse(content);
							} else {
								content = [content];
							}
						} else if (content && (data.type === "money" || data.type === "percent")) {
							content = self.unFormatValue(content);
							content = parseFloat(content).toFixed(data.round || 2);
						} else if (content && data.type === "number") {
							content = self.unFormatValue(content);
							if (data.round) {
								content = parseFloat(content).toFixed(data.round);
							}
						}
						data.value = content;
						self.setVariable(name, data);
					} else if (data.value !== '') {
						data.value = '';
						self.setVariable(name, data);
					}

				}
			});
			if ($("input[name='script']").val() == 0) {
				$.each(this.simu.datas, function( name, data ) {
					self.reevaluateFields(name);
				});
				$("input[name='script']").val(1);
			} else {
				$.each(this.simu.datas, function( name, data ) {
					self.reevaluateFields(name);
				});
			}
			if ( $("div.foot-notes").children("div.foot-note").filter(":visible").length) {
				self.showObjectLater($("div.foot-notes"));
			} else {
				self.hideObject($("div.foot-notes"));
			}
		},

		triggerChange: function(input, delayed, modifiedByUser) {
			var self = this;
			clearTimeout(self.inputTimeoutId);
			if (typeof modifiedByUser !== "undefined") {
				self.getData(input.attr('name')).modifiedByUser = modifiedByUser;
			}
			if (delayed) {
				self.inputTimeoutId = setTimeout(function () {
					input.trigger("change");
				}, 500);
			} else {
				input.trigger("change");
			}
		},

		initializeWidgets: function() {
			var self = this;
			var options = { 
				locale: self.locale,
				mobile: self.isMobile,
				dateFormat: self.dateFormat,
				decimalPoint: self.decimalPoint,
				moneySymbol: self.moneySymbol,
				symbolPosition: self.symbolPosition,
				groupingSeparator: self.groupingSeparator,
				groupingSize: self.groupingSize
			};
			$(':input[data-widget]').each(function() {
				var widget = window[$(this).attr('data-widget')];
				var that = $(this);
				that.data('g6k', self);
				widget.call(null, that, options, function (value, text, preserveVal, delayed) {
					if (!preserveVal) {
						that.val(value);
					}
					self.triggerChange(that, delayed);
				});
			});
		},

		initializeExternalFunctions: function() {
			var self = this;
			$('div.action_buttons > [data-function]').each(function() {
				var func = $(this).attr('data-function');
				func = func.replace(/'/g, '"');
				func = $.parseJSON(func);
				var funct = window[func.function];
				var that = $(this);
				that.data('g6k', self);
				funct.call(null, that, func, function(ok, message) {
					if (self.hasGlobalError) {
						self.removeGlobalError();
					}
					if (message) {
						if (ok) {
							var mess = $('<div>', { 
								'class': func.function.toLowerCase() + '-function-status', 
								'aria-live': 'assertive', 
								'html': '<p>' + Translator.trans(message) + '</p>'
							});
							that.parent().after(mess);
								mess.fadeOut(7000, function() {
								setTimeout(function() {
									mess.remove();
								}, 10);
							});
						} else {
							self.setGlobalError(Translator.trans(message));
						}
					}
				});
			});
		},

		hideObject: function(obj) {
			obj.attr('aria-hidden', true).hide();
			return obj;
		},

		showObject: function(obj, delay) {
			obj.show().removeAttr('aria-hidden');
			return obj;
		},

		showObjectLater: function(obj, delay) {
			delay = delay || 120;
			setTimeout(function(){ obj.show().removeAttr('aria-hidden'); }, delay);
			return obj;
		},

		choiceLabel: function(data) {
			var label = '';
			if (data.choices) {
				$.each(data.choices, function(c, choice) {
					if (choice[data.value]) {
						label = choice[data.value];
						return false;
					}
				});
			}
			return label;
		},

		formatValue: function(data) {
			var value = data.value;
			if (value && $.isNumeric(value) && (data.type === "money" || data.type === "percent")) {
				value = AutoNumeric.format(parseFloat(value), {
					currencySymbol: '',
					decimalCharacter: this.decimalPoint,
					decimalPlaces: data.round || 2,
					digitGroupSeparator: this.groupingSeparator,
					digitalGroupSpacing: this.groupingSize
				});
			}
			if (value && data.type === "number") {
				value = AutoNumeric.format(value, {
					decimalCharacter: this.decimalPoint,
					decimalPlaces: data.round || null,
					digitGroupSeparator: this.groupingSeparator,
					digitalGroupSpacing: this.groupingSize
				});
			}
			if (value && data.type === "text") {
				if (/^https?\:\/\//.test(value)) {
					if (/(jpg|jpeg|gif|png|svg)$/i.test(value)) {
						value = '<img src="'+value+'" alt="'+value+'">';
					} else {
						value = '<a href="'+value+'">'+value+'</a>';
					}
				} else if (/^data\:image\//.test(value)) {
					value = '<img src="'+value+'" alt="*">';
				}
			}
			if ($.isArray(value)) {
				value = value.join(", ");
			}
			return value;
		},

		unFormatValue: function(value) {
			var ts = new RegExp(this.groupingSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
			var dp = new RegExp(this.decimalPoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
			value = value.replace(ts, '').replace(dp, '.');
			return value;
		},

		replaceVariablesBase: function(target) {
			var self = this;
			var result = target.replace(
				/\<data\s+[^\s]*\s*value="(\d+)"[^\>]*\>[^\<]+\<\/data\>(L?)/g,
				function (match, m1, m2, offs, str) {
					var name = self.getDataNameById(m1);
					return (name) ? '#(' + name + ')' + m2 : match;
				}
			);
			result = result.replace(
				/#\(([^\)]+)\)(L?)/g,
				function (match, m1, m2, offs, str) {
					var data = self.getData(m1);
					if (data && data.value) {
						if (m2 === 'L') {
							var label = self.choiceLabel(data);
							if (label !== '') {
								return label;
							}
						}
						return self.formatValue(data);
					} else {
						return match;
					}
				}
			);
			return result;
		},

		replaceVariables: function(target) {
			var result = this.replaceVariablesBase(target);
			return /#\(([^\)]+)\)/.test(result) ? false : result;
		},

		replaceVariablesOrBlank: function(target) {
			var self = this;
			var result = self.replaceVariablesBase(target);
			result = result.replace(
				/#\(([^\)]+)\)(L?)/g,
				function (match, m1, m2, offs, str) {
					var data = self.getData(m1);
					switch (data.type) {
						case 'integer':
						case 'number':
							return '0';
						case 'percent':
						case 'money':
							var v = data.value;
							data.value = '0';
							var formatted =  self.formatValue(data);
							data.value = v;
							return formatted;
						default:
							return '';
					}
				}
			);
			result = result.replace(
				/\<data\s+[^\s]*\s*value="(\d+)"[^\>]*\>[^\<]+\<\/data\>(L?)/g,
				function (match, m1, m2, offs, str) {
					var data = self.getData(m1);
					switch (data.type) {
						case 'integer':
						case 'number':
							return '0';
						case 'percent':
						case 'money':
							var v = data.value;
							data.value = '0';
							var formatted =  self.formatValue(data);
							data.value = v;
							return formatted;
						default:
							return '';
					}
				}
			);
			return result;
		}

	};

	global.G6k = G6k;

}(this));

$.fn.clearForm = function() {
	this.each(function() {
		var type = this.type, tag = this.tagName.toLowerCase();
		if (tag == 'form')
			return $(':input',this).clearForm();
		if (type == 'text' || type == 'password'  || type == 'number'|| tag == 'textarea') {
			this.setAttribute('value', '');
			if ($(this).hasClass('listbox-input')) {
				$(this).listbox('update');
			}
		} else if (type == 'checkbox' || type == 'radio')
			this.removeAttribute('checked');
		else if (type == 'select-one' || tag == 'select') {
			$('option', this).each(function(){
				this.removeAttribute('selected');
			});
			$(this).val("");
		}
	});

};

$.fn.focusNextInputField = function() {
	return this.each(function() {
		var fields = $(this).parents('form:eq(0)').find('input:visible,textarea:visible,select:visible');
		var index = fields.index( this );
		if ( index > -1 && ( index + 1 ) < fields.length ) {
			fields.eq( index + 1 ).focus();
		}
		return false;
	});
};


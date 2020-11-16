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
		z.setFullYear(year);
		z.setMonth(m - 1);
		z.setDate(d);
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
		for (var monthday of fixed) {
			holidays.push(Date.createFromFormat("Y-n-j", year + "-" + monthday));
		}
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
			for (var holiday of holidays) {
				var d = holiday.getDay();
				if (d != 0 && d != 6 && holiday >= startDate && holiday <= endDate)
					days = days - 1;
			}
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
		for (var holiday of holidays) {
			if (holiday == self) {
				isHoliday = true;
				return false;
			}
		}
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
			fixed_holidays: ["01-01", "07-04", "11-01", "12-25"],
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

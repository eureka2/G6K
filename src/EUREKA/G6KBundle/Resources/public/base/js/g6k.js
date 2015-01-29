(function () {
	"use strict";
	
	Date.msPERDAY = 1000 * 60 * 60 * 24;
	
	Date.prototype.msPERDAY = Date.msPERDAY;
	
	Date.prototype.copy = function () { 
		return new Date( this.getTime() ); 
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
	};
	
	Date.prototype.addWeeks = function(w) {
		this.addDays(w * 7);
	};
	
	Date.prototype.addMonths = function(m) {
		var d = this.getDate();
		this.setMonth(this.getMonth() + m);
		if (this.getDate() < d)
			 this.setDate(0);
	};
	
	Date.prototype.addYears = function(y) {
		var m = this.getMonth();
		this.setFullYear(this.getFullYear() + y);
		if (m < this.getMonth()) {
			this.setDate(0);
		}
	};
	
	Date.prototype.addWeekDays = function(d) {
		var startDay = this.getDay();  //current weekday 0 thru 6
		var wkEnds = 0;                //# of weekends needed
		var partialWeek = d % 5;       //# of weekdays for partial week
		if (d < 0) {                 //subtracting weekdays 
			wkEnds = Math.ceil(d/5); //negative number weekends
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
			this.locale = lang;
		}
	};

	Date.prototype.getLocale = function () {
		return this.locale || "en";
	};

	Date.prototype.getMonthName = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (this.locale && this.locale in Date.locales) {
			locale = this.locale;
		}
		return Date.locales[locale].month_names[this.getMonth()];
	};

	Date.prototype.getMonthNameShort = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (this.locale && this.locale in Date.locales) {
			locale = this.locale;
		}
		return Date.locales[locale].month_names_short[this.getMonth()];
	};

	Date.prototype.getDayName = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (this.locale && this.locale in Date.locales) {
			locale = this.locale;
		}
		return Date.locales[locale].day_names[this.getDay()];
	};

	Date.prototype.getDayNameShort = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (this.locale && this.locale in Date.locales) {
			locale = this.locale;
		}
		return Date.locales[locale].day_names_short[this.getDay()];
	};

	Date.prototype.getDateSuffix = function (lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (this.locale && this.locale in Date.locales) {
			locale = this.locale;
		}
		return Date.locales[locale].date_suffix(this.getDate());
	};

	Date.prototype.getMeridiem = function (isLower, lang) {
		var locale = "en";
		if (lang && lang in Date.locales) {
			locale = lang;
		} else if (this.locale && this.locale in Date.locales) {
			locale = this.locale;
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
		"ar-ma": {
			month_names: "ÙŠÙ†Ø§ÙŠØ±_ÙØ¨Ø±Ø§ÙŠØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙŠÙ„_Ù…Ø§ÙŠ_ÙŠÙˆÙ†ÙŠÙˆ_ÙŠÙˆÙ„ÙŠÙˆØ²_ØºØ´Øª_Ø´ØªÙ†Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙ†Ø¨Ø±_Ø¯Ø¬Ù†Ø¨Ø±".split("_"),
			month_names_short: "ÙŠÙ†Ø§ÙŠØ±_ÙØ¨Ø±Ø§ÙŠØ±_Ù…Ø§Ø±Ø³_Ø£Ø¨Ø±ÙŠÙ„_Ù…Ø§ÙŠ_ÙŠÙˆÙ†ÙŠÙˆ_ÙŠÙˆÙ„ÙŠÙˆØ²_ØºØ´Øª_Ø´ØªÙ†Ø¨Ø±_Ø£ÙƒØªÙˆØ¨Ø±_Ù†ÙˆÙ†Ø¨Ø±_Ø¯Ø¬Ù†Ø¨Ø±".split("_"),
			day_names: "Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥ØªÙ†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª".split("_"),
			day_names_short: "Ø§Ø­Ø¯_Ø§ØªÙ†ÙŠÙ†_Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ø±Ø¨Ø¹Ø§Ø¡_Ø®Ù…ÙŠØ³_Ø¬Ù…Ø¹Ø©_Ø³Ø¨Øª".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem : function (hour, minute, isLower) {
				return "";
			}
		},
		"ar": {
			month_names: "ÙŠÙ†Ø§ÙŠØ±/ ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ_ÙØ¨Ø±Ø§ÙŠØ±/ Ø´Ø¨Ø§Ø·_Ù…Ø§Ø±Ø³/ Ø¢Ø°Ø§Ø±_Ø£Ø¨Ø±ÙŠÙ„/ Ù†ÙŠØ³Ø§Ù†_Ù…Ø§ÙŠÙˆ/ Ø£ÙŠØ§Ø±_ÙŠÙˆÙ†ÙŠÙˆ/ Ø­Ø²ÙŠØ±Ø§Ù†_ÙŠÙˆÙ„ÙŠÙˆ/ ØªÙ…ÙˆØ²_Ø£ØºØ³Ø·Ø³/ Ø¢Ø¨_Ø³Ø¨ØªÙ…Ø¨Ø±/ Ø£ÙŠÙ„ÙˆÙ„_Ø£ÙƒØªÙˆØ¨Ø±/ ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø£ÙˆÙ„_Ù†ÙˆÙÙ…Ø¨Ø±/ ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ_Ø¯ÙŠØ³Ù…Ø¨Ø±/ ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø£ÙˆÙ„".split("_"),
			month_names_short: "ÙŠÙ†Ø§ÙŠØ±/ ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ_ÙØ¨Ø±Ø§ÙŠØ±/ Ø´Ø¨Ø§Ø·_Ù…Ø§Ø±Ø³/ Ø¢Ø°Ø§Ø±_Ø£Ø¨Ø±ÙŠÙ„/ Ù†ÙŠØ³Ø§Ù†_Ù…Ø§ÙŠÙˆ/ Ø£ÙŠØ§Ø±_ÙŠÙˆÙ†ÙŠÙˆ/ Ø­Ø²ÙŠØ±Ø§Ù†_ÙŠÙˆÙ„ÙŠÙˆ/ ØªÙ…ÙˆØ²_Ø£ØºØ³Ø·Ø³/ Ø¢Ø¨_Ø³Ø¨ØªÙ…Ø¨Ø±/ Ø£ÙŠÙ„ÙˆÙ„_Ø£ÙƒØªÙˆØ¨Ø±/ ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø£ÙˆÙ„_Ù†ÙˆÙÙ…Ø¨Ø±/ ØªØ´Ø±ÙŠÙ† Ø§Ù„Ø«Ø§Ù†ÙŠ_Ø¯ÙŠØ³Ù…Ø¨Ø±/ ÙƒØ§Ù†ÙˆÙ† Ø§Ù„Ø£ÙˆÙ„".split("_"),
			day_names: "Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª".split("_"),
			day_names_short: "Ø§Ù„Ø£Ø­Ø¯_Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†_Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡_Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡_Ø§Ù„Ø®Ù…ÙŠØ³_Ø§Ù„Ø¬Ù…Ø¹Ø©_Ø§Ù„Ø³Ø¨Øª".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"bg": {
			month_names: "ÑÐ½ÑƒÐ°Ñ€Ð¸_Ñ„ÐµÐ²Ñ€ÑƒÐ°Ñ€Ð¸_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€Ð¸Ð»_Ð¼Ð°Ð¹_ÑŽÐ½Ð¸_ÑŽÐ»Ð¸_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ¿Ñ‚ÐµÐ¼Ð²Ñ€Ð¸_Ð¾ÐºÑ‚Ð¾Ð¼Ð²Ñ€Ð¸_Ð½Ð¾ÐµÐ¼Ð²Ñ€Ð¸_Ð´ÐµÐºÐµÐ¼Ð²Ñ€Ð¸".split("_"),
			month_names_short: "ÑÐ½Ñ€_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_ÑŽÐ½Ð¸_ÑŽÐ»Ð¸_Ð°Ð²Ð³_ÑÐµÐ¿_Ð¾ÐºÑ‚_Ð½Ð¾Ðµ_Ð´ÐµÐº".split("_"),
			day_names: "Ð½ÐµÐ´ÐµÐ»Ñ_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»Ð½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÑÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÑŠÑ€Ñ‚ÑŠÐº_Ð¿ÐµÑ‚ÑŠÐº_ÑÑŠÐ±Ð¾Ñ‚Ð°".split("_"),
			day_names_short: "Ð½ÐµÐ´_Ð¿Ð¾Ð½_Ð²Ñ‚Ð¾_ÑÑ€Ñ_Ñ‡ÐµÑ‚_Ð¿ÐµÑ‚_ÑÑŠÐ±".split("_"),
			date_suffix: function (date) {
				var lastDigit = date % 10,
					last2Digits = date % 100;
				if (date === 0) {
					return '-ÐµÐ²';
				} else if (last2Digits === 0) {
					return '-ÐµÐ½';
				} else if (last2Digits > 10 && last2Digits < 20) {
					return '-Ñ‚Ð¸';
				} else if (lastDigit === 1) {
					return '-Ð²Ð¸';
				} else if (lastDigit === 2) {
					return '-Ñ€Ð¸';
				} else if (lastDigit === 7 || lastDigit === 8) {
					return '-Ð¼Ð¸';
				} else {
					return '-Ñ‚Ð¸';
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
				return (date === 1) ? 'aÃ±' : 'vet';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"bs": {
			month_names: "januar_februar_mart_april_maj_juni_juli_avgust_septembar_oktobar_novembar_decembar".split("_"),
			month_names_short: "jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),
			day_names: "nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota".split("_"),
			day_names_short: "ned._pon._uto._sri._Äet._pet._sub.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ca": {
			month_names: "gener_febrer_marÃ§_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre".split("_"),
			month_names_short: "gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.".split("_"),
			day_names: "diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte".split("_"),
			day_names_short: "dg._dl._dt._dc._dj._dv._ds.".split("_"),
			date_suffix: function (date) {
				return "Âº";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"cs": {
			month_names: "leden_Ãºnor_bÅ™ezen_duben_kvÄ›ten_Äerven_Äervenec_srpen_zÃ¡Å™Ã­_Å™Ã­jen_listopad_prosinec".split("_"),
			month_names_short: "led_Ãºno_bÅ™e_dub_kvÄ›_Ävn_Ävc_srp_zÃ¡Å™_Å™Ã­j_lis_pro".split("_"),
			day_names: "nedÄ›le_pondÄ›lÃ­_ÃºterÃ½_stÅ™eda_Ätvrtek_pÃ¡tek_sobota".split("_"),
			day_names_short: "ne_po_Ãºt_st_Ät_pÃ¡_so".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"cv": {
			month_names: "ÐºÄƒÑ€Ð»Ð°Ñ‡_Ð½Ð°Ñ€ÄƒÑ_Ð¿ÑƒÑˆ_Ð°ÐºÐ°_Ð¼Ð°Ð¹_Ã§Ä•Ñ€Ñ‚Ð¼Ðµ_ÑƒÑ‚Äƒ_Ã§ÑƒÑ€Ð»Ð°_Ð°Ð²ÄƒÐ½_ÑŽÐ¿Ð°_Ñ‡Ó³Ðº_Ñ€Ð°ÑˆÑ‚Ð°Ð²".split("_"),
			month_names_short: "ÐºÄƒÑ€_Ð½Ð°Ñ€_Ð¿ÑƒÑˆ_Ð°ÐºÐ°_Ð¼Ð°Ð¹_Ã§Ä•Ñ€_ÑƒÑ‚Äƒ_Ã§ÑƒÑ€_Ð°Ð²_ÑŽÐ¿Ð°_Ñ‡Ó³Ðº_Ñ€Ð°Ñˆ".split("_"),
			day_names: "Ð²Ñ‹Ñ€ÑÐ°Ñ€Ð½Ð¸ÐºÑƒÐ½_Ñ‚ÑƒÐ½Ñ‚Ð¸ÐºÑƒÐ½_Ñ‹Ñ‚Ð»Ð°Ñ€Ð¸ÐºÑƒÐ½_ÑŽÐ½ÐºÑƒÐ½_ÐºÄ•Ã§Ð½ÐµÑ€Ð½Ð¸ÐºÑƒÐ½_ÑÑ€Ð½ÐµÐºÑƒÐ½_ÑˆÄƒÐ¼Ð°Ñ‚ÐºÑƒÐ½".split("_"),
			day_names_short: "Ð²Ñ‹Ñ€_Ñ‚ÑƒÐ½_Ñ‹Ñ‚Ð»_ÑŽÐ½_ÐºÄ•Ã§_ÑÑ€Ð½_ÑˆÄƒÐ¼".split("_"),
			date_suffix: function (date) {
				return "-Ð¼Ä•Ñˆ";
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
			day_names: "sÃ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lÃ¸rdag".split("_"),
			day_names_short: "sÃ¸n_man_tir_ons_tor_fre_lÃ¸r".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"de": {
			month_names: "Januar_Februar_MÃ¤rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
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
			month_names: "Î™Î±Î½Î¿Ï…Î±ÏÎ¯Î¿Ï…_Î¦ÎµÎ²ÏÎ¿Ï…Î±ÏÎ¯Î¿Ï…_ÎœÎ±ÏÏ„Î¯Î¿Ï…_Î‘Ï€ÏÎ¹Î»Î¯Î¿Ï…_ÎœÎ±ÎÎ¿Ï…_Î™Î¿Ï…Î½Î¯Î¿Ï…_Î™Î¿Ï…Î»Î¯Î¿Ï…_Î‘Ï…Î³Î¿ÏÏƒÏ„Î¿Ï…_Î£ÎµÏ€Ï„ÎµÎ¼Î²ÏÎ¯Î¿Ï…_ÎŸÎºÏ„Ï‰Î²ÏÎ¯Î¿Ï…_ÎÎ¿ÎµÎ¼Î²ÏÎ¯Î¿Ï…_Î”ÎµÎºÎµÎ¼Î²ÏÎ¯Î¿Ï…".split("_"),
			month_names_short: "Î™Î±Î½_Î¦ÎµÎ²_ÎœÎ±Ï_Î‘Ï€Ï_ÎœÎ±ÏŠ_Î™Î¿Ï…Î½_Î™Î¿Ï…Î»_Î‘Ï…Î³_Î£ÎµÏ€_ÎŸÎºÏ„_ÎÎ¿Îµ_Î”ÎµÎº".split("_"),
			day_names: "ÎšÏ…ÏÎ¹Î±ÎºÎ®_Î”ÎµÏ…Ï„Î­ÏÎ±_Î¤ÏÎ¯Ï„Î·_Î¤ÎµÏ„Î¬ÏÏ„Î·_Î Î­Î¼Ï€Ï„Î·_Î Î±ÏÎ±ÏƒÎºÎµÏ…Î®_Î£Î¬Î²Î²Î±Ï„Î¿".split("_"),
			day_names_short: "ÎšÏ…Ï_Î”ÎµÏ…_Î¤ÏÎ¹_Î¤ÎµÏ„_Î ÎµÎ¼_Î Î±Ï_Î£Î±Î²".split("_"),
			date_suffix: function (date) {
				return "Î·";
			},
			meridiem: function (hour, minute, isLower) {
				if (hour > 11) {
					return isLower ? 'Î¼Î¼' : 'ÎœÎœ';
				} else {
					return isLower ? 'Ï€Î¼' : 'Î Îœ';
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
			month_names: "januaro_februaro_marto_aprilo_majo_junio_julio_aÅ­gusto_septembro_oktobro_novembro_decembro".split("_"),
			month_names_short: "jan_feb_mar_apr_maj_jun_jul_aÅ­g_sep_okt_nov_dec".split("_"),
			day_names: "DimanÄ‰o_Lundo_Mardo_Merkredo_Ä´aÅ­do_Vendredo_Sabato".split("_"),
			day_names_short: "Dim_Lun_Mard_Merk_Ä´aÅ­_Ven_Sab".split("_"),
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
			day_names: "domingo_lunes_martes_miÃ©rcoles_jueves_viernes_sÃ¡bado".split("_"),
			day_names_short: "dom._lun._mar._miÃ©._jue._vie._sÃ¡b.".split("_"),
			date_suffix: function (date) {
				return "Âº";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"et": {
			month_names: "jaanuar_veebruar_mÃ¤rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember".split("_"),
			month_names_short: "jaan_veebr_mÃ¤rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets".split("_"),
			day_names: "pÃ¼hapÃ¤ev_esmaspÃ¤ev_teisipÃ¤ev_kolmapÃ¤ev_neljapÃ¤ev_reede_laupÃ¤ev".split("_"),
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
			month_names: 'Ú˜Ø§Ù†ÙˆÛŒÙ‡_ÙÙˆØ±ÛŒÙ‡_Ù…Ø§Ø±Ø³_Ø¢ÙˆØ±ÛŒÙ„_Ù…Ù‡_Ú˜ÙˆØ¦Ù†_Ú˜ÙˆØ¦ÛŒÙ‡_Ø§ÙˆØª_Ø³Ù¾ØªØ§Ù…Ø¨Ø±_Ø§Ú©ØªØ¨Ø±_Ù†ÙˆØ§Ù…Ø¨Ø±_Ø¯Ø³Ø§Ù…Ø¨Ø±'.split('_'),
			month_names_short: 'Ú˜Ø§Ù†ÙˆÛŒÙ‡_ÙÙˆØ±ÛŒÙ‡_Ù…Ø§Ø±Ø³_Ø¢ÙˆØ±ÛŒÙ„_Ù…Ù‡_Ú˜ÙˆØ¦Ù†_Ú˜ÙˆØ¦ÛŒÙ‡_Ø§ÙˆØª_Ø³Ù¾ØªØ§Ù…Ø¨Ø±_Ø§Ú©ØªØ¨Ø±_Ù†ÙˆØ§Ù…Ø¨Ø±_Ø¯Ø³Ø§Ù…Ø¨Ø±'.split('_'),
			day_names: 'ÛŒÚ©\u200cØ´Ù†Ø¨Ù‡_Ø¯ÙˆØ´Ù†Ø¨Ù‡_Ø³Ù‡\u200cØ´Ù†Ø¨Ù‡_Ú†Ù‡Ø§Ø±Ø´Ù†Ø¨Ù‡_Ù¾Ù†Ø¬\u200cØ´Ù†Ø¨Ù‡_Ø¬Ù…Ø¹Ù‡_Ø´Ù†Ø¨Ù‡'.split('_'),
			day_names_short: 'ÛŒÚ©\u200cØ´Ù†Ø¨Ù‡_Ø¯ÙˆØ´Ù†Ø¨Ù‡_Ø³Ù‡\u200cØ´Ù†Ø¨Ù‡_Ú†Ù‡Ø§Ø±Ø´Ù†Ø¨Ù‡_Ù¾Ù†Ø¬\u200cØ´Ù†Ø¨Ù‡_Ø¬Ù…Ø¹Ù‡_Ø´Ù†Ø¨Ù‡'.split('_'),
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return "Ù‚Ø¨Ù„ Ø§Ø² Ø¸Ù‡Ø±";
				} else {
					return "Ø¨Ø¹Ø¯ Ø§Ø² Ø¸Ù‡Ø±";
				}
			},
			date_suffix: function (date) {
				return 'Ù…';
			}
		},
		"fi": {
			month_names: "tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesÃ¤kuu_heinÃ¤kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),
			month_names_short: "tammi_helmi_maalis_huhti_touko_kesÃ¤_heinÃ¤_elo_syys_loka_marras_joulu".split("_"),
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
			month_names: "januar_februar_mars_aprÃ­l_mai_juni_juli_august_september_oktober_november_desember".split("_"),
			month_names_short: "jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),
			day_names: "sunnudagur_mÃ¡nadagur_tÃ½sdagur_mikudagur_hÃ³sdagur_frÃ­ggjadagur_leygardagur".split("_"),
			day_names_short: "sun_mÃ¡n_tÃ½s_mik_hÃ³s_frÃ­_ley".split("_"),
			date_suffix: function () {
				return '.';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"fr-ca": {
			month_names: "janvier_fÃ©vrier_mars_avril_mai_juin_juillet_aoÃ»t_septembre_octobre_novembre_dÃ©cembre".split("_"),
			month_names_short: "janv._fÃ©vr._mars_avr._mai_juin_juil._aoÃ»t_sept._oct._nov._dÃ©c.".split("_"),
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
			month_names: "janvier_fÃ©vrier_mars_avril_mai_juin_juillet_aoÃ»t_septembre_octobre_novembre_dÃ©cembre".split("_"),
			month_names_short: "janv._fÃ©vr._mars_avr._mai_juin_juil._aoÃ»t_sept._oct._nov._dÃ©c.".split("_"),
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
			month_names: "Xaneiro_Febreiro_Marzo_Abril_Maio_XuÃ±o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro".split("_"),
			month_names_short: "Xan._Feb._Mar._Abr._Mai._XuÃ±._Xul._Ago._Set._Out._Nov._Dec.".split("_"),
			day_names: "Domingo_Luns_Martes_MÃ©rcores_Xoves_Venres_SÃ¡bado".split("_"),
			day_names_short: "Dom._Lun._Mar._MÃ©r._Xov._Ven._SÃ¡b.".split("_"),
			date_suffix: function (date) {
				return 'Âº';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"he": {
			month_names: "×™× ×•××¨_×¤×‘×¨×•××¨_×ž×¨×¥_××¤×¨×™×œ_×ž××™_×™×•× ×™_×™×•×œ×™_××•×’×•×¡×˜_×¡×¤×˜×ž×‘×¨_××•×§×˜×•×‘×¨_× ×•×‘×ž×‘×¨_×“×¦×ž×‘×¨".split("_"),
			month_names_short: "×™× ×•×³_×¤×‘×¨×³_×ž×¨×¥_××¤×¨×³_×ž××™_×™×•× ×™_×™×•×œ×™_××•×’×³_×¡×¤×˜×³_××•×§×³_× ×•×‘×³_×“×¦×ž×³".split("_"),
			day_names: "×¨××©×•×Ÿ_×©× ×™_×©×œ×™×©×™_×¨×‘×™×¢×™_×—×ž×™×©×™_×©×™×©×™_×©×‘×ª".split("_"),
			day_names_short: "××³_×‘×³_×’×³_×“×³_×”×³_×•×³_×©×³".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"hi": {
			month_names: 'à¤œà¤¨à¤µà¤°à¥€_à¤«à¤¼à¤°à¤µà¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¥ˆà¤²_à¤®à¤ˆ_à¤œà¥‚à¤¨_à¤œà¥à¤²à¤¾à¤ˆ_à¤…à¤—à¤¸à¥à¤¤_à¤¸à¤¿à¤¤à¤®à¥à¤¬à¤°_à¤…à¤•à¥à¤Ÿà¥‚à¤¬à¤°_à¤¨à¤µà¤®à¥à¤¬à¤°_à¤¦à¤¿à¤¸à¤®à¥à¤¬à¤°'.split("_"),
			month_names_short: 'à¤œà¤¨._à¤«à¤¼à¤°._à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¥ˆ._à¤®à¤ˆ_à¤œà¥‚à¤¨_à¤œà¥à¤²._à¤…à¤—._à¤¸à¤¿à¤¤._à¤…à¤•à¥à¤Ÿà¥‚._à¤¨à¤µ._à¤¦à¤¿à¤¸.'.split("_"),
			day_names: 'à¤°à¤µà¤¿à¤µà¤¾à¤°_à¤¸à¥‹à¤®à¤µà¤¾à¤°_à¤®à¤‚à¤—à¤²à¤µà¤¾à¤°_à¤¬à¥à¤§à¤µà¤¾à¤°_à¤—à¥à¤°à¥‚à¤µà¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°_à¤¶à¤¨à¤¿à¤µà¤¾à¤°'.split("_"),
			day_names_short: 'à¤°à¤µà¤¿_à¤¸à¥‹à¤®_à¤®à¤‚à¤—à¤²_à¤¬à¥à¤§_à¤—à¥à¤°à¥‚_à¤¶à¥à¤•à¥à¤°_à¤¶à¤¨à¤¿'.split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "à¤°à¤¾à¤¤";
				} else if (hour < 10) {
					return "à¤¸à¥à¤¬à¤¹";
				} else if (hour < 17) {
					return "à¤¦à¥‹à¤ªà¤¹à¤°";
				} else if (hour < 20) {
					return "à¤¶à¤¾à¤®";
				} else {
					return "à¤°à¤¾à¤¤";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"hr": {
			month_names: "sjeÄanj_veljaÄa_oÅ¾ujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac".split("_"),
			month_names_short: "sje._vel._oÅ¾u._tra._svi._lip._srp._kol._ruj._lis._stu._pro.".split("_"),
			day_names: "nedjelja_ponedjeljak_utorak_srijeda_Äetvrtak_petak_subota".split("_"),
			day_names_short: "ned._pon._uto._sri._Äet._pet._sub.".split("_"),
			date_suffix: function () {
				return '.';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"hu": {
			month_names: "januÃ¡r_februÃ¡r_mÃ¡rcius_Ã¡prilis_mÃ¡jus_jÃºnius_jÃºlius_augusztus_szeptember_oktÃ³ber_november_december".split("_"),
			month_names_short: "jan_feb_mÃ¡rc_Ã¡pr_mÃ¡j_jÃºn_jÃºl_aug_szept_okt_nov_dec".split("_"),
			day_names: "vasÃ¡rnap_hÃ©tfÅ‘_kedd_szerda_csÃ¼tÃ¶rtÃ¶k_pÃ©ntek_szombat".split("_"),
			day_names_short: "vas_hÃ©t_kedd_sze_csÃ¼t_pÃ©n_szo".split("_"),
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
			month_names: 'Õ°Õ¸Ö‚Õ¶Õ¾Õ¡Ö€_ÖƒÕ¥Õ¿Ö€Õ¾Õ¡Ö€_Õ´Õ¡Ö€Õ¿_Õ¡ÕºÖ€Õ«Õ¬_Õ´Õ¡ÕµÕ«Õ½_Õ°Õ¸Ö‚Õ¶Õ«Õ½_Õ°Õ¸Ö‚Õ¬Õ«Õ½_Ö…Õ£Õ¸Õ½Õ¿Õ¸Õ½_Õ½Õ¥ÕºÕ¿Õ¥Õ´Õ¢Õ¥Ö€_Õ°Õ¸Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€_Õ¶Õ¸ÕµÕ¥Õ´Õ¢Õ¥Ö€_Õ¤Õ¥Õ¯Õ¿Õ¥Õ´Õ¢Õ¥Ö€'.split('_'),
			month_names_short: 'Õ°Õ¶Õ¾_ÖƒÕ¿Ö€_Õ´Ö€Õ¿_Õ¡ÕºÖ€_Õ´ÕµÕ½_Õ°Õ¶Õ½_Õ°Õ¬Õ½_Ö…Õ£Õ½_Õ½ÕºÕ¿_Õ°Õ¯Õ¿_Õ¶Õ´Õ¢_Õ¤Õ¯Õ¿'.split('_'),
			day_names: 'Õ¯Õ«Ö€Õ¡Õ¯Õ«_Õ¥Ö€Õ¯Õ¸Ö‚Õ·Õ¡Õ¢Õ©Õ«_Õ¥Ö€Õ¥Ö„Õ·Õ¡Õ¢Õ©Õ«_Õ¹Õ¸Ö€Õ¥Ö„Õ·Õ¡Õ¢Õ©Õ«_Õ°Õ«Õ¶Õ£Õ·Õ¡Õ¢Õ©Õ«_Õ¸Ö‚Ö€Õ¢Õ¡Õ©_Õ·Õ¡Õ¢Õ¡Õ©'.split('_'),
			day_names_short: "Õ¯Ö€Õ¯_Õ¥Ö€Õ¯_Õ¥Ö€Ö„_Õ¹Ö€Ö„_Õ°Õ¶Õ£_Õ¸Ö‚Ö€Õ¢_Õ·Õ¢Õ©".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "Õ£Õ«Õ·Õ¥Ö€Õ¾Õ¡";
				} else if (hour < 12) {
					return "Õ¡Õ¼Õ¡Õ¾Õ¸Õ¿Õ¾Õ¡";
				} else if (hour < 17) {
					return "ÖÕ¥Ö€Õ¥Õ¯Õ¾Õ¡";
				} else {
					return "Õ¥Ö€Õ¥Õ¯Õ¸ÕµÕ¡Õ¶";
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
			month_names: "janÃºar_febrÃºar_mars_aprÃ­l_maÃ­_jÃºnÃ­_jÃºlÃ­_Ã¡gÃºst_september_oktÃ³ber_nÃ³vember_desember".split("_"),
			month_names_short: "jan_feb_mar_apr_maÃ­_jÃºn_jÃºl_Ã¡gÃº_sep_okt_nÃ³v_des".split("_"),
			day_names: "sunnudagur_mÃ¡nudagur_Ã¾riÃ°judagur_miÃ°vikudagur_fimmtudagur_fÃ¶studagur_laugardagur".split("_"),
			day_names_short: "sun_mÃ¡n_Ã¾ri_miÃ°_fim_fÃ¶s_lau".split("_"),
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
			day_names: "Domenica_LunedÃ¬_MartedÃ¬_MercoledÃ¬_GiovedÃ¬_VenerdÃ¬_Sabato".split("_"),
			day_names_short: "Dom_Lun_Mar_Mer_Gio_Ven_Sab".split("_"),
			date_suffix: function () {
				return 'Âº';
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ja": {
			month_names: "1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ".split("_"),
			month_names_short: "1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ".split("_"),
			day_names: "æ—¥æ›œæ—¥_æœˆæ›œæ—¥_ç«æ›œæ—¥_æ°´æ›œæ—¥_æœ¨æ›œæ—¥_é‡‘æ›œæ—¥_åœŸæ›œæ—¥".split("_"),
			day_names_short: "æ—¥_æœˆ_ç«_æ°´_æœ¨_é‡‘_åœŸ".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return "åˆå‰";
				} else {
					return "åˆå¾Œ";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"ka": {
			month_names: 'áƒ˜áƒáƒœáƒ•áƒáƒ áƒ˜_áƒ—áƒ”áƒ‘áƒ”áƒ áƒ•áƒáƒšáƒ˜_áƒ›áƒáƒ áƒ¢áƒ˜_áƒáƒžáƒ áƒ˜áƒšáƒ˜_áƒ›áƒáƒ˜áƒ¡áƒ˜_áƒ˜áƒ•áƒœáƒ˜áƒ¡áƒ˜_áƒ˜áƒ•áƒšáƒ˜áƒ¡áƒ˜_áƒáƒ’áƒ•áƒ˜áƒ¡áƒ¢áƒ_áƒ¡áƒ”áƒ¥áƒ¢áƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜_áƒáƒ¥áƒ¢áƒáƒ›áƒ‘áƒ”áƒ áƒ˜_áƒœáƒáƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜_áƒ“áƒ”áƒ™áƒ”áƒ›áƒ‘áƒ”áƒ áƒ˜'.split('_'),
			month_names_short: "áƒ˜áƒáƒœ_áƒ—áƒ”áƒ‘_áƒ›áƒáƒ _áƒáƒžáƒ _áƒ›áƒáƒ˜_áƒ˜áƒ•áƒœ_áƒ˜áƒ•áƒš_áƒáƒ’áƒ•_áƒ¡áƒ”áƒ¥_áƒáƒ¥áƒ¢_áƒœáƒáƒ”_áƒ“áƒ”áƒ™".split("_"),
			day_names: 'áƒ™áƒ•áƒ˜áƒ áƒ_áƒáƒ áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒ¡áƒáƒ›áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒáƒ—áƒ®áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒ®áƒ£áƒ—áƒ¨áƒáƒ‘áƒáƒ—áƒ˜_áƒžáƒáƒ áƒáƒ¡áƒ™áƒ”áƒ•áƒ˜_áƒ¨áƒáƒ‘áƒáƒ—áƒ˜'.split('_'),
			day_names_short: "áƒ™áƒ•áƒ˜_áƒáƒ áƒ¨_áƒ¡áƒáƒ›_áƒáƒ—áƒ®_áƒ®áƒ£áƒ—_áƒžáƒáƒ _áƒ¨áƒáƒ‘".split("_"),
			date_suffix: function (date) {
				if (date === 0) {
					return "";
				}

				if (date === 1) {
					return "-áƒšáƒ˜";
				}

				if ((date < 20) || (date <= 100 && (date % 20 === 0)) || (date % 100 === 0)) {
					return "áƒ›áƒ”-";
				}

				return "-áƒ”";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"km": {
			month_names: "áž˜áž€ážšáž¶_áž€áž»áž˜áŸ’áž—áŸˆ_áž˜áž·áž“áž¶_áž˜áŸážŸáž¶_áž§ážŸáž—áž¶_áž˜áž·ážáž»áž“áž¶_áž€áž€áŸ’áž€ážŠáž¶_ážŸáž¸áž áž¶_áž€áž‰áŸ’áž‰áž¶_ážáž»áž›áž¶_ážœáž·áž…áŸ’áž†áž·áž€áž¶_áž’áŸ’áž“áž¼".split("_"),
			month_names_short: "áž˜áž€ážšáž¶_áž€áž»áž˜áŸ’áž—áŸˆ_áž˜áž·áž“áž¶_áž˜áŸážŸáž¶_áž§ážŸáž—áž¶_áž˜áž·ážáž»áž“áž¶_áž€áž€áŸ’áž€ážŠáž¶_ážŸáž¸áž áž¶_áž€áž‰áŸ’áž‰áž¶_ážáž»áž›áž¶_ážœáž·áž…áŸ’áž†áž·áž€áž¶_áž’áŸ’áž“áž¼".split("_"),
			day_names: "áž¢áž¶áž‘áž·ážáŸ’áž™_áž…áŸáž“áŸ’áž‘_áž¢áž„áŸ’áž‚áž¶ážš_áž–áž»áž’_áž–áŸ’ážšáž ážŸáŸ’áž”ážáž·áŸ_ážŸáž»áž€áŸ’ážš_ážŸáŸ…ážšáŸ".split("_"),
			day_names_short: "áž¢áž¶áž‘áž·ážáŸ’áž™_áž…áŸáž“áŸ’áž‘_áž¢áž„áŸ’áž‚áž¶ážš_áž–áž»áž’_áž–áŸ’ážšáž ážŸáŸ’áž”ážáž·áŸ_ážŸáž»áž€áŸ’ážš_ážŸáŸ…ážšáŸ".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ko": {
			month_names: "1ì›”_2ì›”_3ì›”_4ì›”_5ì›”_6ì›”_7ì›”_8ì›”_9ì›”_10ì›”_11ì›”_12ì›”".split("_"),
			month_names_short: "1ì›”_2ì›”_3ì›”_4ì›”_5ì›”_6ì›”_7ì›”_8ì›”_9ì›”_10ì›”_11ì›”_12ì›”".split("_"),
			day_names: "ì¼ìš”ì¼_ì›”ìš”ì¼_í™”ìš”ì¼_ìˆ˜ìš”ì¼_ëª©ìš”ì¼_ê¸ˆìš”ì¼_í† ìš”ì¼".split("_"),
			day_names_short: "ì¼_ì›”_í™”_ìˆ˜_ëª©_ê¸ˆ_í† ".split("_"),
			date_suffix: function (date) {
				return "ì¼";
			},
			meridiem: function (hour, minute, isLower) {
				return hour < 12 ? 'ì˜¤ì „' : 'ì˜¤í›„';
			}
		},
		"lb": {
			month_names: "Januar_Februar_MÃ¤erz_AbrÃ«ll_Mee_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),
			month_names_short: "Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),
			day_names: "Sonndeg_MÃ©indeg_DÃ«nschdeg_MÃ«ttwoch_Donneschdeg_Freideg_Samschdeg".split("_"),
			day_names_short: "So._MÃ©._DÃ«._MÃ«._Do._Fr._Sa.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"lt": {
			month_names: "sausio_vasario_kovo_balandÅ¾io_geguÅ¾Ä—s_birÅ¾Ä—lio_liepos_rugpjÅ«Äio_rugsÄ—jo_spalio_lapkriÄio_gruodÅ¾io".split("_"),
			month_names_short: "sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd".split("_"),
			day_names: "pirmadienis_antradienis_treÄiadienis_ketvirtadienis_penktadienis_Å¡eÅ¡tadienis_sekmadienis".split("_"),
			day_names_short: "Sek_Pir_Ant_Tre_Ket_Pen_Å eÅ¡".split("_"),
			date_suffix: function (date) {
				return "-oji";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"lv": {
			month_names: "janvÄris_februÄris_marts_aprÄ«lis_maijs_jÅ«nijs_jÅ«lijs_augusts_septembris_oktobris_novembris_decembris".split("_"),
			month_names_short: "jan_feb_mar_apr_mai_jÅ«n_jÅ«l_aug_sep_okt_nov_dec".split("_"),
			day_names: "svÄ“tdiena_pirmdiena_otrdiena_treÅ¡diena_ceturtdiena_piektdiena_sestdiena".split("_"),
			day_names_short: "Sv_P_O_T_C_Pk_S".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"mk": {
			month_names: "Ñ˜Ð°Ð½ÑƒÐ°Ñ€Ð¸_Ñ„ÐµÐ²Ñ€ÑƒÐ°Ñ€Ð¸_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€Ð¸Ð»_Ð¼Ð°Ñ˜_Ñ˜ÑƒÐ½Ð¸_Ñ˜ÑƒÐ»Ð¸_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ¿Ñ‚ÐµÐ¼Ð²Ñ€Ð¸_Ð¾ÐºÑ‚Ð¾Ð¼Ð²Ñ€Ð¸_Ð½Ð¾ÐµÐ¼Ð²Ñ€Ð¸_Ð´ÐµÐºÐµÐ¼Ð²Ñ€Ð¸".split("_"),
			month_names_short: "Ñ˜Ð°Ð½_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ñ˜_Ñ˜ÑƒÐ½_Ñ˜ÑƒÐ»_Ð°Ð²Ð³_ÑÐµÐ¿_Ð¾ÐºÑ‚_Ð½Ð¾Ðµ_Ð´ÐµÐº".split("_"),
			day_names: "Ð½ÐµÐ´ÐµÐ»Ð°_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»Ð½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²Ñ€Ñ‚Ð¾Ðº_Ð¿ÐµÑ‚Ð¾Ðº_ÑÐ°Ð±Ð¾Ñ‚Ð°".split("_"),
			day_names_short: "Ð½ÐµÐ´_Ð¿Ð¾Ð½_Ð²Ñ‚Ð¾_ÑÑ€Ðµ_Ñ‡ÐµÑ‚_Ð¿ÐµÑ‚_ÑÐ°Ð±".split("_"),
			date_suffix: function (date) {
				var lastDigit = date % 10,
					last2Digits = date % 100;
				if (date === 0) {
					return '-ÐµÐ²';
				} else if (last2Digits === 0) {
					return '-ÐµÐ½';
				} else if (last2Digits > 10 && last2Digits < 20) {
					return '-Ñ‚Ð¸';
				} else if (lastDigit === 1) {
					return '-Ð²Ð¸';
				} else if (lastDigit === 2) {
					return '-Ñ€Ð¸';
				} else if (lastDigit === 7 || lastDigit === 8) {
					return '-Ð¼Ð¸';
				} else {
					return '-Ñ‚Ð¸';
				}
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ml": {
			month_names: 'à´œà´¨àµà´µà´°à´¿_à´«àµ†à´¬àµà´°àµà´µà´°à´¿_à´®à´¾àµ¼à´šàµà´šàµ_à´à´ªàµà´°à´¿àµ½_à´®àµ‡à´¯àµ_à´œàµ‚àµº_à´œàµ‚à´²àµˆ_à´“à´—à´¸àµà´±àµà´±àµ_à´¸àµ†à´ªàµà´±àµà´±à´‚à´¬àµ¼_à´’à´•àµà´Ÿàµ‹à´¬àµ¼_à´¨à´µà´‚à´¬àµ¼_à´¡à´¿à´¸à´‚à´¬àµ¼'.split("_"),
			month_names_short: 'à´œà´¨àµ._à´«àµ†à´¬àµà´°àµ._à´®à´¾àµ¼._à´à´ªàµà´°à´¿._à´®àµ‡à´¯àµ_à´œàµ‚àµº_à´œàµ‚à´²àµˆ._à´“à´—._à´¸àµ†à´ªàµà´±àµà´±._à´’à´•àµà´Ÿàµ‹._à´¨à´µà´‚._à´¡à´¿à´¸à´‚.'.split("_"),
			day_names: 'à´žà´¾à´¯à´±à´¾à´´àµà´š_à´¤à´¿à´™àµà´•à´³à´¾à´´àµà´š_à´šàµŠà´µàµà´µà´¾à´´àµà´š_à´¬àµà´§à´¨à´¾à´´àµà´š_à´µàµà´¯à´¾à´´à´¾à´´àµà´š_à´µàµ†à´³àµà´³à´¿à´¯à´¾à´´àµà´š_à´¶à´¨à´¿à´¯à´¾à´´àµà´š'.split("_"),
			day_names_short: 'à´žà´¾à´¯àµ¼_à´¤à´¿à´™àµà´•àµ¾_à´šàµŠà´µàµà´µ_à´¬àµà´§àµ»_à´µàµà´¯à´¾à´´à´‚_à´µàµ†à´³àµà´³à´¿_à´¶à´¨à´¿'.split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "à´°à´¾à´¤àµà´°à´¿";
				} else if (hour < 12) {
					return "à´°à´¾à´µà´¿à´²àµ†";
				} else if (hour < 17) {
					return "à´‰à´šàµà´š à´•à´´à´¿à´žàµà´žàµ";
				} else if (hour < 20) {
					return "à´µàµˆà´•àµà´¨àµà´¨àµ‡à´°à´‚";
				} else {
					return "à´°à´¾à´¤àµà´°à´¿";
				}
			},
			date_suffix: function (date) {
				return "";
			}
		},
		"mr": {
			month_names: 'à¤œà¤¾à¤¨à¥‡à¤µà¤¾à¤°à¥€_à¤«à¥‡à¤¬à¥à¤°à¥à¤µà¤¾à¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤à¤ªà¥à¤°à¤¿à¤²_à¤®à¥‡_à¤œà¥‚à¤¨_à¤œà¥à¤²à¥ˆ_à¤‘à¤—à¤¸à¥à¤Ÿ_à¤¸à¤ªà¥à¤Ÿà¥‡à¤‚à¤¬à¤°_à¤‘à¤•à¥à¤Ÿà¥‹à¤¬à¤°_à¤¨à¥‹à¤µà¥à¤¹à¥‡à¤‚à¤¬à¤°_à¤¡à¤¿à¤¸à¥‡à¤‚à¤¬à¤°'.split("_"),
			month_names_short: 'à¤œà¤¾à¤¨à¥‡._à¤«à¥‡à¤¬à¥à¤°à¥._à¤®à¤¾à¤°à¥à¤š._à¤à¤ªà¥à¤°à¤¿._à¤®à¥‡._à¤œà¥‚à¤¨._à¤œà¥à¤²à¥ˆ._à¤‘à¤—._à¤¸à¤ªà¥à¤Ÿà¥‡à¤‚._à¤‘à¤•à¥à¤Ÿà¥‹._à¤¨à¥‹à¤µà¥à¤¹à¥‡à¤‚._à¤¡à¤¿à¤¸à¥‡à¤‚.'.split("_"),
			day_names: 'à¤°à¤µà¤¿à¤µà¤¾à¤°_à¤¸à¥‹à¤®à¤µà¤¾à¤°_à¤®à¤‚à¤—à¤³à¤µà¤¾à¤°_à¤¬à¥à¤§à¤µà¤¾à¤°_à¤—à¥à¤°à¥‚à¤µà¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤µà¤¾à¤°_à¤¶à¤¨à¤¿à¤µà¤¾à¤°'.split("_"),
			day_names_short: 'à¤°à¤µà¤¿_à¤¸à¥‹à¤®_à¤®à¤‚à¤—à¤³_à¤¬à¥à¤§_à¤—à¥à¤°à¥‚_à¤¶à¥à¤•à¥à¤°_à¤¶à¤¨à¤¿'.split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "à¤°à¤¾à¤¤à¥à¤°à¥€";
				} else if (hour < 10) {
					return "à¤¸à¤•à¤¾à¤³à¥€";
				} else if (hour < 17) {
					return "à¤¦à¥à¤ªà¤¾à¤°à¥€";
				} else if (hour < 20) {
					return "à¤¸à¤¾à¤¯à¤‚à¤•à¤¾à¤³à¥€";
				} else {
					return "à¤°à¤¾à¤¤à¥à¤°à¥€";
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
			day_names: "sÃ¸ndag_mandag_tirsdag_onsdag_torsdag_fredag_lÃ¸rdag".split("_"),
			day_names_short: "sÃ¸._ma._ti._on._to._fr._lÃ¸.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ne": {
			month_names: 'à¤œà¤¨à¤µà¤°à¥€_à¤«à¥‡à¤¬à¥à¤°à¥à¤µà¤°à¥€_à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¤¿à¤²_à¤®à¤ˆ_à¤œà¥à¤¨_à¤œà¥à¤²à¤¾à¤ˆ_à¤…à¤—à¤·à¥à¤Ÿ_à¤¸à¥‡à¤ªà¥à¤Ÿà¥‡à¤®à¥à¤¬à¤°_à¤…à¤•à¥à¤Ÿà¥‹à¤¬à¤°_à¤¨à¥‹à¤­à¥‡à¤®à¥à¤¬à¤°_à¤¡à¤¿à¤¸à¥‡à¤®à¥à¤¬à¤°'.split("_"),
			month_names_short: 'à¤œà¤¨._à¤«à¥‡à¤¬à¥à¤°à¥._à¤®à¤¾à¤°à¥à¤š_à¤…à¤ªà¥à¤°à¤¿._à¤®à¤ˆ_à¤œà¥à¤¨_à¤œà¥à¤²à¤¾à¤ˆ._à¤…à¤—._à¤¸à¥‡à¤ªà¥à¤Ÿ._à¤…à¤•à¥à¤Ÿà¥‹._à¤¨à¥‹à¤­à¥‡._à¤¡à¤¿à¤¸à¥‡.'.split("_"),
			day_names: 'à¤†à¤‡à¤¤à¤¬à¤¾à¤°_à¤¸à¥‹à¤®à¤¬à¤¾à¤°_à¤®à¤™à¥à¤—à¤²à¤¬à¤¾à¤°_à¤¬à¥à¤§à¤¬à¤¾à¤°_à¤¬à¤¿à¤¹à¤¿à¤¬à¤¾à¤°_à¤¶à¥à¤•à¥à¤°à¤¬à¤¾à¤°_à¤¶à¤¨à¤¿à¤¬à¤¾à¤°'.split("_"),
			day_names_short: 'à¤†à¤‡à¤¤._à¤¸à¥‹à¤®._à¤®à¤™à¥à¤—à¤²._à¤¬à¥à¤§._à¤¬à¤¿à¤¹à¤¿._à¤¶à¥à¤•à¥à¤°._à¤¶à¤¨à¤¿.'.split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 3) {
					return "à¤°à¤¾à¤¤à¥€";
				} else if (hour < 10) {
					return "à¤¬à¤¿à¤¹à¤¾à¤¨";
				} else if (hour < 15) {
					return "à¤¦à¤¿à¤‰à¤à¤¸à¥‹";
				} else if (hour < 18) {
					return "à¤¬à¥‡à¤²à¥à¤•à¤¾";
				} else if (hour < 20) {
					return "à¤¸à¤¾à¤à¤";
				} else {
					return "à¤°à¤¾à¤¤à¥€";
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
			day_names: "sundag_mÃ¥ndag_tysdag_onsdag_torsdag_fredag_laurdag".split("_"),
			day_names_short: "sun_mÃ¥n_tys_ons_tor_fre_lau".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"pl": {
			month_names: "styczeÅ„_luty_marzec_kwiecieÅ„_maj_czerwiec_lipiec_sierpieÅ„_wrzesieÅ„_paÅºdziernik_listopad_grudzieÅ„".split("_"),
			month_names_short: "sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paÅº_lis_gru".split("_"),
			day_names: "niedziela_poniedziaÅ‚ek_wtorek_Å›roda_czwartek_piÄ…tek_sobota".split("_"),
			day_names_short: "nie_pon_wt_Å›r_czw_pt_sb".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"pt-br": {
			month_names: "janeiro_fevereiro_marÃ§o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),
			month_names_short: "jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),
			day_names: "domingo_segunda-feira_terÃ§a-feira_quarta-feira_quinta-feira_sexta-feira_sÃ¡bado".split("_"),
			day_names_short: "dom_seg_ter_qua_qui_sex_sÃ¡b".split("_"),
			date_suffix: function (date) {
				return "Âº";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"pt": {
			month_names: "janeiro_fevereiro_marÃ§o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),
			month_names_short: "jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),
			day_names: "domingo_segunda-feira_terÃ§a-feira_quarta-feira_quinta-feira_sexta-feira_sÃ¡bado".split("_"),
			day_names_short: "dom_seg_ter_qua_qui_sex_sÃ¡b".split("_"),
			date_suffix: function (date) {
				return "Âº";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ro": {
			month_names: "ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie".split("_"),
			month_names_short: "ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.".split("_"),
			day_names: "duminicÄƒ_luni_marÈ›i_miercuri_joi_vineri_sÃ¢mbÄƒtÄƒ".split("_"),
			day_names_short: "Dum_Lun_Mar_Mie_Joi_Vin_SÃ¢m".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"ru": {
			month_names: 'ÑÐ½Ð²Ð°Ñ€ÑŒ_Ñ„ÐµÐ²Ñ€Ð°Ð»ÑŒ_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€ÐµÐ»ÑŒ_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ½Ñ‚ÑÐ±Ñ€ÑŒ_Ð¾ÐºÑ‚ÑÐ±Ñ€ÑŒ_Ð½Ð¾ÑÐ±Ñ€ÑŒ_Ð´ÐµÐºÐ°Ð±Ñ€ÑŒ'.split('_'),
			month_names_short: 'ÑÐ½Ð²_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³_ÑÐµÐ½_Ð¾ÐºÑ‚_Ð½Ð¾Ñ_Ð´ÐµÐº'.split('_'),
			day_names: 'Ð²Ð¾ÑÐºÑ€ÐµÑÐµÐ½ÑŒÐµ_Ð¿Ð¾Ð½ÐµÐ´ÐµÐ»ÑŒÐ½Ð¸Ðº_Ð²Ñ‚Ð¾Ñ€Ð½Ð¸Ðº_ÑÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÐµÑ€Ð³_Ð¿ÑÑ‚Ð½Ð¸Ñ†Ð°_ÑÑƒÐ±Ð±Ð¾Ñ‚Ð°'.split('_'),
			day_names_short: "Ð²Ñ_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "Ð½Ð¾Ñ‡Ð¸";
				} else if (hour < 12) {
					return "ÑƒÑ‚Ñ€Ð°";
				} else if (hour < 17) {
					return "Ð´Ð½Ñ";
				} else {
					return "Ð²ÐµÑ‡ÐµÑ€Ð°";
				}
			},
			date_suffix: function (date) {
				return '-Ð³Ð¾';
			}
		},
		"sk": {
			month_names: "januÃ¡r_februÃ¡r_marec_aprÃ­l_mÃ¡j_jÃºn_jÃºl_august_september_oktÃ³ber_november_december".split("_"),
			month_names_short: "jan_feb_mar_apr_mÃ¡j_jÃºn_jÃºl_aug_sep_okt_nov_dec".split("_"),
			day_names: "nedeÄ¾a_pondelok_utorok_streda_Å¡tvrtok_piatok_sobota".split("_"),
			day_names_short: "ne_po_ut_st_Å¡t_pi_so".split("_"),
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
			day_names: "nedelja_ponedeljek_torek_sreda_Äetrtek_petek_sobota".split("_"),
			day_names_short: "ned._pon._tor._sre._Äet._pet._sob.".split("_"),
			date_suffix: function (date) {
				return ".";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"sq": {
			month_names: "Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_NÃ«ntor_Dhjetor".split("_"),
			month_names_short: "Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_NÃ«n_Dhj".split("_"),
			day_names: "E Diel_E HÃ«nÃ«_E MartÃ«_E MÃ«rkurÃ«_E Enjte_E Premte_E ShtunÃ«".split("_"),
			day_names_short: "Die_HÃ«n_Mar_MÃ«r_Enj_Pre_Sht".split("_"),
			meridiem: function (hour, minute, isLower) {
				return hour < 12 ? 'PD' : 'MD';
			},
			date_suffix: function (date) {
				return ".";
			}
		},
		"sr-cyr": {
			month_names: ['Ñ˜Ð°Ð½ÑƒÐ°Ñ€', 'Ñ„ÐµÐ±Ñ€ÑƒÐ°Ñ€', 'Ð¼Ð°Ñ€Ñ‚', 'Ð°Ð¿Ñ€Ð¸Ð»', 'Ð¼Ð°Ñ˜', 'Ñ˜ÑƒÐ½', 'Ñ˜ÑƒÐ»', 'Ð°Ð²Ð³ÑƒÑÑ‚', 'ÑÐµÐ¿Ñ‚ÐµÐ¼Ð±Ð°Ñ€', 'Ð¾ÐºÑ‚Ð¾Ð±Ð°Ñ€', 'Ð½Ð¾Ð²ÐµÐ¼Ð±Ð°Ñ€', 'Ð´ÐµÑ†ÐµÐ¼Ð±Ð°Ñ€'],
			month_names_short: ['Ñ˜Ð°Ð½.', 'Ñ„ÐµÐ±.', 'Ð¼Ð°Ñ€.', 'Ð°Ð¿Ñ€.', 'Ð¼Ð°Ñ˜', 'Ñ˜ÑƒÐ½', 'Ñ˜ÑƒÐ»', 'Ð°Ð²Ð³.', 'ÑÐµÐ¿.', 'Ð¾ÐºÑ‚.', 'Ð½Ð¾Ð².', 'Ð´ÐµÑ†.'],
			day_names: ['Ð½ÐµÐ´ÐµÑ™Ð°', 'Ð¿Ð¾Ð½ÐµÐ´ÐµÑ™Ð°Ðº', 'ÑƒÑ‚Ð¾Ñ€Ð°Ðº', 'ÑÑ€ÐµÐ´Ð°', 'Ñ‡ÐµÑ‚Ð²Ñ€Ñ‚Ð°Ðº', 'Ð¿ÐµÑ‚Ð°Ðº', 'ÑÑƒÐ±Ð¾Ñ‚Ð°'],
			day_names_short: ['Ð½ÐµÐ´.', 'Ð¿Ð¾Ð½.', 'ÑƒÑ‚Ð¾.', 'ÑÑ€Ðµ.', 'Ñ‡ÐµÑ‚.', 'Ð¿ÐµÑ‚.', 'ÑÑƒÐ±.'],
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
			day_names: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'Äetvrtak', 'petak', 'subota'],
			day_names_short: ['ned.', 'pon.', 'uto.', 'sre.', 'Äet.', 'pet.', 'sub.'],
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
			day_names: "sÃ¶ndag_mÃ¥ndag_tisdag_onsdag_torsdag_fredag_lÃ¶rdag".split("_"),
			day_names_short: "sÃ¶n_mÃ¥n_tis_ons_tor_fre_lÃ¶r".split("_"),
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
			month_names: 'à®œà®©à®µà®°à®¿_à®ªà®¿à®ªà¯à®°à®µà®°à®¿_à®®à®¾à®°à¯à®šà¯_à®à®ªà¯à®°à®²à¯_à®®à¯‡_à®œà¯‚à®©à¯_à®œà¯‚à®²à¯ˆ_à®†à®•à®¸à¯à®Ÿà¯_à®šà¯†à®ªà¯à®Ÿà¯†à®®à¯à®ªà®°à¯_à®…à®•à¯à®Ÿà¯‡à®¾à®ªà®°à¯_à®¨à®µà®®à¯à®ªà®°à¯_à®Ÿà®¿à®šà®®à¯à®ªà®°à¯'.split("_"),
			month_names_short: 'à®œà®©à®µà®°à®¿_à®ªà®¿à®ªà¯à®°à®µà®°à®¿_à®®à®¾à®°à¯à®šà¯_à®à®ªà¯à®°à®²à¯_à®®à¯‡_à®œà¯‚à®©à¯_à®œà¯‚à®²à¯ˆ_à®†à®•à®¸à¯à®Ÿà¯_à®šà¯†à®ªà¯à®Ÿà¯†à®®à¯à®ªà®°à¯_à®…à®•à¯à®Ÿà¯‡à®¾à®ªà®°à¯_à®¨à®µà®®à¯à®ªà®°à¯_à®Ÿà®¿à®šà®®à¯à®ªà®°à¯'.split("_"),
			day_names: 'à®žà®¾à®¯à®¿à®±à¯à®±à¯à®•à¯à®•à®¿à®´à®®à¯ˆ_à®¤à®¿à®™à¯à®•à®Ÿà¯à®•à®¿à®´à®®à¯ˆ_à®šà¯†à®µà¯à®µà®¾à®¯à¯à®•à®¿à®´à®®à¯ˆ_à®ªà¯à®¤à®©à¯à®•à®¿à®´à®®à¯ˆ_à®µà®¿à®¯à®¾à®´à®•à¯à®•à®¿à®´à®®à¯ˆ_à®µà¯†à®³à¯à®³à®¿à®•à¯à®•à®¿à®´à®®à¯ˆ_à®šà®©à®¿à®•à¯à®•à®¿à®´à®®à¯ˆ'.split("_"),
			day_names_short: 'à®žà®¾à®¯à®¿à®±à¯_à®¤à®¿à®™à¯à®•à®³à¯_à®šà¯†à®µà¯à®µà®¾à®¯à¯_à®ªà¯à®¤à®©à¯_à®µà®¿à®¯à®¾à®´à®©à¯_à®µà¯†à®³à¯à®³à®¿_à®šà®©à®¿'.split("_"),
			date_suffix: function (date) {
				return 'à®µà®¤à¯';
			},
			meridiem: function (hour, minute, isLower) {
				if (hour >= 6 && hour <= 10) {
					return " à®•à®¾à®²à¯ˆ";
				} else if (hour >= 10 && hour <= 14) {
					return " à®¨à®£à¯à®ªà®•à®²à¯";
				} else if (hour >= 14 && hour <= 18) {
					return " à®Žà®±à¯à®ªà®¾à®Ÿà¯";
				} else if (hour >= 18 && hour <= 20) {
					return " à®®à®¾à®²à¯ˆ";
				} else if (hour >= 20 && hour <= 24) {
					return " à®‡à®°à®µà¯";
				} else if (hour >= 0 && hour <= 6) {
					return " à®µà¯ˆà®•à®±à¯ˆ";
				}
			}
		},
		"th": {
			month_names: "à¸¡à¸à¸£à¸²à¸„à¸¡_à¸à¸¸à¸¡ï¿½ à¸²à¸žà¸±à¸™à¸˜à¹Œ_à¸¡à¸µà¸™à¸²à¸„à¸¡_à¹€à¸¡à¸©à¸²à¸¢à¸™_à¸žà¸¤à¸©ï¿½ à¸²à¸„à¸¡_à¸¡à¸´à¸–à¸¸à¸™à¸²à¸¢à¸™_à¸à¸£à¸à¸Žà¸²à¸„à¸¡_à¸ªà¸´à¸‡à¸«à¸²à¸„à¸¡_à¸à¸±à¸™à¸¢à¸²à¸¢à¸™_à¸•à¸¸à¸¥à¸²à¸„à¸¡_à¸žà¸¤à¸¨à¸ˆà¸´à¸à¸²à¸¢à¸™_à¸˜à¸±à¸™à¸§à¸²à¸„à¸¡".split("_"),
			month_names_short: "à¸¡à¸à¸£à¸²_à¸à¸¸à¸¡ï¿½ à¸²_à¸¡à¸µà¸™à¸²_à¹€à¸¡à¸©à¸²_à¸žà¸¤à¸©ï¿½ à¸²_à¸¡à¸´à¸–à¸¸à¸™à¸²_à¸à¸£à¸à¸Žà¸²_à¸ªà¸´à¸‡à¸«à¸²_à¸à¸±à¸™à¸¢à¸²_à¸•à¸¸à¸¥à¸²_à¸žà¸¤à¸¨à¸ˆà¸´à¸à¸²_à¸˜à¸±à¸™à¸§à¸²".split("_"),
			day_names: "à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ_à¸ˆà¸±à¸™à¸—à¸£à¹Œ_à¸­à¸±à¸‡à¸„à¸²à¸£_à¸žà¸¸à¸˜_à¸žà¸¤à¸«à¸±à¸ªà¸šà¸”à¸µ_à¸¨à¸¸à¸à¸£à¹Œ_à¹€à¸ªà¸²à¸£à¹Œ".split("_"),
			day_names_short: "à¸­à¸²à¸—à¸´à¸•à¸¢à¹Œ_à¸ˆà¸±à¸™à¸—à¸£à¹Œ_à¸­à¸±à¸‡à¸„à¸²à¸£_à¸žà¸¸à¸˜_à¸žà¸¤à¸«à¸±à¸ª_à¸¨à¸¸à¸à¸£à¹Œ_à¹€à¸ªà¸²à¸£à¹Œ".split("_"),
			meridiem: function (hour, minute, isLower) {
				if (hour < 12) {
					return "à¸à¹ˆà¸­à¸™à¹€à¸—à¸µà¹ˆà¸¢à¸‡";
				} else {
					return "à¸«à¸¥à¸±à¸‡à¹€à¸—à¸µà¹ˆà¸¢à¸‡";
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
			month_names: "Ocak_Åžubat_Mart_Nisan_MayÄ±s_Haziran_Temmuz_AÄŸustos_EylÃ¼l_Ekim_KasÄ±m_AralÄ±k".split("_"),
			month_names_short: "Oca_Åžub_Mar_Nis_May_Haz_Tem_AÄŸu_Eyl_Eki_Kas_Ara".split("_"),
			day_names: "Pazar_Pazartesi_SalÄ±_Ã‡arÅŸamba_PerÅŸembe_Cuma_Cumartesi".split("_"),
			day_names_short: "Paz_Pts_Sal_Ã‡ar_Per_Cum_Cts".split("_"),
			date_suffix: function (number) {
				if (number === 0) { // special case for zero
					return number + "'Ä±ncÄ±";
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
			month_names: "innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_É£wÅ¡t_Å¡wtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir".split("_"),
			month_names_short: "innayr_brË¤ayrË¤_marË¤sË¤_ibrir_mayyw_ywnyw_ywlywz_É£wÅ¡t_Å¡wtanbir_ktË¤wbrË¤_nwwanbir_dwjnbir".split("_"),
			day_names: "asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas".split("_"),
			day_names_short: "asamas_aynas_asinas_akras_akwas_asimwas_asiá¸yas".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"tzm": {
			month_names: "âµ‰âµâµâ´°âµ¢âµ”_â´±âµ•â´°âµ¢âµ•_âµŽâ´°âµ•âµš_âµ‰â´±âµ”âµ‰âµ”_âµŽâ´°âµ¢âµ¢âµ“_âµ¢âµ“âµâµ¢âµ“_âµ¢âµ“âµâµ¢âµ“âµ£_âµ–âµ“âµ›âµœ_âµ›âµ“âµœâ´°âµâ´±âµ‰âµ”_â´½âµŸâµ“â´±âµ•_âµâµ“âµ¡â´°âµâ´±âµ‰âµ”_â´·âµ“âµŠâµâ´±âµ‰âµ”".split("_"),
			month_names_short: "âµ‰âµâµâ´°âµ¢âµ”_â´±âµ•â´°âµ¢âµ•_âµŽâ´°âµ•âµš_âµ‰â´±âµ”âµ‰âµ”_âµŽâ´°âµ¢âµ¢âµ“_âµ¢âµ“âµâµ¢âµ“_âµ¢âµ“âµâµ¢âµ“âµ£_âµ–âµ“âµ›âµœ_âµ›âµ“âµœâ´°âµâ´±âµ‰âµ”_â´½âµŸâµ“â´±âµ•_âµâµ“âµ¡â´°âµâ´±âµ‰âµ”_â´·âµ“âµŠâµâ´±âµ‰âµ”".split("_"),
			day_names: "â´°âµ™â´°âµŽâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµŽâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™".split("_"),
			day_names_short: "â´°âµ™â´°âµŽâ´°âµ™_â´°âµ¢âµâ´°âµ™_â´°âµ™âµ‰âµâ´°âµ™_â´°â´½âµ”â´°âµ™_â´°â´½âµ¡â´°âµ™_â´°âµ™âµ‰âµŽâµ¡â´°âµ™_â´°âµ™âµ‰â´¹âµ¢â´°âµ™".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"uk": {
			month_names: 'ÑÑ–Ñ‡ÐµÐ½ÑŒ_Ð»ÑŽÑ‚Ð¸Ð¹_Ð±ÐµÑ€ÐµÐ·ÐµÐ½ÑŒ_ÐºÐ²Ñ–Ñ‚ÐµÐ½ÑŒ_Ñ‚Ñ€Ð°Ð²ÐµÐ½ÑŒ_Ñ‡ÐµÑ€Ð²ÐµÐ½ÑŒ_Ð»Ð¸Ð¿ÐµÐ½ÑŒ_ÑÐµÑ€Ð¿ÐµÐ½ÑŒ_Ð²ÐµÑ€ÐµÑÐµÐ½ÑŒ_Ð¶Ð¾Ð²Ñ‚ÐµÐ½ÑŒ_Ð»Ð¸ÑÑ‚Ð¾Ð¿Ð°Ð´_Ð³Ñ€ÑƒÐ´ÐµÐ½ÑŒ'.split('_'),
			month_names_short: "ÑÑ–Ñ‡_Ð»ÑŽÑ‚_Ð±ÐµÑ€_ÐºÐ²Ñ–Ñ‚_Ñ‚Ñ€Ð°Ð²_Ñ‡ÐµÑ€Ð²_Ð»Ð¸Ð¿_ÑÐµÑ€Ð¿_Ð²ÐµÑ€_Ð¶Ð¾Ð²Ñ‚_Ð»Ð¸ÑÑ‚_Ð³Ñ€ÑƒÐ´".split("_"),
			day_names: 'Ð½ÐµÐ´Ñ–Ð»Ñ_Ð¿Ð¾Ð½ÐµÐ´Ñ–Ð»Ð¾Ðº_Ð²Ñ–Ð²Ñ‚Ð¾Ñ€Ð¾Ðº_ÑÐµÑ€ÐµÐ´Ð°_Ñ‡ÐµÑ‚Ð²ÐµÑ€_Ð¿â€™ÑÑ‚Ð½Ð¸Ñ†Ñ_ÑÑƒÐ±Ð¾Ñ‚Ð°'.split('_'),
			day_names_short: "Ð½Ð´_Ð¿Ð½_Ð²Ñ‚_ÑÑ€_Ñ‡Ñ‚_Ð¿Ñ‚_ÑÐ±".split("_"),
			date_suffix: function (date) {
				return "-Ð³Ð¾";
			},
			meridiem: function (hour, minute, isLower) {
				if (hour < 4) {
					return "Ð½Ð¾Ñ‡Ñ–";
				} else if (hour < 12) {
					return "Ñ€Ð°Ð½ÐºÑƒ";
				} else if (hour < 17) {
					return "Ð´Ð½Ñ";
				} else {
					return "Ð²ÐµÑ‡Ð¾Ñ€Ð°";
				}
			}
		},
		"uz": {
			month_names: "ÑÐ½Ð²Ð°Ñ€ÑŒ_Ñ„ÐµÐ²Ñ€Ð°Ð»ÑŒ_Ð¼Ð°Ñ€Ñ‚_Ð°Ð¿Ñ€ÐµÐ»ÑŒ_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½ÑŒ_Ð¸ÑŽÐ»ÑŒ_Ð°Ð²Ð³ÑƒÑÑ‚_ÑÐµÐ½Ñ‚ÑÐ±Ñ€ÑŒ_Ð¾ÐºÑ‚ÑÐ±Ñ€ÑŒ_Ð½Ð¾ÑÐ±Ñ€ÑŒ_Ð´ÐµÐºÐ°Ð±Ñ€ÑŒ".split("_"),
			month_names_short: "ÑÐ½Ð²_Ñ„ÐµÐ²_Ð¼Ð°Ñ€_Ð°Ð¿Ñ€_Ð¼Ð°Ð¹_Ð¸ÑŽÐ½_Ð¸ÑŽÐ»_Ð°Ð²Ð³_ÑÐµÐ½_Ð¾ÐºÑ‚_Ð½Ð¾Ñ_Ð´ÐµÐº".split("_"),
			day_names: "Ð¯ÐºÑˆÐ°Ð½Ð±Ð°_Ð”ÑƒÑˆÐ°Ð½Ð±Ð°_Ð¡ÐµÑˆÐ°Ð½Ð±Ð°_Ð§Ð¾Ñ€ÑˆÐ°Ð½Ð±Ð°_ÐŸÐ°Ð¹ÑˆÐ°Ð½Ð±Ð°_Ð–ÑƒÐ¼Ð°_Ð¨Ð°Ð½Ð±Ð°".split("_"),
			day_names_short: "Ð¯ÐºÑˆ_Ð”ÑƒÑˆ_Ð¡ÐµÑˆ_Ð§Ð¾Ñ€_ÐŸÐ°Ð¹_Ð–ÑƒÐ¼_Ð¨Ð°Ð½".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"vi": {
			month_names: "thÃ¡ng 1_thÃ¡ng 2_thÃ¡ng 3_thÃ¡ng 4_thÃ¡ng 5_thÃ¡ng 6_thÃ¡ng 7_thÃ¡ng 8_thÃ¡ng 9_thÃ¡ng 10_thÃ¡ng 11_thÃ¡ng 12".split("_"),
			month_names_short: "Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),
			day_names: "chá»§ nháº­t_thá»© hai_thá»© ba_thá»© tÆ°_thá»© nÄƒm_thá»© sÃ¡u_thá»© báº£y".split("_"),
			day_names_short: "CN_T2_T3_T4_T5_T6_T7".split("_"),
			date_suffix: function (date) {
				return "";
			},
			meridiem: function (hour, minute, isLower) {
				return "";
			}
		},
		"zh-cn": {
			month_names: "ä¸€æœˆ_äºŒæœˆ_ä¸‰æœˆ_å››æœˆ_äº”æœˆ_å…­æœˆ_ä¸ƒæœˆ_å…«æœˆ_ä¹æœˆ_åæœˆ_åä¸€æœˆ_åäºŒæœˆ".split("_"),
			month_names_short: "1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ".split("_"),
			day_names: "æ˜ŸæœŸæ—¥_æ˜ŸæœŸä¸€_æ˜ŸæœŸäºŒ_æ˜ŸæœŸä¸‰_æ˜ŸæœŸå››_æ˜ŸæœŸäº”_æ˜ŸæœŸå…­".split("_"),
			day_names_short: "å‘¨æ—¥_å‘¨ä¸€_å‘¨äºŒ_å‘¨ä¸‰_å‘¨å››_å‘¨äº”_å‘¨å…­".split("_"),
			meridiem: function (hour, minute, isLower) {
				var hm = hour * 100 + minute;
				if (hm < 600) {
					return "å‡Œæ™¨";
				} else if (hm < 900) {
					return "æ—©ä¸Š";
				} else if (hm < 1130) {
					return "ä¸Šåˆ";
				} else if (hm < 1230) {
					return "ä¸­åˆ";
				} else if (hm < 1800) {
					return "ä¸‹åˆ";
				} else {
					return "æ™šä¸Š";
				}
			},
			date_suffix: function (number, period) {
				return number + "æ—¥";

			}
		},
		"zh-tw": {
			month_names: "ä¸€æœˆ_äºŒæœˆ_ä¸‰æœˆ_å››æœˆ_äº”æœˆ_å…­æœˆ_ä¸ƒæœˆ_å…«æœˆ_ä¹æœˆ_åæœˆ_åä¸€æœˆ_åäºŒæœˆ".split("_"),
			month_names_short: "1æœˆ_2æœˆ_3æœˆ_4æœˆ_5æœˆ_6æœˆ_7æœˆ_8æœˆ_9æœˆ_10æœˆ_11æœˆ_12æœˆ".split("_"),
			day_names: "æ˜ŸæœŸæ—¥_æ˜ŸæœŸä¸€_æ˜ŸæœŸäºŒ_æ˜ŸæœŸä¸‰_æ˜ŸæœŸå››_æ˜ŸæœŸäº”_æ˜ŸæœŸå…­".split("_"),
			day_names_short: "é€±æ—¥_é€±ä¸€_é€±äºŒ_é€±ä¸‰_é€±å››_é€±äº”_é€±å…­".split("_"),
			meridiem: function (hour, minute, isLower) {
				var hm = hour * 100 + minute;
				if (hm < 900) {
					return "æ—©ä¸Š";
				} else if (hm < 1130) {
					return "ä¸Šåˆ";
				} else if (hm < 1230) {
					return "ä¸­åˆ";
				} else if (hm < 1800) {
					return "ä¸‹åˆ";
				} else {
					return "æ™šä¸Š";
				}
			},
			date_suffix: function (number, period) {
				return number + "æ—¥";
			}

		}
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
						parsed.date = parseInt(value.substring(0, 2));
						value = value.substring(2);
		                break;
		            case 'j':
						var next = parseInt(value.charAt(1));
						var len = (next >= 0 && next <= 9 ) ? 2 : 1;
						parsed.date = parseInt(value.substring(0, len));
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
						parsed.month = parseInt(value.substring(0, 2)) - 1;
						value = value.substring(2);
		                break;
		            case 'n':
						var next = parseInt(value.charAt(1));
						var len = (next >= 0 && next <= 9 ) ? 2 : 1;
						parsed.month = parseInt(value.substring(0, len)) - 1;
						value = value.substring(len);
		                break;
		            case 'o':
		            case 'Y':
						parsed.year = parseInt(value.substring(0, 4));
						value = value.substring(4);
		                break;
		            case 'y':
						var year = parseInt(value.substring(0, 2));
						parsed.year = (year > 50 ) ? year + 1900 : year + 2000;
						value = value.substring(2);
		                break;
		            case 'H':
						parsed.hours = parseInt(value.substring(0, 2));
						value = value.substring(2);
		                break;
		            case 'G':
						var next = parseInt(value.charAt(1));
						var len = (next >= 0 && next <= 9 ) ? 2 : 1;
						parsed.hours = parseInt(value.substring(0, len));
						value = value.substring(len);
		                break;
		            case 'i':
						parsed.minutes = parseInt(value.substring(0, 2));
						value = value.substring(2);
		                break;
		            case 's':
						parsed.seconds = parseInt(value.substring(0, 2));
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
						parsed.milliseconds = parseInt(value.substring(0, len)) / 1000;
						value = value.substring(len);
		               break;
					default:
						value = value.substring(1);
				}
			}
			return new Date(parsed.year, parsed.month, parsed.date, parsed.hours, parsed.minutes, parsed.seconds, parsed.milliseconds);
		} catch(err) {
			throw "Date parsing error : " + err;
		}
	};	
	
})();

(function (global) {
	'use strict';
	
	function Token(type, value) {
	    this.type  = type;
	    this.value = value;
	};
	
	Token.TYPE = {
		T_UNDEFINED    		: 0,
		T_NUMBER      		: 1,  
		T_DATE        		: 2, 
		T_BOOLEAN        	: 3, 
		T_TEXT		       	: 4, 
		T_IDENT       		: 5,  
		T_FUNCTION    		: 6,  
		T_POPEN       		: 7,  
		T_PCLOSE      		: 8, 
		T_COMMA       		: 9, 
		T_NOOP	    		: 10, 
		T_PLUS        		: 11, 
		T_MINUS       		: 12, 
		T_TIMES      	 	: 13, 
		T_DIV         		: 14, 
		T_MOD         		: 15, 
		T_POW         		: 16, 
		T_UNARY_PLUS  		: 17, 
		T_UNARY_MINUS 		: 18, 
		T_NOT         		: 19, 
		T_FIELD       		: 20, 
		T_EQUAL				: 21,
		T_NOT_EQUAL			: 22,
		T_LESS_THAN			: 23,
		T_LESS_OR_EQUAL		: 24,
		T_GREATER_THAN		: 25,
		T_GREATER_OR_EQUAL	: 26,
		T_BITWISE_AND		: 27,
		T_BITWISE_OR		: 28,
		T_BITWISE_XOR		: 29,
		T_LOGICAL_AND		: 30,
		T_LOGICAL_OR		: 31,
		T_TERNARY			: 32,
		T_TERNARY_ELSE		: 33,
		T_DEGRE				: 34,
		
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
					return this.value.format("d/m/Y");
					break;
				case Token.TYPE.T_BOOLEAN:
					return this.value ? 'true' : 'false';
					break;
				case Token.TYPE.T_FUNCTION:
					return this.value;
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
	
	function Expression() {
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
			
			for (var t in this.tokens) {
				var token = this.tokens[t];
				switch (token.type) {
					case Token.TYPE.T_COMMA:
						while (stack.length != 0 && stack[stack.length-1].type != Token.TYPE.T_POPEN) {
							rpn.push(stack.pop());
						}
						break;
					case Token.TYPE.T_NUMBER:
					case Token.TYPE.T_DATE:
					case Token.TYPE.T_BOOLEAN:
					case Token.TYPE.T_TEXT:
					case Token.TYPE.T_IDENT:
					case Token.TYPE.T_FIELD:
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
			}
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
			for (var t in this.tokens) {
				var token = this.tokens[t];
				if (token.type == Token.TYPE.T_FIELD && fields.length >= token.value) {
					var value = fields[token.value - 1];
					if ($.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = value;
					} else if (value.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
	                	token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat("d/m/Y", value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			}
		},
		
		setNamedFields: function (fields) {
			for (var t in this.tokens) {
				var token = this.tokens[t];
				if (token.type == Token.TYPE.T_IDENT && typeof fields[token.value] !== 'undefined' && fields[token.value] !== null) {
					var value = fields[token.value];
					if ($.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = value;
					} else if (value.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
	                	token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat("d/m/Y", value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			}
		},
		
		setVariables: function (variables) {
			var completed = true;
			for (var t in this.tokens) {
				var token = this.tokens[t];
				if (token.type == Token.TYPE.T_FIELD) {					
					var value = variables['' + token.value];
					if (typeof value === 'undefined' || value === null || value === '') {
						completed = false;
					} else if ($.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = value;
					} else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
	                	token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat("d/m/Y", value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				} else if (token.type == Token.TYPE.T_IDENT) {
					var value = variables[token.value];
					if (typeof value === 'undefined' || value === null || value === '') {
						completed = false;
					} else if ($.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = value;
					} else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
	                	token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat("d/m/Y", value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			}
			return completed;
		},
		
		evaluate: function () {
			try {
				var ops = [];
				for (var t in this.tokens) {
					var token = this.tokens[t];
					if (token.isOperator()) {
						ops.push(this.operation(token, ops));
					} else if (token.isComparator()) {
						ops.push(this.comparison(token, ops));
					} else {
						switch (token.type) {
							case Token.TYPE.T_NUMBER:
							case Token.TYPE.T_DATE:
							case Token.TYPE.T_BOOLEAN:
							case Token.TYPE.T_TEXT:
							case Token.TYPE.T_IDENT:
							case Token.TYPE.T_FIELD:
							case Token.TYPE.T_UNDEFINED:
								ops.push(token);
								break;
							case Token.TYPE.T_FUNCTION:
								ops.push(this.func(token, ops));
								break;
							default:
								throw new Error("Unrecognized token " + token.value);
						}
					}
				}
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
							result.value = arg1.value.format("d/m/Y") + arg2.value;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else if (arg1.type == Token.TYPE.T_TEXT) {
						result.type = Token.TYPE.T_TEXT;
						if (arg2.type == Token.TYPE.T_NUMBER) {
							result.value = arg1.value + arg2.value.toString();
						} else if (arg2.type == Token.TYPE.T_DATE) {
							result.value = arg1.value + arg2.value.format("d/m/Y");
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
			} else if (arg1.type != arg2.type) { 
				throw new Error("operand types for '" + op + "' are not identical");
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
				}
			}
			return result;
		},
		
		func: function (func, args) {
			var functions = {
				"abs": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.abs(a); }],
				"acos": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.acos(a); }],
				"acosh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.acosh(a); }],
				"asin": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.asin(a); }],
				"asinh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.asinh(a); }],
				"atan": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.atan(a); }],
				"atan2": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { return Math.atan2(a, b); }],
				"atanh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.atanh(a); }],
				"ceil": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.ceil(a); }],
				"cos": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.cos(a); }],
				"cosh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.cosh(a); }],
				"day": [1, [Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a) { return a.getDate(); }],
				"exp": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.exp(a); }],
				"floor": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.floor(a); }],
				"fullmonth": [1, [Token.TYPE.T_DATE], Token.TYPE.T_TEXT, function(a) { return a.getMonthName('fr') + ' ' + a.format('Y'); }],
				"log": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.log(a); }],
				"log10": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.log10(a); }],
				"max": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { return Math.max(a, b); }],
				"min": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { return Math.min(a, b); }],
				"month": [1, [Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a) { return a.getMonth() + 1; }],
				"pow": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { return Math.pow(a, b); }],
				"rand": [0, [], Token.TYPE.T_NUMBER, function() { return Math.random(); }],
				"round": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.round(a); }],
				"sin": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sin(a); }],
				"sinh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sinh(a); }],
				"sqrt": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sqrt(a); }],
				"tan": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.tan(a); }],
				"tanh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.tanh(a); }],
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
			if (args.length < argc) {
				throw new Error("Illegal number (" + args.length + ") of operands for function" + func);
			}
			var argv = [];
			for (; argc > 0; --argc) {
				var arg = args.pop();
				if (arg.isVariable()) {
					return new Token(Token.TYPE.T_UNDEFINED, [arg]);
				}
				var type = functions[func.value][1][argc - 1];
				if (arg.type != type) { 
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
					}
					throw new Error("Illegal type for argument '" + arg + "' : operand must be a " + expected + " for " + func);
				}
				argv.unshift(arg.value); 
			}
			return new Token(functions[func.value][2], functions[func.value][3].apply(this, argv));
		}
	};
	
	global.Expression = Expression;

}(this));

(function (global) {
	'use strict';
	
	var PATTERN = /([\s!,\+\-\*\/\^%\(\)=<\>\&\^\|\?\:°])/g;

    var lookup = {
        '+': Token.TYPE.T_PLUS,
        '-': Token.TYPE.T_MINUS,
        '/': Token.TYPE.T_DIV,
        '%': Token.TYPE.T_MOD,
        '(': Token.TYPE.T_POPEN,
        ')': Token.TYPE.T_PCLOSE,
        '*': Token.TYPE.T_TIMES,
        '!': Token.TYPE.T_NOT,
        ',': Token.TYPE.T_COMMA,
        '=': Token.TYPE.T_EQUAL,
        '<': Token.TYPE.T_LESS_THAN,
        '>': Token.TYPE.T_GREATER_THAN,
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
			if(typeof String.prototype.trim !== 'function') {
				String.prototype.trim = function() {
					return this.replace(/^\s+|\s+$/g, ''); 
				}
			};
			var expr = new Expression();
			var self = this;
			infix = infix.replace(/('[^']*')/g, function (match, m1, str) {
				self.text.push(m1.substr(1, m1.length - 2));
				return "¤" + self.text.length;
			});
			infix = infix.replace(/("[^"]*")/g, function (match, m1, str) {
				self.text.push(m1.substr(1, m1.length - 2));
				return "¤" + self.text.length;
			});
			infix = infix.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, "D$1.$2.$3");
			var toks = infix.split(PATTERN);
			var prev = new Token(Token.TYPE.T_NOOP, 'noop');
			for (var t in toks) {
				var value = toks[t].trim();
				var matches;
				if ($.isNumeric(value)) {
	                if (prev.type == Token.TYPE.T_PCLOSE)
	                    expr.push(new Token(Token.TYPE.T_TIMES, '*'));
	                expr.push(prev = new Token(Token.TYPE.T_NUMBER, parseFloat(value)));
	            } else if (value.match(/^#\d+/)) {
	                if (prev.type == Token.TYPE.T_PCLOSE)
	                    expr.push(new Token(Token.TYPE.T_TIMES, '*'));
	                expr.push(prev = new Token(Token.TYPE.T_FIELD, parseInt(value.substr(1))));
	            } else if (matches = value.match(/^¤(\d+)/)) {
	                if (prev.type == Token.TYPE.T_PCLOSE)
	                    expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					var i = parseInt(matches[1]);
	                expr.push(prev = new Token(Token.TYPE.T_TEXT, this.text[i - 1]));
	            } else if (matches = value.match(/^D(\d{1,2})\.(\d{1,2})\.(\d{4})/)) {
	                if (prev.type == Token.TYPE.T_PCLOSE)
	                    expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					var date = Date.createFromFormat("d/m/Y", matches[1] + "/" + matches[2] + "/" + matches[3]);
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
								case Token.TYPE.T_PCLOSE:
									expr.push(new Token(Token.TYPE.T_TIMES, '*'));
									break;
							}
	
							break;
					}
					expr.push(prev = new Token(type, value));
				}
			}
			return expr;	
		}
	};
	
	global.ExpressionParser = ExpressionParser;
}(this));

(function (global) {
	'use strict';
	
	function G6k(isDynamic, isMobile) {
		this.isDynamic = isDynamic;
		this.isMobile = isMobile;
		this.parser = new ExpressionParser();
		this.simu = null;
		this.variables = {};
		this.lastUserInputName = "";
	};
	
	G6k.prototype = {	
		run: function () {
			var self = this;
			this.variables['script'] = 1;
			if (this.isMobile) {
				if (Modernizr.inputtypes.date) {
					if ($("input[type='date']").eq(0).val().match(/^\d\d\//)) {
						$( "input[type='date']" ).each(function() {
							var date =  $( this ).val().split("/").reverse().join("-");
							$( this ).val(date);
						});
					}
					var width = $("input[type='date']").eq(0).width() + 60;
					$("input[type='date']").css('max-width', width);
					$("input[type='date']").width(width);
					
				} else {
					var opts1 = '{"formElements":{ ';
					var opts2 = ' }, "noFadeEffect": true }';
					$( "input[type='date']").each(function( index ) {
						var id = $( this ).attr('id');
						$( this ).attr('type', 'text');
						var opt = {
							formElements:{
							}, 
							noFadeEffect: true     
						};
						opt.formElements[id] = "%d/%m/%Y";
						datePickerController.createDatePicker(opt);
					});
				}
				$( "#g6k_form" ).submit(function( event ) {
					var form = this;
					event.preventDefault();
					if (Modernizr.inputtypes.date) {
						if ($("input[class='date']").eq(0).val().match(/^\d\d\d\d-/)) {
							$( "input[class='date']" ).each(function() {
								$(this).rules("remove");
								$(this).attr('type', 'text');
								var date =  $( this ).val().split("-").reverse().join("/");
								$( this ).val(date);
							});
						}
					}
					form.submit();
				});				
			}
			$("input[type='reset']").click(function() {
				$('#g6k_form').clearForm();
				$("input[class='resettable']").val("");
				if (self.isDynamic) {
					self.variables = {};
					for (var name in self.simu.datas ) {
						self.removeError(name);
						self.evaluateFieldConditions(name);
					}
				}
			});	
			$( "select").each(function( index ) {
				$(this).select2({
					width: $(this).css("width"),
					minimumResultsForSearch:15
				});
			});	
			// $('[placeholder]').focus(function() {
				// var input = $(this);
				// if (input.val() == input.attr('placeholder')) {
					// input.val('');
					// input.removeClass('placeholder');
				// }
			// }).blur(function() {
				// var input = $(this);
				// if (input.val() == '' || input.val() == input.attr('placeholder')) {
					// input.addClass('placeholder');
					// input.val(input.attr('placeholder'));
				// }
			// }).blur().parents('form').submit(function() {
				// $(this).find('[placeholder]').each(function() {
					// var input = $(this);
					// if (input.val() == input.attr('placeholder')) {
						// input.val('');
					// }
				// })
			// });
			// $('input, textarea').placeholder();
			if (this.isDynamic) {
				var view = $('input[name=view]').eq(0).val();
				var step = $('input[name=step]').eq(0).val();
				var token = $('input[name=_csrf_token]').eq(0).val();
				var path = $(location).attr('pathname').replace("/"+view, "").replace(/\/+$/, "") + "/Default/fields";
				var self = this;
				$.post(path,
					{stepId: step, _csrf_token: token },
					function(simu){	
						self.simu = simu;
						self.processFields();
					},
					"json"
				);
			}
		},
		
		check: function(data) {
			if (!data || data.value === "") {
				return true;
			}
			switch (data.type) {
				case 'date':
					if (! /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(data.value)) {
						return false;
					}
					break;
				case 'money':
					if (! /^\d+(\.\d{1,2})?$/.test(data.value)) {
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
			}
			return true;
		},
		
		validate: function(name) {
			var ok = true;
			var data = this.simu.datas[name];
			if (data.inputField) {
				var field = this.simu.step.fieldsets[data.inputField[0]].fields[data.inputField[1]];
				if (field.usage === 'input') {
					this.removeError(name);
					if (!this.check(data)) {
						ok = false;
						switch (data.type) {
							case 'date':
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": "jj/mm/aaaa" }, 'messages'));
								break;
							case 'number': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": "chiffres seulement" }, 'messages'));
								break;
							case 'integer': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": "chiffres seulement" }, 'messages'));
								break;
							case 'money': 
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": "montant" }, 'messages'));
								break;
							case 'percent':
								this.setError(name, Translator.trans("This value is not in the expected format (%format%)",  { "format": "pourcentage" }, 'messages'));
								break;
							default:
								this.setError(name, Translator.trans("This value is not in the expected format"));
						}
					} else if (field.required && data.value === "") {
						if (typeof field.unparsedCondition !== "undefined" && field.unparsedCondition !== "") {
							var condition = this.evaluate(field.unparsedCondition);
							var id = "#" + dependency + "-container";
							if (condition === 'true') {
								ok = false;
							}
						} else {
							ok = false;
						}
						if (! ok) {
							this.setError(name, Translator.trans("The '%field%' field is required",  { "field": field.label }, 'messages'));
						}
					}
					if (ok) {
						if (typeof data.unparsedConstraint !== "undefined" && data.unparsedConstraint !== "") {
							var constraint = this.evaluate(data.unparsedConstraint);
							if (constraint === "false") {
								ok = false;
								this.setError(name, data.constraintMessage);
							}
						}
					}
				}
			}
			return ok;
		},
		
		setError: function(name, error) {
			var fieldContainer = $("#"+name+"-container");
			fieldContainer.find("div.error").last().text(error);
			$("input[name=" + name + "], select[name=" + name + "]").each(function (index) {
				$(this).addClass('error');
			});
			fieldContainer.show();
			fieldContainer.parent().show();
		},
		
		removeError: function(name) {
			var fieldContainer = $("#"+name+"-container");
			fieldContainer.find("div.error").last().text("");
			$("input[name=" + name + "], select[name=" + name + "]").each(function (index) {
				$(this).removeClass('error');
			});
		},
		
		setFormValue: function(name, value) {
			var data = this.simu.datas[name];
			if (value && (data.type === "money" || data.type === "percent")) {
				value = value.toFixed(2).replace(/\./g, ',');
			}
			$("input[name=" + name + "], select[name=" + name + "], span[id=" + name + "]").each(function (index) {
				if ($(this).is('span')) {
					$(this).text(value);
				} else if ($(this).is('select')) {
					if ($(this).select2('val') != value) $(this).select2('val', value);
				} else if ($(this).is(':radio')) {
					$(this).val([value]);
				} else if ($(this).is(':checkbox')) {
					if ($(this).val() != value) $(this).val(value);
				} else {
					if ($(this).val() != value) $(this).val(value);
				}
			});
		},
		
		setValue: function(name, value) {
			var data = this.simu.datas[name];
			if (value && (data.type === "money" || data.type === "percent")) {
				value = value.toString().replace(/,/g, '.');
				value = Math.round(parseFloat(value) * 100)/100;
			}
			// console && console.log("setValue : " + name + " => " + value);
			this.variables[name] = data.value = value;
			this.validate(name);
			if (name !== this.lastUserInputName || data.type === "integer" || data.type === "number" || data.type === "date") {
				this.setFormValue(name, value);
			}
			this.lastUserInputName = "";
			this.reevaluateFields(name);
		},
		
		evaluate: function (expression) {
			var expr = this.parser.parse(expression);
			expr.postfix();
			expr.setVariables(this.variables);
			return expr.evaluate();
		},
	
		evaluateDefaults: function() {
			for (var name in this.simu.datas ) {
				var data = this.simu.datas[name];
				if (typeof data.unparsedDefault !== "undefined" && data.unparsedDefault !== "") {
					var value = this.evaluate(data.unparsedDefault);
					if (value !== false) {
						data.deflt = value;
					}
				}
			}
		},
		
		evaluateFieldConditions: function (name) {
			var data = this.simu.datas[name];
			
			if (data.fieldDependencies) {
				for (var d in data.fieldDependencies) {
					var dependency = data.fieldDependencies[d];
					var field = this.simu.datas[dependency];
					if (typeof field.unparsedCondition !== "undefined" && field.unparsedCondition !== "") {
						var condition = this.evaluate(field.unparsedCondition);
						var id = "#" + dependency + "-container";
						if (condition === 'true') {
							$(id).show();
						} else {
							$(id).hide();
						}
					}
				}
			}
			if (data.fieldsetDependencies) {
				for (var d in data.fieldsetDependencies) {
					var dependency = data.fieldsetDependencies[d];
					var fieldset = this.simu.step.fieldsets[dependency];
					if (typeof fieldset.unparsedCondition !== "undefined" && fieldset.unparsedCondition !== "") {
						var id = "#" + dependency;
						var condition = this.evaluate(fieldset.unparsedCondition);
						if (condition === 'true') {
							$(id).show();
						} else {
							$(id).hide();
						}
					}
				}
			}
			if (data.footNoteDependencies) {
				for (var d in data.footNoteDependencies) {
					var dependency = data.footNoteDependencies[d];
					var footnote = this.simu.step.footnotes[dependency];
					var id = "#foot-note-" + dependency;
					var footnotetext = this.replaceVariables(footnote.text);
					if (footnotetext !== false) {
						$(id).text(footnotetext);
					}
					if (typeof footnote.unparsedCondition !== "undefined" && footnote.unparsedCondition !== "") {
						var condition = this.evaluate(footnote.unparsedCondition);
						if (condition === 'true') {
							$(id).show();
						} else {
							$(id).hide();
						}
					}
				}
			}
			if (data.actionDependencies) {
				for (var a in data.actionDependencies) {
					var dependency = data.actionDependencies[a];
					var action = this.simu.step.actions[dependency];
					if (typeof action.unparsedCondition !== "undefined" && action.unparsedCondition !== "") {
						var selector = "#g6k_form input[name=" + dependency + "]";
						var condition = this.evaluate(action.unparsedCondition);
						if (condition === 'true') {
							$(selector).show();
						} else {
							$(selector).hide();
						}
					}
				}
			}
		},
		
		reevaluateFields: function (name) {
			var data = this.simu.datas[name];
			if (typeof data.unparsedConstraint !== "undefined" && data.unparsedConstraint !== "") {
				var constraint = this.evaluate(data.unparsedConstraint);
				if (constraint === "false") {
					this.setError(name, data.constraintMessage);
				} else {
					this.removeError(name);
				}
			}
			if (typeof data.unparsedExplanation !== "undefined" && data.unparsedExplanation !== "") {
				var explanation = this.evaluate(data.unparsedExplanation);
				if (explanation === false) {
					$("#" + name + "-explanation").text("");
				} else {
					$("#" + name + "-explanation").text(explanation);
				}
			}
			if (data.dataDependencies) {
				for (var d in data.dataDependencies) {
					var dependency = data.dataDependencies[d];
					var field = this.simu.datas[dependency];
					if (typeof field.unparsedContent !== "undefined" && field.unparsedContent !== "") {
						var content = this.evaluate(field.unparsedContent);
						if (content !== false && field.value !== content) {
							this.setValue(dependency, content);
						}
					}
				}
			}
			if (data.noteDependencies) {
				for (var d in data.noteDependencies) {
					var dependency = data.noteDependencies[d];
					var datad = this.simu.datas[dependency];
					if (datad.inputField) {
						var field = this.simu.step.fieldsets[datad.inputField[0]].fields[datad.inputField[1]];
						if (field.prenote) {
							var prenote = this.replaceVariables(field.prenote);
							if (prenote !== false) {
								$('#' + dependency + '-container .pre-note').text(prenote);
							}
						}
						if (field.postnote) {
							var postnote = this.replaceVariables(field.postnote);
							if (postnote !== false) {
								$('#' + dependency + '-container .post-note').text(postnote);
							}
						}
					}
				}
			}
			this.evaluateFieldConditions(name);
			if (data.sourceDependencies) {
				for (var d in data.sourceDependencies) {
					var completed = true;
					var dependency = data.sourceDependencies[d];
					var params = this.simu.sources[dependency]['parameters'];
					var post = {};
					post['source'] = dependency;
					for (var param in params) {
						var n = params[param];
						var d = this.simu.datas[n];
						if (typeof d.value === "undefined" || d.value === "") {
							completed = false;
							break;
						}
						post[param] = d.value;
					}
					if (completed) {
						var view = $('input[name=view]').eq(0).val();
						var token = $('input[name=_csrf_token]').eq(0).val();
						if (token) {
							post['_csrf_token'] = token;
						}
						var path = $(location).attr('pathname').replace("/"+view, "").replace(/\/+$/, "") + "/Default/source";
						var self = this;
						$.post(path,
							post,
							function(result){
								self.processSource(dependency, result);
							},
							"json"
						);
					} else {
						this.populateChoiceDependencies(dependency, []);
					}
				}
			}
		},
		
		processSource: function(source, result) {
			for (var name in this.simu.datas ) {
				var data = this.simu.datas[name];
				if (typeof data.unparsedSource !== "undefined" && data.unparsedSource !== "") {
					var s = this.evaluate(data.unparsedSource);
					if (s == source) {
						if (typeof data.unparsedIndex !== "undefined" && data.unparsedIndex !== "") {
							var index = this.evaluate(data.unparsedIndex);
							if (index !== false) {
								this.setValue(name, result[index]);
							}
						} else {
							this.setValue(name, result);
						}
					}
				}
			}
			this.populateChoiceDependencies(source, result);
		},
		
		populateChoiceDependencies : function (source, result) {
			var dependencies = this.simu.sources[source]['choiceDependencies'];
			if (dependencies) {
				for (var d in dependencies) {
					var dependency = dependencies[d];
					var valueColumn = this.simu.datas[dependency].choices.source.valueColumn;
					var labelColumn = this.simu.datas[dependency].choices.source.labelColumn;
					var choice = $("#"+dependency);
					choice.empty();
					var options = ['<option value="">-----</option>'];
					for (var r in result) {
						var row = result[r];
						options.push('<option value="', row[valueColumn], '">', row[labelColumn], '</option>');
					}
					choice.html(options.join(''));
					this.setValue(dependency, "");
				}
			}
		},
		
		validateAll: function() {
			var ok = true;
			for (var name in this.simu.datas ) {
				ok = this.validate(name) && ok;
			}
			return ok;
		},
		
		processFields: function () {
			this.evaluateDefaults();
			var self = this;
			$("#g6k_form input[type!=checkbox][type!=radio], #g6k_form input:radio:checked, #g6k_form input:checkbox:checked, #g6k_form select, #g6k_form textarea").each(function() {
				var name = $(this).attr('name');
				if (self.simu.datas[name]) {
					var value = $(this).val();
					if ($(this).attr('type') === "money" || $(this).attr('type') === "percent") {
						value = value.replace(/,/g, '.');
					}
					self.variables[name] = value;
				}
			});
			$("#g6k_form input, #g6k_form select, #g6k_form textarea").change(function () {
				self.lastUserInputName = $(this).attr('name');
				self.setValue(
					$(this).attr('name'), 
					$(this).attr('type') === 'checkbox' ? 
						($(this).is(':checked') ? 'true' : 'false') : 
						$(this).val()
				);
			});
			$("#g6k_form input, #g6k_form select, #g6k_form textarea").focusout(function () {
				var data = self.simu.datas[$(this).attr('name')];
				if (!self.check(data)) {
					switch (data.type) {
						case 'date':
							self.setError($(this).attr('name'), Translator.trans("This value is not in the expected format (%format%)",  { "format": "jj/mm/aaaa" }, 'messages'));
							break;
						case 'number': 
							self.setError($(this).attr('name'), Translator.trans("This value is not in the expected format (%format%)",  { "format": "chiffres seulement" }, 'messages'));
							break;
						case 'integer': 
							self.setError($(this).attr('name'), Translator.trans("This value is not in the expected format (%format%)",  { "format": "chiffres seulement" }, 'messages'));
							break;
						case 'money': 
							self.setError($(this).attr('name'), Translator.trans("This value is not in the expected format (%format%)",  { "format": "montant" }, 'messages'));
							break;
						case 'percent':
							self.setError($(this).attr('name'), Translator.trans("This value is not in the expected format (%format%)",  { "format": "pourcentage" }, 'messages'));
							break;
						default:
							self.setError($(this).attr('name'), Translator.trans("This value is not in the expected format"));
					}
				}
			});
			$("#g6k_form input[type=text], #g6k_form input[type=money]").bind("keypress", function(event) {
				if (event.keyCode == 13) {
					event.preventDefault();
					$(this).trigger("change");
					$(this).focusNextInputField();
				}
			});
			$("#g6k_form input[type=text], #g6k_form input[type=money]").bind('input propertychange', function(event) {
				var elt = this;
				setTimeout(function () {
					$(elt).trigger("change");
				}, 0);
			});
			$("#g6k_form input[type=text], #g6k_form input[type=money]").bind('paste', function(event) {
				var elt = this;
				setTimeout(function () {
					$(elt).trigger("change");
					$(this).focusNextInputField();
				}, 0);
			});
			$( "#g6k_form" ).submit(function( event ) {
				if (! self.validateAll()) {
					event.preventDefault();
				}
			});				
			for (var name in this.simu.datas ) {
				var data = this.simu.datas[name];
				if (data.type === "date") {
					var opt = {
						formElements:{
						}, 
						noFadeEffect: true,
						callbackFunctions:{
							"datereturned":[
								function(dateObj) {
									var date = dateObj.date === null ? "" : dateObj.date.format("d/m/Y");
									$('#' + dateObj.id).trigger('change');
									// self.setValue(dateObj.id, date);
								}
							]
						}
					};
					opt.formElements[name] = "%d/%m/%Y";
					datePickerController.createDatePicker(opt);
				}
				data.value = this.variables[name];
				if (typeof data.unparsedContent !== "undefined" && data.unparsedContent !== "") {
					var content = this.evaluate(data.unparsedContent);
					if (content !== false) {
						this.variables[name] = data.value = content;
					}
				}
			}
			if ($("input[name='script']").val() == 0) {
				for (var name in this.simu.datas ) {
					this.reevaluateFields(name);
				}
				$("input[name='script']").val(1);
			} else {
				for (var name in this.simu.datas ) {
					// this.evaluateFieldConditions(name);
					this.reevaluateFields(name);
				}
			}
		},
		
		replaceVariables: function(target) {
			var self = this;
			var result = target.replace(
				/#\(([^\)]+)\)(L?)/g,
				function (match, m1, m2, offs, str) {
					var data = self.simu.datas[m1];
					// return (data !== null) ? (m2 === 'L') ? data.choiceLabel : data.value : match;
					return (data && data.value) ? data.value : match;
				}
			);
			return /#\(([^\)]+)\)/.test(result) ? false : result;
		}
		
	};
	
	global.G6k = G6k;

}(this));

$.fn.clearForm = function() {
    this.each(function() {
        var type = this.type, tag = this.tagName.toLowerCase();
        if (tag == 'form')
            return $(':input',this).clearForm();
        if (type == 'text' || type == 'password'  || type == 'number'|| tag == 'textarea')
            this.setAttribute('value', '');
        else if (type == 'checkbox' || type == 'radio')
            this.removeAttribute('checked');
        else if (type == 'select-one' || tag == 'select')
            $('option', this).each(function(){
                this.removeAttribute('selected');
            });
			$(this).select2('val', "");
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

var cli = false;
if (cli) {
	try {
		var infix = "3 + #1 * 2 /  (1 - 5 ) ** 2 ** 3";
		// var infix = "!(dateInitiale < now && 5Â° < #1)";
		// var infix = "1 + (2 > 1 ? 2 : (4 > 10 ? 12 : 5 + 10)) * 2";
		// var infix = '#1 >= 01/01/2005 ? \'tout a fait vrai\' : "tout a fait faux"';
		// var infix = "((#1 == 0) ? ((#2 == 1) ? 18.0 : ((#2 == 2) ? 15.5 : ((#2 == 3) ? 13.3 : ((#2 == 4) ? 11.7 : ((#2 == 5) ? 10.6 : 9.5))))) : ((#1 == 1) ? ((#2 == 1) ? 13.5 : ((#2 == 2) ? 11.5 : ((#2 == 3) ? 10.0 : ((#2 == 4) ? 8.8 : ((#2 == 5) ? 8.0 : 7.2)))))) : ((#2 == 1) ? 9.0 : ((#2 == 2) ? 7.8 : ((#2 == 3) ? 6.7 : ((#2 == 4) ? 5.9 : ((#2 == 5) ? 5.3 : 4.8))))))";
		var parser = new ExpressionParser();
		var expr = parser.parse(infix);
		expr.postfix();
		// expr.setFields(array(4));
		expr.setVariables({'1':0, '2':2});
		expr.setNamedFields({'dateInitiale':'17/10/2014'});
		var tokens = expr.get();
		for (var t in tokens) {
			var token = tokens[t];
			console.log(token.type + " = [" + token + "]");
		}
		console.log(expr.evaluate());
	} catch (e) {
		console.log(e);
	}
}

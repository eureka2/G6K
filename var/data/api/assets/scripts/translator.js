(function (global) {
	'use strict';

	var translations = {
		'messages': {
			'fr': {
				"d": "JJ",
				"d-m-y": "JJ-MM-AA",
				"d-m-Y": "JJ-MM-AAAA",
				"d.m.Y": "JJ.MM.AAAA",
				"d. m. Y": "JJ. MM. AAAA",
				"d.m.Y.": "JJ.MM.AAAA.",
				"d/m/y": "JJ/MM/AA",
				"d/m/Y": "JJ/MM/AAAA",
				"d/m Y": "JJ/MM AAAA",
				"m": "MM",
				"m-d": "MM-JJ",
				"m-d-Y": "MM-JJ-AAAA",
				"m/d": "MM/JJ",
				"m/d/Y": "MM/JJ/AAAA",
				"m/y": "MM/AA",
				"m/Y": "MM/AAAA",
				"y": "AA",
				"Y": "AAAA",
				"y-m": "AA-MM",
				"Y-m": "AAAA-MM",
				"Y-m-d": "AAAA-MM-JJ",
				"y-m-d": "AA-MM-JJ",
				"Y. m. d.": "AAAA. MM. JJ",
				"Y/m/d": "AAAA/MM/JJ",
				"numbers only": "chiffres uniquement",
				"amount": "montant",
				"percentage": "pourcentage",
				"This value is not in the expected format": "Cette valeur n'est pas au format attendu",
				"The '%field%' field is required": "Le champ '%field%' est obligatoire",
				"The length of the field '%field%' cannot be less than %min%": "La longueur du champ '%field%' ne peut pas être inférieure à %min%",
				"The value of the field '%field%' cannot be less than %min%": "La valeur du champ '%field%' ne peut pas être inférieure à %min%",
				"The length of the field '%field%' cannot be greater than %max%": "La longueur du champ '%field%' ne peut pas être supérieure à %max%",
				"The value of the field '%field%' cannot be greater than %max%": "La valeur du champ '%field%' ne peut pas être supérieure à %max%",
				"Data to continue this simulation are not accessible. Please try again later.": "Les données pour continuer cette simulation ne sont pas accessibles. Veuillez réessayer ultérieurement.",
				"This value is not in the expected format": "Cette valeur n'est pas au format attendu",
				"The length of this value can not be less than %min%": "La longueur de cette valeur ne peut pas être inférieure à %min%",
				"This value can not be less than %min%": "Cette valeur ne peut pas être inférieure à%min%",
				"The length of this value can not be greater than %max%": "La longueur de cette valeur ne peut pas être supérieure à %max%",
				"This value can not be greater than %max%": "Cette valeur ne peut pas être supérieure à %max%",
				"To continue you must first correct your entry": "Pour continuer, vous devez d'abord corriger votre saisie",
				"Steps of your simulation": "Les étapes de votre simulation",
				"Current step : %step%": "Étape courante : %step%",
				"Simulator server takes too long to respond": "Le serveur de simulateurs met trop de temps à répondre"
			},
			'es': {
				"d": "dd",
				"d-m-y": "dd-mm-aaaa",
				"d-m-Y": "dd-mm-aaaa",
				"d.m.Y": "dd.mm.aaaa",
				"d. m. Y": "dd. mm. aaaa",
				"d.m.Y.": "dd.mm.aaaa.",
				"d/m/y": "dd/mm/aaaa",
				"d/m/Y": "dd/mm/aaaa",
				"d/m Y": "dd/mm aaaa",
				"m": "m",
				"m-d": "mm-dd",
				"m-d-Y": "mm-dd-aaaa",
				"m/d": "mm/dd",
				"m/d/Y": "mm/dd/aaaa",
				"m/y": "mm/aaaa",
				"m/Y": "mm/aaaa",
				"y": "aaaa",
				"Y": "AAAA",
				"y-m": "aaaa-mm",
				"Y-m": "aaaamm",
				"Y-m-d": "aaaa-mm-dd",
				"y-m-d": "aaaa-mm-dd",
				"Y. m. d.": "aaaa. mm. dd.",
				"Y/m/d": "aaaa/mm/dd",
				"numbers only": "solo numeros",
				"amount": "cantidad",
				"percentage": "porcentaje",
				"This value is not in the expected format": "Este valor no tiene el formato esperado",
				"The '%field%' field is required": "El campo '%field%' es obligatorio",
				"The length of the field '%field%' cannot be less than %min%": "La longitud del campo '%field%' no puede ser inferior a %min%",
				"The value of the field '%field%' cannot be less than %min%": "El valor del campo '%field%' no puede ser menor que %min%",
				"The length of the field '%field%' cannot be greater than %max%": "La longitud del campo '%field%' no puede ser mayor que %max%",
				"The value of the field '%field%' cannot be greater than %max%": "El valor del campo '%field%' no puede ser mayor que %max%",
				"Data to continue this simulation are not accessible. Please try again later.": "No se puede acceder a los datos para continuar con esta simulación. Vuelva a intentarlo más tarde.",
				"This value is not in the expected format": "Este valor no tiene el formato esperado",
				"The length of this value can not be less than %min%": "La longitud de este valor no puede ser inferior a %min%",
				"This value can not be less than %min%": "Este valor no puede ser inferior a %min%",
				"The length of this value can not be greater than %max%": "La longitud de este valor no puede ser mayor que %max%",
				"This value can not be greater than %max%": "Este valor no puede ser mayor que %max%",
				"To continue you must first correct your entry": "Para continuar primero debes corregir tu entrada",
				"Steps of your simulation": "Pasos de tu simulación",
				"Current step : %step%": "Paso actual : %step%",
				"Simulator server takes too long to respond": "El servidor del simulador tarda demasiado en responder"
			},
			'pt': {
				"d": "dd",
				"d-m-y": "dd-mm-aaaa",
				"d-m-Y": "dd-mm-aaaa",
				"d.m.Y": "dd.mm.aaaa",
				"d. m. Y": "dd. mm. aaaa",
				"d.m.Y.": "dd.mm.aaaa",
				"d/m/Y": "dd/mm/aaaa",
				"d/m/y": "dd/mm/aaaa",
				"d/m Y": "dd/mm aaaa",
				"m": "mm",
				"m-d": "mm-dd",
				"m-d-Y": "mm-dd-aaaa",
				"m/d": "mm/dd",
				"m/d/Y": "mm/dd/aaaa",
				"m/Y": "mm/aaaa",
				"m/y": "mm/aaaa",
				"y": "aaaa",
				"Y": "aaaa",
				"y-m": "aaaa-mm",
				"Y-m": "aaaa-mm",
				"Y-m-d": "aaaa-mm-dd",
				"y-m-d": "aaaa-mm-dd",
				"Y. m. d.": "aaaa. mm. dd.",
				"Y/m/d": "aaaa/mm/dd",
				"numbers only": "Apenas números",
				"amount": "montante",
				"percentage": "percentagem",
				"This value is not in the expected format": "Este valor não está no formato esperado",
				"The '%field%' field is required": "O campo '%field%' é obrigatório",
				"The length of the field '%field%' cannot be less than %min%": "O comprimento do campo '%field%' não pode ser inferior a %min%",
				"The value of the field '%field%' cannot be less than %min%": "O valor do campo '%field%' não pode ser inferior a %min%",
				"The length of the field '%field%' cannot be greater than %max%": "O comprimento do campo '%field%' não pode ser maior que %max%",
				"The value of the field '%field%' cannot be greater than %max%": "O valor do campo '%field%' não pode ser maior que %max%",
				"Data to continue this simulation are not accessible. Please try again later.": "Os dados para continuar esta simulação não estão acessíveis. Por favor, tente novamente mais tarde.",
				"This value is not in the expected format": "Este valor não está no formato esperado",
				"The length of this value can not be less than %min%": "O comprimento deste valor não pode ser inferior a %min%",
				"This value can not be less than %min%": "Este valor não pode ser inferior a%min%",
				"The length of this value can not be greater than %max%": "O comprimento deste valor não pode ser maior que %max%",
				"This value can not be greater than %max%": "Este valor não pode ser maior que %max%",
				"To continue you must first correct your entry": "Para continuar, você deve primeiro corrigir sua entrada",
				"Steps of your simulation": "Etapas de sua simulação",
				"Current step : %step%": "Etapa atual : %step%",
				"Simulator server takes too long to respond": "O servidor do simulador demora muito para responder"
			},
			'it': {
				"d": "d",
				"d-m-y": "dmy",
				"d-m-Y": "DMY",
				"d.m.Y": "DMY",
				"d. m. Y": "dm Y",
				"d.m.Y.": "DMY",
				"d/m/y": "d/m/y",
				"d/m/Y": "d/m/Y",
				"d/m Y": "d/m Y",
				"m": "m",
				"m-d": "md",
				"m-d-Y": "MDY",
				"m/d": "m/d",
				"m/d/Y": "m/d/Y",
				"m/Y": "mio",
				"m/y": "mio",
				"y": "y",
				"Y": "Y",
				"Y-m": "Ym",
				"y-m": "YM",
				"y-m-d": "ymd",
				"Y-m-d": "ymd",
				"Y. m. d.": "Y. md",
				"Y/m/d": "Y/m/d",
				"numbers only": "solo numeri",
				"amount": "quantità",
				"percentage": "percentuale",
				"This value is not in the expected format": "Questo valore non è nel formato previsto",
				"The '%field%' field is required": "Il campo '%field%' è obbligatorio",
				"The length of the field '%field%' cannot be less than %min%": "La lunghezza del campo '%field%' non può essere inferiore a %min%",
				"The value of the field '%field%' cannot be less than %min%": "Il valore del campo '%field%' non può essere inferiore a %min%",
				"The length of the field '%field%' cannot be greater than %max%": "La lunghezza del campo '%field%' non può essere maggiore di %max%",
				"The value of the field '%field%' cannot be greater than %max%": "Il valore del campo '%field%' non può essere maggiore di %max%",
				"Data to continue this simulation are not accessible. Please try again later.": "I dati per continuare questa simulazione non sono accessibili. Riprova più tardi.",
				"This value is not in the expected format": "Questo valore non è nel formato previsto",
				"The length of this value can not be less than %min%": "La lunghezza di questo valore non può essere inferiore a %min%",
				"This value can not be less than %min%": "Questo valore non può essere inferiore a %min%",
				"The length of this value can not be greater than %max%": "La lunghezza di questo valore non può essere maggiore di %max%",
				"This value can not be greater than %max%": "Questo valore non può essere maggiore di %max%",
				"To continue you must first correct your entry": "Per continuare devi prima correggere la tua voce",
				"Steps of your simulation": "Fasi della tua simulazione",
				"Current step : %step%": "Passaggio corrente : %step%",
				"Simulator server takes too long to respond": "Il server del simulatore impiega troppo tempo per rispondere"
			}
		}
	};

	function Translator() {
	};

	Translator.locale = 'en';
	
	Translator.trans = function (message, params, domain) {
		domain = domain || 'messages';
		if (translations[domain]) {
			var messages = translations[domain];
			var locale = Translator.locale.substr(0, 2);
			if (messages[locale] && messages[locale][message]) {
				message = messages[locale][message];
			}
			if (typeof params != "undefined") {
				for (var param in params) {
					var value = params[param];
					message = message.replace('%' + param + '%', value);
				}
			}
		}
		return message;
	};

	global.Translator = Translator;
}(this));

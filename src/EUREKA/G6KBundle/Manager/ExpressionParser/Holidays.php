<?php

/*
The MIT License (MIT)

Copyright (c) 2017 Jacques Archimède

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

namespace EUREKA\G6KBundle\Manager\ExpressionParser;

class Holidays {

	public static function workdays($startDate, $endDate) {
		// Validate input
		if ($endDate < $startDate)
			return 0;

		// Calculate days between dates
		$startDate->setTime(0,0,1);  // Start just after midnight
		$endDate->setTime(23,59,59);  // End just before midnight
		$days = $startDate->diff($endDate)->days + 1;  // days between datetime objects
		// Subtract two weekend days for every week in between
		$weeks = floor($days / 7);
		$days = $days - ($weeks * 2);

		// Handle special cases
		$startDay = ((int)$startDate->format('N')) % 7;
		$endDay = ((int)$endDate->format('N')) % 7;

		// Remove weekend not previously removed.   
		if ($startDay - $endDay > 1)		 
			$days = $days - 2;	  

		// Remove start day if span starts on Sunday but ends before Saturday
		if ($startDay == 0 && $endDay != 6)
			$days = $days - 1;

		// Remove end day if span ends on Saturday but starts after Sunday
		if ($endDay == 6 && $startDay != 0)
			$days = $days - 1;  
		$lang = "fr-FR";
		$startYear = (int)$startDate->format('Y');
		$endYear = (int)$endDate->format('Y');
		$startDate->setTime(0, 0, 0);
		for ($y = $startYear; $y <= $endYear; $y++) {
			$holidays = self::holidays($y, $lang);
			foreach($holidays as $holiday) {
				$d = ((int)$holiday->format('N')) % 7;
				if ($d != 0 && $d != 6 && $holiday >= $startDate && $holiday <= $endDate)
					$days = $days - 1;
			}
		}
		return $days;
	}

	public static function nextWorkingDay($date) {
		$d = $date;
		while (! self::isWorkingDay($d)) {
			$d->add(new \DateInterval('P1D'));
		}
		return $d;
	}

	private static function fixedHolidays($year, $lang = "en-US") {
		$fholidays = array(
			"US" => array(
				"01-01", "07-04", "11-01", "12-25"
			),
			"FR" => array(
				"01-01", "05-01", "05-08", "07-14", "08-15", "11-01", "11-11", "12-25"
			),
		);
		$lg = explode("-", $lang);
		$lg = strtoupper (end($lg));
		if (!isset($fholidays[$lg])) $lg = "US";
		$holidays = array();
		foreach($fholidays[$lg] as $monthday) {
			$holiday = \DateTime::createFromFormat('Y-m-d', $year.'-'.$monthday);
			$holiday->setTime(0, 0, 0);
			$holidays[] = $holiday;
		}
		return $holidays;
	}

	private static function moveableHolidays($year, $lang = "en-US") {
		$easter = self::easter($year);
		$holidays = array(
			"US" => array(),
			"FR" => array(
				clone $easter, 
				clone $easter->add(new \DateInterval('P1D')), 
				clone $easter->add(new \DateInterval('P38D')), 
				clone $easter->add(new \DateInterval('P10D')), 
				clone $easter->add(new \DateInterval('P1D'))
			),
		);
		$lg = explode("-", $lang);
		$lg = strtoupper (end($lg));
		if (!isset($holidays[$lg])) $lg = "US";
		return $holidays[$lg];
	}

	private static function holidays($year, $lang = "en.US") {
		$holidays =  self::moveableHolidays($year, $lang);
		$fixed =  self::fixedHolidays($year, $lang);
		foreach($fixed as $holiday) {
			$holidays[] = $holiday;
		}
		return $holidays;
	}

	private static function easter($year) {
		$days = easter_days($year);
		$easter = \DateTime::createFromFormat('Y-m-d', $year.'-3-21');
		$easter->setTime(0, 0, 0);	 
		$easter->add(new \DateInterval('P'.$days.'D'));
		$easter->setTime(0, 0, 0);
		return $easter;
	}

	private static function isWorkingDay($date) {
		$day = ((int)$date->format('N')) % 7;
		if ($day == 0 || $day == 6) {
			return false; 
		}
		$lang = "fr-FR";
		$holidays = self::holidays((int)$date->format('Y'), $lang);
		foreach($holidays as $holiday) {
			if ($holiday == $date) {
				return false;
			}
		}
		return true;
	}

}

?>

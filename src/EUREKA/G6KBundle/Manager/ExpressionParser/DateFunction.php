<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2017 Jacques Archimède

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

/**
 *
 * This class provides some date functions for the expression parser.
 *
 * @copyright Jacques Archimède
 *
 */
class DateFunction {

	/**
	 * Returns the date corresponding of the nth day of a month
	 *
	 * Ex: nthDayOfMonth(1, 0, 1, 2017) for the question: what is the first sunday of January 2017
	 *
	 * @access  public
	 * @static 
	 * @param   int $nth The ordinal number
	 * @param   int $day The day of the week (0 to 6)
	 * @param   int $month The numeric representation of a month (1 to 12)
	 * @param   int $year The year
	 * @return  \DateTime <description of the return value>
	 *
	 */
	public static function nthDayOfMonth($nth, $day, $month, $year) {
		$dayname = array('sunday',  'monday',  'tuesday',  'wednesday',  'thursday',  'friday',  'saturday',  'sun',  'mon',  'tue',  'wed',  'thu',  'fri',  'sat',  'sun');
		$monthname = array('january',  'february',  'march',  'april',  'may',  'june',  'july',  'august',  'september',  'october',  'november',  'december',  'jan',  'feb',  'mar',  'apr',  'may',  'jun',  'jul',  'aug',  'sep',  'sept',  'oct',  'nov',  'dec');
		$ordinal = array('first',  'second',  'third',  'fourth',  'fifth',  'sixth',  'seventh',  'eighth',  'ninth',  'tenth',  'eleventh',  'twelfth');
		return new \DateTime($ordinal[$nth - 1]. " ".$dayname[$day]." of ".$monthname[$month - 1]." ".$year);
	}

	/**
	 * Returns the last day of the month
	 *
	 * Ex: lastDay(2, 2017) returns 28.
	 *
	 * @access  public
	 * @static 
	 * @param   int $month The numeric representation of the month (1 to 12)
	 * @param   int $year The year
	 * @return  int <description of the return value>
	 *
	 */
	public static function lastDay($month, $year) {
		$monthname = array('january',  'february',  'march',  'april',  'may',  'june',  'july',  'august',  'september',  'october',  'november',  'december',  'jan',  'feb',  'mar',  'apr',  'may',  'jun',  'jul',  'aug',  'sep',  'sept',  'oct',  'nov',  'dec');
		$lastDate =  new \DateTime("last day of ".$monthname[$month - 1]." ".$year);
		return (int)$lastDate->format('j');
	}

	/**
	 * Returns a new date corresponding to the first day of the month of the given date.
	 *
	 * @access  public
	 * @static 
	 * @param   \DateTime $dateObj The reference date
	 * @return  \DateTime The new date
	 *
	 */
	public static function firstDayOfMonth(\DateTime $dateObj) {
		$date = clone $dateObj;
		$date->modify('first day of this month');
		return $date;
	}

	/**
	 * Returns a new date corresponding to the last day of the month of the given date.
	 *
	 * @access  public
	 * @static 
	 * @param   \DateTime $dateObj The reference date
	 * @return  \DateTime The new date
	 *
	 */
	public static function lastDayOfMonth(\DateTime $dateObj) {
		$date = clone $dateObj;
		$date->modify('last day of this month');
		return $date;
	}

	/**
	 * Returns a new date from the input date by adding the given number of months
	 *
	 * @access  public
	 * @static 
	 * @param   int $months The number of months to add
	 * @param   \DateTime $dateObject The date to which a number of months has to be added.
	 * @return  \DateTime The new date
	 *
	 */
	public static function addMonths($months, \DateTime $dateObject) {
		$next = new \DateTime($dateObject->format('Y-m-d'));
		$next->modify('last day of +'.$months.' month');
		if($dateObject->format('d') > $next->format('d')) {
			$int = $dateObject->diff($next);
		} else {
			$int = new \DateInterval('P'.$months.'M');
		}
		$date = clone $dateObject;
		$newDate = $date->add($int);
		return $newDate;
	}

}

?>

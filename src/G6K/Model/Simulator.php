<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2018 Jacques Archimède

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

namespace App\G6K\Model;

use App\G6K\Manager\ExpressionParser\DateFunction;
use App\G6K\Manager\ExpressionParser\MoneyFunction;
use App\G6K\Manager\ExpressionParser\NumberFunction;
use App\G6K\Manager\ExpressionParser\PercentFunction;

/**
 *
 * This class allows the storage and retrieval of the attributes of a simulator.
 *
 * @author    Jacques Archimède
 *
 */
class Simulator {

	/**
	 * @var \App\G6K\Controller\BaseController|\App\G6K\Controller\BaseAdminController $controller The controller that uses this Simulator object
	 *
	 * @access  private
	 *
	 */
	private $controller = null;

	/**
	 * @var string|int     $name The name of this simulator. It will be part of the URL (* .../calcul/simulator-name *) and the name of the XML definition file 
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $label The label of this simulator .
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var string     $category The category of this simulator.
	 *
	 * @access  private
	 *
	 */
	private $category = "";

	/**
	 * @var string     $defaultView  The name of the default view with which this simulator will be displayed
	 *
	 * @access  private
	 *
	 */
	private $defaultView = "";

	/**
	 * @var string     $referer  The URL of the site page that calls the simulator 
	 *
	 *
	 * @access  private
	 *
	 */
	private $referer = "";

	/**
	 * @var bool       $dynamic If true, the simulation engine will use Javascript to give interactivity to the simulation 
	 *
	 * @access  private
	 *
	 */
	private $dynamic = false;

	/**
	 * @var bool       $memo If true, the simulation engine will be allowed to save the value of certain fields in the browser cookies for later use. (eg Date of birth) 
	 *
	 * @access  private
	 *
	 */
	private $memo = false;

	/**
	 * @var string       $locale The locale language used by this simulator
	 *
	 * @access  private
	 *
	 */
	private $locale = 'fr-FR';

	/**
	 * @var \App\G6K\Model\RichText     $description The description of this simulator
	 *
	 * @access  private
	 *
	 */
	private $description = null;

	/**
	 * @var string     $dateFormat The current date format in the display language of this simulator
	 *
	 * @access  private
	 *
	 */
	private $dateFormat = "";

	/**
	 * @var string     $timezone The current timezone for the locale used in this simulator
	 *
	 * @access  private
	 *
	 */
	private $timezone = "Europe/Paris";

	/**
	 * @var string     $decimalPoint The current decimal point in the display language of this simulator
	 *
	 * @access  private
	 *
	 */
	private $decimalPoint = "";

	/**
	 * @var string     $groupingSeparator The current grouping separator in the display language of this simulator
	 *
	 * @access  private
	 *
	 */
	private $groupingSeparator = "";

	/**
	 * @var string     $groupingSize The current grouping size in the display language of this simulator
	 *
	 * @access  private
	 *
	 */
	private $groupingSize = 3;

	/**
	 * @var string     $moneySymbol The current currency symbol in the country of use of this simulator
	 *
	 * @access  private
	 *
	 */
	private $moneySymbol = "";

	/**
	 * @var string     $symbolPosition The position of the currency symbol relative to the amount in the country of use of this simulator
	 *
	 * @access  private
	 *
	 */
	private $symbolPosition = "";

	/**
	 * @var array      $datas The list of data used by this simulator.
	 *
	 * @access  private
	 *
	 */
	private $datas = array();

	/**
	 * @var \App\G6K\Model\Profiles $profiles The profiles container used in this simulator
	 *
	 * @access  private
	 *
	 */
	private $profiles = null;

	/**
	 * @var array      $steps  The list of simulation steps defined by this simulator.
	 *
	 * @access  private
	 *
	 */
	private $steps = array();

	/**
	 * @var array      $sites The list of web sites using this simulator.
	 *
	 * @access  private
	 *
	 */
	private $sites = array();

	/**
	 * @var array      $databases The list of available databases 
 	 *
	 * @access  private
	 *
	 */
	private $databases = array();

	/**
	 * @var array      $datasources The list of available data sources.
	 *
	 * @access  private
	 *
	 */
	private $datasources = array();

	/**
	 * @var array      $sources The list of used sources by this simulator.
	 *
	 * @access  private
	 *
	 */
	private $sources = array();

	/**
	 * @var array      $businessrules The list of business rules implemented by this simulator
	 *
	 * @access  private
	 *
	 */
	private $businessrules = array();

	/**
	 * @var \App\G6K\Model\RichText     $relatedInformations The informations related to this simulator.
	 *
	 * @access  private
	 *
	 */
	private $relatedInformations = null;

	/**
	 * @var string     $dependencies The name of a data dependency
	 *
	 * @access  private
	 *
	 */
	private $dependencies = "";

	/**
	 * @var bool       $error Indicates whether an error has been detected or not
	 *
	 * @access  private
	 *
	 */
	private $error = false;

	/**
	 * @var array      $errorMessages The list of error messages
	 *
	 * @access  private
	 *
	 */
	private $errorMessages = array();

	/**
	 * @var bool       $warning Indicates whether an warning has been issued or not
	 *
	 * @access  private
	 *
	 */
	private $warning = false;

	/**
	 * @var array      $warningMessages The list of warning messages
	 *
	 * @access  private
	 *
	 */
	private $warningMessages = array();

	/**
	 * Constructor of class Simulator
	 *
	 * @access  public
	 * @param   \App\G6K\Controller\BaseController|\App\G6K\Controller\BaseAdminController $controller The controller that uses this Simulator object
	 * @return  void
	 *
	 */
	public function __construct($controller) {
		$this->controller = $controller;
		$this->groupingSeparator = MoneyFunction::$groupingSeparator;
		$this->groupingSize = MoneyFunction::$groupingSize;
		$this->locale = getenv('APP_LOCALE');
		$this->timezone = DateFunction::$timezone->getName();
	}

	/**
	 * Returns the Controller Object that uses this Simulator object.
	 *
	 * @access  public
	 * @return  \App\G6K\Controller\BaseController|\App\G6K\Controller\BaseAdminController The Controller Object that uses this Simulator object
	 *
	 */
	public function getController() {
		return $this->controller;
	}

	/**
	 * Returns the name of this simulator
	 *
	 * @access  public
	 * @return  string|int The name of this simulator
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this simulator
	 *
	 * @access  public
	 * @param   string|int $name The name of this simulator
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the label of this simulator
	 *
	 * @access  public
	 * @return  string The label of this simulator
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this simulator
	 *
	 * @access  public
	 * @param   string $label The label of this simulator
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the category of this simulator
	 *
	 * @access  public
	 * @return  string The category of this simulator
	 *
	 */
	public function getCategory() {
		return $this->category;
	}

	/**
	 * Sets the category of this simulator
	 *
	 * @access  public
	 * @param   string $category The category of this simulator
	 * @return  void
	 *
	 */
	public function setCategory($category) {
		$this->category = $category;
	}

	/**
	 * Returns the URL of the site page (main referer) that calls this simulator 
	 *
	 * @access  public
	 * @return  string The URL of the site page
	 *
	 */
	public function getReferer() {
		return $this->referer;
	}

	/**
	 * Sets the URL of the site page (main referer) that calls this simulator 
	 *
	 * @access  public
	 * @param   string $referer The URL of the site page 
	 * @return  void
	 *
	 */
	public function setReferer($referer) {
		$this->referer = $referer;
	}

	/**
	 * Returns the name of the default view with which this simulator will be displayed
	 *
	 * @access  public
	 * @return  string The name of the default view
	 *
	 */
	public function getDefaultView() {
		return $this->defaultView;
	}

	/**
	 * Sets the name of the default view with which this simulator will be displayed
	 *
	 * @access  public
	 * @param   string $defaultView The name of the default view
	 * @return  void
	 *
	 */
	public function setDefaultView($defaultView) {
		$this->defaultView = $defaultView;
	}

	/**
	 * Returns the dynamic attribute of this simulator.
	 *
	 * @access  public
	 * @return  bool true if the simulation engine will use Javascript to give interactivity to the simulation, false otherwise 
	 *
	 */
	public function isDynamic() {
		return $this->dynamic;
	}

	/**
	 * Returns the dynamic attribute of this simulator.
	 *
	 * @access  public
	 * @return  bool true if the simulation engine will use Javascript to give interactivity to the simulation, false otherwise 
	 *
	 */
	public function getDynamic() {
		return $this->dynamic;
	}

	/**
	 * Determines whether this simulator is dynamic (interactive) or not.
	 *
	 * @access  public
	 * @param   bool $dynamic true if the simulation engine will use Javascript to give interactivity to the simulation, false otherwise 
	 * @return  void
	 *
	 */
	public function setDynamic($dynamic) {
		$this->dynamic = $dynamic;
	}

	/**
	 * Returns the memo attribute of this simulator. Alias of the getMemo method.
	 *
	 * @access  public
	 * @return  bool true if the simulation engine will be allowed to save the value of certain fields in the browser cookies for later use.
	 *
	 */
	public function isMemo() {
		return $this->memo;
	}

	/**
	 * Returns the memo attribute of this simulator. Alias of the getMemo method.
	 *
	 * @access  public
	 * @return  bool true if the simulation engine will be allowed to save the value of certain fields in the browser cookies for later use.
	 *
	 */
	public function hasMemo() {
		return $this->memo;
	}

	/**
	 * Returns the memo attribute of this simulator.
	 *
	 * @access  public
	 * @return  bool true if the simulation engine will be allowed to save the value of certain fields in the browser cookies for later use.
	 *
	 */
	public function getMemo() {
		return $this->memo;
	}

	/**
	 * Determines whether the simulation engine will be allowed to save the value of certain fields in the browser cookies for later use or not.
	 *
	 * @access  public
	 * @param   bool $memo true if the simulation engine will be allowed to save the value of certain fields in the browser cookies for later use.
	 * @return  void
	 *
	 */
	public function setMemo($memo) {
		$this->memo = $memo;
	}

	/**
	 * Returns the locale attribute of this simulator.
	 *
	 * @access  public
	 * @return  string true The locale attribute.
	 *
	 */
	public function getLocale() {
		return $this->locale;
	}

	/**
	 * Sets the locale attribute of this simulator.
	 *
	 * @access  public
	 * @param   string $locale The locale attribute (en-US, en-GB, fr-FR, fr-CA, ...).
	 * @return  void
	 *
	 */
	public function setLocale($locale) {
		$this->locale = $locale;
	}

	/**
	 * Returns the description of this simulator
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText The description of this simulator
	 *
	 */
	public function getDescription() {
		return $this->description;
	}

	/**
	 * Sets the description of this simulator
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText $description The description of this simulator
	 * @return  void
	 *
	 */
	public function setDescription($description) {
		$this->description = $description;
	}

	/**
	 * Returns the date format in the display language of this simulator
	 *
	 * @see http://php.net/manual/fr/function.date.php for the special characters that are recognized in the format
	 * @access  public
	 * @return  string The value of dateFormat
	 *
	 */
	public function getDateFormat() {
		return $this->dateFormat;
	}

	/**
	 * Sets the date format in the display language of this simulator
	 *
	 * @see http://php.net/manual/fr/function.date.php for the special characters that are recognized in the format
	 * @access  public
	 * @param   string $dateFormat The date format
	 * @return  void
	 *
	 */
	public function setDateFormat($dateFormat) {
		$this->dateFormat = $dateFormat;
		DateFunction::$dateFormat = $dateFormat;
	}

	/**
	 * Returns the timezone for the locale used in this simulator
	 *
	 * @access  public
	 * @return  string The value of timezone
	 *
	 */
	public function getTimezone() {
		return $this->timezone;
	}

	/**
	 * Sets the timezone for the locale used in this simulator
	 *
	 * @access  public
	 * @param   string $timezone The timezone
	 * @return  void
	 *
	 */
	public function setTimezone($timezone) {
		$this->timezone = $timezone;
		DateFunction::$timezone = new \DateTimeZone($timezone);
	}

	/**
	 * Returns the timezone for the locale used in this simulator
	 *
	 * @access  public
	 * @return  string The timezone
	 *
	 */
	public function getDecimalPoint() {
		return $this->decimalPoint;
	}

	/**
	 * Sets the decimal point in the display language of this simulator
	 *
	 * @access  public
	 * @param   string $decimalPoint The decimal point
	 * @return  void
	 *
	 */
	public function setDecimalPoint($decimalPoint) {
		$this->decimalPoint = $decimalPoint;
		NumberFunction::$decimalPoint = $decimalPoint;
		PercentFunction::$decimalPoint = $decimalPoint;
		MoneyFunction::$decimalPoint = $decimalPoint;
	}

	/**
	 * Returns the grouping separator in the display language of this simulator
	 *
	 * @access  public
	 * @return  string The grouping separator
	 *
	 */
	public function getGroupingSeparator() {
		return $this->groupingSeparator;
	}

	/**
	 * Sets the grouping separator in the display language of this simulator
	 *
	 * @access  public
	 * @param   string $groupingSeparator The grouping separator
	 * @return  void
	 *
	 */
	public function setGroupingSeparator($groupingSeparator) {
		$this->groupingSeparator = $groupingSeparator;
		NumberFunction::$groupingSeparator = $groupingSeparator;
		PercentFunction::$groupingSeparator = $groupingSeparator;
		MoneyFunction::$groupingSeparator = $groupingSeparator;
	}

	/**
	 * Returns the grouping size in the display language of this simulator
	 *
	 * @access  public
	 * @return  string The grouping size
	 *
	 */
	public function getGroupingSize() {
		return $this->groupingSize;
	}

	/**
	 * Sets the grouping size in the display language of this simulator
	 *
	 * @access  public
	 * @param   string $groupingSize The grouping size
	 * @return  void
	 *
	 */
	public function setGroupingSize($groupingSize) {
		$this->groupingSize = $groupingSize;
		NumberFunction::$groupingSize = $groupingSize;
		PercentFunction::$groupingSize = $groupingSize;
		MoneyFunction::$groupingSize = $groupingSize;
	}

	/**
	 * Returns the currency symbol in the country of use of this simulator
	 *
	 * @access  public
	 * @return  string The currency symbol
	 *
	 */
	public function getMoneySymbol() {
		return $this->moneySymbol;
	}

	/**
	 * Sets the currency symbol in the country of use of this simulator
	 *
	 * @access  public
	 * @param   string $moneySymbol The currency symbol
	 * @return  void
	 *
	 */
	public function setMoneySymbol($moneySymbol) {
		$this->moneySymbol = $moneySymbol;
		MoneyFunction::$moneySymbol = $moneySymbol;
	}

	/**
	 * Returns the position of the currency symbol relative to the amount in the country of use of this simulator
	 *
	 * @access  public
	 * @return  string the value of symbolPosition
	 *
	 */
	public function getSymbolPosition() {
		return $this->symbolPosition;
	}

	/**
	 * Sets the position of the currency symbol relative to the amount in the country of use of this simulator
	 *
	 * @access  public
	 * @param   string $symbolPosition <parameter description>
	 * @return  void
	 *
	 */
	public function setSymbolPosition($symbolPosition) {
		$this->symbolPosition = $symbolPosition;
		MoneyFunction::$symbolPosition = $symbolPosition;
	}

	/**
	 * Returns the list of data used by this simulator.
	 *
	 * @access  public
	 * @return  array The list of data
	 *
	 */
	public function getDatas() {
		return $this->datas;
	}

	/**
	 * Sets the list of data used by this simulator.
	 *
	 * @access  public
	 * @param   array $datas The list of data
	 * @return  void
	 *
	 */
	public function setDatas($datas) {
		$this->datas = $datas;
	}

	/**
	 * Adds a DatasetChild object in the list of data used by this simulator.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\DatasetChild $data The DatasetChild object
	 * @return  void
	 *
	 */
	public function addData($data) {
		$this->datas[] = $data;
	}

	/**
	 * Removes a DatasetChild object from the list of data used by this simulator.
	 *
	 * @access  public
	 * @param   int $index The index of the data item in the list of data.
	 * @return  void
	 *
	 */
	public function removeData($index) {
		$this->datas[$index] = null;
	}

	/**
	 * Retrieves a Data object by its ID
	 *
	 * @access  public
	 * @param   int $id The id of the Data object
	 * @return  \App\G6K\Model\Data|null The Data object
	 *
	 */
	public function getDataById($id) {
		foreach ($this->datas as $data) {
			if ($data instanceof DataGroup) {
				if (($gdata = $data->getDataById($id)) !== null) {
					return $gdata;
				}
			} elseif ($data->getId() == $id) {
				return $data;
			}
		}
		throw new \Exception("Unable to find the data whose id is '" . $id . "'");
	}

	/**
	 * Retrieves a Data object by its name
	 *
	 * @access  public
	 * @param   string $name The name of the Data object
	 * @return  \App\G6K\Model\Data|null The Data object
	 *
	 */
	public function getDataByName($name) {
		foreach ($this->datas as $data) {
			if ($data instanceof DataGroup) {
				if (($gdata = $data->getDataByName($name)) !== null) {
					return $gdata;
				}
			} elseif ($data->getName() == $name) {
				return $data;
			}
		}
		if ($name == 'script' || $name == 'dynamic' || preg_match("/step\d+\.dynamic/", $name)) {
			return null;
		}
		throw new \Exception("Unable to find the data whose name is '" . $name . "'");
	}

	/**
	 * Retrieves a DataGroup object by its ID
	 *
	 * @access  public
	 * @param   int $id The id of the DataGroup object
	 * @return  \App\G6K\Model\DataGroup|null The DataGroup object
	 *
	 */
	public function getDataGroupById($id) {
		foreach ($this->datas as $data) {
			if (($data instanceof DataGroup) && $data->getId() == $id) {
				return $data;
			}
		}
		throw new \Exception("Unable to find the data group whose id is '" . $id . "'");
	}

	/**
	 * Retrieves a DataGroup object by its name
	 *
	 * @access  public
	 * @param   string $name The name of the DataGroup object
	 * @return  \App\G6K\Model\DataGroup|null The DataGroup object
	 *
	 */
	public function getDataGroupByName($name) {
		foreach ($this->datas as $data) {
			if (($data instanceof DataGroup) && $data->getName() == $name) {
				return $data;
			}
		}
		throw new \Exception("Unable to find the data group whose name is '" . $name . "'");
	}

	/**
	 * Returns the profiles container used in this simulator
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Profiles The profiles container
	 *
	 */
	public function getProfiles() {
		return $this->profiles;
	}

	/**
	 * Sets the profiles container used in this simulator
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Profiles $profiles The profiles container
	 * @return  void
	 *
	 */
	public function setProfiles($profiles) {
		$this->profiles = $profiles;
	}

	/**
	 * Returns the list of simulation steps defined by this simulator.
	 *
	 * @access  public
	 * @return  array The list of simulation steps.
	 *
	 */
	public function getSteps() {
		return $this->steps;
	}

	/**
	 * Sets the list of simulation steps defined by this simulator.
	 *
	 * @access  public
	 * @param   array $steps The list of simulation steps.
	 * @return  void
	 *
	 */
	public function setSteps($steps) {
		$this->steps = $steps;
	}

	/**
	 * Adds a Step object in the list of steps defined by this simulator.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Step $step The Step object
	 * @return  void
	 *
	 */
	public function addStep(Step $step) {
		$this->steps[] = $step;
	}

	/**
	 * Removes a Step object from the list of steps defined by this simulator.
	 *
	 * @access  public
	 * @param   int $index The index of the step in the list of steps.
	 * @return  void
	 *
	 */
	public function removeStep($index) {
		$this->steps[$index] = null;
	}

	/**
	 * Retrieves a Step object by its ID
	 *
	 * @access  public
	 * @param   int $id <parameter description>
	 * @return  \App\G6K\Model\Step|null the value of stepById
	 *
	 */
	public function getStepById($id) {
		foreach ($this->steps as $step) {
			if ($step->getId() == $id) {
				return $step;
			}
		}
		throw new \Exception("Unable to find the step whose id is '" . $id . "'");
	}

	/**
	 * Retrieves a Step object by its name
	 *
	 * @access  public
	 * @param   string $name <parameter description>
	 * @return  \App\G6K\Model\Step|null the value of stepById
	 *
	 */
	public function getStepByName($name) {
		foreach ($this->steps as $step) {
			if ($step->getName() == $name) {
				return $step;
			}
		}
		throw new \Exception("Unable to find the step whose name is '" . $name . "'");
	}

	/**
	 * Returns the list of used sources by this simulator.
	 *
	 * @access  public
	 * @return  array The list of used sources.
	 *
	 */
	public function getSources() {
		return $this->sources;
	}

	/**
	 * Sets the list of used sources by this simulator.
	 *
	 * @access  public
	 * @param   array $sources The list of used sources.
	 * @return  void
	 *
	 */
	public function setSources($sources) {
		$this->sources = $sources;
	}

	/**
	 * Adds a Source object in the list of used sources by this simulator.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Source $source The Source object
	 * @return  void
	 *
	 */
	public function addSource(Source $source) {
		$this->sources[] = $source;
	}

	/**
	 * Removes a Source object from the list of used sources by this simulator.
	 *
	 * @access  public
	 * @param   int $index <parameter description>
	 * @return  void
	 *
	 */
	public function removeSource($index) {
		$this->sources[$index] = null;
	}

	/**
	 * Returns the list of business rules implemented by this simulator
	 *
	 * @access  public
	 * @return  array The list of business rules
	 *
	 */
	public function getBusinessRules() {
		return $this->businessrules;
	}

	/**
	 * Sets the list of business rules implemented by this simulator
	 *
	 * @access  public
	 * @param   array $businessrules The list of business rules
	 * @return  void
	 *
	 */
	public function setBusinessRules($businessrules) {
		$this->businessrules = $businessrules;
	}

	/**
	 * Adds a BusinessRule object in the list of business rules implemented by this simulator
	 *
	 * @access  public
	 * @param   \App\G6K\Model\BusinessRule $businessrules The BusinessRule object
	 * @return  void
	 *
	 */
	public function addBusinessRule(BusinessRule $businessrules) {
		$this->businessrules[] = $businessrules;
	}

	/**
	 * Removes a BusinessRule object from the list of business rules implemented by this simulator
	 *
	 * @access  public
	 * @param   int $index The index of the business rule in the list of business rules.
	 * @return  void
	 *
	 */
	public function removeBusinessRule($index) {
		$this->businessrules[$index] = null;
	}

	/**
	 * Retrieves a BusinessRule object by its ID
	 *
	 * @access  public
	 * @param   int $id <parameter description>
	 * @return  \App\G6K\Model\BusinessRule|null the value of businessRuleById
	 *
	 */
	public function getBusinessRuleById($id) {
		foreach ($this->businessrules as $businessrule) {
			if ($businessrule->getId() == $id) {
				return $businessrule;
			}
		}
		throw new \Exception("Unable to find the business rule whose id is '" . $id . "'");
	}

	/**
	 * Returns the informations related to this simulator.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText The informations related to this simulator
	 *
	 */
	public function getRelatedInformations() {
		return $this->relatedInformations;
	}

	/**
	 * Sets the informations related to this simulator.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText $relatedInformations The informations related to this simulator
	 * @return  void
	 *
	 */
	public function setRelatedInformations($relatedInformations) {
		$this->relatedInformations = $relatedInformations;
	}

	/**
	 * Retrieves a Site object by its ID
	 *
	 * @access  public
	 * @param   int $id <parameter description>
	 * @return  \App\G6K\Model\Site|null the value of siteById
	 *
	 */
	public function getSiteById($id) {
		foreach ($this->sites as $site) {
			if ($site->getId() == $id) {
				return $site;
			}
		}
		throw new \Exception("Unable to find the site whose id is '" . $id . "'");
	}

	/**
	 * Retrieves a Database object by its ID
	 *
	 * @access  public
	 * @param   int $id <parameter description>
	 * @return  \App\G6K\Model\Database|null the value of databaseById
	 *
	 */
	public function getDatabaseById($id) {
		foreach ($this->databases as $database) {
			if ($database->getId() == $id) {
				return $database;
			}
		}
		throw new \Exception("Unable to find the database whose id is '" . $id . "'");
	}

	/**
	 * Retrieves a DataSource object by its ID
	 *
	 * @access  public
	 * @param   int $id <parameter description>
	 * @return  \App\G6K\Model\DataSource|null the value of datasourceById
	 *
	 */
	public function getDatasourceById($id) {
		foreach ($this->datasources as $datasource) {
			if ($datasource->getId() == $id) {
				return $datasource;
			}
		}
		throw new \Exception("Unable to find the datasource whose id is '" . $id . "'");
	}

	/**
	 * Retrieves a DataSource object by its name
	 *
	 * @access  public
	 * @param   string $name <parameter description>
	 * @return  \App\G6K\Model\DataSource|null the value of datasourceByName
	 *
	 */
	public function getDatasourceByName($name) {
		foreach ($this->datasources as $datasource) {
			if ($datasource->getName() == $name) {
				return $datasource;
			}
		}
		throw new \Exception("Unable to find the datasource whose name is '" . $name . "'");
	}

	/**
	 * Retrieves a Source object by its ID
	 *
	 * @access  public
	 * @param   int $id <parameter description>
	 * @return  \App\G6K\Model\Source|null the value of sourceById
	 *
	 */
	public function getSourceById($id) {
		foreach ($this->sources as $source) {
			if ($source->getId() == $id) {
				return $source;
			}
		}
		throw new \Exception("Unable to find the source whose id is '" . $id . "'");
	}

	/**
	 * Returns the warning attribute of this simulator
	 *
	 * @access  public
	 * @return  bool true if an warning has been issued, false otherwise
	 *
	 */
	public function isWarning() {
		return $this->warning;
	}

	/**
	 * Returns the warning attribute of this simulator
	 *
	 * @access  public
	 * @return  bool true if an warning has been issued, false otherwise
	 *
	 */
	public function getWarning() {
		return $this->warning;
	}

	/**
	 * Determines whether an warning has been issued or not
	 *
	 * @access  public
	 * @param   bool $warning true if an warning has been issued, false otherwise
	 * @return  void
	 *
	 */
	public function setWarning($warning) {
		$this->warning = $warning;
	}

	/**
	 * Returns the list of warning messages
	 *
	 * @access  public
	 * @return  array The list of warning messages
	 *
	 */
	public function getWarningMessages() {
		return $this->warningMessages;
	}

	/**
	 * Sets the list list of warning messages
	 *
	 * @access  public
	 * @param   array $warningMessages The list of warning messages
	 * @return  void
	 *
	 */
	public function setWarningMessages($warningMessages) {
		$this->warningMessages = $warningMessages;
	}

	/**
	 * Adds a warning message to the list of warning messages
	 *
	 * @access  public
	 * @param   string $warningMessage The warning message
	 * @return  void
	 *
	 */
	public function addWarningMessage($warningMessage) {
		if (! in_array($warningMessage, $this->warningMessages)) {
			$this->warningMessages[] = $warningMessage;
		}
	}

	/**
	 * Removes a warning message from the list of warning messages
	 *
	 * @access  public
	 * @param   int $index <parameter description>
	 * @return  void
	 *
	 */
	public function removeWarningMessage($index) {
		$this->warningMessages[$index] = null;
	}

	/**
	 * Returns the error attribute of this simulator
	 *
	 * @access  public
	 * @return  bool true if an error has been detected, false otherwise
	 *
	 */
	public function isError() {
		return $this->error;
	}

	/**
	 * Returns the error attribute of this simulator
	 *
	 * @access  public
	 * @return  bool true if an error has been detected, false otherwise
	 *
	 */
	public function getError() {
		return $this->error;
	}

	/**
	 * Determines whether an error has been detected or not
	 *
	 * @access  public
	 * @param   bool $error true if an error has been detected, false otherwise
	 * @return  void
	 *
	 */
	public function setError($error) {
		$this->error = $error;
	}

	/**
	 * Returns the list of error messages
	 *
	 * @access  public
	 * @return  array The list of error messages
	 *
	 */
	public function getErrorMessages() {
		return $this->errorMessages;
	}

	/**
	 * Sets the list of error messages
	 *
	 * @access  public
	 * @param   array $errorMessages The list of error messages
	 * @return  void
	 *
	 */
	public function setErrorMessages($errorMessages) {
		$this->errorMessages = $errorMessages;
	}

	/**
	 * Adds an error message to the list of error messages
	 *
	 * @access  public
	 * @param   string $errorMessage The error message
	 * @return  void
	 *
	 */
	public function addErrorMessage($errorMessage) {
		if (! in_array($errorMessage, $this->errorMessages)) {
			$this->errorMessages[] = $errorMessage;
		}
	}

	/**
	 * Removes an error message from the list of error messages.
	 *
	 * @access  public
	 * @param   int $index The index of the message in the list of error messages
	 * @return  void
	 *
	 */
	public function removeErrorMessage($index) {
		$this->errorMessages[$index] = null;
	}

	/**
	 * Returns the label (inside a HTML data) of a data item whose ID is the first element of the given array.
	 *
	 * @access  private
	 * @param   array $matches An array where the first element is the ID of the data item.
	 * @return  string The label inside a HTML data
	 *
	 */
	private function replaceIdByDataLabel($matches) {
		$id = $matches[1];
		$data = $this->getDataById($id);
		return $data !== null ? '<data value="' . $data->getId() . '" class="data">« ' . $data->getLabel() . ' »</data>' : "#" . $id;
	}

	/**
	 * Replaces, into the given text, the ID (prefixed with #) of all data by their label inside a HTML data.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $target The initial text
	 * @return  \App\G6K\Model\RichText|string The replaced text with data labels
	 *
	 */
	public function replaceByDataLabel($target) {
		$text = $target instanceof RichText ? $target->getContent() : $target;
		$result = preg_replace_callback(
			"/#(\d+)/", 
			array($this, 'replaceIdByDataLabel'),
			$text
		);
		if ($target instanceof RichText) {
			$target->setContent($result);
			return $target;
		} else {
			return $result;
		}
	}

	/**
	 * Returns a HTML dfn tag with the elements of the given array.
	 *
	 * @access  private
	 * @param   array $matches An array with the element of the footnote reference.
	 * @return  string The HTML dfn tag
	 *
	 */
	private function replaceByDfnTag($matches) {
		$text = $matches[1];
		$id = $matches[2];
		$title = $matches[3];
		return '<dfn class="foot-note-reference" data-footnote="' . $id . '" title="' . $title . '">« ' . $text . ' »</dfn>';
	}

	/**
	 * Replaces, into the given text, the footnote reference pattern string by the HTML dfn tag.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $target The initial text
	 * @return  \App\G6K\Model\RichText|string The replaced text with HTML dfn tag
	 *
	 */
	public function replaceByFootnoteTag($target) {
		$text = $target instanceof RichText ? $target->getContent() : $target;
		$result = preg_replace_callback(
			"/\[([^\^]+)\^(\d+)\(([^\)]+)\)\]/", 
			array($this, 'replaceByDfnTag'),
			$text
		);
		if ($target instanceof RichText) {
			$target->setContent($result);
			return $target;
		} else {
			return $result;
		}
	}

	/**
	 * Replaces all special patterns by the corresponding  html tag (data or dfn)
	 *
	 * @access  public
	 * @param   string $target The target text
	 * @return  string The result text
	 *
	 */
	public function replaceBySpecialTags($target) {
		$result = $this->replaceByDataLabel($target);
		$result = $this->replaceByFootnoteTag($result);
		return $result;
	}

	/**
	 * Loads into a Data object, the data item extracted from the XML file of this simulator
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $data The data item in XML format
	 * @return  \App\G6K\Model\Data The Data object
	 *
	 */
	protected function loadData($data) {
		$dataObj = new Data($this, (int)$data['id'], (string)$data['name']);
		$dataObj->setLabel((string)$data['label']);
		$dataObj->setType((string)$data['type']);
		$dataObj->setUnparsedMin((string)$data['min']);
		$dataObj->setUnparsedMax((string)$data['max']);
		$dataObj->setUnparsedDefault((string)$data['default']);
		$dataObj->setUnit((string)$data['unit']);
		$dataObj->setPattern((string)$data['pattern']);
		$dataObj->setRound(isset($data['round']) ? (int)$data['round'] : null);
		$dataObj->setContent((string)$data['content']);
		$dataObj->setSource((string)$data['source']);
		$dataObj->setUnparsedIndex((string)$data['index']);
		$dataObj->setMemorize((string)$data['memorize'] == '1');
		if ($data->Choices) {
			foreach ($data->Choices->children() as $child) {
				if ($child->getName() == "ChoiceGroup") {
					$choicegroup = $child;
					$choiceGroupObj = new ChoiceGroup((string)$choicegroup['label']);
					foreach ($choicegroup->Choice as $choice) {
						$choiceObj = new Choice($dataObj, (int)$choice['id'], (string)$choice['value'], (string)$choice['label']);
						$choiceGroupObj->addChoice($choiceObj);
					}
					if ($choicegroup->Source) {
						$source = $choicegroup->Source;
						$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], (string)$source['valueColumn'], (string)$source['labelColumn']);
						$choiceSourceObj->setIdColumn((string)$source['idColumn']);
						$choiceGroupObj->setChoiceSource($choiceSourceObj);
					}
					$dataObj->addChoice($choiceGroupObj);
				} elseif ($child->getName() == "Choice") {
					$choice = $child;
					$choiceObj = new Choice($dataObj, (int)$choice['id'], (string)$choice['value'], (string)$choice['label']);
					$dataObj->addChoice($choiceObj);
				} elseif ($child->getName() == "Source") {
					$source = $child;
					$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], (string)$source['valueColumn'], (string)$source['labelColumn']);
					$choiceSourceObj->setIdColumn((string)$source['idColumn']);
					$dataObj->setChoiceSource($choiceSourceObj);
					break; // only one source
				}
			}
		}
		if ($data->Table) {
			$table = $data->Table;
			$tableObj = new Table($dataObj, (int)$table['id']);
			$tableObj->setName((string)$table['name']);
			$tableObj->setLabel((string)$table['label']);
			$tableObj->setDescription(new RichText((string)$table->Description, (string)$table->Description['edition']));
			foreach ($table->Column as $column) {
				$columnObj = new Column($tableObj, (int)$column['id'], (string)$column['name'], (string)$column['type']);
				$columnObj->setLabel((string)$column['label']);
				$tableObj->addColumn($columnObj);
			}
			$dataObj->setTable($tableObj);
		}
		$dataObj->setDescription(new RichText((string)$data->Description, (string)$data->Description['edition']));
		return $dataObj;
	}

	/**
	 * Loads the XML definition file of the simulator into this Simulator object.
	 *
	 * @access  public
	 * @param   string $url The path of the XML definition file
	 * @return  void
	 *
	 */
	public function load($url) {
		$datasrc = $this->controller->databasesDir . '/DataSources.xml';
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$xml = $this->loadFileFromCache($url);
			$simulator = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
			$xml = $this->loadFileFromCache($datasrc);
			$datasources = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
		} else {
			$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
			$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		}
		$this->loadEntities($simulator, $datasources);
	}

	/**
	 * Loads the entities (elements) of the XML definition files of the simulator and data sources into this Simulator object.
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $simulator The XML definition file of the simulator
	 * @param   \SimpleXMLElement $datasources The XML definition file of the data sources
	 * @return  void
	 *
	 */
	protected function loadEntities(\SimpleXMLElement $simulator, \SimpleXMLElement $datasources) {
		foreach ($datasources->DataSource as $datasource) {
			$datasourceObj = new DataSource($this, (int)$datasource['id'], (string)$datasource['name'], (string)$datasource['type']);
			$datasourceObj->setUri((string)$datasource['uri']);
			$datasourceObj->setMethod((string)$datasource['method']);
			$datasourceObj->setDatabase((int)$datasource['database']);
			$datasourceObj->setDescription((string)$datasource->Description);
			foreach ($datasource->Namespace as $namespace) {
				$datasourceObj->addNamespace((string)$namespace['prefix'], (string)$namespace['uri']);
			}
			if ($datasourceObj->getType() == 'internal' || $datasourceObj->getType() == 'database') {
				foreach ($datasource->Table as $table) {
					foreach ($datasource->Table as $table) {
						$tableObj = new Table(null, (int)$table['id']);
						$tableObj->setName((string)$table['name']);
						$tableObj->setLabel((string)$table['label']);
						$tableObj->setDescription((string)$table->Description);
						foreach ($table->Column as $column) {
							$columnObj = new Column($tableObj, (int)$column['id'], (string)$column['name'], (string)$column['type']);
							$columnObj->setLabel((string)$column['label']);
							$tableObj->addColumn($columnObj);
						}
						$datasourceObj->addTable($tableObj);
					}
				}
			}
			$this->datasources[] = $datasourceObj;
		}
		if ($datasources->Databases) {
			$this->loadDatabases($datasources->Databases->Database);
		}
		$this->setName((string)$simulator["name"]);
		$this->setLabel((string)$simulator["label"]);
		$this->setCategory((string)$simulator["category"]);
		$this->setDefaultView((string)$simulator["defaultView"]);
		$this->setReferer((string)$simulator["referer"]);
		$this->setDynamic((string)$simulator['dynamic'] == '1');
		$this->setMemo((string)$simulator['memo'] == '1');
		if ((string)($simulator['locale']) != '') {
			$this->setLocale((string)($simulator['locale']));
		}
		if ((string)($simulator['timezone']) != '') {
			$this->setTimezone((string)($simulator['timezone']));
		}
		$this->setDescription(new RichText((string)$simulator->Description, (string)$simulator->Description['edition']));
		$this->setRelatedInformations(new RichText((string)$simulator->RelatedInformations, (string)$simulator->RelatedInformations['edition']));
		$this->setDateFormat((string)($simulator->DataSet['dateFormat']));
		$this->setDecimalPoint((string)($simulator->DataSet['decimalPoint']));
		if ((string)($simulator->DataSet['groupingSeparator']) != '') {
			$this->setGroupingSeparator((string)($simulator->DataSet['groupingSeparator']));
		}
		if ((string)($simulator->DataSet['groupingSize']) != '') {
			$this->setGroupingSize((int)($simulator->DataSet['groupingSize']));
		}
		$this->setMoneySymbol((string)($simulator->DataSet['moneySymbol']));
		$this->setSymbolPosition((string)($simulator->DataSet['symbolPosition']));
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					$datagroup = $child;
					$dataGroupObj = new DataGroup($this, (int)$datagroup['id'], (string)$datagroup['name']);
					$dataGroupObj->setLabel((string)$datagroup['label']);
					$dataGroupObj->setDescription(new RichText((string)$datagroup->Description, (string)$datagroup->Description['edition']));
					foreach ($datagroup->Data as $data) {
						$dataGroupObj->addData( $this->loadData($data));
					}
					$this->datas[] = $dataGroupObj;
				} elseif ($child->getName() == "Data") {
					$this->datas[] = $this->loadData($child);
				} 
			}
		}
		if ($simulator->Profiles) {
			$this->profiles = new Profiles($this);
			$this->profiles->setLabel((string)$simulator->Profiles['label']);
			foreach ($simulator->Profiles->Profile as $profile) {
				$profileObj = new Profile((int)$profile['id'], (string)$profile['name']);
				$profileObj->setLabel((string)$profile['label']);
				$profileObj->setDescription(new RichText((string)$profile->Description, (string)$profile->Description['edition']));
				foreach ($profile->Data as $data) {
					$profileObj->addData((int)$data['id'], (string)$data['default']);
				}
				$this->profiles->addProfile($profileObj);
			}
		}
		if ($simulator->Steps) {
			$step0 = false;
			foreach ($simulator->Steps->Step as $step) {
				$stepObj = new Step($this, (int)$step['id'], (string)$step['name'], (string)$step['label'], (string)$step['template']);
				if ($stepObj->getId() == 0) {
					$step0 = true;
				}
				$stepObj->setOutput((string)$step['output']);
				$stepObj->setDescription(new RichText((string)$step->Description, (string)$step->Description['edition']));
				$stepObj->setDynamic((string)$step['dynamic'] == '1');
				$stepObj->setPdfFooter((string)$step['pdfFooter'] == '1');
				foreach ($step->Panels->Panel as $panel) {
					$panelObj = new Panel($stepObj, (int)$panel['id']);
					$panelObj->setName((string)$panel['name']);
					$panelObj->setLabel((string)$panel['label']);
					foreach ($panel->children() as $block) {
						if ($block->getName() == "FieldSet") {
							$fieldset = $block;
							$fieldsetObj = new FieldSet($panelObj, (int)$fieldset['id']);
							$fieldsetObj->setLegend(new RichText((string)$fieldset->Legend, (string)$fieldset->Legend['edition']));
							if ((string)$fieldset['disposition'] != "") {
								$fieldsetObj->setDisposition((string)$fieldset['disposition']);
							}
							if ((string)$fieldset['display'] != "") {
								$fieldsetObj->setDisplay((string)$fieldset['display']);
							}
							if ((string)$fieldset['popinLink'] != "") {
								$fieldsetObj->setPopinLink((string)$fieldset['popinLink']);
							}
							foreach ($fieldset->children() as $child) {
								if ($child->getName() == "Columns") {
									foreach ($child->Column as $column) {
										$columnObj = new Column(null, (int)$column['id'], (string)$column['name'], (string)$column['type']);
										$columnObj->setLabel((string)$column['label']);
										$fieldsetObj->addColumn($columnObj);
									}
								} elseif ($child->getName() == "FieldRow") {
									$fieldrow = $child;
									$fieldRowObj = new FieldRow($fieldsetObj, (int)$fieldrow['id'], (string)$fieldrow['label']);
									$fieldRowObj->setColon((string)$fieldrow['colon'] == '' || (string)$fieldrow['colon'] == '1');
									$fieldRowObj->setHelp((string)$fieldrow['help'] == '1');
									$fieldRowObj->setEmphasize((string)$fieldrow['emphasize'] == '1');
									$fieldRowObj->setDataGroup((string)$fieldrow['datagroup']);
									foreach ($fieldrow->Field as $field) {
										$fieldRowObj->addField($this->loadField($field, $fieldsetObj));
									}
									$fieldsetObj->addField($fieldRowObj);
								} elseif ($child->getName() == "Field") {
									$fieldsetObj->addField($this->loadField($child, $fieldsetObj));
								}
							}
							$panelObj->addFieldSet($fieldsetObj);
						} elseif ($block->getName() == "BlockInfo") {
							$blockinfo = $block;
							$blockinfoObj = new BlockInfo($panelObj, (int)$blockinfo['id']);
							$blockinfoObj->setName((string)$blockinfo['name']);
							$blockinfoObj->setLabel((string)$blockinfo['label']);
							if ((string)$blockinfo['display'] != "") {
								$blockinfoObj->setDisplay((string)$blockinfo['display']);
							}
							if ((string)$blockinfo['popinLink'] != "") {
								$blockinfoObj->setPopinLink((string)$blockinfo['popinLink']);
							}
							foreach ($blockinfo->Chapter as $chapter) {
								$chapterObj = new Chapter($blockinfoObj, (int)$chapter['id']);
								$chapterObj->setName((string)$chapter['name']);
								$chapterObj->setLabel((string)$chapter['label']);
								$chapterObj->setIcon((string)$chapter['icon']);
								$chapterObj->setCollapsible((string)$chapter['collapsible'] == '1');
								foreach ($chapter->Section as $section) {
									$sectionObj = new Section($chapterObj, (int)$section['id']);
									$sectionObj->setName((string)$section['name']);
									$sectionObj->setLabel((string)$section['label']);
									$sectionObj->setContent(new RichText((string)$section->Content, (string)$section->Content['edition']));
									$sectionObj->setAnnotations(new RichText((string)$section->Annotations, (string)$section->Annotations['edition']));
									$chapterObj->addSection($sectionObj);
								}
								$blockinfoObj->addChapter($chapterObj);
							}
							$panelObj->addFieldSet($blockinfoObj);
						}
					}
					$stepObj->addPanel($panelObj);
				}
				foreach ($step->ActionList as $actionList) {
					foreach ($actionList as $action) {
						$actionObj = new Action($stepObj, (string)$action['name'], (string)$action['label']);
						$actionObj->setClass((string)$action['class']);
						$actionObj->setWhat((string)$action['what']);
						$actionObj->setFor((string)$action['for']);
						$actionObj->setUri((string)$action['uri']);
						if ((string)$action['location'] != "") {
							$actionObj->setLocation((string)$action['location']);
						}
						if ((string)$action['shape'] != "") {
							$actionObj->setShape((string)$action['shape']);
						}
						$stepObj->addAction($actionObj);
					}
				}
				foreach ($step->FootNotes as $footnotes) {
					$footnotesObj = new FootNotes($stepObj);
					if ((string)$footnotes['position'] != "") {
						$footnotesObj->setPosition((string)$footnotes['position']);
					}
					foreach ($footnotes as $footnote) {
						$footnoteObj = new FootNote($stepObj, (int)$footnote['id']);
						$footnoteObj->setText(new RichText((string)$footnote, (string)$footnote['edition']));
						$footnotesObj->addFootNote($footnoteObj);
					}
					$stepObj->setFootNotes($footnotesObj);
				}
				$this->steps[] = $stepObj;
			}
			if (!$step0) {
				$this->setDynamic(false);
			}
		}
		if ($simulator->Sites) {
			foreach ($simulator->Sites->Site as $site) {
				$siteObj = new Site($this, (int)$site['id'], (string)$site['name'], (string)$site['home']);
				$this->sites[] = $siteObj;
			}
		}
		if ($simulator->Sources) {
			$this->loadSources($simulator->Sources->Source);
		}

		if ($simulator->BusinessRules) {
			foreach ($simulator->BusinessRules->BusinessRule as $brule) {
				$businessRuleObj = new BusinessRule($this, 'rule-'.mt_rand(), (int)$brule['id'], (string)$brule['name']);
				$businessRuleObj->setLabel((string)$brule['label']);
				$businessRuleObj->setConditions((string)$brule->Conditions['value']);
				if (preg_match_all("/#(\d+)/", (string)$brule->Conditions['value'], $matches)) {
					foreach($matches[1] as $id) {
						$data = $this->getDataById($id);
						$data->addRuleDependency((int)$brule['id']);
					}
				}
				if ($brule->Conditions->Condition) {
					$businessRuleObj->setConnector($this->loadConnector($brule->Conditions->Condition));
				} else if ($brule->Conditions->Connector) {
					$businessRuleObj->setConnector($this->loadConnector($brule->Conditions->Connector));
				}
				foreach ($brule->IfActions->Action as $action) {
					$businessRuleObj->addIfAction($this->loadRuleAction($action));
					if ((string)$action['name'] == "setAttribute" && preg_match_all("/#(\d+)/", (string)$action['value'], $matches)) {
						foreach($matches[1] as $id) {
							$data = $this->getDataById($id);
							$data->addRuleDependency((int)$brule['id']);
						}
					}
				}
				foreach ($brule->ElseActions->Action as $action) {
					$businessRuleObj->addElseAction($this->loadRuleAction($action));
					if ((string)$action['name'] == "setAttribute" && preg_match_all("/#(\d+)/", (string)$action['value'], $matches)) {
						foreach($matches[1] as $id) {
							$data = $this->getDataById($id);
							$data->addRuleDependency((int)$brule['id']);
						}
					}
				}
				$this->businessrules[] = $businessRuleObj;
			}
		}
	}

	/**
	 * Loads into a Field object, the field extracted from the XML file of this simulator
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $field The field in XML format
	 * @param   \App\G6K\Model\FieldSet $fieldsetObj The field set that contains this field
	 * @return  \App\G6K\Model\Field The Field object
	 *
	 */
	protected function loadField(\SimpleXMLElement $field, FieldSet $fieldsetObj) {
		$fieldObj = new Field($fieldsetObj, (int)$field['position'], (int)$field['data'], (string)$field['label']);
		$fieldObj->setUsage((string)$field['usage']);
		$fieldObj->setPrompt((string)$field['prompt']);
		$fieldObj->setNewline((string)$field['newline'] == '' || (string)$field['newline'] == '1');
		$fieldObj->setRequired((string)$field['required'] == '1');
		$fieldObj->setVisibleRequired((string)$field['visibleRequired'] == '1');
		$fieldObj->setColon((string)$field['colon'] == '' || (string)$field['colon'] == '1');
		$fieldObj->setUnderlabel((string)$field['underlabel'] == '1');
		$fieldObj->setHelp((string)$field['help'] == '1');
		$fieldObj->setEmphasize((string)$field['emphasize'] == '1');
		$fieldObj->setExplanation((string)$field['explanation']);
		$fieldObj->setExpanded((string)$field['expanded'] == '1');
		$fieldObj->setWidget((string)$field['widget']);
		if ($field->PreNote) {
			$noteObj = new FieldNote($fieldObj);
			$noteObj->setText(new RichText((string)$field->PreNote, (string)$field->PreNote['edition']));
			$fieldObj->setPreNote($noteObj);
		}
		if ($field->PostNote) {
			$noteObj = new FieldNote($fieldObj);
			$noteObj->setText(new RichText((string)$field->PostNote, (string)$field->PostNote['edition']));
			$fieldObj->setPostNote($noteObj);
		}
		return $fieldObj;
	}

	/**
	 * Loads into a RuleAction object, the business rule action extracted from the XML file of this simulator
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $action The business rule action in XML format
	 * @return  \App\G6K\Model\RuleAction The RuleAction object
	 *
	 */
	protected function loadRuleAction(\SimpleXMLElement $action) {
		$ruleActionObj = new RuleAction((int)$action['id'], (string)$action['name']);
		$ruleActionObj->setTarget((string)$action['target']);
		$ruleActionObj->setData((int)$action['data']);
		$ruleActionObj->setDatagroup((string)$action['datagroup']);
		$ruleActionObj->setStep((string)$action['step']);
		$ruleActionObj->setPanel((string)$action['panel']);
		$ruleActionObj->setFieldset((string)$action['fieldset']);
		$ruleActionObj->setColumn((string)$action['column']);
		$ruleActionObj->setFieldrow((string)$action['fieldrow']);
		$ruleActionObj->setField((string)$action['field']);
		$ruleActionObj->setBlockinfo((string)$action['blockinfo']);
		$ruleActionObj->setChapter((string)$action['chapter']);
		$ruleActionObj->setSection((string)$action['section']);
		$ruleActionObj->setPrenote((string)$action['prenote']);
		$ruleActionObj->setPostnote((string)$action['postnote']);
		$ruleActionObj->setFootnote((string)$action['footnote']);
		$ruleActionObj->setAction((string)$action['action']);
		$ruleActionObj->setChoice((string)$action['choice']);
		$ruleActionObj->setValue((string)$action['value']);
		return $ruleActionObj;
	}

	/**
	 *  Loads into Source and Parameter objects, all the used sources extracted from the XML file of this simulator
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $sources The sources in XML format
	 * @return  void
	 *
	 */
	protected function loadSources(\SimpleXMLElement $sources) {
		foreach ($sources as $source) {
			$sourceObj = new Source($this, (int)$source['id'], (string)$source['datasource'], (string)$source['returnType']);
			$sourceObj->setLabel((string)$source['label']);
			$sourceObj->setRequest((string)$source['request']);
			if ((string)$source['requestType'] != '') {
				$sourceObj->setRequestType((string)$source['requestType']);
			}
			$sourceObj->setSeparator((string)$source['separator']);
			$sourceObj->setDelimiter((string)$source['delimiter']);
			$sourceObj->setReturnPath((string)$source['returnPath']);
			foreach ($source->Parameter as $parameter) {
				$parameterObj = new Parameter($sourceObj, (string)$parameter['type']);
				$parameterObj->setOrigin((string)$parameter['origin']);
				$parameterObj->setName((string)$parameter['name']);
				$parameterObj->setFormat((string)$parameter['format']);
				$parameterObj->setData((int)$parameter['data']);
				$parameterObj->setConstant((string)$parameter['constant']);
				$parameterObj->setOptional((string)$parameter['optional'] == '1');
				$sourceObj->addParameter($parameterObj);
			}
			$this->sources[] = $sourceObj;
		}
	}

	/**
	 * Loads into Database objects, all the databases declaration extracted from DataSources.xml
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $databases The databases declaration in XML format
	 * @return  void
	 *
	 */
	protected function loadDatabases(\SimpleXMLElement $databases) {
		foreach ($databases as $database) {
			$databaseObj = new Database($this, $this->controller->databasesDir, (int)$database['id'], (string)$database['type'], (string)$database['name']);
			$databaseObj->setLabel((string)$database['label']);
			$databaseObj->setHost((string)$database['host']);
			$databaseObj->setPort((int)$database['port']);
			$databaseObj->setUser((string)$database['user']);
			if ((string)$database['password'] != '') {
				$databaseObj->setPassword((string)$database['password']);
			} elseif ((string)$database['user'] != '') {
				try {
					$user = $this->controller->getParameter('database_user');
					if ((string)$database['user'] == $user) {
						$databaseObj->setPassword($this->controller->getParameter('database_password'));
					}
				} catch (\Exception $e) {
				}
			}
			$this->databases[] = $databaseObj;
		}
	}

	/**
	 *  Loads into a Connector or a Condition object, the business rule connector extracted from the XML file of this simulator
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $connector The business rule connector in XML format
	 * @param   \App\G6K\Model\Connector|null $parentConnector (default: null) The Connector object that contains this connector or this condition
	 * @return  \App\G6K\Model\Condition|\App\G6K\Model\Connector The Connector or the Condition object
	 *
	 */
	protected function loadConnector(\SimpleXMLElement $connector, $parentConnector = null) {
		if ($connector->getName() == 'Condition') {
			return new Condition($this, $parentConnector, (string)$connector['operand'], (string)$connector['operator'], (string)$connector['expression']);
		}
		$connectorObj = new Connector($this, (string)$connector['type']);
		foreach ($connector->children() as $child) {
			$connectorObj->addCondition($this->loadConnector($child, $connectorObj));
		}
		return $connectorObj;
	}

	/**
	 * Loads Data, DataSource, Source objects in response of the Ajax request using route path : /{simu}/Default/source
	 *
	 * @access  public
	 * @param   string $url The path of the XML definition file of this sumulator
	 * @return  void
	 *
	 */
	public function loadForSource($url) {
		$datasrc = $this->controller->databasesDir . '/DataSources.xml';
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$xml = $this->loadFileFromCache($url);
			$simulator = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
			$xml = $this->loadFileFromCache($datasrc);
			$datasources = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
		} else {
			$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
			$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		}
		$this->setDateFormat((string)($simulator->DataSet['dateFormat']));
		$this->setDecimalPoint((string)($simulator->DataSet['decimalPoint']));
		if ((string)($simulator->DataSet['groupingSeparator']) != '') {
			$this->setGroupingSeparator((string)($simulator->DataSet['groupingSeparator']));
		}
		if ((string)($simulator->DataSet['groupingSize']) != '') {
			$this->setGroupingSize((int)($simulator->DataSet['groupingSize']));
		}
		$this->setMoneySymbol((string)($simulator->DataSet['moneySymbol']));
		$this->setSymbolPosition((string)($simulator->DataSet['symbolPosition']));
		if ((string)($simulator['locale']) != '') {
			$this->setLocale((string)($simulator['locale']));
		}
		if ((string)($simulator['timezone']) != '') {
			$this->setTimezone((string)($simulator['timezone']));
		}
		foreach ($datasources->DataSource as $datasource) {
			$datasourceObj = new DataSource($this, (int)$datasource['id'], (string)$datasource['name'], (string)$datasource['type']);
			$datasourceObj->setUri((string)$datasource['uri']);
			$datasourceObj->setMethod((string)$datasource['method']);
			$datasourceObj->setDatabase((int)$datasource['database']);
			$datasourceObj->setDescription((string)$datasource->Description);
			$this->datasources[] = $datasourceObj;
		}
		if ($datasources->Databases) {
			$this->loadDatabases($datasources->Databases->Database);
		}
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					foreach ($child->Data as $data) {
						$dataObj = new Data($this, (int)$data['id'], (string)$data['name']);
						$dataObj->setLabel((string)$data['label']);
						$dataObj->setType((string)$data['type']);
						$this->datas[] = $dataObj;
					}
				} elseif ($child->getName() == "Data") {
					$dataObj = new Data($this, (int)$child['id'], (string)$child['name']);
					$dataObj->setLabel((string)$child['label']);
					$dataObj->setType((string)$child['type']);
					$this->datas[] = $dataObj;
				}
			}
		}
		if ($simulator->Sources) {
			$this->loadSources($simulator->Sources->Source);
		}
	}

	/**
	 * Adds a dependency for the data item whose ID is in the first element of the given array
	 *
	 * @access  private
	 * @param   array $matches The given array
	 * @return  string The name of the data item
	 *
	 */
	private function addDependency ($matches) {
		$id = $matches[1];
		$dependency = $this->name;
		if (! isset($this->datas[$id][$this->dependencies])) {
				$this->datas[$id][$this->dependencies] = array();
		}
		foreach ($this->datas[$id][$this->dependencies] as $d) {
			if ($d == $dependency) {
				return $this->datas[$id]['name'];
			}
		}
		$this->datas[$id][$this->dependencies][] = $dependency;
		return $this->datas[$id]['name'];
	}

	/**
	 * Adds a note (field pre-note, field post-note, footnote) dependency for the data item is in the first element of the given array
	 *
	 * @access  private
	 * @param   array $matches <parameter description>
	 * @return  string The name of the data surrounded by '#(' and ')'
	 *
	 */
	private function addNoteDependency ($matches) {
		return "#(".$this->addDependency ($matches).")";
	}

	/**
	 * Returns the name surrounded by '#(' and ')' of the data item whose ID is in the first element of the given array
	 *
	 * @access  private
	 * @param   array $matches The given array
	 * @return  string The name of the data surrounded by '#(' and ')'
	 *
	 */
	private function replaceDataIdByName($matches) {
		$id = $matches[1];
		return $this->datas[$id] ? "#(" . $this->datas[$id]['name'] . ")" : "#" . $id;
	}

	/**
	 * Replaces, into the given text, the ID (prefixed with # or inside a HTML data) of all data by their name surrounded by '#(' and ')'.
	 *
	 * @access  private
	 * @param   string $target The initial text
	 * @return  string The replaced text with data names
	 *
	 */
	private function replaceIdByName($target) {
		$result = preg_replace_callback(
			'/\<data\s+[^\s]*\s*value="(\d+)"[^\>]*\>[^\<]+\<\/data\>/',
			array($this, 'replaceDataIdByName'),
			$target
		);
		return preg_replace_callback(
			"/#(\d+)/", 
			array($this, 'replaceDataIdByName'),
			$result
		);
	}

	/**
	 * Returns the name of the data item whose ID is in the first element of the given array
	 *
	 * @access  private
	 * @param   array $matches Tha given array
	 * @return  string the name of the data item
	 *
	 */
	private function replaceIdByDataName($matches) {
		$id = $matches[1];
		return $this->datas[$id] ? $this->datas[$id]['name']: "#" . $id;
	}

	/**
	 * Replaces, into the given text, the ID (prefixed with # or inside a HTML data) of all data by their name.
	 *
	 * @access  private
	 * @param   string $target The initial text
	 * @return  string The replaced text with data names
	 *
	 */
	private function replaceByDataName($target) {
		return preg_replace_callback(
			"/#(\d+)/", 
			array($this, 'replaceIdByDataName'),
			$target
		);
	}

	/**
	 * Converts the lines of the given text into HTML paragraphs
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $string <parameter description>
	 * @return  \App\G6K\Model\RichText|string <description of the return value>
	 *
	 */
	public function paragraphs ($string) {
		if ($string instanceof RichText && ! $string->isManual()) {
			$result = preg_replace("/\[([^\^]+)\^(\d+)\(([^\]]+)\)\]/", '<a href="#foot-note-$2" title="$3">$1</a>', $string->getContent());
			$result = preg_replace("/\[([^\^]+)\^(\d+)\]/", '<a href="#foot-note-$2" title="' . $this->controller->getTranslator()->trans("Reference to the footnote %footnote%", array('%footnote%' => '$2')) . ' ">$1</a>', $result);
			$string->setContent($result);
			return $string;
		}
		$text = $string instanceof RichText ? $string->getContent() : $string;
		$blocktags = array('address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'output', 'pre', 'section', 'table', 'tfoot', 'ul', 'video');
		$paragraphs = explode("\n", trim($text));
		$result = '';
		foreach($paragraphs as $paragraph) {
			$paragraph = trim($paragraph);
			if ($paragraph == '') {
				$result .= '<br>';
			} else {
				$result .= '<p>' . $paragraph . '</p>';
			}
		}
		foreach($blocktags as $tag) {
			$result = preg_replace("|<p>\s*<" . $tag . ">|", "<" . $tag . ">", $result);
			$result = preg_replace("|<" . $tag . ">\s*<\/p>|", "<" . $tag . ">", $result);
			$result = preg_replace("|<p>\s*<\/" . $tag . ">|", "</" . $tag . ">", $result);
			$result = preg_replace("|<\/" . $tag . ">\s*<\/p>|", "</" . $tag . ">", $result);
		}
		$result = preg_replace("/\[([^\^]+)\^(\d+)\(([^\]]+)\)\]/", '<a href="#foot-note-$2" title="$3">$1</a>', $result);
		$result = preg_replace("/\[([^\^]+)\^(\d+)\]/", '<a href="#foot-note-$2" title="' . $this->controller->getTranslator()->trans("Reference to the footnote %footnote%", array('%footnote%' => '$2')) . ' ">$1</a>', $result);
		return $result;
	}

	/**
	 * Converts a field extracted from the XML file of this simulator into an associative array for encoding in JSON format.
	 * Also completes the list of data dependencies
	 *
	 * @access  private
	 * @param   \SimpleXMLElement $field <parameter description>
	 * @return  array <description of the return value>
	 *
	 */
	private function fieldProperties ($field) {
		$id = (int)$field['data'];
		$nfield = array(
			'data' => $this->name,
			'label' => (string)$field['label'],
			'usage' => (string)$field['usage']
		);
		if ((string)$field['prompt'] != "") {
			$nfield['prompt'] = (string)$field['prompt'];
		}
		if ((string)$field['required'] == '' || (string)$field['required'] == '1') {
			$nfield['required'] = '1';
		}
		if ((string)$field['visibleRequired'] == '' || (string)$field['visibleRequired'] == '1') {
			$nfield['visibleRequired'] = '1';
		}
		if ((string)$field['widget'] != "") {
			$nfield['widget'] = (string)$field['widget'];
		}
		$this->dependencies = 'fieldDependencies';
		if ((string)$field['explanation'] != "") {
			$this->datas[$id]['unparsedExplanation'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$field['explanation']
			);
		}
		$this->dependencies = 'noteDependencies';
		if ($field->PreNote) {
			$nfield['prenote'] = $this->paragraphs(preg_replace_callback(
				'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
				array($this, 'addNoteDependency'), 
				(string)$field->PreNote
			));
		}
		if ($field->PostNote) {
			$nfield['postnote'] = $this->paragraphs(preg_replace_callback(
				'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
				array($this, 'addNoteDependency'),
				(string)$field->PostNote
			));
		}
		return $nfield;
	}

	/**
	 * Converts a data item extracted from the XML file of this simulator into an associative array for encoding in JSON format.
	 * Also completes the list of sources dependencies
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $data The data item
	 * @param   array &$sources The list of sources dependencies
	 * @return  void
	 *
	 */
	protected function toJSONData($data, &$sources) {
		$id = (int)$data['id'];
		$this->datas[$id]['type'] = (string)$data['type'];
		if ((string)$data['round'] != "" && in_array((string)$data['type'], ['number', 'money', 'percent'])) {
			$this->datas[$id]['round'] = (int)$data['round'];
		}
		if ((string)$data['memorize'] != "") {
			$this->datas[$id]['memorize'] = (string)$data['memorize'];
		}
		if ((string)$data['pattern'] != "") {
			$this->datas[$id]['pattern'] = (string)$data['pattern'];
		}
		$this->name = $this->datas[$id]['name'];
		$this->dependencies = 'defaultDependencies';
		if ((string)$data['default'] != "") {
			$this->datas[$id]['unparsedDefault'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$data['default']
			);
		}
		$this->dependencies = 'minDependencies';
		if ((string)$data['min'] != "") {
			$this->datas[$id]['unparsedMin'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$data['min']
			);
		}
		$this->dependencies = 'maxDependencies';
		if ((string)$data['max'] != "") {
			$this->datas[$id]['unparsedMax'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$data['max']
			);
		}
		$this->dependencies = 'contentDependencies';
		if ((string)$data['content'] != "") {
			$this->datas[$id]['unparsedContent'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$data['content']
			);
		}
		$this->dependencies = 'usedSourceDependencies';
		if ((string)$data['source'] != "") {
			$this->datas[$id]['unparsedSource'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$data['source']
			);
		}
		$this->dependencies = 'indexDependencies';
		if ((string)$data['index'] != "") {
			$this->datas[$id]['unparsedIndex'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$data['index']
			);
		}
		if ($data->Choices) {
			$choices = array();
			foreach ($data->Choices->children() as $child) {
				if ($child->getName() == "ChoiceGroup") {
					$choicegroup = $child;
					foreach ($choicegroup->Choice as $choice) {
						$choices[] = array(
							(string)$choice['value'] => (string)$choice['label']
						);
					}
					if ($choicegroup->Source) {
						$source = $choicegroup->Source;
						$sid = (int)$source['id'];
						$this->datas[$id]['choices']['source'] = array (
							'id' => $sid,
							'valueColumn' => (string)$source['valueColumn'],
							'labelColumn' => (string)$source['labelColumn']
						);
						if (! isset($sources[$sid]['choiceDependencies'])) {
							$sources[$sid]['choiceDependencies'] = array();
						}
						$sources[$sid]['choiceDependencies'][] = $this->datas[$id]['name'];
					}
				} elseif ($child->getName() == "Choice") {
					$choice = $child;
					$choices[] = array(
						(string)$choice['value'] => (string)$choice['label']
					);
				} elseif ($child->getName() == "Source") {
					$source = $child;
					$sid = (int)$source['id'];
					$this->datas[$id]['choices']['source'] = array (
						'id' => $sid,
						'valueColumn' => (string)$source['valueColumn'],
						'labelColumn' => (string)$source['labelColumn']
					);
					if (! isset($sources[$sid]['choiceDependencies'])) {
						$sources[$sid]['choiceDependencies'] = array();
					}
					$sources[$sid]['choiceDependencies'][] = $this->datas[$id]['name'];
					break; // only one source
				}
			}
			if (count($choices) > 0) {
				$this->datas[$id]['choices'] = $choices;
			}
		}
	}

	/**
	 * Converts to an associative array representing one action (in the "then" part or the the "else" part) of a business rule extracted from the XML file.
	 * Also completes the list of data dependencies
	 *
	 * @access  private
	 * @param   int $ruleID The ID of the rule
	 * @param   \SimpleXMLElement $action The action
	 * @param   array &$dataset The list of data dependencies
	 * @return  array The associative array
	 *
	 */
	private function actionData($ruleID, \SimpleXMLElement $action, &$dataset) {
		$target = (string)$action['target'];
		switch ((string)$action['name']) {
			case 'notifyWarning':
				$clause = array(
					'name' => 'action-select',
					'value' => 'notifyWarning',
					'fields' => array(
						array('name' => 'message', 'value' => $this->replaceIdByName((string)$action['value'])),
						array('name' => 'target', 'value' => $target)
					)
				);
				switch ($target) {
					case 'data':
						$clause['fields'][1]['fields'] = array(
							array('name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'])
						);
						break;
					case 'datagroup':
						$clause['fields'][1]['fields'] = array(
							array('name' => 'datagroupName', 'value' => (string)$action['datagroup'])
						);
						break;
					case 'dataset':
						break;
				}
				break;
			case 'notifyError':
				$clause = array(
					'name' => 'action-select',
					'value' => 'notifyError',
					'fields' => array(
						array('name' => 'message', 'value' => $this->replaceIdByName((string)$action['value'])),
						array('name' => 'target', 'value' => $target)
					)
				);
				switch ($target) {
					case 'data':
						$clause['fields'][1]['fields'] = array(
							array('name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'])
						);
						break;
					case 'datagroup':
						$clause['fields'][1]['fields'] = array(
							array('name' => 'datagroupName', 'value' => (string)$action['datagroup'])
						);
						break;
					case 'dataset':
						break;
				}
				break;
			case 'hideObject':
			case 'showObject':
				switch ($target) {
					case 'field':
					case 'prenote':
					case 'postnote':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId',	'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
														array('name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => array(
																array('name' => 'fieldId', 'value' => (string)$action[$target])
															)
														)
													)
												)
											)
										)
									)
								)
							)
						);
						break;
					case 'section':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId',	'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
														array('name' => 'blockinfoId', 'value' => (string)$action['blockinfo'], 'fields' => array(
																array('name' => 'chapterId', 'value' => (string)$action['chapter'], 'fields' => array(
																		array('name' => 'sectionId', 'value' => (string)$action[$target])
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								)
							)
						);
						break;
					case 'chapter':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId',	'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
														array('name' => 'blockinfoId', 'value' => (string)$action['blockinfo'], 'fields' => array(
																array('name' => 'chapterId', 'value' => (string)$action[$target])
															)
														)
													)
												)
											)
										)
									)
								)
							)
						);
						break;
					case 'fieldset':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId', 'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
														array('name' => 'fieldsetId', 'value' => (string)$action[$target])
													)
												)
											)
										)
									)
								)
							)
						);
						break;
					case 'fieldrow':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId',	'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
														array('name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => array(
																array('name' => 'fieldrowId', 'value' => (string)$action[$target])
															)
														)
													)
												)
											)
										)
									)
								)
							)
						);
						break;
					case 'blockinfo':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId', 'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
														array('name' => 'blockinfoId', 'value' => (string)$action[$target])
													)
												)
											)
										)
									)
								)
							)
						);
						break;
					case 'panel':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId', 'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'panelId', 'value' => (string)$action[$target])
											)
										)
									)
								)
							)
						);
						break;
					case 'step':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId', 'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action[$target])
									)
								)
							)
						);
						break;
					case 'footnote':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId', 'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'footnoteId', 'value' => (string)$action[$target])
											)
										)
									)
								)
							)
						);
						break;
					case 'action':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId', 'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'actionId', 'value' => (string)$action[$target])
											)
										)
									)
								)
							)
						);
						break;
					case 'choice':
						$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
								array('name' => 'objectId', 'value' => $target, 'fields' => array(
										array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
												array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
														array('name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => array(
																array('name' => 'fieldId', 'value' => (string)$action['field'], 'fields' => array(
																		array('name' => 'choiceId', 'value' => (string)$action[$target])
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								)
							)
						);
						break;
				}
				break;
			case 'setAttribute':
				$clause = array('name' => 'action-select', 'value' => 'setAttribute', 'fields' => array(
						array('name' => 'attributeId', 'value' => $target, 'fields' => array(
								array('name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'], 'fields' => array(
										array('name' => 'newValue', 'value' => $this->replaceByDataName((string)$action['value']))
									)
								)
							)
						)
					)
				);
				if (preg_match_all("/#(\d+)/", (string)$action['value'], $matches)) {
					foreach($matches[1] as $id) {
						$name = $this->datas[$id]['name'];
						if (! isset($dataset[$name]['rulesActionsDependency'])) {
							$dataset[$name]['rulesActionsDependency'] = array();
						}
						$dataset[$name]['rulesActionsDependency'][] = $ruleID;
					}
				}
				break;
			case 'unsetAttribute':
				$clause = array('name' => 'action-select', 'value' => 'unsetAttribute', 'fields' => array(
						array('name' => 'attributeId', 'value' => $target, 'fields' => array(
								array('name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'])
							)
						)
					)
				);
				break;
		}
		return $clause;
	}

	/**
	 * Converts the XML definition file of this simulator to JSON for use in Javascript for the given step.
	 *
	 * @access  public
	 * @param   string $url The path of the XML definition file
	 * @param   int $stepId (default: 0) The simulation step
	 * @return  string The definition of this simulator in JSON format
	 *
	 */
	public function toJSON($url, $stepId = 0) {
		$json = array();
		$datas = array();
		$profiles = array();
		$sources = array();
		$rules = array();
		$dataIdMax = 0;
		$datasrc = $this->controller->databasesDir . '/DataSources.xml';
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$xml = $this->loadFileFromCache($url);
			$simulator = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
			$xml = $this->loadFileFromCache($datasrc);
			$datasources = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
		} else {
			$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
			$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		}
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					foreach ($child->Data as $data) {
						$id = (int)$data['id'];
						$this->datas[$id]['id'] = $id;
						$this->datas[$id]['name'] = (string)$data['name'];
						$this->datas[$id]['datagroup'] = (string)$child['name'];
						if ((int)$data['id'] > $dataIdMax) {
							$dataIdMax = (int)$data['id'];
						}
					}
				} elseif ($child->getName() == "Data") {
					$id = (int)$child['id'];
					$this->datas[$id]['id'] = $id;
					$this->datas[$id]['name'] = (string)$child['name'];
					if ((int)$child['id'] > $dataIdMax) {
						$dataIdMax = (int)$child['id'];
					}
				}
			}
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					foreach ($child->Data as $data) {
						$this->toJSONData($data, $sources);
					}
				} elseif ($child->getName() == "Data") {
					$this->toJSONData($child, $sources);
				}
			}
		}
		$json["name"] = (string)$simulator["name"];
		$json["label"] = (string)$simulator["label"];
		$json["category"] = (string)$simulator["category"];
		$json["defaultView"] = (string)$simulator["defaultView"];
		$json["referer"] = (string)$simulator["referer"];
		if ((string)$simulator["memo"] != "") {
			$json["memo"] = (string)$simulator["memo"];
		}
		$json["description"] = $this->paragraphs((string)$simulator->Description);
		if ($simulator->Profiles) {
			$profiles['label'] = (string)$simulator->Profiles['label'];
			$profs = array();
			foreach ($simulator->Profiles->Profile as $profile) {
				$pdatas = array();
				foreach ($profile->Data as $data) {
					$id = (int)$data['id'];
					$pdatas[] = array(
						'id' => $id,
						'name' => $this->datas[$id]['name'],
						'default' => (string)$data['default']
					);
				}
				$profs[] = array(
					'id' => (int)$profile['id'],
					'name' => (string)$profile['name'],
					'label' => (string)$profile['label'],
					'description' => array(
						'content' => $this->paragraphs((string)$profile->Description),
						'edition' => (string)$profile->Description['edition']
					),
					'datas' => $pdatas
				);
			}
			$profiles['profiles'] = $profs;
		}
		$panels = array();
		$actions = array();
		$footnotes = array();
		$usages = array();
		$nstep = array();
		if ($simulator->Steps) {
			foreach ($simulator->Steps->Step as $step) {
				if ((int)$step['id'] == $stepId) {
					$nstep = array (
						'name' => (string)$step['name'],
						'label' => (string)$step['label']
					);
					foreach ($step->Panels->Panel as $panel) {
						foreach ($panel->children() as $block) {
							if ($block->getName() == "FieldSet") {
								$fieldset = $block;
								$fields = array();
								foreach ($fieldset->children() as $child) {
									if ($child->getName() == "FieldRow") {
										$fieldrow = $child;
										foreach ($fieldrow->Field as $field) {
											$id = (int)$field['data'];
											$data = $this->datas[$id];
											if (!isset($usages[$data['name']])) {
												$usages[$data['name']] = (string)$field['usage'];
												$this->name = $data['name'];
												if ((string)$field['usage'] == 'input') {
													$this->datas[$id]['inputField'] = array(
														(string)$step['name']."-panel-".$panel['id']."-fieldset-".$fieldset['id'],
														count($fields)
													);
												}
												$fields[] = $this->fieldProperties($field);
											}
										}
									} elseif ($child->getName() == "Field") {
										$field = $child;
										$id = (int)$field['data'];
										$data = $this->datas[$id];
										if (!isset($usages[$data['name']])) {
											$usages[$data['name']] = (string)$field['usage'];
											$this->name = $data['name'];
											if ((string)$field['usage'] == 'input') {
												$this->datas[$id]['inputField'] = array(
													(string)$step['name']."-panel-".$panel['id']."-fieldset-".$fieldset['id'],
													count($fields)
												);
											}
											$fields[] = $this->fieldProperties($field);
										}
									}
								}
								$nfieldset = array(
									'id'	 => (int)$fieldset['id'],
									'legend' => array(
										'content' => (string)$fieldset->Legend,
										'edition' => (string)$fieldset->Legend['edition']
									),
									'display' => (string)$fieldset['display'],
									'popinLink' => (string)$fieldset['popinLink'],
									'fields' => $fields
								);
								$this->name = (string)$step['name']."-panel-".$panel['id']."-fieldset-".$fieldset['id'];
								$panels[$this->name] = $nfieldset;
							} elseif ($block->getName() == "BlockInfo") {
								$blockinfo = $block;
								$chapters = array();
								foreach ($blockinfo->Chapter as $chapter) {
									$sections = array();
									$this->dependencies = 'sectionContentDependencies';
									foreach ($chapter->Section as $section) {
										$this->name = (string)$step['name']."-panel-".$panel['id']."-blockinfo-".$blockinfo['id']."-chapter-".$chapter['id']."-section-".$section['id'];
										$content = preg_replace_callback(
											'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
											array($this, 'addNoteDependency'), 
											 $this->paragraphs((string)$section->Content)
										);
										$sections[$this->name] = array(
											'id'	 => (int)$section['id'],
											'name' => (string)$section['name'],
											'label' => (string)$section['label'],
											'content' => $content,
											'annotations' =>  $this->paragraphs((string)$section->Annotations)
										); 
									}
									$this->name = (string)$step['name']."-panel-".$panel['id']."-blockinfo-".$blockinfo['id']."-chapter-".$chapter['id'];
									$chapters[$this->name] = array(
										'id'	 => (int)$chapter['id'],
										'name' => (string)$chapter['name'],
										'label' => (string)$chapter['label'],
										'icon' => (string)$chapter['icon'],
										'collapsible' => (string)$chapter['collapsible'],
										'sections' => $sections
									); 
								}
								$nfieldset = array(
									'id'	 => (int)$blockinfo['id'],
									'name' => (string)$blockinfo['name'],
									'label' => (string)$blockinfo['label'],
									'display' => (string)$blockinfo['display'],
									'popinLink' => (string)$blockinfo['popinLink'],
									'chapters' => $chapters
								);
								$this->name = (string)$step['name']."-panel-".$panel['id']."-blockinfo-".$blockinfo['id'];
								$panels[$this->name] = $nfieldset;
							}
						}
					}
					$nstep["panels"] = $panels;
					foreach ($step->ActionList as $actionList) {
						foreach ($actionList as $action) {
							$this->name = (string)$action['name'];
							$this->dependencies = 'actionDependencies';
							$naction = array(
								'label'		 => (string)$action['label'],
								'what'		 => (string)$action['what'],
								'for'		 => (string)$action['for'],
								'uri'		 => (string)$action['uri'],
								'location'	 => (string)$action['location'],
								'shape'		 => (string)$action['shape']
							);
							$actions[$this->name] = $naction;
						}
					}
					foreach ($step->FootNotes as $footnoteList) {
						foreach ($footnoteList as $footnote) {
							$this->name = (int)$footnote['id'];
							$this->dependencies = 'footNoteDependencies';
							$nfootnote = array(
								'text'	=> $this->paragraphs(preg_replace_callback(
									'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
									array($this, 'addNoteDependency'), 
									$footnote
								))
							);
							$footnotes[$this->name] = $nfootnote;
						}
					}
					$nstep["actions"] = $actions;
					$nstep["footnotes"] = $footnotes;
				}
			}
		}
		if ($simulator->Sources) {
			foreach ($simulator->Sources->Source as $source) {
				$id = (int)$source['id'];
				$datasource =(string)$source['datasource'];
				if (is_numeric($datasource)) {
					$dss = $datasources->xpath("/DataSources/DataSource[@id='".$datasource."']");
				} else {
					$dss = $datasources->xpath("/DataSources/DataSource[@name='".$datasource."']");
				}
				$datasource = $dss[0];
				$sources[$id]['datasource']['type'] = (string)$datasource['type'];
				if ((string)$datasource['type'] == 'uri') {
					$sources[$id]['datasource']['uri'] = (string)$datasource['uri'];
					$sources[$id]['datasource']['method'] = (string)$datasource['method'] != '' ? (string)$datasource['method'] : 'get';
				}
				$this->name = $id;
				$this->dependencies = 'sourceDependencies';
				$parameters = array();
				foreach ($source->Parameter as $param) {
					$parameter = array(
						'name' => (string)$param['name'],
						'type' => (string)$param['type'] != '' ? (string)$param['type'] : 'queryString',
						'format' => (string)$param['format'],
						'origin' => (string)$param['origin'] != '' ? (string)$param['origin'] : 'data',
						'optional' => (string)$param['optional'] != '' ? (string)$param['optional'] : '0'
					);
					if ((string)$param['origin'] == 'constant') {
						$parameter['constant'] = (string)$param['constant'];
					} else {
						$data = $this->datas[(int)$param['data']];
						$parameter['data'] = $data['name'];
						$this->addDependency(array(null, (int)$param['data']));
					}
					$parameters[] = $parameter;
				}
				$sources[$id]['label'] = (string)$source['label'];
				$sources[$id]['separator'] = (string)$source['separator'];
				$sources[$id]['delimiter'] = (string)$source['delimiter'];
				$sources[$id]['parameters'] = $parameters;
				$sources[$id]['returnType'] = (string)$source['returnType'];
				$sources[$id]['returnPath'] = $this->replaceIdByName((string)$source['returnPath']);
			}
		}
		foreach ($this->datas as $id => $odata) {
			$name = $odata['name'];
			unset($odata['name']);
			foreach($odata as $key => $value) {
				$datas[$name][$key] = $value;
			}
		}
		if ($simulator->BusinessRules) {
			$ruleID = 0;
			foreach ($simulator->BusinessRules->BusinessRule as $brule) {
				$conditions = $this->replaceByDataName((string)$brule->Conditions['value']);
				$names = [];
				if (preg_match_all("/#(\d+)/", (string)$brule->Conditions['value'], $matches)) {
					foreach($matches[1] as $id) {
						$name = $this->datas[$id]['name'];
						if (! isset($datas[$name]['rulesConditionsDependency'])) {
							$datas[$name]['rulesConditionsDependency'] = array();
						}
						$names[] = $name;
					}
				}
				if ($brule->IfActions && $brule->IfActions->Action && $brule->IfActions->Action->count() == 1 &&
					$brule->ElseActions && $brule->ElseActions->Action && $brule->ElseActions->Action->count() == 1) {
					$rule = array(
						'id' => ++$ruleID,
						'name' => (string)$brule['name'],
						'conditions' => $conditions,
						'ifdata' => [ $this->actionData($ruleID, $brule->IfActions->Action[0], $datas) ],
						'elsedata' => [ $this->actionData($ruleID, $brule->ElseActions->Action[0], $datas) ]
					);
					foreach($names as $name) {
						$datas[$name]['rulesConditionsDependency'][] = $ruleID;
					}
					$rules[] = $rule;
				} else {
					if ($brule->IfActions && $brule->IfActions->Action) {
						foreach ($brule->IfActions->Action as $ifAction) {
							$rule = array(
								'id' => ++$ruleID,
								'name' => (string)$brule['name'],
								'conditions' => $conditions,
								'ifdata' => [ $this->actionData($ruleID, $ifAction, $datas) ],
								'elsedata' => []
							);
							foreach($names as $name) {
								$datas[$name]['rulesConditionsDependency'][] = $ruleID;
							}
							$rules[] = $rule;
						}
					}
					if ($brule->ElseActions && $brule->ElseActions->Action) {
						foreach ($brule->ElseActions->Action as $elseAction) {
							$rule = array(
								'id' => ++$ruleID,
								'name' => (string)$brule['name'],
								'conditions' => $conditions,
								'ifdata' =>  [],
								'elsedata' => [ $this->actionData($ruleID, $elseAction, $datas) ]
							);
							foreach($names as $name) {
								$datas[$name]['rulesConditionsDependency'][] = $ruleID;
							}
							$rules[] = $rule;
						}
					}
				}
			}
			foreach ($datas as $name => $data) {
				if (isset($data['rulesConditionsDependency'])) {
					$datas[$name]['rulesConditionsDependency'] = array_keys(array_flip($data['rulesConditionsDependency']));
				}
			 	if (isset($data['rulesActionsDependency'])) {
					$datas[$name]['rulesActionsDependency'] = array_keys(array_flip($data['rulesActionsDependency']));
				}
			 
			}
		}
		$json["datas"] = $datas;
		$json["profiles"] = $profiles;
		$json["step"] = $nstep;
		$json["sources"] = $sources;
		$json["rules"] = $rules;
		return json_encode($json);
	}

	/**
	 * Converts a condition connector for a business rule extracted from the XML file into an associative array.
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $pconnector The connector to be convertd
	 * @return  array The associative array
	 *
	 */
	protected function ruleConnector(\SimpleXMLElement $pconnector) {
		if ($pconnector->getName() == 'Condition') {
			$operand = (string)$pconnector['operand'];
			if (preg_match("/^\d+$/", $operand)) {
				$operand = (int)$operand;
				$name = isset($this->datas[$operand]) ? $this->datas[$operand]['name'] : $operand;
			} else {
				$name = $operand;
			}
			return array(
				'name' => $name,
				'operator' => (string)$pconnector['operator'],
				'value' => (string)$pconnector['expression']
			);
		}
		$kind = (string)$pconnector['type'];
		$connector = array(
			$kind => array()
		);
		foreach ($pconnector->children() as $child) {
			$connector[$kind][] = $this->ruleConnector($child);
		}
		return $connector;
	}

	/**
	 * Cleans the text produced with the Javascript component "bootstrap3-wysihtml5" for its registration in the XML file of definition of this simulator
	 *
	 * @access  private
	 * @param   \App\G6K\Model\RichText|null $richtext The text to clean
	 * @return  string The cleaned text
	 *
	 */
	private function cleanRichText(RichText $richtext = null) {
		if ($richtext === null) {
			return '';
		}
		if (! $richtext->isManual()) {
			return $richtext->getContent();
		}
		$text = $richtext->getContent();
		$text = preg_replace("|\r|smi", "", $text);
		$text = preg_replace("|<p>&nbsp;</p>|smi", "\n", $text);
		$text = preg_replace("|<p><br></p>|smi", "\n", $text);
		$text = preg_replace("|<br>|smi", "\n", $text);
		$pattern = '{<p>((?:(?:(?!<p[^>]*>|</p>).)++|<p[^>]*>(?1)</p>)*)</p>}smi';
		$text = preg_replace($pattern, "$1\n", $text);
		$text = preg_replace("|\n\n+|smi", "\n\n", $text);
		$lines = explode("\n", $text);
		foreach($lines as &$line) {
			$line = trim(str_replace(array("\t", "&nbsp;"), array(" ", " "), $line));
		}
		$cleaned = implode(PHP_EOL ,$lines);
		return trim($cleaned);
	}

	/**
	 * Converts this Simulator object into an XML string and saves it to a file with the provided path.
	 *
	 * @access  public
	 * @param   string $file The path to the saved XML document.
	 * @return  void
	 *
	 */
	public function save($file) {
		$xml = array();
		$xml[] = '<?xml version="1.0" encoding="utf-8"?>';
		$xml[] = '<Simulator xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/Simulator.xsd" name="' . $this->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $this->getLabel()) . '" category="' . $this->getCategory() . '" defaultView="' . $this->getDefaultView() . '" referer="' . $this->getReferer() . '" dynamic="' . ($this->isDynamic() ? 1 : 0) . '" memo="' . ($this->hasMemo() ? 1 : 0) . '" locale="' . $this->getLocale() . '" timezone="' . $this->getTimezone() . '">';
		$xml[] = '	<Description edition="' . $this->getDescription()->getEdition() . '"><![CDATA[';
		$xml[] = $this->cleanRichText($this->getDescription());
		$xml[] = '	]]></Description>';
		$xml[] = '	<DataSet dateFormat="' . $this->getDateFormat() . '" decimalPoint="' . $this->getDecimalPoint() . '" groupingSeparator="' . $this->getGroupingSeparator() . '" groupingSize="' . $this->getGroupingSize() . '" moneySymbol="' . $this->getMoneySymbol() . '" symbolPosition="' . $this->getSymbolPosition() . '">';
		foreach ($this->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				$xml[] = '		<DataGroup id="' . $data->getId() . '" name="' . $data->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $data->getLabel()) . '">';
				foreach ($data->getDatas() as $gdata) {
					$attrs = 'id="' . $gdata->getId() . '" name="' . $gdata->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $gdata->getLabel()) . '" type="' . $gdata->getType() . '"';
					if ($gdata->getUnparsedDefault() != '') {
						$attrs .= ' default="' . htmlspecialchars($gdata->getUnparsedDefault(), ENT_COMPAT) . '"'; 
					}
					if ($gdata->getUnparsedMin() != '') {
						$attrs .= ' min="' . $gdata->getUnparsedMin() . '"'; 
					}
					if ($gdata->getUnparsedMax() != '') {
						$attrs .= ' max="' . $gdata->getUnparsedMax() . '"'; 
					}
					if ($gdata->getPattern() != '' && $gdata->getType() == 'text') {
						$attrs .= ' pattern="' . $gdata->getPattern() . '"'; 
					}
					if ($gdata->getContent() != '') {
						$attrs .= ' content="' . htmlspecialchars($gdata->getContent(), ENT_COMPAT) . '"'; 
					}
					if ($gdata->getSource() != '') {
						$attrs .= ' source="' . $gdata->getSource() . '"'; 
					}
					if ($gdata->getUnparsedIndex() != '') {
						$attrs .= ' index="' . $gdata->getUnparsedIndex() . '"'; 
					}
					if ($gdata->getRound() !== null) {
						$attrs .= ' round="' . $gdata->getRound() . '"'; 
					}
					if ($gdata->getUnit() != '') {
						$attrs .= ' unit="' . $gdata->getUnit() . '"'; 
					}
					if ($gdata->isMemorize()) {
						$attrs .= ' memorize="1"'; 
					}
					$description = $this->cleanRichText($gdata->getDescription());
					if ($description != '' || $gdata->getType() == 'choice') {
						$xml[] = '			<Data ' . $attrs . '>';
						if ($description != '') {
							$xml[] = '				<Description edition="' . $gdata->getDescription()->getEdition() . '"><![CDATA[';
							$xml[] = $description;
							$xml[] = '				]]></Description>';
						}
						if ($gdata->getType() == 'choice') {
							$xml[] = '				<Choices>';
							foreach ($gdata->getChoices() as $choice) {
								if ($choice instanceof Choice) {
									$xml[] = '					<Choice id="' . $choice->getId() . '" value="' . $choice->getValue() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $choice->getLabel()) . '" />';
								} elseif ($choice instanceof ChoiceGroup) {
									$xml[] = '					<ChoiceGroup label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $choice->getLabel()) . '">';
									foreach ($choice->getChoices() as $gchoice) {
										$xml[] = '						<Choice id="' . $gchoice->getId() . '" value="' . $gchoice->getValue() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $gchoice->getLabel()) . '" />';
									}
									if ($choice->getChoiceSource() !== null) {
										$source = $choice->getChoiceSource();
										$attrs = 'id="' . $source->getId() . '"';
										if ($source->getIdColumn() != '') {
											$attrs .= ' idColumn="' . $source->getIdColumn() . '"';
										}
										$attrs .= ' valueColumn="' . $source->getValueColumn() . '" labelColumn="' . $source->getLabelColumn() . '"';
										$xml[] = '						<Source ' . $attrs . ' />';
									}
									$xml[] = '					</ChoiceGroup>';
								}
							}
							if ($gdata->getChoiceSource() !== null) {
								$source = $gdata->getChoiceSource();
								$attrs = 'id="' . $source->getId() . '"';
								if ($source->getIdColumn() != '') {
									$attrs .= ' idColumn="' . $source->getIdColumn() . '"';
								}
								$attrs .= ' valueColumn="' . $source->getValueColumn() . '" labelColumn="' . $source->getLabelColumn() . '"';
								$xml[] = '					<Source ' . $attrs . ' />';
							}
							$xml[] = '				</Choices>';
						}
						$xml[] = '			</Data>';
					} else {
						$xml[] = '			<Data ' . $attrs . ' />';
					}
				}
				$xml[] = '		</DataGroup>';
			} elseif ($data instanceof Data) {
				$attrs = 'id="' . $data->getId() . '" name="' . $data->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $data->getLabel()) . '" type="' . $data->getType() . '"';
				if ($data->getUnparsedDefault() != '') {
					$attrs .= ' default="' . $data->getUnparsedDefault() . '"'; 
				}
				if ($data->getUnparsedMin() != '') {
					$attrs .= ' min="' . $data->getUnparsedMin() . '"'; 
				}
				if ($data->getUnparsedMax() != '') {
					$attrs .= ' max="' . $data->getUnparsedMax() . '"'; 
				}
				if ($data->getPattern() != '' && $data->getType() == 'text') {
					$attrs .= ' pattern="' . $data->getPattern() . '"'; 
				}
				if ($data->getContent() != '') {
					$attrs .= ' content="' . htmlspecialchars($data->getContent(), ENT_COMPAT) . '"'; 
				}
				if ($data->getSource() != '') {
					$attrs .= ' source="' . $data->getSource() . '"'; 
				}
				if ($data->getUnparsedIndex() != '') {
					$attrs .= ' index="' . $data->getUnparsedIndex() . '"'; 
				}
				if ($data->getRound() !== null) {
					$attrs .= ' round="' . $data->getRound() . '"'; 
				}
				if ($data->getUnit() != '') {
					$attrs .= ' unit="' . $data->getUnit() . '"'; 
				}
				if ($data->isMemorize()) {
					$attrs .= ' memorize="1"'; 
				}
				$description = $this->cleanRichText($data->getDescription());
				if ($description != '' || $data->getType() == 'choice') {
					$xml[] = '		<Data ' . $attrs . '>';
					if ($description != '') {
						$xml[] = '			<Description edition="' . $data->getDescription()->getEdition() . '"><![CDATA[';
						$xml[] = $description;
						$xml[] = '			]]></Description>';
					}
					if ($data->getType() == 'choice') {
						$xml[] = '			<Choices>';
						foreach ($data->getChoices() as $choice) {
							if ($choice instanceof Choice) {
								$xml[] = '				<Choice id="' . $choice->getId() . '" value="' . $choice->getValue() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $choice->getLabel()) . '" />';
							} elseif ($choice instanceof ChoiceGroup) {
								$xml[] = '				<ChoiceGroup label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $choice->getLabel()) . '">';
								foreach ($choice->getChoices() as $gchoice) {
									$xml[] = '					<Choice id="' . $gchoice->getId() . '" value="' . $gchoice->getValue() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $gchoice->getLabel()) . '" />';
								}
								if ($choice->getChoiceSource() !== null) {
									$source = $choice->getChoiceSource();
									$source->setCaseInsensitive(false);
									$attrs = 'id="' . $source->getId() . '"';
									if ($source->getIdColumn() != '') {
										$attrs .= ' idColumn="' . $source->getIdColumn() . '"';
									}
									$attrs .= ' valueColumn="' . $source->getValueColumn() . '" labelColumn="' . $source->getLabelColumn() . '"';
									$xml[] = '					<Source ' . $attrs . ' />';
								}
								$xml[] = '				</ChoiceGroup>';
							}
						}
						if ($data->getChoiceSource() !== null) {
							$source = $data->getChoiceSource();
							$source->setCaseInsensitive(false);
							$attrs = 'id="' . $source->getId() . '"';
							if ($source->getIdColumn() != '') {
								$attrs .= ' idColumn="' . $source->getIdColumn() . '"';
							}
							$attrs .= ' valueColumn="' . $source->getValueColumn() . '" labelColumn="' . $source->getLabelColumn() . '"';
							$xml[] = '				<Source ' . $attrs . ' />';
						}
						$xml[] = '			</Choices>';
					}
					$xml[] = '		</Data>';
				} else {
					$xml[] = '		<Data ' . $attrs . ' />';
				}
			}
		}
		$xml[] = '	</DataSet>';
		if ($this->profiles !== null && (count($this->profiles->getProfiles()) > 0)) {
			$xml[] = '	<Profiles label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $this->profiles->getLabel()) . '">';
			foreach ($this->profiles->getProfiles() as $profile) {
				$xml[] = '		<Profile id="' . $profile->getId() . '" name="' . $profile->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $profile->getLabel()) . '">';
				$description = $this->cleanRichText($profile->getDescription());
				if ($description != '') {
					$xml[] = '			<Description edition="' . $profile->getDescription()->getEdition() . '"><![CDATA[';
					$xml[] = $description;
					$xml[] = '			]]></Description>';
				}
				foreach ($profile->getDatas() as $data) {
					$xml[] = '			<Data id="' . $data[0] . '" default="' . $data[1] . '" />';
				}
				$xml[] = '		</Profile>';
			}
			$xml[] = '	</Profiles>';
		}
		if (count($this->getSteps()) > 0) {
			$xml[] = '	<Steps>';
			foreach ($this->getSteps() as $step) {
				$attrs = 'id="' . $step->getId() . '" name="' . $step->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $step->getLabel()) . '" template="' . $step->getTemplate() . '"';
				if ($step->getOutput() != '') {
					$attrs .= ' output="' . $step->getOutput() . '"'; 
				}
				if ($step->isDynamic()) {
					$attrs .= ' dynamic="1"'; 
				}
				if (($step->getOutput() == 'inlinePDF' || $step->getOutput() == 'downloadablePDF') && $step->hasPdfFooter()) {
					$attrs .= ' pdfFooter="1"'; 
				}
				$xml[] = '		<Step ' . $attrs . '>';
				$description = $this->cleanRichText($step->getDescription());
				if ($description != '') {
					$xml[] = '			<Description edition="' . $step->getDescription()->getEdition() . '"><![CDATA[';
					$xml[] = $description;
					$xml[] = '			]]></Description>';
				}
				$xml[] = '			<Panels>';
				foreach ($step->getPanels() as $panel) {
					$attrs = 'id="' . $panel->getId() . '"';
					$attrs .= ' name="' . $panel->getName() . '"';
					$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $panel->getLabel()) . '"';
					$xml[] = '				<Panel ' . $attrs . '>';
					foreach ($panel->getFieldSets() as $block) {
						if ($block instanceof FieldSet) {
							$fieldset = $block;
							$attrs = 'id="' . $fieldset->getId() . '"';
							if ($fieldset->getDisposition() != '' && $fieldset->getDisposition() != 'classic') {
								$attrs .= ' disposition="' . $fieldset->getDisposition() . '"'; 
							}
							if ($fieldset->getDisplay() != '' && $fieldset->getDisplay() != 'inline') {
								$attrs .= ' display="' . $fieldset->getDisplay() . '"'; 
							}
							if ($fieldset->getPopinLink() != '') {
								$attrs .= ' popinLink="' . $fieldset->getPopinLink() . '"'; 
							}
							$xml[] = '					<FieldSet ' . $attrs . '>';
							$legend = $this->cleanRichText($fieldset->getLegend());
							if ($legend != '') {
								$xml[] = '						<Legend edition="' . $fieldset->getLegend()->getEdition() . '"><![CDATA[';
								$xml[] = $legend;
								$xml[] = '						]]></Legend>';
							}
							if (count($fieldset->getColumns()) > 0) {
								$xml[] = '						<Columns>';
								foreach ($fieldset->getColumns() as $column) {
									$attrs = 'id="' . $column->getId() . '" name="' . $column->getName() . '" type="' . $column->getType() . '" label="' . str_replace("<", "&lt;", $column->getLabel()) . '"';
									$xml[] = '							<Column ' . $attrs . ' />';
								}
								$xml[] = '						</Columns>';
							}
							foreach ($fieldset->getFields() as $child) {
								if ($child instanceof FieldRow) {
									$fieldrow = $child;
									$attrs = 'id="' . $fieldrow->getId() . '" datagroup="' . $fieldrow->getDataGroup() . '"';
									if ($fieldrow->getLabel() != '') {
										$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $fieldrow->getLabel()) . '"'; 
									}
									if ($fieldrow->hasHelp()) {
										$attrs .= ' help="1"'; 
									}
									if (! $fieldrow->hasColon()) {
										$attrs .= ' colon="0"'; 
									}
									if ($fieldrow->isEmphasized()) {
										$attrs .= ' emphasize="1"'; 
									}
									$xml[] = '						<FieldRow ' . $attrs . '>';
									foreach ($fieldrow->getFields() as $field) {
										$attrs = 'position="' . $field->getPosition() . '" data="' . $field->getData() . '" usage="' . $field->getUsage() . '"';
										if (! $field->isNewline()) {
											$attrs .= ' newline="0"'; 
										}
										if ($field->getLabel() != '') {
											$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getLabel()) . '"'; 
										}
										if ($field->getPrompt() != '') {
											$attrs .= ' prompt="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getPrompt()) . '"'; 
										}
										if (! $field->isRequired()) {
											$attrs .= ' required="0"'; 
										}
										if (! $field->isVisibleRequired()) {
											$attrs .= ' visibleRequired="0"'; 
										}
										if (! $field->hasColon()) {
											$attrs .= ' colon="0"'; 
										}
										if ($field->isUnderlabel()) {
											$attrs .= ' underlabel="1"'; 
										}
										if (! $field->hasHelp()) {
											$attrs .= ' help="0"'; 
										}
										if ($field->isEmphasized()) {
											$attrs .= ' emphasize="1"'; 
										}
										if ($field->getExplanation() != '') {
											$attrs .= ' explanation="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getExplanation()) . '"'; 
										}
										if ($field->isExpanded()) {
											$attrs .= ' expanded="1"'; 
										}
										if ($field->getWidget() != '') {
											$attrs .= ' widget="' . $field->getWidget() . '"'; 
										}
										if ($field->getPreNote() !== null || $field->getPostNote() !== null) {
											$xml[] = '							<Field ' . $attrs . '>';
											if ($field->getPreNote() !== null) {
												$xml[] = '							<PreNote edition="' . $field->getPreNote()->getText()->getEdition() . '"><![CDATA[';
												$xml[] = $this->cleanRichText($field->getPreNote()->getText());
												$xml[] = '							]]></PreNote>';
											}
											if ($field->getPostNote() !== null) {
												$xml[] = '							<PostNote edition="' . $field->getPostNote()->getText()->getEdition() . '"><![CDATA[';
												$xml[] = $this->cleanRichText($field->getPostNote()->getText());
												$xml[] = '							]]></PostNote>';
											}
											$xml[] = '							</Field>';
										} else {
											$xml[] = '							<Field ' . $attrs . ' />';
										}
									}
									$xml[] = '						</FieldRow>';
								} elseif ($child instanceof Field) {
									$field = $child;
									$attrs = 'position="' . $field->getPosition() . '" data="' . $field->getData() . '" usage="' . $field->getUsage() . '"';
									if (! $field->isNewline()) {
										$attrs .= ' newline="0"'; 
									}
									if ($field->getLabel() != '') {
										$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getLabel()) . '"'; 
									}
									if ($field->getPrompt() != '') {
										$attrs .= ' prompt="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getPrompt()) . '"'; 
									}
									$attrs .= $field->isRequired() ? ' required="1"' : ' required="0"'; 
									$attrs .= $field->isVisibleRequired() ? ' visibleRequired="1"' : ' visibleRequired="0"'; 
									if (! $field->hasColon()) {
										$attrs .= ' colon="0"'; 
									}
									if ($field->isUnderlabel()) {
										$attrs .= ' underlabel="1"'; 
									}
									$attrs .= $field->hasHelp() ? ' help="1"' : ' help="0"'; 
									if ($field->isEmphasized()) {
										$attrs .= ' emphasize="1"'; 
									}
									if ($field->getExplanation() != '') {
										$attrs .= ' explanation="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getExplanation()) . '"'; 
									}
									if ($field->isExpanded()) {
										$attrs .= ' expanded="1"'; 
									}
									if ($field->getWidget() != '') {
										$attrs .= ' widget="' . $field->getWidget() . '"'; 
									}
									if ($field->getPreNote() !== null || $field->getPostNote() !== null) {
										$xml[] = '						<Field ' . $attrs . '>';
										if ($field->getPreNote() !== null) {
											$xml[] = '							<PreNote edition="' . $field->getPreNote()->getText()->getEdition() . '"><![CDATA[';
											$xml[] = $this->cleanRichText($field->getPreNote()->getText());
											$xml[] = '							]]></PreNote>';
										}
										if ($field->getPostNote() !== null) {
											$xml[] = '							<PostNote edition="' . $field->getPostNote()->getText()->getEdition() . '"><![CDATA[';
											$xml[] = $this->cleanRichText($field->getPostNote()->getText());
											$xml[] = '							]]></PostNote>';
										}
										$xml[] = '						</Field>';
									} else {
										$xml[] = '						<Field ' . $attrs . ' />';
									}
								}
							}
							$xml[] = '					</FieldSet>';
						} elseif ($block instanceof BlockInfo) {
							$blocinfo = $block;
							$attrs = 'id="' . $blocinfo->getId() . '"';
							$attrs .= ' name="' . $blocinfo->getName() . '"';
							$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $blocinfo->getLabel()) . '"';
							if ($blocinfo->getDisplay() != '' && $blocinfo->getDisplay() != 'inline') {
								$attrs .= ' display="' . $blocinfo->getDisplay() . '"'; 
							}
							if ($blocinfo->getPopinLink() != '') {
								$attrs .= ' popinLink="' . $blocinfo->getPopinLink() . '"'; 
							}
							$xml[] = '					<BlockInfo ' . $attrs . '>';
							foreach ($blocinfo->getChapters() as $chapter) {
								$attrs = 'id="' . $chapter->getId() . '"';
								$attrs .= ' name="' . $chapter->getName() . '"';
								$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $chapter->getLabel()) . '"';
								if ($chapter->getIcon() != '') {
									$attrs .= ' icon="' . $chapter->getIcon() . '"'; 
								}
								if ($chapter->isCollapsible()) {
									$attrs .= ' collapsible="1"'; 
								}
								$xml[] = '						<Chapter ' . $attrs . '>';
								foreach ($chapter->getSections() as $section) {
									$attrs = 'id="' . $section->getId() . '"';
									$attrs .= ' name="' . $section->getName() . '"';
									$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $section->getLabel()) . '"';
									$xml[] = '							<Section ' . $attrs . '>';
									$xml[] = '								<Content edition="' . $section->getContent()->getEdition() . '"><![CDATA[';
									$xml[] = $this->cleanRichText($section->getContent());
									$xml[] = '								]]></Content>';
									$annotations = $this->cleanRichText($section->getAnnotations());
									if ($annotations != '') {
										$xml[] = '								<Annotations edition="' . $section->getAnnotations()->getEdition() . '"><![CDATA[';
										$xml[] = $annotations;
										$xml[] = '								]]></Annotations>';
									}
									$xml[] = '							</Section>';
								}
								$xml[] = '						</Chapter>';
							}
							$xml[] = '					</BlockInfo>';
						}
					}
					$xml[] = '				</Panel>';
				}
				$xml[] = '			</Panels>';
				if (count($step->getActions()) > 0) {
					$xml[] = '			<ActionList>';
					foreach ($step->getActions() as $action) {
						$attrs = 'name="' . $action->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $action->getLabel()) . '" shape="' . $action->getShape() . '" what="' . $action->getWhat() . '" for="' . $action->getFor() . '"';
						if ($action->getUri() != '') {
							$attrs .= ' uri="' . $action->getUri() . '"'; 
						}
						$attrs .= ' location="' . $action->getLocation() . '"'; 
						if ($action->getClass() != '') {
							$attrs .= ' class="' . $action->getClass() . '"'; 
						}
						$xml[] = '				<Action ' . $attrs . ' />';
					}
					$xml[] = '			</ActionList>';
				}
				if ($step->getFootNotes() !== null) {
					$attrs = '';
					if ($step->getFootNotes()->getPosition() != '') {
						$attrs .= ' position="' . $step->getFootNotes()->getPosition() . '"'; 
					}
					$xml[] = '			<FootNotes' . $attrs . '>';
					$footnoteList = $step->getFootNotes();
					foreach ($footnoteList->getFootNotes() as $footnote) {
						$attrs = '';
						if ($footnote->getId() != '') {
							$attrs .= ' id="' . $footnote->getId() . '"'; 
						}
						$attrs .= ' edition="' . $footnote->getText()->getEdition() . '"';
						$xml[] = '				<FootNote' . $attrs . '><![CDATA[';
						$xml[] = $this->cleanRichText($footnote->getText());
						$xml[] = '				]]></FootNote>';
					}
					$xml[] = '			</FootNotes>';
				}
				$xml[] = '		</Step>';
			}
			$xml[] = '	</Steps>';
		}
		if (count($this->getSources()) > 0) {
			$xml[] = '	<Sources>';
			foreach ($this->getSources() as $source) {
				$attrs = 'id="' . $source->getId() . '" datasource="' . $source->getDatasource() . '"';
				if ($source->getLabel() != '') {
					$attrs .= ' label="' . $source->getLabel() . '"'; 
				}
				if ($source->getRequest() != '') {
					$attrs .= ' request="' . htmlspecialchars($source->getRequest(), ENT_COMPAT) . '"'; 
				}
				if ($source->getRequestType() != '' && $source->getRequestType() != 'simple') {
					$attrs .= ' requestType="' . $source->getRequestType() . '"'; 
				}
				if ($source->getReturnType() != '') {
					$attrs .= ' returnType="' . $source->getReturnType() . '"'; 
				}
				if ($source->getSeparator() != '' && $source->getSeparator() != ';') {
					$attrs .= ' separator="' . $source->getSeparator() . '"'; 
				}
				if ($source->getDelimiter() != '') {
					$attrs .= ' delimiter="' . $source->getDelimiter() . '"'; 
				}
				if ($source->getReturnPath() != '') {
					$attrs .= ' returnPath="' . $source->getReturnPath() . '"';
				}
				if (count($source->getParameters()) > 0) {
					$xml[] = '		<Source ' . $attrs . '>';
					foreach ($source->getParameters() as $parameter) {
						$attrs = 'type="' . $parameter->getType() . '"';
						$attrs .= ' origin="' . $parameter->getOrigin() . '"';
						if ($parameter->getName() != '') {
							$attrs .= ' name="' . $parameter->getName() . '"';
						}
						if ($parameter->getFormat() != '') {
							$attrs .= ' format="' . $parameter->getFormat() . '"';
						}
						if ($parameter->getData() != '') {
							$attrs .= ' data="' . $parameter->getData() . '"';
						}
						if ($parameter->getConstant() != '') {
							$attrs .= ' constant="' . $parameter->getConstant() . '"';
						}
						if ($parameter->isOptional()) {
							$attrs .= ' optional="1"';
						}
						$xml[] = '			<Parameter ' . $attrs . ' />';
					}
					$xml[] = '		</Source>';
				} else {
					$xml[] = '		<Source ' . $attrs . ' />';
				}
			}
			$xml[] = '	</Sources>';
		}
		if (count($this->getBusinessRules()) > 0) {
			$xml[] = '	<BusinessRules>';
			foreach ($this->getBusinessRules() as $rule) {
				$attrs = 'id="' . $rule->getId() . '" name="' . $rule->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $rule->getLabel()) . '"';
				$xml[] = '		<BusinessRule ' . $attrs . '>';
				$xml[] = '			<Conditions value="' . htmlspecialchars($rule->getConditions(), ENT_COMPAT) . '">';
				if ($rule->getConnector() !== null) {
					$this->saveConnector($rule->getConnector(), "			", $xml);
				}
				$xml[] = '			</Conditions>';
				$xml[] = '			<IfActions>';
				foreach ($rule->getIfActions() as $action) {
					$attrs = $this->makeRuleActionAttributes($action);
					$xml[] = '				<Action ' . $attrs . ' />';
				}
				$xml[] = '			</IfActions>';
				$xml[] = '			<ElseActions>';
				foreach ($rule->getElseActions() as $action) {
					$attrs = $this->makeRuleActionAttributes($action);
					$xml[] = '				<Action ' . $attrs . ' />';
				}
				$xml[] = '			</ElseActions>';
				$xml[] = '		</BusinessRule>';
			}
			$xml[] = '	</BusinessRules>';
		}
		$relatedInformations = $this->cleanRichText($this->getRelatedInformations());
		if ($relatedInformations != '') {
			$xml[] = '	<RelatedInformations edition="' . $this->getRelatedInformations()->getEdition() . '"><![CDATA[';
			$xml[] = $relatedInformations;
			$xml[] = '	]]></RelatedInformations>';
		}
		$xml[] = '</Simulator>';
		$xmlstring = implode("\r\n", $xml);
		$xmlstring = str_replace('&gt;', '>', $xmlstring);
		file_put_contents($file, $xmlstring);
	}

	/**
	 * Converts the properties of a RuleAction object into an XML attributes string
	 *
	 * @access  private
	 * @param   \App\G6K\Model\RuleAction $action The RuleAction object
	 * @return  string The XML attributes string
	 *
	 */
	private function makeRuleActionAttributes(RuleAction $action) {
		$attrs = 'id="' . $action->getId() . '" name="' . $action->getName() . '" target="' . $action->getTarget() . '"';
		if ($action->getData() != '') {
			$attrs .= ' data="' . $action->getData() . '"';
		}
		if ($action->getDatagroup() != '') {
			$attrs .= ' datagroup="' . $action->getDatagroup() . '"';
		}
		if ($action->getStep() != '') {
			$attrs .= ' step="' . $action->getStep() . '"';
		}
		if ($action->getPanel() != '') {
			$attrs .= ' panel="' . $action->getPanel() . '"';
		}
		if ($action->getFieldset() != '') {
			$attrs .= ' fieldset="' . $action->getFieldset() . '"';
		}
		if ($action->getColumn() != '') {
			$attrs .= ' column="' . $action->getColumn() . '"';
		}
		if ($action->getFieldrow() != '') {
			$attrs .= ' fieldrow="' . $action->getFieldrow() . '"';
		}
		if ($action->getField() != '') {
			$attrs .= ' field="' . $action->getField() . '"';
		}
		if ($action->getBlockinfo() != '') {
			$attrs .= ' blockinfo="' . $action->getBlockinfo() . '"';
		}
		if ($action->getChapter() != '') {
			$attrs .= ' chapter="' . $action->getChapter() . '"';
		}
		if ($action->getSection() != '') {
			$attrs .= ' section="' . $action->getSection() . '"';
		}
		if ($action->getPrenote() != '') {
			$attrs .= ' prenote="' . $action->getPrenote() . '"';
		}
		if ($action->getPostnote() != '') {
			$attrs .= ' postnote="' . $action->getPostnote() . '"';
		}
		if ($action->getAction() != '') {
			$attrs .= ' action="' . $action->getAction() . '"';
		}
		if ($action->getFootnote() != '') {
			$attrs .= ' footnote="' . $action->getFootnote() . '"';
		}
		if ($action->getChoice() != '') {
			$attrs .= ' choice="' . $action->getChoice() . '"';
		}
		if ($action->getValue() != '') {
			$attrs .= ' value="' . $action->getValue() . '"';
		}
		return $attrs;
	}

	/**
	 * Converts a Connector or Condition object to XML strings and inserts it into an array of indented lines
	 *
	 * @access  private
	 * @param   \App\G6K\Model\Connector|\App\G6K\Model\Condition $connector The Connector or Condition object
	 * @param   string $indent The indentation spaces
	 * @param   array &$xml array of indented lines
	 * @return  void
	 *
	 */
	private function saveConnector($connector, $indent, &$xml) {
		if ($connector instanceof Condition) {
			$htmlcondition = '<Condition operand="' . $connector->getOperand() . '" operator="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $connector->getOperator()) . '"';
			$expression = $connector->getExpression();
			if ($expression !== null && $expression != '') {
				$htmlcondition .= ' expression="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $expression) . '"';
			}
			$htmlcondition .= ' />';
			$xml[] = $indent . "\t" . $htmlcondition;
		} else {
			$htmlconnector = '<Connector type="' . $connector->getType() . '"';
			$conditions = $connector->getConditions();
			if (empty($conditions)) {
				$htmlconnector .= ' />';
				$xml[] = $indent . "\t" . $htmlconnector;
			} else {
				$htmlconnector .= '>';
				$xml[] = $indent . "\t" . $htmlconnector;
				foreach ($conditions as $cond) {
					$this->saveConnector($cond, $indent . "\t", $xml);
				}
				$xml[] = $indent . "\t" . '</Connector>';
			}
		}
	}

	/**
	 * Loads an XML file from the APC cache
	 *
	 * @access  private
	 * @param   string $url The location of the file
	 * @return  string The contents of the file
	 *
	 */
	private function loadFileFromCache($url) {
		$mtimekey = $url . "-mtime";
		$mtime = filemtime($url);
		if (apc_exists($mtimekey)) {
			if ($mtime <= apc_fetch($mtimekey)) {
				return apc_fetch($url);
			}
		} 
		$file = file_get_contents($url);
		apc_add($url, $file);
		apc_add($mtimekey, $mtime);
		return $file;
	}

	/**
	 * Loads a simulator XML definition skeleton into this Simulator object.
	 *
	 * Used to create a new simulator.
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function loadEmptySimulator() {
		$datasrc = $this->controller->databasesDir . '/DataSources.xml';
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$xml = $this->loadFileFromCache($datasrc);
			$datasources = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
		} else {
			$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		}
		$simusrc = '<?xml version="1.0" encoding="utf-8"?>' .PHP_EOL;
		$simusrc .= '<Simulator xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/Simulator.xsd" name="';
		$simusrc .= $this->controller->getTranslator()->trans("new");
		$simusrc .= '" label="';
		$simusrc .= $this->controller->getTranslator()->trans("Simulator of calculation of ...");
		$simusrc .= '" defaultView="Default';
		$simusrc .= '" locale="'.getenv('APP_LOCALE');
		$simusrc .= '" timezone="'.DateFunction::$timezone->getName().'">' .PHP_EOL;
		$dateFormat = DateFunction::$dateFormat;
		$decimalPoint = MoneyFunction::$decimalPoint;
		$groupingSeparator = MoneyFunction::$groupingSeparator;
		$groupingSize = MoneyFunction::$groupingSize;
		$moneySymbol = MoneyFunction::$moneySymbol;
		$symbolPosition = MoneyFunction::$symbolPosition;
		$simusrc .= <<<EOT
	<Description><![CDATA[
	]]></Description>
	<DataSet dateFormat="{$dateFormat}" decimalPoint="{$decimalPoint}" groupingSeparator="{$groupingSeparator}" groupingSize="{$groupingSize}" moneySymbol="{$moneySymbol}" symbolPosition="{$symbolPosition}">
	</DataSet>
	<Steps>
	</Steps>
</Simulator>
EOT;
		$simulator = new \SimpleXMLElement($simusrc, LIBXML_NOWARNING, false);
		$this->loadEntities($simulator, $datasources);
	}
}

?>

# CMSMadeSimple 2.2/G6K integration module

This module offers you the possibility of integrating the simulation forms developed with the G6K engine in the CMS Made Simple pages using the G6K API.

The G6K API allows integration using two techniques:
1. The pages are composed by a CMS Made Simple application which queries the API which provides it with a JSON stream conforming to `{json:api}` as well as a JavaScript stream comprising the code used to perform the simulation.
   * « http:&#47;&#47;&lt;base url of the G6K API>/&lt;simulator name>/api » for the JSON stream
   * « http:&#47;&#47;&lt;base url of the G6K API>/&lt;simulator name>/api/js » for the Javascript stream
2. The pages are precomposed by the API which provides either a complete html page, or an HTML fragment containing only the simulation form to constitute a block inserted in the TYPO3 pages.
   * « http:&#47;&#47;&lt;base url of the G6K API>/&lt;simulator name>/api/html » provides the HTML markup
 
It is this second technique which is implemented in this module.
## Requirement

* CMSMadeSimple: ^2.2
* PHP: ^7.3

## Installation
1. extract the file "Simulators.zip" located in the "integrations/cmsms" folder of your G6K installation into the modules folder of your CMSMadeSimple installation.
2. In the administration menu bar, click « Site Admin » > « Module Manager »
3. Find the « Simulators » module in the list of modules and install it by clicking on the `Install` link in the "Action" column.

## Configuration
1. In the administration menu, go to « Extensions » > « G6K Integration settings ».
2. Open all the tabs and fill in the fields (see "Configuration fields" below)

### Configuration fields

|Field                       |Description                                                                                   |Default        |
|----------------------------|----------------------------------------------------------------------------------------------|---------------|
|Base url of the server      |Absolute url pointing to the public directory of the G6K API server |
|Primary color               |Background color of icons, primary buttons or header of tables. Text colors of emphasized text|#2b4e6b
|Secondary color             |Background color of secondary butons, not-current steps in the breadcrumb trail, inactive tabs, ...|#c0c0c0
|Breadcrumb color            |Background color of the current step in the breadcrumb trail|#2b4e6b
|Tab color                   |Background color of the active tab if the simulation form contains tabs|#2b4e6b
|Global error color          |Text color of error messages concerning the whole simulation form, not a particular field|#ff0000
|Global warning color        |Text color of warning messages concerning the whole simulation form, not a particular field|#800000
|Field error color           |Text color of error messages concerning a particular field|#ff0000
|Field warning color         |Text color of warning messages concerning a particular field|#800000
|Font family                 |The font family is applied to the top level container of the simulation form unless the Bootstrap classes are present.|Arial, Verdana
|Font size                   |The font size is applied to the top level container of the simulation form unless the Bootstrap classes are present|1em
|HTML Markup                 |This control offers two options allowing you to choose the HTML markup:<br>- fragment (html fragment only)<br>- page (full html page)|fragment<br>(html fragment only)
|Adding Bootstrap classes    |if this field is set to « Yes », Bootstrap classes will be added to relevant markup allowing bootstrap styles to apply. |No
|Bootstrap version           |If « Adding Bootstrap classes » is set to « Yes », the bootstrap version given here will automatically add Bootstrap CSS and JS files from the CDN https://maxcdn.bootstrapcdn.com and the classes corresponding to the version are added to the HTML tags.|
|Adding Bootstrap stylesheet |if this field is set to « Yes », the Bootstrap stylesheet will be loaded by the API from bootstrapcdn.|No
|Adding Bootstrap library    |if this field is set to « Yes », Bootstrap library will be loaded by the API from bootstrapcdn.|No
|Adding jQuery library       |if this field is set to « Yes », the jQuery library will be loaded by the API from code.jquery.com.|No
|Data observers              |Declaration of data to watch. format : &lt;simulator name>:&lt;data name>|
|Buttons observers           |Declaration of buttons to watch. format : &lt;simulator name>:&lt;button name>|

## How to Use?
1. In the administration menu, go to « Content » > « Content Manager » and click the `Add New Content` button.
2. Give your page a title
3. In the Content textbox enter `{simulator name="<name of the simulator>"}`.
4. Click the « Submit » button.

## Hooks for catching data value changes or buttons clicks
This module provides a way to collect information from the simulation form while the simulation is running. This allows actions to be performed depending on the data value when it changes or when the user has clicked on one of the form buttons.

To do this, the data and buttons to be watched must be declared in the « Data observers » tab.

The declaration of each data is done in the form &lt;simulator name>:&lt;data name>. It is the same for the buttons in the « Buttons observers » tab.

The actions to be performed must be written to the file `modules/Simulators/js/script.js` 
in the functions `ResultObserver.field` and `ResultObserver.button`

```javascript
// modules/Simulators/js/script.js
(function (global) {
	"use strict";
	
	/**
	 * This class provides two static functions for capturing changes in data value and clicks on action buttons.
	 * Watched data and buttons are defined in the control panel of the integration module.
	 * Any action resulting from these events must be coded in the body of these functions.
	 */
	function ResultObserver() {}

	/**
	 * This function is triggered when the data, whose name in the first parameter, change
	 *
	 * @param name The name of the underlying data of the field
	 * @param value The new value of the underlying data
	 *
	 * @return void
	 */
	ResultObserver.field = function(name, value) {
		console.log(name + ' => ' + value);
		// do something when the value of the data has been changed
	}

	/**
	 * This function is triggered when the user clicks the button whose name is in the first parameter
	 *
	 * @param name The name of the button
	 *
	 * @param what Indicates the type of button, either 'submit' or 'reset'
	 *
	 * @param f0r If "what" is a submit button, this param take the following value:
	 *    - priorStep: the previous step of the simulation is displayed
	 *    - currentStep: some actions have been performed and the display remains on the current step.
	 *    - nextStep: the next step of the simulation is displayed
	 *    - jumpToStep: the step of the simulation, whose number is in the uri argument, is displayed
	 *    - newSimulation: The simulation starts over with new data
	 *    - externalPage: The page, whose url appears in the fourth argument, is displayed
	 *
	 * @param uri The step number if the third argument contains "jumpToStep" or an url if the third argument contains "externalPage"
	 *
	 * @return void
	 */
	ResultObserver.button = function(name, what, f0r, uri) {
		console.log(name + ' => ' + what + ':' + f0r);
		// do something when the button has been clicked
	}

	global.ResultObserver = ResultObserver;
}(this));
```
## Correction of presentation styles
You can adjust the CSS as needed to match the theme of your site in the file `modules/Simulators/css/style.css`

It is recommended to use the most specific selectors possible so that the defined styles take priority over the styles provided with the API

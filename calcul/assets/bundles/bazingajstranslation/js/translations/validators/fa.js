(function (t) {
// fa
t.add("This value should be false.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0646\u0627\u062f\u0631\u0633\u062a(False) \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be true.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u062f\u0631\u0633\u062a(True) \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be of type {{ type }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0627\u0632 \u0646\u0648\u0639 {{ type }} \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be blank.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u062e\u0627\u0644\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The value you selected is not a valid choice.", "\u0645\u0642\u062f\u0627\u0631 \u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u062f\u0647 \u0634\u0627\u0645\u0644 \u06af\u0632\u06cc\u0646\u0647 \u0647\u0627\u06cc \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("You must select at least {{ limit }} choice.|You must select at least {{ limit }} choices.", "\u0628\u0627\u06cc\u062f \u062d\u062f\u0627\u0642\u0644 {{ limit }} \u06af\u0632\u06cc\u0646\u0647 \u0627\u0646\u062a\u062e\u0627\u0628 \u0646\u0645\u0627\u06cc\u06cc\u062f.|\u0628\u0627\u06cc\u062f \u062d\u062f\u0627\u0642\u0644 {{ limit }} \u06af\u0632\u06cc\u0646\u0647 \u0627\u0646\u062a\u062e\u0627\u0628 \u0646\u0645\u0627\u06cc\u06cc\u062f.", "validators", "fa");
t.add("You must select at most {{ limit }} choice.|You must select at most {{ limit }} choices.", "\u062d\u062f\u0627\u06a9\u062b\u0631 {{ limit }} \u06af\u0632\u06cc\u0646\u0647 \u0645\u06cc \u062a\u0648\u0627\u0646\u06cc\u062f \u0627\u0646\u062a\u062e\u0627\u0628 \u0646\u0645\u0627\u06cc\u06cc\u062f.|\u062d\u062f\u0627\u06a9\u062b\u0631 {{ limit }} \u06af\u0632\u06cc\u0646\u0647 \u0645\u06cc \u062a\u0648\u0627\u0646\u06cc\u062f \u0627\u0646\u062a\u062e\u0627\u0628 \u0646\u0645\u0627\u06cc\u06cc\u062f.", "validators", "fa");
t.add("One or more of the given values is invalid.", "\u06cc\u06a9 \u06cc\u0627 \u0686\u0646\u062f \u0645\u0642\u062f\u0627\u0631 \u0646\u0627\u0645\u0639\u062a\u0628\u0631 \u0648\u062c\u0648\u062f \u062f\u0627\u0631\u062f.", "validators", "fa");
t.add("The fields {{ fields }} were not expected.", "\u0641\u06cc\u0644\u062f\u0647\u0627\u06cc {{ fields }} \u0634\u0627\u0645\u0644 \u0641\u06cc\u0644\u062f\u0647\u0627\u06cc \u0645\u0648\u0631\u062f \u0627\u0646\u062a\u0638\u0627\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u0646\u062f.", "validators", "fa");
t.add("The fields {{ fields }} are missing.", "\u0641\u06cc\u0644\u062f\u0647\u0627\u06cc {{ fields }} \u06a9\u0645 \u0647\u0633\u062a\u0646\u062f.", "validators", "fa");
t.add("This value is not a valid date.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 \u062a\u0627\u0631\u06cc\u062e \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid datetime.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 \u062a\u0627\u0631\u06cc\u062e \u0648 \u0632\u0645\u0627\u0646 \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid email address.", "\u0627\u06cc\u0646 \u06cc\u06a9 \u0631\u0627\u06cc\u0627\u0646\u0627\u0645\u0647 \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The file could not be found.", "\u0641\u0627\u06cc\u0644 \u06cc\u0627\u0641\u062a \u0646\u0634\u062f.", "validators", "fa");
t.add("The file is not readable.", "\u067e\u0631\u0648\u0646\u062f\u0647 \u062e\u0648\u0627\u0646\u062f\u0646\u06cc \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The file is too large ({{ size }} {{ suffix }}). Allowed maximum size is {{ limit }} {{ suffix }}.", "\u0641\u0627\u06cc\u0644 \u0628\u06cc\u0634 \u0627\u0632 \u0627\u0646\u062f\u0627\u0632\u0647 \u0628\u0632\u0631\u06af \u0627\u0633\u062a({{ size }} {{ suffix }}). \u062d\u062f\u0627\u06a9\u062b\u0631 \u0627\u0646\u062f\u0627\u0632\u0647 \u0645\u062c\u0627\u0632 \u0628\u0631\u0627\u0628\u0631 \u0628\u0627 {{ limit }} {{ suffix }} \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The mime type of the file is invalid ({{ type }}). Allowed mime types are {{ types }}.", "\u0627\u06cc\u0646 \u0646\u0648\u0639 \u0641\u0627\u06cc\u0644 \u0645\u062c\u0627\u0632 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f({{ type }}). \u0646\u0648\u0639 \u0647\u0627\u06cc \u0645\u062c\u0627\u0632 \u0634\u0627\u0645\u0644 {{ types }} \u0645\u06cc \u0628\u0627\u0634\u0646\u062f.", "validators", "fa");
t.add("This value should be {{ limit }} or less.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u06a9\u0648\u0686\u06a9\u062a\u0631 \u0648 \u06cc\u0627 \u0645\u0633\u0627\u0648\u06cc {{ limit }} \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is too long. It should have {{ limit }} character or less.|This value is too long. It should have {{ limit }} characters or less.", "\u0628\u0633\u06cc\u0627\u0631 \u0637\u0648\u0644\u0627\u0646\u06cc \u0627\u0633\u062a.\u062d\u062f\u0627\u06a9\u062b\u0631 \u062a\u0639\u062f\u0627\u062f \u062d\u0631\u0648\u0641 \u0645\u062c\u0627\u0632 \u0628\u0631\u0627\u0628\u0631 {{ limit }} \u0645\u06cc \u0628\u0627\u0634\u062f.|\u0628\u0633\u06cc\u0627\u0631 \u0637\u0648\u0644\u0627\u0646\u06cc \u0627\u0633\u062a.\u062d\u062f\u0627\u06a9\u062b\u0631 \u062a\u0639\u062f\u0627\u062f \u062d\u0631\u0648\u0641 \u0645\u062c\u0627\u0632 \u0628\u0631\u0627\u0628\u0631 {{ limit }} \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be {{ limit }} or more.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0628\u0632\u0631\u06af\u062a\u0631 \u0648 \u06cc\u0627 \u0645\u0633\u0627\u0648\u06cc {{ limit }} \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is too short. It should have {{ limit }} character or more.|This value is too short. It should have {{ limit }} characters or more.", "\u0645\u0642\u062f\u0627\u0631 \u0648\u0627\u0631\u062f \u0634\u062f\u0647 \u0628\u0633\u06cc\u0627\u0631 \u06a9\u0648\u062a\u0627\u0647 \u0627\u0633\u062a.\u062a\u0639\u062f\u0627\u062f \u062d\u0631\u0648\u0641 \u0648\u0627\u0631\u062f \u0634\u062f\u0647\u060c \u0628\u0627\u06cc\u062f \u062d\u062f\u0627\u0642\u0644 \u0634\u0627\u0645\u0644 {{ limit }} \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631 \u0628\u0627\u0634\u062f.|\u0645\u0642\u062f\u0627\u0631 \u0648\u0627\u0631\u062f \u0634\u062f\u0647 \u0628\u0633\u06cc\u0627\u0631 \u06a9\u0648\u062a\u0627\u0647 \u0627\u0633\u062a.\u062a\u0639\u062f\u0627\u062f \u062d\u0631\u0648\u0641 \u0648\u0627\u0631\u062f \u0634\u062f\u0647\u060c \u0628\u0627\u06cc\u062f \u062d\u062f\u0627\u0642\u0644 \u0634\u0627\u0645\u0644 {{ limit }} \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should not be blank.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0646\u0628\u0627\u06cc\u062f \u062e\u0627\u0644\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should not be null.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0634\u0627\u0645\u0644 \u0686\u06cc\u0632\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be null.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0634\u0627\u0645\u0644 \u0686\u06cc\u0632\u06cc \u0646\u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not valid.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid time.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 \u0632\u0645\u0627\u0646 \u0635\u062d\u06cc\u062d \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid URL.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0634\u0627\u0645\u0644 \u06cc\u06a9 URL \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The two values should be equal.", "\u062f\u0648 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0628\u0627 \u06cc\u06a9\u062f\u06cc\u06af\u0631 \u0628\u0631\u0627\u0628\u0631 \u0628\u0627\u0634\u0646\u062f.", "validators", "fa");
t.add("The file is too large. Allowed maximum size is {{ limit }} {{ suffix }}.", "\u0641\u0627\u06cc\u0644 \u0628\u06cc\u0634 \u0627\u0632 \u0627\u0646\u062f\u0627\u0632\u0647 \u0628\u0632\u0631\u06af \u0627\u0633\u062a. \u062d\u062f\u0627\u06a9\u062b\u0631 \u0627\u0646\u062f\u0627\u0632\u0647 \u0645\u062c\u0627\u0632 \u0628\u0631\u0627\u0628\u0631 \u0628\u0627 {{ limit }} {{ suffix }} \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The file is too large.", "\u0641\u0627\u06cc\u0644 \u0628\u06cc\u0634 \u0627\u0632 \u0627\u0646\u062f\u0627\u0632\u0647 \u0628\u0632\u0631\u06af \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The file could not be uploaded.", "\u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc \u0641\u0627\u06cc\u0644 \u0628\u0627 \u0634\u06a9\u0633\u062a \u0645\u0648\u0627\u062c\u0647 \u06af\u0631\u062f\u06cc\u062f.", "validators", "fa");
t.add("This value should be a valid number.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u06cc\u06a9 \u0639\u062f\u062f \u0645\u0639\u062a\u0628\u0631 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This file is not a valid image.", "\u0627\u06cc\u0646 \u0641\u0627\u06cc\u0644 \u06cc\u06a9 \u062a\u0635\u0648\u06cc\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This is not a valid IP address.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 IP \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid language.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 \u0632\u0628\u0627\u0646 \u0635\u062d\u06cc\u062d \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid locale.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 \u0645\u062d\u0644 \u0635\u062d\u06cc\u062d \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid country.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 \u06a9\u0634\u0648\u0631 \u0635\u062d\u06cc\u062d \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is already used.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0642\u0628\u0644\u0627 \u0645\u0648\u0631\u062f \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0642\u0631\u0627\u0631 \u06af\u0631\u0641\u062a\u0647 \u0627\u0633\u062a.", "validators", "fa");
t.add("The size of the image could not be detected.", "\u0627\u0646\u062f\u0627\u0632\u0647 \u062a\u0635\u0648\u06cc\u0631 \u0642\u0627\u0628\u0644 \u0634\u0646\u0627\u0633\u0627\u06cc\u06cc \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image width is too big ({{ width }}px). Allowed maximum width is {{ max_width }}px.", "\u0637\u0648\u0644 \u062a\u0635\u0648\u06cc\u0631 \u0628\u0633\u06cc\u0627\u0631 \u0628\u0632\u0631\u06af \u0627\u0633\u062a({{ width }}px). \u0628\u06cc\u0634\u06cc\u0646\u0647 \u0637\u0648\u0644 \u0645\u062c\u0627\u0632 {{ max_width }}px \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image width is too small ({{ width }}px). Minimum width expected is {{ min_width }}px.", "\u0637\u0648\u0644 \u062a\u0635\u0648\u06cc\u0631 \u0628\u0633\u06cc\u0627\u0631 \u06a9\u0648\u0686\u06a9 \u0627\u0633\u062a({{ width }}px). \u06a9\u0645\u06cc\u0646\u0647 \u0637\u0648\u0644 \u0645\u0648\u0631\u062f\u0646\u0638\u0631 {{ min_width }}px \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image height is too big ({{ height }}px). Allowed maximum height is {{ max_height }}px.", "\u0627\u0631\u062a\u0641\u0627\u0639 \u062a\u0635\u0648\u06cc\u0631 \u0628\u0633\u06cc\u0627\u0631 \u0628\u0632\u0631\u06af \u0627\u0633\u062a({{ height }}px). \u0628\u06cc\u0634\u06cc\u0646\u0647 \u0627\u0631\u062a\u0641\u0627\u0639 \u0645\u062c\u0627\u0632 {{ max_height }}px \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image height is too small ({{ height }}px). Minimum height expected is {{ min_height }}px.", "\u0627\u0631\u062a\u0641\u0627\u0639 \u062a\u0635\u0648\u06cc\u0631 \u0628\u0633\u06cc\u0627\u0631 \u06a9\u0648\u0686\u06a9 \u0627\u0633\u062a({{ height }}px). \u06a9\u0645\u06cc\u0646\u0647 \u0627\u0631\u062a\u0641\u0627\u0639 \u0645\u0648\u0631\u062f\u0646\u0638\u0631 {{ min_height }}px \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be the user's current password.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u06a9\u0644\u0645\u0647 \u0639\u0628\u0648\u0631 \u06a9\u0646\u0648\u0646\u06cc \u06a9\u0627\u0631\u0628\u0631 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should have exactly {{ limit }} character.|This value should have exactly {{ limit }} characters.", " \u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u062f\u0642\u06cc\u0642\u0627 {{ limit }} \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631 \u062f\u0627\u0634\u062a\u0647 \u0628\u0627\u0634\u062f.| \u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u062f\u0642\u06cc\u0642\u0627 {{ limit }} \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631 \u062f\u0627\u0634\u062a\u0647 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The file was only partially uploaded.", "\u067e\u0631\u0648\u0646\u062f\u0647 \u0628\u0647 \u0635\u0648\u0631\u062a \u062c\u0632\u06cc\u06cc \u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc \u06af\u0631\u062f\u06cc\u062f\u0647 \u0627\u0633\u062a.", "validators", "fa");
t.add("No file was uploaded.", "\u0647\u06cc\u0686 \u067e\u0631\u0648\u0646\u062f\u0647 \u0627\u06cc \u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc \u0646\u06af\u0631\u062f\u06cc\u062f\u0647 \u0627\u0633\u062a.", "validators", "fa");
t.add("No temporary folder was configured in php.ini.", "\u067e\u0648\u0634\u0647 \u0645\u0648\u0642\u062a\u06cc \u062f\u0631 php.ini \u067e\u06cc\u06a9\u0631\u0628\u0646\u062f\u06cc \u0646\u06af\u0631\u062f\u06cc\u062f\u0647 \u0627\u0633\u062a.", "validators", "fa");
t.add("Cannot write temporary file to disk.", "\u0641\u0627\u06cc\u0644 \u0645\u0648\u0642\u062a\u06cc \u0631\u0627 \u0646\u0645\u06cc \u062a\u0648\u0627\u0646 \u062f\u0631 \u062f\u06cc\u0633\u06a9 \u0646\u0648\u0634\u062a.", "validators", "fa");
t.add("A PHP extension caused the upload to fail.", "\u06cc\u06a9 \u0627\u06a9\u0633\u062a\u0646\u0634\u0646 PHP \u0645\u0648\u062c\u0628 \u0634\u062f \u06a9\u0647 \u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc \u0641\u0627\u06cc\u0644 \u0628\u0627 \u0634\u06a9\u0633\u062a \u0645\u0648\u0627\u062c\u0647 \u06af\u0631\u062f\u062f.", "validators", "fa");
t.add("This collection should contain {{ limit }} element or more.|This collection should contain {{ limit }} elements or more.", "\u0627\u06cc\u0646 \u0645\u062c\u0645\u0648\u0639\u0647 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u062f\u0627\u0631\u0627\u06cc \u062d\u062f\u0627\u0642\u0644 {{ limit }} \u0639\u0646\u0635\u0631 \u06cc\u0627 \u0628\u06cc\u0634\u062a\u0631 \u0628\u0627\u0634\u062f.|\u0627\u06cc\u0646 \u0645\u062c\u0645\u0648\u0639\u0647 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u062f\u0627\u0631\u0627\u06cc \u062d\u062f\u0627\u0642\u0644 {{ limit }} \u0639\u0646\u0635\u0631 \u06cc\u0627 \u0628\u06cc\u0634\u062a\u0631 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This collection should contain {{ limit }} element or less.|This collection should contain {{ limit }} elements or less.", "\u0627\u06cc\u0646 \u0645\u062c\u0645\u0648\u0639\u0647 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u062f\u0627\u0631\u0627\u06cc \u062d\u062f\u0627\u06a9\u062b\u0631 {{ limit }} \u0639\u0646\u0635\u0631 \u06cc\u0627 \u06a9\u0645\u062a\u0631 \u0628\u0627\u0634\u062f.|\u0627\u06cc\u0646 \u0645\u062c\u0645\u0648\u0639\u0647 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u062f\u0627\u0631\u0627\u06cc \u062d\u062f\u0627\u06a9\u062b\u0631 {{ limit }} \u0639\u0646\u0635\u0631 \u06cc\u0627 \u06a9\u0645\u062a\u0631 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This collection should contain exactly {{ limit }} element.|This collection should contain exactly {{ limit }} elements.", "\u0627\u06cc\u0646 \u0645\u062c\u0645\u0648\u0639\u0647 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u0628\u0647 \u0637\u0648\u0631 \u062f\u0642\u06cc\u0642 \u062f\u0627\u0631\u0627\u06cc {{ limit }} \u0639\u0646\u0635\u0631 \u0628\u0627\u0634\u062f.|\u0627\u06cc\u0646 \u0645\u062c\u0645\u0648\u0639\u0647 \u0645\u06cc \u0628\u0627\u06cc\u0633\u062a \u0628\u0647 \u0637\u0648\u0631 \u062f\u0642\u06cc\u0642 \u062f\u0627\u0631\u0627\u06cc {{ limit }} \u0639\u0646\u0635\u0631 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("Invalid card number.", "\u0634\u0645\u0627\u0631\u0647 \u06a9\u0627\u0631\u062a \u0646\u0627\u0645\u0639\u062a\u0628\u0631 \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("Unsupported card type or invalid card number.", "\u0646\u0648\u0639 \u06a9\u0627\u0631\u062a \u067e\u0634\u062a\u06cc\u0628\u0627\u0646\u06cc \u0646\u0645\u06cc \u0634\u0648\u062f \u0648 \u06cc\u0627 \u0634\u0645\u0627\u0631\u0647 \u06a9\u0627\u0631\u062a \u0646\u0627\u0645\u0639\u062a\u0628\u0631 \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This is not a valid International Bank Account Number (IBAN).", "\u0627\u06cc\u0646 \u06cc\u06a9 \u0634\u0645\u0627\u0631\u0647 \u062d\u0633\u0627\u0628 \u0628\u0627\u0646\u06a9 \u0628\u06cc\u0646 \u0627\u0644\u0645\u0644\u0644\u06cc \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f(IBAN).", "validators", "fa");
t.add("This value is not a valid ISBN-10.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 ISBN-10 \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid ISBN-13.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 ISBN-13 \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is neither a valid ISBN-10 nor a valid ISBN-13.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 ISBN-10 \u0635\u062d\u06cc\u062d \u0648 \u06cc\u0627 ISBN-13 \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid ISSN.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 ISSN \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value is not a valid currency.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 \u0648\u0627\u062d\u062f \u067e\u0648\u0644 \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be equal to {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0628\u0631\u0627\u0628\u0631 \u0628\u0627 {{ compared_value }} \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be greater than {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0627\u0632 {{ compared_value }} \u0628\u06cc\u0634\u062a\u0631 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be greater than or equal to {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0628\u0632\u0631\u06af\u062a\u0631 \u0648 \u06cc\u0627 \u0645\u0633\u0627\u0648\u06cc \u0628\u0627 {{ compared_value }} \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be identical to {{ compared_value_type }} {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0628\u0627 {{ compared_value_type }} {{ compared_value }} \u06cc\u06a9\u0633\u0627\u0646 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be less than {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u06a9\u0645\u062a\u0631 \u0627\u0632 {{ compared_value }} \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be less than or equal to {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u06a9\u0645\u062a\u0631 \u0648 \u06cc\u0627 \u0645\u0633\u0627\u0648\u06cc \u0628\u0627 {{ compared_value }} \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should not be equal to {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0646\u0628\u0627\u06cc\u062f \u0628\u0627 {{ compared_value }} \u0628\u0631\u0627\u0628\u0631 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should not be identical to {{ compared_value_type }} {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0646\u0628\u0627\u06cc\u062f \u0628\u0627 {{ compared_value_type }} {{ compared_value }} \u06cc\u06a9\u0633\u0627\u0646 \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image ratio is too big ({{ ratio }}). Allowed maximum ratio is {{ max_ratio }}.", "\u0627\u0628\u0639\u0627\u062f({{ ratio }}) \u0639\u06a9\u0633 \u0628\u06cc\u0634 \u0627\u0632 \u062d\u062f \u0628\u0632\u0631\u06af \u0627\u0633\u062a.\u062d\u062f\u0627\u06a9\u062b\u0631 \u0627\u0628\u0639\u0627\u062f \u0645\u062c\u0627\u0632 {{ max_ratio }} \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image ratio is too small ({{ ratio }}). Minimum ratio expected is {{ min_ratio }}.", "\u0627\u0628\u0639\u0627\u062f({{ ratio }}) \u0639\u06a9\u0633 \u0628\u06cc\u0634 \u0627\u0632 \u062d\u062f \u06a9\u0648\u0686\u06a9 \u0627\u0633\u062a.\u062d\u062f\u0627\u0642\u0644 \u0627\u0628\u0639\u0627\u062f \u0645\u062c\u0627\u0632 {{ min_ratio }} \u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image is square ({{ width }}x{{ height }}px). Square images are not allowed.", "\u0627\u06cc\u0646 \u062a\u0635\u0648\u06cc\u0631 \u06cc\u06a9 \u0645\u0631\u0628\u0639({{ width }}x{{ height }}px) \u0645\u06cc \u0628\u0627\u0634\u062f. \u062a\u0635\u0648\u06cc\u0631 \u0645\u0631\u0628\u0639 \u0645\u062c\u0627\u0632 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image is landscape oriented ({{ width }}x{{ height }}px). Landscape oriented images are not allowed.", "\u0627\u06cc\u0646 \u062a\u0635\u0648\u06cc\u0631 \u0627\u0641\u0642\u06cc({{ width }}x{{ height }}px) \u0645\u06cc \u0628\u0627\u0634\u062f. \u062a\u0635\u0648\u06cc\u0631 \u0627\u0641\u0642\u06cc \u0645\u062c\u0627\u0632 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The image is portrait oriented ({{ width }}x{{ height }}px). Portrait oriented images are not allowed.", "\u0627\u06cc\u0646 \u062a\u0635\u0648\u06cc\u0631 \u0639\u0645\u0648\u062f\u06cc({{ width }}x{{ height }}px) \u0645\u06cc \u0628\u0627\u0634\u062f. \u062a\u0635\u0648\u06cc\u0631 \u0639\u0645\u0648\u062f\u06cc \u0645\u062c\u0627\u0632 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("An empty file is not allowed.", "\u067e\u0631\u0648\u0646\u062f\u0647 \u062e\u0627\u0644\u06cc \u0645\u062c\u0627\u0632 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("The host could not be resolved.", "\u0645\u06cc\u0632\u0628\u0627\u0646 \u0642\u0627\u0628\u0644 \u062d\u0644 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value does not match the expected {{ charset }} charset.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0645\u0637\u0627\u0628\u0642 \u0628\u0627 \u0645\u0642\u062f\u0627\u0631 \u0645\u0648\u0631\u062f \u0627\u0646\u062a\u0638\u0627\u0631 {{ charset }} \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This is not a valid Business Identifier Code (BIC).", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9(BIC) \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("Error", "\u062e\u0637\u0627", "validators", "fa");
t.add("This is not a valid UUID.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u06cc\u06a9 UUID \u0645\u0639\u062a\u0628\u0631 \u0646\u0645\u06cc \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This value should be a multiple of {{ compared_value }}.", "\u0627\u06cc\u0646 \u0645\u0642\u062f\u0627\u0631 \u0628\u0627\u06cc\u062f \u0686\u0646\u062f \u0628\u0631\u0627\u0628\u0631 {{ compared_value }} \u0628\u0627\u0634\u062f.", "validators", "fa");
t.add("This Business Identifier Code (BIC) is not associated with IBAN {{ iban }}.", "\u0627\u06cc\u0646(BIC) \u0628\u0627 IBAN \u0627\u0631\u062a\u0628\u0627\u0637\u06cc \u0646\u062f\u0627\u0631\u062f.", "validators", "fa");
})(Translator);

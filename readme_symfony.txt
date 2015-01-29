Intallation simulateur 
======================

1) se placer dans le <DOCUMENT_ROOT> du serveur
2) composer create-project symfony/framework-standard-edition simulateur/
	Generating autoload files
	Would you like to install Acme demo bundle? [y/N] N
	Creating the "app/config/parameters.yml" file
	Some parameters are missing. Please provide them.
	database_driver (pdo_mysql):
	database_host (127.0.0.1):
	database_port (null):
	database_name (symfony):
	database_user (root):
	database_password (null):
	mailer_transport (smtp):
	mailer_host (127.0.0.1):
	mailer_user (null):
	mailer_password (null):
	locale (en): fr
	secret (ThisTokenIsNotSoSecretChangeIt):
3) cd simulateur
4) composer require "willdurand/js-translation-bundle:@stable"
5) renommer le répertoire "web" en "calcul"
6) ouvrir composer.json et rechercher "symfony-web-dir": "web", en fin de fichier puis remplacer web par calcul : "symfony-web-dir": "calcul",
7) cd vendor
8) extraire l'archive simulateur-vendor.zip
9) cd ../src
10) extraire l'archive simulateur-src-EUREKA.zip
11) supprimer le répertoire AppBundle s'il existe
12) cd ../app
13) ouvir le fichier autoload.php et ajouter les 2 lignes ci-dessous avant la dernière ligne (return $loader;)
	$loader->add('mPDF_', __DIR__.'/../vendor/mpdf/lib');
	$loader->add('mDetect_', __DIR__.'/../vendor/Mobile-Detect/lib');
14) ouvrir le fichier AppKernel.php, rechercher la ligne : new AppBundle\AppBundle(), la remplacer par les 2 lignes ci_dessous :
			new Bazinga\Bundle\JsTranslationBundle\BazingaJsTranslationBundle(),
            new EUREKA\G6KBundle\EUREKAG6KBundle(),
15) cd config
16) ouvrir le fichier config.yml et decommenter la ligne :     translator:      { fallback: "%locale%" }
17) ouvrir le fichier routing.yml et remplacer son contenu par les lignes ci-dessous :
eureka_g6k:
    resource: "@EUREKAG6KBundle/Resources/config/routing.yml"
    prefix:   /

_bazinga_jstranslation:
    resource: "@BazingaJsTranslationBundle/Resources/config/routing/routing.yml"
18) cd ../..
19) php app/console bazinga:js-translation:dump calcul

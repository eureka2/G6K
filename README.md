# G6K

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![SymfonyInsight](https://insight.symfony.com/projects/c84bb3b7-3ba8-4513-821b-bbcd35364fdb/mini.svg)](https://insight.symfony.com/projects/c84bb3b7-3ba8-4513-821b-bbcd35364fdb)
[![Total Downloads](https://img.shields.io/packagist/dt/eureka2/g6k.svg?style=flat-square)](https://packagist.org/packages/eureka2/g6k)

G6K is a tool that enables the creation and online publishing of calculation simulators without coding. It has a simulation engine and an administration module.

A calculation simulator is an online service made available to a user to enable them to calculate the results (taxes, social benefits, etc.) corresponding to their particular situation. The results are calculated on the basis of data supplied by the user, reference data (eg amount of a tax) and business rules reflecting the current legislation in the field of simulation.

[Learn more](http://eureka2.github.io/g6k/documentation/en/learn-more.html)

## Table of contents
1. [Prerequisites for Symfony](#prerequisites-for-symfony)
1. [Prerequisites for G6K](#prerequisites-for-g6k)
1. [Installation](#installation)
1. [Web server configuration](#web-server-configuration)
1. [Documentation](#documentation)
1. [Code quality](#code-quality)
1. [Innovation Award](#innovation-award)
1. [Copyright and license](#copyright-and-license)

## Prerequisites for Symfony
* PHP Version 7.1.3+
* JSON enabled
* ctype
* date.timezone in php.ini
* auto_detect_line_endings = On in php.ini
* PHP-XML module 
* 2.6.21+ version of libxml
* PHP tokenizer 
* Modules mbstring, iconv, POSIX (only on * nix), Intl with ICU 4+, and APCU 3.0.17+ APC (highly recommended) must be installed
* recommended php.ini settings:
  * short_open_tag = Off
  * magic_quotes_gpc = Off
  * register_globals = Off
  * session.auto_start = Off

## Prerequisites for G6K
* PDO enabled
* pdo_pgsql and / or pdo_sqlite activated
* pgsql and / or sqlite3 activated
* SimpleXML enabled
* serialize_precision = -1

## Installation
1. If you plan to use MySQL or PostgreSQL, create a user with "CREATE DATABASE" and "CREATE TABLE" privileges using the administration tool of your RDBMS.
2. Be placed in the <DOCUMENT_ROOT> Web Server
3. Download composer.phar (https://getcomposer.org/download/) in <DOCUMENT_ROOT>. composer 1.7.2+ is required.
4. Under a shell or DOS, execute: ``php -d memory_limit=-1 composer.phar create-project eureka2/g6k simulator/ 3.4.*`` 
5. Enter the parameter values required by the installer, including:
  * database_driver => pdo_pgsl, pdo_mysql or pdo_sqlite
  * database_host => name or IP address of your database server (simply &lt;Enter&gt; in case of SQLite)
  * database_port => port of the database server (simply &lt;Enter&gt; in case of SQLite)
  * database_name => name of the database where the users of the administration interface will be installed 1. (simply &lt;Enter&gt; in case of SQLite)
  * database_user => User name for connecting to the database (simply &lt;Enter&gt; in case of SQLite)
  * database_password => this user's password (simply &lt;Enter&gt; in case of SQLite)
  * database_path => used in the case of SQLite and ignored in other cases, so make &lt;Enter&gt;
  * locale => en 

Normally the installer displays the message 'Installing the users of the administration interface'  
However, on some platforms, this message does not appear. If so, run the following commands:  
``cd simulator``  
``php ../composer.phar run-script post-install-cmd``

## Web server configuration

### Adding Rewrite Rules
G6K comes with a `.htaccess` file in the `calcul/` directory that contains the rewrite rules.

`/admin/...` is rewritten in `/admin.php/...` and all other queries in `/index.php/...`.

Thus, the `admin.php` and` index.php` front-end controllers can be omitted from the request urls.

### Apache
You must add the `AllowOverride All` directive in the `VirtualHost` block of the server configuration. 

Assuming G6K is installed in the directory `/var/www/html/simulator` :

```
<VirtualHost *:80>
    ServerName domain.tld
    ServerAlias www.domain.tld

    DocumentRoot /var/www/html/simulator
    <Directory /var/www/html/simulator>
        AllowOverride All
        Order Allow,Deny
        Allow from All
    </Directory>

    # other directives

</VirtualHost>
```

For best performance, rewrite rules can be moved from the `.htaccess` file to the `VirtualHost` block of the server configuration.

In this case, change `AllowOverride All` to `AllowOverride None` and delete the `.htaccess` file.

```
<VirtualHost *:80>
    ServerName domain.tld
    ServerAlias www.domain.tld

    DocumentRoot /var/www/html/simulator
    <Directory /var/www/html/simulator>
        AllowOverride None
        Order Allow,Deny
        Allow from All
    </Directory>
    <Directory /var/www/html/simulator/calcul>
        # rewrite rules from .htaccess
    </Directory>

    # other directives

</VirtualHost>
```

For security reasons, the <DOCUMENT_ROOT> can be set to the `calcul/` directory : `DocumentRoot /var/www/html/simulator/calcul`

In this case, `calcul/` should be omitted from the path of the request URL.

```
<VirtualHost *:80>
    ServerName domain.tld
    ServerAlias simulators.domain.tld

    DocumentRoot /var/www/html/simulator/calcul
    <Directory /var/www/html/simulator/calcul>
        # rewrite rules from .htaccess
        AllowOverride None
        Order Allow,Deny
        Allow from All
    </Directory>

    # other directives

</VirtualHost>
```

### NGinx

```
# /etc/nginx/sites-enabled/your-site.com

##########################################
##########################################

##            your-site.com             ##

##########################################
##########################################

##   General server setup in default    ##

##########################################
##########################################

## Apex to WWW ##
## HTTPS ##
server {

  ## Ports ##
  ## Uncomment these to accept HTTP inbound requests ##
  #listen 80; 
  #listen [::]:80;
  
  listen 443 ssl;
  listen [::]:443 ssl;

  ## Details ##
  ## Only accept WWW ##
  server_name your-site.com; # can be subdomain #

  ## Root ##
  root /var/www/g6k/calcul;

  ## Restrict Access ##
  ## If you only want certain IP's to access the server ##
  ## Delete this if you don't care ##
  allow 23.227.38.32;
  allow 86.22.27.94;
  deny all;

  ## G6K App ##
  rewrite ^/app\.php/?(.*)$ /$1 permanent;

  ## PHP ##
  try_files $uri @rewriteapp;

  ## Admin ##
  ## Required for the admin area (this is in .htaccess inside /calcul) ##
  location /admin {
    rewrite ^(.*)$ /app_admin.php/$1 last;
  }

  ## Main ##
  location @rewriteapp {
    rewrite ^(.*)$ /app.php/$1 last;
  }

  ## SSL ##
  include /etc/nginx/ssl.conf;

  ## Certs ##
  ssl_certificate     /etc/letsencrypt/live/your-site.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-site.com/privkey.pem;

  ## Symfony ##
  ## PRODUCTION ENV ##
  location ~ ^/(app|app_admin)\.php(/|$) {
    fastcgi_pass unix:/var/run/php/php7.2-fpm.sock; #-> this needs to be your php-fpm location
    fastcgi_split_path_info ^(.+\.php)(/.*)$;
    include fastcgi_params;
    # When you are using symlinks to link the document root to the
    # current version of your application, you should pass the real
    # application path instead of the path to the symlink to PHP
    # FPM.
    # Otherwise, PHP's OPcache may not properly detect changes to
    # your PHP files (see https://github.com/zendtech/ZendOptimizerPlus/issues/126
    # for more information).
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    fastcgi_param DOCUMENT_ROOT $realpath_root;
    # Prevents URIs that include the front controller. This will 404:
    # http://domain.tld/app.php/some-path
    # Remove the internal directive to allow URIs like this
    internal;
  }

  ## Favicons ##
  location = /favicon.ico {
    access_log     off;
    log_not_found  off;
  }

  # static file 404's aren't logged and expires header is set to maximum age
  location ~* \.(jpg|jpeg|gif|css|png|js|ico|html)$ {
    access_log off;
    expires max;
  }

  ## PHP ##
  # return 404 for all other php files not matching the front controller
  # this prevents access to other php files you don't want to be accessible.
  location ~ \.php$ {
    return 404;
  }

  ## DENY ALL . FILES ##
  ## Don't need to use Apache's stuff in NGinx ##
  location ~ /\. {
    deny  all;
  }

  ## STATIC ASSETS ##
  ## Used to store images, CSS/JS etc ##
  location /(bundles|media) {
    access_log off;
    expires 30d;

    try_files $uri @rewriteapp;
  }

  ## LOGS ##
  error_log /var/log/nginx/g6k_error.log;
  access_log /var/log/nginx/g6k_access.log;

}
```

##########################################
##########################################

## Documentation

### Administrator's Guide

[ [en](http://eureka2.github.io/g6k/documentation/en/index.html) ] 
[ [fr](http://eureka2.github.io/g6k/documentation/fr/index.html) ] 

### Classes

[Documentation of G6K classes](http://eureka2.github.io/g6k/documentation/classes/4.x)

## Code quality

[![SymfonyInsight](https://insight.symfony.com/projects/c84bb3b7-3ba8-4513-821b-bbcd35364fdb/big.svg)](https://insight.symfony.com/projects/c84bb3b7-3ba8-4513-821b-bbcd35364fdb)

## Innovation Award

<table class="framed light" border>
  <tr>
    <td>
      <a href="https://www.phpclasses.org/" title="PHP Classes" alt="PHP Classes">
        <img src="https://files.phpclasses.org/graphics/phpclasses/logo-small-phpclasses.svg" width="75" height="24" alt="PHP Classes" style="vertical-align: top">
      </a>
     </td>
    <td>
     <b><a href="https://www.phpclasses.org/package/10556-PHP-Generate-simulator-tools-to-perform-calculations.html">G6K</a>
       By <a href="https://www.phpclasses.org/browse/author/549500.html">eureka2</a></b>
     </td>
    <td>
      <a href="https://www.phpclasses.org/award/innovation/"><img src="https://www.phpclasses.org/award/innovation/nominee.gif" width="89" height="89" alt="PHP Programming Innovation award nominee" title="PHP Programming Innovation award nominee" border="0"></a><br><b><span style="font-size: large">April 2018 Number 6</span></b>
    </td>
  </tr>
  <tr>
    <td colspan="3">
      There are many sites that are useful because they provide means to let the users perform calculations of some kind from simple values entered in Web forms.
      <br>
      This package provides a Web interface to implement a generic system for designing and providing access to pages that provide several types of calculator tools.
      <br>
      Manuel Lemos
	</td>
  </tr>
</table>

## Copyright and license

&copy; 2015-2018 Eureka2 - Jacques Archimède. Code released under the [MIT license](https://github.com/eureka2/G6K/blob/master/LICENSE).

**[&uparrow; back to table of contents](#table-of-contents)**

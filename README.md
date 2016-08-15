# G6K

## Prerequisites for Symfony 2
  * PHP Version 5.3.3 + (recommended 5.5.9+)
  * JSON enabled
  * ctype
  * date.timezone in php.ini
  * PHP-XML module installed
  * 2.6.21+ version of libxml
  * PHP tokenizer installed
  * Modules mbstring, iconv, POSIX (only on * nix),? Intl with ICU 4+, and APCU 3.0.17+ APC (highly recommended) must be installed
  * recommended php.ini settings:
         short_open_tag = Off
         magic_quotes_gpc = Off
         register_globals = Off
         session.auto_start = Off

## Prerequisites for G6K
  * PDO enabled
  * pdo_pgsql and / or pdo_sqlite activated
  * pgsql and / or sqlite3 activated
  * SimpleXML enabled

Be placed in the <DOCUMENT_ROOT> Web Server
Download composer.phar (https://getcomposer.org/download/) in <DOCUMENT_ROOT>
Optional DOS windows (if proxy): 
set HTTPS_PROXY_REQUEST_FULLURI = false 
set http_proxy = XXX.XXX.XXX.XXX:? = 8080 
set https_proxy XXX.XXX.XXX.XXX: 8080
Under a shell or DOS, execute: 
php composer.phar create-project eureka2/g6k simulator/ 
Make available public resources (assets: css, js, images, ...) 
cd simulator 
php app/console assets:Install -symlink calcul
  
## Copyright and license

&copy; 2015 Eureka2 - Jacques Archimède. Code released under the [MIT license](https://github.com/eureka2/G6K/blob/master/LICENSE).
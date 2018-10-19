<?php

namespace App\G6K\Silex;

use Silex\Application;
use Silex\Api\BootableProviderInterface;
use Pimple\Container;
use Pimple\ServiceProviderInterface;

class MobileDetectServiceProvider implements ServiceProviderInterface, BootableProviderInterface
{

    public function register(Container $app)
    {
        $app['mobile_detect'] = function() {
            return new \Mobile_Detect();
        };
    }

    public function boot(Application $app)
    {

    }
}

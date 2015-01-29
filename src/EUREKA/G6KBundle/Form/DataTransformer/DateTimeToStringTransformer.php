<?php

namespace EUREKA\G6KBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;

class DateTimeToStringTransformer implements DataTransformerInterface
{

    public function __construct()
    {   
    }

    /**
     * @param \DateTime|null $datetime
     * @return string
     */
    public function transform($datetime)
    {
        if (null === $datetime) {
            return '';
        }       
        return $datetime->format('d/m/Y');
    }

    /**
     * @param  string $datetimeString
     * @return \DateTime
     */
    public function reverseTransform($datetimeString)
    {
		if (preg_match("/^\d\d\d\d-\d\d?-\d\d?$/", $datetimeString)) {
			$datetime = \DateTime::createFromFormat("Y-m-d", $datetimeString);
		} elseif (preg_match("/^\d\d?\/\d\d?\/\d\d\d\d$/", $datetimeString)) {
			$datetime = \DateTime::createFromFormat("d/m/Y", $datetimeString);
		} else {
			return null;
		}
		$errors = \DateTime::getLastErrors();
		if ($errors['error_count'] > 0) {
			return null;;
		}
        return $datetime;
    }
} 
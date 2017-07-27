<?php

namespace EUREKA\G6KBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;

class MontantToStringTransformer implements DataTransformerInterface
{

    public function __construct()
    {   
    }

    /**
     * @param float|null $montant
     * @return string
     */
    public function transform($montant)
    {
        if (null === $montant || $montant == 0) {
            return null;
        }       
 		$montant = preg_replace("/,/", ".", $montant."");
        if (! is_numeric($montant)) {
            return $montant;
        } 
        return sprintf("%01.2f", round(floatval($montant), 2, PHP_ROUND_HALF_EVEN));
    }

    /**
     * @param  string $montant
     * @return float
     */
    public function reverseTransform($montant)
    {
        if (null === $montant || $montant == '') {
            return null;
        } 
		$montant = preg_replace("/,/", ".", $montant);
        if (! is_numeric($montant)) {
            return 0;
        } 
        return round(floatval($montant), 2, PHP_ROUND_HALF_EVEN);
    }
} 

?>

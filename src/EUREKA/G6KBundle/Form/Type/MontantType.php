<?php

namespace EUREKA\G6KBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\FormBuilderInterface;
use EUREKA\G6KBundle\Form\DataTransformer\MontantToStringTransformer;

class MontantType extends AbstractType
{

    public function __construct()
    {
    }

    public function getName()
    {
        return 'montant';
    }

    public function getParent()
    {
        return 'money';
    }   

     public function buildForm(FormBuilderInterface $builder, array $options)
    {   
        $transformer = new MontantToStringTransformer();
        $builder->addModelTransformer($transformer);
    }   

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        parent::setDefaultOptions($resolver);   
        $resolver->setDefaults(array(
        ));
    }    
}

?>

<?php

/*
The MIT License (MIT)

Copyright (c) 2017 Jacques Archimède

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

namespace EUREKA\G6KBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\FormBuilderInterface;
use EUREKA\G6KBundle\Form\DataTransformer\DateTimeToStringTransformer;

/**
 *
 * This class creates a form item type for a hidden date
 *
 * @copyright Jacques Archimède
 *
 */
class HiddenDateTimeType extends AbstractType
{

	/**
	 * Constructor of class HiddenDateTimeType
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __construct() {
	}

	/**
	 * Returns the name of this type.
	 *
	 * @access  public
	 * @return  string The name of this type
	 *
	 */
	public function getName() {
		return 'hidden_datetime';
	}

	/**
	 * Returns the name of the parent type.
	 *
	 * @access  public
	 * @return  string The name of the parent type
	 *
	 */
	public function getParent() {
		return 'hidden';
	}

	/**
	 * Builds the form.
	 *
	 * @access  public
	 * @param   \Symfony\Component\Form\FormBuilderInterface $builder The form builder
	 * @param   array $options The options
	 * @return  void
	 *
	 */
	 public function buildForm(FormBuilderInterface $builder, array $options) {
		$transformer = new DateTimeToStringTransformer();
		$builder->addModelTransformer($transformer);
	}

	/**
	 * Sets the default options for this type.
	 *
	 * @access  public
	 * @param   \Symfony\Component\OptionsResolver\OptionsResolverInterface $resolver The resolver for the options
	 * @return  void
	 *
	 */
	public function setDefaultOptions(OptionsResolverInterface $resolver) {
		parent::setDefaultOptions($resolver);   
		$resolver->setDefaults(array());
	}
}

?>

<?php

namespace EUREKA\G6KBundle\Entity;

class Constraint {

	private $id = 0;
	private $constraint = ""; // expression = contrôle du contenu
	private $message = ""; // Message d'erreur si la contrainte n'est pas respectée
	
	public function __construct($id, $constraint, $message) {
		$this->id = $id;
		$this->constraint = $constraint;
		$this->message = $message;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function setId($id) {
		$this->id = $id;
	}
	
	public function getConstraint() {
		return $this->constraint;
	}
	
	public function setConstraint($constraint) {
		$this->constraint = $constraint;
	}
	
	public function getMessage() {
		return $this->message;
	}
	
	public function setMessage($message) {
		$this->message = $message;
	}

}



?>
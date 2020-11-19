<?php

/*
The MIT License (MIT)

Copyright (c) 2020 Jacques Archimède

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

namespace App\G6K\Manager;

class XMLSchema {

	private $schema;
	private $types;
	private $attributeGroup;

	public function __construct($projectDir) {
		$doc = new \DOMDocument();
		$doc->preserveWhiteSpace = true;
		$doc->load($projectDir . '/var/data/schemas/Simulator.xsd');
		$xmlfile = tempnam(sys_get_temp_dir(), "XML");
		$doc->save($xmlfile);
		$xml = file_get_contents($xmlfile);
		unlink($xmlfile);
		$xml = str_replace($doc->lastChild->prefix.':', "", $xml);
		$xml = simplexml_load_string($xml);
		$data = json_decode(json_encode($xml, JSON_PRETTY_PRINT), true);
		$this->attributeGroup = [];
		if (isset($data['attributeGroup'])) {
			$this->traverseAttributeGroup($data['attributeGroup']);
		}
		$this->types = [];
		if (isset($data['complexType'])) {
			$this->traverseComplexType($data['complexType']);
		}
		$this->resolveElementsTypes();
		$this->schema = [];
		$this->traverseElement($data['element']);
	}

	public function get() {
		return $this->schema;
	}

	public function exists($element) {
		return isset($this->schema[$element]);
	}

	public function getAttributes($element) {
		return isset($this->schema[$element])
			? $this->schema[$element]
			: [];
	}

	public function getAttributeList($element) {
		$attributes = [];
		if (isset($this->schema[$element])) {
			foreach($this->schema[$element] as $attribute) {
				$attributes[] = $attribute['name'];
			}
		}
		return $attributes;
	}

	private function is_assoc($var) {
		return is_array($var)
			&& array_diff_key(
				$var, 
				array_keys(array_keys($var))
			);
	}

	private function makeAttribute($dataAttributes) {
		$attribute = [
			'name' => $dataAttributes['name'],
			'type' => 'string',
			'required' => isset($dataAttributes['use'])
				&& $dataAttributes['use'] == "required"
		];
		if (isset($dataAttributes['type'])) {
			$attribute['type'] = $dataAttributes['type'];
		}
		return $attribute;
	}

	private function traverseAttributeGroup($group) {
		$name = '';
		$attributes = [];
		if ($this->is_assoc($group)) {
			$name = $group['@attributes']['name'];
			if (isset($group['attribute'])) {
				if ($this->is_assoc($group['attribute'])) {
					$attributes[] = $this->makeAttribute($group['attribute']['@attributes']);
				} elseif (is_array($group['attribute'])) {
					foreach($group['attribute'] as $attr) {
						$attributes[] = $this->makeAttribute($attr['@attributes']);
					}
				}
			}
			$this->attributeGroup[$name] = $attributes;
		} elseif (is_array($group)) {
			foreach($group as $gr) {
				$this->traverseAttributeGroup($gr);
			}
		}
	}

	private function traverseComplexType($complexType) {
		$name = '';
		$attributes = [];
		$elements = [];
		if ($this->is_assoc($complexType)) {
			if (isset($complexType['@attributes'])) {
				$name = $complexType['@attributes']['name'];
			}
			if (isset($complexType['attributeGroup'])) {
				$attrGroup = $complexType['attributeGroup'];
				if (isset($attrGroup['@attributes'])) {
					if (isset($attrGroup['@attributes']['ref'])) {
						$ref = $attrGroup['@attributes']['ref'];
						if (isset($this->attributeGroup[$ref])) {
							$group = $this->attributeGroup[$ref];
							if ($this->is_assoc($group)) {
								$attributes[] = $group;
							} elseif (is_array($group)) {
								foreach($group as $gr) {
									$attributes[] = $gr;
								}
							}
						}
					}
				}
			}
			if (isset($complexType['attribute'])) {
				$attrs = $complexType['attribute'];
				if ($this->is_assoc($attrs)) {
					$attributes[] = $this->makeAttribute($attrs['@attributes']);
				} elseif (is_array($attrs))  {
					foreach($attrs as $attr) {
						$attributes[] = $this->makeAttribute($attr['@attributes']);
					}
				}
			}
			if (isset($complexType['sequence'])) {
				if (isset($complexType['sequence']['element'])) {
					foreach($complexType['sequence']['element'] as $element) {
						if (isset($element['@attributes'])) {
							$elements[] = $element['@attributes'];
						}
					}
				}
				if (isset($complexType['sequence']['choice'])) {
					$this->sequenceType($complexType['sequence']['choice']);
				}
			} elseif (isset($complexType['choice'])) {
				if (isset($complexType['choice']['element'])) {
					foreach($complexType['choice']['element'] as $element) {
						if (isset($element['@attributes'])) {
							$elements[] = $element['@attributes'];
						}
					}
				}
				if (isset($complexType['choice']['sequence'])) {
					$this->choiceType($complexType['choice']['sequence']);
				}
			}
			$this->types[$name] = [];
			if (!empty($attributes)) {
				$this->types[$name]['attributes'] = $attributes;
			}
			if (!empty($elements)) {
				$this->types[$name]['elements'] = $elements;
			}
		} elseif (is_array($complexType)) {
			foreach($complexType as $ct) {
				$this->traverseComplexType($ct);
			}
		}
	}

	private function resolveElementsTypes() {
		foreach($this->types as &$type) {
			$this->resolveElementsType($type);
		}
	}

	private function resolveElementsType(&$complexType) {
		if (isset($complexType['elements'])) {
			foreach($complexType['elements'] as &$element) {
				if (isset($element['type'])) {
					$type = $element['type'];
					if (isset($this->types[$type])) {
						// $this->resolveElementsType($this->types[$type]);
						if (isset($this->types[$type]['attributes'])) {
							$element['attributes'] = &$this->types[$type]['attributes'];
						}
					}
					unset($element['type']);
				}
			}
		}
	}

	private function traverseElement($elt, $ename = '') {
		$name = $ename;
		$type = '';
		$ref = '';
		$attributes = [];
		if ($this->is_assoc($elt)) {
			if (isset($elt['@attributes'])) {
				if (isset($elt['@attributes']['name'])) {
					$name .= "/" . $elt['@attributes']['name'];
				}
				if (isset($elt['@attributes']['type'])) {
					$type = $elt['@attributes']['type'];
				}
				if (isset($elt['@attributes']['ref'])) {
					$ref = $elt['@attributes']['ref'];
				}
			}
			if (isset($elt['complexType'])) {
				if (isset($elt['complexType']['attributeGroup'])) {
					$attrGroup = $elt['complexType']['attributeGroup'];
					if (isset($attrGroup['@attributes'])) {
						if (isset($attrGroup['@attributes']['ref'])) {
							$ref = $attrGroup['@attributes']['ref'];
							if (isset($this->attributeGroup[$ref])) {
								$group = $this->attributeGroup[$ref];
								if ($this->is_assoc($group)) {
									$attributes[] = $group;
								} elseif (is_array($group)) {
									foreach($group as $gr) {
										$attributes[] = $gr;
									}
								}
							}
						}
					}
				}
				if (isset($elt['complexType']['complexContent'])) {
					if (isset($elt['complexType']['complexContent']['extension'])) {
						$extension = $elt['complexType']['complexContent']['extension'];
						if (isset($extension['@attributes'])) {
							if (isset($extension['@attributes']['base'])) {
								$type = $extension['@attributes']['base'];
							}
						}
					}
				}
				if (isset($elt['complexType']['attribute'])) {
					$attrs = $elt['complexType']['attribute'];
					if ($this->is_assoc($attrs)) {
						$attributes[] = $this->makeAttribute($attrs['@attributes']);
					} elseif (is_array($attrs))  {
						foreach($attrs as $attr) {
							$attributes[] = $this->makeAttribute($attr['@attributes']);
						}
					}
				}
				if (isset($elt['complexType']['sequence'])) {
					$this->sequenceElement($elt['complexType']['sequence'], $name);
				}
				if (isset($elt['complexType']['choice'])) {
					$this->choiceElement($elt['complexType']['choice'], $name);
				}
			}
			if ($type != '') {
				if (isset($this->types[$type]) && isset($this->types[$type]['attributes'])) {
					$attributes = array_merge($attributes, $this->types[$type]['attributes']);
				}
				if (isset($this->types[$type]) && isset($this->types[$type]['elements'])) {
					foreach($this->types[$type]['elements'] as $element) {
						$this->schema[$name . "/" . $element['name']] = $element['attributes'] ?? [];
					}
				}
			}
			$this->schema[$name] = $attributes;
		} elseif (is_array($elt)) {
			foreach($elt as $el) {
				$this->traverseElement($el, $name);
			}
		}
	}

	private function sequenceElement($sequence, $name) {
		if ($this->is_assoc($sequence)) {
			if (isset($sequence['choice'])) {
				$this->choiceElement($sequence['choice'], $name);
			}
			if (isset($sequence['element'])) {
				$this->traverseElement($sequence['element'], $name);
			}
		} elseif (is_array($sequence)) {
			foreach($sequence as $seq) {
				$this->sequenceElement($seq, $name);
			}
		}
	}

	private function choiceElement($choice, $name) {
		if ($this->is_assoc($choice)) {
			if (isset($choice['sequence'])) {
				$this->sequenceElement($choice['sequence'], $name);
			}
			if (isset($choice['element'])) {
				$this->traverseElement($choice['element'], $name);
			}
		} elseif (is_array($choice)) {
			foreach($choice as $ch) {
				$this->choiceElement($ch, $name);
			}
		}
	}

	private function sequenceType($sequence) {
		if ($this->is_assoc($sequence)) {
			if (isset($sequence['choice'])) {
				$this->choiceType($sequence['choice']);
			}
			if (isset($sequence['complexType'])) {
				$this->traverseComplexType($sequence['complexType']);
			}
		} elseif (is_array($sequence)) {
			foreach($sequence as $seq) {
				$this->sequenceType($seq);
			}
		}
	}

	private function choiceType($choice) {
		if ($this->is_assoc($choice)) {
			if (isset($choice['sequence'])) {
				$this->sequenceType($choice['sequence']);
			}
			if (isset($choice['complexType'])) {
				$this->traverseComplexType($choice['complexType']);
			}
		} elseif (is_array($choice)) {
			foreach($choice as $ch) {
				$this->choiceType($ch);
			}
		}
	}

}

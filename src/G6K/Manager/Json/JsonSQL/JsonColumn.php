<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2018 Jacques Archimède

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

namespace App\G6K\Manager\Json\JsonSQL;

/**
 * This class provides static functions to update the definition of columns in a JsonSQL database
 *
 * @copyright Jacques Archimède
 *
 */
class JsonColumn  {

	/**
	 * Adds a column in a table of the database
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The name of the new column
	 * @param \stdClass $columnDef The column definition 
	 * @param array $required An array with the column name if required
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function add(Engine $engine, $table, $column, \stdClass $columnDef, $required = array()) {
		if (!isset($engine->getDb()->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (isset($engine->getDb()->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' already exists in $table");
		}
		if (in_array($column, $required) && !isset($columnDef->default)) {
			throw new JsonSQLException("column '$column' in $table can't be required if there is no default value");
		}
		$engine->beginTransaction();
		$engine->getDb()->schema->properties->{$table}->items->properties->$column = $columnDef;
		$engine->getDb()->schema->properties->{$table}->items->required = array_merge($engine->getDb()->schema->properties->{$table}->items->required, $required);
		$newval = isset($columnDef->default) ? $columnDef->default : null;
		foreach ($engine->getDb()->data->{$table} as &$row) {
			$row->$column = $newval;
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Renames a column
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The  actual column name in the table
	 * @param string $newname The new name of the column
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function rename(Engine $engine, $table, $column, $newname) {
		self::checkColumn($engine, $table, $column);
		if (isset($engine->getDb()->schema->properties->{$table}->items->properties->$newname)) {
			throw new JsonSQLException("column '$newname' already exists in $table");
		}
		$engine->beginTransaction();
		$engine->getDb()->schema->properties->{$table}->items->properties->$newname = $engine->getDb()->schema->properties->{$table}->items->properties->$column;
		unset($engine->getDb()->schema->properties->{$table}->items->properties->$column);
		if (($requiredpos = array_search($column, $engine->getDb()->schema->properties->{$table}->items->required)) !== false) {
			array_splice($engine->getDb()->schema->properties->{$table}->items->required, $requiredpos, 1, $newname);
		}
		foreach ($engine->getDb()->data->{$table} as &$row) {
			$row->$newname = $row->$column;
			unset($row->$column);
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Drops a column
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name to drop in the table
	 * @param bool $ifexists if true, don't throw an error if the table or the column doesn't exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function drop(Engine $engine, $table, $column, $ifexists = false) {
		if (!isset($engine->getDb()->schema->properties->{$table})) {
			if ($ifexists) {
				return;
			}
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($engine->getDb()->schema->properties->{$table}->items->properties->$column)) {
			if ($ifexists) {
				return;
			}
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$engine->beginTransaction();
		unset($engine->getDb()->schema->properties->{$table}->items->properties->$column);
		if (($requiredpos = array_search($column, $engine->getDb()->schema->properties->{$table}->items->required)) !== false) {
			array_splice($engine->getDb()->schema->properties->{$table}->items->required, $requiredpos, 1);
		}
		foreach ($engine->getDb()->data->{$table} as &$row) {
			unset($row->$column);
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Changes the type of a column
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name
	 * @param string $type The type of the column
	 * @param string $format The format of the column
	 * @param string $datatype The datatype of the column
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setType(Engine $engine, $table, $column, $type, $format = '', $datatype = '') {
		self::checkColumn($engine, $table, $column);
		$columnSchema = &$engine->getDb()->schema->properties->{$table}->items->properties->$column;
		if (preg_match('/^(.*)\[([^\]]+)\]$/', $columnSchema->title, $m)) {
			$title = $m[1];
			$props = $engine->properties($m[2]);
		} else {
			$title = $columnSchema->title;
			$props = (object)array();
		}
		if ($datatype == '') {
			$datatype = $type;
		}
		if ($type == $columnSchema->type && $datatype == $props->type && ((! isset($columnSchema->format) && $format == '' ) || (isset($columnSchema->format) && $format == $columnSchema->format))) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if (count($engine->getDb()->data->{$table}) == 0) {
			$columnSchema->type = $type;
			if ($format != '') {
				$columnSchema->format = $format;
			} elseif (isset($columnSchema->format)) {
				unset($columnSchema->format);
			}
			if (isset($columnSchema->default)) {
				$columnSchema->default = $engine->normalizeValue($type, $columnSchema->default); 
			}
		} elseif ($type == 'string' && $format == '') {
			$columnSchema->type = $type;
			if (isset($columnSchema->format)) {
				unset($columnSchema->format);
			}
			foreach ($engine->getDb()->data->{$table} as &$row) {
				$row->$column = $engine->normalizeValue($type, $row->$column); 
			}
			if (isset($columnSchema->default)) {
				$columnSchema->default = $engine->normalizeValue($type, $columnSchema->default); 
			}
		} else {
			switch ($columnSchema->type) {
				case 'string':
					if (isset($columnSchema->format)) {
						switch ($columnSchema->format) {
							case 'date':
								if ($type != 'string') {
									throw new JsonSQLException("can't convert date to $type");
								} elseif ($format == 'time') {
									throw new JsonSQLException("can't convert date to time");
								} elseif ($format != 'date') {
									$columnSchema->format = $format;
									if ($format == 'datetime') {
										foreach ($engine->getDb()->data->{$table} as &$row) {
											$row->$column = $row->$column . 'T00:00:00.0Z'; 
										}
									} else {
										unset($columnSchema->format);
									}
								}
								break;
							case 'datetime':
								if ($type != 'string') {
									throw new JsonSQLException("can't convert datetime to $type");
								} elseif ($format == 'date') {
									$columnSchema->format = $format;
									foreach ($engine->getDb()->data->{$table} as &$row) {
										$row->$column = substr($row->$column, 0, 10); 
									}
								} elseif ($format == 'time') {
									$columnSchema->format = $format;
									foreach ($engine->getDb()->data->{$table} as &$row) {
										$row->$column = substr($row->$column, 11); 
									}
								} elseif ($format != 'datetime') {
									unset($columnSchema->format);
								}
								break;
							case 'time':
								if ($type != 'string' || $format != 'time') {
									if ($format == '') {
										throw new JsonSQLException("can't convert time to $type");
									} else {
										throw new JsonSQLException("can't convert time to $format");
									}
								}
								break;
						}
					} elseif ($type == 'number') {
						foreach ($engine->getDb()->data->{$table} as $row) {
							if (! is_numeric($row->$column)) {
								throw new JsonSQLException("can't convert string to $type");
							}
						}
						$columnSchema->type = $type;
						foreach ($engine->getDb()->data->{$table} as &$row) {
							$row->$column = (float)$row->$column; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = (float)$columnSchema->default; 
						}
					} elseif ($type == 'integer') {
						foreach ($engine->getDb()->data->{$table} as $row) {
							if (! is_int($row->$column)) {
								throw new JsonSQLException("can't convert string to $type");
							}
						}
						$columnSchema->type = $type;
						foreach ($engine->getDb()->data->{$table} as &$row) {
							$row->$column = (int)$row->$column; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = (int)$columnSchema->default; 
						}
					} elseif ($type == 'boolean') {
						foreach ($engine->getDb()->data->{$table} as $row) {
							if (! is_bool($row->$column)) {
								throw new JsonSQLException("can't convert string to $type");
							}
						}
						$columnSchema->type = $type;
						foreach ($engine->getDb()->data->{$table} as &$row) {
							$row->$column = boolval($row->$column); 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = boolval($columnSchema->default); 
						}
					} elseif ($type != 'string' || $format != '') { 
						if ($format == '') {
							throw new JsonSQLException("can't convert string to $type");
						} else {
							throw new JsonSQLException("can't convert string to $format");
						}
					}
					break;
				case 'number':
					if ($type == 'integer') {
						$columnSchema->type = $type;
						foreach ($engine->getDb()->data->{$table} as &$row) {
							$row->$column = (int)$row->$column; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = (int)$columnSchema->default; 
						}
					} elseif ($type == 'boolean') {
						$columnSchema->type = $type;
						foreach ($engine->getDb()->data->{$table} as &$row) {
							$row->$column = boolval($row->$column); 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = boolval($columnSchema->default); 
						}
					} elseif ($type != 'number') {
						if ($format == '') {
							throw new JsonSQLException("can't convert number to $type");
						} else {
							throw new JsonSQLException("can't convert number to $format");
						}
					}
					break;
				case 'integer':
					if ($type == 'number') {
						$columnSchema->type = $type;
						foreach ($engine->getDb()->data->{$table} as &$row) {
							$row->$column = (float)$row->$column; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = (float)$columnSchema->default; 
						}
					} elseif ($type == 'boolean') {
						$columnSchema->type = $type;
						foreach ($engine->getDb()->data->{$table} as &$row) {
							$row->$column = boolval($row->$column); 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = boolval($columnSchema->default); 
						}
					} elseif ($type != 'integer') {
						if ($format == '') {
							throw new JsonSQLException("can't convert integer to $type");
						} else {
							throw new JsonSQLException("can't convert integer to $format");
						}
					}
					break;
				case 'boolean':
					if ($type == 'number' || $type == 'integer') {
						$columnSchema->type = $type;
						foreach ($engine->getDb()->data->{$table} as &$row) {
							$row->$column = $row->$column ? 1 : 0; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = $columnSchema->default ? 1 : 0; 
						}
					} elseif ($type != 'boolean') {
						if ($format == '') {
							throw new JsonSQLException("can't convert boolean to $type");
						} else {
							throw new JsonSQLException("can't convert boolean to $format");
						}
					}
					break;
			}
		}
		$props->type = $datatype;
		$extra = array();
		foreach ($props as $prop => $value) {
			$extra[] = $prop . ":" . $value;
		}
		$columnSchema->title = $title;
		if (count($extra) > 0) {
			$columnSchema->title .= ' [' . implode(', ', $extra) . ']';
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Changes whether a column is marked to allow null values or to reject null values
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param bool $allownull if true, the column allow null value
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setNotNull(Engine $engine, $table, $column, $allownull = false) {
		self::checkColumn($engine, $table, $column);
		$required = &$engine->getDb()->schema->properties->{$table}->items->required;
		$requiredpos = array_search($column, $required);
		if ($allownull && $requiredpos === false) {
			return; // nothing to do
		}
		if (!$allownull && $requiredpos !== false) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if ($allownull && $requiredpos !== false) {
			array_splice($required, $requiredpos, 1);
		} elseif (! $allownull && $requiredpos === false) {
			array_push($required, $column);
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Set or remove the default value for a column.
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param string|bool $default The default value. If false, remove the default
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setDefault(Engine $engine, $table, $column, $default = false) {
		self::checkColumn($engine, $table, $column);
		$columnSchema = &$engine->getDb()->schema->properties->{$table}->items->properties->$column;
		if (!isset($columnSchema->default) && $default === false) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if ($default === false) {
			unset($columnSchema->default);
		} else {
			$columnSchema->default = $engine->normalizeValue($columnSchema->type, $default); 
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Set or remove primary key for a column.
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param bool $remove if true, remove the primary key
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setPrimaryKey(Engine $engine, $table, $column, $remove = false) {
		self::checkColumn($engine, $table, $column);
		$columnSchema = &$engine->getDb()->schema->properties->{$table}->items->properties->$column;
		if (preg_match('/^(.*)\[([^\]]+)\]$/', $columnSchema->title, $m)) {
			$title = $m[1];
			$props = $engine->properties($m[2]);
		} else {
			$title = $columnSchema->title;
			$props = (object)array();
		}
		if (isset($props->primarykey) && ! $remove) {
			return; // nothing to do
		}
		if (!isset($props->primarykey) && $remove) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if ($remove) {
			unset($props->primarykey);
		} else {
			$maxkey = 0;
			foreach($engine->getDb()->schema->properties->{$table}->items->properties as $col) {
				if (preg_match('/^.*\[([^\]]+)\]$/', $col->title, $m)) {
					$colprops = $engine->properties($m[1]);
					if (isset($colprops->primarykey)) {
						if ($colprops->primarykey > $maxkey) {
							$maxkey = $colprops->primarykey;
						}
					}
				}
			}
			$props->primarykey = $maxkey + 1;
		}
		$extra = array();
		foreach ($props as $prop => $value) {
			$extra[] = $prop . ":" . $value;
		}
		$columnSchema->title = $title;
		if (count($extra) > 0) {
			$columnSchema->title .= ' [' . implode(', ', $extra) . ']';
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Set or remove autoincrement for a column.
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param bool $remove if true, remove the primary key
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setAutoincrement(Engine $engine, $table, $column, $remove = false) {
		self::checkColumn($engine, $table, $column);
		$columnSchema = &$engine->getDb()->schema->properties->{$table}->items->properties->$column;
		if ($columnSchema->type != 'integer') {
			throw new JsonSQLException("column '$column' in '$table' as type '{$columnSchema->type}', only integer can have the autoincrement property");
		}
		if (preg_match('/^(.*)\[([^\]]+)\]$/', $columnSchema->title, $m)) {
			$title = $m[1];
			$props = $engine->properties($m[2]);
		} else {
			$title = $columnSchema->title;
			$props = (object)array();
		}
		if (isset($props->autoincrement) && ! $remove) {
			return; // nothing to do
		}
		if (!isset($props->autoincrement) && $remove) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if ($remove) {
			unset($props->autoincrement);
		} else {
			$maxid = 0;
			foreach ($engine->getDb()->data->{$table} as $row) {
				if ($row->$column > $maxid) {
					$maxid = $row->$column;
				}
			}
			$props->autoincrement = $maxid;
		}
		$extra = array();
		foreach ($props as $prop => $value) {
			$extra[] = $prop . ":" . $value;
		}
		$columnSchema->title = $title;
		if (count($extra) > 0) {
			$columnSchema->title .= ' [' . implode(', ', $extra) . ']';
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Set or remove the title of a column.
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param string|bool $title The title content. If false, remove the title
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setTitle(Engine $engine, $table, $column, $title = false) {
		self::checkColumn($engine, $table, $column);
		$columnSchema = &$engine->getDb()->schema->properties->{$table}->items->properties->$column;
		if ((!isset($columnSchema->title) || $columnSchema->title == '') && $title === false) {
			return; // nothing to do
		}
		if (isset($columnSchema->title) && $columnSchema->title == $title) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if ($title === false) {
			$columnSchema->title = '';
		} else {
			$columnSchema->title = $title; 
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Set or remove the description of a column.
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param string|bool $description The description content. If false, remove the description
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setDescription(Engine $engine, $table, $column, $description = false) {
		self::checkColumn($engine, $table, $column);
		$columnSchema = &$engine->getDb()->schema->properties->{$table}->items->properties->$column;
		if ((!isset($columnSchema->description) || $columnSchema->description == '') && $description === false) {
			return; // nothing to do
		}
		if (isset($columnSchema->description) && $columnSchema->description == $description) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if ($description === false) {
			$columnSchema->description = '';
		} else {
			$columnSchema->description = $description; 
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Checks the existence of a column
	 *
	 * @access  private
	 * @static 
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @return  void
	 * @throws \App\G6K\Manager\Json\JsonSQL\JsonSQLException if the column doesn't exists
	 *
	 */
	private static function checkColumn(Engine $engine, $table, $column) {
		if (!isset($engine->getDb()->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($engine->getDb()->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
	}

}

?>

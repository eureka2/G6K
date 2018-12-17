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
 * This class provides static functions to update the definition of tables in a JsonSQL database
 *
 * @copyright Jacques Archimède
 *
 */
class JsonTable  {

	/**
	 * Creates a table in the database
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param \stdClass $columns The columns definition 
	 * @param array $required The list of required columns
	 * @param array $foreignkeys The list of foreign keys definition
	 * @param bool $ifnotexists if true, don't throw an error if the table already exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function create(Engine $engine, $table, \stdClass $columns, $required, $foreignkeys, $ifnotexists = false) {
		if (isset($engine->getDb()->schema->properties->{$table})) {
			if (!$ifnotexists) {
				throw new JsonSQLException("table '$table' already exists");
			}
			return;
		}
		foreach($foreignkeys as $foreignkey) {
			foreach($foreignkey->columns as $column) {
				if (!isset($columns->$column)) {
					throw new JsonSQLException("foreign key column '" . $column ."' doesn't exists");
				}
			}
			if (!isset($engine->getDb()->schema->properties->{$foreignkey->references->table})) {
				throw new JsonSQLException("foreign key reference table '{$foreignkey->references->table}' doesn't exists");
			}
			foreach($foreignkey->references->columns as $column) {
				if (!isset($engine->getDb()->schema->properties->{$foreignkey->references->table}->items->properties->$column)) {
					throw new JsonSQLException("foreign key reference column '$column' doesn't exists");
				}
			}
		}
		$engine->beginTransaction();
		$engine->getDb()->schema->properties->{$table} = (object)array(
			'type' => 'array',
			'items' => (object)array(
				'type' => 'object',
				'properties' => $columns,
				'required' => $required
			)
		);
		$engine->getDb()->data->{$table} = array();
		$engine->notifySchemaModification();
	}

	/**
	 * Drops a table
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param bool $ifexists if true, don't throw an error if the table doesn't exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function drop(Engine $engine, $table, $ifexists = false) {
		if (!isset($engine->getDb()->schema->properties->{$table})) {
			if ($ifexists) {
				return;
			}
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		$engine->beginTransaction();
		unset($engine->getDb()->data->{$table});
		unset($engine->getDb()->schema->properties->{$table});
		$engine->notifySchemaModification();
	}

	/**
	 * Renames a table
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string $newname The new name of the table
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function rename(Engine $engine, $table, $newname) {
		if (!isset($engine->getDb()->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (isset($engine->getDb()->schema->properties->{$newname})) {
			throw new JsonSQLException("table '$newname' already exists");
		}
		$engine->beginTransaction();
		$engine->getDb()->data->{$newname} = $engine->getDb()->data->{$table};
		$engine->getDb()->schema->properties->{$newname} = $engine->getDb()->schema->properties->{$table};
		unset($engine->getDb()->data->{$table});
		unset($engine->getDb()->schema->properties->{$table});
		$engine->notifySchemaModification();
	}

	/**
	 * Set or remove the title of a table.
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string|bool $title The title content. If false, remove the title
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setTitle(Engine $engine, $table, $title = false) {
		if (!isset($engine->getDb()->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		$tableSchema = &$engine->getDb()->schema->properties->{$table};
		if ((!isset($tableSchema->title) || $tableSchema->title == '') && $title === false) {
			return; // nothing to do
		}
		if (isset($tableSchema->title) && $tableSchema->title == $title) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if ($title === false) {
			$tableSchema->title = '';
		} else {
			$tableSchema->title = $title; 
		}
		$engine->notifySchemaModification();
	}

	/**
	 * Set or remove the description of a table.
	 *
	 * @access public
	 * @static
	 * @param \App\G6K\Manager\Json\JsonSQL\Engine $engine The engine using this function
	 * @param string $table The table name
	 * @param string|bool $description The description content. If false, remove the description
	 * @return void
	 * @throws JsonSQLException
	 */
	public static function setDescription(Engine $engine, $table, $description = false) {
		if (!isset($engine->getDb()->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		$tableSchema = &$engine->getDb()->schema->properties->{$table};
		if ((!isset($tableSchema->description) || $tableSchema->description == '') && $description === false) {
			return; // nothing to do
		}
		if (isset($tableSchema->description) && $tableSchema->description == $description) {
			return; // nothing to do
		}
		$engine->beginTransaction();
		if ($description === false) {
			$tableSchema->description = '';
		} else {
			$tableSchema->description = $description; 
		}
		$engine->notifySchemaModification();
	}

}

?>

<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2019 Jacques Archimède

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
namespace App\G6K\Services;

use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 *
 * This class implements a file uploader service.
 *
 * This service is defined in config/packages/g6k.yml as follows:
 *
 *    g6k.file_uploader:
 *        class: App\G6K\Services\FileUploader
 *        arguments: ['%upload_directory%']
 *
 * @copyright Jacques Archimède
 *
 */
class FileUploader {

	/**
	 * @var string      $uploadDir The upload directory
	 *
	 * @access  private
	 *
	 */
	private $uploadDir;

	/**
	 * Constructor of class FileUploader
	 *
	 * @access  public
	 * @param   string $uploadDir The upload directory
	 * @return  void
	 *
	 */
	public function __construct($uploadDir) {
		$this->uploadDir = $uploadDir;
	}

	/**
	 * Moves the file to the upload directory with a temporary file name.
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\File\UploadedFile $file The file uploaded through a form.
	 * @return  string The temporary file name
	 *
	 */
	public function upload(UploadedFile $file) {
		$fileName = md5(uniqid()).'.'.$file->guessExtension();
		$file->move($this->uploadDir, $fileName);
		return $fileName;
	}
}

?>

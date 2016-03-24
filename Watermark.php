<?php

  /*
   * CKFinder - Watermark plugin
   * ===========================
   * https://github.com/dimitrov-adrian/ckfinder-watermark-plugin
   *
   * The MIT License (MIT)
   *
   * Copyright (c) 2016 Adrian Dimitrov
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  namespace CKSource\CKFinder\Plugin\Watermark;

  use CKSource\CKFinder\Acl\Permission;
  use CKSource\CKFinder\CKFinder;
  use CKSource\CKFinder\Command\CommandAbstract;
  use CKSource\CKFinder\Error;
  use CKSource\CKFinder\Filesystem\Folder\WorkingFolder;
  use CKSource\CKFinder\Filesystem\Path;
  use CKSource\CKFinder\Plugin\PluginInterface;
  use Symfony\Component\HttpFoundation\Request;
  use CKSource\CKFinder\Image;

  /**
   * GetFileInfo command plugin class.
   */
  class Watermark extends CommandAbstract implements PluginInterface
  {

    /**
     * @var CKFinder
     */
    protected $app;

    /**
     * An array of permissions required by this command.
     *
     * @var array
     */
    protected $requires = [
      Permission::FILE_CREATE
    ];

    /**
     * Returns an array with default configuration for this plugin. Any of
     * the plugin configuration options can be overwritten in the CKFinder configuration file.
     *
     * @return array Default plugin configuration
     */
    public function getDefaultConfig()
    {
      return [];
    }

    /**
     * Watermark processor.
     *
     * @param $file
     * @param $watermark
     * @param $position
     * @param $size
     *
     * @return int
     *  -100  - Missing request arguments.
     *  -11   - Source file is not image.
     *  -12   - Source file is image but not supported.
     *  -21   - Error while fetching watermark file.
     *  -22   - Watermark file is not supported.
     *  -30   - Error while processing watermarked image.
     *  -31   - Error while saving watermarked image file.
     *  1     - OK
     */
    public function addWatermark($file, $watermark, $position, $size) {

      $position = explode(' ', $position);

      if (preg_match('#^image\/#i', $file->getMimetype())) {
        if (Image::isSupportedExtension($file->getMetadata()['extension'])) {

          $uploadedImage = Image::create($file->read());

          $watermarkImageContent = file_get_contents($watermark);
          if (!$watermarkImageContent) {
            return -21;
          }
          $watermarkImage = Image::create($watermarkImageContent);
          unset($watermarkImageContent);
          if (!$watermarkImage) {
            return -22;

          }
          $watermarkMaxWidth = ceil($uploadedImage->getWidth()*$size/100);
          $watermarkMaxHeigh = ceil($uploadedImage->getHeight()*$size/100);
          $watermarkImage->resize($watermarkMaxWidth, $watermarkMaxHeigh, 100);
          $watermarkNewWidth = $watermarkImage->getWidth();
          $watermarkNewHeight = $watermarkImage->getHeight();

          if ($position[0] == 'middle') {
            $watermarkY = ceil($uploadedImage->getHeight()/2-$watermarkNewWidth/2);
          }
          elseif ($position[0] == 'bottom') {
            $watermarkY = $uploadedImage->getHeight()-$watermarkNewHeight;
          }
          else {
            $watermarkY = 0;
          }

          if ($position[1] == 'center') {
            $watermarkX = ceil($uploadedImage->getWidth()/2-$watermarkNewWidth/2);
          }
          elseif ($position[1] == 'right') {
            $watermarkX = $uploadedImage->getWidth()-$watermarkNewHeight;
          }
          else {
            $watermarkX = 0;
          }

          $processing_status = imagecopyresampled($uploadedImage->getGDImage(), $watermarkImage->getGDImage(), $watermarkX, $watermarkY, 0, 0, $watermarkNewWidth, $watermarkNewHeight, $watermarkNewWidth, $watermarkNewHeight);

          if (!$processing_status) {
            return -30;
          }

          return $file->update($uploadedImage->getData()) ? 1 : -31;
        }
        else {
          return -12;
        }
      }
      else {
        return -11;
      }
    }

    /**
     * Main command method.
     *
     * @param Request       $request       Current request object
     * @param WorkingFolder $workingFolder Current working folder object
     *
     * @return array
     *
     * @throws \Exception
     */
    public function execute(Request $request, WorkingFolder $workingFolder)
    {
      $watermark_image = $request->get('file');
      $watermark_position = $request->get('position');
      $watermark_size = $request->get('size');

      $backend = $workingFolder->getBackend();
      if (!$workingFolder->containsFile($request->get('fileName'))) {
        throw new \Exception('File not found', Error::FILE_NOT_FOUND);
      }

      $statusCode = -100;
      if ($watermark_position && $watermark_image && $watermark_size) {
        $file = $backend->get(Path::combine($workingFolder->getPath(), $request->get('fileName')));
        $statusCode = $this->addWatermark($file, $watermark_image, $watermark_position, $watermark_size);
      }

      return array(
        'status' => $statusCode > 0,
        'statusCode' => $statusCode,
      );
    }
  }

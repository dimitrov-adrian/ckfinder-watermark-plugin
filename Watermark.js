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

CKFinder.define(['jquery', 'backbone', 'marionette', 'doT'], function(jQuery, Backbone, Marionette, doT) {
  'use strict';

  return {

    // Available language files. Put them into the "lang" folder of you plugin.
    lang: 'en,bg',

    init: function(finder) {

      var icon = 'watermark-icon-white.png';

      // Detect if the black icon should be provided by looking for .ui-alt-icon class.
      // To provide different icons for LTR/RTL environment check finder.lang.dir.
      if ( jQuery( 'body' ).hasClass( 'ui-alt-icon' ) ) {
        icon = 'watermark-icon.png';
      }

      var css = '';
      css += '.ui-icon-watermark:after { background-image: url(' + this.path + '/gfx/' + icon + '); }';
      css += '.ui-watermark-page { text-align: center; }';
      css += '.ui-watermark-page #watermark-preview-frame { border:1px solid #b6b6b6; display:inline-block; position:relative }';
      css += '.ui-watermark-page #watermark-preview-watermark { display:none; }';
      css += '.ui-watermark-page #watermark-preview-image { max-width:100%; height:auto; display:block; }';
      this.addCss(css);

      // Add a button to the "Main" toolbar.
      finder.on('toolbar:reset:Main:file', function(evt) {
        if (evt.data.file.isImage()) {
          evt.data.toolbar.push({
            name: 'Watermark',
            label: finder.lang.Watermark.watermark,
            priority: 45,
            icon: 'watermark',
            action: function () {
              finder.request('watermarkPageAction', { file: evt.data.file });
            }
          });
        }
      });

      /**
       * Build Watermark image options page
       *
       * @param data
       */
      function watermarkPageAction(data) {

        var file = {
          name: data.file.get('name'),
          url: data.file.getUrl()
        };

        // Build options template.
        var template = '';
        template += '<div class="ui-watermark-page">';
        template += '  <h2>{{=it.text.title.replace("%", it.file.name)}}</h2>';
        template += '  <div>';
        template += '    <div id="watermark-preview-frame">';
        template += '      <img id="watermark-preview-watermark" src="" />';
        template += '      <img id="watermark-preview-image" src="{{=it.file.url}}" />';
        template += '    </div>';
        template += '  </div>';
        template += '  <div id="watermark-toolbar-actions">';
        template += '    <select name="file" data-inline="true">';
        template += '    {{~it.watermarks :watermark}}<option value="{{=watermark.file}}">{{=watermark.label}}</option>{{~}}';
        template += '    </select>';
        template += '    <select name="position" data-inline="true">';
        template += '    {{~it.positions :pos}}<option value="{{=pos.position}}">{{=pos.label}}</option>{{~}}';
        template += '    </select>';
        template += '    <button name="apply" data-inline="true">{{=it.text.applyButtonText}}</button>';
        template += '    <button name="close" data-inline="true">{{=it.text.cancelButtonText}}</button>';
        template += '  </div>';
        template += '</div>';

        // Create a View class to be displayed in the page.
        var imageWatermarkOptionsView = Marionette.ItemView.extend({

          // Store current options.
          currentOptions: {
            file: null,
            position: null,
            size: 0
          },

          template: doT.template(template),

          events: {
            'change select': function(e) {

              // Set watermark or position option.
              this.currentOptions[e.currentTarget.name] = e.currentTarget.value;

              // Set size option.
              if (this.currentOptions.file) {
                for (var i in finder.config.Watermark.watermarks) {
                  if (finder.config.Watermark.watermarks.hasOwnProperty(i) && finder.config.Watermark.watermarks[i].file == this.currentOptions.file) {
                    this.currentOptions.size = finder.config.Watermark.watermarks[i].size || null;
                  }
                }
              }

              var $watermark = jQuery('#watermark-preview-watermark', this.$el);

              if (!this.currentOptions.position || !this.currentOptions.file || !this.currentOptions.size) {
                $watermark.hide();
                return false;
              }

              var maxSizePrcnt = this.currentOptions.size ? this.currentOptions.size + '%' : '';
              var position = this.currentOptions.position.split(' ');
              var recalculateStyle = function() {
                var watermarkStyle = {
                  maxWidth: maxSizePrcnt,
                  maxHeight: maxSizePrcnt,
                  position: 'absolute',
                  marginTop: '',
                  marginLeft: '',
                  top: '',
                  left: '',
                  bottom: '',
                  right: ''
                };

                // Vertical.
                if (position[0] == 'top') {
                  watermarkStyle.top = 0;
                }
                else if (position[0] == 'bottom') {
                  watermarkStyle.bottom = 0;
                }
                else {
                  watermarkStyle.top = '50%';
                  watermarkStyle.marginTop = -1 * Math.ceil($watermark.height() / 2);
                }

                // Horizontal.
                if (position[1] == 'left') {
                  watermarkStyle.left = 0;
                }
                else if (position[1] == 'right') {
                  watermarkStyle.right = 0;
                }
                else {
                  watermarkStyle.left = '50%';
                  watermarkStyle.marginLeft = -1 * Math.ceil($watermark.width() / 2);
                }

                return watermarkStyle;
              }.bind(this);

              $watermark.attr('src', this.currentOptions.file);
              $watermark.show().css(recalculateStyle());
              $watermark.one('load', function() {
                $(this).css(recalculateStyle());
              });

            },
            'click button': function(e) {
              if (e.currentTarget.name == 'apply') {

                if (!this.currentOptions.file || !this.currentOptions.position) {
                  return;
                }

                finder.request('dialog', {
                  name: 'dialog-watermark-confirmdialog',
                  title: finder.lang.Watermark.error,
                  template: finder.lang.Watermark.applyConfirm,
                  buttons: ['ok','cancel']
                });
                finder.once('dialog:dialog-watermark-confirmdialog:ok', function(evt) {
                  this.makeProcessorRequest();
                  finder.request('dialog:destroy', { name: 'dialog-watermark-confirmdialog' });
                }.bind(this));
                finder.once('dialog:dialog-watermark-confirmdialog:cancel', function(evt) {
                  finder.request('dialog:destroy', { name: 'dialog-watermark-confirmdialog' });
                });
              }
              else if (e.currentTarget.name == 'close') {
                finder.request('page:destroy', { name: 'watermark-page' });
              }
            }
          },

          makeProcessorRequest: function() {

            // @TODO make this more nice.
            var selectedFiles = finder.request('files:getSelected');
            var file = selectedFiles.first();

            var params = this.currentOptions;
            params.fileName = file.get('name');

            // Make processing request.
            finder.request('command:send', {
              name: 'Watermark',
              folder: file.get('folder'),
              params: params
            }).done(function(response) {
              if (response.status) {
                var $image = jQuery('#watermark-preview-image', this.$el);
                var imageUrl = $image.attr('src');
                var imageUrlNew = imageUrl.split('?')[0] + '?r=' + Date.now();
                $image.attr('src', imageUrlNew);
                jQuery(':input', this.$el).val('').trigger('change');
                this.currentOptions.file = null;
                this.currentOptions.position = null;
                finder.request('dialog', {
                  name: 'dialog-watermark-okdialog',
                  title: finder.lang.Watermark.ok,
                  template: finder.lang.Watermark.watermarkApplied,
                  buttons: ['ok']
                });
                finder.once('dialog:dialog-watermark-okdialog:ok', function(evt) {
                  finder.request('dialog:destroy', { name: 'dialog-watermark-dialog' });
                });
              }
              else {
                finder.request('dialog', {
                  name: 'dialog-watermark-errordialog',
                  title: finder.lang.Watermark.error,
                  template: finder.lang.Watermark.unexpectedError.replace('%', response.statusCode),
                  buttons: ['ok']
                });
                finder.once('dialog:dialog-watermark-errordialog:ok', function(evt) {
                  finder.request('dialog:destroy', { name: 'dialog-watermark-dialog' });
                });
              }

            }.bind(this));
          }

        });

        // Define view model options, so to allow overriding.
        var modelOptions = {
          text: finder.lang.Watermark,
          file: file,
          watermarks: [
            {
              file: '',
              label: finder.lang.Watermark.choiceWatermark
            }
          ],
          positions: [
            {
              position: '',
              label: finder.lang.Watermark.choicePosition
            },
            {
              position: 'top left',
              label: finder.lang.Watermark.topleft
            },
            {
              position: 'top center',
              label: finder.lang.Watermark.topcenter
            },
            {
              position: 'top right',
              label: finder.lang.Watermark.topright
            },
            {
              position: 'middle left',
              label: finder.lang.Watermark.middleleft
            },
            {
              position: 'middle center',
              label: finder.lang.Watermark.middlecenter
            },
            {
              position: 'middle right',
              label: finder.lang.Watermark.middleright
            },
            {
              position: 'bottom left',
              label: finder.lang.Watermark.bottomleft
            },
            {
              position: 'bottom center',
              label: finder.lang.Watermark.bottomcenter
            },
            {
              position: 'bottom right',
              label: finder.lang.Watermark.bottomright
            }
          ]
        };

        // Add watermark options.
        for (var i in finder.config.Watermark.watermarks) {
          if (finder.config.Watermark.watermarks.hasOwnProperty(i)) {
            modelOptions.watermarks.push(finder.config.Watermark.watermarks[i]);
          }
        }

        // Create a View instance to be rendered in the page.
        var view = new imageWatermarkOptionsView( {
          model: new Backbone.Model(modelOptions)
        });

        // Last but not least, create the page.
        finder.request('page:create', {
          view: view,
          name: 'watermark-page',
          className: 'ckf-watermarkpage'
        });

        finder.request('page:show', { name: 'watermark-page' });
      }

      finder.setHandler('watermarkPageAction', watermarkPageAction, this);

    }
  };

});

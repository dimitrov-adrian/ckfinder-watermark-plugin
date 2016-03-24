# ckfinder-watermark-plugin

An Watermark plugin for [CKFinder](http://ckfinder.com/) with GUI and preview options.

## Requirements
- CKFinder 3
- PHP 5 with GD support

## Add plugin to CKFinder

To add the plugin to CKFinder:

#### 1. Download plugin and extract as `<ckfinder>/plugins/Watermark`
#### 2. Client side
##### 2.1. Enable from client side configuration `<ckfinder>/config.js` [`config.plugins`](http://docs.cksource.com/ckfinder3/#!/api/CKFinder.Config-cfg-plugins) option.
```js
// Example.
config.plugins = [
  'Watermark'
];
```
##### 2.2. Setup from configuration `<ckfinder>/config.js` option
```js
config.Watermark = {

  // OPTIONAL
  // If you want to trim the available positions,
  // then you could use this option.
  positions: [
    // '<top|middle|bottom> <left|center|right>',
    'top left',
    'bottom right',
    'middle center'
  ]
  
  // REQUIRED
  watermarks: [
  
    {
      // All config options (file, label and size) ARE REQUIRED.
      
      // URL to image file, for better results use PNG files
      // with suitable resolution.
      file: '<STRING: URL TO WATERMARK IMAGE>',
     
      // Text label to show in watermark selector.
      label: '<STRING: LABEL FOR WATERMARK>',
      
      // Max size height/width for watermark in percents of main image.
      // Example:
      //   If main image is 1600x1200 and size is set to 10,
      //   then watermark will have max width 160px
      //   and height 120px, if the image is smaller than
      //   this size, then it will not be up-scaled.
      size: '<STRING: MAX SIZE FOR IMAGE>',
    },

    // Simple example.
    {
      file: 'http://example.com/watermark.png',
      label: 'Example Watermark',
      size: '10'
    },
    
    // ...
  ]
};
```

#### 3. Server side enabling via `<ckfinder>/config.php`
```php
// Add
$config['plugins'][] = 'Watermark';
```

## Troubleshooting

#### Get `Invalid command.` message 
You are not enabled server side plugin from `config.php`

#### Get unexpected error with some number
When by some reason image could not be processed or something happen on server side, it is possible to get such message.
Agenda of codes and meanings:

> * -100  - Missing request arguments.
> * -11   - Source file is not image.
> * -12   - Source file is image but not supported.
> * -21   - Error while fetching watermark file.
> * -22   - Watermark file is not supported.
> * -30   - Error while processing watermarked image.
> * -31   - Error while saving watermarked image file.

## FAQ

#### Q: How can I add offset
A: You can't, it is not supported right now, better option is to prepare watermark images with offset on it.

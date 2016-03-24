# ckfinder-watermark-plugin

An Watermark plugin for [CKFinder](http://ckfinder.com/) with GUI and preview options.

## Requirements
- CKFinder 3
- PHP 5 with GD support

## Add plugin to CKFinder

To add the plugin to CKFinder:

#### 1. Download plugin and extract it to the `<ckfinder>/plugins` folder (`<ckfinder>/plugins/Watermark`)
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
  watermarks: [
    {
      file: '<URL TO WATERMARK IMAGE>',
      label: '<LABEL FOR WATERMARK>',
      size: '<MAX WIDTH/HEIGHT IN PERCENTAGE WITHOUT SIGN>',
    },
    // Example
    {
      file: 'http://example.com/watermark.png',
      label: 'Example Watermark',
      size: '10'
    },
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

> -100  - Missing request arguments.
> -11   - Source file is not image.
> -12   - Source file is image but not supported.
> -21   - Error while fetching watermark file.
> -22   - Watermark file is not supported.
> -30   - Error while processing watermarked image.
> -31   - Error while saving watermarked image file.

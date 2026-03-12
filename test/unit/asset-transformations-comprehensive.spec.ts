/* eslint-disable @cspell/spellchecker */
/* eslint-disable @typescript-eslint/naming-convention */
import { ImageTransform } from '../../src/assets';
import '../../src/common/string-extensions';
import {
  CanvasBy,
  CropBy,
  FitBy,
  Format,
  Orientation,
  OverlayAlign,
  OverlayRepeat,
  ResizeFilter,
} from '../../src/common/types';

describe('Asset Transformations - Comprehensive Test Suite', () => {
  const baseImageUrl = 'https://images.contentstack.io/v3/assets/blt633c211b8df38a6a/blt123456789/image.jpg';
  const overlayImageUrl = '/v3/assets/blt633c211b8df38a6a/blt987654321/overlay.png';

  // Helper function to get transformation object
  function getTransformObj(imgTransformObj: ImageTransform) {
    return { ...imgTransformObj.obj };
  }

  // Helper function to apply transformation and get URL
  function getTransformedUrl(url: string, transformation: ImageTransform): string {
    return url.transform(transformation);
  }

  describe('Basic Image Resizing', () => {
    it('should resize image by width only', () => {
      const transform = new ImageTransform().resize({ width: 300 });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '300' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300`);
    });

    it('should resize image by height only', () => {
      const transform = new ImageTransform().resize({ height: 200 });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ height: '200' });
      expect(transformedUrl).toBe(`${baseImageUrl}?height=200`);
    });

    it('should resize image with both width and height', () => {
      const transform = new ImageTransform().resize({ width: 300, height: 200 });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '300', height: '200' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200`);
    });

    it('should resize image with percentage values', () => {
      const transform = new ImageTransform().resize({ width: '50p', height: '75p' });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '50p', height: '75p' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=50p&height=75p`);
    });

    it('should disable upscaling during resize', () => {
      const transform = new ImageTransform().resize({ width: 300, height: 200, disable: 'upscale' });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '300', height: '200', disable: 'upscale' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&disable=upscale`);
    });

    it('should handle numeric percentage values', () => {
      const transform = new ImageTransform().resize({ width: 0.5, height: 0.75 });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '0.5', height: '0.75' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=0.5&height=0.75`);
    });
  });

  describe('Format Conversion', () => {
    it('should convert image to WebP format', () => {
      const transform = new ImageTransform().format(Format.WEBP);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ format: 'webp' });
      expect(transformedUrl).toBe(`${baseImageUrl}?format=webp`);
    });

    it('should convert image to PNG format', () => {
      const transform = new ImageTransform().format(Format.PNG);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ format: 'png' });
      expect(transformedUrl).toBe(`${baseImageUrl}?format=png`);
    });

    it('should convert image to progressive JPEG', () => {
      const transform = new ImageTransform().format(Format.PJPG);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ format: 'pjpg' });
      expect(transformedUrl).toBe(`${baseImageUrl}?format=pjpg`);
    });

    it('should convert image to GIF format', () => {
      const transform = new ImageTransform().format(Format.GIF);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ format: 'gif' });
      expect(transformedUrl).toBe(`${baseImageUrl}?format=gif`);
    });

    it('should convert image to lossless WebP', () => {
      const transform = new ImageTransform().format(Format.WEBPLL);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ format: 'webpll' });
      expect(transformedUrl).toBe(`${baseImageUrl}?format=webpll`);
    });

    it('should convert image to lossy WebP', () => {
      const transform = new ImageTransform().format(Format.WEBPLY);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ format: 'webply' });
      expect(transformedUrl).toBe(`${baseImageUrl}?format=webply`);
    });
  });

  describe('Quality Control', () => {
    it('should set image quality to 50%', () => {
      const transform = new ImageTransform().quality(50);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ quality: '50' });
      expect(transformedUrl).toBe(`${baseImageUrl}?quality=50`);
    });

    it('should set maximum quality (100)', () => {
      const transform = new ImageTransform().quality(100);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ quality: '100' });
      expect(transformedUrl).toBe(`${baseImageUrl}?quality=100`);
    });

    it('should set minimum quality (1)', () => {
      const transform = new ImageTransform().quality(1);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ quality: '1' });
      expect(transformedUrl).toBe(`${baseImageUrl}?quality=1`);
    });

    it('should combine quality with format conversion', () => {
      const transform = new ImageTransform().format(Format.WEBP).quality(80);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ format: 'webp', quality: '80' });
      expect(transformedUrl).toBe(`${baseImageUrl}?format=webp&quality=80`);
    });
  });

  describe('Auto Optimization', () => {
    it('should enable auto optimization', () => {
      const transform = new ImageTransform().auto();
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ auto: 'webp' });
      expect(transformedUrl).toBe(`${baseImageUrl}?auto=webp`);
    });

    it('should combine auto optimization with other transformations', () => {
      const transform = new ImageTransform().auto().resize({ width: 300 });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ auto: 'webp', width: '300' });
      expect(transformedUrl).toBe(`${baseImageUrl}?auto=webp&width=300`);
    });
  });

  describe('Advanced Cropping', () => {
    it('should crop image with default settings', () => {
      const transform = new ImageTransform().crop({ width: 200, height: 150 });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ crop: ['200', '150'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?crop=200,150`);
    });

    it('should crop image with aspect ratio', () => {
      const transform = new ImageTransform().crop({ width: 16, height: 9, cropBy: CropBy.ASPECTRATIO });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ crop: '16:9' });
      expect(transformedUrl).toBe(`${baseImageUrl}?crop=16:9`);
    });

    it('should crop image with region specification', () => {
      const transform = new ImageTransform().crop({ 
        width: 200, 
        height: 150, 
        cropBy: CropBy.REGION, 
        xval: 50, 
        yval: 75 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ crop: ['200', '150', 'x50', 'y75'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?crop=200,150,x50,y75`);
    });

    it('should crop image with offset', () => {
      const transform = new ImageTransform().crop({ 
        width: 200, 
        height: 150, 
        cropBy: CropBy.OFFSET, 
        xval: 25, 
        yval: 35 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ crop: ['200', '150', 'offset-x25', 'offset-y35'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?crop=200,150,offset-x25,offset-y35`);
    });

    it('should crop image with safe mode enabled', () => {
      const transform = new ImageTransform().crop({ 
        width: 200, 
        height: 150, 
        cropBy: CropBy.REGION, 
        xval: 50, 
        yval: 75, 
        safe: true 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ crop: ['200', '150', 'x50', 'y75', 'safe'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?crop=200,150,x50,y75,safe`);
    });

    it('should crop image with smart mode enabled', () => {
      const transform = new ImageTransform().crop({ 
        width: 200, 
        height: 150, 
        cropBy: CropBy.REGION, 
        xval: 50, 
        yval: 75, 
        smart: true 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ crop: ['200', '150', 'x50', 'y75', 'smart'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?crop=200,150,x50,y75,smart`);
    });

    it('should crop image with both safe and smart modes', () => {
      const transform = new ImageTransform().crop({ 
        width: 200, 
        height: 150, 
        cropBy: CropBy.REGION, 
        xval: 50, 
        yval: 75, 
        safe: true, 
        smart: true 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ crop: ['200', '150', 'x50', 'y75', 'safe', 'smart'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?crop=200,150,x50,y75,safe,smart`);
    });
  });

  describe('Fit Operations', () => {
    it('should fit image within bounds', () => {
      const transform = new ImageTransform().resize({ width: 300, height: 200 }).fit(FitBy.BOUNDS);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '300', height: '200', fit: 'bounds' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&fit=bounds`);
    });

    it('should fit image using crop method', () => {
      const transform = new ImageTransform().resize({ width: 300, height: 200 }).fit(FitBy.CROP);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '300', height: '200', fit: 'crop' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&fit=crop`);
    });
  });

  describe('Trim Operations', () => {
    it('should trim image with single value', () => {
      const transform = new ImageTransform().trim(25);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ trim: '25' });
      expect(transformedUrl).toBe(`${baseImageUrl}?trim=25`);
    });

    it('should trim image with three values', () => {
      const transform = new ImageTransform().trim([25, 50, 25]);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ trim: '25,50,25' });
      expect(transformedUrl).toBe(`${baseImageUrl}?trim=25,50,25`);
    });

    it('should trim image with four values (top, right, bottom, left)', () => {
      const transform = new ImageTransform().trim([25, 50, 75, 100]);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ trim: '25,50,75,100' });
      expect(transformedUrl).toBe(`${baseImageUrl}?trim=25,50,75,100`);
    });
  });

  describe('Orientation and Rotation', () => {
    it('should flip image horizontally', () => {
      const transform = new ImageTransform().orient(Orientation.FLIP_HORIZONTAL);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ orient: '2' });
      expect(transformedUrl).toBe(`${baseImageUrl}?orient=2`);
    });

    it('should flip image vertically', () => {
      const transform = new ImageTransform().orient(Orientation.FLIP_VERTICAL);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ orient: '4' });
      expect(transformedUrl).toBe(`${baseImageUrl}?orient=4`);
    });

    it('should rotate image right', () => {
      const transform = new ImageTransform().orient(Orientation.RIGHT);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ orient: '6' });
      expect(transformedUrl).toBe(`${baseImageUrl}?orient=6`);
    });

    it('should rotate image left', () => {
      const transform = new ImageTransform().orient(Orientation.LEFT);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ orient: '8' });
      expect(transformedUrl).toBe(`${baseImageUrl}?orient=8`);
    });

    it('should flip both horizontally and vertically', () => {
      const transform = new ImageTransform().orient(Orientation.FLIP_HORIZONTAL_VERTICAL);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ orient: '3' });
      expect(transformedUrl).toBe(`${baseImageUrl}?orient=3`);
    });
  });

  describe('Overlay Operations', () => {
    it('should add basic overlay', () => {
      const transform = new ImageTransform().overlay({ relativeURL: overlayImageUrl });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ overlay: overlayImageUrl });
      expect(transformedUrl).toBe(`${baseImageUrl}?overlay=${overlayImageUrl}`);
    });

    it('should add overlay with bottom alignment', () => {
      const transform = new ImageTransform().overlay({ 
        relativeURL: overlayImageUrl, 
        align: OverlayAlign.BOTTOM 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        overlay: overlayImageUrl, 
        'overlay-align': 'bottom' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?overlay=${overlayImageUrl}&overlay-align=bottom`);
    });

    it('should add overlay with multiple alignments', () => {
      const transform = new ImageTransform().overlay({ 
        relativeURL: overlayImageUrl, 
        align: [OverlayAlign.BOTTOM, OverlayAlign.CENTER] 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        overlay: overlayImageUrl, 
        'overlay-align': 'bottom,center' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?overlay=${overlayImageUrl}&overlay-align=bottom,center`);
    });

    it('should add overlay with repeat pattern', () => {
      const transform = new ImageTransform().overlay({ 
        relativeURL: overlayImageUrl, 
        align: OverlayAlign.TOP, 
        repeat: OverlayRepeat.X 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        overlay: overlayImageUrl, 
        'overlay-align': 'top',
        'overlay-repeat': 'x' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?overlay=${overlayImageUrl}&overlay-align=top&overlay-repeat=x`);
    });

    it('should add overlay with custom dimensions', () => {
      const transform = new ImageTransform().overlay({ 
        relativeURL: overlayImageUrl, 
        width: 100, 
        height: 80 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        overlay: overlayImageUrl, 
        'overlay-width': '100',
        'overlay-height': '80' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?overlay=${overlayImageUrl}&overlay-width=100&overlay-height=80`);
    });

    it('should add overlay with percentage dimensions', () => {
      const transform = new ImageTransform().overlay({ 
        relativeURL: overlayImageUrl, 
        width: '50p', 
        height: '25p' 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        overlay: overlayImageUrl, 
        'overlay-width': '50p',
        'overlay-height': '25p' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?overlay=${overlayImageUrl}&overlay-width=50p&overlay-height=25p`);
    });

    it('should add overlay with all parameters', () => {
      const transform = new ImageTransform().overlay({ 
        relativeURL: overlayImageUrl, 
        align: OverlayAlign.CENTER,
        repeat: OverlayRepeat.BOTH,
        width: 200,
        height: 150
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        overlay: overlayImageUrl, 
        'overlay-align': 'center',
        'overlay-repeat': 'both',
        'overlay-width': '200',
        'overlay-height': '150' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?overlay=${overlayImageUrl}&overlay-align=center&overlay-repeat=both&overlay-width=200&overlay-height=150`);
    });
  });

  describe('Padding Operations', () => {
    it('should add uniform padding', () => {
      const transform = new ImageTransform().padding(25);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ pad: '25' });
      expect(transformedUrl).toBe(`${baseImageUrl}?pad=25`);
    });

    it('should add padding with three values', () => {
      const transform = new ImageTransform().padding([25, 50, 25]);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ pad: '25,50,25' });
      expect(transformedUrl).toBe(`${baseImageUrl}?pad=25,50,25`);
    });

    it('should add padding with four values', () => {
      const transform = new ImageTransform().padding([10, 20, 30, 40]);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ pad: '10,20,30,40' });
      expect(transformedUrl).toBe(`${baseImageUrl}?pad=10,20,30,40`);
    });
  });

  describe('Background Color', () => {
    it('should set background color with hex value', () => {
      const transform = new ImageTransform().bgColor('cccccc');
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 'bg-color': 'cccccc' });
      expect(transformedUrl).toBe(`${baseImageUrl}?bg-color=cccccc`);
    });

    it('should set background color with RGB values', () => {
      const transform = new ImageTransform().bgColor([255, 128, 64]);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 'bg-color': '255,128,64' });
      expect(transformedUrl).toBe(`${baseImageUrl}?bg-color=255,128,64`);
    });

    it('should set background color with RGBA values', () => {
      const transform = new ImageTransform().bgColor([255, 128, 64, 0.5]);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 'bg-color': '255,128,64,0.5' });
      expect(transformedUrl).toBe(`${baseImageUrl}?bg-color=255,128,64,0.5`);
    });
  });

  describe('Device Pixel Ratio (DPR)', () => {
    it('should set device pixel ratio', () => {
      const transform = new ImageTransform().resize({ width: 300, height: 200 }).dpr(2);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '300', height: '200', dpr: '2' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&dpr=2`);
    });

    it('should set high DPR value', () => {
      const transform = new ImageTransform().resize({ width: 300 }).dpr(3.5);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ width: '300', dpr: '3.5' });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&dpr=3.5`);
    });
  });

  describe('Visual Effects', () => {
    it('should apply blur effect', () => {
      const transform = new ImageTransform().blur(5);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ blur: '5' });
      expect(transformedUrl).toBe(`${baseImageUrl}?blur=5`);
    });

    it('should apply maximum blur', () => {
      const transform = new ImageTransform().blur(1000);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ blur: '1000' });
      expect(transformedUrl).toBe(`${baseImageUrl}?blur=1000`);
    });

    it('should apply frame effect', () => {
      const transform = new ImageTransform().frame();
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ frame: '1' });
      expect(transformedUrl).toBe(`${baseImageUrl}?frame=1`);
    });

    it('should apply sharpen effect', () => {
      const transform = new ImageTransform().sharpen(5, 100, 10);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ sharpen: 'a5,r100,t10' });
      expect(transformedUrl).toBe(`${baseImageUrl}?sharpen=a5,r100,t10`);
    });

    it('should apply maximum sharpen settings', () => {
      const transform = new ImageTransform().sharpen(10, 1000, 255);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ sharpen: 'a10,r1000,t255' });
      expect(transformedUrl).toBe(`${baseImageUrl}?sharpen=a10,r1000,t255`);
    });
  });

  describe('Color Adjustments', () => {
    it('should adjust saturation positively', () => {
      const transform = new ImageTransform().saturation(50);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ saturation: '50' });
      expect(transformedUrl).toBe(`${baseImageUrl}?saturation=50`);
    });

    it('should adjust saturation negatively', () => {
      const transform = new ImageTransform().saturation(-75);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ saturation: '-75' });
      expect(transformedUrl).toBe(`${baseImageUrl}?saturation=-75`);
    });

    it('should adjust contrast positively', () => {
      const transform = new ImageTransform().contrast(80);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ contrast: '80' });
      expect(transformedUrl).toBe(`${baseImageUrl}?contrast=80`);
    });

    it('should adjust contrast negatively', () => {
      const transform = new ImageTransform().contrast(-60);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ contrast: '-60' });
      expect(transformedUrl).toBe(`${baseImageUrl}?contrast=-60`);
    });

    it('should adjust brightness positively', () => {
      const transform = new ImageTransform().brightness(40);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ brightness: '40' });
      expect(transformedUrl).toBe(`${baseImageUrl}?brightness=40`);
    });

    it('should adjust brightness negatively', () => {
      const transform = new ImageTransform().brightness(-30);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ brightness: '-30' });
      expect(transformedUrl).toBe(`${baseImageUrl}?brightness=-30`);
    });

    it('should combine multiple color adjustments', () => {
      const transform = new ImageTransform()
        .saturation(25)
        .contrast(15)
        .brightness(10);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        saturation: '25', 
        contrast: '15', 
        brightness: '10' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?saturation=25&contrast=15&brightness=10`);
    });
  });

  describe('Resize Filters', () => {
    it('should apply nearest neighbor filter', () => {
      const transform = new ImageTransform()
        .resize({ width: 300, height: 200 })
        .resizeFilter(ResizeFilter.NEAREST);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        width: '300', 
        height: '200', 
        'resize-filter': 'nearest' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&resize-filter=nearest`);
    });

    it('should apply bilinear filter', () => {
      const transform = new ImageTransform()
        .resize({ width: 300, height: 200 })
        .resizeFilter(ResizeFilter.BILINEAR);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        width: '300', 
        height: '200', 
        'resize-filter': 'bilinear' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&resize-filter=bilinear`);
    });

    it('should apply bicubic filter', () => {
      const transform = new ImageTransform()
        .resize({ width: 300, height: 200 })
        .resizeFilter(ResizeFilter.BICUBIC);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        width: '300', 
        height: '200', 
        'resize-filter': 'bicubic' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&resize-filter=bicubic`);
    });

    it('should apply Lanczos2 filter', () => {
      const transform = new ImageTransform()
        .resize({ width: 300, height: 200 })
        .resizeFilter(ResizeFilter.LANCZOS2);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        width: '300', 
        height: '200', 
        'resize-filter': 'lanczos2' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&resize-filter=lanczos2`);
    });

    it('should apply Lanczos3 filter', () => {
      const transform = new ImageTransform()
        .resize({ width: 300, height: 200 })
        .resizeFilter(ResizeFilter.LANCZOS3);
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ 
        width: '300', 
        height: '200', 
        'resize-filter': 'lanczos3' 
      });
      expect(transformedUrl).toBe(`${baseImageUrl}?width=300&height=200&resize-filter=lanczos3`);
    });
  });

  describe('Canvas Operations', () => {
    it('should create canvas with default settings', () => {
      const transform = new ImageTransform().canvas({ width: 400, height: 300 });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ canvas: ['400', '300'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?canvas=400,300`);
    });

    it('should create canvas with aspect ratio', () => {
      const transform = new ImageTransform().canvas({ 
        width: 16, 
        height: 9, 
        canvasBy: CanvasBy.ASPECTRATIO 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ canvas: '16:9' });
      expect(transformedUrl).toBe(`${baseImageUrl}?canvas=16:9`);
    });

    it('should create canvas with region specification', () => {
      const transform = new ImageTransform().canvas({ 
        width: 400, 
        height: 300, 
        canvasBy: CanvasBy.REGION, 
        xval: 50, 
        yval: 75 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ canvas: ['400', '300', 'x50', 'y75'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?canvas=400,300,x50,y75`);
    });

    it('should create canvas with offset', () => {
      const transform = new ImageTransform().canvas({ 
        width: 400, 
        height: 300, 
        canvasBy: CanvasBy.OFFSET, 
        xval: 25, 
        yval: 35 
      });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({ canvas: ['400', '300', 'offset-x25', 'offset-y35'] });
      expect(transformedUrl).toBe(`${baseImageUrl}?canvas=400,300,offset-x25,offset-y35`);
    });
  });

  describe('Complex Transformation Chaining', () => {
    it('should chain multiple transformations for thumbnail generation', () => {
      const transform = new ImageTransform()
        .resize({ width: 200, height: 200 })
        .crop({ width: 180, height: 180, cropBy: CropBy.REGION, xval: 10, yval: 10 })
        .format(Format.WEBP)
        .quality(80)
        .auto();
      
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({
        width: '200',
        height: '200',
        crop: ['180', '180', 'x10', 'y10'],
        format: 'webp',
        quality: '80',
        auto: 'webp'
      });
      
      expect(transformedUrl).toContain('width=200');
      expect(transformedUrl).toContain('height=200');
      expect(transformedUrl).toContain('crop=180,180,x10,y10');
      expect(transformedUrl).toContain('format=webp');
      expect(transformedUrl).toContain('quality=80');
      expect(transformedUrl).toContain('auto=webp');
    });

    it('should chain transformations for hero image optimization', () => {
      const transform = new ImageTransform()
        .resize({ width: 1200, height: 600 })
        .fit(FitBy.CROP)
        .format(Format.WEBP)
        .quality(85)
        .sharpen(3, 50, 5)
        .dpr(2);
      
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({
        width: '1200',
        height: '600',
        fit: 'crop',
        format: 'webp',
        quality: '85',
        sharpen: 'a3,r50,t5',
        dpr: '2'
      });
      
      expect(transformedUrl).toContain('width=1200');
      expect(transformedUrl).toContain('height=600');
      expect(transformedUrl).toContain('fit=crop');
      expect(transformedUrl).toContain('format=webp');
      expect(transformedUrl).toContain('quality=85');
      expect(transformedUrl).toContain('sharpen=a3,r50,t5');
      expect(transformedUrl).toContain('dpr=2');
    });

    it('should chain transformations for artistic effect', () => {
      const transform = new ImageTransform()
        .resize({ width: 800, height: 600 })
        .blur(2)
        .saturation(150)
        .contrast(20)
        .brightness(10)
        .overlay({ 
          relativeURL: overlayImageUrl, 
          align: OverlayAlign.CENTER, 
          width: '50p' 
        })
        .padding(20)
        .bgColor('f0f0f0');
      
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({
        width: '800',
        height: '600',
        blur: '2',
        saturation: '150',
        contrast: '20',
        brightness: '10',
        overlay: overlayImageUrl,
        'overlay-align': 'center',
        'overlay-width': '50p',
        pad: '20',
        'bg-color': 'f0f0f0'
      });
      
      expect(transformedUrl).toContain('width=800');
      expect(transformedUrl).toContain('blur=2');
      expect(transformedUrl).toContain('saturation=150');
      expect(transformedUrl).toContain('overlay-align=center');
      expect(transformedUrl).toContain('pad=20');
      expect(transformedUrl).toContain('bg-color=f0f0f0');
    });
  });

  describe('URL Generation Edge Cases', () => {
    it('should handle empty transformation object', () => {
      const transform = new ImageTransform();
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      expect(getTransformObj(transform)).toEqual({});
      expect(transformedUrl).toBe(baseImageUrl);
    });

    it('should handle URL with existing query parameters', () => {
      const urlWithParams = `${baseImageUrl}?version=1&locale=en-us`;
      const transform = new ImageTransform().resize({ width: 300 });
      const transformedUrl = getTransformedUrl(urlWithParams, transform);
      
      // The string extension adds ? regardless of existing query params
      expect(transformedUrl).toBe(`${urlWithParams}?width=300`);
    });

    it('should handle special characters in overlay URL', () => {
      const specialOverlayUrl = '/v3/assets/blt123/blt456/image with spaces & symbols.png';
      const transform = new ImageTransform().overlay({ relativeURL: specialOverlayUrl });
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      // The string extension doesn't encode URLs, it passes them as-is
      expect(transformedUrl).toContain(specialOverlayUrl);
    });

    it('should handle very long transformation chains', () => {
      const transform = new ImageTransform()
        .resize({ width: 1000, height: 800 })
        .crop({ width: 900, height: 700, cropBy: CropBy.REGION, xval: 50, yval: 50 })
        .fit(FitBy.BOUNDS)
        .format(Format.WEBP)
        .quality(90)
        .auto()
        .blur(1)
        .sharpen(2, 100, 10)
        .saturation(20)
        .contrast(15)
        .brightness(5)
        .dpr(2)
        .resizeFilter(ResizeFilter.LANCZOS3)
        .trim([10, 15, 20, 25])
        .padding([5, 10, 15, 20])
        .bgColor([255, 255, 255, 0.8])
        .orient(Orientation.RIGHT);
      
      const transformedUrl = getTransformedUrl(baseImageUrl, transform);
      
      // Should contain all parameters
      expect(transformedUrl).toContain('width=1000');
      expect(transformedUrl).toContain('height=800');
      expect(transformedUrl).toContain('crop=900,700,x50,y50');
      expect(transformedUrl).toContain('fit=bounds');
      expect(transformedUrl).toContain('format=webp');
      expect(transformedUrl).toContain('quality=90');
      expect(transformedUrl).toContain('auto=webp');
      expect(transformedUrl).toContain('blur=1');
      expect(transformedUrl).toContain('sharpen=a2,r100,t10');
      expect(transformedUrl).toContain('saturation=20');
      expect(transformedUrl).toContain('contrast=15');
      expect(transformedUrl).toContain('brightness=5');
      expect(transformedUrl).toContain('dpr=2');
      expect(transformedUrl).toContain('resize-filter=lanczos3');
      expect(transformedUrl).toContain('trim=10,15,20,25');
      expect(transformedUrl).toContain('pad=5,10,15,20');
      expect(transformedUrl).toContain('bg-color=255,255,255,0.8');
      expect(transformedUrl).toContain('orient=6');
    });
  });

  describe('Method Chaining and Fluent Interface', () => {
    it('should return ImageTransform instance for method chaining', () => {
      const transform = new ImageTransform();
      
      expect(transform.resize({ width: 300 })).toBeInstanceOf(ImageTransform);
      expect(transform.format(Format.WEBP)).toBeInstanceOf(ImageTransform);
      expect(transform.quality(80)).toBeInstanceOf(ImageTransform);
      expect(transform.auto()).toBeInstanceOf(ImageTransform);
      expect(transform.crop({ width: 200, height: 150 })).toBeInstanceOf(ImageTransform);
      expect(transform.fit(FitBy.BOUNDS)).toBeInstanceOf(ImageTransform);
      expect(transform.trim(25)).toBeInstanceOf(ImageTransform);
      expect(transform.orient(Orientation.RIGHT)).toBeInstanceOf(ImageTransform);
      expect(transform.padding(20)).toBeInstanceOf(ImageTransform);
      expect(transform.bgColor('ffffff')).toBeInstanceOf(ImageTransform);
      expect(transform.dpr(2)).toBeInstanceOf(ImageTransform);
      expect(transform.blur(5)).toBeInstanceOf(ImageTransform);
      expect(transform.frame()).toBeInstanceOf(ImageTransform);
      expect(transform.sharpen(5, 100, 10)).toBeInstanceOf(ImageTransform);
      expect(transform.saturation(50)).toBeInstanceOf(ImageTransform);
      expect(transform.contrast(25)).toBeInstanceOf(ImageTransform);
      expect(transform.brightness(15)).toBeInstanceOf(ImageTransform);
      expect(transform.resizeFilter(ResizeFilter.BICUBIC)).toBeInstanceOf(ImageTransform);
      expect(transform.canvas({ width: 400, height: 300 })).toBeInstanceOf(ImageTransform);
      expect(transform.overlay({ relativeURL: overlayImageUrl })).toBeInstanceOf(ImageTransform);
    });

    it('should maintain transformation state across chained calls', () => {
      const transform = new ImageTransform()
        .resize({ width: 300 })
        .format(Format.WEBP)
        .quality(80);
      
      expect(getTransformObj(transform)).toEqual({
        width: '300',
        format: 'webp',
        quality: '80'
      });
      
      // Add more transformations
      transform.blur(2).saturation(50);
      
      expect(getTransformObj(transform)).toEqual({
        width: '300',
        format: 'webp',
        quality: '80',
        blur: '2',
        saturation: '50'
      });
    });
  });
}); 
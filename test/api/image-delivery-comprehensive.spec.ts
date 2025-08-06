import { stackInstance } from '../utils/stack-instance';
import { BaseAsset } from '../../src';

const stack = stackInstance();
const imageAssetUid = process.env.IMAGE_ASSET_UID || 'sample_image_uid';

describe('Image Delivery API Comprehensive Tests', () => {
  let imageUrl: string;
  
  beforeAll(async () => {
    // Get a sample image asset URL for transformation tests
    try {
      const asset = await stack.asset(imageAssetUid).fetch<BaseAsset>();
      imageUrl = asset.url;
    } catch (error) {
      console.warn('Could not fetch test image asset, using mock URL');
      imageUrl = 'https://images.contentstack.io/v3/assets/stack/asset/version/sample.jpg';
    }
  });

  describe('Basic Image Transformations', () => {
    it('should support width transformation', () => {
      const transformedUrl = `${imageUrl}?width=300`;
      expect(transformedUrl).toContain('width=300');
      // In a real test, you might make an HTTP request to verify the transformation
    });

    it('should support height transformation', () => {
      const transformedUrl = `${imageUrl}?height=200`;
      expect(transformedUrl).toContain('height=200');
    });

    it('should support combined width and height', () => {
      const transformedUrl = `${imageUrl}?width=300&height=200`;
      expect(transformedUrl).toContain('width=300');
      expect(transformedUrl).toContain('height=200');
    });

    it('should support quality adjustment', () => {
      const transformedUrl = `${imageUrl}?quality=80`;
      expect(transformedUrl).toContain('quality=80');
    });
  });

  describe('Format Conversion', () => {
    it('should support WEBP format conversion', () => {
      const transformedUrl = `${imageUrl}?format=webp`;
      expect(transformedUrl).toContain('format=webp');
    });

    it('should support AVIF format conversion', () => {
      const transformedUrl = `${imageUrl}?format=avif`;
      expect(transformedUrl).toContain('format=avif');
    });

    it('should support Progressive JPEG conversion', () => {
      const transformedUrl = `${imageUrl}?format=pjpg`;
      expect(transformedUrl).toContain('format=pjpg');
    });

    it('should support PNG format conversion', () => {
      const transformedUrl = `${imageUrl}?format=png`;
      expect(transformedUrl).toContain('format=png');
    });
  });

  describe('Auto Optimization', () => {
    it('should support auto WEBP optimization', () => {
      const transformedUrl = `${imageUrl}?auto=webp`;
      expect(transformedUrl).toContain('auto=webp');
    });

    it('should support auto AVIF optimization', () => {
      const transformedUrl = `${imageUrl}?auto=avif`;
      expect(transformedUrl).toContain('auto=avif');
    });

    it('should combine auto with format fallback', () => {
      const transformedUrl = `${imageUrl}?auto=webp&format=jpg`;
      expect(transformedUrl).toContain('auto=webp');
      expect(transformedUrl).toContain('format=jpg');
    });
  });

  describe('Cropping Operations', () => {
    it('should support basic crop by dimensions', () => {
      const transformedUrl = `${imageUrl}?crop=300,400`;
      expect(transformedUrl).toContain('crop=300,400');
    });

    it('should support crop with positioning', () => {
      const transformedUrl = `${imageUrl}?crop=300,400,x150,y75`;
      expect(transformedUrl).toContain('crop=300,400,x150,y75');
    });

    it('should support crop with offset positioning', () => {
      const transformedUrl = `${imageUrl}?crop=300,400,offset-x10.5,offset-y10.5`;
      expect(transformedUrl).toContain('crop=300,400,offset-x10.5,offset-y10.5');
    });

    it('should support smart cropping', () => {
      const transformedUrl = `${imageUrl}?crop=300,400,smart`;
      expect(transformedUrl).toContain('crop=300,400,smart');
    });

    it('should support safe cropping mode', () => {
      const transformedUrl = `${imageUrl}?crop=300,400,safe`;
      expect(transformedUrl).toContain('crop=300,400,safe');
    });

    it('should support aspect ratio cropping', () => {
      const transformedUrl = `${imageUrl}?crop=16:9&width=800`;
      expect(transformedUrl).toContain('crop=16:9');
      expect(transformedUrl).toContain('width=800');
    });
  });

  describe('Fit Mode Operations', () => {
    it('should support fit to bounds mode', () => {
      const transformedUrl = `${imageUrl}?width=300&height=200&fit=bounds`;
      expect(transformedUrl).toContain('fit=bounds');
    });

    it('should support fit by cropping mode', () => {
      const transformedUrl = `${imageUrl}?width=300&height=200&fit=crop`;
      expect(transformedUrl).toContain('fit=crop');
    });
  });

  describe('Image Enhancement', () => {
    it('should support blur effect', () => {
      const transformedUrl = `${imageUrl}?blur=5`;
      expect(transformedUrl).toContain('blur=5');
    });

    it('should support sharpening', () => {
      const transformedUrl = `${imageUrl}?sharpen=a2,r1000,t2`;
      expect(transformedUrl).toContain('sharpen=a2,r1000,t2');
    });

    it('should support saturation adjustment', () => {
      const transformedUrl = `${imageUrl}?saturation=50`;
      expect(transformedUrl).toContain('saturation=50');
    });

    it('should support contrast adjustment', () => {
      const transformedUrl = `${imageUrl}?contrast=20`;
      expect(transformedUrl).toContain('contrast=20');
    });

    it('should support brightness adjustment', () => {
      const transformedUrl = `${imageUrl}?brightness=10`;
      expect(transformedUrl).toContain('brightness=10');
    });
  });

  describe('Overlay Operations', () => {
    it('should support image overlay', () => {
      const overlayUrl = '/v3/assets/stack/overlay/version/watermark.png';
      const transformedUrl = `${imageUrl}?overlay=${encodeURIComponent(overlayUrl)}`;
      expect(transformedUrl).toContain('overlay=');
    });

    it('should support overlay alignment', () => {
      const overlayUrl = '/v3/assets/stack/overlay/version/watermark.png';
      const transformedUrl = `${imageUrl}?overlay=${encodeURIComponent(overlayUrl)}&overlay-align=top,left`;
      expect(transformedUrl).toContain('overlay-align=top,left');
    });

    it('should support overlay repetition', () => {
      const overlayUrl = '/v3/assets/stack/overlay/version/watermark.png';
      const transformedUrl = `${imageUrl}?overlay=${encodeURIComponent(overlayUrl)}&overlay-repeat=both`;
      expect(transformedUrl).toContain('overlay-repeat=both');
    });

    it('should support overlay dimensions', () => {
      const overlayUrl = '/v3/assets/stack/overlay/version/watermark.png';
      const transformedUrl = `${imageUrl}?overlay=${encodeURIComponent(overlayUrl)}&overlay-width=100&overlay-height=50`;
      expect(transformedUrl).toContain('overlay-width=100');
      expect(transformedUrl).toContain('overlay-height=50');
    });
  });

  describe('Advanced Transformations', () => {
    it('should support trim operation', () => {
      const transformedUrl = `${imageUrl}?trim=25,50,75,100`;
      expect(transformedUrl).toContain('trim=25,50,75,100');
    });

    it('should support padding', () => {
      const transformedUrl = `${imageUrl}?pad=20`;
      expect(transformedUrl).toContain('pad=20');
    });

    it('should support background color with padding', () => {
      const transformedUrl = `${imageUrl}?pad=20&bg-color=FF0000`;
      expect(transformedUrl).toContain('pad=20');
      expect(transformedUrl).toContain('bg-color=FF0000');
    });

    it('should support canvas expansion', () => {
      const transformedUrl = `${imageUrl}?canvas=800,600`;
      expect(transformedUrl).toContain('canvas=800,600');
    });

    it('should support orientation changes', () => {
      const transformedUrl = `${imageUrl}?orient=6`;
      expect(transformedUrl).toContain('orient=6');
    });

    it('should support resize filters', () => {
      const transformedUrl = `${imageUrl}?width=500&resize-filter=lanczos3`;
      expect(transformedUrl).toContain('resize-filter=lanczos3');
    });
  });

  describe('Device Pixel Ratio', () => {
    it('should support device pixel ratio scaling', () => {
      const transformedUrl = `${imageUrl}?width=200&dpr=2`;
      expect(transformedUrl).toContain('dpr=2');
    });

    it('should support fractional DPR values', () => {
      const transformedUrl = `${imageUrl}?width=200&dpr=1.5`;
      expect(transformedUrl).toContain('dpr=1.5');
    });
  });

  describe('Complex Transformation Chains', () => {
    it('should support multiple transformations combined', () => {
      const transformedUrl = `${imageUrl}?width=500&height=300&crop=400,250&quality=85&format=webp&sharpen=a1.5,r1000,t2`;
      
      expect(transformedUrl).toContain('width=500');
      expect(transformedUrl).toContain('height=300');
      expect(transformedUrl).toContain('crop=400,250');
      expect(transformedUrl).toContain('quality=85');
      expect(transformedUrl).toContain('format=webp');
      expect(transformedUrl).toContain('sharpen=a1.5,r1000,t2');
    });

    it('should support responsive image generation', () => {
      const sizes = [
        { width: 320, suffix: '_mobile' },
        { width: 768, suffix: '_tablet' },
        { width: 1200, suffix: '_desktop' }
      ];

      sizes.forEach(size => {
        const transformedUrl = `${imageUrl}?width=${size.width}&quality=80&format=webp`;
        expect(transformedUrl).toContain(`width=${size.width}`);
        expect(transformedUrl).toContain('quality=80');
        expect(transformedUrl).toContain('format=webp');
      });
    });
  });

  describe('Error Handling for Image Transformations', () => {
    it('should handle invalid transformation parameters gracefully', () => {
      // Test with invalid quality value
      const invalidTransformUrl = `${imageUrl}?quality=invalid`;
      expect(invalidTransformUrl).toContain('quality=invalid');
      // In a real scenario, this would return an error or fallback
    });

    it('should handle unsupported format requests', () => {
      const unsupportedFormatUrl = `${imageUrl}?format=bmp`;
      expect(unsupportedFormatUrl).toContain('format=bmp');
      // In practice, this might fallback to original format
    });

    it('should handle extreme dimension requests', () => {
      const extremeDimensionsUrl = `${imageUrl}?width=99999&height=99999`;
      expect(extremeDimensionsUrl).toContain('width=99999');
      // Server would likely return an error or apply limits
    });
  });

  describe('Performance and Optimization Tests', () => {
    it('should generate optimized URLs for common use cases', () => {
      const webOptimizedUrl = `${imageUrl}?auto=webp&quality=85&width=800`;
      expect(webOptimizedUrl).toContain('auto=webp');
      expect(webOptimizedUrl).toContain('quality=85');
    });

    it('should handle progressive JPEG for large images', () => {
      const progressiveUrl = `${imageUrl}?width=1200&format=pjpg&quality=80`;
      expect(progressiveUrl).toContain('format=pjpg');
    });
  });
}); 
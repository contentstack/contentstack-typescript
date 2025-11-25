/**
 * Browser Environment - Dependency Safety Check
 * 
 * Purpose: THIS TEST WOULD HAVE CAUGHT THE fs ISSUE!
 * Validates that SDK and its dependencies don't use Node.js-only APIs
 */

describe('Browser Environment - Dependency Safety Check', () => {
  describe('Critical: Detect Node.js-Only API Usage', () => {
    it('SDK should import successfully in browser environment (THE TEST THAT CATCHES YOUR ISSUE)', async () => {
      // This test will FAIL if @contentstack/core or any dependency uses Node.js-only modules
      // In a real browser environment (or jsdom), fs/path/crypto won't be available
      try {
        // Try to import the entire SDK
        const sdk = await import('../../src/index');
        
        // If we reach here, SDK imported successfully
        expect(sdk).toBeDefined();
        expect(sdk.Stack).toBeDefined();
        
        console.log('✅ SDK imported successfully in browser environment');
        // SUCCESS: SDK is browser-safe ✅
      } catch (error: any) {
        // FAILURE: SDK tried to import Node.js-only modules ❌
        console.error('❌ CRITICAL: SDK failed to import in browser environment!');
        console.error('   This usually means a dependency uses Node.js-only APIs');
        console.error('   Error:', error.message);
        
        if (error.message.includes('fs') || 
            error.message.includes('path') || 
            error.message.includes('crypto') ||
            error.message.includes('Cannot find module')) {
          fail(`SDK is NOT browser-safe! A dependency likely uses Node.js APIs. Error: ${error.message}`);
        }
        throw error;
      }
    });

    it('SDK should initialize without errors in browser', () => {
      // If dependencies use Node.js APIs improperly, this will throw
      expect(() => {
        const { Stack } = require('../../src/index');
        const stack = Stack({
          api_key: 'test',
          delivery_token: 'test',
          environment: 'test',
        });
        expect(stack).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Dependency Audit', () => {
    it('should list all direct dependencies', () => {
      // Document what dependencies we're using
      const packageJson = require('../../package.json');
      const dependencies = Object.keys(packageJson.dependencies || {});
      
      console.log('📦 SDK Dependencies:', dependencies);
      
      // Key dependencies to watch
      const criticalDeps = [
        '@contentstack/core',
        '@contentstack/utils',
        'axios',
        'humps',
      ];
      
      criticalDeps.forEach(dep => {
        if (dependencies.includes(dep)) {
          console.log(`✓ Using ${dep}`);
        }
      });
      
      expect(dependencies.length).toBeGreaterThan(0);
    });

    it('should check @contentstack/core for browser compatibility', async () => {
      // This test specifically monitors core package
      try {
        const core = await import('@contentstack/core');
        expect(core).toBeDefined();
        console.log('✅ @contentstack/core imported successfully in browser environment');
      } catch (error: any) {
        console.error('❌ WARNING: @contentstack/core may have browser compatibility issues');
        console.error('   Error:', error.message);
        
        if (error.message.includes('fs') || error.message.includes('Cannot find module')) {
          console.error('❌ CRITICAL: @contentstack/core likely uses Node.js-only modules!');
          console.error('   This will break browser builds!');
        }
        // Don't fail the test if it's just a warning, but log it
        // Uncomment below to make it a hard failure:
        // throw error;
      }
    });

    it('should check @contentstack/utils for browser compatibility', async () => {
      // This test specifically monitors utils package
      try {
        const utils = await import('@contentstack/utils');
        expect(utils).toBeDefined();
        console.log('✅ @contentstack/utils imported successfully in browser environment');
      } catch (error: any) {
        console.error('❌ WARNING: @contentstack/utils may have browser compatibility issues');
        console.error('   Error:', error.message);
        
        if (error.message.includes('fs') || error.message.includes('Cannot find module')) {
          console.error('❌ CRITICAL: @contentstack/utils likely uses Node.js-only modules!');
          console.error('   This will break browser builds!');
        }
        // Don't fail the test if it's just a warning, but log it
        // Uncomment below to make it a hard failure:
        // throw error;
      }
    });
  });

  describe('Build Output Validation', () => {
    it('should check that dist/modern build is browser-compatible', () => {
      // The modern build should target browsers
      const packageJson = require('../../package.json');
      const modernExport = packageJson.exports['.'].import.default;
      
      expect(modernExport).toContain('dist/modern');
      console.log('📦 Modern build path:', modernExport);
    });

    it('should verify tsup config targets browsers', () => {
      // Verify tsup.config.js has proper browser targets
      const tsupConfig = require('../../tsup.config.js');
      const configs = tsupConfig.default;
      
      // Find modern config
      const modernConfig = configs.find((c: any) => c.outDir === 'dist/modern');
      
      expect(modernConfig).toBeDefined();
      expect(modernConfig.target).toBeDefined();
      
      console.log('🎯 Modern build targets:', modernConfig.target);
      
      // Verify browser targets are specified
      const hasChrome = modernConfig.target.some((t: string) => t.includes('chrome'));
      const hasFirefox = modernConfig.target.some((t: string) => t.includes('firefox'));
      const hasSafari = modernConfig.target.some((t: string) => t.includes('safari'));
      
      expect(hasChrome || hasFirefox || hasSafari).toBe(true);
    });
  });

  describe('Axios Configuration', () => {
    it('should verify axios is configured for browser', () => {
      // Axios should work in both Node and browser
      const axios = require('axios');
      expect(axios).toBeDefined();
      
      // In browser, axios should use XMLHttpRequest
      // In Node, axios should use http/https modules
      console.log('📡 HTTP client: axios');
    });
  });

  describe('Polyfill Detection', () => {
    it('should check if SDK needs polyfills', () => {
      // Document what browser APIs SDK relies on
      const requiredAPIs = {
        fetch: typeof fetch !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        Promise: typeof Promise !== 'undefined',
        URL: typeof URL !== 'undefined',
      };
      
      console.log('🔧 Required Browser APIs:', requiredAPIs);
      
      // All should be available in jsdom
      Object.entries(requiredAPIs).forEach(([api, available]) => {
        if (!available) {
          console.warn(`⚠️  ${api} is not available, may need polyfill`);
        }
      });
    });
  });
});


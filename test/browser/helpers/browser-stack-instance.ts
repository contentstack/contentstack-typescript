/**
 * Browser Environment Stack Instance
 * 
 * Uses real .env credentials to test SDK with actual API calls
 * This validates SDK works in browser environment with real data
 */

import dotenv from 'dotenv';
import * as contentstack from '../../../src/lib/contentstack';
import { StackConfig } from '../../../src/lib/types';

dotenv.config();

/**
 * Get stack configuration from environment variables
 */
export function getStackConfig(): StackConfig {
  return {
    apiKey: process.env.API_KEY || 'test_api_key',
    deliveryToken: process.env.DELIVERY_TOKEN || 'test_delivery_token',
    environment: process.env.ENVIRONMENT || 'test',
    host: process.env.HOST || undefined,
    live_preview: {
      enable: false,
      preview_token: process.env.PREVIEW_TOKEN || '',
      host: process.env.LIVE_PREVIEW_HOST || '',
    }
  };
}

/**
 * Create browser stack instance with real credentials
 */
export function browserStackInstance() {
  const config = getStackConfig();
  console.log('🔧 Browser Stack Config:', {
    apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'MISSING',
    deliveryToken: config.deliveryToken ? `${config.deliveryToken.substring(0, 8)}...` : 'MISSING',
    environment: config.environment,
    host: config.host
  });
  return contentstack.stack(config);
}

/**
 * Check if we have real credentials (for conditional testing)
 */
export function hasRealCredentials(): boolean {
  return !!(
    process.env.API_KEY && 
    process.env.DELIVERY_TOKEN && 
    process.env.ENVIRONMENT
  );
}

/**
 * Skip test if no real credentials available
 */
export function skipIfNoCredentials() {
  if (!hasRealCredentials()) {
    console.warn('⚠️  Skipping test - No .env credentials found');
    console.warn('   Create .env file with API_KEY, DELIVERY_TOKEN, ENVIRONMENT');
    return true;
  }
  return false;
}


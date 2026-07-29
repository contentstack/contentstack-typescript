import dotenv from 'dotenv';
import * as contentstack from '../../src/stack';
import { StackConfig } from '../../src/common/types';
import { requestCapturePlugin } from './request-capture-plugin';

dotenv.config();

function stackInstance() {
  const params: StackConfig = {
    host: process.env.HOST || '',
    apiKey: process.env.API_KEY || '',
    deliveryToken: process.env.DELIVERY_TOKEN || '',
    environment: process.env.ENVIRONMENT || '',
    live_preview: {
      enable: false,
      preview_token: process.env.PREVIEW_TOKEN || '',
      host: process.env.LIVE_PREVIEW_HOST || '',
    }
  };

  // Attach the HTTP request-capture plugin for rich test reports (opt-in).
  if (process.env.ENABLE_HTTP_CAPTURE === 'true') {
    params.plugins = [requestCapturePlugin];
  }

  return contentstack.stack(params);
}

export { stackInstance };

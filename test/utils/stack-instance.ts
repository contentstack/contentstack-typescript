import dotenv from 'dotenv';
import * as contentstack from '../../src/lib/contentstack';
import { StackConfig } from '../../src/lib/types';

dotenv.config();

function stackInstance() {
  const params: StackConfig = {
    apiKey: process.env.API_KEY || '',
    deliveryToken: process.env.DELIVERY_TOKEN || '',
    environment: process.env.ENVIRONMENT || '',
    live_preview: {
      enable: true,
      preview_token: "abcda",
      host: "xyz,contentstack.com",
    }
  };

  return contentstack.stack(params);
}

export { stackInstance };

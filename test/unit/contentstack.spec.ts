import * as exp from "constants";
import * as core from "@contentstack/core";
import * as Contentstack from "../../src/stack";
import { Stack } from "../../src/stack";
import { Policy, Region, StackConfig } from "../../src/common/types";
import {
  CUSTOM_HOST,
  DUMMY_URL,
  HOST_AU_REGION,
  HOST_EU_REGION,
  HOST_URL,
  HOST_AZURE_NA_REGION,
  HOST_GCP_NA_REGION,
  HOST_GCP_EU_REGION,
} from "../utils/constant";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import * as utils from "../../src/common/utils";

jest.mock("@contentstack/core");
const createHttpClientMock = <jest.Mock<typeof core.httpClient>>(
  (<unknown>core.httpClient)
);

const reqInterceptor = jest.fn();
const resInterceptor = jest.fn();

describe("Contentstack", () => {
  beforeEach(() =>
    createHttpClientMock.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      defaults: {
        host: HOST_URL,
      },
      interceptors: {
        request: {
          use: reqInterceptor,
        },
        response: {
          use: resInterceptor,
        },
      },
    })
  );
  afterEach(() => {
    createHttpClientMock.mockReset();
  });

  const createStackInstance = (config: StackConfig) =>
    Contentstack.stack(config);

  it("should throw error when api key is empty", (done) => {
    const config = {
      apiKey: "",
      deliveryToken: "",
      environment: "",
    };

    expect(() => createStackInstance(config)).toThrow(
      "API key for Stack is required."
    );
    done();
  });

  it("should throw error when Delivery Token is empty", (done) => {
    expect(() => {
      const config = {
        apiKey: "apiKey",
        deliveryToken: "",
        environment: "",
      };
      createStackInstance(config);
    }).toThrow("Delivery token for Stack is required.");
    done();
  });

  it("should throw error when Environment is empty", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery_token",
      environment: "",
    };
    expect(() => createStackInstance(config)).toThrow(
      "Environment for Stack is required"
    );
    done();
  });

  it("should create stack instance when the mandatory params are passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should create stack instance when the mandatory params are passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      early_access: ["newCDA", "taxonomy"],
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should set defaultHost, header and params when stack instance is created", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      branch: "branch",
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    expect(stackInstance.config.apiKey).toEqual(config.apiKey);
    expect(stackInstance.config.deliveryToken).toEqual(config.deliveryToken);
    expect(stackInstance.config.environment).toEqual(config.environment);
    expect(stackInstance.config.branch).toEqual(config.branch);
    done();
  });

  it("should change default host when host config is passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      host: HOST_EU_REGION,
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should change default host to AU when AU host config is passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      host: HOST_AU_REGION,
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should change the host when custom host config is passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      host: CUSTOM_HOST,
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should change default host to config host when region and host in config passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      host: DUMMY_URL,
      region: Region.EU,
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should change default host to US when US region in config is passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      region: Region.US,
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });
  it("should change default host to EU when EU region in config is passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      region: Region.EU,
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should change default host to AU when AU region in config is passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      region: Region.AU,
    };
    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should change default host to azure-na when AZURE_NA region in config is passed", (done) => {
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      region: Region.AZURE_NA,
    };

    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    done();
  });

  it("should add logHandler", async () => {
    const mockLogHandler = jest.fn();
    const config = {
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      region: Region.AZURE_NA,
      logHandler: mockLogHandler,
      cacheOptions: {
        policy: Policy.IGNORE_CACHE,
      },
    };

    const stackInstance = createStackInstance(config);
    expect(stackInstance).toBeInstanceOf(Stack);
    expect(mockLogHandler).not.toHaveBeenCalled();
    mockLogHandler.mockReset();
  });

  it("should add plugins onRequest and onResponse as req and res interceptors when plugin is passed", (done) => {
    const mockPlugin = {
      onRequest: jest.fn((request) => request),
      onResponse: jest.fn((response) => response),
    };

    const stackInstance = createStackInstance({
      apiKey: "apiKey",
      deliveryToken: "delivery",
      environment: "env",
      plugins: [mockPlugin],
    });

    expect(stackInstance).toBeInstanceOf(Stack);
    expect(reqInterceptor).toHaveBeenCalledWith(expect.any(Function));
    expect(resInterceptor).toHaveBeenCalledWith(expect.any(Function));

    createHttpClientMock.mockReset();
    done();
  });

  describe('locale configuration', () => {
    it('should set locale in params when locale is provided in config', () => {
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        locale: "fr-fr",
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(stackInstance).toBeInstanceOf(Stack);
      expect(stackInstance.config.locale).toEqual("fr-fr");
    });
  });

  describe('live preview configuration in browser environment', () => {
    const originalDocument = global.document;
    const originalWindow = global.window;

    beforeEach(() => {
      // Mock browser environment
      (utils.isBrowser as jest.Mock) = jest.fn();
      delete (global as any).document;
      delete (global as any).window;
    });

    afterEach(() => {
      global.document = originalDocument;
      global.window = originalWindow;
      jest.restoreAllMocks();
    });

    it('should extract live_preview params from URL in browser environment', () => {
      const isBrowserSpy = jest.spyOn(utils, 'isBrowser').mockReturnValue(true);
      
      // Mock document.location
      const mockSearchParams = new Map([
        ['live_preview', 'test_hash'],
        ['release_id', 'release123'],
        ['preview_timestamp', '123456789']
      ]);
      
      (global as any).document = {
        location: {
          toString: () => 'http://localhost?live_preview=test_hash&release_id=release123&preview_timestamp=123456789'
        }
      };

      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        live_preview: {
          enable: true,
          live_preview: 'default_hash'
        },
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(isBrowserSpy).toHaveBeenCalled();
      expect(stackInstance).toBeInstanceOf(Stack);
      
      isBrowserSpy.mockRestore();
    });

    it('should use fallback value when live_preview param is empty (line 74 || branch)', () => {
      const isBrowserSpy = jest.spyOn(utils, 'isBrowser').mockReturnValue(true);
      
      // Mock document.location with empty live_preview param
      (global as any).document = {
        location: {
          toString: () => 'http://localhost?live_preview='
        }
      };

      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        live_preview: {
          enable: true,
          live_preview: 'fallback_hash'
        },
      };
      
      const stackInstance = createStackInstance(config);
      
      // Should use the fallback value when params.get returns empty string
      expect(stackInstance.config.live_preview?.live_preview).toBe('fallback_hash');
      
      isBrowserSpy.mockRestore();
    });

    it('should not extract params when not in browser environment', () => {
      const isBrowserSpy = jest.spyOn(utils, 'isBrowser').mockReturnValue(false);
      
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        live_preview: {
          enable: true,
        },
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(isBrowserSpy).toHaveBeenCalled();
      expect(stackInstance).toBeInstanceOf(Stack);
      
      isBrowserSpy.mockRestore();
    });
  });

  describe('cache adapter configuration', () => {
    it('should set cache adapter when cacheOptions with persistenceStore is provided', () => {
      const mockAdapter = jest.fn();
      const mockClient = {
        defaults: {
          host: HOST_URL,
          adapter: mockAdapter,
        },
        interceptors: {
          request: {
            use: reqInterceptor,
          },
          response: {
            use: resInterceptor,
          },
        },
      };

      createHttpClientMock.mockReturnValue(mockClient as any);

      const mockPersistenceStore = {
        setItem: jest.fn(),
        getItem: jest.fn(),
      };
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        cacheOptions: {
          policy: Policy.CACHE_THEN_NETWORK,
          persistenceStore: mockPersistenceStore,
        },
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(stackInstance).toBeInstanceOf(Stack);
      expect(mockClient.defaults.adapter).toBeDefined();
    });

    it('should throw when cache policy is set but persistenceStore is missing', () => {
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        cacheOptions: {
          policy: Policy.CACHE_THEN_NETWORK,
        },
      };
      
      expect(() => createStackInstance(config)).toThrow(/persistenceStore/);
    });
  });

  describe('debug mode with logging interceptors', () => {
    it('should add request and response logging interceptors when debug is enabled', () => {
      const mockLogHandler = jest.fn();
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        debug: true,
        logHandler: mockLogHandler,
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(stackInstance).toBeInstanceOf(Stack);
      expect(reqInterceptor).toHaveBeenCalled();
      expect(resInterceptor).toHaveBeenCalled();
    });
  });

  describe('plugin interceptors execution', () => {
    it('should execute plugin onRequest and onResponse methods', () => {
      const mockOnRequest = jest.fn((req) => req);
      const mockOnResponse = jest.fn((req, res, data) => res);
      let requestInterceptor: any;
      let responseInterceptor: any;

      const mockClient = {
        defaults: {
          host: HOST_URL,
        },
        interceptors: {
          request: {
            use: jest.fn((interceptor) => {
              requestInterceptor = interceptor;
            }),
          },
          response: {
            use: jest.fn((successInterceptor) => {
              responseInterceptor = successInterceptor;
            }),
          },
        },
      };

      createHttpClientMock.mockReturnValue(mockClient as any);

      const mockPlugin = {
        onRequest: mockOnRequest,
        onResponse: mockOnResponse,
      };

      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        plugins: [mockPlugin],
      };
      
      createStackInstance(config);

      // Test that interceptors were registered
      expect(mockClient.interceptors.request.use).toHaveBeenCalled();
      expect(mockClient.interceptors.response.use).toHaveBeenCalled();

      // Test request interceptor execution
      const mockRequest = { url: '/test' };
      requestInterceptor(mockRequest);
      expect(mockOnRequest).toHaveBeenCalledWith(mockRequest);

      // Test response interceptor execution
      const mockResponse = {
        request: {},
        data: {},
      };
      responseInterceptor(mockResponse);
      expect(mockOnResponse).toHaveBeenCalledWith(mockResponse.request, mockResponse, mockResponse.data);
    });

    it('should handle multiple plugins in order', () => {
      const executionOrder: string[] = [];
      let requestInterceptor: any;

      const mockClient = {
        defaults: {
          host: HOST_URL,
        },
        interceptors: {
          request: {
            use: jest.fn((interceptor) => {
              requestInterceptor = interceptor;
            }),
          },
          response: {
            use: jest.fn(),
          },
        },
      };

      createHttpClientMock.mockReturnValue(mockClient as any);

      const mockPlugin1 = {
        onRequest: jest.fn((req) => {
          executionOrder.push('plugin1');
          return req;
        }),
        onResponse: jest.fn((req, res, data) => res),
      };

      const mockPlugin2 = {
        onRequest: jest.fn((req) => {
          executionOrder.push('plugin2');
          return req;
        }),
        onResponse: jest.fn((req, res, data) => res),
      };

      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        plugins: [mockPlugin1, mockPlugin2],
      };
      
      createStackInstance(config);

      const mockRequest = { url: '/test' };
      requestInterceptor(mockRequest);

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });
  });
});

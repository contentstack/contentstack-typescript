import * as exp from "constants";
import * as core from "@contentstack/core";
import * as Contentstack from "../../src/lib/contentstack";
import { Stack } from "../../src/lib/stack";
import { Policy, Region, StackConfig } from "../../src/lib/types";
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
import * as utils from "../../src/lib/utils";

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

  describe('getHostforRegion integration in stack creation', () => {
    it('should use getHostforRegion to set default hostname for aws_na region', () => {
      const getHostforRegionSpy = jest.spyOn(utils, 'getHostforRegion');
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        region: "aws_na",
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(getHostforRegionSpy).toHaveBeenCalledWith("aws_na", undefined);
      expect(stackInstance).toBeInstanceOf(Stack);
      
      getHostforRegionSpy.mockRestore();
    });

    it('should use getHostforRegion to set default hostname for eu region', () => {
      const getHostforRegionSpy = jest.spyOn(utils, 'getHostforRegion');
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        region: "eu",
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(getHostforRegionSpy).toHaveBeenCalledWith("eu", undefined);
      expect(stackInstance).toBeInstanceOf(Stack);
      
      getHostforRegionSpy.mockRestore();
    });

    it('should use getHostforRegion with custom host when both region and host are provided', () => {
      const getHostforRegionSpy = jest.spyOn(utils, 'getHostforRegion');
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        region: "eu",
        host: CUSTOM_HOST,
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(getHostforRegionSpy).toHaveBeenCalledWith("eu", CUSTOM_HOST);
      expect(stackInstance).toBeInstanceOf(Stack);
      
      getHostforRegionSpy.mockRestore();
    });

    it('should use getHostforRegion for azure-na region', () => {
      const getHostforRegionSpy = jest.spyOn(utils, 'getHostforRegion');
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        region: "azure-na",
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(getHostforRegionSpy).toHaveBeenCalledWith("azure-na", undefined);
      expect(stackInstance).toBeInstanceOf(Stack);
      
      getHostforRegionSpy.mockRestore();
    });

    it('should use getHostforRegion for gcp-na region', () => {
      const getHostforRegionSpy = jest.spyOn(utils, 'getHostforRegion');
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        region: "gcp-na",
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(getHostforRegionSpy).toHaveBeenCalledWith("gcp-na", undefined);
      expect(stackInstance).toBeInstanceOf(Stack);
      
      getHostforRegionSpy.mockRestore();
    });

    it('should use getHostforRegion for gcp-eu region', () => {
      const getHostforRegionSpy = jest.spyOn(utils, 'getHostforRegion');
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        region: "gcp-eu",
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(getHostforRegionSpy).toHaveBeenCalledWith("gcp-eu", undefined);
      expect(stackInstance).toBeInstanceOf(Stack);
      
      getHostforRegionSpy.mockRestore();
    });

    it('should handle getHostforRegion error gracefully', () => {
      const getHostforRegionSpy = jest.spyOn(utils, 'getHostforRegion').mockImplementation(() => {
        throw new Error('Unable to set host using the provided region. Please provide a valid region.');
      });
      
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
        region: "invalid_region",
      };
      
      expect(() => createStackInstance(config)).toThrow(
        'Unable to set host using the provided region. Please provide a valid region.'
      );
      
      getHostforRegionSpy.mockRestore();
    });

    it('should use getHostforRegion with undefined region when no region is provided', () => {
      const getHostforRegionSpy = jest.spyOn(utils, 'getHostforRegion');
      const config = {
        apiKey: "apiKey",
        deliveryToken: "delivery",
        environment: "env",
      };
      
      const stackInstance = createStackInstance(config);
      
      expect(getHostforRegionSpy).toHaveBeenCalledWith(undefined, undefined);
      expect(stackInstance).toBeInstanceOf(Stack);
      
      getHostforRegionSpy.mockRestore();
    });
  });
});

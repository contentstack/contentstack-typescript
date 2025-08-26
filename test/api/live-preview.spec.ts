import * as contentstack from "../../src/lib/contentstack";
import { TEntry } from "./types";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY as string;
const deliveryToken = process.env.DELIVERY_TOKEN as string;
const environment = process.env.ENVIRONMENT as string;
const branch = process.env.BRANCH as string;
const entryUid = process.env.ENTRY_UID as string;
const previewToken = process.env.PREVIEW_TOKEN as string;
const managementToken = process.env.MANAGEMENT_TOKEN as string;
const host = process.env.HOST as string;

describe("Live preview tests", () => {
  test("should check for values initialized", () => {
    const stack = contentstack.stack({
      apiKey: apiKey,
      deliveryToken: deliveryToken,
      environment: environment,
      branch: branch,
    });
    const livePreviewObject = stack.config.live_preview;
    expect(livePreviewObject).toBeUndefined();
    expect(stack.config.host).toBe("cdn.contentstack.io");
    expect(stack.config.branch).toBe(branch);
  });

  test("should check host when live preview is enabled and management token is provided", () => {
    const stack = contentstack.stack({
      apiKey: apiKey,
      deliveryToken: deliveryToken,
      environment: environment,
      live_preview: {
        enable: true,
        management_token: managementToken,
        host: host,
      },
    });
    const livePreviewObject = stack.config.live_preview;
    expect(livePreviewObject).not.toBeUndefined();
    expect(livePreviewObject).toHaveProperty("enable");
    expect(livePreviewObject).toHaveProperty("host");
    expect(livePreviewObject).not.toHaveProperty("preview");
    expect(stack.config.host).toBe("cdn.contentstack.io");
  });

  test("should check host when live preview is disabled and management token is provided", () => {
    const stack = contentstack.stack({
      apiKey: apiKey,
      deliveryToken: deliveryToken,
      environment: environment,
      live_preview: {
        enable: false,
        management_token: managementToken,
      },
    });
    const livePreviewObject = stack.config.live_preview;
    expect(livePreviewObject).not.toBeUndefined();
    expect(livePreviewObject).toHaveProperty("enable");
    expect(livePreviewObject).not.toHaveProperty("host");
    expect(livePreviewObject).not.toHaveProperty("preview");
    expect(stack.config.host).toBe("cdn.contentstack.io");
  });

  test("should check host when live preview is enabled and preview token is provided", () => {
    const stack = contentstack.stack({
      apiKey: apiKey,
      deliveryToken: deliveryToken,
      environment: environment,
      live_preview: {
        enable: true,
        preview_token: previewToken,
        host: host,
      },
    });
    const livePreviewObject = stack.config.live_preview;
    expect(livePreviewObject).not.toBeUndefined();
    expect(livePreviewObject).toHaveProperty("enable");
    expect(livePreviewObject).toHaveProperty("host");
    expect(livePreviewObject).not.toHaveProperty("preview");
    expect(stack.config.host).toBe("cdn.contentstack.io");
  });

  test("should check host when live preview is disabled and preview token is provided", () => {
    const stack = contentstack.stack({
      apiKey: apiKey,
      deliveryToken: deliveryToken,
      environment: environment,
      live_preview: {
        enable: false,
        preview_token: previewToken,
      },
    });
    const livePreviewObject = stack.config.live_preview;
    expect(livePreviewObject).not.toBeUndefined();
    expect(livePreviewObject).toHaveProperty("enable");
    expect(livePreviewObject).not.toHaveProperty("host");
    expect(livePreviewObject).not.toHaveProperty("preview");
    expect(stack.config.host).toBe("cdn.contentstack.io");
  });
});

describe("Live preview query Entry API tests", () => {
  it("should check for entry when live preview is enabled with management token", async () => {
    try {
      const stack = contentstack.stack({
        apiKey: process.env.API_KEY as string,
        deliveryToken: process.env.DELIVERY_TOKEN as string,
        environment: process.env.ENVIRONMENT as string,
        live_preview: {
          enable: true,
          management_token: managementToken,
          host: host,
        },
      });
      stack.livePreviewQuery({
        contentTypeUid: "blog_post",
        live_preview: "ser",
      });
      const result = await stack
        .contentType("blog_post")
        .entry(entryUid)
        .fetch<TEntry>();
      expect(result).toBeDefined();
      expect(result._version).toBeDefined();
      expect(result.locale).toEqual("en-us");
      expect(result.uid).toBeDefined();
      expect(result.created_by).toBeDefined();
      expect(result.updated_by).toBeDefined();
    } catch (error: any) {
      expect(error).toBeDefined();
      const errorData = JSON.parse(error);
      expect(errorData.status).toEqual(403);
    }
  });

  it("should check for entry is when live preview is disabled with management token", async () => {
    const stack = contentstack.stack({
      host: process.env.HOST as string,
      apiKey: process.env.API_KEY as string,
      deliveryToken: process.env.DELIVERY_TOKEN as string,
      environment: process.env.ENVIRONMENT as string,
      live_preview: {
        enable: false,
        management_token: managementToken,
      },
    });
    stack.livePreviewQuery({
      contentTypeUid: "blog_post",
      live_preview: "ser",
    });
    const result = await stack
      .contentType("blog_post")
      .entry(entryUid)
      .fetch<TEntry>();
    expect(result).toBeDefined();
    expect(result._version).toBeDefined();
    expect(result.locale).toEqual("en-us");
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });

  it("should check for entry is when live preview is disabled with preview token", async () => {
    const stack = contentstack.stack({
      host: process.env.HOST as string,
      apiKey: process.env.API_KEY as string,
      deliveryToken: process.env.DELIVERY_TOKEN as string,
      environment: process.env.ENVIRONMENT as string,
      live_preview: {
        enable: false,
        preview_token: previewToken,
      },
    });
    stack.livePreviewQuery({
      contentTypeUid: "blog_post",
      live_preview: "ser",
    });
    const result = await stack
      .contentType("blog_post")
      .entry(entryUid)
      .fetch<TEntry>();
    expect(result).toBeDefined();
    expect(result._version).toBeDefined();
    expect(result.locale).toEqual("en-us");
    expect(result.uid).toBeDefined();
    expect(result.created_by).toBeDefined();
    expect(result.updated_by).toBeDefined();
  });
});

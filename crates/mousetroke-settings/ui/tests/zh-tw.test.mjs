import assert from "node:assert/strict";
import { after, test } from "node:test";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
after(() => server.close());
const { initLang, t } = await server.ssrLoadModule("/src/i18n/index.ts");
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
Object.assign(globalThis, { document: dom.window.document, location: dom.window.location });
after(() => dom.window.close());

test("Traditional Chinese setting and system aliases select the same catalog", () => {
  for (const tag of ["zh-TW", "zh-HK", "zh-MO", "zh-Hant", "zh-Hant-TW"]) {
    assert.equal(initLang({ setting: "auto", systemLangs: [tag, "en-US"], url: "" }), "zh-TW");
    assert.equal(document.documentElement.lang, "zh-TW");
    assert.equal(t("ui.prefs.language"), "語言");
    assert.equal(t("common.undo"), "復原");
  }
  assert.equal(initLang({ setting: "zh-TW", systemLangs: ["en-US"], url: "" }), "zh-TW");
  assert.equal(initLang({ setting: "zh-CN", systemLangs: ["zh-TW"], url: "" }), "zh-CN");
});

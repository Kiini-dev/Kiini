"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 * Jest configuration for Kiini mobile app
 */
var _default = {
  preset: "jest-expo",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  transformIgnorePatterns: ["/node_modules/(?!(@react-native|react-native|expo|@expo|@react-navigation)/)"],
  testMatch: ["**/__tests__/**/*.(test|spec).{ts,tsx}", "**/?(*.)+(test|spec).{ts,tsx}"]
};
exports["default"] = _default;
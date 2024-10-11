import { ESLintUtils } from "@typescript-eslint/utils"
import noMissingTranslations from "../no-missing-translations"
import { jest } from "@jest/globals"

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
})
jest.mock("fs", () => {
  const actualFs = jest.requireActual<typeof import("fs")>("fs")
  const newFs = {
    ...actualFs,
    readFileSync: jest.fn((file: string) => {
      if (file === "en.json") {
        return JSON.stringify({
          "Existing key": "Existing value",
          "Key that only exists in en.json": "Value",
        })
      }
      if (file === "nl.json") {
        return JSON.stringify({
          "Existing key": "Existing value",
        })
      }
    }),
  }
  return {
    __esModule: true,
    ...newFs,
  }
})

ruleTester.run("no-missing-translations", noMissingTranslations, {
  valid: [
    {
      name: "Function declaration",
      code: "i18n.t('Existing key')",
      options: [
        {
          translationFiles: ["en.json", "nl.json"],
        },
      ],
    },
  ],
  invalid: [
    {
      name: "Missing translation key in multiple files",
      code: 'i18n.t("Missing key")',
      errors: [
        {
          messageId: "missingTranslationKey",
          data: {
            translationKey: "Missing key",
            invalidFiles: "'en.json', 'nl.json'",
          },
        },
      ],
      options: [
        {
          translationFiles: ["en.json", "nl.json"],
        },
      ],
    },
    {
      name: "Missing translation key in one file",
      code: 'i18n.t("Key that only exists in en.json")',
      errors: [
        {
          messageId: "missingTranslationKey",
          data: {
            translationKey: "Key that only exists in en.json",
            invalidFiles: "'nl.json'",
          },
        },
      ],
      options: [
        {
          translationFiles: ["en.json", "nl.json"],
        },
      ],
    },
  ],
})

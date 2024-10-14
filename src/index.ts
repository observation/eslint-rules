import noFunctionWithoutLogging from "./rules/no-function-without-logging"
import noMissingTranslations from "./rules/no-missing-translations"

const rules = {
  "no-function-without-logging": noFunctionWithoutLogging,
  'no-missing-translations': noMissingTranslations,
}

export { rules }

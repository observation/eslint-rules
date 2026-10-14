import noEagerTranslations from "./rules/no-eager-translations"
import noFunctionWithoutLogging from "./rules/no-function-without-logging"
import noMissingTranslations from "./rules/no-missing-translations"

const rules = {
  "no-eager-translations": noEagerTranslations,
  "no-function-without-logging": noFunctionWithoutLogging,
  'no-missing-translations': noMissingTranslations,
}

export { rules }

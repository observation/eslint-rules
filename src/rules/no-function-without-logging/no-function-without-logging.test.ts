import noFunctionWithoutLogging from "./no-function-without-logging";
import { ESLintUtils } from "@typescript-eslint/utils";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
});

ruleTester.run("no-function-without-logging", noFunctionWithoutLogging, {
  valid: [
    {
      name: "Function declaration",
      code: "function functionName(){ Log.debug('file:functionName')}",
    },
    {
      name: "Function in variable declaration",
      code: "const functionName = () => { Log.debug('file:functionName') }",
    },
    {
      name: "Static function declaration",
      code: "static function functionName(){ Log.debug('file:functionName') }",
    },
    {
      name: "Function declaration in class",
      code: "class ClassName { functionName(){ Log.debug('file:functionName') } }",
    },
    {
      name: "Function in variable declaration in class",
      code: "class ClassName { const functionName = () => { Log.debug('file:functionName') } }",
    },
    {
      name: "Class constructor does not need logging statement",
      code: "class ClassName { constructor(){} }",
    },
    {
      name: "Class getter does not need logging statement",
      code: "class ClassName { get value(){} }",
    },
    {
      name: "Logging statement can include multiple arguments",
      code: "function functionName(){ Log.debug('file:functionName', 1)}",
    },
    {
      name: "Logging statement can have extended text",
      code: "function functionName(){ Log.debug('file:functionName with extra text')}",
    },
    {
      name: "Lambda function with body does not need logging statement",
      code: "const functionName = () => otherFunction()",
    },
    {
      name: "Component declaration does not need logging statement",
      filename: "Component",
      code: "const Component = () => {  }",
    },
    {
      name: "Component level logging only includes component name",
      filename: "Component",
      code: "const Component = () => { Log.debug('Component') }",
    },
  ],
  invalid: [
    {
      name: "Missing logging in function declaration",
      code: "function functionName(){}",
      errors: [
        {
          messageId: "missingLogging",
          data: { expectedLogging: "file:functionName" },
          suggestions: [
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.trace('file:functionName');" },
              output:
                "function functionName(){Log.trace('file:functionName');}",
            },
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.debug('file:functionName');" },
              output:
                "function functionName(){Log.debug('file:functionName');}",
            },
          ],
        },
      ],
    },
    {
      name: "Missing logging in function in variable declaration",
      code: "const functionName = () => { }",
      errors: [
        {
          messageId: "missingLogging",
          data: { expectedLogging: "file:functionName" },
          suggestions: [
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.trace('file:functionName');" },
              output:
                "const functionName = () => {Log.trace('file:functionName'); }",
            },
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.debug('file:functionName');" },
              output:
                "const functionName = () => {Log.debug('file:functionName'); }",
            },
          ],
        },
      ],
    },
    {
      name: "Missing logging in static function declaration",
      code: "static function functionName(){ }",
      errors: [
        {
          messageId: "missingLogging",
          data: { expectedLogging: "file:functionName" },
          suggestions: [
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.trace('file:functionName');" },
              output:
                "static function functionName(){Log.trace('file:functionName'); }",
            },
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.debug('file:functionName');" },
              output:
                "static function functionName(){Log.debug('file:functionName'); }",
            },
          ],
        },
      ],
    },
    {
      name: "Missing logging in class function",
      code: "class ClassName { functionName(){ } }",
      errors: [
        {
          messageId: "missingLogging",
          data: { expectedLogging: "file:functionName" },
          suggestions: [
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.trace('file:functionName');" },
              output:
                "class ClassName { functionName(){Log.trace('file:functionName'); } }",
            },
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.debug('file:functionName');" },
              output:
                "class ClassName { functionName(){Log.debug('file:functionName'); } }",
            },
          ],
        },
      ],
    },
    {
      name: "Missing logging in function in class property",
      code: "class ClassName { functionName = () => { } }",
      errors: [
        {
          messageId: "missingLogging",
          data: { expectedLogging: "file:functionName" },
          suggestions: [
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.trace('file:functionName');" },
              output:
                "class ClassName { functionName = () => {Log.trace('file:functionName'); } }",
            },
            {
              messageId: "addLoggingSuggestion",
              data: { suggestedCode: "Log.debug('file:functionName');" },
              output:
                "class ClassName { functionName = () => {Log.debug('file:functionName'); } }",
            },
          ],
        },
      ],
    },
    {
      name: "Missing function name in logging",
      code: "function functionName(){ Log.debug('file')}",
      errors: [
        {
          messageId: "incorrectLogging",
          suggestions: [
            {
              messageId: "incorrectLogging",
              output:
                "function functionName(){ Log.debug('file:functionName')}",
            },
          ],
        },
      ],
    },
    {
      name: "Missing filename in logging",
      code: "function functionName(){ Log.debug('functionName')}",
      errors: [
        {
          messageId: "incorrectLogging",
          suggestions: [
            {
              messageId: "incorrectLogging",
              output:
                "function functionName(){ Log.debug('file:functionName')}",
            },
          ],
        },
      ],
    },
    {
      name: "No arguments given to log statement",
      code: `const functionName = () => { Log.debug() }`,
      errors: [
        {
          messageId: "incorrectLogging",
          suggestions: [
            {
              messageId: "incorrectLogging",
              output:
                "const functionName = () => { Log.debug('file:functionName') }",
            },
          ],
        },
      ],
    },
  ],
});

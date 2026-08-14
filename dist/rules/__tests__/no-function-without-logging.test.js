"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const no_function_without_logging_1 = __importDefault(require("../no-function-without-logging"));
const ruleTester = new rule_tester_1.RuleTester();
ruleTester.run("no-function-without-logging", no_function_without_logging_1.default, {
    valid: [
        {
            name: "Function declaration",
            code: "function functionName(){ Log.debug('file:functionName') }",
        },
        {
            name: "Function in variable declaration",
            code: "const functionName = () => { Log.debug('file:functionName') }",
        },
        {
            name: "Static function declaration",
            code: "class MyClass { static functionName() { Log.debug('file:functionName') } }",
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
            name: "Class setter does not need logging statement",
            code: "class ClassName { set value(value){} }",
        },
        {
            name: "Setter like function (class method definition starting with 'set[A-Z]' returning void) does not need logging statement",
            code: "class ClassName { setValue(value){} }",
        },
        {
            name: "Logging statement can include multiple arguments",
            code: "function functionName(){ Log.debug('file:functionName', 1) }",
        },
        {
            name: "Logging statement can have extended text",
            code: "function functionName(){ Log.debug('file:functionName with extra text') }",
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
        {
            name: "Platform-specific suffix is stripped from filename in logging",
            filename: "SomeClass.android.ts",
            code: "function functionName(){ Log.debug('SomeClass:functionName') }",
        },
        {
            name: "Ignored function declaration is skipped",
            options: [{ ignoreList: ["ignoredFunction"] }],
            code: "function ignoredFunction(){}",
        },
        {
            name: "Ignored arrow function in variable declaration is skipped",
            options: [{ ignoreList: ["ignoredFunction"] }],
            code: "const ignoredFunction = () => { }",
        },
        {
            name: "Ignored class method is skipped",
            options: [{ ignoreList: ["ignoredFunction"] }],
            code: "class ClassName { ignoredFunction(){ } }",
        },
        {
            name: "Ignored class property arrow function is skipped",
            options: [{ ignoreList: ["ignoredFunction"] }],
            code: "class ClassName { ignoredFunction = () => { } }",
        },
        {
            name: "Ignored function matched by regex pattern is skipped",
            options: [{ ignoreList: ["^handle[A-Z].*"] }],
            code: "function handleClick(){}",
        },
        {
            name: "Multiple ignore patterns, one matches",
            options: [{ ignoreList: ["^handle[A-Z].*", "^on[A-Z].*"] }],
            code: "function onChange(){}",
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
                            output: "function functionName(){Log.trace('file:functionName');}",
                        },
                        {
                            messageId: "addLoggingSuggestion",
                            data: { suggestedCode: "Log.debug('file:functionName');" },
                            output: "function functionName(){Log.debug('file:functionName');}",
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
                            output: "const functionName = () => {Log.trace('file:functionName'); }",
                        },
                        {
                            messageId: "addLoggingSuggestion",
                            data: { suggestedCode: "Log.debug('file:functionName');" },
                            output: "const functionName = () => {Log.debug('file:functionName'); }",
                        },
                    ],
                },
            ],
        },
        {
            name: "Missing logging in static function declaration",
            code: "class ClassName { static functionName(){ } }",
            errors: [
                {
                    messageId: "missingLogging",
                    data: { expectedLogging: "file:functionName" },
                    suggestions: [
                        {
                            messageId: "addLoggingSuggestion",
                            data: { suggestedCode: "Log.trace('file:functionName');" },
                            output: "class ClassName { static functionName(){Log.trace('file:functionName'); } }",
                        },
                        {
                            messageId: "addLoggingSuggestion",
                            data: { suggestedCode: "Log.debug('file:functionName');" },
                            output: "class ClassName { static functionName(){Log.debug('file:functionName'); } }",
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
                            output: "class ClassName { functionName(){Log.trace('file:functionName'); } }",
                        },
                        {
                            messageId: "addLoggingSuggestion",
                            data: { suggestedCode: "Log.debug('file:functionName');" },
                            output: "class ClassName { functionName(){Log.debug('file:functionName'); } }",
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
                            output: "class ClassName { functionName = () => {Log.trace('file:functionName'); } }",
                        },
                        {
                            messageId: "addLoggingSuggestion",
                            data: { suggestedCode: "Log.debug('file:functionName');" },
                            output: "class ClassName { functionName = () => {Log.debug('file:functionName'); } }",
                        },
                    ],
                },
            ],
        },
        {
            name: "Missing logging in function declaration in platform-specific file",
            filename: "SomeClass.android.ts",
            code: "function functionName(){}",
            errors: [
                {
                    messageId: "missingLogging",
                    data: { expectedLogging: "SomeClass:functionName" },
                    suggestions: [
                        {
                            messageId: "addLoggingSuggestion",
                            data: { suggestedCode: "Log.trace('SomeClass:functionName');" },
                            output: "function functionName(){Log.trace('SomeClass:functionName');}",
                        },
                        {
                            messageId: "addLoggingSuggestion",
                            data: { suggestedCode: "Log.debug('SomeClass:functionName');" },
                            output: "function functionName(){Log.debug('SomeClass:functionName');}",
                        },
                    ],
                },
            ],
        },
        {
            name: "Incorrect logging using full filename with platform suffix",
            filename: "SomeClass.android.ts",
            code: "function functionName(){ Log.debug('SomeClass.android:functionName') }",
            errors: [
                {
                    messageId: "incorrectLogging",
                    suggestions: [
                        {
                            messageId: "incorrectLogging",
                            output: "function functionName(){ Log.debug('SomeClass:functionName') }",
                        },
                    ],
                },
            ],
        },
        {
            name: "Missing function name in logging",
            code: "function functionName(){ Log.debug('file') }",
            errors: [
                {
                    messageId: "incorrectLogging",
                    suggestions: [
                        {
                            messageId: "incorrectLogging",
                            output: "function functionName(){ Log.debug('file:functionName') }",
                        },
                    ],
                },
            ],
        },
        {
            name: "Missing filename in logging",
            code: "function functionName(){ Log.debug('functionName') }",
            errors: [
                {
                    messageId: "incorrectLogging",
                    suggestions: [
                        {
                            messageId: "incorrectLogging",
                            output: "function functionName(){ Log.debug('file:functionName') }",
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
                            output: "const functionName = () => { Log.debug('file:functionName') }",
                        },
                    ],
                },
            ],
        },
    ],
});

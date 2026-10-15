"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const no_eager_translations_1 = __importDefault(require("../no-eager-translations"));
const ruleTester = new rule_tester_1.RuleTester();
ruleTester.run("no-eager-translations", no_eager_translations_1.default, {
    valid: [
        {
            name: "Function declaration",
            code: "function getTitle() { return i18n.t('Title') }",
        },
        {
            name: "Arrow function",
            code: "const getTitle = () => i18n.t('Title')",
        },
        {
            name: "Arrow function returning an object",
            code: "const tooltip = (group) => ({ title: i18n.t('Title', { name: group.name }) })",
        },
        {
            name: "Component",
            code: "const Component = () => { const title = i18n.t('Title'); return title }",
        },
        {
            name: "Default parameter",
            code: "const Component = ({ label = i18n.t('Label') }) => label",
        },
        {
            name: "Class method",
            code: "class ClassName { method() { return i18n.t('Title') } }",
        },
        {
            name: "Class property arrow function",
            code: "class ClassName { method = () => i18n.t('Title') }",
        },
        {
            name: "Class getter",
            code: "class ClassName { get title() { return i18n.t('Title') } }",
        },
        {
            name: "Function defined in a constructor",
            code: "class ClassName { constructor() { this.getTitle = () => i18n.t('Title') } }",
        },
        {
            name: "Other t function",
            code: "const title = other.t('Title')",
        },
        {
            name: "Getter in a module level object",
            code: "const rationale = { get title() { return i18n.t('Title') } }",
        },
        {
            name: "JSX in a component",
            code: "const Component = () => <Text>{i18n.t('Title')}</Text>",
            languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        },
    ],
    invalid: [
        {
            name: "Module level constant",
            code: "const title = i18n.t('Title')",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Module level object",
            code: "const rationale = { title: i18n.t('Title'), message: i18n.t('Message') }",
            errors: [{ messageId: "eagerTranslation" }, { messageId: "eagerTranslation" }],
        },
        {
            name: "Exported module level object",
            code: "export const tooltip = { title: i18n.t('Title') }",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Module level array",
            code: "const options = [{ label: i18n.t('Label') }]",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Class property",
            code: "class ClassName { rationale = { title: i18n.t('Title') } }",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Static class property",
            code: "class ClassName { static title = i18n.t('Title') }",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Static block",
            code: "class ClassName { static { ClassName.title = i18n.t('Title') } }",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Constructor",
            code: "class ClassName { constructor() { this.title = i18n.t('Title') } }",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Immediately invoked function",
            code: "const title = (() => i18n.t('Title'))()",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Immediately invoked function expression",
            code: "const title = (function () { return i18n.t('Title') })()",
            errors: [{ messageId: "eagerTranslation" }],
        },
        {
            name: "Module level JSX",
            code: "const element = <Text>{i18n.t('Title')}</Text>",
            languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
            errors: [{ messageId: "eagerTranslation" }],
        },
    ],
});

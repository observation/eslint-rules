# no-function-without-logging
This ESLint plugin enforces the `no-function-without-logging` rule: 
Every function code block should contain a logging statement ( call to `Log.debug`), with the first argument having at least its filename/classname and function name, seperated by a colon: `Log.debug('foo:bar')`.

In addition to `debug`, the following options are also possible: `trace`, `warning`, `info`, `error`. 

## Examples

<table>
<tr>
<td> ❌ Incorrect </td> <td> ✅ Correct </td>
</tr>
<tr>
<td>

```typescript
function functionName(){}
```
</td>
<td>

```typescript
function functionName(){
    Log.trace('file:functionName');
}
``` 
</td>
</tr>

<tr>
<td>

```typescript
const functionName = () => {}
```
</td>
<td>

```typescript
const functionName = () => {
    Log.debug('file:functionName');
}
```
</td>
</tr>

<tr>
<td>

```typescript
static function functionName(){}
```
</td>
<td>

```typescript
static function functionName(){
    Log.trace('file:functionName');
}
```
</td>
</tr>

<tr>
<td>

```typescript
class ClassName { 
    functionName(){}
}
```
</td>
<td>

```typescript
class ClassName { 
    functionName(){
        Log.trace('ClassName:functionName');
    }
}
```
</td>
</tr>

<tr>
<td>

```typescript
class ClassName { 
    functionName = () => {}
}
```
</td>
<td>

```typescript
class ClassName { 
    functionName = () => {
        Log.debug('ClassName:functionName');
    }
}
```
</td>
</tr>

<tr>
<td>

```typescript
function functionName(){ 
    Log.debug('file')
}
```
</td>
<td>

```typescript
function functionName(){ 
    Log.debug('file:functionName')
}
```
</td>
</tr>

<tr>
<td>

```typescript
function functionName(){ 
    Log.debug('functionName')
}
```
</td>
<td>

```typescript
function functionName(){ 
    Log.debug('file:functionName')
}
```
</td>
</tr>

<tr>
<td>

```typescript
const functionName = () => { 
    Log.debug()
}
```
</td>
<td>

```typescript
const functionName = () => { 
    Log.debug('file:functionName')
}
```
</td>
</tr>
</table>

## Exceptions

Logging statement can include multiple arguments:
```typescript
function functionName(){ 
    Log.debug('file:functionName', 1)
}
```

Logging statement can have extended text:
```typescript
function functionName(){ 
    Log.debug('file:functionName with extra text')
}
```

Lambda function with body does not need logging statement:
```typescript
const functionName = () => otherFunction()
```

Component declaration does not need logging statement:
```typescript
const Component = () => {}
```

Component level logging only includes component name:
```typescript
const Component = () => { 
    Log.debug('Component') 
}
```

Constructors do not need logging:
```typescript
class ClassName {
    constructor(){}
}
```

Getter and setter functions do not need logging:
```typescript
class ClassName {
    _value: number

    get value(){
        return this.value
    }

    set value(value: nuber){
        this._value = value
    }
}
```

Setter like functions (class method definition starting with `set[A-Z]` returning void) do not need logging:
```typescript
class ClassName {
    _value: number

    setValue(value: nuber){
        this._value = value
    }
}
```

Platform-specific suffixes (e.g. `.android.ts`, `.ios.ts`) are stripped from the filename, so `SomeClass.android.ts` expects `SomeClass` in the logging, not `SomeClass.android`:
```typescript
// SomeClass.android.ts
function functionName(){
    Log.trace('SomeClass:functionName');
}
```

## Configuration

By default the rule applies to all functions. You can optionally provide an `ignoreList` list of regex patterns — any function whose name matches a pattern is exempt from the rule.

```js
rules: {
    'observation/no-function-without-logging': [
        'error',
        {
            ignoreList: [
                '^handle[A-Z].*',  // e.g. handleClick, handleChange
                '^on[A-Z].*',      // e.g. onChange, onPress
                'mySpecificFunction',
            ],
        }
    ]
}
```

Each entry in `ignoreList` is interpreted as a regular expression and tested against the function name. Functions skipped by other built-in exceptions (constructors, getters/setters, setter-like methods, component declarations) are unaffected by this option.

## No Missing Translations

This ESLint rule ensures that every call to `i18n.t(...)` in the codebase has a corresponding key in all translation files. A translation file is defined as an input file for the npm package `i18n-js` (https://www.npmjs.com/package/i18n-js).

## Examples

Translation file (`nl.json`):
```
{
    'Hello world!': "Hallo wereld!"
}
```

<table>
<tr>
<td> ❌ Incorrect </td> <td> ✅ Correct </td>
</tr>
<tr>
<td>

```typescript
i18n.t('Missing translation key')
```
</td>
<td>

```typescript
i18n.t('Hello world')
``` 
</td>
</tr>
</table>

## Configuration
To configure the ESLint rule, specify the relative paths of the translation files in an array within the ESLint configuration:
```
...
rules: {
    'observation/no-missing-translations': [
        'error', 
        {
            translationFiles: [
                'src/app/translations/locales/en.json', 
                'src/app/translations/locales/nl.json'
            ],
        }
    ]
}
...

```

## No Eager Translations

This ESLint rule ensures that every call to `i18n.t(...)` is evaluated when the text is needed, and not when a module is loaded or a class is instantiated. Such a translation is evaluated only once, so its text is fixed in whatever locale is active at that moment:
- If it is evaluated before the locale is set during app initialisation, it is in the default language.
- If the user changes the language while the app is running, it keeps the previous language.

A call to `i18n.t(...)` is reported when it is:
- at module level, including inside module level objects and arrays
- in a class property initialiser, static property or static block
- in a constructor
- in an immediately invoked function at one of the levels above

## Examples

<table>
<tr>
<td> ❌ Incorrect </td> <td> ✅ Correct </td>
</tr>
<tr>
<td>

```typescript
const rationale = {
    title: i18n.t('Title'),
}
```
</td>
<td>

```typescript
const rationale = () => ({
    title: i18n.t('Title'),
})
```
</td>
</tr>

<tr>
<td>

```typescript
class ClassName {
    rationale = {
        title: i18n.t('Title'),
    }
}
```
</td>
<td>

```typescript
class ClassName {
    get rationale() {
        return { title: i18n.t('Title') }
    }
}
```
</td>
</tr>

<tr>
<td>

```typescript
class ClassName {
    constructor() {
        this.title = i18n.t('Title')
    }
}
```
</td>
<td>

```typescript
class ClassName {
    getTitle = () => i18n.t('Title')
}
```
</td>
</tr>
</table>

## Caveats

The rule does not detect translations in callbacks that are executed immediately, such as `keys.map((key) => i18n.t(key))` at module level. Such calls are evaluated once as well, so avoid them.

## Configuration
The rule has no options:
```
...
rules: {
    'observation/no-eager-translations': 'error',
}
...
```

# Build & publish

1. run `tsc` in the working folder, this creates the javascript files that will be run by ESLint
2. Get your changes to the `develop` branch

# Install
Run the command:
```shell
yarn install -D observation/eslint-rules
```
You need to have read access to the `observation/eslint-rules` repo to do this. If an automated process needs this rule set, you can set up github deploy keys.

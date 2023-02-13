# no-function-without-logging
This ESLint plugin enforces the `no-function-without-logging` rule: 
Every function code block should contain a logging statement ( call to `Log.debug`), with the first argument having at least its filename/classname and function name, seperated by a colon: `Log.debug('foo:bar')`. 
This rule does not apply to constructors and getters.

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

## Edge cases

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
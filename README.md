# no-function-without-logging
This ESLint plugin enforces `no-function-without-logging` rule: 
Every function code block should contain a logging statement ( call to `Log.debug`), with at least its filename/classname and function name, seperated by a colon: `Log.debug('foo:bar')`. 

In addition to `debug`, the following options are also possible: `trace`, `warning`, `info`, `error`.

## Correcte logging
Function declaration
```typescript
function functionName(){ 
    Log.debug('file:functionName')
}
```
Function in variable declaration
```typescript
const functionName = () => { 
    Log.debug('file:functionName') 
}
```
Static function declaration
```typescript
static function functionName(){ 
    Log.debug('file:functionName') 
}
```
Function declaration in class
```typescript
class ClassName { 
    functionName(){
        Log.debug('file:functionName')
    }
}
```
Function in variable declaration in class
```typescript
class ClassName { 
    const functionName = () => { 
        Log.debug('file:functionName')
    }
}
```

Class constructor does not need logging statement
```typescript
class ClassName { 
    constructor(){}
}
```

Class getter does not need logging statement
```typescript
class ClassName { 
    get value(){} 
}
```

Logging statement can include multiple arguments
```typescript
function functionName(){ 
    Log.debug('file:functionName', 1)
}
```

Logging statement can have extended text
```typescript
function functionName(){ 
    Log.debug('file:functionName with extra text')
}
```

Lambda function with body does not need logging statement
```typescript
const functionName = () => otherFunction()
```

Component declaration does not need logging statement
```typescript
const Component = () => {}
```

Component level logging only includes component name
```typescript
const Component = () => { 
    Log.debug('Component') 
}
```

#Incorrecte logging

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
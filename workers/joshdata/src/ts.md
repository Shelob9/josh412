# Typescript API docs

## `searchString` Function

### Description

The `searchString` function is a utility function that checks if a subject string matches a search string or an array of search strings based on a specified condition. The function supports four types of matching conditions: starts with, ends with, contains, and exact match.

### Syntax

```typescript
searchString(subject: string, search: Search, where: Where, all = false): boolean
```

### Parameters

- `subject` (string): The string to be searched.
- `search` (string | string[]): The string or array of strings to match with the subject.
- `where` (Where): Specifies the type of match. It can be one of the following values: 'starts', 'ends', 'contains', or 'exact'.
- `all` (boolean, optional): Defaults to `false`. If `search` is an array and `all` is `true`, the function returns `true` if all values of `search` match. If `all` is `false`, the function returns `true` if any value of `search` matches.

### Return Value

Returns `true` if the subject string matches the search string(s) based on the specified condition. Otherwise, it returns `false`.

### Examples

```typescript
searchString('Hello World', 'Hello', 'starts');
// Output: true

searchString('Hello World', 'World', 'ends');
// Output: true

searchString('Hello World', 'llo', 'contains');
// Output: true

searchString('Hello World', 'Hello World', 'exact');
// Output: true

searchString('Hello World', ['Hello', 'World'], 'contains');
// Output: true

searchString('Hello World', ['Hello', 'World'], 'contains', true);
// Output: false

searchString('Hello World', ['Hello', 'World'], 'starts', true);
// Output: false
```

# 🐻sembear

> Some friendly semver range utilities

## Install

```bash
yarn add sembear
```

## Usage

```jsx
import { contains, highest } from "sembear";

// this checks if rangeB is contained within rangeA
// or if every version that matches rangeB will also match rangeA
// (though there could be versions that match rangeA but not rangeB)
contains(rangeA, rangeB);

contains("^1.0.0", "^1.0.0") === true;
contains("^1.0.0", "^1.2.0") === true;

// this will return the range that matches the theoretical highest version
// if there are multiple ranges that match the theoretical highest version
// the range that has the smallest range of versions
// why the smallest range of versions?
// if you have two ranges like ^16.3.0 and ^16.8.0
// and you want the range that matches the theoretical highest version
// they would be equivalent because they both match up to <17.0.0
// but you probably want ^16.8.0 because you want the
// range that will only match the higher versions
highest([...ranges]);

highest([">=1.0.0 <3.0.0", ">=2.0.0 <3.0.0"]) === ">=2.0.0 <3.0.0";
highest(["^16.3.0", "^16.8.0"]) === "^16.8.0";
```

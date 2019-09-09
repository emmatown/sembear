import * as semver from "semver";

// https://github.com/npm/node-semver/issues/166#issuecomment-245990039
function hasUpperBound(range: string | semver.Range) {
  range = new semver.Range(range);
  if (!range) return false;

  return range.set.every(function(subset) {
    return subset.some(function(comparator) {
      return (
        comparator.operator.match(/^</) ||
        (comparator.operator === "" && comparator.value !== "")
      );
    });
  });
}

// https://github.com/npm/node-semver/issues/166#issuecomment-246040973
export function upperBound(range: string | semver.Range) {
  range = new semver.Range(range);
  if (!hasUpperBound(range)) return null;
  return range.set
    .map(function(subset) {
      return subset.filter(function(comparator) {
        return (
          /^</.test(comparator.operator) ||
          (comparator.operator === "" && comparator.value !== "")
        );
      });
    })
    .map(function(subset) {
      return subset.sort(function(a, b) {
        return semver.compare(a.semver, b.semver);
      })[0];
    })
    .sort(function(a, b) {
      return semver.rcompare(a.semver, b.semver);
    })
    .slice(0, 1)
    .map(function(comparator) {
      if (comparator.operator === "") {
        return "<=" + comparator.value;
      }
      return comparator.value;
    })[0];
}

// https://github.com/npm/node-semver/issues/166#issuecomment-245990039
function hasLowerBound(range: string | semver.Range) {
  range = new semver.Range(range);
  if (!range) return false;
  return range.set.every(function(subset) {
    return subset.some(function(comparator) {
      return (
        comparator.operator.match(/^>/) ||
        (comparator.operator === "" && comparator.value !== "")
      );
    });
  });
}

// https://github.com/npm/node-semver/issues/166#issuecomment-246040973
export function lowerBound(range: string | semver.Range) {
  range = new semver.Range(range);
  if (!hasLowerBound(range)) return "0.0.0";
  return range.set
    .map(function(subset) {
      return subset.filter(function(comparator) {
        return (
          /^>/.test(comparator.operator) ||
          (comparator.operator === "" && comparator.value !== "")
        );
      });
    })
    .map(function(subset) {
      return subset.sort(function(a, b) {
        return semver.compare(a.semver, b.semver);
      })[0];
    })
    .sort(function(a, b) {
      return semver.compare(a.semver, b.semver);
    })
    .slice(0, 1)
    .map(function(comparator) {
      if (comparator.operator === "") {
        return ">=" + comparator.value;
      }
      return comparator.value;
    })[0];
}

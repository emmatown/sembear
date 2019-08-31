import * as semver from "semver";

export function contains(rangeA: string, rangeB: string): boolean {
  throw new Error("not implemented yet");
}

// https://github.com/npm/node-semver/issues/166#issuecomment-245990039
function hasUpperBound(range: string | semver.Range) {
  range = new semver.Range(range);
  if (!range) return false;
  return (
    range.set.filter(function(subset) {
      return subset.some(function(comparator) {
        return comparator.operator.match(/^</);
      });
    }).length === range.set.length
  );
}

// https://github.com/npm/node-semver/issues/166#issuecomment-246040973
function upperBound(range: string | semver.Range) {
  range = new semver.Range(range);
  if (!hasUpperBound(range)) return null;
  return range.set
    .map(function(subset) {
      return subset.filter(function(comparator) {
        return /^</.test(comparator.operator);
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
      return comparator.value;
    })[0];
}

// https://github.com/npm/node-semver/issues/166#issuecomment-245990039
function hasLowerBound(range: string | semver.Range) {
  range = new semver.Range(range);
  if (!range) return false;
  return (
    range.set.filter(function(subset) {
      return subset.some(function(comparator) {
        return comparator.operator.match(/^>/);
      });
    }).length === range.set.length
  );
}

// https://github.com/npm/node-semver/issues/166#issuecomment-246040973
function lowerBound(range: string | semver.Range) {
  range = new semver.Range(range);
  if (!hasLowerBound(range)) return "0.0.0";
  return range.set
    .map(function(subset) {
      return subset.filter(function(comparator) {
        return /^>/.test(comparator.operator);
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
      return comparator.value;
    })[0];
}

export function highest(rawRanges: string[]): string {
  let rangesWithBounds = rawRanges.map(rawRange => {
    return {
      range: rawRange,
      upperBound: upperBound(rawRange),
      lowerBound: lowerBound(rawRange)
    };
  });
  rangesWithBounds.sort((a, b) => {
    if (a.upperBound === null && b.upperBound === null) {
      return 0;
    }
    if (a.upperBound === null) {
      return 1;
    }
    if (b.upperBound === null) {
      return -1;
    }
    let compA = new semver.Comparator(a.upperBound);
    let compB = new semver.Comparator(b.upperBound);
    if (semver.eq(compA.semver, compB.semver)) {
      if (compA.operator === compB.operator) {
        return 0;
      }
      return /=/.test(compA.operator) ? 1 : -1;
    }
    return semver.compare(compA.semver, compB.semver);
  });

  let highestUpperBound =
    rangesWithBounds[rangesWithBounds.length - 1].upperBound;
  let rangesWithHighestUpperBound = rangesWithBounds.filter(
    x => x.upperBound === highestUpperBound
  );
  if (rangesWithHighestUpperBound.length === 1) {
    return rangesWithHighestUpperBound[0].range;
  }

  rangesWithHighestUpperBound.sort((a, b) => {
    let compA = new semver.Comparator(a.lowerBound);
    let compB = new semver.Comparator(b.lowerBound);
    if (semver.eq(compA.semver, compB.semver)) {
      if (compA.operator === compB.operator) {
        return 0;
      }
      return /=/.test(compA.operator) ? 1 : -1;
    }
    return semver.compare(compA.semver, compB.semver);
  });
  return rangesWithHighestUpperBound[rangesWithHighestUpperBound.length - 1]
    .range;
}

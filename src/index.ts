import * as semver from "semver";
import { upperBound, lowerBound } from "./bounds";

// this function assumes that both operators have > OR < but not both
function compareBounds(boundA: string, boundB: string): 0 | 1 | -1 {
  let compA = new semver.Comparator(boundA);
  let compB = new semver.Comparator(boundB);
  let versionComparison = semver.compare(compA.semver, compB.semver);
  if (versionComparison !== 0) {
    return versionComparison;
  }

  if (compA.operator === compB.operator) {
    return 0;
  }

  return /=/.test(compA.operator) ? 1 : -1;
}

// this checks if rangeB is contained within rangeA
export function contains(
  rawRangeA: string | semver.Range,
  rawRangeB: string | semver.Range
): boolean {
  let rangeABounds = new semver.Range(rawRangeA).set.map(comparatorSet => {
    let comparatorSetString = comparatorSet.map(x => x.value).join(" ");
    return {
      upperBound: upperBound(comparatorSetString),
      lowerBound: lowerBound(comparatorSetString)
    };
  });
  let rangeBBounds = new semver.Range(rawRangeB).set.map(comparatorSet => {
    let comparatorSetString = comparatorSet.map(x => x.value).join(" ");
    return {
      upperBound: upperBound(comparatorSetString),
      lowerBound: lowerBound(comparatorSetString)
    };
  });
  return rangeBBounds.every(bBounds => {
    return rangeABounds.some(aBounds => {
      let isInUpperBound: boolean;
      if (aBounds.upperBound === null) {
        isInUpperBound = true;
      } else if (bBounds.upperBound === null) {
        isInUpperBound = false;
      } else {
        isInUpperBound =
          compareBounds(aBounds.upperBound, bBounds.upperBound) >= 0;
      }

      let isInLowerBound =
        compareBounds(aBounds.lowerBound, bBounds.lowerBound) <= 0;
      return isInUpperBound && isInLowerBound;
    });
  });
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

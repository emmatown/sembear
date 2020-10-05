import * as semver from "semver";
import { upperBound, lowerBound } from "./bounds";

function getBoundsForRange(range: string | semver.Range) {
  return new semver.Range(range).set.map((comparatorSet) => {
    let comparatorSetString = comparatorSet.map((x) => x.value).join(" ");
    return {
      upperBound: upperBound(comparatorSetString),
      lowerBound: lowerBound(comparatorSetString),
    };
  });
}

export function upperBoundOfRangeAWithinBoundsOfB(
  devDepRange: string | semver.Range,
  peerDepRange: string | semver.Range
) {
  let devDepRangeBounds = getBoundsForRange(devDepRange);
  let peerDepRangeBounds = getBoundsForRange(peerDepRange);

  return peerDepRangeBounds.every((peerDepRangeBound) => {
    return devDepRangeBounds.some((devDepRangeBound) => {
      return (
        compareBounds(
          devDepRangeBound.upperBound,
          peerDepRangeBound.lowerBound
        ) >= 0 &&
        compareBounds(
          peerDepRangeBound.upperBound,
          devDepRangeBound.lowerBound
        ) >= 0
      );
    });
  });
}

// this function assumes that both operators have > OR < but not both
export function compareBounds(
  boundA: string | null,
  boundB: string | null
): 0 | 1 | -1 {
  if (boundA === null && boundB === null) {
    return 0;
  }
  if (boundA === null) {
    return 1;
  }
  if (boundB === null) {
    return -1;
  }
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
  let rangeABounds = getBoundsForRange(rawRangeA);
  let rangeBBounds = getBoundsForRange(rawRangeB);
  return rangeBBounds.every((bBounds) => {
    return rangeABounds.some((aBounds) => {
      let isInUpperBound =
        compareBounds(aBounds.upperBound, bBounds.upperBound) >= 0;

      let isInLowerBound =
        compareBounds(aBounds.lowerBound, bBounds.lowerBound) <= 0;
      return isInUpperBound && isInLowerBound;
    });
  });
}

export function highest(rawRanges: string[]): string {
  let rangesWithBounds = rawRanges.map((rawRange) => {
    return {
      range: rawRange,
      upperBound: upperBound(rawRange),
      lowerBound: lowerBound(rawRange),
    };
  });
  rangesWithBounds.sort((a, b) => {
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

  let highestLowerBound =
    rangesWithBounds[rangesWithBounds.length - 1].lowerBound;
  let rangesWithHighestLowerBound = rangesWithBounds.filter(
    (x) => x.lowerBound === highestLowerBound
  );

  if (rangesWithHighestLowerBound.length === 1) {
    return rangesWithHighestLowerBound[0].range;
  }

  rangesWithHighestLowerBound.sort((a, b) => {
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
    rangesWithHighestLowerBound[rangesWithHighestLowerBound.length - 1]
      .upperBound;

  let rangesWithHighestUpperBound = rangesWithHighestLowerBound.filter(
    (x) => x.upperBound === highestUpperBound
  );

  return rangesWithHighestUpperBound.map((x) => x.range).sort()[0];
}

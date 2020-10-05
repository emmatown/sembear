import { highest, contains, upperBoundOfRangeAWithinBoundsOfB } from "./index";
import { permutation } from "js-combinatorics";

describe("upperBoundOfRangeAWithinBoundsOfB", () => {
  test.each([
    ["^16.11.0", "^16.9.0"],
    ["*", "^10.0.0"],
  ])("the upper bound of %s is within the bounds of %s", (devDep, peerDep) => {
    expect(upperBoundOfRangeAWithinBoundsOfB(devDep, peerDep)).toBe(true);
  });

  test.each([
    ["^16.11.0", "^17.0.0"],
    ["1", "2"],
    ["2", "1"],
  ])(
    "the upper bound of %s is not within the bounds of %s",
    (devDep, peerDep) => {
      expect(upperBoundOfRangeAWithinBoundsOfB(devDep, peerDep)).toBe(false);
    }
  );
});

describe("contains", () => {
  test.each([
    ["^16.8.0", "16.8.0"],
    ["16.8.0", "16.8.0"],
    ["5.0.0 || >=1.2.3 <5.0.0 || 6.7.8", "1.2.4 - 4.5.3 || 6.7.8"],
    [">5.0.0", ">5.1.0"],
  ])("%s contains %s", (range, subset) => {
    expect(contains(range, subset)).toBe(true);
  });

  test.each([
    ["16.8.0", "^16.8.0"],
    ["5.0.0 || >=1.2.3 <5.0.0 || 6.7.8", "1.2.4 - 5.1.0"],
  ])("%s does not contain %s", (range, subset) => {
    expect(contains(range, subset)).toBe(false);
  });
});

describe("highest", () => {
  test.each(
    ([
      [[">=1.0.0 <3.0.0", ">=2.0.0 <3.0.0", "1"], ">=2.0.0 <3.0.0"],
      [["^16.3.0", "^16.8.0", "1"], "^16.8.0"],
      [["^16.8.0", "^16.3.0", "1"], "^16.8.0"],
      [[">1", ">2", "1"], ">2"],
      [[">2", ">1", "1"], ">2"],
      [["1.0.0", "3.0.0", "2.0.0"], "3.0.0"],
      [[">1.0.0", "*", ">2.0.0"], ">2.0.0"],
      [["<3.0.0 >1.0.0", "*", "<3.0.0 >2.0.0"], "<3.0.0 >2.0.0"],
      [[">16.3.0", "^16.8.0"], "^16.8.0"],
      [["^1.0.0", "~1.0.0"], "^1.0.0"],
      [["1", "^1.0.0"], "1"],
    ] as const).flatMap(([ranges, result]) => {
      // we want to make sure that order doesn't affect the result
      return permutation(ranges as any)
        .toArray()
        .map((arr) => [arr as string[], result]);
    }) as [string[], string][]
  )("given %j highest returns %s", (ranges, range) => {
    expect(highest(ranges)).toBe(range);
  });
});

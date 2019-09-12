import { highest, contains } from "./index";
import { permutation } from "js-combinatorics";

describe("contains", () => {
  test.each([
    ["^16.8.0", "16.8.0"],
    ["16.8.0", "16.8.0"],
    ["5.0.0 || >=1.2.3 <5.0.0 || 6.7.8", "1.2.4 - 4.5.3 || 6.7.8"],
    [">5.0.0", ">5.1.0"]
  ])("%s contains %s", (range, subset) => {
    expect(contains(range, subset)).toBe(true);
  });

  test.each([
    ["16.8.0", "^16.8.0"],
    ["5.0.0 || >=1.2.3 <5.0.0 || 6.7.8", "1.2.4 - 5.1.0"]
  ])("%s does not contain %s", (range, subset) => {
    expect(contains(range, subset)).toBe(false);
  });
});

describe("highest", () => {
  test.each([
    [[">=1.0.0 <3.0.0", ">=2.0.0 <3.0.0", "1"], ">=2.0.0 <3.0.0"],
    [["^16.3.0", "^16.8.0", "1"], "^16.8.0"],
    [["^16.8.0", "^16.3.0", "1"], "^16.8.0"],
    [[">1", ">2", "1"], ">2"],
    [[">2", ">1", "1"], ">2"],
    [["1.0.0", "3.0.0", "2.0.0"], "3.0.0"],
    [[">1.0.0", "*", ">2.0.0"], ">2.0.0"],
    [["<3.0.0 >1.0.0", "*", "<3.0.0 >2.0.0"], "<3.0.0 >2.0.0"],
    [[">16.3.0", "^16.8.0"], "^16.8.0"]
  ] as [string[], string][])("given %j highest returns %s", (ranges, range) => {
    // we want to make sure that order doesn't affect the result
    for (let arr of permutation(ranges).toArray()) {
      expect(highest(arr)).toBe(range);
    }
  });
});

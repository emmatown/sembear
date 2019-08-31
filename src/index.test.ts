import { highest } from ".";

test.each([
  [[">=1.0.0 <3.0.0", ">=2.0.0 <3.0.0", "1"], ">=2.0.0 <3.0.0"],
  [["^16.3.0", "^16.8.0", "1"], "^16.8.0"],
  [["^16.8.0", "^16.3.0", "1"], "^16.8.0"],
  [[">1", ">2", "1"], ">2"],
  [[">2", ">1", "1"], ">2"]
])("given %j highest returns %s", (ranges, range) => {
  expect(highest(ranges as string[])).toBe(range);
});

// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("function parsing", () => {
  const schema = z.union([
    z.string().refine(() => false),
    z.number().refine(() => false),
  ]);
  const result = schema.safeParse("asdf");
  expect(result.success).toEqual(false);
});

test("union 2", () => {
  const result = z
    .union([z.number(), z.string().refine(() => false)])
    .safeParse("a");
  expect(result.success).toEqual(false);
});

test("return valid over invalid", () => {
  const schema = z.union([
    z.object({
      email: z.string().email(),
    }),
    z.string(),
  ]);
  expect(schema.parse("asdf")).toEqual("asdf");
  expect(schema.parse({ email: "asdlkjf@lkajsdf.com" })).toEqual({
    email: "asdlkjf@lkajsdf.com",
  });
});

test("return dirty result over aborted", () => {
  const result = z
    .union([z.number(), z.string().refine(() => false)])
    .safeParse("a");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues).toEqual([
      {
        code: "custom",
        message: "Invalid input",
        path: [],
      },
    ]);
  }
});

test("options getter", async () => {
  const union = z.union([z.string(), z.number()]);
  union.options[0].parse("asdf");
  union.options[1].parse(1234);
  await union.options[0].parseAsync("asdf");
  await union.options[1].parseAsync(1234);
});

test("readonly union", async () => {
  const options = [z.string(), z.number()] as const;
  const union = z.union(options);
  union.parse("asdf");
  union.parse(12);
});

test("nested no undefined", () => {
  const inner = z.string().or(z.array(z.string()));
  const outer = z.object({ inner });
  type outerSchema = z.infer<typeof outer>;
  z.util.assertEqual<outerSchema, { inner: string | string[] }>(true);
  expect(outer.safeParse({ inner: undefined }).success).toEqual(false);
});

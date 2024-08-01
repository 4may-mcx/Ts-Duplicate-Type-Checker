import { Foo } from "./types";

export type A = {
  name: string;
  age: number;
  sex: string;
};

type B = {
  name: string;
  age: number;
  foo: Foo;
};

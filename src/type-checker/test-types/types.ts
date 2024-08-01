export interface Foo {
  name: string;
  age: number;
}

export interface A {
  name: string;
  foo: Foo;
  age: number;
}

export type C = {
  name: string;
  age: number;
  sex: string;
};

export type Combined1 = { name: string } & {
  foo: Foo;
} & { age: number };

type X1 = "a" | "b";
type X2 = "b" | "a";

type Y1 = { a: string; b: number } | A;
type Y2 = A | { a: string; b: number };
type Y3 = A | { a: string; b: string };

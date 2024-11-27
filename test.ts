interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'John',
  age: 30
};

function printUser<T extends (keyof User)>(val:T): User[T] {
  return user[val]
}
let a = printUser("name")
a = "hello"
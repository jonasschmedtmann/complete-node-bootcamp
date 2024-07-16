const eventLoop1 = () => {
  console.log(1);

  setTimeout(() => console.log(2));

  Promise.resolve().then(() => console.log(3));

  Promise.resolve().then(() => setTimeout(() => console.log(4)));

  Promise.resolve().then(() => console.log(5));

  setTimeout(() => console.log(6));

  console.log(7);
};

const eventLoop2 = () => {
  console.log(1);

  setTimeout(() => console.log(2));

  Promise.resolve().then(() => console.log(3));

  Promise.resolve().then(() => setTimeout(() => console.log(4)));

  Promise.resolve().then(() => console.log(5));

  setTimeout(() => console.log(6));

  console.log(7);
};

console.info('eventLoop1');
eventLoop1();
console.info('eventLoop2');
eventLoop2();

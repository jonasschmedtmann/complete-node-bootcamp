const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(morgan('tiny'));

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;

//-----------CLOSURES

// const heavyDuty = (index) => {
//   const bigArray = new Array(10000).fill('😀');
//   console.log('created!!!');
//   return bigArray[in  dex];
// };

// console.log(heavyDuty(688));
// console.log(heavyDuty(800));
// console.log(heavyDuty(900));

// const heavyDuty2 = (index) => {
//   const bigArray = new Array(10000).fill('😀');
//   console.log('created Again!!!');
//   return (index) => {
//     return bigArray[index];
//   };
// };

// const getHeavyDuty = heavyDuty2();
// console.log(getHeavyDuty(600));
// console.log(getHeavyDuty(800));
// console.log(getHeavyDuty(600));

//-------Encapsulation(closures)

// const makeNuclearButton = () => {
//   let timeWithoutDestruction = 0;
//   const passTime = () => timeWithoutDestruction++;
//   const totalPeaceTime = () => timeWithoutDestruction;
//   const launch = () => {
//     timeWithoutDestruction -= 1;
//     return '🔥';
//   };
//   setInterval(passTime, 1000);
//   return {
//     launch,
//     totalPeaceTime,
//   };
// };

// const ohno = makeNuclearButton();
// console.log(ohno.totalPeaceTime());

//------------------

// var a= "hi";
// const sample=()=> {
//     console.log ("original", a);
//      var a= "bye";
//     console.log("new", a);

// }
// sample();
// console.log(a);
//'use strict'

// const a = function () {
//   console.log('a', this);
//   const b = function () {
//     console.log('b', this);
//     const c = {
//       hi: function () {
//         console.log('c', this);
//       },
//     };
//     c.hi();
//   };
//   b();
// };
// a();

// const obj = {
//   name: 'happy',
//   sing() {
//     console.log('a', this);
//     var anotherFunc = () => {
//       console.log('b', this);
//     };
//     anotherFunc();
//   },
// };
// obj.sing();

// const character = {
//   name: 'Simon',
//   getCharacter() {
//     return this.name;
//   },
// };

// const give = character.getCharacter();
// console.log('?', give);
// console.log(typeof [4].toString());
// console.log(1 == '1');
// function sum(a, b) {
//   return a + b;
// }
// console.log(sum(NaN, typeof null));

// function a( ) {
//   return this;
// }
// console.log(a.call());

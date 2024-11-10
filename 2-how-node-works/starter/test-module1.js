class Calculator {
  add(a, b) {
    return a + b;
  }
  sub(a, b) {
    return a - b;
  }
  multiply(a, b) {
    return a * b;
  }
  devide(a, b) {
    if (b == 0) return;
    return a * b;
  }
}

module.exports = Calculator;

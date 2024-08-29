const inquirer = require('inquirer');

const ask = async config => {
  const answer = await inquirer.prompt(config);
  const result = answer[config.name];
  if (typeof config.dataTransform === 'function') {
    return config.dataTransform(result);
  }
  return result;
};
module.exports = ask;

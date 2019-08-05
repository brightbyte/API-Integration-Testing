const uniqid = require('uniqid');
const api = require('./actionapi');
const config = require('./config.json');

const fixtures = {
  root: null, // lazified later
  mindy: null, // lazified later
};

const root = () => {
  const agent = api.agent(config.root_user.name, config.root_user.password);
  agent.loadTokens(['edit', 'createaccount', 'userrights', 'csrf']);

  return agent;
};

const mindy = () => {
  const passwd = uniqid();

  fixtures.root.createAccount({ name: 'Mindy', password: passwd });
  fixtures.root.addGroups('Mindy', ['sysop']);

  const agent = api.agent('Mindy', passwd);
  agent.loadTokens(['edit', 'userrights', 'csrf']);

  return agent;
};

// Define lazy initialization accessors for fixtures.
// FIXME: is this the correct way? Isn't there a module for this?
const lazyfy = (obj, name, getter) => {
  Object.defineProperty(obj, name, {
    get: () => {
      const v = getter();
      Object.defineProperty(obj, name, { value: v });
      return v;
    },
  });
};

lazyfy(fixtures, 'root', root);
lazyfy(fixtures, 'mindy', mindy);

module.exports = fixtures;

const uniqid = require('uniqid');
const api = require('./actionapi');
const config = require('./config.json');

module.exports = {

  // singletons
  singletons: {},

  async root() {
    if (this.singletons.root) {
      return this.singletons.root;
    }

    this.singletons.root = await api.agent(config.root_user.name, config.root_user.password);
    await this.singletons.root.loadTokens(['createaccount', 'userrights', 'csrf']);

    return this.singletons.root;
  },

  async mindy() {
    if (this.singletons.mindy) {
      return this.singletons.mindy;
    }

    // TODO: Use a fixed user name for Mindy. Works only on a blank wiki.
    const uname = 'Mindy_' + uniqid();
    const passwd = uniqid();
    const root = await this.root();

    await root.createAccount({ username: uname, password: passwd });
    await root.addGroups(uname, ['sysop']);

    this.singletons.mindy = await api.agent(uname, passwd);
    await this.singletons.mindy.loadTokens(['userrights', 'csrf']);

    return this.singletons.mindy;
  },

};

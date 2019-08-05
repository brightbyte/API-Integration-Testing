const { assert } = require('chai');
const supertest = require('supertest');
const uniqid = require('uniqid');
const config = require('./config.json');

const methods = {
  /**
   * @param actionName
   * @param {Object} params
   * @param post
   * @returns Response
   */
  async action(actionName, params, post = false) {
    const defaultParams = {
      action: actionName,
      format: 'json',
    };

    let resp;
    if (post) {
      resp = this.post('')
        .type('form')
        .send({ ...defaultParams, ...params });
    } else {
      resp = this.get('')
        .query({ ...defaultParams, ...params });
    }

    await resp.expect(200);
    return resp.response;
  },

  /**
   * @param {string[]} ttypes
   * @returns Response
   */
  loadTokens(ttypes) {
    const resp = this.action(
      'query',
      { meta: 'tokens', types: ttypes.join('|') },
    );

    this.tokens = resp.body.query.tokens;
    return resp;
  },

  /**
   * @param {string} ttype
   * @returns string
   */
  token(ttype) {
    if (ttype in this.tokens) {
      return this.tokens[ttype];
    }

    // TODO: skip tokens we already have!
    const newTokens = this.action(
      'query',
      { meta: 'tokens', type: ttype },
    ).body.query.tokens;

    this.tokens = { ...this.tokens, ...newTokens };
    return this.tokens[ttype];
  },

  /**
   * @param {string} username
   * @param {string} password
   * @returns string
   */
  login(username, password) {
    this.action(
      {
        action: 'login',
        lgname: username,
        lgpassword: password,
        lgtoken: this.token('login'),
      },
      'POST',
    ).then((response) => {
      assert.equal(response.body.login.result, 'Success');
    });
  },

  /**
   * @param params
   * @returns Response
   */
  edit(params) {
    const editParams = {
      text: 'Lorem Ipsum',
      comment: 'testing',
    };

    editParams.token = params.token || this.token('edit');

    return this.action('edit', { ...editParams, ...params }, 'POST')
      .then((response) => {
        assert.equal(response.body.edit.result, 'Success');
        return response.body.edit.newrevid;
      });
  },

  /**
   * @param params
   * @returns Response
   */
  createAccount(params) {
    const defaults = {
      token: params.token || this.token('createaccount'),
      retype: params.retype || params.password,
    };

    return this.action('createaccount', { ...defaults, ...params }, 'POST')
      .then((response) => {
        assert.equal(response.body.createuser.result, 'PASS');
      });
  },

  /**
   * @param userName
   * @param groups
   * @returns Response
   */
  addGroups(userName, groups) {
    const gprops = {
      action: 'userrights',
      user: userName,
      add: groups.join('|'),
      token: this.token('userrights'),
    };

    return this.action(gprops, 'POST').then((response) => {
      assert.isDefined(response.body.userrights.added);
    });
  },
};

/**
 * @param {string|null} name
 * @param {string|null} passwd
 * @returns TestAgent
 */
module.exports.agent = (name = null, passwd = null) => {
  const instance = supertest.agent(config.base_uri);

  instance.tokens = {};

  // FIXME: is this the correct way?
  for (const m in methods) {
    instance[m] = methods[m].bind(instance);
  }

  if (name) {
    let uname = name;
    let upass = passwd;

    if (!upass) {
      uname = name + uniqid();
      upass = uniqid();

      instance.createAccount({ name: uname, password: upass });
    }

    instance.login(uname, passwd);
    instance.name = uname;
  }

  return instance;
};

/**
 * @param {string|null} namePrefix
 * @returns string
 */
module.exports.title = namePrefix => namePrefix + uniqid();

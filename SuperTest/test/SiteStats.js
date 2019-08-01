const { assert } = require('chai');
const request = require('supertest');
const config = require('../config.json');
const utils = require('../utils');


describe("Testing site statistics' edits value", function () {
  // disable timeouts
  this.timeout(0);

  const user = request.agent(config.base_uri);
  const siteStatsParams = {
    action: 'query',
    meta: 'siteinfo',
    siprop: 'statistics',
    format: 'json',
  };

  const variables = {};

  before(async () => {
    // Login user
    const login = await utils.login(user, config.user.name, config.user.password);
    assert.equal(login.result, 'Success');

    // Get edit token for user
    variables.editToken = await utils.editToken(user);
  });

  it('should GET site statistics', async () => {
    await user
      .get('')
      .query(siteStatsParams)
      .expect(200)
      .then((response) => {
        variables.editsStats = parseInt(response.body.query.statistics.edits, 10);
        assert.isNumber(variables.editsStats);
      });
  });

  it('should edit a page', async () => {
    const editPage = await utils.edit(user, {
      title: 'TestingSiteStats',
      token: variables.editToken,
      text: 'testing site stats ..',
    });
    assert.equal(editPage.edit.result, 'Success');
  });

  it('should GET an increased site edits stat', async () => {
    await user
      .get('')
      .query(siteStatsParams)
      .expect(200)
      .then((response) => {
        const edits = parseInt(response.body.query.statistics.edits, 10);
        assert.isNumber(edits);
        assert.isAbove(edits, variables.editsStats);
      });
  });
});

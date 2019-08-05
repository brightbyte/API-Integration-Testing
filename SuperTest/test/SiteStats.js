const { assert } = require('chai');
const request = require('supertest');
const config = require('../config.json');
const utils = require('../actionapi');


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
    const loginToken = await utils.loginToken(user);
    await utils.login(user, config.user.name, config.user.password, loginToken);

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
    await user
      .post('')
      .type('form')
      .send({
        action: 'edit',
        title: 'TestingSiteStats',
        token: variables.editToken,
        text: 'testing site stats ..',
        format: 'json',
      })
      .expect(200)
      .then((response) => {
        assert.equal(response.body.edit.result, 'Success');
      });
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

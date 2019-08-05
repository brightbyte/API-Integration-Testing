const { assert } = require('chai');
const request = require('supertest');
const config = require('../config.json');
const utils = require('../utils');


describe('Diff Compare with Variables', function () {
  // disable timeouts
  this.timeout(0);

  const user = request.agent(config.base_uri);

  const variables = {};

  before(async () => {
    const loginToken = await utils.loginToken(user);
    await utils.login(user, config.root_user.name, config.root_user.password, loginToken);

    variables.editToken = await utils.editToken(user);
  });

  it('should edit a page', async () => {
    variables.revision1 = await utils.edit(user, {
      title: 'DiffCompare',
      token: variables.editToken,
      text: 'Counting: \n*One',
    });
  });

  it('should edit a page, revision 2', async () => {
    await utils.edit(user, { title: 'DiffCompare', token: variables.editToken, text: 'Counting: \n* One \n* Two' });
  });

  it('should edit a page, revision 3', async () => {
    variables.revision3 = await utils.edit(user, {
      title: 'DiffCompare',
      token: variables.editToken,
      text: 'Counting: \n* One \n* Two \n* Three',
    });
  });

  it('should edit a page, revision 4', async () => {
    variables.revision4 = await utils.edit(user, {
      title: 'DiffCompare',
      token: variables.editToken,
      text: 'Counting: \n* One \n* Two',
    });
  });

  it('should compare revisions 1 and 4', async () => {
    await user
      .get('')
      .query({
        action: 'compare', fromrev: variables.revision1, torev: variables.revision4, format: 'json',
      })
      .expect(200)
      .then((response) => {
        assert.match(
          response.body.compare['*'],
          /<td class='diff-addedline'><div><ins class=.*diffchange diffchange-inline.*\* Two<\/ins>/,
        );
      });
  });

  it('should compare revisions 3 and 4', async () => {
    await user
      .get('')
      .query({
        action: 'compare', fromrev: variables.revision3, torev: variables.revision4, format: 'json',
      })
      .expect(200)
      .then((response) => {
        assert.match(
          response.body.compare['*'],
          /<td class=.diff-deletedline.><div><del class=.*diffchange.*>\* Three<\/del>/,
        );
      });
  });
});

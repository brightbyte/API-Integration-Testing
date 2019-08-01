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
    // Login user
    const login = await utils.login(user, config.user.name, config.user.password);
    assert.equal(login.result, 'Success');

    // Get edit token for user
    variables.editToken = await utils.editToken(user);
  });

  it('should edit a page', async () => {
    const editPage = await utils.edit(user, {
      title: 'DiffCompare',
      token: variables.editToken,
      text: 'Counting: \n*One',
    });

    assert.equal(editPage.edit.result, 'Success');
    variables.revision1 = editPage.edit.newrevid;
  });

  it('should edit a page, revision 2', async () => {
    const editPage = await utils.edit(user, {
      title: 'DiffCompare',
      token: variables.editToken,
      text: 'Counting: \n* One \n* Two',
    });

    assert.equal(editPage.edit.result, 'Success');
  });

  it('should edit a page, revision 3', async () => {
    const editPage = await utils.edit(user, {
      title: 'DiffCompare',
      token: variables.editToken,
      text: 'Counting: \n* One \n* Two \n* Three',
    });

    assert.equal(editPage.edit.result, 'Success');
    variables.revision3 = editPage.edit.newrevid;
  });

  it('should edit a page, revision 4', async () => {
    const editPage = await utils.edit(user, {
      title: 'DiffCompare',
      token: variables.editToken,
      text: 'Counting: \n* One \n* Two',
    });

    assert.equal(editPage.edit.result, 'Success');
    variables.revision4 = editPage.edit.newrevid;
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

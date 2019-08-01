const { assert } = require('chai');
const request = require('supertest');
const config = require('../config.json');
const utils = require('../utils');

describe('Test page protection levels and effectiveness', function () {
  // disable timeouts
  this.timeout(0);

  // users
  const admin = request.agent(config.base_uri);
  const anonymousUser = request.agent(config.base_uri);
  const wikiUser = request.agent(config.base_uri);

  const variables = {
    admin: {},
    anonymousUser: {},
    wikiUser: {},
  };

  before(async () => {
    // Login admin
    const loginTokenForAdmin = await utils.loginToken(admin);
    const loginAdmin = await utils.login(admin, config.admin.name,
      config.admin.password, loginTokenForAdmin);

    assert.equal(loginAdmin.result, 'Success');

    // Get edit token for admin
    variables.admin.editToken = await utils.editToken(admin);

    // Create Protected page
    const createProtectedPage = await utils.edit(admin, {
      title: 'Protected',
      token: variables.admin.editToken,
      text: 'Protected Page',
    });

    assert.equal(createProtectedPage.edit.result, 'Success');

    // Create SemiProtected page
    const createSemiProtedPage = await utils.edit(admin, {
      title: 'Semi Protected',
      token: variables.admin.editToken,
      text: 'Semi Protected Page',
    });

    assert.equal(createSemiProtedPage.edit.result, 'Success');

    // Add edit protections to only allow members of sysop group to edit Protected page
    const addSysopProtection = await utils.protect(admin, {
      title: 'Protected',
      token: variables.admin.editToken,
      protections: 'edit=sysop',
    });
    assert.equal(addSysopProtection.protections[0].edit, 'sysop');

    // Add edit protections to only allow auto confirmed users to edit Semi Protected page
    const addAutoConfirmedProtection = await utils.protect(admin, {
      title: 'Semi Protected',
      token: variables.admin.editToken,
      protections: 'edit=autoconfirmed',
    });

    assert.equal(addAutoConfirmedProtection.protections[0].edit, 'autoconfirmed');

    // Login wikiUser
    const loginTokenForWikiuser = await utils.loginToken(wikiUser);
    const loginWikiUser = await utils.login(wikiUser, config.user.name,
      config.user.password, loginTokenForWikiuser);

    assert.equal(loginWikiUser.result, 'Success');

    // Get edit token for wikiUser
    variables.wikiUser.editToken = await utils.editToken(wikiUser);

    // Get edit token for anonymous user (not logged in)
    variables.anonymousUser.editToken = await utils.editToken(anonymousUser);
  });

  it('should allow admin to edit Protected page', async () => {
    const editPage = await utils.edit(admin, {
      title: 'Protected',
      token: variables.admin.editToken,
      text: 'Admin editing protected page',
    });

    assert.equal(editPage.edit.result, 'Success');
  });

  it('should allow admin to edit Semi Protected page', async () => {
    const editPage = await utils.edit(admin, {
      title: 'Semi Protected',
      token: variables.admin.editToken,
      text: 'Admin editing semi protected page',
    });

    assert.equal(editPage.edit.result, 'Success');
  });

  it('should NOT allow autoconfirmed user to edit Protected page', async () => {
    const editPage = await utils.edit(wikiUser, {
      title: 'Protected',
      token: variables.wikiUser.editToken,
      text: 'wikiUser editing protected page',
    });

    assert.equal(editPage.error.code, 'protectedpage');
  });

  it('should allow autoconfirmed user to edit Semi Protected page', async () => {
    const editPage = await utils.edit(wikiUser, {
      title: 'Semi Protected',
      token: variables.wikiUser.editToken,
      text: 'wikiUser editing semi protected page',
    });

    assert.equal(editPage.edit.result, 'Success');
  });

  it('should NOT allow anonymous user to edit Protected page', async () => {
    const editPage = await utils.edit(anonymousUser, {
      title: 'Protected',
      token: variables.anonymousUser.editToken,
      text: 'anonymous user editing protected page',
    });

    assert.equal(editPage.error.code, 'protectedpage');
  });

  it('should NOT allow anonymous user to edit Semi Protected page', async () => {
    const editPage = await utils.edit(anonymousUser, {
      title: 'Semi Protected',
      token: variables.anonymousUser.editToken,
      text: 'anonymous user editing semi protected page',
    });

    assert.equal(editPage.error.code, 'protectedpage');
  });
});

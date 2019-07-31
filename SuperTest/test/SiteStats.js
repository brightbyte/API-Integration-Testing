const { assert } = require('chai');
let request = require('supertest');
const config = require('../config.json');

request = request.agent(config.base_uri);

describe("Testing site statistics' edits value", function () {
  // disable timeouts
  this.timeout(0);

  const siteStatsParams = {
    action: 'query',
    meta: 'siteinfo',
    siprop: 'statistics',
    format: 'json',
  };

  let editsStats, editToken;

  before((done) => {
    //  Login user and get edit token
    request
      .get('')
      .query({
        action: 'query', meta: 'tokens', type: 'login', format: 'json',
      })
      .expect(200)
      .then((response) => {
        const { logintoken } = response.body.query.tokens;
        return request
          .post('')
          .type('form')
          .send({
            action: 'login',
            lgname: config.user.name,
            lgpassword: config.user.password,
            lgtoken: logintoken,
            format: 'json',
          })
          .expect(200);
      })
      .then((response) => {
        assert.equal(response.body.login.result, 'Success');
      })
      .then(() => {
          request
              .get('')
              .query({ action: 'query', meta: 'tokens', format: 'json' })
              .expect(200)
      })
      .then((response) => {
        editToken = response.body.query.tokens.csrftoken;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should GET site statistics', (done) => {
    request
      .get('')
      .query(siteStatsParams)
      .expect(200)
      .then((response) => {
        editsStats = response.body.query.statistics.edits;
        assert.isNumber(editsStats);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should edit a page', (done) => {
    request
      .post('')
      .type('form')
      .send({
        action: 'edit',
        title: 'TestingSiteStats',
        token: editToken,
        text: 'testing site stats ..',
        format: 'json',
      })
      .expect(200)
      .then((response) => {
        assert.equal(response.body.edit.result, 'Success');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should GET an increased site edits stat', (done) => {
    request
      .get('')
      .query(siteStatsParams)
      .expect(200)
      .then((response) => {
        const { edits } = response.body.query.statistics;
        assert.isNumber(edits);
        assert.isAbove(edits, editsStats);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

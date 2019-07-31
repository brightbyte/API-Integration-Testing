const { assert } = require('chai');

const loginToken = request => request
  .get('')
  .query({
    action: 'query', meta: 'tokens', type: 'login', format: 'json',
  })
  .expect(200)
  .then(response => response.body.query.tokens.logintoken);

const login = (request, username, password, token) => request
  .post('')
  .type('form')
  .send({
    action: 'login',
    lgname: username,
    lgpassword: password,
    lgtoken: token,
    format: 'json',
  })
  .expect(200)
  .then((response) => {
    assert.equal(response.body.login.result, 'Success');
  });

const editToken = request => request
  .get('')
  .query({ action: 'query', meta: 'tokens', format: 'json' })
  .expect(200)
  .then(response => response.body.query.tokens.csrftoken);

const edit = (request, params) => {
  const editParams = {
    action: 'edit',
    format: 'json',
  };
  return request
    .post('')
    .type('form')
    .send({ ...editParams, ...params })
    .expect(200)
    .then((response) => {
      assert.equal(response.body.edit.result, 'Success');
      return response.body.edit.newrevid;
    });
};

module.exports = {
  loginToken,
  login,
  editToken,
  edit,
};

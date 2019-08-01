const loginToken = requestAgent => requestAgent
  .get('')
  .query({
    action: 'query', meta: 'tokens', type: 'login', format: 'json',
  })
  .expect(200)
  .then(response => response.body.query.tokens.logintoken);

const login = (requestAgent, username, password, token) => requestAgent
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
  .then(response => response.body.login);

const editToken = requestAgent => requestAgent
  .get('')
  .query({ action: 'query', meta: 'tokens', format: 'json' })
  .expect(200)
  .then(response => response.body.query.tokens.csrftoken);

const edit = (requestAgent, params) => {
  const editParams = {
    action: 'edit',
    format: 'json',
  };
  return requestAgent
    .post('')
    .type('form')
    .send({ ...editParams, ...params })
    .expect(200)
    .then(response => response.body);
};

const protect = (requestAgent, params) => {
  const protectParams = {
    action: 'protect',
    format: 'json',
  };
  return requestAgent
    .post('')
    .type('form')
    .send({ ...protectParams, ...params })
    .expect(200)
    .then(response => response.body.protect);
};

module.exports = {
  loginToken,
  login,
  editToken,
  edit,
  protect,
};

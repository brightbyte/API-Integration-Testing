const { assert } = require('chai');
const fixtures = require('../fixtures');
const api = require('../actionapi');

describe('Blocking a user', function () {
  this.timeout('5s');

  let name, eve;

  before(() => {
    name = api.title('Block_');
    eve = api.agent('Eve_');
  });

  it('should edit a page', () => {
    eve.edit(name, 'One', 'first'); // FIXME
  });

  it('should block a user', () => {
    fixtures.mindy.action('blockuser', { // FIXME
      user: eve.name,
      reason: 'testing',
    }, 'POST').then((response) => {
      assert.equal(response.body.blockuser.result, 'Success');
    });
  });

  it('should fail to edit a page', () => {
    eve.edit(name, 'Two', 'second'); // FIXME
  });

  it('should unblock a user', () => {
    fixtures.mindy.action('blockuser', { // FIXME
      user: eve.name,
      reason: 'testing',
    }, 'POST').then((response) => {
      assert.equal(response.body.blockuser.result, 'Success');
    });
  });

  it('should by able to edit a page', () => {
    eve.edit(name, 'Three', 'third'); // FIXME
  });
});

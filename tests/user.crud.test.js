const mocha = require('mocha');

const describe = mocha.describe;
const it = mocha.it;
const before = mocha.before;
const chai = require('chai');
const chaiHttp = require('chai-http');

process.env.NODE_ENV = 'test';
const app = require('../index');
const UserModel = require('../api/models/users');

chai.use(chaiHttp);
const should = chai.should(); // eslint-disable-line no-unused-vars
const agent = chai.request.agent(app);
const userData = {
  username: 'testUser',
  password: 'testPassword',
  firstname: 'testFirstName',
};
describe('CRUD /v1/users', () => {
  /* Clear test database */
  before(async () => {
    try {
      await UserModel.remove();
    } catch (err) {
      console.log(err);
    }
  });
  it('POST. Create new User', async () => {
    const res = await agent.post('/v1/users').send(userData);
    res.statusCode.should.equal(201);
    res.body.should.have.any.keys('_id', 'username', 'password', 'firstname');
    res.body.username.should.equal(userData.username);
    res.body.firstname.should.equal(userData.firstname);
    userData.id = res.body._id;
  });
  it('AUTH. Auth User', async () => {
    const res = await agent.post('/v1/users/auth').send(userData);
    res.statusCode.should.equal(200);
    res.body.should.have.any.keys('token');
    userData.token = res.body.token;
  });
  it('GET. Get Users list', async () => {
    const resUnauth = await agent.get('/v1/users').catch(e => e);
    resUnauth.status.should.equal(401);
    const res = await agent.get('/v1/users').set('x-access-token', userData.token);
    res.statusCode.should.equal(200);
    res.body.should.be.an('array').that.have.lengthOf(1);
  });
  it('GET. Get User by Id', async () => {
    const resUnauth = await agent.get(`/v1/users/${userData.id}`).catch(e => e);
    resUnauth.status.should.equal(401);
    const res = await agent.get(`/v1/users/${userData.id}`).set('x-access-token', userData.token);
    res.statusCode.should.equal(200);
    res.body.should.have.any.keys('_id', 'username');
    res.body._id.should.equal(userData.id);
    res.body.username.should.equal(userData.username);
  });
  it('PATCH. Update Use', async () => {
    const resUnauth = await agent.patch(`/v1/users/${userData.id}`)
      .send({ testFields: 'testValue', email: 'email@mail.com', password: '123456' })
      .catch(e => e);
    resUnauth.status.should.equal(401);
    const res = await agent
      .patch(`/v1/users/${userData.id}`)
      .send({ testFields: 'testValue', email: 'email@mail.com', password: '123456' })
      .set('x-access-token', userData.token);
    res.statusCode.should.equal(200);
    res.statusCode.should.equal(200);
    res.body._id.should.equal(userData.id);
    res.body.username.should.equal(userData.username);
    res.body.email.should.equal('email@mail.com');
    res.body.should.not.include({ testFields: 'testValue' });
    const resAuth = await agent.post('/v1/users/auth').send({
      username: userData.username,
      password: '123456'
    });
    resAuth.statusCode.should.equal(200);
    resAuth.body.should.have.any.keys('token');
    userData.token = resAuth.body.token;
  });
  it('DELETE. should return OK', async () => {
    const resUnauth = await agent.delete(`/v1/users/${userData.id}`).catch(e => e);
    resUnauth.status.should.equal(401);
    const res = await agent.delete(`/v1/users/${userData.id}`).set('x-access-token', userData.token);
    res.body.ok.should.equal(1);
    const resultDeleted = await UserModel.findOneWithDeleted({ _id: userData.id });
    resultDeleted.deleted.should.equal(true);
    try {
      await agent.get(`/v1/users/${userData.id}`).set('x-access-token', userData.token);
      chai.assert(0 === 1, 'Error');
    } catch (err) {
      err.status.should.equal(404);
    }
  });
});

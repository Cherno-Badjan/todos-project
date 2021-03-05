require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'chernob@gmail.com',
          password: 'bingo123'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('creates a new todo ', async () => {

      const todo =
      {

        'todo': 'Wash Dishes',
        'completed': false,
      };

      const dbTodo = {
        ...todo,
        id: 5,
        owner_id: 3,
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(todo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(dbTodo);
    });

    test('returns all todos', async () => {

      const expected = [
        {
          "id": 5,
          "todo": "Wash Dishes",
          "completed": false,
          "owner_id": 3
        },
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expected);
    });
    test('updates a specific todo with a matching ID', async () => {

      const expected =
      {
        id: 5,
        todo: "Wash Dishes",
        completed: true,
        owner_id: 3
      };

      await fakeRequest(app)
        .put('/api/todos/5')
        .send(expected)
        .set('Authorization', token)
        .expect('Content-Type', /json/);
      // .expect(200);
      const data = await fakeRequest(app)
        .get('/api/todos/5')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expected);
    });

  });
});

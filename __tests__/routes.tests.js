const request = require('supertest')
import app from '../app'

describe('POST /api/token', () => {
    it('200 OK response with a token', async () => {
        const response = await request(app).post('/api/token').send({email: "bla@bla.com"})
        response.body = "My JWT"
        expect(response.status).toEqual(200)
        expect(response.body).toEqual("My JWT")
    })
})

describe('POST /api/justify', () => {
    it('401 Unauthorized if no JWT', done => {
        request(app)
            .post('/api/justify')
            .expect(401, done)
    })
})

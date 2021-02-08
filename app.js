const express = require('express')
const bodyParser = require('body-parser')
const {authenticator, justify, justifyLimiter, logIn} = require('./justifier')

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.text())

app.use(function (_req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})

app.post('/api/token', (req, res) => {
    const result = logIn(req.body.email)
    res.status(result.status).json(result.token)
})

app.use('/api/justify', authenticator)

app.post('/api/justify', justifyLimiter, (req, res) => {
    const text = JSON.stringify(req.body)
    const result = justify(text)
    res.status(result.status).send(result.response)
})

module.exports = app

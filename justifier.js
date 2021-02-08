const nJwt = require('njwt')
const secureRandom = require('secure-random')
const rateLimit = require('express-rate-limit')

const signingKey = secureRandom(256, {type: 'Buffer'})

let currentJwt
let words = []

const authenticator = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    await nJwt.verify(token, signingKey, (err, verifiedJwt) => {
        if (err) {
            const error = new Error(err.message)
            error.status = 401
            return next(error)
        } else {
            currentJwt = verifiedJwt.body.jti
            if (words.find(elem => {
                return elem.jwt === currentJwt
            }) === undefined) {
                words = [...words, {jwt: verifiedJwt.body.jti, words: 0}]
            }
            next()
        }
    })
}

const logIn = email => {
    const claims = {
        iss: `https://tictactrip.com`,
        sub: `${email}`,
        scope: `self, admins`
    }
    const jwt = nJwt.create(claims, signingKey).compact()
    return {status: 200, token: jwt}
}

const justify = text => {
    let counter = 0
    let lastSpace = 0
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i)
        let lastNewline = 0
        if (char === " ") {
            lastSpace = i
            words.find(elem => {
                return elem.jwt === currentJwt
            }).words += 1
        }
        if (counter === 80) {
            counter = 0
            if (char === " ") {
                text = text.substring(lastNewline, i) + '\n' + text.substring(i + 1)
                lastNewline = i
            } else {
                text = text.substring(0, lastSpace) + '\n' + text.substring(lastSpace + 1)
                lastNewline = lastSpace
            }
        }
        counter++
    }
    return {status: 200, response: text}
}

const wordCounter = () => {
    return words.find(elem => {
        return elem.jwt === currentJwt
    })?.words >= 300 ? 1 : 0
}

const justifyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: wordCounter,
    message: 'Daily word limit reached',
    statusCode: 402
})

module.exports = {authenticator, logIn, justify, justifyLimiter}

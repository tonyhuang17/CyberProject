import jwt from 'jsonwebtoken'

export function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me'
  return jwt.sign(payload, secret, { expiresIn: '2h' })
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me'
  return jwt.verify(token, secret)
}

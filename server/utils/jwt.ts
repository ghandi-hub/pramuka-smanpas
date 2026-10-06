import jwt, { type SignOptions } from 'jsonwebtoken'

export const signToken = (payload: object, expiresIn: SignOptions['expiresIn'] = '1d') => {
    const config = useRuntimeConfig()
    const secret = config.jwtSecret || process.env.JWT_SECRET || process.env.NUXT_JWT_SECRET || 'pramuka-default-fallback-secret-key-32chars'
    return jwt.sign(payload, secret, { expiresIn })
}

export const verifyToken = (token: string) => {
    const config = useRuntimeConfig()
    const secret = config.jwtSecret || process.env.JWT_SECRET || process.env.NUXT_JWT_SECRET || 'pramuka-default-fallback-secret-key-32chars'
    return jwt.verify(token, secret)
}

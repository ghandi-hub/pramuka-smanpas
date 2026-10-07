import { verifyToken } from "~~/server/utils/jwt"

export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)
    
    // Only check auth for admin API routes
    if (url.pathname.startsWith('/api/admin')) {
        let token: string | undefined;
        const authHeader = getHeader(event, 'Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]
        } else {
            token = getCookie(event, 'auth_token')
        }

        if (!token) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Token tidak ditemukan'
            })
        }

        try {
            const decoded = verifyToken(token) as any
            if (decoded.role !== 'admin') {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'Forbidden: Admin access required'
                })
            }
            
            // Store auth data in context for use in event handlers
            event.context.auth = decoded
        } catch (err: any) {
            if (err.statusCode) throw err
            throw createError({
                statusCode: 401,
                statusMessage: 'Sesi tidak valid atau kedaluwarsa'
            })
        }
    }
})

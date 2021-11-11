
import { VercelRequest } from '@vercel/node';
import jwt, { JwtPayload }  from "jsonwebtoken";

export default function verifyToken(request: VercelRequest) {
    const token = request.headers.authorization;
    if (!token) return { 
        email: "",
        auth: false, 
        expiration: 0,
        message: 'No token provided.', 
    };
    
    try { 
        const response = jwt.verify(token, process.env.SECRET) as JwtPayload;
        return { 
            auth: true, 
            email: response.email,
            message: 'Authenticated', 
            expiration: response.exp 
        };
    } catch (error) {
        return { 
            email: "",
            auth: false, 
            expiration: 0,
            message: 'Failed to authenticate token.', 
        };
    }
}
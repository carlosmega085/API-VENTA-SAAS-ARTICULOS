import { createClerkClient } from '@clerk/clerk-sdk-node';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

export const clerkAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No Clerk token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar el token con Clerk de forma directa
    try {
      const decoded = await clerkClient.verifyToken(token);

      if (!decoded || !decoded.sub) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Clerk session'
        });
      }

      // Adjuntar información de Clerk al request
      req.auth = { 
        userId: decoded.sub,
        sessionId: decoded.sid,
        claims: decoded
      };
      
      next();
    } catch (innerError) {
      console.error('[CLERK AUTH ERROR]', innerError);
      return res.status(401).json({
        success: false,
        message: 'Token verification failed or expired'
      });
    }
  } catch (error) {
    console.error('[CLERK MIDDLEWARE ERROR]', error);
    next(error);
  }
};

export default clerkAuthenticate;

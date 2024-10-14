/*eslint-disable*/
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import sha1 from 'sha1';
import redisClient from '../utils/redis';

class AuthController {
  /**
   * should sign-in the user by generating a new authentication token:
   * By using the header Authorization and the technique of the Basic auth
   * (Base64 of the <email>:<password>), find the user associate to this email
   * and with this password (reminder: we are storing the SHA1 of the password)
   * If no user has been found, return an error Unauthorized with a status code 401
   * Otherwise:
   * Generate a random string (using uuidv4) as token
   * Create a key: auth_<token>
   * Use this key for storing in Redis (by using the redisClient create previously)
   * the user ID for 24 hours
   * Return this token: { "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }
   * with a status code 200
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    // confirm if email and password are provided
    if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find user in database
    const user = await dbClient.db.collection('users').findone({ email, password: sha1(password) });
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized '});
    }

    // Generating a token using 
    const token = uuidv4();
    const tokenKey = 'auth_${token}';

    // Store user ID in Redis with expiration of 24 hours
    await redisClient.set(tokenKey, user._id.toString(), 86400);

    // Return the token
    return res.status(200).json({ token });
  }

  /**
   * should sign-out the user based on the token:
   * 
   * Retrieve the user based on the token:
   * If not found, return an error Unauthorized with a status code 401
   * Otherwise, delete the token in Redis and return nothing with a status code 204
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    // Check if a token is provided
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized '});
    }

    // Deleting the token from Redis
    const tokenKey = 'auth_${token}';
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(tokenKey);
    return res.status(204).send();
  }
}

export default AuthController;
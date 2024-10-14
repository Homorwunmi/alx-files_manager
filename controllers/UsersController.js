/*eslint-disable*/
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the email already exists in the database
    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Insert the new user into the database
    const result = await dbClient.db.collection('users').insertOne({
      email,
      password: hashedPassword,
    });

    // Return the new user with the email and id only
    return res.status(201).json({ id: result.insertedId, email });
  }

  /**
   * should retrieve the user base on the token used:
   * 
   * Retrieve the user based on the token
   * If not found, return an error Unauthorized with a status code 401
   * Otherwise, return the user object (email and id only)
   */
  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // To retrieve the user ID from Redis
    const tokenKey = 'auth_${token}';
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Search for the user in the database by ID
    const user = await dbClient.db.collection('users').findOne({ _id: dbClient.ObjectId(userId) });
    if (!user)) {
      return res.status(401).jsom({ error: 'Unauthorized' });
    }

    // Return the user's details
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
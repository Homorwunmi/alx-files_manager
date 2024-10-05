/*eslint-disable*/
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    // should check if Redis and DB are alive
    const status = {
        redis: redisClient.isAlive(),
        db: dbClient.isAlive(),
    };
    res.status(200).json(status);
  }

  static async getStats(req, res) {
    // should get the number of users and files
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    const stats = {
        users,
        files,
    };
    res.status(200).json(stats);
  }
}

export default AppController;
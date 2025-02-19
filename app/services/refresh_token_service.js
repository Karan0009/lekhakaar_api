import { Op } from 'sequelize';
import RefreshToken, { REFRESH_TOKEN_STATUS } from '../models/refresh_token.js';
import utils from '../lib/utils.js'; // Assume this has useful helper functions
import { LoggerFactory } from '../lib/logger.js';
import redis from '../lib/redis.js'; // Optional: Use Redis for caching
import config from '../config/config.js';

class RefreshTokenService {
  constructor() {
    this._logger = new LoggerFactory('RefreshTokenService').logger;
  }

  async cacheRefreshToken(refreshToken) {
    const refreshTokenKey = `refresh_token:${refreshToken.token}`;

    return redis.set(
      refreshTokenKey,
      JSON.stringify({
        id: refreshToken.id,
        token: refreshToken.token,
        user_id: refreshToken.user_id,
        expiry_at: refreshToken.expiry_at,
        status: refreshToken.status,
      }),
      'EX',
      config.times.hours_1_in_s,
    );
  }

  /**
   * Generates a new refresh token for a user.
   * @param {string} userId - The user's ID.
   * @returns {Promise<string>} - The new refresh token.
   */
  async generateToken(userId) {
    try {
      const token = utils.generateRandomToken(64); // Generate a secure token
      const expiryDate = utils.getDayJsObj().add(30, 'days');

      const refreshToken = await RefreshToken.create({
        token,
        user_id: userId,
        expiry_at: expiryDate.toDate(),
      });

      await this.cacheRefreshToken(refreshToken);

      return token;
    } catch (error) {
      this._logger.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Validates a refresh token.
   * @param {string} token - The refresh token to validate.
   * @returns {Promise<{isValid:boolean,refreshToken:RefreshToken}>} - True if valid, false otherwise.
   */
  async validateToken(token) {
    try {
      // Check Redis cache first
      const refreshTokenKey = `refresh_token:${token}`;

      let refreshToken = await redis.get(refreshTokenKey);
      if (refreshToken) {
        refreshToken = JSON.parse(refreshToken);
      } else {
        refreshToken = await RefreshToken.findOne({
          where: { token, status: REFRESH_TOKEN_STATUS.ACTIVE },
        });

        if (!refreshToken) return false;
      }

      await this.cacheRefreshToken(refreshToken);

      return {
        isValid: refreshToken && new Date(refreshToken.expiry_at) > new Date(),
        refreshToken,
      };
    } catch (error) {
      this._logger.error('Error validating refresh token:', error);
      return false;
    }
  }

  /**
   * Revokes a refresh token.
   * @param {string} token - The token to revoke.
   * @returns {Promise<void>}
   */
  async revokeToken(token) {
    try {
      await RefreshToken.update(
        { status: REFRESH_TOKEN_STATUS.INACTIVE },
        { where: { token } },
      );

      // Remove from Redis
      await redis.del(`refresh_token:${token}`);
    } catch (error) {
      this._logger.error('Error revoking refresh token:', error);
      throw new Error('Failed to revoke refresh token');
    }
  }

  /**
   * Deletes expired refresh tokens from the database.
   */
  async cleanupExpiredTokens() {
    try {
      await RefreshToken.destroy({
        where: {
          expiry_at: { [Op.lt]: new Date() },
        },
      });
    } catch (error) {
      this._logger.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Fetches all refresh tokens for a given user.
   * @param {string} userId - The user's ID.
   * @returns {Promise<Array>} - List of refresh tokens.
   */
  async getAllTokensForUser(userId) {
    try {
      return await RefreshToken.findAll({
        where: { user_id: userId, status: REFRESH_TOKEN_STATUS.ACTIVE },
      });
    } catch (error) {
      this._logger.error('Error fetching tokens for user:', error);
      throw new Error('Failed to fetch user tokens');
    }
  }

  /**
   * Revokes and deletes all refresh tokens for a given user.
   * @param {string} userId - The user's ID.
   * @returns {Promise<void>}
   */
  async removeGivenTokensForUser(userId, tokens) {
    try {
      await RefreshToken.update(
        { status: REFRESH_TOKEN_STATUS.INACTIVE },
        { where: { user_id: userId, token: tokens } },
      );

      for (const token of tokens) {
        await redis.del(`refresh_token:${token}`);
      }
    } catch (error) {
      this._logger.error('Error removing all tokens for user:', error);
      throw new Error('Failed to remove user tokens');
    }
  }
}

export default new RefreshTokenService();

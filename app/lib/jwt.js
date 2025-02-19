import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import utils from './utils.js';

class JwtService {
  constructor() {
    this.secretKey = config.JWT_SECRET_KEY;
  }

  /**
   * Generates a JWT token with default claims.
   * @param {Object} payload - The payload to encode.
   * @param {string} expiresIn - Expiration time (e.g., '1h', '7d').
   * @param {string} [issuer='MyApp'] - The issuer of the token.
   * @param {string} [audience='MyAppUsers'] - The intended audience.
   * @returns {string | null} - The generated JWT token or null on error.
   */
  generateToken(
    payload,
    expiresIn,
    issuer = config.APP_NAME,
    audience = 'users',
  ) {
    try {
      const nowUnix = utils.getDayJsObj().unix();
      const claims = {
        ...payload,
        // iat: nowUnix,
        // iss: issuer,
        // aud: audience,
      };

      return jwt.sign(claims, this.secretKey, {
        algorithm: 'HS256',
        audience: audience,
        issuer: issuer,
        expiresIn: nowUnix + this._parseExpiration(expiresIn),
      });
    } catch (err) {
      console.error('Error generating JWT:', err);
      return null;
    }
  }

  /**
   * Verifies a JWT token.
   * @param {string} token - The token to verify.
   * @returns {Object | string | null} - The decoded payload or null if invalid.
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (err) {
      console.error('Invalid token:', err.message);
      return null;
    }
  }

  /**
   * Converts expiration time (e.g., '1h', '7d') to seconds.
   * @param {string} expiresIn - Expiration time format.
   * @returns {number} - Expiration time in seconds.
   */
  _parseExpiration(expiresIn) {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn, 10);

    switch (unit) {
      case 's':
        return value; // Seconds
      case 'm':
        return value * 60; // Minutes
      case 'h':
        return value * 3600; // Hours
      case 'd':
        return value * 86400; // Days
      default:
        throw new Error('Invalid expiration format');
    }
  }
}

export default new JwtService();

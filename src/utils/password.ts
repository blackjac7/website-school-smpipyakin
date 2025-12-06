import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} [saltRounds=12] - Number of salt rounds (default: 12)
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 12
): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Example usage for generating hashes for development:
// You can run this in a Node.js script to generate password hashes

/* 
Usage example:

async function generateHashes() {
  const passwords = ["admin123", "siswa123", "osis123", "kesiswaan123", "ppdb123"];
  
  for (const password of passwords) {
    const hash = await hashPassword(password);
    console.log(`Password: ${password} -> Hash: ${hash}`);
  }
}

generateHashes();
*/

/**
 * Object containing password utility functions.
 * @property {function} hashPassword - Function to hash a password.
 * @property {function} verifyPassword - Function to verify a password against a hash.
 */
const passwordUtils = {
  hashPassword,
  verifyPassword,
};

export default passwordUtils;

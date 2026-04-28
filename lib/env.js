// Flexible environment variable validator
// Usage: ensureEnv(['GROQ_API_KEY', 'MONGODB_URI'])
function ensureEnv(keys = []) {
  if (!Array.isArray(keys) || keys.length === 0) return;
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    const list = missing.join(', ');
    throw new Error(
      `Missing required environment variables: ${list}. ` +
        'Copy .env.example to .env and set them, or provide them in your deployment.'
    );
  }
}

export { ensureEnv };
export default { ensureEnv };

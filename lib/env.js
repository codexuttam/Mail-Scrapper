// Simple environment variable validator
const required = [
  'MONGODB_URI',
  'GROQ_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS'
];

function checkEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    const list = missing.join(', ');
    // Throwing here will fail fast during server startup which is helpful
    // for developer experience. Some variables are optional in runtime
    // (e.g. SMTP when using SMTP_TEST), so keep this list minimal and
    // aligned with the repository usage.
    throw new Error(
      `Missing required environment variables: ${list}. ` +
        'Copy .env.example to .env and set them, or provide them in your deployment.'
    );
  }
}

export default { checkEnv };

import dotenv from 'dotenv';

const envFilePath = process.env.ENV_FILE_PATH;
if (envFilePath) {
  dotenv.config({ path: envFilePath });
}

import { ENVIRONMENTS } from '@utils/data-types/enums';
import { config } from 'dotenv';

switch (process.env.NODE_ENV) {
  case ENVIRONMENTS.DEV:
    config({ path: '.env.dev' });
    break;
  case ENVIRONMENTS.STAGING:
    config({ path: '.env.staging' });
    break;
  case ENVIRONMENTS.PROD:
    config({ path: '.env.prod' });
    break;
  default:
    config({ path: '.env' });
    break;
}

export const configs = {
  port: process.env.APP_PORT,

  // aws
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.REGION,

  // image
  bucketName: process.env.AWS_BUCKET_NAME,
  awsImageRegion: process.env.AWS_IMAGE_REGION,
  awsImageURL: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_IMAGE_REGION}.amazonaws.com`,
  mongoDBUriBackEnd: process.env.MONGODB_URI_BE,
  connectionNameBackend: process.env.CONNECTION_NAME_BE,
  mongoDBUriLog: process.env.MONGODB_URI_LOG,
  connectionNameLog: process.env.CONNECTION_NAME_LOG,

  //jwt
  secret: process.env.SECRET_JWT,
  baseUrl: process.env.BASE_URL,
  instructorRoleId: process.env.INSTRUCTOR_ROLE_ID,

  //redis
  redisURL: process.env.REDIS_URL,
};

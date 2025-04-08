import { configs } from '../config';
import * as url from 'url';

const redisUrl = configs.redisURL;

export const redisOptions = (() => {
  if (!redisUrl) return {};

  const parsedUrl = new url.URL(redisUrl);

  return {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port),
    password: parsedUrl.password,
    // Nếu cần thêm:
    // username: parsedUrl.username,
  };
})();

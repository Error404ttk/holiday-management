import { env } from './config/env.js';
import { app } from './app.js';

app.listen(env.APP_PORT, '0.0.0.0', () => {
  console.log(`${env.APP_NAME} API listening on port ${env.APP_PORT}`);
});

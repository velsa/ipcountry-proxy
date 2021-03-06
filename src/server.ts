import env from './env';
import app from './app';

//
// Launch the server
//
app.listen(env.LISTEN_PORT, () => {
  env.IS_DEBUG && console.log('Running in DEBUG mode');
  return console.log(`server is listening on ${env.LISTEN_PORT}`);
});

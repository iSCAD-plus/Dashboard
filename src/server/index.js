import mongoose from 'mongoose';
import { createApp } from './api';

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO);

const port = parseInt(KYT.SERVER_PORT, 10);

const app = createApp();

app.listen(port, () => {
  console.log(`✅  server started on port: ${port}`); // eslint-disable-line no-console
});

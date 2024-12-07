import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import { createServer } from 'http';
import logger from './utils/logger';
import connect from './utils/db';
import dotenv from 'dotenv';
import router from './routes';
import { setupWebSocket } from './utils/websocket';

dotenv.config();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

connect();

const app = express();
const server = createServer(app);
setupWebSocket(server);


app.use(express.json());
app.use(compression());
app.use(helmet());
app.use(cors(corsOptions));

app.use('/api', router);


server.listen(3000, () => {
  logger.info('Server is running on port 3000');
});
import 'dotenv/config';
import typeorm from 'typeorm';
import Resume from './entity/resume.entity.js';
import User from './entity/user.entity.js';

const dataSource = new typeorm.DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  entities: [Resume, User],
});

dataSource.initialize();

export default dataSource;

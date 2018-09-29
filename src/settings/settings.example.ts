import { ConnectionSettings } from '../providers/data-access/data-access.service';

export const botPrefix: string = '!';
export const botColor: number = 7506394;
export const authToken: string = 'authToken';
export const connectionSettings: ConnectionSettings = {
  url: 'mongodb://localhost:27017',
  databaseName: 'express-demo'
};
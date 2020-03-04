import { DiscordBotLogger } from 'discord-bot';
import { connect, ConnectionOptions, Document, Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IDao } from '../dao.types';

const connectionOptions: ConnectionOptions = { useNewUrlParser: true, useUnifiedTopology: true };

export interface IMongooseDao {
  deleteDocument<T>(source: Model<Document>, documentFilters: Partial<T>, document: Document): Observable<T>;
  findDocument<T>(source: Model<Document>, documentFilters: Partial<T>): Observable<T | undefined>;
  findDocuments<T>(source: Model<Document>, documentFilters: Partial<T>): Observable<T[]>;
  saveDocument<T>(document: Document): Observable<T>;
  saveOrUpdateDocument<T>(source: Model<Document>, documentFilters: Partial<T>, document: Document): Observable<T>;
  updateDocument<T>(source: Model<Document>, documentFilters: Partial<T>, document: Document): Observable<T>;
}

export class MongooseDao implements IDao {
  protected logger?: DiscordBotLogger;

  public configure(logger?: DiscordBotLogger) {
    this.logger = logger;
  }

  public connect(databaseUrl: string, databaseName: string) {
    return from(connect(`${databaseUrl}/${databaseName}`, connectionOptions)).pipe(map(_ => undefined));
  }

  protected info(message: string) {
    if (this.logger) this.logger.info(`DocumentDao: ${message}`);
  }
}

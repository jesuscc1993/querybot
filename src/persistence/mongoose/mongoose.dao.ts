import { DiscordBotLogger } from 'discord-bot';
import mongoose from 'mongoose';
import { Observable } from 'rxjs';

import { IDao } from '../dao.types';

export class MongooseDao implements IDao {
  protected logger?: DiscordBotLogger;

  public configure(logger?: DiscordBotLogger) {
    this.logger = logger;
  }

  public connect(databaseUrl: string, databaseName: string): Observable<undefined> {
    return new Observable(observer => {
      mongoose.connect(`${databaseUrl}/${databaseName}`, { useNewUrlParser: true }).then(
        () => {
          observer.next(undefined);
          observer.complete();
        },
        error => observer.error(error),
      );
    });
  }

  protected info(message: string) {
    if (this.logger) this.logger.info(message);
  }
}

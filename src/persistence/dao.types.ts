import { Observable } from 'rxjs';

import { DiscordBotLogger } from '../modules/discord-bot';

export interface IDao {
  configure(logger?: DiscordBotLogger): void;
  connect(databaseUrl: string, databaseName: string): Observable<void>;
}

import { DiscordBotLogger } from 'discord-bot';
import { Observable } from 'rxjs';

export type DocumentSchema<T> = T & { _id: string };

export interface IDao {
  configure(logger?: DiscordBotLogger): void;
  connect(databaseUrl: string, databaseName: string): Observable<void>;
}

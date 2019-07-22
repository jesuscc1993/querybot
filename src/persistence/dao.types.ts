import { DiscordBotLogger } from 'discord-bot';
import { Observable } from 'rxjs';

export interface IDao {
  configure(logger?: DiscordBotLogger): void;
  connect(databaseUrl: string, databaseName: string): Observable<void>;
}

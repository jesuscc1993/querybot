import { DiscordBotLogger } from 'discord-bot';
import mongoose, { Document, Model } from 'mongoose';
import { Observable } from 'rxjs';

import { DocumentDao } from '../../persistence/document.dao';
import { defaultSiteKeywordsMap } from '../../settings';
import { GoogleSearchProvider } from '../google-search/google-search.provider';
import { GoogleSearchOptions, GoogleSearchResultItem } from '../google-search/google-search.types';
import { getServerKeywordsMap, getServerSchema } from './server.domain';
import { KeywordsMap, Server, SiteKeyword } from './server.types';

export class ServerProvider {
  readonly serverDocument: Model<any>;
  readonly documentDao: DocumentDao;

  readonly googleSearchProvider: GoogleSearchProvider;

  readonly serverSiteKeywordsMap: { [serverID: string]: KeywordsMap };

  protected static _instance: ServerProvider = new ServerProvider();
  private searchOptions: GoogleSearchOptions;

  constructor() {
    if (ServerProvider._instance) {
      throw new Error('Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.');
    }
    ServerProvider._instance = this;

    this.serverDocument = mongoose.model('Server', getServerSchema());
    this.documentDao = new DocumentDao();

    this.googleSearchProvider = new GoogleSearchProvider();

    this.serverSiteKeywordsMap = {};
  }

  public static getInstance(): ServerProvider {
    return ServerProvider._instance;
  }

  public configure(googleSearchApiKey: string, googleSearchCx: string, logger?: DiscordBotLogger) {
    this.documentDao.configure(logger);
    this.searchOptions = {
      cx: googleSearchCx,
      key: googleSearchApiKey,
    };
  }

  public connect(databaseUrl: string, databaseName: string): Observable<undefined> {
    return this.documentDao.connect(databaseUrl, databaseName);
  }

  public setSiteKeyword(serverId: string, keyword: string, url: string): Observable<undefined> {
    return new Observable(observer => {
      this.getServerSiteKeywordsMapOrSetDefaults(serverId).subscribe(keywordsMap => {
        this.serverSiteKeywordsMap[serverId][keyword] = url;

        this.saveOrUpdateServer({
          _id: serverId,
          keywordsMap: this.serverSiteKeywordsMap[serverId],
        }).subscribe(
          server => {
            observer.next();
            observer.complete();
          },
          error => observer.error(error),
        );
      });
    });
  }

  public unsetSiteKeyword(serverId: string, keyword: string): Observable<undefined> {
    return new Observable(observer => {
      this.getServerSiteKeywordsMapOrSetDefaults(serverId).subscribe(keywordsMap => {
        if (!this.serverSiteKeywordsMap[serverId][keyword]) {
          observer.error(new Error(`Keyword "${keyword}" does not exist.`));
        }

        delete this.serverSiteKeywordsMap[serverId][keyword];

        this.saveOrUpdateServer({
          _id: serverId,
          keywordsMap: this.serverSiteKeywordsMap[serverId],
        }).subscribe(
          server => {
            observer.next();
            observer.complete();
          },
          error => observer.error(error),
        );
      });
    });
  }

  public getSiteKeyword(serverId: string, keyword: string): Observable<string> {
    return new Observable(observer => {
      const onCompletion = (keyword: string) => {
        observer.next(keyword);
        observer.complete();
      };

      if (this.serverSiteKeywordsMap[serverId]) {
        onCompletion(this.serverSiteKeywordsMap[serverId][keyword]);
      } else {
        this.getServerSiteKeywordsMapOrSetDefaults(serverId).subscribe(
          keywordsMap => {
            onCompletion(keywordsMap[keyword]);
          },
          error => observer.error(error),
        );
      }
    });
  }

  public getServerSiteKeywords(serverId: string): Observable<SiteKeyword[]> {
    return new Observable(observer => {
      this.getServerSiteKeywordsMapOrSetDefaults(serverId).subscribe(
        keywordsMap => {
          this.serverSiteKeywordsMap[serverId] = keywordsMap;

          const siteKeywords: SiteKeyword[] = [];
          if (keywordsMap) {
            Object.keys(keywordsMap).forEach(keyword =>
              siteKeywords.push({ keyword: keyword, url: keywordsMap[keyword] }),
            );
          }

          observer.next(siteKeywords);
          observer.complete();
        },
        error => observer.error(error),
      );
    });
  }

  public search(
    serverId: string,
    query: string,
    nsfw: boolean,
    keyword?: string,
  ): Observable<GoogleSearchResultItem[]> {
    return new Observable(observer => {
      let searchOptions: GoogleSearchOptions = Object.assign(
        { num: 1, safe: nsfw ? 'off' : 'active' },
        this.searchOptions,
      );

      const onKeywordReady = () => {
        this.googleSearchProvider.search(query, searchOptions).subscribe(
          searchResults => {
            observer.next(searchResults);
            observer.complete();
          },
          error => observer.error(error),
        );
      };

      if (keyword) {
        this.getSiteKeyword(serverId, keyword).subscribe(
          site => {
            if (site) {
              searchOptions.siteSearch = site;
              onKeywordReady();
            } else {
              // Disabled by popular demand
              // observer.error(new Error('Invalid keyword.'));
            }
          },
          error => observer.error(error),
        );
      } else {
        onKeywordReady();
      }
    });
  }

  private getServerSiteKeywordsMapOrSetDefaults(serverId: string): Observable<any> {
    return new Observable(observer => {
      const onCompletion = (server: Server) => {
        const keywordsMap: any = getServerKeywordsMap(server);
        this.serverSiteKeywordsMap[serverId] = keywordsMap;
        observer.next(keywordsMap);
        observer.complete();
      };

      this.findServerById(serverId).subscribe(
        returnedServer => {
          if (returnedServer) {
            onCompletion(returnedServer);
          } else {
            this.saveServer({
              _id: serverId,
              keywordsMap: defaultSiteKeywordsMap,
            }).subscribe(
              savedServer => {
                onCompletion(savedServer);
              },
              error => observer.error(error),
            );
          }
        },
        error => observer.error(error),
      );
    });
  }

  public saveServer(server: Server): Observable<any> {
    return this.documentDao.saveDocument(this.serverToDocument(server));
  }

  public updateServer(server: Server): Observable<any> {
    return this.documentDao.updateDocument(this.serverDocument, { _id: server._id }, this.serverToDocument(server));
  }

  public saveOrUpdateServer(server: Server): Observable<any> {
    return this.documentDao.saveOrUpdateDocument(
      this.serverDocument,
      { _id: server._id },
      this.serverToDocument(server),
    );
  }

  public deleteServerById(serverId: string): Observable<any> {
    const server: Server = { _id: serverId };
    return this.documentDao.deleteDocument(this.serverDocument, { _id: serverId }, this.serverToDocument(server));
  }

  public findServerById(serverId: string): Observable<Server | undefined> {
    return new Observable(observer => {
      this.documentDao.findDocuments(this.serverDocument, { _id: serverId }).subscribe(
        servers => {
          observer.next(servers.length ? servers[0] : undefined);
          observer.complete();
        },
        error => observer.error(error),
      );
    });
  }

  private serverToDocument(server: Server): Document {
    return new this.serverDocument({
      _id: server._id,
      keywordsMap: server.keywordsMap,
    });
  }
}

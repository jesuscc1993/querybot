import mongoose, { Document, Model } from 'mongoose';
import { Observable } from 'rxjs';
import { Logger } from 'winston';

import { MongooseDao } from '../../dao/mongoose/mongoose.dao';
import { Server } from '../../models/server.model';
import { SiteKeyword } from '../../models/site-keyword.model';
import { defaultSiteKeywordsMap } from '../../settings/settings';
import { GoogleSearchOptions, GoogleSearchResultItem } from '../google-search/google-search.models';
import { GoogleSearchProvider } from '../google-search/google-search.provider';
import { serverSchema } from './server.schema';

export class ServerProvider {
  readonly serverDocument: Model<any>;
  readonly mongooseDao: MongooseDao;

  readonly googleSearchProvider: GoogleSearchProvider;

  readonly serverSiteKeywordsMap: any;

  protected static _instance: any = new ServerProvider();
  private searchOptions: GoogleSearchOptions;

  constructor() {
    if (ServerProvider._instance) {
      throw new Error('Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.');
    }
    ServerProvider._instance = this;

    this.serverDocument = mongoose.model('Server', serverSchema);
    this.mongooseDao = new MongooseDao();

    this.googleSearchProvider = new GoogleSearchProvider();

    this.serverSiteKeywordsMap = {};
  }

  public static getInstance(): ServerProvider {
    return ServerProvider._instance;
  }

  public configure(googleSearchApiKey: string, googleSearchCx: string, logger?: Logger): void {
    this.mongooseDao.setLogger(logger);
    this.searchOptions = {
      cx: googleSearchCx,
      key: googleSearchApiKey,
    };
  }

  public connect(databaseUrl: string, databaseName: string): Observable<undefined> {
    return this.mongooseDao.connect(
      databaseUrl,
      databaseName,
    );
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
      const onCompletion: Function = (keyword: string) => {
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
            Object.keys(keywordsMap).forEach(keyword => siteKeywords.push({ keyword: keyword, url: keywordsMap[keyword] }));
          }

          observer.next(siteKeywords);
          observer.complete();
        },
        error => observer.error(error),
      );
    });
  }

  public search(serverId: string, query: string, nsfw: boolean, keyword?: string): Observable<GoogleSearchResultItem[]> {
    return new Observable(observer => {
      let searchOptions: GoogleSearchOptions = Object.assign({ num: 1, safe: nsfw ? 'off' : 'active' }, this.searchOptions);

      const onKeywordReady: Function = () => {
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
              observer.error(new Error('Invalid keyword.'));
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
      const onCompletion: Function = (server: Server) => {
        const keywordsMap: any = this.getServerKeywordsMap(server);
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
    return this.mongooseDao.saveDocument(this.serverToDocument(server));
  }

  public updateServer(server: Server): Observable<any> {
    return this.mongooseDao.updateDocument(this.serverDocument, { _id: server._id }, this.serverToDocument(server));
  }

  public saveOrUpdateServer(server: Server): Observable<any> {
    return this.mongooseDao.saveOrUpdateDocument(this.serverDocument, { _id: server._id }, this.serverToDocument(server));
  }

  public deleteServerById(serverId: string): Observable<any> {
    const server: Server = { _id: serverId };
    return this.mongooseDao.deleteDocument(this.serverDocument, { _id: serverId }, this.serverToDocument(server));
  }

  public findServerById(serverId: string): Observable<Server | undefined> {
    return new Observable(observer => {
      this.mongooseDao.findDocuments(this.serverDocument, { _id: serverId }).subscribe(
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

  private getServerKeywordsMap(server: Server): any {
    return server ? server.keywordsMap : undefined;
  }

  private getServerSite(server: Server, keyword: string): any {
    return server && server.keywordsMap ? server.keywordsMap[keyword] : undefined;
  }
}

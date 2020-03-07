import { Observable, of, throwError } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';

import { ServerDao } from '../../persistence/server.dao';
import { defaultSiteKeywordsMap } from '../../settings';
import { GoogleSearchProvider } from '../google-search/google-search.provider';
import { GoogleSearchOptions } from '../google-search/google-search.types';
import { KeywordsMap, ServerModel } from './server.types';

export class ServerProvider {
  readonly serverDao: ServerDao;

  readonly googleSearchProvider: GoogleSearchProvider;

  protected static _instance: ServerProvider = new ServerProvider();

  private serverSiteKeywordsMap: { [serverID: string]: KeywordsMap };
  private searchOptions: GoogleSearchOptions;

  constructor() {
    if (ServerProvider._instance) {
      throw new Error('Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.');
    }
    ServerProvider._instance = this;

    this.serverDao = new ServerDao();

    this.googleSearchProvider = new GoogleSearchProvider();

    this.serverSiteKeywordsMap = {};
  }

  public static getInstance(): ServerProvider {
    return ServerProvider._instance;
  }

  public configure(googleSearchApiKey: string, googleSearchCx: string) {
    this.searchOptions = { cx: googleSearchCx, key: googleSearchApiKey };
    return this;
  }

  public connect(databaseUrl: string, databaseName: string) {
    return this.serverDao.connect(databaseUrl, databaseName);
  }

  public setSiteKeyword(serverId: string, keyword: string, url: string) {
    return this.saveOrUpdateServer({
      _id: serverId,
      keywordsMap: { ...(this.serverSiteKeywordsMap[serverId] || defaultSiteKeywordsMap), [keyword]: url },
    });
  }

  public unsetSiteKeyword(serverId: string, keyword: string) {
    return this.getServerSiteKeywordsMapOrSetDefaults(serverId).pipe(
      flatMap(keywordsMap => {
        if (!keywordsMap[keyword]) {
          throw new Error(`Keyword "${keyword}" does not exist.`);
        }

        delete keywordsMap[keyword];

        return this.saveOrUpdateServer({
          _id: serverId,
          keywordsMap: keywordsMap,
        });
      }),
    );
  }

  public getSiteKeyword(serverId: string, keyword: string) {
    return (this.serverSiteKeywordsMap[serverId]
      ? of(this.serverSiteKeywordsMap[serverId])
      : this.getServerSiteKeywordsMapOrSetDefaults(serverId)
    ).pipe(map(keywordsMap => keywordsMap[keyword]));
  }

  public getServerSiteKeywords(serverId: string) {
    return this.getServerSiteKeywordsMapOrSetDefaults(serverId).pipe(map(this.siteMapToArray));
  }

  private siteMapToArray = (keywordsMap: KeywordsMap) => {
    return Object.keys(keywordsMap).map(keyword => ({ keyword: keyword, url: keywordsMap[keyword] }));
  };

  public search(serverId: string, query: string, nsfw: boolean, keyword?: string) {
    let searchOptions: GoogleSearchOptions = Object.assign(
      { num: 1, safe: nsfw ? 'off' : 'active' },
      this.searchOptions,
    );

    return (keyword
      ? this.getSiteKeyword(serverId, keyword).pipe(
          flatMap(site => {
            if (site) {
              searchOptions.siteSearch = site;
              return of({});
            }
            return throwError(invalidKeywordError);
          }),
        )
      : of({})
    ).pipe(flatMap(() => this.googleSearchProvider.search(query, searchOptions)));
  }

  public saveServer(server: ServerModel) {
    return this.serverDao.create(server).pipe(tap(this.updateKeywordsFromServer));
  }
  public updateServer(server: ServerModel) {
    return this.serverDao.update(server).pipe(tap(this.updateKeywordsFromServer));
  }
  public saveOrUpdateServer(server: ServerModel) {
    return this.serverDao.createOrUpdate(server).pipe(tap(this.updateKeywordsFromServer));
  }
  public deleteServerById(serverId: string) {
    return this.serverDao.deleteById(serverId).pipe(tap(_ => delete this.serverSiteKeywordsMap[serverId]));
  }
  public findServerById(serverId: string): Observable<ServerModel | undefined> {
    return this.serverDao.findById(serverId);
  }

  private updateKeywordsFromServer(server: ServerModel) {
    this.serverSiteKeywordsMap = {
      ...this.serverSiteKeywordsMap,
      [server._id]: server.keywordsMap,
    };
  }

  private getServerSiteKeywordsMapOrSetDefaults(serverId: string) {
    return this.serverDao.findById(serverId).pipe(
      flatMap(server =>
        server ? of(server) : this.saveServer({ _id: serverId, keywordsMap: { ...defaultSiteKeywordsMap } }),
      ),
      map(({ keywordsMap }) => keywordsMap),
      tap(keywordsMap => {
        this.serverSiteKeywordsMap[serverId] = keywordsMap;
      }),
    );
  }
}

export const invalidKeywordError = 'Invalid keyword.';

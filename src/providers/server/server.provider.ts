import { Observable, Observer } from 'rxjs';
import { Document, Model, Schema } from 'mongoose';

import { Server } from '../../models/server';
import { SiteKeyword } from '../../models/site-keyword';

import { MongooseDao } from '../../dao/mongoose/mongoose.dao';

import { GoogleSearchProvider } from '../google-search/google-search.provider';
import { GoogleSearchOptions, GoogleSearchResultItem } from '../google-search/google-search.models';

const mongoose = require('mongoose');

export class ServerProvider {

  readonly serverSchema: Schema;
  readonly serverDocument: Model<any>;
  readonly mongooseDao: MongooseDao;

  readonly googleSearchProvider: GoogleSearchProvider = new GoogleSearchProvider();
  readonly searchOptions: GoogleSearchOptions;

  readonly defaultSiteKeywordsMap: any;
  readonly serverSiteKeywordsMap: any;

  constructor(googleSearchApiKey: string, googleSearchCx: string) {
    this.searchOptions = {
      cx: googleSearchCx,
      key: googleSearchApiKey
    }

    this.defaultSiteKeywordsMap = {
      yt: 'youtube.com',
      tw: 'twitch.tv'
    };
    this.serverSiteKeywordsMap = {};

    this.serverSchema = new Schema({
      _id: String,
      keywordsMap: Object
    });

    this.serverDocument = mongoose.model('Server', this.serverSchema);

    this.mongooseDao = new MongooseDao();
    this.googleSearchProvider = new GoogleSearchProvider();
  }

  public connect(databaseUrl: string, databaseName: string): Observable<undefined> {
    return this.mongooseDao.connect(databaseUrl, databaseName);
  };

  public addSiteKeyword(serverId: string, keyword: string, url: string): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      this.getServerSiteKeywordsMapOrSetDefaults(serverId).subscribe((keywordsMap: any) => {
        this.serverSiteKeywordsMap[serverId][keyword] = url;

        this.saveOrUpdateServer({
          _id: serverId,
          keywordsMap: this.serverSiteKeywordsMap[serverId]

        }).subscribe((server: Server) => {
          observer.next(this.getServerSite(server, keyword));
          observer.complete();
        });
      });
    });
  }

  public getSiteKeyword(serverId: string, keyword: string): Observable<string> {
    return new Observable((observer: Observer<string>) => {

      const onCompletion: Function = (keyword: string) => {
        observer.next(keyword);
        observer.complete();
      }

      if (this.serverSiteKeywordsMap[serverId]) {
        onCompletion(this.serverSiteKeywordsMap[serverId][keyword]);

      } else {
        this.getServerSiteKeywordsMapOrSetDefaults(serverId).subscribe((keywordsMap: any) => {
          onCompletion(keywordsMap[keyword]);
        });
      }
    });
  }

  public getServerSiteKeywords(serverId: string): Observable<SiteKeyword[]> {
    return new Observable((observer: Observer<SiteKeyword[]>) => {
      this.getServerSiteKeywordsMapOrSetDefaults(serverId).subscribe((keywordsMap: any) => {
        this.serverSiteKeywordsMap[serverId] = keywordsMap;

        const siteKeywords: SiteKeyword[] = [];
        if (keywordsMap) {
          Object.keys(keywordsMap).forEach((keyword) => siteKeywords.push({ keyword: keyword, url: keywordsMap[keyword] }));
        }

        observer.next(siteKeywords);
        observer.complete();
      });
    });
  }

  public search(serverId: string, query: string, nsfw: boolean, keyword?: string): Observable<GoogleSearchResultItem[]> {
    return new Observable((observer: Observer<GoogleSearchResultItem[]>) => {
      let searchOptions: GoogleSearchOptions = Object.assign({ num: 1, safe: nsfw ? 'off' : 'active' }, this.searchOptions);

      const onKeywordReady: Function = () => {
        this.googleSearchProvider.search(query, searchOptions).subscribe((searchResults: GoogleSearchResultItem[]) => {
          observer.next(searchResults);
          observer.complete();

        }, (error: Error) => {
          observer.error(error);
        });
      }

      if (keyword) {
        this.getSiteKeyword(serverId, keyword).subscribe((site) => {

          if (site) {
            searchOptions.siteSearch = site;
            onKeywordReady();

          } else {
            observer.error(new Error('Invalid keyword.'));
          }
        });

      } else {
        onKeywordReady();
      }

    });
  }

  private getServerSiteKeywordsMapOrSetDefaults(serverId: string): Observable<any> {
    return new Observable((observer: Observer<any>) => {

      const onCompletion: Function = (server: Server) => {
        const keywordsMap: any = this.getServerKeywordsMap(server);
        this.serverSiteKeywordsMap[serverId] = keywordsMap;
        observer.next(keywordsMap);
        observer.complete();
      };

      this.findServer(serverId).subscribe((returnedServer) => {
        if (returnedServer) {
          onCompletion(returnedServer);

        } else {
          this.saveServer({
            _id: serverId,
            keywordsMap: this.defaultSiteKeywordsMap

          }).subscribe((savedServer) => onCompletion(savedServer));
        }
      });
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

  public findServer(serverId: string): Observable<Server | undefined> {
    return new Observable((observer: Observer<Server | undefined>) => {
      this.mongooseDao.findDocuments(this.serverDocument, { _id: serverId }).subscribe((servers: Server[]) => {
        observer.next(servers.length ? servers[0] : undefined);
        observer.complete();

      }, (error: Error) => {
        observer.error(error);
      });
    });
  }

  private serverToDocument(server: Server): Document {
    return new this.serverDocument({
      _id: server._id,
      keywordsMap: server.keywordsMap
    });
  }

  private getServerKeywordsMap(server: Server): any {
    return server ? server.keywordsMap : undefined
  }

  private getServerSite(server: Server, keyword: string): any {
    return (server && server.keywordsMap) ? server.keywordsMap[keyword] : undefined
  }

}
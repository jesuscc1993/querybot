import { Observable, Observer } from 'rxjs';

import { SearchResult, SearchScraper } from '../search-scrapper/search-scraper';
import { DataAccessService } from '../data-access/data-access.service';

export interface Site {
  keyword: string;
  url: string;
}

export class SearchProvider {

  private scraper: SearchScraper = new SearchScraper();
  private dataAccessService: DataAccessService = new DataAccessService();

  private defaultSites: any = {
    yt: 'youtube.com',
    tw: 'twitch.tv'
  };
  private sites: any = {};

  public addSite(serverId: number, keyword: string, url: string): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      this.getSitesOrSetDefaults(serverId).subscribe((sites) => {
        this.sites[serverId][keyword] = url;

        this.saveSites(serverId, this.sites[serverId]).subscribe((sites: any) => {
          observer.next(sites[keyword]);
          observer.complete();
        });
      });
    });
  }

  private getSite(serverId: number, keyword: string): Observable<string> {
    return new Observable((observer: Observer<string>) => {

      const onCompletion: Function = (site: string) => {
        observer.next(site);
        observer.complete();
      }

      if (this.sites[serverId]) {
        onCompletion(this.sites[serverId][keyword]);

      } else {
        this.getSitesOrSetDefaults(serverId).subscribe((sites) => {
          onCompletion(sites[keyword]);
        });
      }
    });
  }

  public getSitesAsArray(serverId: number): Observable<Site[]> {
    return new Observable((observer: Observer<Site[]>) => {
      this.getSitesOrSetDefaults(serverId).subscribe((sites) => {
        this.sites[serverId] = sites;

        const sitesArray: Site[] = [];
        if (sites) {
          Object.keys(sites).forEach((key) => sitesArray.push({ keyword: key, url: sites[key] }));
        }

        observer.next(sitesArray);
        observer.complete();
      });
    });
  }

  public search(serverId: number, search: string, keyword?: string): Observable<SearchResult[]> {
    return new Observable((observer: Observer<SearchResult[]>) => {
      let query: string = '';

      const onKeywordReady: Function = () => {
        query += search;

        try {
          this.scraper.search({ query: query, limit: 1 }).then((searchResults: SearchResult[]) => {
            observer.next(searchResults);
            observer.complete();

          }, (error: Error) => {
            observer.error(error);
          });

        } catch (error) {
          observer.error(error);
        }
      }

      if (keyword) {
        this.getSite(serverId, keyword).subscribe((site) => {

          if (site) {
            query += `site:${site} `;
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

  private getSitesOrSetDefaults(serverId: number): Observable<any> {
    return new Observable((observer: Observer<any>) => {

      const onCompletion: Function = (sites: any) => {
        this.sites[serverId] = sites;
        observer.next(sites);
        observer.complete();
      };

      this.querySites(serverId).subscribe((queriedSites) => {
        if (queriedSites) {
          onCompletion(queriedSites);

        } else {
          this.saveSites(serverId, this.defaultSites).subscribe((savedSites) => {
            onCompletion(savedSites);
          });
        }
      });
    });
  }

  private saveSites(serverId: number, sites: any): Observable<any> {
    this.sites[serverId] = sites;

    return new Observable((observer: Observer<any>) => {
      this.dataAccessService.saveSites(serverId, sites).subscribe((sites: any) => {
        observer.next(sites);
        observer.complete();
      });
    });
  }

  private querySites(serverId: number): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.dataAccessService.getSites(serverId).subscribe((sites: any) => {
        observer.next(sites);
        observer.complete();
      });
    });
  }

}
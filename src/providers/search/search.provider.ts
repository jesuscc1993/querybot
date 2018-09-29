import { Observable, Observer } from 'rxjs';

import { SearchResult, SearchScraper } from '../search-scrapper/search-scraper';

export interface Site {
  keyword: string;
  url: string;
}

export class SearchProvider {

  private scraper: SearchScraper = new SearchScraper();

  private defaultSites: any = {
    yt: 'youtube.com',
    tw: 'twitch.tv'
  };
  private sites: any = {};

  private getSite(serverId: number, keyword: string): string {
    return this.defaultSites[keyword] || (this.sites[serverId] ? this.sites[serverId][keyword] : undefined);
  }

  public addSite(serverId: number, keyword: string, url: string): void {
    this.sites[serverId] = this.sites[serverId] || {};
    this.sites[serverId][keyword] = url;
  }

  public getSites(serverId: number): Site[] {
    const sites: Site[] = [];

    Object.keys(this.defaultSites).forEach((key) => sites.push({ keyword: key, url: this.defaultSites[key] }));

    const serverSites: any = this.sites[serverId];
    if (serverSites) {
      Object.keys(serverSites).forEach((key) => sites.push({ keyword: key, url: serverSites[key] }));
    }

    return sites;
  }

  public search(serverId: number, search: string, keyword?: string): Observable<SearchResult[]> {
    return new Observable((observer: Observer<SearchResult[]>) => {
      let query: string = '';

      if (keyword) {
        const site: string = this.getSite(serverId, keyword);
        if (site) {
          query += `site:${site} `;

        } else {
          observer.error(new Error('Invalid keyword.'));
        }
      }

      query += search;

      try {
        this.scraper.search({ query: query, limit: 1 }).then((results: SearchResult[]) => {
          observer.next(results);
          observer.complete();

        }, (error: Error) => {
          observer.error(error);
        });

      } catch (error) {
        observer.error(error);
      }
    });
  }

}
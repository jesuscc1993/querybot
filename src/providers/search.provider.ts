import { Observable } from 'rxjs';

const scraper = require('google-search-scraper');

export interface Site {
  keyword: string;
  url: string;
}
export interface SearchResult {
  url: string;
  title: string;
  meta: string;
  desc: string;
}

export class SearchProvider {

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

  public search(serverId: number, search: string, keyword?: string): Observable<SearchResult> {
    return new Observable((observer) => {
      let query: string = '';

      if (keyword) {
        const site: string = this.getSite(serverId, keyword);
        if (site) {
          query += `site:${site} `;

        } else {
          observer.error('Invalid keyword.');
        }
      }

      query += search;

      scraper.search({ query: query, limit: 1 }, (error: Error, url: string, metadata: any) => {
        if (error) {
          throw error;

        } else {
          observer.next(Object.assign({ url: url }, metadata));
          observer.complete();
        }
      });
    });
  }

}
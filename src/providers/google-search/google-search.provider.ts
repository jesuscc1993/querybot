import { Observable, Observer } from 'rxjs';
import { Response } from 'request';

import { GoogleSearchOptions, GoogleSearchResult, GoogleSearchResultItem } from './google-search.models';

const request = require('request');

export class GoogleSearchProvider {

  private session = request.defaults({ jar: true });

  public search(query: string, options: GoogleSearchOptions): Observable<GoogleSearchResultItem[]> {
    return new Observable<any>((observer: Observer<GoogleSearchResultItem[]>) => {
      let searchUri: string = `https://www.googleapis.com/customsearch/v1?q=${query}`;
      for (const key in options) {
        searchUri += `&${key}=${options[key]}`;
      }

      this.session.get({
        uri: searchUri,
        followRedirect: false

      }, (error: Error, response: Response) => {
        if (error) {
          observer.error(error);

        } else {
          const googleSearchResult: GoogleSearchResult = JSON.parse(response.toJSON().body);
          observer.next(googleSearchResult.items || []);
          observer.complete();
        }
      });

    });
  }

}
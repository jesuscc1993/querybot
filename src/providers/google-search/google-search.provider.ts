import request, { Response } from 'request';
import { Observable } from 'rxjs';

import {
  GoogleSearchOptions,
  GoogleSearchResult,
  GoogleSearchResultItem,
} from './google-search.types';

export class GoogleSearchProvider {
  private session = request.defaults({ jar: true });

  public search(query: string, options: GoogleSearchOptions) {
    return new Observable<GoogleSearchResultItem[]>(observer => {
      let searchUri: string = `https://www.googleapis.com/customsearch/v1?q=${query}`;
      for (const key in options) {
        searchUri += `&${key}=${options[key]}`;
      }

      this.session.get(
        {
          uri: encodeURI(searchUri),
          followRedirect: false,
        },
        (error: Error, response: Response) => {
          if (error) {
            observer.error(error);
          } else {
            const googleSearchResult: GoogleSearchResult = JSON.parse(response.toJSON().body);
            observer.next(googleSearchResult.items || []);
            observer.complete();
          }
        },
      );
    });
  }
}

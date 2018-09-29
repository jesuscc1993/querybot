const request = require('request');
const cheerio = require('cheerio');
const url = require('url');

export interface SearchOptions {
  query: string;
  age?: string;
  language?: string;
  host?: string;
  start?: number;
  limit?: number;
}

export interface SearchResult {
  url: string;
  title: string;
  desc: string;
}

export class SearchScraper {
  private session = request.defaults({ jar: true });

  public search(options: SearchOptions): Promise<SearchResult[]> {
    return new Promise((resolve, reject) => {
      this.searchOnePage(options).then((results) => {
        resolve(results);

      }, (error) => {
        reject(error);
      });
    });
  }

  private searchOnePage(options: SearchOptions): Promise<SearchResult[]> {
    return new Promise((resolve, reject) => {
      let results: SearchResult[] = [];

      this.getPage(options).then((body) => {
        const $ = cheerio.load(body);

        $('#search .g').each((i: number, element: any) => {
          const anchorElement: any = $(element).find('h3 a');
          const descriptionElement: any = $(element).find('.st');

          const result: SearchResult = {
            title: anchorElement.text(),
            desc: descriptionElement.text(),
            url: anchorElement.attr('href')
          };

          if (result.url) {
            const parsedUrl = url.parse(result.url, true);
            if (parsedUrl.pathname === '/url') {
              result.url = parsedUrl.query.q;
              results.push(result);
            }
          }
        });

        if (results.length === 0 && options.limit !== 0) {
          reject(new Error('No results found'));

        } else if (options.limit) {
          if (results.length < options.limit) {
            options.start = (options.start || 0) + 10;

            this.searchOnePage(options).then((additionalResults) => {
              results = results.concat(additionalResults).slice(0, options.limit);
              resolve(results);

            }, (error) => {
              reject(error);
            });

          } else if (results.length > options.limit) {
            results = results.slice(0, options.limit)
          }
        }

        resolve(results);

      }, (error) => {
        reject(error);
      });
    });
  }

  private getPage(options: SearchOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      options.start = options.start || 0;

      const params: any = {
        q: options.query,
        hl: options.language || 'en',
        start: options.start
      };
      if (options.age) params.tbs = 'qdr:' + options.age;

      this.session.get({
        uri: 'https://' + (options.host || 'www.google.com') + '/search',
        qs: params,
        followRedirect: false
      }, (error: Error, response: any) => {
        if (error) reject(error);

        if (response.statusCode === 302) {
          const parsed = url.parse(response.headers.location, true);

          if (parsed.pathname !== '/search') {
            reject(new Error('Captcha'));

          } else {
            this.session.get({
              uri: response.headers.location,
              qs: params,
              followRedirect: false

            }, (error: Error, response: any) => {
              if (error) reject(error);
              else resolve(response.body);
            });
          }
        }

        resolve(response.body);
      });
    });
  }

}
import { Observable } from 'rxjs';
import { Document } from 'mongoose';

import { sitesSchema } from './data-access.schemas';

const mongoose = require('mongoose');

let SitesDocument: any;

export class DataAccessService {

  private errorMessages: any = {
    missingRequestBody: 'ERROR: Request body is missing.'
  };

  constructor() {
    this.setupSchemas();
  }

  public connect(connectionSettings: ConnectionSettings): Observable<any> {
    return new Observable((observer) => {
      mongoose.connect(`${connectionSettings.url}/${connectionSettings.databaseName}`, { useNewUrlParser: true }).then(() => {
        observer.next();
        observer.complete();

      }, (error: Error) => {
        observer.error(error);
      });
    });
  };

  public createSites(serverId: number, sites: any): Observable<any> {
    return new Observable((observer) => {
      this.saveDocument(this.sitesToDocument(serverId, sites)).subscribe((response: any) => {
        observer.next(response ? response.sites : sites);
        observer.complete();
      });
    });
  }

  public updateSites(serverId: number, sites: any): Observable<any> {
    return new Observable((observer) => {
      SitesDocument.updateOne({ _id: serverId }, this.sitesToDocument(serverId, sites), (response: any) => {
        observer.next(response ? response.sites : sites);
        observer.complete();
      });
    });
  }

  public saveSites(serverId: number, sites: any): Observable<any> {
    return new Observable((observer) => {

      const onCompletion: Function = (sites: any) => {
        observer.next(sites);
        observer.complete();
      };

      this.findDocuments(SitesDocument, { _id: serverId }).subscribe((documents) => {
        if (documents && documents.length) {
          this.updateSites(serverId, sites).subscribe((response: any) => onCompletion(response));

        } else {
          this.createSites(serverId, sites).subscribe((response: any) => onCompletion(response));
        }
      });
    });
  }

  public getSites(serverId: number): Observable<any> {
    return new Observable((observer) => {

      const onCompletion: Function = (sites: any) => {
        observer.next(sites);
        observer.complete();
      };

      this.findDocuments(SitesDocument, { _id: serverId }).subscribe((documents) => {
        if (documents && documents.length !== 0) {
          if (documents.length === 1) {
            onCompletion(documents[0].sites);

          } else {
            observer.error('More than one match found.');
          }

        } else {
          onCompletion(undefined);
        }
      });
    });
  }

  private setupSchemas() {
    SitesDocument = mongoose.model('Sites', sitesSchema);
  }

  private saveDocument(document: Document): Observable<any> {
    return new Observable((observer) => {
      document.save().then((response: any) => {
        observer.next(response);
        observer.complete();

      }, (error) => {
        observer.error(error);
      });
    });
  }

  private findDocuments(source: any, documentFilters: any): Observable<any> {
    return new Observable((observer) => {
      source.find(documentFilters, (error: Error, documents: Document[]) => {
        if (error) {
          observer.error(error);

        } else {
          observer.next(documents);
          observer.complete();
        }
      });
    });
  }

  private sitesToDocument(serverId: number, sites: any): Document {
    return new SitesDocument({
      _id: serverId,
      sites: sites
    });
  }

}

export class ConnectionSettings {
  url: string;
  databaseName: string;
}
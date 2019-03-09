import { Document, Model } from 'mongoose';
import { Observable } from 'rxjs';

import { IDao } from './dao.types';
import { MongooseDao } from './mongoose/mongoose.dao';

export class DocumentDao extends MongooseDao implements IDao {
  public updateDocument(source: Model<any>, documentFilters: any, document: Document): Observable<any> {
    return new Observable(observer => {
      source.updateOne(documentFilters, document, (error, response) => {
        if (error || response.nModified < 1) {
          observer.error(error);
        } else {
          this.info(`Updated document\n${JSON.stringify(document)}`);
          observer.next(document);
          observer.complete();
        }
      });
    });
  }

  public saveDocument(document: Document): Observable<any> {
    return new Observable(observer => {
      document.save().then(
        (returnedDocument: Document) => {
          this.info(`Saved document\n${JSON.stringify(returnedDocument)}`);
          observer.next(returnedDocument);
          observer.complete();
        },
        error => observer.error(error),
      );
    });
  }

  public saveOrUpdateDocument(source: Model<any>, documentFilters: any, document: Document): Observable<any> {
    return new Observable(observer => {
      const onCompletion = (updatedDocument: Document) => {
        observer.next(updatedDocument);
        observer.complete();
      };

      this.findDocuments(source, documentFilters).subscribe(
        documents => {
          if (documents && documents.length) {
            this.updateDocument(source, documentFilters, document).subscribe(
              returnedDocument => {
                onCompletion(returnedDocument);
              },
              error => observer.error(error),
            );
          } else {
            this.saveDocument(document).subscribe(
              returnedDocument => {
                onCompletion(returnedDocument);
              },
              error => observer.error(error),
            );
          }
        },
        error => observer.error(error),
      );
    });
  }

  public findDocuments(source: Model<any>, documentFilters: any): Observable<any> {
    return new Observable(observer => {
      source.find(documentFilters, (error, documents) => {
        if (error) {
          observer.error(error);
        } else {
          this.info(`Found documents\n${JSON.stringify(documents)}`);
          observer.next(documents);
          observer.complete();
        }
      });
    });
  }

  public deleteDocument(source: Model<any>, documentFilters: any, document: Document): Observable<any> {
    return new Observable(observer => {
      source.deleteOne(documentFilters, error => {
        if (error) {
          observer.error(error);
        } else {
          this.info(`Deleted document\n${JSON.stringify(document)}`);
          observer.next(document);
          observer.complete();
        }
      });
    });
  }
}

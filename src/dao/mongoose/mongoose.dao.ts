import { Observable } from 'rxjs';
import { Document, Model } from 'mongoose';

const mongoose = require('mongoose');

export class MongooseDao {

  private loggingEnabled: boolean = false;

  public errorMessages: any = {
    moreThanOneMatch: 'More than one match found.'
  };

  public connect(databaseUrl: string, databaseName: string): Observable<undefined> {
    return new Observable((observer) => {
      mongoose.connect(`${databaseUrl}/${databaseName}`, { useNewUrlParser: true }).then(() => {
        observer.next(undefined);
        observer.complete();

      }, (error: Error) => observer.error(error));
    });
  };

  public updateDocument(source: Model<any>, documentFilters: any, document: Document): Observable<any> {
    return new Observable((observer) => {
      source.updateOne(documentFilters, document, (error: Error, response: any) => {
        if (error || response.nModified < 1) {
          observer.error(error);

        } else {
          this.output(`Updated document\n${JSON.stringify(document)}`);
          observer.next(document);
          observer.complete();
        }
      });
    });
  }

  public saveDocument(document: Document): Observable<any> {
    return new Observable((observer) => {
      document.save().then((returnedDocument: Document) => {
        this.output(`Saved document\n${JSON.stringify(returnedDocument)}`);
        observer.next(returnedDocument);
        observer.complete();

      }, (error) => observer.error(error));
    });
  }

  public saveOrUpdateDocument(source: Model<any>, documentFilters: any, document: Document): Observable<any> {
    return new Observable((observer) => {

      const onCompletion: Function = (updatedDocument: Document) => {
        observer.next(updatedDocument);
        observer.complete();
      };

      this.findDocuments(source, documentFilters).subscribe((documents) => {
        if (documents && documents.length) {
          this.updateDocument(source, documentFilters, document).subscribe((returnedDocument) => {
            onCompletion(returnedDocument)

          }, (error) => observer.error(error));

        } else {
          this.saveDocument(document).subscribe((returnedDocument) => {
            onCompletion(returnedDocument)

          }, (error) => observer.error(error));
        }
      }, (error) => observer.error(error));
    });
  }

  public findDocuments(source: Model<any>, documentFilters: any): Observable<any> {
    return new Observable((observer) => {
      source.find(documentFilters, (error: Error, documents: Document[]) => {
        if (error) {
          observer.error(error);

        } else {
          this.output(`Found documents\n${JSON.stringify(documents)}`);
          observer.next(documents);
          observer.complete();
        }
      });
    });
  }

  public deleteDocument(source: Model<any>, documentFilters: any, document: Document): Observable<any> {
    return new Observable((observer) => {
      source.deleteOne(documentFilters, (error: Error) => {
        if (error) {
          observer.error(error);

        } else {
          this.output(`Deleted document\n${JSON.stringify(document)}`);
          observer.next(document);
          observer.complete();
        }
      });
    });
  }

  private output(message: any) {
    if (this.loggingEnabled) {
      console.log(message);
    }
  }

}
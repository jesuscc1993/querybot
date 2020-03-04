import { Document, Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { flatMap, map, tap } from 'rxjs/operators';

import { IMongooseDao, MongooseDao } from './mongoose.dao';

export class DocumentDao extends MongooseDao implements IMongooseDao {
  public updateDocument<T>(source: Model<Document>, documentFilters: Partial<T>, document: Document) {
    return new Observable<T>(observer => {
      source.updateOne(documentFilters, document, (error, response) => {
        if (error) observer.error(error);
        observer.next(<T>document.toObject());
        observer.complete();
      });
    }).pipe(
      tap(value => {
        this.info(`Updated document\n${JSON.stringify(value)}`);
      }),
    );
  }

  public saveDocument<T>(document: Document) {
    return from(document.save()).pipe(
      map(returnedDocument => <T>returnedDocument.toObject()),
      tap(value => {
        this.info(`Saved document\n${JSON.stringify(value)}`);
      }),
    );
  }

  public saveOrUpdateDocument<T>(source: Model<Document>, documentFilters: Partial<T>, document: Document) {
    return this.findDocuments(source, documentFilters).pipe(
      flatMap(documents =>
        documents && documents.length
          ? this.updateDocument<T>(source, documentFilters, document)
          : this.saveDocument<T>(document),
      ),
    );
  }

  public findDocuments<T>(source: Model<Document>, documentFilters: Partial<T>) {
    return new Observable<T[]>(observer => {
      source.find(documentFilters, (error, documents) => {
        if (error) observer.error(error);
        observer.next(documents.map(document => <T>document.toObject()));
        observer.complete();
      });
    }).pipe(
      tap(valuesArray => {
        this.info(`Found documents\n${JSON.stringify(valuesArray)}`);
      }),
    );
  }

  public findDocument<T>(source: Model<Document>, documentFilters: Partial<T>) {
    return <Observable<T | undefined>>this.findDocuments(source, documentFilters).pipe(
      map(documents => {
        if (documents.length > 1) throw new Error('More than one result returned');
        return documents.length === 0 ? undefined : documents[0];
      }),
    );
  }

  public deleteDocument<T>(source: Model<Document>, documentFilters: Partial<T>, document: Document) {
    return new Observable<T>(observer => {
      source.deleteOne(documentFilters, error => {
        if (error) observer.error(error);
        observer.next(<T>document.toObject());
        observer.complete();
      });
    }).pipe(
      tap(valuesArray => {
        this.info(`Deleted document\n${JSON.stringify(valuesArray)}`);
      }),
    );
  }
}

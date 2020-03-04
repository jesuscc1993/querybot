import { Document, Model, model } from 'mongoose';

import { ServerModel } from '../providers';
import { getServerSchema } from '../providers/server/server.domain';
import { DocumentDao } from './mongoose';

export class ServerDao {
  readonly serverDocument: Model<Document>;
  readonly documentDao: DocumentDao;

  constructor() {
    this.serverDocument = model('Server', getServerSchema());
    this.documentDao = new DocumentDao();
  }

  public connect(databaseUrl: string, databaseName: string) {
    return this.documentDao.connect(databaseUrl, databaseName);
  }

  public create(server: ServerModel) {
    return this.documentDao.saveDocument<ServerModel>(this.serverToDocument(server));
  }

  public update(server: ServerModel) {
    return this.documentDao.updateDocument<ServerModel>(
      this.serverDocument,
      { _id: server._id },
      this.serverToDocument(server),
    );
  }

  public createOrUpdate(server: ServerModel) {
    return this.documentDao.saveOrUpdateDocument<ServerModel>(
      this.serverDocument,
      { _id: server._id },
      this.serverToDocument(server),
    );
  }

  public deleteById(serverId: string) {
    const server = { _id: serverId };
    return this.documentDao.deleteDocument<ServerModel>(this.serverDocument, server, this.serverToDocument(server));
  }

  public findById(serverId: string) {
    return this.documentDao.findDocument<ServerModel>(this.serverDocument, { _id: serverId });
  }

  private serverToDocument(server: Partial<ServerModel>): Document {
    return new this.serverDocument({
      _id: server._id,
      keywordsMap: server.keywordsMap,
    });
  }
}

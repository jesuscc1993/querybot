"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var mongoose_dao_1 = require("./mongoose.dao");
var DocumentDao = /** @class */ (function (_super) {
    __extends(DocumentDao, _super);
    function DocumentDao() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DocumentDao.prototype.updateDocument = function (source, documentFilters, document) {
        var _this = this;
        return new rxjs_1.Observable(function (observer) {
            source.updateOne(documentFilters, document, function (error, response) {
                if (error)
                    observer.error(error);
                observer.next(document.toObject());
                observer.complete();
            });
        }).pipe(operators_1.tap(function (value) {
            _this.info("Updated document\n" + JSON.stringify(value));
        }));
    };
    DocumentDao.prototype.saveDocument = function (document) {
        var _this = this;
        return rxjs_1.from(document.save()).pipe(operators_1.map(function (returnedDocument) { return returnedDocument.toObject(); }), operators_1.tap(function (value) {
            _this.info("Saved document\n" + JSON.stringify(value));
        }));
    };
    DocumentDao.prototype.saveOrUpdateDocument = function (source, documentFilters, document) {
        var _this = this;
        return this.findDocuments(source, documentFilters).pipe(operators_1.flatMap(function (documents) {
            return documents && documents.length
                ? _this.updateDocument(source, documentFilters, document)
                : _this.saveDocument(document);
        }));
    };
    DocumentDao.prototype.findDocuments = function (source, documentFilters) {
        var _this = this;
        return new rxjs_1.Observable(function (observer) {
            source.find(documentFilters, function (error, documents) {
                if (error)
                    observer.error(error);
                observer.next(documents.map(function (document) { return document.toObject(); }));
                observer.complete();
            });
        }).pipe(operators_1.tap(function (valuesArray) {
            _this.info("Found documents\n" + JSON.stringify(valuesArray));
        }));
    };
    DocumentDao.prototype.findDocument = function (source, documentFilters) {
        return this.findDocuments(source, documentFilters).pipe(operators_1.map(function (documents) {
            if (documents.length > 1)
                throw new Error('More than one result returned');
            return documents.length === 0 ? undefined : documents[0];
        }));
    };
    DocumentDao.prototype.deleteDocument = function (source, documentFilters, document) {
        var _this = this;
        return new rxjs_1.Observable(function (observer) {
            source.deleteOne(documentFilters, function (error) {
                if (error)
                    observer.error(error);
                observer.next(document.toObject());
                observer.complete();
            });
        }).pipe(operators_1.tap(function (valuesArray) {
            _this.info("Deleted document\n" + JSON.stringify(valuesArray));
        }));
    };
    return DocumentDao;
}(mongoose_dao_1.MongooseDao));
exports.DocumentDao = DocumentDao;

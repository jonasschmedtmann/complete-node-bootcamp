import { BSON_MAJOR_VERSION } from './constants';

/** @public */
export abstract class BSONValue {
  /** @public */
  public abstract get _bsontype(): string;

  /** @internal */
  get [Symbol.for('@@mdb.bson.version')](): typeof BSON_MAJOR_VERSION {
    return BSON_MAJOR_VERSION;
  }

  /** @public */
  public abstract inspect(): string;

  /** @internal */
  abstract toExtendedJSON(): unknown;
}

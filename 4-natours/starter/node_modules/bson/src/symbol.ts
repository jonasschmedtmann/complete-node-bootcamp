import { BSONValue } from './bson_value';

/** @public */
export interface BSONSymbolExtended {
  $symbol: string;
}

/**
 * A class representation of the BSON Symbol type.
 * @public
 * @category BSONType
 */
export class BSONSymbol extends BSONValue {
  get _bsontype(): 'BSONSymbol' {
    return 'BSONSymbol';
  }

  value!: string;
  /**
   * @param value - the string representing the symbol.
   */
  constructor(value: string) {
    super();
    this.value = value;
  }

  /** Access the wrapped string value. */
  valueOf(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }

  inspect(): string {
    return `new BSONSymbol("${this.value}")`;
  }

  toJSON(): string {
    return this.value;
  }

  /** @internal */
  toExtendedJSON(): BSONSymbolExtended {
    return { $symbol: this.value };
  }

  /** @internal */
  static fromExtendedJSON(doc: BSONSymbolExtended): BSONSymbol {
    return new BSONSymbol(doc.$symbol);
  }

  /** @internal */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.inspect();
  }
}

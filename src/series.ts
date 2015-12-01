"use strict";
export namespace JSPandas {
    "use strict";
    function range(start: number, end: number, increment?: number): any[] {
        increment = increment || 1;
        let result: number[] = [];
        for(let i = start; i < end; i+=increment) {
            result.push(i);
        }
        return result;
    }

    export function isBooleanArray(a: any): a is Array<boolean> {
        return a.length > 0 && typeof a[0] === "boolean";
    }

    export function isNumberArray(a: any): a is Array<number> {
        return a.length > 0 && typeof a[0] === "number";
    }
    function toArray(x: any): any[] {
        return Array.isArray(x) ? x : [x];
    }

   function binaryOpGenerator<B>(fn: (a: number, b:number) => number): (that: Series<number,B>) => Series<number, B> {
        return function<B>(that: Series<number,B>, fill_value?: number): Series<number, B> {
            let filler = toArray(fill_value !== undefined ? fill_value : NaN);
            if(isNumberArray(this.data) && isNumberArray(that.data)) {
                let values: number[] = [];
                let indices: B[] = [];
                let both_indices_set: Set<B> = new Set(<Iterable<B>>this.index_lookup.keys())
                for(let key of that.index_lookup.keys()) {
                    both_indices_set.add(key);
                }
                let both_indices: B[] = Array.from(both_indices_set.keys());
                both_indices.sort((a,b) => a < b ? -1 : a === b ? 0 : 1);
                for(let index of both_indices) {
                    let lh_val: number[];
                    let rh_val: number[];
                    try {
                        lh_val = toArray(this.at(index));
                    } catch (ex) {
                        lh_val = filler;
                    }
                    try {
                        rh_val = toArray(that.at(index));
                    } catch (ex) {
                        rh_val = filler;
                    }
                    for(let i = 0; i < lh_val.length; i++) {
                        for(let j = 0; j < rh_val.length; j++) {
                            indices.push(index);
                            values.push(fn(lh_val[i], rh_val[j]));
                        }
                    }
                }
                return new Series(values, indices);
            }else{
                throw new Error("Binary operation attempted on non-numeric objects");
            }
        };
   }


    export class Slice<A>  {
        start: A;
        end: A;
        start_ix: number;
        end_ix: number;
        skip: number;
        constructor(start: A, end?: A, skip?: number) {
            this.start = start;
            this.end = end || null;
            this.skip = skip || 1;
            this.start_ix = Number(start) || 0; //making tsc happy
            this.end_ix = Number(end) || Infinity;
        }

        *iter(length: number) {
            length = Math.min(length, this.end_ix);
            for(let i = this.start_ix; i < length; i+=this.skip) {
                yield i;
            }
        }

        *labelIter(indices: A[], mapping: Map<A,number | Array<number>>) {
            let starting_position = mapping.get(this.start);
            if(isNumberArray(starting_position)) {
                if(Slice.isContiguous(starting_position)) {
                    this.start_ix = starting_position[0];
                }else{
                    throw new Error("Cannot get left slice bound from non-contiguous label");
                }
            }else if(typeof starting_position === "number") {
                this.start_ix = starting_position;
            }

            let ending_position = mapping.get(this.end) || indices.length;
            if(isNumberArray(ending_position)) {
                if(Slice.isContiguous(ending_position)) {
                    this.end_ix = ending_position.pop() + 1;
                }else{
                    throw new Error("Cannot get right slice bound from non-contiguous label");
                }
            }else if(typeof ending_position === "number") {
                this.end_ix = ending_position + 1;
            }

            let length = Math.min(indices.length, this.end_ix);
            for(let i = this.start_ix; i < length; i+=this.skip) {
                yield i;
            }
        }


        static isContiguous(xs: Array<number>) {
            let start: number;
            for(let i = 0; i<xs.length;i++) {
                if(i === 0) {
                    start = xs[0];
                }else if (xs[i] !== start+i){
                    return false;
                }
            }
            return true;
        }
    }

    export class Series<A, B> {
        data: Array<A>;
        data_index: Array<B>;
        index_lookup: Map<B,number | Array<number>>;
        constructor(data: Array<A>, index?: Array<B>) {
            this.data = data;
            if(index && index.length !== data.length) {
                throw new Error("Wrong number of items passed in data");
            }else if(typeof index === "undefined") {
                index = range(0, data.length);
            }
            this.data_index = index;
            this.index_lookup = new Map();
            for(let i = 0; i<index.length; i++) {
                if(this.index_lookup.has(index[i])) {
                    let lookup = this.index_lookup.get(index[i]);
                    if(typeof lookup === "number") {
                        this.index_lookup.set(index[i], [lookup,i]);
                    }else if(isNumberArray(lookup)) {
                        lookup.push(i);
                        this.index_lookup.set(index[i], lookup)
                    }
                }else{
                    this.index_lookup.set(index[i], i);
                }
            }
        }

        copy(deep: boolean) {
            if(deep) {
                return new Series(this.data.slice(), this.data_index.slice());
            }else{
                return new Series(this.data, this.data_index);
            }
        }

        isNull() {
            let values = this.data.map( val => val === null || val === undefined); 
            return new Series(values, this.data_index);
        }

        notNull() {
            let values = this.data.map( val => val !== null && val !== undefined); 
            return new Series(values, this.data_index);
        }

        at(label: B): A | Array<A> {
            if(this.index_lookup.has(label)) {
                let indices = this.index_lookup.get(label);
                if(typeof indices === "number") {
                    return this.data[indices];
                }else if(isNumberArray(indices)) {
                    let data: Array<A> = [];
                    for(let index of indices) { 
                        data.push(this.data[index]);
                    }
                    return data;
                }
            }else{
                throw new RangeError('Label index ${label} does not exist');
            }
        }

        iat(index: number) {
            return this.data[index];
        }

        *iter() {
            yield* this.data;
        }

        iloc(ixes: number | Array<number | boolean> | Slice<number>): A | Series<A,B> {
            let values: Array<A> = [];
            let indices: Array<B> = [];
            if(typeof ixes === 'number') {
                if(ixes >= 0 && ixes < this.data.length) {
                    return this.data[ixes];
                }else{
                    throw new RangeError(`Index ${ixes} does not exist`);
                }
            }else if(ixes instanceof Array) {
                let lookups: number[] = [];
                if(isBooleanArray(ixes)) {
                    for(let i = 0; i < ixes.length; i++) {
                        if(ixes[i]) {
                            lookups.push(i)
                        }
                    }
                }else if(isNumberArray(ixes)) {
                    lookups = ixes;
                }
                for(let i = 0; i < lookups.length; i++) {
                    let ix = lookups[i];
                    if(ix >=0 && ix < this.data.length) {
                        values.push(this.data[lookups[i]]);
                        indices.push(this.data_index[lookups[i]]);
                    }else{
                        throw new RangeError(`Index ${ix} does not exist`);
                    }
                }
                return new Series(values, indices);
            }else if(ixes instanceof Slice) {
                for(let ix of ixes.iter(this.data.length)) {
                    values.push(this.data[ix]);
                    indices.push(this.data_index[ix]);
                }
                return new Series(values, indices);
            }
        }


        loc(ixes: B | Array<B | boolean> | Slice<B>): A | Series<A,B> {
            let values: Array<A> = [];
            let indices: Array<B> = [];
            if(ixes instanceof Slice) {
                for(let ix of ixes.labelIter(this.data_index, this.index_lookup)) {
                    values.push(this.data[ix]);
                    indices.push(this.data_index[ix]);
                }
                return new Series(values, indices);
            }else if(ixes instanceof Array) {
                let lookups: number[] = [];
                if(isBooleanArray(ixes)) {
                    for(let i = 0; i < ixes.length; i++) {
                        if(ixes[i]) {
                            values.push(this.data[i]);
                            indices.push(this.data_index[i]);
                        }
                    }
                }else{
                    var has_valid_index = false; //handling the array of labels case
                    for(let i = 0; i < ixes.length; i++) {
                        if(this.index_lookup.has(<B>ixes[i])) {
                            has_valid_index = true;
                            let index_values = this.at(<B>ixes[i]);
                            if(index_values instanceof Array) {
                                for(let val of index_values) {
                                    values.push(val);
                                    indices.push(<B>ixes[i]);
                                }
                            }else if(typeof index_values === "number") {
                                values.push(<A>index_values);
                                indices.push(<B>ixes[i]);
                            }
                        }else{
                            values.push(undefined);
                            indices.push(<B>ixes[i]);
                        }
                    }
                    if(!has_valid_index) {
                        throw new RangeError("None of the labels ${ixes} are in the index");
                    }
                }
               return new Series(values, indices);
            }else{ 
                if (this.index_lookup.has(<B>ixes)) {
                    let lookup = this.index_lookup.get(<B>ixes);
                    if(typeof lookup === "number") {
                        return this.data[lookup];
                    }else if(isNumberArray(lookup)) {
                        for(var index of lookup) {
                            values.push(this.data[index]);
                            indices.push(ixes);
                        }
                        return new Series(values, indices);
                    }
                }else{
                    throw new RangeError(`Label index ${ixes} does not exist`);
                }
            }
        }


        *iteritems() {
            for(let i = 0; i < this.data.length; i++) {
                yield [this.data_index[i], this.data[i]];
            }
        }
    }

    export interface Series<A,B> {
        add(that: Series<A,B>, fill_value?: number): Series<A,B>;
        sub(that: Series<A,B>, fill_value?: number): Series<A,B>;
        mul(that: Series<A,B>, fill_value?: number): Series<A,B>;
        div(that: Series<A,B>, fill_value?: number): Series<A,B>;
        pow(that: Series<A,B>, fill_value?: number): Series<A,B>;
        mod(that: Series<A,B>, fill_value?: number): Series<A,B>;
        floordiv(that: Series<A,B>, fill_value?: number): Series<A,B>;
    }
    Series.prototype.add = binaryOpGenerator((a,b) => a + b);
    Series.prototype.sub = binaryOpGenerator((a,b) => a - b);
    Series.prototype.mul = binaryOpGenerator((a,b) => a * b);
    Series.prototype.div = binaryOpGenerator((a,b) => a / b);
    Series.prototype.pow = binaryOpGenerator((a,b) => Math.pow(a,b));
    Series.prototype.mod = binaryOpGenerator((a,b) => a % b);
    Series.prototype.floordiv = binaryOpGenerator((a,b) => Math.floor(a / b));
}

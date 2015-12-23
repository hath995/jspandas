/// <reference path="./series.ts" />
import {JSPandas} from './series.ts';
"use strict";
export namespace JSPandasDF {
    "use strict";
    interface SeriesDict<A, B> {
        [index: string]: JSPandas.Series<A,B>;
    }
    export class DataFrame<A, B, C> {
        data_index: Array<A>;
        data: SeriesDict<B, A>; 
        columns: string[];
        constructor(data: SeriesDict<B,A>, indices: Array<A>, columns: string[]) {
            this.data = data;
            this.data_index = indices;
            this.columns = columns;
        }
    }
}

//function zip<T, X> (array1: T[], array2: X[]): (T|X)[] {
//    let result: (X|T)[] = [];
//    for(var i = 0; i< array1.length; i++) {
//        result.push(array1[i]);
//    }
//
//
//    for(var i = 0; i< array2.length; i++) {
//        result.push(array2[i]);
//    }
//    return result;
//}
//let test = [1,2,3,4,5];
//let other = ["test","tasf"];
//let mixed = zip(test, other);
//let third = [true, false];
//let morem = zip(mixed, third);

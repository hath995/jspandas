/// <reference path="./series.ts" />
import {JSPandas} from './series';
"use strict";
export namespace JSPandasDF {
    "use strict";
    export interface SeriesDict<DataType, IndexType> {
        [index: string]: JSPandas.Series<DataType, IndexType> | Array<IndexType>;
    }

    export interface Dict<DataType> {
        [index: string]: DataType;
    }

    export type kitchensink<IndexType, DataType, DFIndexType> = Array<Array<DataType> | DataType> | DataFrame<IndexType, DataType, DFIndexType> | SeriesDict<DataType, IndexType> | JSPandas.Series<DataType, IndexType> | Dict<DataType>;


    export class DataFrame<DataType, SeriesIndexType, DFIndexType> {
        data_index: Array<DFIndexType>;
        data: any; 
        columns: string[];
        index_lookup: Map<SeriesIndexType, number | Array<number>>;
        //SeriesIndexType, A, DFIndexType
        constructor(data: kitchensink<SeriesIndexType, DataType, DFIndexType>, indices?: Array<DFIndexType>, columns?: string[]) {
            this.data = {};
            const MISSING = NaN;
            if(columns) {
                this.columns = columns;
            }
            if(indices) {
               this.data_index = indices; 
            }
            if(Array.isArray(data) ) {
                if(data.length > 0 && Array.isArray(data[0])) {
                    if(!this.columns) {
                        this.columns = JSPandas.range(0, data[0].length).map(x => x.toString());
                    }

                    if(!indices) {
                        this.data_index = JSPandas.range(0, data.length);
                    }

                    for(let i = 0; i < data[0].length; i++) {
                        var columnData: Array<DataType> = [];
                        for(let j = 0; j < data.length; j++) {
                            columnData.push(data[j][i]);
                        }
                        this.data[i] = new JSPandas.Series(columnData, this.data_index);
                    }
                }else{
                    if(!indices) {
                        this.data_index = JSPandas.range(0, data.length);
                    }
                    this.data[0] = new JSPandas.Series(data, this.data_index);
                    if(!this.columns) {
                        this.columns = ['0'];
                    }
                }
            }else if(data instanceof DataFrame) {
                this.data = data.data;
                this.data_index = data.data_index;
                this.columns = data.columns;
            }else if(data instanceof JSPandas.Series) {
                if(!this.columns) {
                    this.columns = ["0"];
                }else if(this.columns.length > 1) {
                    throw new Error("Missing columns expected");
                }
                if(!this.data_index) {
                    this.data_index = data.data_index;
                    this.data[this.columns[0]] = data;
                }else{
                    let dataArray = [];
                    for(let index of this.data_index) {
                        let val;
                        try {
                            val = data.loc(index);
                        } catch(e) {
                            val = MISSING
                        }
                        if(val instanceof JSPandas.Series) {
                            throw new Error("Cannot reindex non-unique indices");
                        }
                        dataArray.push(val);
                    }
                    this.data[this.columns[0]] = new JSPandas.Series(dataArray, this.data_index);
                }
            }
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

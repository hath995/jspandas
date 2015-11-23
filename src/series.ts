
export namespace JSPandas {
    "use strict";
    function range(start, end) {
        let result = [];
        for(let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }

    export class Series<A, B> {
        data: Array<A>;
        data_index: Array<B>;
        constructor(data: Array<A>, index?: Array<B>) {
            this.data = data;
            if(index && index.length !== data.length) {
                throw new Error("Wrong number of items passed in data");
            }else if(index === undefined) {
                index = range(0, data.length);
            }
            this.data_index = index;
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
    }
}

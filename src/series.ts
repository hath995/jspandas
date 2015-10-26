
export namespace JSPandas {
    "use strict";
    export class Series<A, B> {
        data: A;
        data_index: B;
        constructor(data: A, index?: B) {
            this.data = data;
            this.data_index = index;
        }
    }
}

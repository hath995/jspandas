/// <reference path="../typings/tsd.d.ts" />
"use strict";
import {expect} from 'chai';
import {JSPandas} from '../src/series';

describe('JSPandas.Series', () => {
    it('Should accept just an array', () => {
        let test = new JSPandas.Series([1,2,3,4]);
        expect(test.data).to.deep.equal([1,2,3,4]);
        expect(test.data_index).to.deep.equal([0,1,2,3]);
    });

    it('Should only allow indices of matching size', () => {
        expect(() => new JSPandas.Series([1],[0,2])).to.throw(Error);
        expect(() => new JSPandas.Series([1,1],[0])).to.throw(Error);
    });

    it('should copy a series', () => {
        let test = new JSPandas.Series([1,2,3,4]);
        let shallow_copy = test.copy(false);
        let deep_copy = test.copy(true);
        expect(shallow_copy.data).to.equal(test.data);
        expect(deep_copy.data).to.not.equal(test.data);
    });

    it('should create a new boolean series based on if values are null', () => {
        let test = new JSPandas.Series([null, undefined, false, true]);
        let isnull = test.isNull();
        expect(isnull.data).to.deep.equal([true, true, false, false]);
    });

    it('should create a new boolean series based on if values are not null', () => {
        let test = new JSPandas.Series([null, undefined, false, true]);
        let isnull = test.notNull();
        expect(isnull.data).to.deep.equal([false, false, true, true]);
    });

    it('should do label index lookup with at', () => {
        let test = new JSPandas.Series([1,2,3],["one","two","three"]);
        expect(test.at("three")).to.equal(3);
    });

    it('should do label index look on indexes with repetition with at', () => {
        let test = new JSPandas.Series([1,2,3],['a','b','b']);
        let result = test.at('b');

        if(JSPandas.isNumberArray(result)) {
            expect(result).to.deep.equal([2,3]);
        }else{
            throw new Error('At returned incorrect result');
        }
    });

    it('should do index lookup with iat', () => {
        let test = new JSPandas.Series([1,2,3],["one","two","three"]);
        expect(test.iat(0)).to.equal(1);
    });

    it('should iterate over values', () => {
        let data = [1,2,3];
        let test = new JSPandas.Series(data);
        let counter = 0;
        for(let val of test.iter()) {
            expect(val).to.equal(data[counter]);
            counter++;
        }
    });

    it('should iterate over values', () => {
        let data = [1,2,3];
        let indices = ["one","two","three"];
        let test = new JSPandas.Series(data, indices);
        let counter = 0;
        for(let val of test.iteritems()) {
            expect(val).to.deep.equal([indices[counter], data[counter]]);
            counter++;
        }
    });

    it('should return one value for iloc with a number', () => {
        let test = new JSPandas.Series([10,20]);
        expect(test.iloc(1)).to.equal(20);
    })

    it('should throw an error for iloc with an out of range number', () => {
        let test = new JSPandas.Series([10,20]);
        expect(() => test.iloc(4)).to.throw(RangeError);
    })

    it('should return a sliced series for iloc with a boolean array ', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = <JSPandas.Series<number,string>>test.iloc([true, false, false, true]);
        expect(result.data).to.deep.equal([1,4]);
        expect(result.data_index).to.deep.equal(['a','d']);
    });

    it('should return a sliced series for iloc with a number array ', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = <JSPandas.Series<number,string>>test.iloc([0,3]);
        expect(result.data).to.deep.equal([1,4]);
        expect(result.data_index).to.deep.equal(['a','d']);
    });

    it('should throw and error iloc with a number array with out of range index', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        expect(() => test.iloc([5])).to.throw(RangeError);
    });

    it('should return a sliced series given a slice object to iloc', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = <JSPandas.Series<number,string>>test.iloc(new JSPandas.Slice(2));
        expect(result.data).to.deep.equal([3,4]);
        expect(result.data_index).to.deep.equal(['c','d']);


        let test2 = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result2 = <JSPandas.Series<number,string>>test.iloc(new JSPandas.Slice(0,4,2));
        expect(result2.data).to.deep.equal([1,3]);
        expect(result2.data_index).to.deep.equal(['a','c']);
    })


    it('should return one value for loc with a number', () => {
        let test = new JSPandas.Series([10,20],['a','b']);
        expect(test.loc('b')).to.equal(20);
    })


    it('should return a series for loc with an index with duplicate rows', () => {
        let test = new JSPandas.Series([10,20,30],['a','b','b']);
        let result = <JSPandas.Series<number, string>>test.loc('b');
        expect(result.data).to.deep.equal([20,30]);
        expect(result.data_index).to.deep.equal(['b','b']);
    })

    it('should throw an error for loc with an out of range number', () => {
        let test = new JSPandas.Series([10,20],['a','b']);
        expect(() => test.loc('c')).to.throw(RangeError);
    })

    it('should return a sliced series for loc with a boolean array ', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = <JSPandas.Series<number,string>>test.loc([true, false, false, true]);
        expect(result.data).to.deep.equal([1,4]);
        expect(result.data_index).to.deep.equal(['a','d']);
    });

    it('should return a sliced series for loc with a label array ', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = <JSPandas.Series<number,string>>test.loc(['a','d']);
        expect(result.data).to.deep.equal([1,4]);
        expect(result.data_index).to.deep.equal(['a','d']);

        let test2 = new JSPandas.Series([1,2,3,4],['a','b','b','d']);
        let result2 = <JSPandas.Series<number,string>>test2.loc(['a','b','b']);
        expect(result2.data).to.deep.equal([1,2,3,2,3]);
        expect(result2.data_index).to.deep.equal(['a','b','b','b','b']);
    });

    it('should throw an error loc with a number array with out of range index', () => {
        let test = new JSPandas.Series([1,2,3,4,5],['a','f','e','b','f']);
        expect(() => test.loc(new JSPandas.Slice('a','f'))).to.throw(Error);

        let test2 = new JSPandas.Series([1,2,3,4,5],['a','b','a','b','f']);
        expect(() => test2.loc(new JSPandas.Slice('a','f'))).to.throw(Error);
    });

    it('should throw an for loc with noncontiguous labels', ()=>{
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        expect(() => test.loc(['f'])).to.throw(RangeError);
    })

    it('should return a sliced series given a slice object to loc', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = <JSPandas.Series<number,string>>test.loc(new JSPandas.Slice('b'));
        expect(result.data).to.deep.equal([2,3,4]);
        expect(result.data_index).to.deep.equal(['b','c','d']);


        let test2 = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result2 = <JSPandas.Series<number,string>>test2.loc(new JSPandas.Slice('a','d',2));
        expect(result2.data).to.deep.equal([1,3]);
        expect(result2.data_index).to.deep.equal(['a','c']);

        let test3 = new JSPandas.Series([1,2,3,4,5],['a','b','b','c','d']);
        let result3 = <JSPandas.Series<number,string>>test3.loc(new JSPandas.Slice('b','d'));
        expect(result3.data).to.deep.equal([2,3,4,5]);
        expect(result3.data_index).to.deep.equal(['b','b','c','d']);


        let test4 = new JSPandas.Series([1,2,3,4,5],['a','b','c','c','d']);
        let result4 = <JSPandas.Series<number,string>>test4.loc(new JSPandas.Slice('b','c'));
        expect(result4.data).to.deep.equal([2,3,4]);
        expect(result4.data_index).to.deep.equal(['b','c','c']);
    })

    it('should add two series together', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = test.add(test2);
        expect(result.data).to.deep.equal([2,4,6,8]);
        expect(result.data_index).to.deep.equal(['a','b','c','d']);
    });

    it('should add two mismatched series together', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([2,3,2,2],['b','c','b','b']);
        let result = test.add(test2);
        expect(result.data).to.deep.equal([NaN,4,4,4,6,NaN]);
        expect(result.data_index).to.deep.equal(['a','b','b','b','c','d']);
    });

    it('should add two series together, filling mismatched with NaN', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([1,2],['a','b']);
        let result = test.add(test2);
        expect(result.data).to.deep.equal([2, 4, NaN, NaN]);
        expect(result.data_index).to.deep.equal(['a','b','c','d']);
    });


    it('should add two series together, filling mismatched with 0', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([1,2,1],['a','b','e']);
        let result = test.add(test2, 0);
        expect(result.data).to.deep.equal([2, 4, 3, 4, 1]);
        expect(result.data_index).to.deep.equal(['a','b','c','d','e']);
    });

    it('should multiply two series together', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = test.mul(test2);
        expect(result.data).to.deep.equal([1,4,9,16]);
        expect(result.data_index).to.deep.equal(['a','b','c','d']);
    });

    it('should subtract two series together', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = test.sub(test2);
        expect(result.data).to.deep.equal([0,0,0,0]);
        expect(result.data_index).to.deep.equal(['a','b','c','d']);
    });

    it('should divide two series together', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = test.div(test2);
        expect(result.data).to.deep.equal([1,1,1,1]);
        expect(result.data_index).to.deep.equal(['a','b','c','d']);
    });

    it('should power two series together', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let result = test.pow(test2);
        expect(result.data).to.deep.equal([1,4,27,256]);
        expect(result.data_index).to.deep.equal(['a','b','c','d']);
    });

    it('should modulo two series together', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([2,2,2,2],['a','b','c','d']);
        let result = test.mod(test2);
        expect(result.data).to.deep.equal([1,0,1,0]);
        expect(result.data_index).to.deep.equal(['a','b','c','d']);
    });

    it('should floor two floordiv series together', () => {
        let test = new JSPandas.Series([1,2,3,4],['a','b','c','d']);
        let test2 = new JSPandas.Series([4,2,2,3],['a','b','c','d']);
        let result = test.floordiv(test2);
        expect(result.data).to.deep.equal([0,1,1,1]);
        expect(result.data_index).to.deep.equal(['a','b','c','d']);
    });

    it('should throw an error when adding non-numeric objects', () => {
        let test = new JSPandas.Series(['a','b']);
        let test2 = new JSPandas.Series(['c','d']);
        expect(() => test.add(test2)).to.throw(Error);

    });

    it('should drop specified labels', () => {
        let test = new JSPandas.Series([1,2,3,4,5],['a','b','c','a','a']);
        let result_singular = test.drop('c');
        let result_plural = test.drop(['a','c']);

        expect(result_singular.data).to.deep.equal([1,2,4,5]);
        expect(result_singular.data_index).to.deep.equal(['a','b','a','a']);


        expect(result_plural.data).to.deep.equal([2]);
        expect(result_plural.data_index).to.deep.equal(['b']);
    })

    it('should have head return n items', () => {
        let test = new JSPandas.Series([1,2,3,4,5],['a','b','c','a','a']);
        let result = test.head(3);
        expect(result.data).to.deep.equal([1,2,3]);
        expect(result.data_index).to.deep.equal(['a','b','c']);
    });

});

describe('Slice', () => {
    it('should identify arrays of contiguous numbers', () => {
        let test = [2,3,4,5];
        expect(JSPandas.Slice.isContiguous(test)).to.be.true;
    });


    it('should identify arrays of non-contiguous numbers', () => {
        let test = [2,4,5];
        expect(JSPandas.Slice.isContiguous(test)).to.be.false;
    });
});



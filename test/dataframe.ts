/// <reference path="../typings/tsd.d.ts" />
"use strict";
import {expect} from 'chai';
import {JSPandas} from '../src/series';
import {JSPandasDF} from '../src/dataframe';
let Series = JSPandas.Series;
describe('JSPandas.DataFrame', () => {
    it("Should accept just an array", () => {
        let test = new JSPandasDF.DataFrame([1,2,3,4]);
        expect(test.data[0]).to.deep.equal(new Series([1,2,3,4]));
        expect(test.data_index).to.deep.equal([0,1,2,3]);
        expect(test.columns).to.deep.equal(['0']);
    });

    it("Should accept just an array of arrays", () => {
        let test = new JSPandasDF.DataFrame([[1,2,3,4]]);
        for(let i = 0; i < 4; i++) {
            expect(test.data[i]).to.deep.equal(new Series([i+1]));
        }
        expect(test.data_index).to.deep.equal([0]);
        expect(test.columns).to.deep.equal(['0','1','2','3']);
    });

    it("Should accept an object prop arrays", () => {
        let test = new JSPandasDF.DataFrame({'a':[1,2],'b':[3,4]});
        expect(test.data.a).to.deep.equal(new Series([1,2]));
        expect(test.data.b).to.deep.equal(new Series([3,4]));
        expect(test.data_index).to.deep.equal([0,1]);
        expect(test.columns).to.deep.equal(['a','b']);
    })

    it("Should accept an object prop arrays with an index", () => {
        let test = new JSPandasDF.DataFrame({'a':[1,2],'b':[3,4]}, ['c','d']);
        expect(test.data.a).to.deep.equal(new Series([1,2],['c','d']));
        expect(test.data.b).to.deep.equal(new Series([3,4],['c','d']));
        expect(test.data_index).to.deep.equal(['c','d']);
        expect(test.columns).to.deep.equal(['a','b']);
    })

    it("Should accept an object prop arrays with an index and columns", () => {
        let test = new JSPandasDF.DataFrame({'a':[1,2],'b':[3,4]}, ['c','d'], ['b','a']);
        expect(test.data.a).to.deep.equal(new Series([1,2],['c','d']));
        expect(test.data.b).to.deep.equal(new Series([3,4],['c','d']));
        expect(test.data_index).to.deep.equal(['c','d']);
        expect(test.columns).to.deep.equal(['b','a']);
    })

    it("Should accept an object prop scalar with an index and columns", () => {
        let test = new JSPandasDF.DataFrame({'a':true,'b':false}, [0, 1], ['a','b','c']);
        expect(test.data.a).to.deep.equal(new Series([true, true],[0, 1]));
        expect(test.data.b).to.deep.equal(new Series([false, false],[0, 1]));
        expect(test.data.c).to.deep.equal(new Series([NaN, NaN],[0, 1]));
        expect(test.data_index).to.deep.equal([0,1]);
        expect(test.columns).to.deep.equal(['a','b','c']);
    })

    it("Should accept a series", () => {
        let test = new JSPandasDF.DataFrame(new Series([1,2,3],['a','a','c']));
        expect(test.data.a).to.deep.equal(new Series([1,2,3],['a','a','c']));
        expect(test.data_index).to.deep.equal(['a','a','c']);
        expect(test.columns).to.deep.equal(['0']);
    })

    it("should accept objects with series", () => {
        let left = new Series([1,2,3]);
        let right = new Series([4,5,6]);
        let test = new JSPandasDF.DataFrame({"a": left, "b": right});
        expect(test.data.a).to.deep.equal(new Series([1,2,3]));
        expect(test.data.b).to.deep.equal(new Series([3,4,5]));
        expect(test.data_index).to.deep.equal([0,1,2]);
        expect(test.columns).to.deep.equal(['a','b']);
    })

    it("should accept objects with series with unique series indexes and non-unique df indexes", () => {
        let left = new Series([1,2,3]);
        let right = new Series([4,5,6]);
        let test = new JSPandasDF.DataFrame({"a": left, "b": right},['a','a','b']);
        expect(test.data.a).to.deep.equal(new Series([1,2,3],['a','a','b']));
        expect(test.data.b).to.deep.equal(new Series([3,4,5],['a','a','b']));
        expect(test.data_index).to.deep.equal(['a','a','b']);
        expect(test.columns).to.deep.equal(['a','b']);
    })

    it("Should accept duplicate indices", () => {
        let test = new JSPandasDF.DataFrame({'a':[1,2,3],'b':[3,4,5]}, ['c','c','d']);
        expect(test.data.a).to.deep.equal(new Series([1,2,3],['c','c','d']));
        expect(test.data.b).to.deep.equal(new Series([3,4,5],['c','c','d']));
        expect(test.data_index).to.deep.equal(['c','c','d']);
        expect(test.columns).to.deep.equal(['a','b']);
    })

    it("Should make a shallow copy", () => {
         
        let test = new JSPandasDF.DataFrame({'a':[1,2],'b':[3,4]}, ['c','d'], ['b','a']);
        let test2 = new JSPandasDF.DataFrame(test);
        expect(test2.data.a).to.deep.equal(test.data.a);
        expect(test2.data.b).to.deep.equal(test.data.b);
        expect(test2.data_index).to.deep.equal(test.data_index);
        expect(test2.columns).to.deep.equal(test.columns);
    });

    it("should throw an error if it is given series with non-unique indexes", () => {
        let left = new Series([1,2,3],['a','a','b']);
        let right = new Series([4,5,6],['a','a','b']);
        expect(() => new JSPandasDF.DataFrame({'a': left,'b': right})).to.throw(Error);
    })

    it('Should throw an error if index lengths or data array lengths do not match', () => {
        expect(() => new JSPandasDF.DataFrame({'a':[1],'b':[2,3]})).to.throw(Error);
        expect(() => new JSPandasDF.DataFrame({'a':[1]},['c','d'])).to.throw(Error);
    })

    it('Should throw an error if given scalars with no index', () => {
        expect(() => new JSPandasDF.DataFrame({'a': true})).to.throw(Error);
    });
});

/// <reference path="../typings/tsd.d.ts" />
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
});




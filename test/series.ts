/// <reference path="../typings/tsd.d.ts" />
import {expect} from 'chai';
import {JSPandas} from '../src/series';

describe('JSPandas.Series', () => {
    it('Should accept just an array', () => {
        let test = new JSPandas.Series([1,2,3,4]);
        expect(test.data).to.deep.equal([1,2,3,4]);
    });
});




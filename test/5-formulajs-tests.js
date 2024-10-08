const formulajs = require('@formulajs/formulajs');
const XLSX_CALC = require("../src");
const assert = require('assert');

describe('formulajs integration', function() {
    describe('XLSX_CALC.import_functions()', function() {
        it('imports the functions from formulajs', function() {
            XLSX_CALC.import_functions(formulajs);
            var workbook = {};
            workbook.Sheets = {};
            workbook.Sheets.Sheet1 = {};
            workbook.Sheets.Sheet1.A1 = {v: 2};
            workbook.Sheets.Sheet1.A2 = {v: 4};
            workbook.Sheets.Sheet1.A3 = {v: 8};
            workbook.Sheets.Sheet1.A4 = {v: 16};
            workbook.Sheets.Sheet1.A5 = {f: 'AVERAGEIF(A1:A4,">5")'};
            XLSX_CALC(workbook);
            assert.strictEqual(workbook.Sheets.Sheet1.A5.v, 12);
        });
        it('imports the functions with dot names like BETA.DIST', function() {
            XLSX_CALC.import_functions(formulajs);
            var workbook = {Sheets: {Sheet1: {}}};
            workbook.Sheets.Sheet1.A5 = {f: 'BETA.DIST(2, 8, 10, true, 1, 3)'};
            XLSX_CALC(workbook);
            assert.strictEqual(workbook.Sheets.Sheet1.A5.v.toFixed(10), (0.6854705810117458).toFixed(10));
        });
        it('doesn\'t import functions that are already explicitely defined in XLSX_CALC', function () {
            XLSX_CALC.xlsx_Fx.TRUNC = function () { return '' };
            XLSX_CALC.import_functions(formulajs);
            assert.strictEqual(XLSX_CALC.xlsx_Fx.TRUNC === formulajs.TRUNC, false);
            XLSX_CALC.import_functions(formulajs, { override: true });
            assert.strictEqual(XLSX_CALC.xlsx_Fx.TRUNC === formulajs.TRUNC, true);
        });
    });
    describe('UserFnExecutor()', function() {
        it('handles error that is returned instead of thrown', function() {
            XLSX_CALC.import_functions(formulajs);
            var workbook = {};
            workbook.Sheets = {};
            workbook.Sheets.Sheet1 = {};
            workbook.Sheets.Sheet1.A2 = {f: 'AVERAGE(A1)'};
            XLSX_CALC(workbook);
            assert.strictEqual(workbook.Sheets.Sheet1.A2.w, '#DIV/0!');
        });
        it('handles range that contains error', function () {
            XLSX_CALC.import_functions(formulajs);
            var workbook = {};
            workbook.Sheets = {};
            workbook.Sheets.Sheet1 = {};
            workbook.Sheets.Sheet1.A2 = {f: 'AVERAGE(A1)'};
            workbook.Sheets.Sheet1.A3 = {f: 'INDEX(A1:A2, 2, 0)'};
            XLSX_CALC(workbook);
            assert.strictEqual(workbook.Sheets.Sheet1.A3.w, '#DIV/0!');
        });
    })
});

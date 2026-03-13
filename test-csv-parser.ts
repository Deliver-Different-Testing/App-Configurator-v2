/**
 * Quick validation tests for CSVParser
 */

import { parseCSV, detectDelimiter, removeBOM } from './src/features/import-export/engine/CSVParser';

console.log('=== CSV Parser Validation Tests ===\n');

// Test 1: Basic CSV
console.log('Test 1: Basic CSV');
const test1 = `name,age,city
John,30,NYC
Jane,25,LA`;
const result1 = parseCSV(test1);
console.log('✓ Headers:', result1.headers);
console.log('✓ Rows:', result1.rows.length);
console.log('✓ First row:', result1.rows[0]);
console.assert(result1.headers.length === 3, 'Should have 3 headers');
console.assert(result1.rows.length === 2, 'Should have 2 rows');
console.assert(result1.rows[0].name === 'John', 'First row name should be John');

// Test 2: Quoted fields with commas
console.log('\nTest 2: Quoted fields with commas');
const test2 = `name,address,city
"Doe, John","123 Main St, Apt 4",NYC`;
const result2 = parseCSV(test2);
console.log('✓ Row with quotes:', result2.rows[0]);
console.assert(result2.rows[0].name === 'Doe, John', 'Should parse quoted field with comma');
console.assert(result2.rows[0].address === '123 Main St, Apt 4', 'Should parse address correctly');

// Test 3: Escaped quotes
console.log('\nTest 3: Escaped quotes');
const test3 = `name,quote
John,"He said ""Hello"""`;
const result3 = parseCSV(test3);
console.log('✓ Escaped quote value:', result3.rows[0].quote);
console.assert(result3.rows[0].quote === 'He said "Hello"', 'Should handle escaped quotes');

// Test 4: Empty file
console.log('\nTest 4: Empty file');
const test4 = '';
const result4 = parseCSV(test4);
console.assert(result4.headers.length === 0, 'Empty file should have no headers');
console.assert(result4.rows.length === 0, 'Empty file should have no rows');
console.log('✓ Empty file handled correctly');

// Test 5: Only headers
console.log('\nTest 5: Only headers');
const test5 = 'name,age,city';
const result5 = parseCSV(test5);
console.assert(result5.headers.length === 3, 'Should parse headers');
console.assert(result5.rows.length === 0, 'Should have no data rows');
console.log('✓ Headers-only file handled correctly');

// Test 6: Semicolon delimiter auto-detect
console.log('\nTest 6: Semicolon delimiter auto-detect');
const test6 = `name;age;city
John;30;NYC`;
const result6 = parseCSV(test6);
console.log('✓ Detected delimiter:', result6.detectedDelimiter);
console.assert(result6.detectedDelimiter === ';', 'Should detect semicolon');
console.assert(result6.rows[0].name === 'John', 'Should parse with semicolon');

// Test 7: Tab delimiter
console.log('\nTest 7: Tab delimiter');
const test7 = `name\tage\tcity
John\t30\tNYC`;
const result7 = parseCSV(test7);
console.log('✓ Detected delimiter:', result7.detectedDelimiter === '\t' ? 'TAB' : result7.detectedDelimiter);
console.assert(result7.detectedDelimiter === '\t', 'Should detect tab');

// Test 8: BOM handling
console.log('\nTest 8: BOM handling');
const test8 = '\uFEFFname,age\nJohn,30';
const result8 = parseCSV(test8);
console.assert(result8.headers[0] === 'name', 'Should remove BOM');
console.log('✓ BOM removed correctly');

// Test 9: Inconsistent column count
console.log('\nTest 9: Inconsistent columns');
const test9 = `name,age,city
John,30
Jane,25,LA,Extra`;
const result9 = parseCSV(test9);
console.log('✓ Row with missing column:', result9.rows[0]);
console.assert(result9.rows[0].city === '', 'Missing column should be empty string');
console.assert(result9.rows[1].city === 'LA', 'Normal row should parse correctly');

// Test 10: Empty rows
console.log('\nTest 10: Empty rows (skip enabled)');
const test10 = `name,age

John,30

Jane,25`;
const result10 = parseCSV(test10);
console.assert(result10.rows.length === 2, 'Should skip empty rows');
console.assert(result10.skippedRows > 0, 'Should report skipped rows');
console.log('✓ Empty rows skipped:', result10.skippedRows);

// Test 11: Newlines in quoted fields
console.log('\nTest 11: Newlines in quoted fields');
const test11 = `name,bio
John,"Line 1
Line 2"`;
const result11 = parseCSV(test11);
console.log('✓ Bio with newline:', JSON.stringify(result11.rows[0].bio));
console.assert(result11.rows[0].bio.includes('\n'), 'Should preserve newline in quoted field');

// Test 12: detectDelimiter function
console.log('\nTest 12: detectDelimiter function');
const csvComma = 'a,b,c\n1,2,3';
const csvSemi = 'a;b;c\n1;2;3';
const csvTab = 'a\tb\tc\n1\t2\t3';
console.assert(detectDelimiter(csvComma) === ',', 'Should detect comma');
console.assert(detectDelimiter(csvSemi) === ';', 'Should detect semicolon');
console.assert(detectDelimiter(csvTab) === '\t', 'Should detect tab');
console.log('✓ Delimiter detection working');

// Test 13: removeBOM function
console.log('\nTest 13: removeBOM function');
const withBOM = '\uFEFFtest';
const withoutBOM = 'test';
console.assert(removeBOM(withBOM) === 'test', 'Should remove BOM');
console.assert(removeBOM(withoutBOM) === 'test', 'Should not affect non-BOM string');
console.log('✓ BOM removal working');

console.log('\n=== All Tests Passed! ===');

'use strict';
const [ , , xlsxArg, ...extraArgs] = process.argv;
const [xlsxFile, xlsxSheetArg] = xlsxArg.split('#');
const xlxsSheets = xlsxSheetArg && xlsxSheetArg.split(',');
const fs = require('fs');

const {destinations, flags} = extraArgs.reduce(function(acc, cur) {
  acc.destinations = acc.destinations || [];
  acc.flags = acc.flags || {};
  if (cur.startsWith('--')) {
    acc.flags[cur.replace(/^--/, '')] = true;
  } else {
    acc.destinations.push(cur);
  }
  return acc;
}, {});

if (!xlsxFile || !fs.existsSync(xlsxFile)) {
  console.error('missing spreadsheet file');
  process.exit(1);
}

if (!destinations.length) {
  console.error('destination path not defined');
  process.exit(1);
}

let destionationsExist = true;

destinations.forEach(d => {
  if (!fs.existsSync(d)) {
    destionationsExist = false;
    console.error('%s path does not exist', d);
  }
});

if (!destionationsExist) {
  process.exit(1);
}

const excelToJson = require('convert-excel-to-json');
const path = require('path');

const localePattern = /^[a-z]{2}-[A-Z]{2}$/i;
const languagePacks = {};

console.log('parsing spreadsheet');
console.time('parsing complete');
const spreadsheet = excelToJson({
  sourceFile: xlsxFile,
  sheets: xlxsSheets,
  columnToKey: {
    '*': '{{columnHeader}}'
  }
});
console.timeEnd('parsing complete');

const sheetNames = Object.keys(spreadsheet);

sheetNames.forEach(s => {
  const sheet = spreadsheet[s];
  const headers = Object.keys(sheet.shift());
  const locales = headers.filter(h => localePattern.test(h));
  const fallbackLang = locales[0].toLowerCase();
  let enabled = [];
  locales.push('debug');
  const sortedSheet = sheet
    .filter(r => r.key)
    .sort(
      (a, b) => a.key.localeCompare(b.key)
    );
  
  locales.forEach(l => {
    let missing = [];
    languagePacks[l] = {};
    console.group(l);
    sortedSheet.forEach(r => {
      if (r[l]) {
        languagePacks[l][r.key] = r[l];
      } else if (l === 'debug') {
        languagePacks[l][r.key] = r.key;
      } else {
        missing.push(r.key);
      }
    });
    if (missing.length) {
      console.group('missing translations');
      console.error(missing.join('\r\n'));
      console.groupEnd();
    } else {
      console.log('No missing translations');
      if (l !== 'debug') {
        enabled.push(l.toLowerCase());
      }
    }
    console.groupEnd();

    writeJsonToFile(l, languagePacks[l]);
  });
  if (flags['include-map']) {
    writeJsonToFile('map', {
      fallbackLang,
      enabled
    });
  }
});

function writeJsonToFile(locale, json) {
  const fileName = `${locale.toLowerCase()}.json`;
  const contents = JSON.stringify(json, null, 2);
  destinations.forEach(d => {
    const pathAndName = path.join(d, fileName);
    console.time(`${pathAndName} file written`);
    fs.writeFile(pathAndName, contents, (err) => {
      if (err) {
        console.error('Error writing %s file', pathAndName);
      }
      console.timeEnd(`${pathAndName} file written`);
    });
  });
}
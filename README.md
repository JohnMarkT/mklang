# mklang
Make language pack JSON file from properly formatted Excel spreadsheet

## Install
Since this app is not currently hosted in a package directly, you will need to include the path to this directory.
```
npm install -g ./<path-to-files>/mklang
```

## Expectations / Limitations
This is a very simple app to help streamline the conversion process, and therefore, there are some expectations and limitations:
1. The spreadsheet needs columns with a header with:
    1. "key"
    1. at least one locale code (i.e., "en-GB")
1. All columns with content need a header. This is a requirement of the main dependency, [convert-excel-to-json](https://www.npmjs.com/package/convert-excel-to-json). Without it convert-excel-to-json throws an error.
1. If the spreadsheet contains multiple sheets, it's recommended to convert one sheet at a time. Otherwise, the last sheet may overwrite language packs generated from preceding sheets. See below for an example.
1. The destination path needs to exist before attempting the conversion. This does not auto-generate the destination folder for you.

## Examples
You need to provide at least a spreadsheet file and destination directory:
```
mklang Spreadsheet.xlsx export-path/
```

To specify a single sheet within the spreadsheet, add it to the filename with a # delimiter:
```
mklang Spreadsheet.xlsx#Sheet1 export-path/
```

Multiple sheets and destination paths are also supported. Separate sheet names with a comma, and destinations with a space:
```
mklang Spreadsheet.xlsx#Sheet1,Sheet2 export-path/sub-1/ export-path/sub-2/
```
_**Warning:**_ attempting to convert multiple sheets at once is discouraged. The last sheet may overwrite language packs generated from preceding sheets.
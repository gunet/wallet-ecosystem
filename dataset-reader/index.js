const XLSX = require('xlsx');
const fs = require('fs');



function parsePidData(filePath) {
  const readOpts = { // <--- need these settings in readFile options
    cellText: false, 
    cellDates: true,
    type: 'buffer'
  };
  const fileBuffer = fs.readFileSync(filePath);

  // Parse the workbook
  const workbook = XLSX.read(fileBuffer, readOpts);
  const sheetName = "PID"
  // Get the first worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to JSON format
  const data = XLSX.utils.sheet_to_json(worksheet, {
    defval: undefined,
    dateNF: 'd"/"m"/"yyyy'
    // skipHidden: true,
    // header: 0
  });

  const headers = Object.values(data[0]).map((h) => h.trim());
  const ncols = Object.keys(headers);

  const result = data.slice(1).map(row => {
    row = Object.values(row)
    const obj = {};
    row.map((cell, index) => {
      obj[headers[index]] = cell;  // Assign key-value pairs
    });

    return obj;
  });

  return result;
}

function parseEhicData(filePath) {
  const readOpts = { // <--- need these settings in readFile options
    cellText: false, 
    cellDates: true,
    type: 'buffer'
  };
  const fileBuffer = fs.readFileSync(filePath);

  // Parse the workbook
  const workbook = XLSX.read(fileBuffer, readOpts);
  const sheetName = "EHIC"
  // Get the first worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to JSON format
  const data = XLSX.utils.sheet_to_json(worksheet, {
    defval: undefined,
    dateNF: 'd"/"m"/"yyyy'
    // skipHidden: true,
    // header: 0
  });
  return data;
}


function parsePda1Data(filePath) {
  const readOpts = { // <--- need these settings in readFile options
    cellText: false, 
    cellDates: true,
    type: 'buffer'
  };
  const fileBuffer = fs.readFileSync(filePath);

  // Parse the workbook
  const workbook = XLSX.read(fileBuffer, readOpts);
  const sheetName = "PDA1"
  // Get the first worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to JSON format
  const data = XLSX.utils.sheet_to_json(worksheet, {
    defval: undefined,
    dateNF: 'd"/"m"/"yyyy'
    // skipHidden: true,
    // header: 0
  });

  let headers = Object.values(data[0]).map((h) => h.trim());

  const ncols = Object.keys(headers);


  const result = data.slice(1).map(row => {
    row = Object.values(row)

    const obj = {};
    row.forEach((cell, index) => {
      obj[headers[index]] = cell;  // Assign key-value pairs
    });
    return obj;
  });

  return result;
}

module.exports = {
	parsePidData,
	parseEhicData,
	parsePda1Data
}
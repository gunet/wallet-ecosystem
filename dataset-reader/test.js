const { parsePda1Data, parseEhicData, parsePidData } = require('.')


const res = parsePda1Data('./dataset.xlsx')

console.log("Res = ", res[0])

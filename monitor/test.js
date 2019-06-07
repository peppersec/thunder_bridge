const config = (process.argv.length>=3) ? process.argv[process.argv.length-2] : undefined;
const prefix = (process.argv.length>1) ? process.argv[process.argv.length-1] : "";
console.log([config, prefix, process.argv.length]);
console.log(JSON.stringify(process.argv));

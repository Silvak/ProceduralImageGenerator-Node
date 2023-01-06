const basePath = process.cwd();
const os = require("os");
const cluster = require("cluster");
const { generateNFTs } = require(`${basePath}/generator.js`);

//hilos logicos del procesador a usar
const numCPUs = 1; //os.cpus().length;

//DIRECTORIOS
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;

const quantity = 100; //<<<<<<<<<<< cantidad de NFTs <<<<<<<<<<<<<<<

//---------------------------App-------------------------------
(() => {
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    generateNFTs(quantity, layersDir, buildDir, numCPUs);
  }
})();

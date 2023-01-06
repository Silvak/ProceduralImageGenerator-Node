const { spawn } = require("child_process");
const readLineSync = require("readline-sync");

//----------------------------MSG CONSOLA---------------------------------
console.clear();
console.log(`\nGENERADOR NFT
__________________________________
|  1 = Config Capas y Carpetas   |
|  2 = Genrar coleccion          |
|  3 = Chequear duplicados       |
|  4 = Salir                     |
|________________________________|
\n`);

let userRes = readLineSync.question("Selecciona la opcion: ");

//-------------------------------MENU-------------------------------------
switch (userRes) {
  //
  case "1":
    console.clear();
    console.log("CONFIG CAPAS Y CARPETAS\n");

    const config = spawn("node", ["buildSetup.js"]);
    config.stdout.on("data", (data) => {
      //console.log(`>>${data}`);
      process.stdout.write(">> " + data);
    });
    setTimeout(() => {}, 6000);
    break;

  //
  case "2":
    console.clear();
    console.log("GENERAR \n");

    const generated = spawn("node", ["app.js"]);
    generated.stdout.on("data", (data) => {
      //console.log(`>>${data}`);
      process.stdout.write(">> " + data);
    });
    setTimeout(() => {}, 6000);
    break;

  //
  case "3":
    console.clear();
    console.log("CHECK \n");
    const check = spawn("node", ["check.js"]);
    check.stdout.on("data", (data2) => {
      //console.log(`>>${data}`);
      process.stdout.write(">> " + data2);
    });
    setTimeout(() => {}, 6000);
    break;

  //
  case "4":
    console.clear();
    console.log("Saliendo... \n");
    setTimeout(() => {
      process.exit();
    }, 2200);
    break;

  //
  default:
    console.clear();
    console.log("Opción no valida \n");
    setTimeout(() => {
      process.exit();
    }, 2900);
    break;
}

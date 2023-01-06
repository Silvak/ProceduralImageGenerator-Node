const fs = require("fs");

//DIRECTORIOS -----------------------
const basePath = process.cwd();
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;

//-------------------------------------------------------CONFIG FOLDERS--------------------------------------------------------------
const buildSetup = () => {
  `Verificamos carpetas y directorios eliminamos archivos de /build si ya existe`;

  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true }); //<< next version of node {recursve: true} deprecation
  }
  try {
    fs.mkdirSync(buildDir);
    fs.mkdirSync(`${buildDir}/json`);
    fs.mkdirSync(`${buildDir}/images`);
    fs.writeFileSync(`${buildDir}/_metadata.txt`, JSON.stringify(0));
    console.log(
      "Se configuraron las Carpetas: ( images, json ) correctamente."
    );
  } catch (error) {
    console.log("Ocurrio un error al configurar Carpetas.");
  }

  configLayers();
};

//-------------------------------------------------------CONFIG JSON--------------------------------------------------------------
const configLayers = () => {
  `configuracion de las capas,conteo de sprites y administracion de direcciones`;

  let obj = {};

  if (fs.existsSync(`${layersDir}/content.json`)) {
    fs.rmSync(layersDir + "/content.json", { recursive: true });
  }

  try {
    let layerList = fs.readdirSync(layersDir);
    obj.layers = sortLayers(layerList);

    fs.writeFileSync(layersDir + "/content.json", JSON.stringify(obj));
    console.log("Se configuraron las Capas en ( content.json ) correctamente.");
  } catch (error) {
    console.log("Ocurrio un error al configurar Capas.");
  }
};

//-----------------------------------------------------ORDER LAYERS-------------------------------------------------------------
const sortLayers = (layerList) => {
  let layers = [];
  layerList.forEach((folderName) => {
    if (!folderName.split(".")[1]) {
      let fileList = fs.readdirSync(`${layersDir}/${folderName}`);
      let newList = [];

      fileList.forEach((fileName) => {
        if (fileName.split(".")[1] == "png") {
          newList.push({
            name: fileName.split(".")[0],
            file: `${folderName}/${fileName}`,
            weight: 1,
          });
        } else {
          console.log("El archivo no es un .png");
        }
      });

      //
      let newObj = {
        name: folderName,
        probability: 1.0,
        options: newList,
      };
      layers.push(newObj);
    }
  });
  return layers;
};

buildSetup();

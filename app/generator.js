const fs = require("fs");
const path = require("path");
const sha1 = require("sha1");
const cluster = require("cluster");
const mergeImages = require("merge-images");
const { Canvas, Image } = require("canvas");
const { MersenneTwister19937, bool, real } = require("random-js");

//DIRECTORIOS -----------------------
const basePath = process.cwd();
const buildDir = `${basePath}/build`;

//------------------------------------------------------Check DNA---------------------------------------------------------------
const checkDna = (dna1) => {
  let dnaVar = sha1(dna1);
  const dnaData = fs.readFileSync(`${buildDir}/_metadata.txt`, "utf8");
  let dnaDataList = dnaData.split(",");
  let checkDna = dnaDataList.find((element) => element == dnaVar);
  if (checkDna != undefined) {
    return true;
  } else {
    return false;
  }
};

//------------------------------------------------------GENERATIVE MAIN APP---------------------------------------------------------------
async function generateNFTs(num, layersPath, outputPath, numCPUs) {
  const content = require(layersPath + "/content.json"); //content
  let generated = new Set();

  for (let tokenId = 0; tokenId < num; tokenId++) {
    if (tokenId % numCPUs === cluster.worker.id - 1) {
      console.log(`Generando NFT #${tokenId}, worker[${cluster.worker.id}] …`);

      let selection = randomlySelectLayers(layersPath, content.layers);
      const traitsStr = JSON.stringify(selection.selectedTraits);

      //generated.has(traitsStr)
      if (checkDna(traitsStr) || generated.has(traitsStr)) {
        console.log("Duplicado detectado. Reintentado …");
        tokenId--;
        continue;
      } else {
        //image
        generated.add(traitsStr);
        await mergeLayersAndSave(
          selection.images,
          path.join(outputPath + "/images", `${tokenId}.png`)
        );

        //JSON
        let metadata = generateMetadata(tokenId, selection.selectedTraits);
        //add _metadata hash
        fs.appendFileSync(
          `${outputPath}/_metadata.text`,
          "," + metadata.dna,
          (err) => {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
          }
        );
        //create json file
        fs.writeFileSync(
          path.join(outputPath + "/json", `${tokenId}.json`),
          JSON.stringify(metadata)
        );
      }
    }
  }

  //process.exit();
}

//------------------------------------------------------GENERATED METADATA--------------------------------------------------------------
function generateMetadata(tokenId, traits) {
  attributes = [];
  for (const [trait_type, value] of Object.entries(traits)) {
    attributes.push({ trait_type, value });
  }

  let dna = {};
  attributes.forEach((element) => {
    dna[element.trait_type] = element.value;
  });

  //metadata <<<<<<<<<<<<<  <<<<<<< config
  return {
    image: "<%IMAGE_URL%>",
    //name: `NFT #${tokenId}`,
    dna: sha1(JSON.stringify(dna)),
    external_url: "https://",
    description: "nft",
    attributes: attributes,
  };
}

//----------------------------------------------------RANDOM SELECTE LAYERS-------------------------------------------------------------
function randomlySelectLayers(layersPath, layers) {
  const mt = MersenneTwister19937.autoSeed();
  let images = [];
  let selectedTraits = {};

  for (const layer of layers) {
    if (bool(layer.probability)(mt)) {
      let selected = pickWeighted(mt, layer.options);
      selectedTraits[layer.name] = selected.name;
      images.push(path.join(layersPath, selected.file));
    }
  }

  return {
    images,
    selectedTraits,
  };
}

function pickWeighted(mt, options) {
  const weightSum = options.reduce((acc, option) => {
    return acc + (option.weight ? option.weight : 1.0); //(option.weight ?? 1.0);
  }, 0);

  const r = real(0.0, weightSum, false)(mt);

  let summedWeight = 0.0;
  for (const option of options) {
    summedWeight += option.weight ? option.weight : 1.0; // option.weight ?? 1.0;
    if (r <= summedWeight) {
      return option;
    }
  }
}

//----------------------------------------------------MERGE AND SAVE IMAGES-------------------------------------------------------------
async function mergeLayersAndSave(layers, outputFile) {
  const image = await mergeImages(layers, { Canvas: Canvas, Image: Image });
  saveBase64Image(image, outputFile);
}

function saveBase64Image(base64PngImage, filename) {
  let base64 = base64PngImage.split(",")[1];
  let imageBuffer = Buffer.from(base64, "base64");
  fs.writeFileSync(filename, imageBuffer);
}

// export main modules
module.exports = { generateNFTs };

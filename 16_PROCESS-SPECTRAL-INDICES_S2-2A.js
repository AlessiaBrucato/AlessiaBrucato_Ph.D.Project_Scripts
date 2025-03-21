// -----------------------------------------------------------------------------------------
// SET UP: REPOSITORIES, AREA OF INTEREST, ZOOM, DATASET AND FILTERS FOR CLOUD COVER REDUCTION
// -----------------------------------------------------------------------------------------
// Select the satellite repositories for this job. In this case the Sentinel2-2A and the linked
// Cloud Cover Probability dataset

var s2Sr = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED"),
    s2Clouds = ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY");

// Create a polygon of the area of interest and copy/paste the couple of coordinates of each vertex
// in the geometry variable.

var geometry = /* color: #ffffff */ee.Geometry.Polygon(
        [[[POLYGON VERTEX 1 COORDINATE 1, POLYGON VERTEX 1 COORDINATE 2],
          [POLYGON VERTEX 2 COORDINATE 1, POLYGON VERTEX 2 COORDINATE 2],
          [POLYGON VERTEX 3 COORDINATE 1, POLYGON VERTEX 3 COORDINATE 2],
          [POLYGON VERTEX 4 COORDINATE 1, POLYGON VERTEX 4 COORDINATE 2]
          ]]);

    
// Set the visualization and zoom center.
 
Map.setCenter(COORDINATE 1, COORDINATE 1, ZOOM LEVEL);

// Select the recording time frame of Sentinel2-2A and the cloud probability %

var START_DATE = ee.Date('YEAR-MONTH-DAY');
var END_DATE = ee.Date('YEAR-MONTH-DAY');
var MAX_CLOUD_PROBABILITY = 65;
var region = geometry

function maskClouds(img) {
  var clouds = ee.Image(img.get('cloud_mask')).select('probability');
  var isNotCloud = clouds.lt(MAX_CLOUD_PROBABILITY);
  return img.updateMask(isNotCloud);
}

// The masks for the 10m bands sometimes do not exclude bad data at
// scene edges, so we apply masks from the 20m and 60m bands as well.
// Example asset that needs this operation:
// COPERNICUS/S2_CLOUD_PROBABILITY/20190301T000239_20190301T000238_T55GDP

function maskEdges(s2_img) {
  return s2_img.updateMask(
      s2_img.select('B8A').mask().updateMask(s2_img.select('B9').mask()));
}

// Filter input collections by desired data range and region.

var criteria = ee.Filter.and(
    ee.Filter.bounds(region), ee.Filter.date(START_DATE, END_DATE));
s2Sr = s2Sr.filter(criteria).map(maskEdges);
s2Clouds = s2Clouds.filter(criteria);

// Join S2 SR with cloud probability dataset to add cloud mask.

var s2SrWithCloudMask = ee.Join.saveFirst('cloud_mask').apply({
  primary: s2Sr,
  secondary: s2Clouds,
  condition:
      ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
});

var s2CloudMasked =
    ee.ImageCollection(s2SrWithCloudMask).map(maskClouds).median();
var rgbVis = {min: 0, max: 3000, bands: ['B4', 'B3', 'B2']};

Map.addLayer(
    s2CloudMasked, rgbVis, 'S2 SR masked at ' + MAX_CLOUD_PROBABILITY + '%',
    true);



// -----------------------------------------------------------------------------------------
// CREATE VARIABLES FOR THE SENTINE2-2A SPECTRAL BANDS
// -----------------------------------------------------------------------------------------

// if there are more datasets, name the bands differently and change the datsets.select()

var aer = s2CloudMasked.select('B1');
var blue = s2CloudMasked.select('B2');
var green = s2CloudMasked.select('B3');
var red = s2CloudMasked.select('B4');
var reded1 = s2CloudMasked.select('B5');
var reded2 = s2CloudMasked.select('B6');
var reded3 = s2CloudMasked.select('B7');
var nir = s2CloudMasked.select('B8');
var reded4 = s2CloudMasked.select('B8A');
var vapor = s2CloudMasked.select('B9');
var swir1 = s2CloudMasked.select('B11');
var swir2 = s2CloudMasked.select('B12');
var aeropt = s2CloudMasked.select('AOT');



// -----------------------------------------------------------------------------------------
// VECTOR LAYERS TO SAMPLE
// -----------------------------------------------------------------------------------------

// CS01--------------------------------------------------------------- TO DO - ASSET E INDICES

var points = ee.FeatureCollection("…PATH TO POINT VECTOR…");
Map.addLayer(points);


// -----------------------------------------------------------------------------------------
// APPLY SPECTRAL INDICES, MAP AND SAMPLE
// -----------------------------------------------------------------------------------------

// Exemple of a spectral index calculation + map + print
// EXTENDED NAME OF THE SPECTRAL INDEX ---------------------------------------------- NAME ---
//var nameconstant = ee.Image.constant(1);
//var nameindex = (write here the math with .add(), . subtract(), .multiply(), .divide()) .rename('NAME')
//var nameindexParams = {min: -1, max: 1, palette: ['black', 'green', 'red']};
//Map.addLayer(nameindex, nameindexParams, 'NAME');
//print(name, 'NAME')
// Applying first reducer
//var NAME = name.reduceRegions({
//  collection: points, 
//  reducer: ee.Reducer.first(), 
//  scale: 250, // Native resolution
//});
// Print in console (the INDEX values will be listed in the column “first”).  
//print(NAME);
//Export to Google Drive as shp file
//Export.table.toDrive({
//  collection: NAME,
//  folder: 'FOLDER-NAME',
//  description:'NAME',
//  fileFormat: 'SHP'
//});



// Atmospherically Resistant Vegetation Index ---------------------------------------- ARVI ---
var gam1 = ee.Image.constant(1);
var arvi = nir.subtract(red.subtract(gam1.multiply(blue.subtract(red)))).divide(nir.add(red.subtract(gam1.multiply(blue.subtract(red)))))
.rename('ARVI');
var arviParams = {min: -0.2121, max: -0.0405, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(arvi, arviParams, 'ARVI');
print(arvi, 'ARVI')
// Applying first reducer
var ARVI = arvi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(ARVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: ARVI,
  folder: 'SHP',
  description:'ARVI',
  fileFormat: 'SHP'
});


// Difference Vegetation Index --------------------------------------------------------- DVI ---
var dvi = nir.subtract(red).rename('DVI');
var dviParams = {min: 500.47, max: 1260.61, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(dvi, dviParams, 'DVI');
print(dvi, 'DVI')
// Applying first reducer
var DVI = dvi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console 
print(DVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: DVI,
  folder: 'SHP',
  description:'DVI',
  fileFormat: 'SHP'
});


// Disease Water Stress Index --------------------------------------------------------- DWSI ---
var dwsi = (nir.add(green)).divide(swir2.add(red)).rename('DWSI');
var dwsiParams = {min: 0.6562, max: 0.9779, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(dwsi, dwsiParams, 'DWSI');
print(dwsi, 'DWSI')
// Applying first reducer
var DWSI = dwsi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(DWSI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: DWSI,
  folder: 'SHP',
  description:'DWSI',
  fileFormat: 'SHP'
});


// Disease Water Stress Index 1 ------------------------------------------------------- DWSI1 ---
var dwsi1 = nir.divide(swir2).rename('DWSI1');
var dwsi1Params = {min: 0.69, max: 1.10, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(dwsi1, dwsi1Params, 'DWSI1');
print(dwsi1, 'DWSI1')
// Applying first reducer
var DWSI1 = dwsi1.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console  
print(DWSI1);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: DWSI1,
  folder: 'SHP',
  description:'DWSI1',
  fileFormat: 'SHP'
});


// Disease Water Stress Index 5 ------------------------------------------------------- DWSI5 ---
var dwsi5 = (nir.subtract(green)).divide(swir2.add(red)).rename('DWSI5');
var dwsi5Params = {min: -0.1813, max: 0.7744, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(dwsi5, dwsi5Params, 'DWSI5');
print(dwsi5, 'DWSI5')
// Applying first reducer
var DWSI5 = dwsi5.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(DWSI5);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: DWSI5,
  folder: 'SHP',
  description:'DWSI5',
  fileFormat: 'SHP'
});


// Enhanced Vegetation Index ---------------------------------------------------------- EVI ---
var evi = (nir.subtract(red)).divide(nir.add(red.multiply(6).subtract(blue.multiply(-7.5).add (1)))).rename('EVI');
var eviParams = {min: -0.00005543311044224272, max: 0.039911381958731854, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(evi, eviParams, 'EVI');
print(evi, 'EVI')
// Applying first reducer
var EVI = evi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(EVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: EVI,
  folder: 'SHP',
  description:'EVI',
  fileFormat: 'SHP'
});


// Green Atmospherically Resistant Index ---------------------------------------------- GARI ---
var gam2 = ee.Image.constant(1.7);
var gari = (nir.subtract(green.subtract(gam2.multiply(blue.subtract(red))))).divide(nir.add(green.subtract(gam2.multiply(blue.subtract(red))))).rename('GARI');
var gariParams = {min: -0.2379, max: 0.0759, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(gari, gariParams, 'GARI');
print(gari, 'GARI')
// Applying first reducer
var GARI = gari.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(GARI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: GARI,
  folder: 'SHP',
  description:'GARI',
  fileFormat: 'SHP'
});


// Green Difference Vegetation Index --------------------------------------------------- GDVI ---
var gdvi = (nir.subtract(green)).rename('GDVI');
var gdviParams = {min: 1218.59, max: 3098.10, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(gdvi, gdviParams, 'GDVI');
print(gdvi, 'GDVI')
// Applying first reducer
var GDVI = gdvi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(GDVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: GDVI,
  folder: 'SHP',
  description:'GDVI',
  fileFormat: 'SHP'
});


// Global Environmental Monitoring Index ----------------------------------------------- GEMI ---
var const1 = ee.Image.constant(1);
var c1 = (red.subtract(0.125)).divide((const1).subtract(red));
var e1 = ((nir.multiply(nir).subtract(red.multiply(red))).multiply(2)).add(nir.multiply(1.5)).add(red.multiply(0.5));
var e2 = (nir.add(red.add(0.5)));
var c1 = (e1.divide(e2)).multiply(const1.subtract(e1.divide(e2).multiply(0.25)));
var gemi = c1.rename('GEMI');
var gemiParams = {min: -1729120.6804736517, max: 148142.31973663112, palette: ['lightblue', 'lightgreen', 'green', 'black']};
Map.addLayer(gemi, gemiParams, 'GEMI');
print(gemi, 'GEMI')
// Applying first reducer
var GEMI = gemi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console 
print(GEMI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: GEMI,
  folder: 'SHP',
  description:'GEMI',
  fileFormat: 'SHP'
});


// Green Normalized Difference Vegetattion Index --------------------------------------- GNDVI ---
var gndvi = (nir.subtract(green)).divide(nir.add(green)).rename('GNDVI');
var gndviParams = {min: 0.1144, max: 0.4028, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(gndvi, gndviParams, 'GNDVI');
print(gndvi, 'GNDVI')
// Applying first reducer
var GNDVI = gndvi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(GNDVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: GNDVI,
  folder: 'SHP',
  description:'GNDVI',
  fileFormat: 'SHP'
});


// Green Ratio Vegetation Index -------------------------------------------------------- GRVI ---
var grvi = nir.divide(green).rename('GRVI');
var grviParams = {min: 1.2981, max: 1.9910, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(grvi, grviParams, 'GRVI');
print(grvi, 'GRVI')
// Applying first reducer
var GRVI = grvi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console  
print(GRVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: GRVI,
  folder: 'SHP',
  description:'GRVI',
  fileFormat: 'SHP'
});


// Green Vegetation Index -------------------------------------------------------------- GVI ---
var gvi = (blue.multiply(-0.2848)).add(green.multiply(-0.2435)).add(red.multiply(-0.5436)).add(nir.multiply(0.7243)).add(swir1.multiply(0.084)).add(swir2.multiply(-0.18)).rename('GVI');
var gviParams = {min: -1223.71, max: 343.75, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(gvi, gviParams, 'GVI');
print(gvi, 'GVI')
// Applying first reducer
var GVI = gvi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(GVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: GVI,
  folder: 'SHP',
  description:'GVI',
  fileFormat: 'SHP'
});


// Modified Chlorophyll Absorption in Reflectance -------------------------------------- MCARI ---
var mcari = (((nir.subtract(red)).multiply(2.5)).multiply(1.2)).subtract((nir.subtract(green)).multiply(1.3)) .rename('MCARI');
var mcariParams = {min: -1134.27, max: 756.41, palette: ['black', ' green', 'lightgreen', 'lightblue']};
Map.addLayer(mcari, mcariParams, 'MCARI');
print(mcari, 'MCARI')
// Applying first reducer
var MCARI = mcari.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(MCARI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: MCARI,
  folder: 'SHP',
  description:'MCARI',
  fileFormat: 'SHP'
});


// Modified Non-Linear Index ----------------------------------------------------------- MNLI ---
var const2 = ee.Image.constant(0.5);
var mnli = (((nir.multiply(nir)).subtract(red)).multiply(const2.add(1)).divide((nir.multiply(nir)).add(red).add(const1))).rename('MNLI');
var mnliParams = {min: 1.4991, max: 1.4996, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(mnli, mnliParams, 'MNLI');
print(mnli, 'MNLI')
// Applying first reducer
var MNLI = mnli.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(MNLI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: MNLI,
  folder: 'SHP',
  description:'MNLI',
  fileFormat: 'SHP'
});


// Moisture Stress Index --------------------------------------------------------------- MSI ---
var msi = swir2.divide(nir).rename('MSI');
var msiParams = {min: 1.0025, max: 1.2666, palette: ['lightblue', 'lightgreen', 'green', 'black']};
Map.addLayer(msi, msiParams, 'MSI');
print(msi, 'MSI')
// Applying first reducer
var MSI = msi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console 
print(MSI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: MSI,
  folder: 'SHP',
  description:'MSI',
  fileFormat: 'SHP'
});

// Mid-Infrared Vegetation Index ------------------------------------------------------- MVI ---
var mvi = nir.divide(swir1).rename('MVI');
var mviParams = {min: 0.59, max: 0.99, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(mvi, mviParams, 'MVI');
print(mvi, 'MVI')
// Applying first reducer
var MVI = mvi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(MVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: MVI,
  folder: 'SHP',
  description:'MVI',
  fileFormat: 'SHP'
});


// Normalized Difference Moisture Index ------------------------------------------------ NDMI ---
var ndmi = (nir.subtract(swir1)).divide(nir.add(swir1)).rename('NDMI');
var ndmiParams = {min: -0.2518, max: 0.0197, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(ndmi, ndmiParams, 'NDMI');
print(ndmi, 'NDMI')
// Applying first reducer
var NDMI = ndmi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(NDMI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: NDMI,
  folder: 'SHP',
  description:'NDMI',
  fileFormat: 'SHP'
});


// Normalized Difference Vegetation Index ----------------------------------------------- NDVI ---
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
var ndviParams = {min: 0.0181, max: 0.1540, palette: ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(ndvi, ndviParams, 'NDVI');
print(ndvi, 'NDVI')
// Applying first reducer
var NDVI = ndvi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(NDVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: NDVI,
  folder: 'SHP',
  description:'NDVI',
  fileFormat: 'SHP'
});


// Normalized Difference Water Index ---------------------------------------------------- NDWI ---
var ndwi = (green.subtract(nir)).divide(green.add(nir)).rename('NDWI');
var ndwiParams = {min: -0.3552, max: -0.1617, palette: ['lightblue', 'lightgreen', 'green', 'black']};
Map.addLayer(ndwi, ndwiParams, 'NDWI');
print(ndwi, 'NDWI')
// Applying first reducer
var NDWI = ndwi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console 
print(NDWI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: NDWI,
  folder: 'SHP',
  description:'NDWI',
  fileFormat: 'SHP'
});


// Nonlinear Vegetation Index ------------------------------------------------------------ NLI ---
var nli = ((nir.multiply(nir)).subtract(red)).divide((nir.multiply(nir)).add(red)).rename('NLI');
var nliParams = {min: 0.9995603669385243, max: 0.9998033086321373, palette:  ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(nli, nliParams, 'NLI');
print(nli, 'NLI')
// Applying first reducer
var NLI = nli.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(NLI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: NLI,
  folder: 'SHP',
  description:'NLI',
  fileFormat: 'SHP'
});


// Optimized Soil Adjusted Vegetation Index ---------------------------------------------- OSAVI ---
var osavi = (nir.subtract(red)).multiply(1.5).divide(nir.add(red.add(0.16))).rename('OSAVI');
var osaviParams = {min: 0.04, max: 0.22, palette:  ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(osavi, osaviParams, 'OSAVI');
print(osavi, 'OSAVI')
// Applying first reducer
var OSAVI = osavi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(OSAVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: OSAVI,
  folder: 'SHP',
  description:'OSAVI',
  fileFormat: 'SHP'
});


// Soil Adjusted Vegetation Index -------------------------------------------------------- SAVI ---
var savi = ((nir.subtract(red)).multiply(1.5)).divide(nir.add(red.add(0.5))).rename('SAVI');
var saviParams = {min: 0.070, max: 0.7755, palette:  ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(savi, saviParams, 'SAVI');
print(savi, 'SAVI')
// Applying first reducer
var SAVI = savi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(SAVI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: SAVI,
  folder: 'SHP',
  description:'SAVI',
  fileFormat: 'SHP'
});


// Shortwave Infrared Water Stress Index ------------------------------------------------- SIWSI ---
var siwsi = (nir.subtract(swir2)).divide(nir.add(swir2)).rename('SIWSI');
var siwsiParams = {min: -0.20, max: 0.10, palette:  ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(siwsi, siwsiParams, 'SIWSI');
print(siwsi, 'SIWSI')
// Applying first reducer
var SIWSI = siwsi.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console 
print(SIWSI);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: SIWSI,
  folder: 'SHP',
  description:'SIWSI',
  fileFormat: 'SHP'
});


// Simple Ratio NIR/Red ------------------------------------------------------------------- SRNR ---
var srnr = (nir.divide(red)).rename('SRNR');
var srnrParams = {min: 0.9571, max: 1.4234, palette:  ['black', 'green', 'lightgreen', 'lightblue']};
Map.addLayer(srnr, srnrParams, 'SRNR');
print(srnr, 'SRNR')
// Applying first reducer
var SRNR = srnr.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console
print(SRNR);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: SRNR,
  folder: 'SHP',
  description:'SRNR',
  fileFormat: 'SHP'
});


// Simple Ratio Red/Green ----------------------------------------------------------------- SRRG ---
var srrg = (red.divide(green)).rename('SRRG');
var srrgParams = {min: 0.9999, max: 1.4537, palette: ['lightblue', 'lightgreen', 'green', 'black']};
Map.addLayer(srrg, srrgParams, 'SRRG');
print(srrg, 'SRRG')
// Applying first reducer
var SRRG = srrg.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console  
print(SRRG);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: SRRG,
  folder: 'SHP',
  description:'SRRG',
  fileFormat: 'SHP'
});


// Wetness --------------------------------------------------------------------------------- WET ---
var wet = (blue.multiply(0.1509)).add(green.multiply(0.1973)).add(red.multiply(0.3279)).add(nir.multiply(0.3406)).add(swir1.multiply(0.7112)).add(swir2.multiply(0.4572)).rename('WET');
var wetParams = {min: 10000, max: 16000, palette: ['lightblue', 'lightgreen', 'green', 'black']};
Map.addLayer(wet, wetParams, 'WET');
print(wet, 'WET')
// Applying first reducer<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
var WET = wet.reduceRegions({
  collection: points, 
  reducer: ee.Reducer.first(), 
  scale: 1, // Native resolution
});
// Print in console 
print(WET);
//Export to Google Drive as shp file
Export.table.toDrive({
  collection: WET,
  folder: 'SHP',
  description:'WET',
  fileFormat: 'SHP'
});


// -----------------------------------------------------------------------------------------
// EXPORT SPECTRAL INDICES IMAGES NAD SAMPLES (GEOTIF/SHP) IN GOOGLE DRIVE
// -----------------------------------------------------------------------------------------

// Export.image.toDrive(image, description, folder, fileNamePrefix, dimensions, region, scale, crs, crsTransform,
// maxPixels, shardSize, fileDimensions, skipEmptyTiles, fileFormat, formatOptions)

// Insert the folder name with a folder present in your Google Drive Account (New Folder)
// You can choose the pixel dimension (30 m)
// You can choose the images projections (WGS84 32N)

Export.image.toDrive({
  image: s2CloudMasked,
  description: 'BASEMAP',
  folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: arvi,
  description: 'ARVI',
  folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: dvi,
  description: 'DVI',
   folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: dwsi,
  description: 'DWSI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: dwsi1,
  description: 'DWSI1',
  folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: dwsi5,
  description: 'DWSI5',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: evi,
  description: 'EVI',
  folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: gari,
  description: 'GARI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: gdvi,
  description: 'GDVI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: gemi,
  description: 'GEMI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: gndvi,
  description: 'GNDVI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'RASTER',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: grvi,
  description: 'GRVI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: gvi,
  description: 'GVI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: mcari,
  description: 'MCARI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: mnli,
  description: 'MNLI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: msi,
  description: 'MSI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: mvi,
  description: 'MVI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: ndmi,
  description: 'NDMI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: ndvi,
  description: 'NDVI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: ndwi,
  description: 'NDWI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: nli,
  description: 'NLI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: osavi,
  description: 'OSAVI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: savi,
  description: 'SAVI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: siwsi,
  description: 'SIWSI',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: srnr,
  description: 'SRNR',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: srrg,
  description: 'SRRG',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});


Export.image.toDrive({
  image: wet,
  description: 'WET',
 folder: 'RASTER',
  region: geometry,
  scale: 30,
  crs: 'EPSG:32632',
  maxPixels: 1e13
});








#AlessiaBrucato_Ph.D.Project_Scripts

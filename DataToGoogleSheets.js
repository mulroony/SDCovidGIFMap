// Pull JSON directly into sheet, minimal processing
function getCA_DHHS() {
  var ss = SpreadsheetApp.openById("<<ScriptID>>");
  try {
    var sheet = ss.getSheetByName("CA_DHHS");
    ss.deleteSheet(sheet);
  }
  catch (err) { Logger.log(err);}
  
  
  var sheet = ss.insertSheet("CA_DHHS");
 
  var aUrl = "https://data.chhs.ca.gov/api/3/action/datastore_search?resource_id=6cd8d424-dfaa-4bdd-9410-a3d656e1176e&;limit=20000";
  var response = UrlFetchApp.fetch(aUrl); // get feed
  var dataAll = JSON.parse(response.getContentText());
 
  var dataset = dataAll.result.records;
  for (i in dataset){
    dataset[i]["Most Recent Date"] = new Date(dataset[i]["Most Recent Date"]);
    if ( dataset[i]['Total Count Confirmed'] === null ) dataset[i]['Total Count Confirmed'] = 0;
    if ( dataset[i]['COVID-19 Positive Patients'] === null ) dataset[i]['COVID-19 Positive Patients'] = 0;
    if ( dataset[i]['Suspected COVID-19 Positive Patients'] === null ) dataset[i]['Suspected COVID-19 Positive Patients'] = 0;
    if ( dataset[i]['ICU COVID-19 Suspected Patients'] === null ) dataset[i]['ICU COVID-19 Suspected Patients'] = 0;
    if ( dataset[i]['ICU COVID-19 Positive Patients'] === null ) dataset[i]['ICU COVID-19 Positive Patients'] = 0;
    if ( dataset[i]['Total Count Deaths'] === null ) dataset[i]['Total Count Deaths'] = 0;
  }
 
  var rows = [], data;
 
  var headers_all = [["Most Recent Date","Most Recent Date"],
                     ["Total Count Deaths","Total Count Deaths"],
                     ["ICU COVID-19 Positive Patients","ICU COVID-19 Positive Patients"],
                     ["ICU COVID-19 Suspected Patients","ICU COVID-19 Suspected Patients"],
                     ["Suspected COVID-19 Positive Patients","Suspected COVID-19 Positive Patients"],
                     ["COVID-19 Positive Patients","COVID-19 Positive Patients"],
                     ["_id","_id"],
                     ["County Name","County Name"],
                     ["Total Count Confirmed","Total Count Confirmed"]];
 
  var headers = [["Most Recent Date","Most Recent Date"],
                 ["Total Count Deaths","Total Count Deaths"],
                 ["ICU COVID-19 Positive Patients","ICU COVID-19 Positive Patients"],
                 ["ICU COVID-19 Suspected Patients","ICU COVID-19 Suspected Patients"],
                 ["Suspected COVID-19 Positive Patients","Suspected COVID-19 Positive Patients"],
                 ["COVID-19 Positive Patients","COVID-19 Positive Patients"],
                 ["_id","ID"],
                 ["County Name","County Name"],
                 ["Total Count Confirmed","Total Count Confirmed"]];
 
  dataset.sort(function(a,b){
    if (a['Most Recent Date'] > b['Most Recent Date']) return 1;
    if (a['Most Recent Date'] < b['Most Recent Date']) return -1;
    if (a['County Name'] > b['County Name']) return 1;
    if (a['County Name'] < b['County Name']) return -1;
   
    return 0;
  });
 
  for (i = 0; i < dataset.length; i++) {
    data = dataset[i];
    var tmp_data = [];
    for (j = 0; j < headers.length; j++) {
       tmp_data.push(data[headers[j][0]]);
    }
    rows.push(tmp_data);
  }
 
  dataRange = sheet.getRange(1, 1, 1, headers.length);  
                          dataRange.setValues([headers.map(function(x) {return x[1];})]);
 
 
  dataRange = sheet.getRange(2, 1, rows.length, headers.length);
  dataRange.setValues(rows);
 
}

// Pull data directly into sheet, minimal processing.
// Need to rewrite to use other API that does not limit results (example in getSDZIP2()) 
function getSDZIP() {
  var ss = SpreadsheetApp.openById("<<ScriptID>>");
  try {
    var sheet = ss.getSheetByName("SD_ZIP");
    ss.deleteSheet(sheet);
  }
  catch (err) { Logger.log(err);}
  var sheet = ss.insertSheet("SD_ZIP");
 
  var aUrl = "https://gis-public.sandiegocounty.gov/arcgis/rest/services/Hosted/COVID_19_Statistics__by_ZIP_Code/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
  var response = UrlFetchApp.fetch(aUrl); // get feed
  var dataAll = JSON.parse(response.getContentText());
 
  var dataset = dataAll.features;
  for (i in dataset){
    dataset[i].attributes["updatedate"] = new Date(dataset[i].attributes["updatedate"]);
    dataset[i].attributes["last_edited_date"] = new Date(dataset[i].attributes["last_edited_date"]);
    dataset[i].attributes["created_date"] = new Date(dataset[i].attributes["created_date"]);
    if ( dataset[i].attributes['case_count'] === null ) dataset[i].attributes['case_count'] = 0;
  }
 
  var rows = [], data;
 
  var headers_all = [["objectid", "Object ID"],
                     ["zipcode_zip", "Zip Code"],
                     ["ziptext", "Zip Code"],
                     ["case_count","Case Count"],
                     ["updatedate","Update Date"],
                     ["created_user","Created By"],
                     ["created_date","Created Date"],
                     ["last_edited_user","Last Edited User"],
                     ["last_edited_date","Last Edited Date"],
                     ["globalid","Global ID"]];
 
  var headers = [["zipcode_zip", "Zip Code"],
                 ["case_count","Case Count"],
                 ["updatedate","Update Date"],
                 ["created_date","Created Date"],
                 ["last_edited_date","Last Edited Date"]];
 
  dataset.sort(function(a,b){
    if (a.attributes['updatedate'] > b.attributes['updatedate']) return 1;
    if (a.attributes['updatedate'] < b.attributes['updatedate']) return -1;
    if (a.attributes['zipcode_zip'] > b.attributes['zipcode_zip']) return 1;
    if (a.attributes['zipcode_zip'] < b.attributes['zipcode_zip']) return -1;
   
    return 0;
  });
 
  for (i = 0; i < dataset.length; i++) {
    data = dataset[i].attributes;
    var tmp_data = [];
    for (j = 0; j < headers.length; j++) {
       tmp_data.push(data[headers[j][0]]);
    }
    rows.push(tmp_data);
  }
 
  dataRange = sheet.getRange(1, 1, 1, headers.length);  
                          dataRange.setValues([headers.map(function(x) {return x[1];})]);
 
 
  dataRange = sheet.getRange(2, 1, rows.length, headers.length);
  dataRange.setValues(rows);
 
}

// Same info as getSDZIP except Rows = Counties & Columns = Dates
function getSDZIP2() {
  var ss = SpreadsheetApp.openById("<<ScriptID>>");
  
  // Uncomment and specify zips. Leave commented out to do all
  //var zips_to_do = ['92109', '92126'];

  // Uncomment and specify dates. Leave commented out to do all. Zero pad months and day, YYYY/MM/DD
  //var dates_to_do = ["2020/04/12", "2020/05/01" ];
  
  try {
    var sheet = ss.getSheetByName("SD_ZIP2");
    ss.deleteSheet(sheet);
  }
  catch (err) { Logger.log(err);}
  var sheet = ss.insertSheet("SD_ZIP2");
 
  var aUrl = "https://opendata.arcgis.com/datasets/854d7e48e3dc451aa93b9daf82789089_0.geojson";
  var response = UrlFetchApp.fetch(aUrl);
  var dataAll = JSON.parse(response.getContentText());
 
  var dataset = dataAll.features;
  
  var zips = new Array();
  var dates = new Array();
  
  var superhash = {};
  
  for (i in dataset){
    if ( dataset[i].properties['case_count'] === null ) dataset[i].properties['case_count'] = 0;
    
    var zip = dataset[i].properties["ziptext"].trim();
    zips.push(zip);
    
    // Set date string w/ zero padding
    dataset[i].properties["updatedate"] = new Date(dataset[i].properties["updatedate"]);
    
    var tmp_date = dataset[i].properties["updatedate"].getFullYear() + "/";
    
    if ( dataset[i].properties["updatedate"].getMonth()+1 < 10 ) { tmp_date += "0" }
    tmp_date += (dataset[i].properties["updatedate"].getMonth() + 1) + "/";
    
    if ( dataset[i].properties["updatedate"].getDate() < 10 ) { tmp_date += "0" }
    tmp_date += dataset[i].properties["updatedate"].getDate();
    
    dates.push(tmp_date);
    
    if ( !(zip in superhash) ) { 
      superhash[zip] = {};
    }
    superhash[zip][tmp_date] = dataset[i].properties['case_count'];
  }
 
  zips = [...new Set(zips)];
  dates = [...new Set(dates)];
  
  zips.sort();
  dates.sort();  
  
  Logger.log(dates);
  //Logger.log(dates_to_do[0]);
  
  if (typeof(dates_to_do) != "undefined" ) {
    dates = dates.filter(value => dates_to_do.includes(value));
  }
  if (typeof(zips_to_do) != "undefined" ) {
    zips = zips.filter(value => zips_to_do.includes(value));
  }
  
  var rows = new Array([''].concat(dates));
  
  for (i = 0; i < zips.length; i++) {
    var tmp_data = [zips[i]];
    for (j=0; j < dates.length; j++) {
        if ( dates[j] in superhash[zips[i]] ) {
        tmp_data.push(superhash[zips[i]][dates[j]]);
      } else {
        tmp_data.push(0);
      }
    }
    rows.push(tmp_data);
  }
 
  Logger.log(rows.length);
  
  dataRange = sheet.getRange(1, 1, rows.length, dates.length+1);
  dataRange.setValues(rows);
 
}

// Create a sheet per specified metric. Rows = Counties & Columns = Dates
function getCA_DHHS2() {
  var ss = SpreadsheetApp.openById("<<ScriptID>>");
  
  var fields_to_do = [["tcd","Total Count Deaths"], 
                      ["icu_pos","ICU COVID-19 Positive Patients"],
                      ["icu_sus","ICU COVID-19 Suspected Patients"],
                      ["sus_pos","Suspected COVID-19 Positive Patients"],
                      ["pos","COVID-19 Positive Patients"],
                      ["tot_conf","Total Count Confirmed"]];

  // Uncomment and specify counties. Leave commented out to do all
  //var counties_to_do = ['Butte', 'San Diego'];

  // Uncomment and specify dates. Leave commented out to do all. Zero pad months and day, YYYY/MM/DD
  //var dates_to_do = ["2020/04/12", "2020/05/01" ];
  
  var superhash = {};
  var sheets = {};
  
  for ( f in fields_to_do ) {
    try {
      var sheet = ss.getSheetByName("CA_DHHS_"+fields_to_do[f][0]);
      ss.deleteSheet(sheet);
    }
    catch (err) { Logger.log(err);}
    sheets[fields_to_do[f][0]] = ss.insertSheet("CA_DHHS_"+fields_to_do[f][0]);
    superhash[fields_to_do[f][0]] = {};
  }
 
  var aUrl = "https://data.chhs.ca.gov/api/3/action/datastore_search?resource_id=6cd8d424-dfaa-4bdd-9410-a3d656e1176e&;limit=20000";
  var response = UrlFetchApp.fetch(aUrl); // get feed
  var dataAll = JSON.parse(response.getContentText());
 
  var dataset = dataAll.result.records;
  
  var counties = new Array();
  var dates = new Array();
  
  
  for (i in dataset){
    
    var county = dataset[i]["County Name"].trim();
    counties.push(county);
    
    // Set date string w/ zero padding
    dataset[i]["Most Recent Date"] = new Date(dataset[i]["Most Recent Date"]);
    
    var tmp_date = dataset[i]["Most Recent Date"].getFullYear() + "/";
    
    if ( dataset[i]["Most Recent Date"].getMonth()+1 < 10 ) { tmp_date += "0" }
    tmp_date += (dataset[i]["Most Recent Date"].getMonth() + 1) + "/";
    
    if ( dataset[i]["Most Recent Date"].getDate() < 10 ) { tmp_date += "0" }
    tmp_date += dataset[i]["Most Recent Date"].getDate();
    
    dates.push(tmp_date);
    
    for ( f in fields_to_do ) {
      if ( dataset[i][fields_to_do[f][1]] === null ) dataset[i][fields_to_do[f][1]] = 0;

      if ( !(county in superhash[fields_to_do[f][0]]) ) { 
        superhash[fields_to_do[f][0]][county] = {};
      }
      superhash[fields_to_do[f][0]][county][tmp_date] = dataset[i][fields_to_do[f][1]];
    }
  }
 
  counties = [...new Set(counties)];
  dates = [...new Set(dates)];
  
  counties.sort();
  dates.sort();  
  
  if (typeof(dates_to_do) != "undefined" ) {
    dates = dates.filter(value => dates_to_do.includes(value));
  }
  if (typeof(counties_to_do) != "undefined" ) {
    counties = counties.filter(value => counties_to_do.includes(value));
  }
  
  for ( f in fields_to_do ) {
    var rows = new Array([''].concat(dates));
    
    for (i = 0; i < counties.length; i++) {
      var tmp_data = [counties[i]];
      for (j=0; j < dates.length; j++) {
        if ( dates[j] in superhash[fields_to_do[f][0]][counties[i]] ) {
          tmp_data.push(superhash[fields_to_do[f][0]][counties[i]][dates[j]]);
        } else {
          tmp_data.push(0);
        }
      }
      rows.push(tmp_data);
    }
    
    Logger.log(rows.length);
    
    dataRange = sheets[fields_to_do[f][0]].getRange(1, 1, rows.length, dates.length+1);
    dataRange.setValues(rows);
  }
    
}

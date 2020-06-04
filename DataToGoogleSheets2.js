function getWorldOMeters() {
  
  var ss = SpreadsheetApp.openById("<<SheetID>>");
  try {
    var sheet = ss.getSheetByName("WorldOMeters");
    ss.deleteSheet(sheet);
  }
  catch (err) { Logger.log(err);}
  
  var sheet = ss.insertSheet("WorldOMeters");
 
  var cities_w_url = [["New York","https://www.worldometers.info/coronavirus/usa/new-york/"],
                      ["California","https://www.worldometers.info/coronavirus/usa/california/"],
                      ["Florida","https://www.worldometers.info/coronavirus/usa/florida/"],
                      ["Texas","https://www.worldometers.info/coronavirus/usa/texas/"]];
  
  rows = [['','Cases','Death']]
  
  for ( i in cities_w_url) {
    var url = cities_w_url[i][1];
    var html = UrlFetchApp.fetch(url).getContentText();
    var searchstring = '<title>';
    var endsearchstring = '</title>';
    var index = html.search(searchstring);
  
    var startpos = index + searchstring.length;
    var endpos = html.search(endsearchstring);
  
    var title = html.substring(startpos, endpos);
  
    title = title.split("Coronavirus: ",2)[1].split(" ")
  
    var deaths = title[0];
    var cases = title[3];
  
    rows.push([cities_w_url[i][0],cases,deaths]);
  }
  dataRange = sheet.getRange(1, 1, rows.length, 3);
  dataRange.setValues(rows);
}

function getCOVIDTracking() {
  
  // Uncomment and specify states. Leave commented out to do all
  var states_to_do = ['NY', 'CA'];
  
  var ss = SpreadsheetApp.openById("<<SheetID>>");
  try {
    var sheet = ss.getSheetByName("COVIDTracking");
    ss.deleteSheet(sheet);
  }
  catch (err) { Logger.log(err);}
  
  var sheet = ss.insertSheet("COVIDTracking");
 
  var aUrl = "https://covidtracking.com/api/v1/states/current.json";
  var response = UrlFetchApp.fetch(aUrl); // get feed
  var dataset = JSON.parse(response.getContentText());
  
  for (i in dataset){
    dataset[i]["dateModified"] = new Date(dataset[i]["dateModified"]);
    dataset[i]["dateChecked"] = new Date(dataset[i]["dateChecked"]);

    if ( dataset[i]['positive'] === null ) dataset[i]['positive'] = 0;
    if ( dataset[i]['negative'] === null ) dataset[i]['negative'] = 0;
  }
 
  var rows = [], data;
 
  var headers_all = [["state", "State"],
                     ["date", "Date"],
                     ["positive", "Positive"],
                     ["negative", "Negative"],
                     ["pending", "Pending"],
                     ["hospitalizedCurrently", "Hospitalized Currently"],
                     ["hospitalizedCumulative", "Hospitalized Cumulative"],
                     ["inIcuCurrently", "Currently in ICU"],
                     ["inIcuCumulative", "Cumulative in ICU"],
                     ["onVentilatorCurrently", "On Ventilator Currently"],
                     ["onVentilatorCumulative", "On Ventilator Cumulative"],
                     ["recovered", "Recovered"],
                     ["dataQualityGrade", "Data Quality Grade"],
                     ["lastUpdateEt", "Last Update"],
                     ["dateModified", "Date Modified"],
                     ["checkTimeEt", "Check Time"],
                     ["death", "Death"],
                     ["hospitalized", "Hospitalized"],
                     ["dateChecked", "Date Checked"],
                     ["fips", "FIPS"],
                     ["positiveIncrease", "Positive Increase"],
                     ["negativeIncrease", "Negative Increase"],
                     ["total", "Total"],
                     ["totalTestResults", "Total Test Results"],
                     ["totalTestResultsIncrease", "Total Test Results Increase"],
                     ["posNeg", "Pos Neg"],
                     ["deathIncrease", "Death Increase"],
                     ["hospitalizedIncrease", "Hospitalized Increase"],
                     ["hash", "Hash"],
                     ["commercialScore", "Commercial Score"],
                     ["negativeRegularScore", "Negative Regular Score"],
                     ["negativeScore", "Negative Score"],
                     ["positiveScore", "Positive Score"],
                     ["score", "Score"],
                     ["grade", "Grade"]];
 
  var headers = [["state", "State"],
                 ["date", "Date"],
                 ["positive", "Positive"],
                 ["negative", "Negative"],
                 ["pending", "Pending"],
                 ["hospitalizedCurrently", "Hospitalized Currently"],
                 ["hospitalizedCumulative", "Hospitalized Cumulative"],
                 ["inIcuCurrently", "Currently in ICU"],
                 ["inIcuCumulative", "Cumulative in ICU"],
                 ["onVentilatorCurrently", "On Ventilator Currently"],
                 ["onVentilatorCumulative", "On Ventilator Cumulative"],
                 ["recovered", "Recovered"],
                 ["dataQualityGrade", "Data Quality Grade"],
                 ["lastUpdateEt", "Last Update"],
                 ["dateModified", "Date Modified"],
                 ["checkTimeEt", "Check Time"],
                 ["death", "Death"],
                 ["hospitalized", "Hospitalized"],
                 ["dateChecked", "Date Checked"],
                 ["total", "Total"],
                 ["totalTestResults", "Total Test Results"]];
 
  dataset.sort(function(a,b){
    if (a['state'] > b['state']) return 1;
    if (a['state'] < b['state']) return -1;
   
    return 0;
  });
   
  for (i = 0; i < dataset.length; i++) {
    data = dataset[i];

    Logger.log("Starting: " + data['state']);
    
    // Skip if not in states_to_do if it is given
    if (typeof(states_to_do) != "undefined" ) {
      if ( states_to_do.indexOf(data["state"]) == -1 ){ 
        Logger.log('   skipping...');
        continue; 
      }
    }

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

function getWorldOMeter2() {
  
  // Uncomment and specify states. Leave commented out to do all
  var states_to_do = ['New York', 'California'];
  
  var ss = SpreadsheetApp.openById("<<SheetID>>");
  try {
    var sheet = ss.getSheetByName("WorldOMeters");
    ss.deleteSheet(sheet);
  }
  catch (err) { Logger.log(err);}
  
  var sheet = ss.insertSheet("WorldOMeters");
  
  var html = UrlFetchApp.fetch("https://www.worldometers.info/coronavirus/country/us").getContentText();
  
  var headers = [];
  var rows = []
  
  // Two tables, and we want the second, jump to it and then find end.
  var searchstring = '<table id="usa_table_countries_today"';
 
  var startpos = html.search(searchstring);
  var html = html.substring(startpos, html.length-1);
  
  // Find end of table
  var endsearchstring = '</table>';
  var endpos = html.search(endsearchstring);

  // Substring html result
  html = html.substring(0, endpos + endsearchstring.length + 1).replace(/\&nbsp;/g," ");
  // These cause trouble for the XML parser
  html = html.replace(/<nobr>/g,"").replace(/<\/nobr>/g,"");
  html = html.replace(/<a[^>]*>/g,"").replace(/<\/a>/g,"");
  
  // Load into XML
  var document = XmlService.parse(html);
  var root = document.getRootElement();
  
  var header = root.getChild('thead').getChild('tr').getChildren();
  var tablerows = root.getChild('tbody').getChildren('tr');
    
  for (var i = 0; i < header.length; i++) {
    headers.push(header[i].getText());
  }
  
  // Get table data into 
  for (var i = 0; i < tablerows.length; i++) {
    var tablerow = tablerows[i].getChildren();
    var tmpdata = [];
    
    // Skip if not in states_to_do if it is given
    Logger.log(tablerow[0].getText());
    if (typeof(states_to_do) != "undefined" ) {
      if ( states_to_do.indexOf(tablerow[0].getText().trim()) == -1 ){ 
        Logger.log('   skipping...');
        continue; 
      }
    }
    
    for ( var j = 0; j < tablerow.length; j++) {
       tmpdata.push(tablerow[j].getText().trim());
    }
    rows.push(tmpdata);
  }
  
  // Sort by column 1, state name
  
  rows.sort(function(a,b) {
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
   
    return 0;
  });
  
  dataRange = sheet.getRange(1, 1, 1, headers.length);  
  dataRange.setValues([headers]);
 
  dataRange = sheet.getRange(2, 1, rows.length, headers.length);
  dataRange.setValues(rows);
}

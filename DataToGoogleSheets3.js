function getCOVIDTracking2() {

  // Comment out to do today. YYYYMMDD
  //var date_to_do = "20200603";
  
  // Do today if date not specified
  if (typeof(date_to_do) == "undefined") {
    var today = new Date();
    var date_to_do = today.getFullYear();
    
    if ( today.getMonth()+1 < 10 ) { date_to_do += "0" }
    date_to_do += (today.getMonth() + 1);
    
    if ( today.getDate() < 10 ) { date_to_do += "0" }
    date_to_do += today.getDate(); 
  }
  
  // Uncomment and specify states. Leave commented out to do all
  //var states_to_do = ['NY', 'CA'];
  
  var ss = SpreadsheetApp.openById("<<SheetID>>");
  try {
    var sheet = ss.getSheetByName("COVIDTracking");
    ss.deleteSheet(sheet);
  }
  catch (err) { Logger.log(err);}
  
  var sheet = ss.insertSheet("COVIDTracking");
 
  var aUrl = "https://covidtracking.com/api/v1/states/daily.json";
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

    // skip filtered dates
    if ( date_to_do != data['date'] ) {
       continue
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

// 
function getRTCSV() {
  
  // Comment out to do today. YYYY-MM-DD
  var date_to_do = "2020-06-02";
  
  // Do today if date not specified
  if (typeof(date_to_do) == "undefined") {
    var today = new Date();
    var date_to_do = today.getFullYear() + '-';
    
    if ( today.getMonth()+1 < 10 ) { date_to_do += "0" }
    date_to_do += (today.getMonth() + 1) + '-';
    
    if ( today.getDate() < 10 ) { date_to_do += "0" }
    date_to_do += today.getDate(); 
  }
  
  // Uncomment and specify states. Leave commented out to do all
  //var states_to_do = ['NY', 'CA'];
  
  var ss = SpreadsheetApp.openById("<<SheetID>>");
  try {
    var sheet = ss.getSheetByName("RT_CSV");
    ss.deleteSheet(sheet);
  }
  catch (err) { Logger.log(err);}
  
  var sheet = ss.insertSheet("RT_CSV");
 
  var aUrl = "https://d14wlfuexuxgcm.cloudfront.net/covid/rt.csv";
  var response = UrlFetchApp.fetch(aUrl); // get feed
  var dataset = response.getContentText().trim().split("\n");
  
  // get headers, probably not needed, but just in case they shuffle
  var dataset_headers = dataset[0].split(",");
  dataset = dataset.slice(1);
   
  var rows = [[]];
 
  var headers_all = {"date": ["Date", 0],
                     "region": ["State", 1],
                     "mean": ["Mean", 2],
                     "median": ["Median", 3],
                     "lower_90": ["Lower 90", 4],
                     "upper_90": ["Upper 90", 5],
                     "lower_50": ["Lower 50", 6],
                     "upper_50": ["Upper 50", 7],
                     "new_cases": ["New cases", 8]};
 
  // name from csv: [ pretty name, column number in our sheet ]
  var headers = {"date": ["Date", 1],
                 "region": ["State", 0],
                 "mean": ["Mean", 2],
                 "median": ["Median", 3],
                 "new_cases": ["New cases", 4]};
 
  var column_order = {};
 
  for ( i in dataset_headers ) {
    if ( dataset_headers[i] in headers ) {
      column_order[i] = headers[dataset_headers[i]][1];
      rows[0].push(headers[dataset_headers[i]][0]);
    }
  }
  
  
  for ( i in dataset ) {
    var data = dataset[i].split(",");
    var _tmp_data = [];
    for ( var j = 0; j < data.length; j++ ) {
      if ( j in column_order ) {
        _tmp_data[column_order[j]] = data[j];
      }
    }
    if ( date_to_do == _tmp_data[headers['date'][1]] ) {
      if ( typeof(states_to_do) == "undefined") {
        rows.push(_tmp_data);
      } else {
        if ( states_to_do.indexOf(_tmp_data[headers['region'][1]]) > -1) {
          rows.push(_tmp_data);
        }
      }
    }
  }
  
  dataRange = sheet.getRange(1, 1, rows.length, Object.keys(headers).length);
  dataRange.setValues(rows);
}


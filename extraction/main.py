import xlrd
import xlrd.xldate as xldate
import json
import requests

from iscad.extractors.decisions import DecisionsExtractor
from iscad.extractors.crosscuttingresearch import CrossCuttingResearchExtractor
from iscad.extractors.mandates import MandateExtractor

decisionsFilename = '/home/nicholas/Clients/UN/data/decisionsDatabaseUnlocked-updated.xlsx'
wpsFilename = '/home/nicholas/Clients/UN/data/wps_cross-cutting.xls'
caacFilename = '/home/nicholas/Clients/UN/data/caac_cross-cutting.xls'
pocFilename = '/home/nicholas/Clients/UN/data/poc_cross-cutting.xls'
mandateFilename = '/home/nicholas/Clients/UN/data/mandate_table_internal.xlsx'

numBad = 0
numFatalErrors = 0
numInserted = 0

extractors = [
  MandateExtractor(mandateFilename),
  #DecisionsExtractor(decisionsFilename),
  #CrossCuttingResearchExtractor(wpsFilename, 'wps'),
  #CrossCuttingResearchExtractor(caacFilename, 'caac'),
  #CrossCuttingResearchExtractor(pocFilename, 'poc')
]


for extractor in extractors:
  expectedRows = extractor.num_expected_inserts()

  print('sheet is {rows} x {cols}'.format(rows=extractor.num_rows(), cols=extractor.num_cols()))
  print('expecting to insert {rows}.'.format(rows=expectedRows))
  print()

  for row, rowvals in extractor.rows():

    errors = extractor.validate_row(rowvals)
    if len(errors) > 0:
      numBad += 1
      isFatal = False
      for error in errors:
        (fatal, etype, msg) = error
        print('{etype}, row {row}: {msg}'.format(etype=etype, row=row, msg=msg))
        if fatal:
          isFatal = True
      if isFatal:
        numFatalErrors += 1
        continue

    body = extractor.process_row(rowvals)
    req = requests.post('http://localhost:3000/graphql', json=body)
    if req.status_code != 200:
      numFatalErrors += 1
      print('error inserting row {row}'.format(row=row))
      print(req.text)
    else:
      numInserted += 1

  req = requests.post('http://localhost:3000/graphql', json=extractor.count_query())
  if req.status_code != 200:
    print('error getting final count')
    finalCount = 0
  else:
    finalCount = json.loads(req.text)['data'][extractor.count_keyword()]

  print()
  print('fatal errors in {n} rows'.format(n=numFatalErrors))
  print('successfully inserted {n} rows'.format(n=numInserted))
  print('final count: {finalCount}'.format(finalCount=finalCount))

  if finalCount != expectedRows:
    print()
    print('WARNING: wrong number of rows found. did you forget to clear the db before running this?')



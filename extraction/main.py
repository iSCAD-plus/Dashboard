import xlrd
import xlrd.xldate as xldate
import json
import requests
import sys
from contextlib import closing

from iscad.extractors.decisions import DecisionsExtractor
from iscad.extractors.decisions2 import AltDecisionsExtractor
from iscad.extractors.crosscuttingresearch import CrossCuttingResearchExtractor
from iscad.extractors.mandates import MandateExtractor

host = 'localhost:3000' if len(sys.argv) < 2 else sys.argv[1]

decisionsFilename = './data/decisionsDatabaseUnlocked.xlsx'
decisionsFilename2 = './data/SCDecisions-3.xlsx'
wpsFilename = './data/wps_cross-cutting.xls'
caacFilename = './data/caac_cross-cutting.xls'
pocFilename = './data/poc_cross-cutting.xls'
mandateFilename = './data/mandate_table_internal.xlsx'

extractors = [
#  MandateExtractor(mandateFilename),
#  DecisionsExtractor(decisionsFilename),
#  CrossCuttingResearchExtractor(wpsFilename, 'wps'),
#  CrossCuttingResearchExtractor(caacFilename, 'caac'),
#  CrossCuttingResearchExtractor(pocFilename, 'poc')
  AltDecisionsExtractor(decisionsFilename2)
]

MAX_RETRIES = 10
def post(s, host, body):
  for idx in range(0, MAX_RETRIES):
    try:
      return s.post('http://{host}/api/graphql'.format(host=host), json=body)
    except Exception as ex:
      print(ex)

for extractor in extractors:
  numBad = 0
  numFatalErrors = 0
  numInserted = 0

  expectedRows = extractor.num_expected_inserts()

  print('sheet is {rows} x {cols}'.format(rows=extractor.num_rows(), cols=extractor.num_cols()))
  print('expecting to insert {rows}.'.format(rows=expectedRows))
  print()

  s = requests.Session()

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
      print()
      if isFatal:
        numFatalErrors += 1
        continue

    body = extractor.process_row(rowvals)
    # TODO
    #if numInserted % 100 == 0:
    #  print('Inserted ' + str(numInserted))
    # TODO
    #with closing(post(s, host, body)) as req:
    #  if req.status_code != 200:
    #    numFatalErrors += 1
    #    print('error inserting row {row}'.format(row=row))
    #    print(req.text)
    #    print()
    #  else:
    #    numInserted += 1

  with closing(post(s, host, extractor.count_query())) as req:
    if req.status_code != 200:
      print('error getting final count')
      finalCount = 0
    else:
      finalCount = json.loads(req.text)['data'][extractor.count_keyword()]

  print()
  print('fatal errors in {n} rows'.format(n=numFatalErrors))
  print('other errors in {n} rows'.format(n=numBad))
  print('successfully inserted {n} rows'.format(n=numInserted))
  print('final count: {finalCount}'.format(finalCount=finalCount))

  if finalCount != expectedRows:
    print()
    print('WARNING: wrong number of rows found. did you forget to clear the db before running this?')



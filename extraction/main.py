import xlrd
import xlrd.xldate as xldate
import json
import requests

from iscad.extractors.decisions import DecisionsExtractor

decisionsFilename = '/home/nicholas/Clients/UN/data/decisionsDatabaseUnlocked-updated.xlsx'
decisionsWorkbook = xlrd.open_workbook('/home/nicholas/Clients/UN/data/decisionsDatabaseUnlocked-updated.xlsx')

decisionsWorksheet = decisionsWorkbook.sheet_by_index(0)

print('sheet is {rows} x {cols}'.format(rows=decisionsWorksheet.nrows, cols=decisionsWorksheet.ncols))
expectedRows = decisionsWorksheet.nrows - 1
print('expecting to insert {rows}.'.format(rows=expectedRows))
print()

header = decisionsWorksheet.row_values(0)

insertQuery = """
mutation CreateDecision($dec: DecisionInput) {
  createDecision(decision: $dec) {
    decision,
    decisionType,
    date
  }
}
"""

countQuery = """
query {
    countDecisions
}
"""

numBad = 0
numFatalErrors = 0
numInserted = 0

decisionsExtractor = DecisionsExtractor(decisionsFilename)

for row in range(1, decisionsWorksheet.nrows):
  rowvals = decisionsWorksheet.row_values(row)

  errors = decisionsExtractor.validate_row(rowvals)
  if len(errors) > 0:
    numBad += 1
    for error in errors:
      (fatal, etype, msg) = error
      print('{etype}, row {row}: {msg}'.format(etype=etype, row=row, msg=msg))

  body = decisionsExtractor.process_row(rowvals)
  req = requests.post('http://localhost:3000/graphql', json={'query': insertQuery, 'variables': {'dec': body}})
  if req.status_code != 200:
    numFatalErrors += 1
    print('error inserting row {row}'.format(row=row))
  else:
    numInserted += 1

req = requests.post('http://localhost:3000/graphql', json={'query': countQuery})
if req.status_code != 200:
  print('error getting final count')
  finalCount = 0
else:
  finalCount = json.loads(req.text)['data']['countDecisions']

print()
print('fatal errors in {n} rows'.format(n=numFatalErrors))
print('successfully inserted {n} rows'.format(n=numInserted))
print('final count: {finalCount}'.format(finalCount=finalCount))

if finalCount != expectedRows:
  print()
  print('WARNING: wrong number of rows found. did you forget to clear the db before running this?')



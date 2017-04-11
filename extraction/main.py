import xlrd
import xlrd.xldate as xldate
import json
import requests

decisionsWorkbook = xlrd.open_workbook('/home/nicholas/Clients/UN/data/decisionsDatabaseUnlocked.xlsx')

decisionsWorksheet = decisionsWorkbook.sheet_by_index(0)

print('sheet is {rows} x {cols}'.format(rows=decisionsWorksheet.nrows, cols=decisionsWorksheet.ncols))

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

for row in range(1, decisionsWorksheet.nrows):
  rowvals = decisionsWorksheet.row_values(row)

  date1 = rowvals[3]
  date2 = xldate.xldate_as_datetime(rowvals[4], 0).strftime('%d %B %Y')
  if date2[0] == '0':
    date2 = date2[1:]
  if date1 != date2:
    print('row {row}: {d1} != {d2}'.format(row=row+1, d1=date1, d2=date2))

  if rowvals[2] != float(xldate.xldate_as_datetime(rowvals[4],0).year):
    print('row {row}: {y1} != {y2}'.format(row=row+1, y1=rowvals[2], y2=xldate.xldate_as_datetime(rowvals[4],0).year))

  decision = rowvals[0]
  regime = rowvals[1]
  year = rowvals[2] # TODO: remove eventually
  date = xldate.xldate_as_datetime(rowvals[4], 0)
  numParagraphs = rowvals[5]
  decisionType = rowvals[6].strip().lower()

  measures = []
  for col in range(7, decisionsWorksheet.ncols):
    if (rowvals[col]) != 0.0:
      measures.append({'measureType': rowvals[col].lower(), 'measureCategory': header[col].lower()})

  if decisionType not in set(["extend", "implementation", "establish", "exemption", "intention", "terminate"]):
    print(decisionType)

  print(date.timestamp())

  body = {
    'decision': decision,
    'regime': regime,
    'year': year,
    'date': date.timestamp(),
    'numParagraphs': numParagraphs,
    'decisionType': decisionType,
    'measures': measures
  }

  req = requests.post('http://localhost:3000/graphql', json={'query': insertQuery, 'variables': {'dec': body}})
  print(req.text)


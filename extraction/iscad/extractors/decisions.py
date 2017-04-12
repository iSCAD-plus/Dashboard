import xlrd
import xlrd.xldate as xldate

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

class DecisionsExtractor(object):

  def __init__(self, filename):
    self.filename = filename
    self.workbook = xlrd.open_workbook(filename)
    self.worksheet = self.workbook.sheet_by_index(0)
    self.header = self.worksheet.row_values(0)

  def num_expected_rows(self):
    return self.worksheet.nrows - 1

  def validate_row(self, values):
    date1 = values[3]
    date2 = xldate.xldate_as_datetime(values[4], 0).strftime('%d %B %Y')

    # Strip off leading 0s
    if date2[0] == '0':
      date2 = date2[1:]

    year1 = values[2]
    year2 = float(xldate.xldate_as_datetime(values[4], 0).year)

    decision_type = values[6].strip().lower()

    errors = []

    if date1 != date2:
      errors.append((False, 'date mismatch', '"{d1}" != "{d2}"'.format(d1=date1, d2=date2)))
    if year1 != year2:
      errors.append((False, 'year mismatch', '{y1} != {y2}'.format(y1=year1, y2=year2)))
    if decision_type not in set(["extend", "implementation", "establish", "exemption", "intention", "terminate"]):
      errors.append((False, 'unrecognized decision type', '"{dtype}"'.format(dtype=decision_type)))

    return errors

  def process_row(self, values):
    decision = values[0]
    regime = values[1]
    year = values[2]
    date = xldate.xldate_as_datetime(values[4], 0)
    numParagraphs = values[5]
    decisionType = values[6].strip().lower()

    measures = []
    for col in range(7, self.worksheet.ncols):
      if values[col] != 0:
        measures.append({'measureType': values[col].lower(), 'measureCategory': self.header[col].lower()})

    body = {
      'decision': decision,
      'regime': regime,
      'year': year,
      'date': date.timestamp() * 1000,
      'numParagraphs': numParagraphs,
      'decisionType': decisionType,
      'measures': measures
    }


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

  def num_expected_rows(self):
    return self.worksheet.nrows - 1

  def validate_row(self, values):
    date1 = values[3]
    date2 = xldate.xldate_as_datetime(values[4], 0).strftime('%d %B %Y')

    year1 = values[2]
    year2 = float(xldate.xldate_as_datetime(values[4], 0).year)

    # Strip off leading 0s
    if date2[0] == '0':
      date2 = date2[1:]

    errors = []

    if date1 != date2:
      errors.append(('date mismatch', '"{d1}" != "{d2}"'.format(d1=date1, d2=date2)))
    if year1 != year2:
      errors.append(('year mismatch', '{y1} != {y2}'.format(y1=year1, y2=year2)))

    return errors

  def process_row(self, values):
    pass

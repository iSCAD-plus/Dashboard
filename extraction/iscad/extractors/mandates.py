import xlrd

insertQuery = """
mutation CreateMandate($mandate: MandateInput) {
  createMandate(mandate: $mandate) {
    name,
    location
  }
}
"""

countQuery = """
query Count {
  countMandates
}
"""

class MandateExtractor(object):

  def __init__(self, filename):
    self.filename = filename
    self.workbook = xlrd.open_workbook(filename)
    self.main_worksheet = self.workbook.sheet_by_name('Main Table')
    self.comments_worksheet = self.workbook.sheet_by_name('SCAD Comments (hidden)')
    self.header = self.main_worksheet.col_values(0)
    self.current_col = 3
    print(self.header)

  def num_expected_inserts(self):
    return self.main_worksheet.ncols - 3

  def num_rows(self):
    return self.main_worksheet.nrows

  def num_cols(self):
    return self.main_worksheet.ncols

  def rows(self):
    while self.current_col < self.num_cols():
      idx = self.current_col
      colvals = (self.main_worksheet.col_values(idx), self.comments_worksheet.col_values(idx))
      self.current_col += 1
      yield (idx+1, colvals)

  def validate_row(self, values):
    return [] # TODO

  def process_row(self, values):

    main, comments = values
    name, location, lead_entity, original_decision,\
      subsequent_decisions, last_decision, length, *components = main

    return {
      'query': insertQuery,
      'variables': {
        'mandate': {}
      }
    }

  def count_query(self):
    return {
      'query': countQuery
    }

  def count_keyword(self):
    return 'countMandates'


import xlrd

insertQuery = """
mutation CreateCCRR($row: CCRRInput) {
  createCCRR(row: $row) {
    symbol,
    keywords
  }
}
"""

countQuery = """
query {
  countCCRR
}
"""

class CrossCuttingResearchExtractor(object):

  def __init__(self, filename, tablename):
    self.filename = filename
    self.tablename = tablename
    self.workbook = xlrd.open_workbook(filename)
    self.worksheet = self.workbook.sheet_by_index(0)
    self.header = self.worksheet.row_values(1)

    self.current_row = 2

  def num_expected_inserts(self):
    return self.worksheet.nrows - 2

  def num_rows(self):
    return self.worksheet.nrows

  def num_cols(self):
    return self.worksheet.ncols

  def rows(self):
    while self.current_row < self.num_rows():
      rowidx = self.current_row
      rowvals = self.worksheet.row_values(rowidx)
      self.current_row += 1
      yield (rowidx+2, rowvals)

  def validate_row(self, values):

    errors = []

    country_regional = (values[1] != '')
    thematic = (values[2] != '')

    statement_type = values[4].strip().lower()

    if country_regional == thematic:
      errors.append((False, 'country/regional and thematic are the same', 'country/regional: {a}, thematic: {b}'.format(a=values[1], b=values[2])))

    if statement_type not in set(['pp', 'op', 'prst']):
      errors.append((False, 'unrecognized statement type', '"{x}"'.format(x=statement_type)))

    return errors

  def process_row(self, values):

    symbol = values[0]
    category = 'country/region' if values[1] != '' else 'thematic'
    agenda_item = values[3].strip()
    statement_type = values[4].strip().lower()
    paragraph_id = str(values[5]).strip()
    provision = values[6].strip()
    keywords = []
    for (val, keyword) in zip(values[7:], self.header[7:]):
      if val.strip() != '':
        keywords.append(keyword)

    body = {
      'table': self.tablename,
      'symbol': symbol,
      'category': category,
      'agendaItem': agenda_item,
      'statementType': statement_type,
      'paragraphId': paragraph_id,
      'provision': provision,
      'keywords': keywords
    }

    return {
      'query': insertQuery,
      'variables': {
        'row': body
      }
    }

  def count_query(self):
    return {
      'query': countQuery
    }

  def count_keyword(self):
    return 'countCCRR'


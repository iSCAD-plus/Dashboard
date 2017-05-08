import xlrd
import xlrd.xldate as xldate

insertQuery = None
countQuery = None

class AltDecisionsExtractor(object):

  def __init__(self, filename):
    self.filename = filename
    self.workbook = xlrd.open_workbook(filename)
    self.worksheet = self.workbook.sheet_by_index(0)
    self.dbheader = self.worksheet.row_values(0)
    self.header = self.worksheet.row_values(1)

    self.current_row = 2

  def num_expected_inserts(self):
    # It's difficult to tell at an early stage how many inserts we will
    # actually have, since many rows may go into one insert. This count simply
    # assumes that there is one insert per row, which isn't quite true.
    return self.worksheet.nrows - 2

  def num_rows(self):
    return self.worksheet.nrows

  def num_cols(self):
    return self.worksheet.ncols

  def rows(self):
    while self.current_row < self.num_rows():
      rowidx = self.current_row
      endidx = rowidx + 1
      while endidx < self.num_rows() and self.worksheet.row_values(rowidx)[1] == self.worksheet.row_values(endidx)[1]:
        endidx += 1
      #print('{row} : {end}'.format(row=rowidx+1, end=endidx))
      self.current_row = endidx + 1

      raw_rows = [self.worksheet.row_values(idx) for idx in range(rowidx, endidx)]
      #print(raw_rows)

      yield (rowidx+1, raw_rows)

  def validate_row(self, values):
    first_row = values[0]

    DATE = 0
    SYMBOL = 1
    TYPE = 2
    PARATYPE = 3
    RAW_PARA_NUM = 5
    NUM_PARA_NUM = 6

    errors = []

    # Questions:
    # 1. Can "Type" be empty? What does it mean if it is? 20 cases where this is true. (May be more actual rows.)
    # 2. Can "Date" be empty? I don't think so...
    # 3. What is the "Annex" type for, and what does it mean if it doesn't have a paragraph number?

    dates = set(map(lambda x: x[DATE], values))
    types = set(filter(None, map(lambda x: x[TYPE], values)))
    paraTypes = set(map(lambda x: x[PARATYPE].upper(), values))

    if len(dates) != 1:
      errors.append((True, 'date mismatch', '{dates}'.format(dates=dates)))

    if not paraTypes.issubset(set(['OP', 'PP', 'ANNEX'])):
      errors.append((True, 'extraneous paragraph types', '{types}'.format(types=paraTypes)))

    if not types.issubset(set(['PRST', 'Resolution'])):
      errors.append((True, 'extraneous decision types', '{types}'.format(types=types)))

    return errors

  def process_row(self, values):
    return {}

  def count_query(self):
    return {
      'query': countQuery,
    }

  def count_keyword(self):
    return 'countDecisions'


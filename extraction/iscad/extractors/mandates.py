import xlrd
import datetime

insertQuery = """
mutation CreateMandate($mandate: MandateInput) {
  createMandate(mandate: $mandate) {
    name
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
    self.subheader = self.main_worksheet.col_values(1)
    self.component_labels = self.header[8:]
    self.subcomponent_labels = self.subheader[8:]
    self.current_col = 3

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
    errors = []

    main, comments = values
    name, location, num_components, lead_entity, original_decision,\
      subsequent_decisions, last_decision, length, *components = main

    subsequent_decisions = subsequent_decisions.split(',')
    subsequent_decisions = map(lambda x: x.strip(), subsequent_decisions)

    if last_decision.strip() not in subsequent_decisions:
      errors.append((False, 'last decision not in subsequent decisions',
        '"{x}" not in [{y}]'.format(x=last_decision, y=', '.join(subsequent_decisions))))

    if original_decision.strip() == '':
      errors.append((False, 'original decision is empty', ''))

    if location.strip() == '':
      errors.append((True, 'location may not be empty', ''))

    # TODO: verify num_components

    return errors

  def process_row(self, values):

    main, comments = values
    name, location, num_components, lead_entity, original_decision,\
      subsequent_decisions, last_decision, length, *raw_components = main
    excerpts = comments[8:]

    # TODO: remove this hack
    if lead_entity == 'DKPO':
      lead_entity = 'DPKO'

    subsequent_decisions = subsequent_decisions.split(',')
    subsequent_decisions = map(lambda x: x.strip(), subsequent_decisions)

    decisions = [original_decision.strip()] + list(subsequent_decisions)

    if length.strip() == 'Open-ended':
      expiration = None
      currentLength = length.strip()
    else:
      currentLength, datestring = length.split('- expires')
      expiration = datetime.datetime.strptime(datestring.strip(), '%d %B %Y')

    components = []

    for (label, sublabel, resolutions, excerpts) in zip(self.component_labels, self.subcomponent_labels, raw_components, excerpts):
      resolutions = resolutions.strip()
      if resolutions != '':
        if resolutions == 'Yes':
          components.append({
            'component': label
          })
        elif sublabel == '':
          print(len(excerpts))
          components.append({
            'component': label,
            'resolutions': resolutions,
            'excerpt': excerpts
          })
        else:
          print(len(excerpts))
          components.append({
            'component': label,
            'subcomponent': sublabel,
            'resolutions': resolutions,
            'excerpt': excerpts
          })

    body = {
      'name': name,
      'location': location,
      'decisions': decisions,
      'currentLength': currentLength,
      'leadEntity': lead_entity,
      'mandateComponents': components,
    }

    if expiration is not None:
      body['expiration'] = expiration.timestamp() * 1000

    return {
      'query': insertQuery,
      'variables': {
        'mandate': body
      }
    }

  def count_query(self):
    return {
      'query': countQuery
    }

  def count_keyword(self):
    return 'countMandates'


import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio
} from 'child_process'
import { promisify } from 'util'
import ExcelJS from 'exceljs'
import axios from 'axios'

// const exec = promisify(
//   spawn as (
//     command: string,
//     options?: SpawnOptionsWithoutStdio
//   ) => ChildProcessWithoutNullStreams
// )

export default class Importer {
  async runCaImport(data: Record<string, any>[]): Promise<void> {
    try {
      async function createExcel() {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Mapping')

        worksheet.columns = [
          { header: 'Rule type', key: 'ruleType', width: 20 },
          { header: 'Source', key: 'source', width: 20 },
          { header: 'CA table.element', key: 'caTableElement', width: 30 },
          { header: 'Group', key: 'group', width: 20 },
          { header: 'Options', key: 'options', width: 20 },
          { header: 'Refinery', key: 'refinery', width: 20 },
          {
            header: 'Refinery parameters',
            key: 'refineryParameters',
            width: 30
          },
          { header: 'Original values', key: 'originalValues', width: 30 },
          { header: 'Replacement values', key: 'replacementValues', width: 30 },
          { header: 'Source description', key: 'sourceDescription', width: 30 },
          { header: 'Notes', key: 'notes', width: 30 }
        ]

        // Add the mapping data rows
        worksheet.addRows([
          [
            'Mapping',
            '1',
            'ca_objects.preferred_labels',
            '',
            '',
            '',
            '',
            '',
            '',
            'Titles',
            ''
          ],
          ['Mapping', '2', 'ca_objects.idno', '', '', '', '', '', '', '', ''],
          [
            'Mapping',
            '3',
            'ca_objects.date.date_value',
            'date',
            '',
            '',
            '',
            '',
            '',
            'These dates are dates objects were created',
            ''
          ],
          [
            'Constant',
            'created',
            'ca_objects.date.date_type',
            'date',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ],
          [
            'Mapping',
            '4',
            'ca_objects.subject',
            '',
            '{"delimiter": ";"}',
            '',
            '',
            '',
            '',
            '',
            ''
          ],
          [
            'Mapping',
            '5',
            'ca_objects.description',
            '',
            '',
            '',
            '',
            '',
            '',
            'Description',
            ''
          ],
          [
            'Mapping',
            '6',
            'ca_objects.internal_notes',
            '',
            '{"skipIfEmpty": 1}',
            '',
            '',
            '',
            '',
            'Do not import empty values',
            ''
          ],
          [
            'Mapping',
            '7',
            'ca_entities',
            '',
            '',
            'entitySplitter',
            '{ "relationshipType": "creator", "entityType": "ind" }',
            '',
            '',
            'Creator',
            'Names that should be parsed'
          ],
          [
            'Mapping',
            '8',
            'ca_objects.lot_id',
            '',
            '',
            'objectLotSplitter',
            '{ "objectLotType": "gift", "attributes": { "idno_stub": "^9", "lot_status_id": "accessioned" } }',
            '',
            '',
            'Creating separate and related Object Lot Records for these gifts; taking accession numbers from column 9',
            ''
          ],
          [
            'SKIP',
            '9',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            'Accession no.',
            'These numbers merged into new object lot records'
          ],
          [
            'Mapping',
            '10',
            'ca_objects.reproduction',
            '',
            '',
            '',
            'orig repro dontknow',
            'original reproduction unknown',
            '',
            '',
            ''
          ],
          ['Setting', 'name', 'Sample mapping', '', '', '', '', '', '', '', ''],
          ['Setting', 'code', 'sample_mapping', '', '', '', '', '', '', '', ''],
          ['Setting', 'inputFormats', 'XLSX', '', '', '', '', '', '', '', ''],
          ['Setting', 'table', 'ca_objects', '', '', '', '', '', '', '', ''],
          [
            'Setting',
            'existingRecordPolicy',
            'none',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ],
          ['Setting', 'errorPolicy', 'ignore', '', '', '', '', '', '', '', ''],
          ['Setting', 'type', 'image', '', '', '', '', '', '', '', ''],
          [
            'Setting',
            'numInitialRowsToSkip',
            '1',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
          ]
        ])

        await workbook.xlsx.writeFile(
          '../providence/support/project/mappings/mapping1.xlsx'
        )
      }

      await createExcel()

      // Use shell option to execute complex commands
      const process = spawn('bash', [
        '-c',
        'cd ../providence/support && echo $(ls) && ' +
          // 'mysqldump -h localhost --port 8889 --protocol TCP -u root --password root constellate > project/backups/backup.dump && ' +
          'bin/caUtils load-import-mapping --file=project/mappings/mapping1.xlsx && ' +
          'bin/caUtils import-data --mapping=project/mappings/mapping1.xlsx --file=project/mappings/data1.xlsx --skip-duplicates'
      ])

      const stdout = process.stdout
      const stderr = process.stderr
      stdout.on('data', data => {
        console.log(`stdout: ${data}`)
      })
      stderr.on('data', data => {
        console.error(`stderr: ${data}`)
      })
    } catch (error) {
      console.error('Error running CA import:', error)
    }
  }
  async createCaData(data: Record<string, any>[]) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet()
    const caData = data.map(item => {
      const findElementText = (elementName: string): string => {
        const element = item.element_texts.find(
          el => el.element.name === elementName
        )
        return element ? element.text.replace(/<[^>]*>/g, '') : ''
      }

      return {
        Title: findElementText('Title'),
        Identifier: item.id.toString(),
        Date: findElementText('Date'),
        Subject: findElementText('Subject'),
        Description: findElementText('Description'),
        Notes: '', // No direct mapping available in the sample
        Creator:
          item.element_texts.find(el => el.element.name === 'Director')?.text ||
          '',
        Accession: '', // No direct mapping available in the sample
        AccessionNo: '', // No direct mapping available in the sample
        Reproduction:
          item.element_texts.find(el => el.element.name === 'Medium')?.text ||
          ''
      }
    })

    worksheet.columns = [
      { header: 'Title', key: 'Title', width: 20 },
      { header: 'Identifier', key: 'Identifier', width: 20 },
      { header: 'Date', key: 'Date', width: 20 },
      { header: 'Subject', key: 'Subject', width: 20 },
      { header: 'Description', key: 'Description', width: 20 },
      { header: 'Notes', key: 'Notes', width: 20 },
      { header: 'Creator', key: 'Creator', width: 20 },
      { header: 'Accession', key: 'Accession', width: 20 },
      { header: 'Accession No', key: 'AccessionNo', width: 20 },
      { header: 'Reproduction', key: 'Reproduction', width: 20 }
    ]
    worksheet.addRows(caData)
    await workbook.xlsx.writeFile(
      '../providence/support/project/mappings/data1.xlsx'
    )
  }
  constructor() {}
}

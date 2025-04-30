import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio
} from 'child_process'
import { promisify } from 'util'
import ExcelJS from 'exceljs'
import axios from 'axios'
import { stripHtmlTagsRegex } from './util'

// const exec = promisify(
//   spawn as (
//     command: string,
//     options?: SpawnOptionsWithoutStdio
//   ) => ChildProcessWithoutNullStreams
// )

export default class Importer {
  convertedItems: DACSRecord[]
  static convertItems(items: Record<string, any>[]) {
    const convertItem: (item: any) => DACSRecord = item => {
      return {
        identifier: item.id.toString(),
        title: item.element_texts.find(x => x.element.name === 'Title')?.text,
        scopeAndContent: item.element_texts
          .filter(x => x.element.name === 'Description')
          .map(x => stripHtmlTagsRegex(x.text))
          .join('\n'),
        date: item.element_texts
          .filter(x => x.element.name === 'Date')
          .map(
            x =>
              ({
                type: 'creation',
                value: x.text,
                dateRange: {
                  start: new Date(x.text),
                  end: new Date(x.text)
                }
              } as DateEntry)
          ),
        eventActors: item.element_texts
          .filter(x => x.element.name === 'Director')
          .map(
            x =>
              ({ id: x.text, name: x.text, role: 'creator' } as DACSAuthority)
          ),
        extentAndMedium: item.element_texts.find(
          x => x.element.name === 'Medium'
        )?.text,
        relatedUnitsOfDescription: item.element_texts
          .filter(
            x =>
              x.element.name === 'URL' || x.element.name === 'Is Referenced By'
          )
          .map(x => stripHtmlTagsRegex(x.text))
          .join('\n'),
        subjectAccessPoints: item.element_texts
          .filter(x => x.element.name === 'Subject')
          .map(x => stripHtmlTagsRegex(x.text)),
        specializedNote: [
          { noteType: 'dacsProcessingInformation', note: JSON.stringify(item) }
        ],
        accessConditions: 'open',
        language: 'eng',
        repository: 'Activism VHS',
        levelOfDescription: 'item',
        script: 'eng'
      }
    }
    const convertedItems: DACSRecord[] = items.map(convertItem)
    return convertedItems
  }

  constructor(items: Record<string, any>[]) {
    this.convertedItems = Importer.convertItems(items)
  }
}

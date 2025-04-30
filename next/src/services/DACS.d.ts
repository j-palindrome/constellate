/**
 * DACS Identity Section (2.1-2.7)
 */
interface DACSIdentity {
  identifier: string // 2.1.3
  repository: string
  levelOfDescription: LevelOfDescription
  title: string // 2.3.3
  date: DateEntry[] // 2.4.3
  extentAndMedium: string // 2.5.4, 2.5.5, 2.5.6
  eventActors?: DACSAuthority[]
}

interface DACSContentAndStructure {
  scopeAndContent: string
  arrangement?: string
}

interface DACSConditionsOfAccessAndUse {
  accessConditions: string
  physicalCharacteristics?: string
  technicalAccess?: string
  reproductionConditions?: string
  language: LanguageCode
  script: LanguageCode
  languageNotes?: string
  findingAids?: string
}

interface DACSAcquisitionAndAppraisal {
  archivalHistory?: string
  acquisition?: string
  appraisal?: string
  accruals?: string
}

interface DACSRelatedMaterials {
  locationOfOriginals?: string
  locationOfCopies?: string
  relatedUnitsOfDescription?: string
  relatedDescriptions?: string
  publicationNote?: string
}

interface DACSNotes {
  generalNote?: string
  specializedNote?: {
    noteType:
      | 'dacsConservation'
      | 'dacsCitation'
      | 'dacsAlphanumericDesignation'
      | 'dacsVariantTitleInformation'
      | 'dacsProcessingInformation'
    note: string
  }[]
}

interface DACSDescriptionControl {
  sources?: string[]
  rules?: string[]
  archivistNote?: string // 8.1.5
}

interface DACSAccessPoints {
  subjectAccessPoints?: string[]
  placeAccessPoints?: string[]
  genreAccessPoints?: string[]
  nameAccessPoints?: string[]
}

/**
 * Full DACS Record
 */
interface DACSRecord
  extends DACSIdentity,
    DACSContentAndStructure,
    DACSConditionsOfAccessAndUse,
    DACSAcquisitionAndAppraisal,
    DACSRelatedMaterials,
    DACSNotes,
    DACSDescriptionControl,
    DACSAccessPoints {}

// Supporting Types
type LevelOfDescription =
  | 'collection'
  | 'series'
  | 'subseries'
  | 'file'
  | 'item'
  | 'other level'

type Role = 'creator' | 'director' | 'producer' | string // e.g. 'creator', 'contributor', 'subject', etc.

interface DateEntry {
  type: 'creation' | 'publication' | 'broadcast' | 'accumulation'
  value: string
  dateRange?: {
    start: Date
    end: Date
  }
  label?: string
}

interface DACSAuthority {
  id: string
  name: string
  role: Role
}

type LanguageCode = 'eng' | 'spa' | 'fre' | 'ger' | 'ita' | 'other' // ISO 639-2 codes

'use client'

import { useState, useEffect } from 'react'
import FilterModal from './FilterModal'
import { setters, useAppStore } from '@/services/store'
import { convert } from 'three/tsl'

interface FilterPaneProps {
  records: DACSRecord[]
  onFilter: (filteredRecords: DACSRecord[]) => void
  onGroupingChange: (groupBy: string | null) => void
  onCollapse: () => void
}

// Define filter types based on DACSRecord structure
type FilterType =
  | 'title'
  | 'repository'
  | 'levelOfDescription'
  | 'identifier'
  | 'scopeAndContent'
  | 'date'
  | 'language'
  | 'nameAccessPoints'
  | 'subjectAccessPoints'
  | 'placeAccessPoints'

interface Filter {
  id: string
  type: FilterType
  value: string
}

export default function FilterPane({
  records,
  onFilter,
  onGroupingChange,
  onCollapse
}: FilterPaneProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filter[]>([])
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const convertedItems = useAppStore(state => state.convertedItems)

  // Apply filters and search whenever they change
  useEffect(() => {
    let result = [...convertedItems]

    // Apply text search across multiple fields
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(
        record =>
          record.title?.toLowerCase().includes(lowerQuery) ||
          record.scopeAndContent?.toLowerCase().includes(lowerQuery) ||
          record.identifier?.toLowerCase().includes(lowerQuery) ||
          record.repository?.toLowerCase().includes(lowerQuery)
      )
    }

    // Apply each filter
    filters.forEach(filter => {
      switch (filter.type) {
        case 'title':
          result = result.filter(r =>
            r.title?.toLowerCase().includes(filter.value.toLowerCase())
          )
          break
        case 'repository':
          result = result.filter(r =>
            r.repository?.toLowerCase().includes(filter.value.toLowerCase())
          )
          break
        case 'levelOfDescription':
          result = result.filter(r => r.levelOfDescription === filter.value)
          break
        case 'identifier':
          result = result.filter(r =>
            r.identifier?.toLowerCase().includes(filter.value.toLowerCase())
          )
          break
        case 'scopeAndContent':
          result = result.filter(r =>
            r.scopeAndContent
              ?.toLowerCase()
              .includes(filter.value.toLowerCase())
          )
          break
        case 'date':
          result = result.filter(r =>
            r.date?.some(d =>
              d.value?.toLowerCase().includes(filter.value.toLowerCase())
            )
          )
          break
        case 'language':
          result = result.filter(r => r.language === filter.value)
          break
        case 'nameAccessPoints':
          result = result.filter(r =>
            r.nameAccessPoints?.some(p =>
              p.toLowerCase().includes(filter.value.toLowerCase())
            )
          )
          break
        case 'subjectAccessPoints':
          result = result.filter(r =>
            r.subjectAccessPoints?.some(p =>
              p.toLowerCase().includes(filter.value.toLowerCase())
            )
          )
          break
        case 'placeAccessPoints':
          result = result.filter(r =>
            r.placeAccessPoints?.some(p =>
              p.toLowerCase().includes(filter.value.toLowerCase())
            )
          )
          break
      }
    })

    onFilter(result)
  }, [searchQuery, filters])

  // Update parent component when grouping changes
  useEffect(() => {
    onGroupingChange(groupBy)
  }, [groupBy, onGroupingChange])

  const addFilter = (filter: Omit<Filter, 'id'>) => {
    const newFilter = {
      ...filter,
      id: Math.random().toString(36).substr(2, 9)
    }
    setFilters([...filters, newFilter])
    setIsFilterModalOpen(false)
  }
  const selectedId = useAppStore(state => state.selectedNode)

  return (
    <div className='h-full flex flex-col text-white *:text-white bg-gray-800'>
      <div className='p-4 border-b flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Filters</h2>
        <button
          className='w-6 h-6 flex items-center justify-center'
          onClick={onCollapse}>
          &#8592;
        </button>
      </div>

      {/* Search bar */}
      <div className='p-4 border-b'>
        <input
          type='text'
          placeholder='Search archives...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='w-full p-2 border rounded'
        />
      </div>

      {/* <div className='p-4 border-b'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='font-medium'>Active Filters</h3>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className='px-2 py-1 bg-blue-500 text-white rounded text-sm'>
            + Add Filter
          </button>
        </div>

        {filters.length === 0 ? (
          <p className='text-sm text-gray-500'>No filters applied</p>
        ) : (
          <div className='space-y-2'>
            {filters.map(filter => (
              <div
                key={filter.id}
                className='flex items-center justify-between bg-gray-100 p-2 rounded'>
                <span>
                  <strong>{filter.type}:</strong> {filter.value}
                </span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className='text-red-500'>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className='p-4 border-b'>
        <h3 className='font-medium mb-2'>Group By</h3>
        <div className='flex flex-wrap gap-2'>
          {['authors', 'subjects', 'repository'].map(option => (
            <button
              key={option}
              onClick={() => setGroupBy(groupBy === option ? null : option)}
              className={`px-2 py-1 rounded text-sm ${
                groupBy === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
              {option}
            </button>
          ))}
        </div>
      </div> */}

      {/* Records table */}
      <div className='flex-grow overflow-auto p-2'>
        <h3 className='font-medium mb-2'>Records</h3>
        <div className='border rounded overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-800'>
              <tr>
                <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Title
                </th>
                <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Repository
                </th>
              </tr>
            </thead>
            <tbody className='divide-y bg-gray-800'>
              {records.map((record, i) => (
                <tr
                  onClick={() => {
                    // Handle row click
                    setters.set({
                      selectedNode:
                        selectedId === record.identifier
                          ? null
                          : record.identifier
                    })
                  }}
                  key={record.identifier || i}
                  className='hover:!bg-gray-50/50 transition-colors duration-100 cursor-pointer *:cursor-pointer select-none'>
                  <td className='px-3 py-2 whitespace-nowrap text-sm'>
                    {record.title.slice(0, 30) +
                      (record.title.length > 30 ? '...' : '')}
                  </td>
                  <td className='px-3 py-2 whitespace-nowrap text-sm'>
                    {record.repository}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter modal */}
      {isFilterModalOpen && (
        <FilterModal
          onAddFilter={addFilter}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}
    </div>
  )
}

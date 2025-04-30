'use client'

import { useState } from 'react'

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

interface FilterModalProps {
  onAddFilter: (filter: { type: FilterType; value: string }) => void
  onClose: () => void
}

export default function FilterModal({
  onAddFilter,
  onClose
}: FilterModalProps) {
  const [filterType, setFilterType] = useState<FilterType>('title')
  const [filterValue, setFilterValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filterValue.trim()) {
      onAddFilter({ type: filterType, value: filterValue.trim() })
    }
  }

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'title', label: 'Title' },
    { value: 'repository', label: 'Repository' },
    { value: 'levelOfDescription', label: 'Level of Description' },
    { value: 'identifier', label: 'Identifier' },
    { value: 'scopeAndContent', label: 'Scope and Content' },
    { value: 'date', label: 'Date' },
    { value: 'language', label: 'Language' },
    { value: 'nameAccessPoints', label: 'Names' },
    { value: 'subjectAccessPoints', label: 'Subjects' },
    { value: 'placeAccessPoints', label: 'Places' }
  ]

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium'>Add Filter</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Filter Type
            </label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as FilterType)}
              className='w-full p-2 border rounded'>
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Filter Value
            </label>
            <input
              type='text'
              value={filterValue}
              onChange={e => setFilterValue(e.target.value)}
              className='w-full p-2 border rounded'
              placeholder='Enter filter value...'
            />
          </div>

          <div className='flex justify-end space-x-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border rounded text-gray-700'>
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded'>
              Add Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

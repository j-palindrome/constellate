'use client'

import { useState, useEffect } from 'react'

import { useAppStore } from '../services/store'
import FilterPane from './FilterPane'
import ForceGraph from './ForceGraph'

export default function ArchiveVisualizer() {
  const { convertedItems } = useAppStore()
  const [filteredRecords, setFilteredRecords] =
    useState<DACSRecord[]>(convertedItems)
  const [groupByOption, setGroupByOption] = useState<string | null>(null)
  const [isPaneCollapsed, setIsPaneCollapsed] = useState(false)

  // Update filtered records when store items change
  useEffect(() => {
    setFilteredRecords(convertedItems)
  }, [convertedItems])

  return (
    <div className='flex h-full'>
      <div
        className={`transition-all duration-300 bg-white border-r ${
          isPaneCollapsed ? 'w-10' : 'w-96'
        } h-full`}>
        {isPaneCollapsed ? (
          <button
            className='w-10 h-10 flex items-center justify-center'
            onClick={() => setIsPaneCollapsed(false)}>
            &#8594;
          </button>
        ) : (
          <FilterPane
            records={convertedItems}
            onFilter={setFilteredRecords}
            onGroupingChange={setGroupByOption}
            onCollapse={() => setIsPaneCollapsed(true)}
          />
        )}
      </div>

      <div className='flex-grow h-full'>
        <ForceGraph records={filteredRecords} groupBy={groupByOption} />
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import ArchiveVisualizer from '../components/ArchiveVisualizer'
import Importer from '@/services/Importer'
import { setters } from '@/services/store'

export default function Client({ data }: { data: any }) {
  const importer = useMemo(() => {
    const importer = new Importer(data)
    return importer
  }, [data])
  useEffect(() => {
    setters.setConvertedItems(importer.convertedItems)
  }, [importer])
  return (
    <main className='flex min-h-screen flex-col items-center justify-between'>
      <div className='z-10 w-full max-w-full font-mono text-sm'>
        {/* <h1 className='text-2xl font-bold mb-4'>Archive Data Visualization</h1> */}

        <div className='w-full h-screen'>
          <ArchiveVisualizer />
        </div>
      </div>
    </main>
  )
}

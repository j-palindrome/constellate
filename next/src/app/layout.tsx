import type { Metadata } from 'next'
import { Roboto, Roboto_Mono } from 'next/font/google'
import './globals.css'
import axios from 'axios'
import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio
} from 'child_process'
import { promisify } from 'util'
import ExcelJS from 'exceljs'
import Importer from '@/services/createExporter'

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin']
})

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Archilume',
  description: 'Archival Visualization'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const response = await axios.request({
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://activismvhs.omeka.net/api/items?collection=3',
    headers: {}
  })

  const importer = new Importer()
  // sample
  importer.createCaData(response.data)
  importer.runCaImport(response.data)

  return (
    <html lang='en'>
      <body className={`${roboto.variable} ${robotoMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}

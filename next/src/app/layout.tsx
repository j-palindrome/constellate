import type { Metadata } from 'next'
import { Roboto, Roboto_Mono, Dosis } from 'next/font/google'
import './globals.css'
import axios from 'axios'
import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio
} from 'child_process'
import { promisify } from 'util'
import ExcelJS from 'exceljs'
import Importer from '@/services/Importer'

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin']
})

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin']
})

const dosis = Dosis({
  variable: '--font-dosis',
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
  return (
    <html lang='en'>
      <body className={`${dosis.variable} antialiased`}>{children}</body>
    </html>
  )
}

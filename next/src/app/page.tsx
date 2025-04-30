import axios from 'axios'
import Importer from '@/services/Importer'
import Client from './client'
import { writeFile } from 'fs/promises'
import { existsSync, readFileSync } from 'fs'

export default async function Home() {
  const response = await axios
    .request({
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://activismvhs.omeka.net/api/items?collection=3',
      headers: {}
    })
    .catch(err => {
      if (!existsSync('public/data.json')) {
        return {
          data: [
            JSON.parse(readFileSync('src/app/resources/sample.json').toString())
          ]
        }
      }
      return { data: JSON.parse(readFileSync('public/data.json').toString()) }
    })
  writeFile('public/data.json', JSON.stringify(response.data))

  return <Client data={response.data} />
}

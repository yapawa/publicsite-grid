'use strict'


import got from 'got'
import { readFileSync, rmSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
const contentPath = 'content'
import {parse} from 'toml'

const parseConfig = () => {
  const hugoConfig = parse(readFileSync('./config.toml'))
  if (process.env.HUGO_PARAMS_API) {
    hugoConfig.params.api = process.env.HUGO_PARAMS_API
  }
  if (process.env.HUGO_PARAMS_CACHEDOMAIN) {
    hugoConfig.params.cacheDomain = process.env.HUGO_PARAMS_CACHEDOMAIN
  }
  return hugoConfig
}

const getData = async (api) => {
  const response = await got(`${api}albums/list`).json()
  return response
}

const clearContent = (path) => {
  try {
    rmSync(path, { recursive: true })
  } catch {}
  mkdirSync(path, { recursive: true })
}

const frontMatter = (item, config) => {
  const data = {
    title: item.name,
    event: item.event,
    slug: item.slug.toLowerCase(),
    summary: item.summary ? item.summary.replace(/\n+/, '\n') : null,
    description: item.description ? item.description.replace(/\n+/, '\n') : null,
    contentType: item.type,
    type: 'gallery',
    date: item.createdAt,
    lastmod: item.updatedAt,
    publishDate: item.publishedAt,
    draft: false,
    albumId: item.id,
    weight: item.weight,
    covers: [],
    aliases: [
      `/${item.type === 'collection' ? 'sets' : 'albums'}/${item.slug}/`
    ]
  }
  if (item.covers) {
    data.covers = item.covers.map(cover => {
      return {
        file: {
          key: cover.file.key
        },
        width: cover.width,
        height: cover.height,
        gravity: cover.gravity,
        slug: cover.slug.toLowerCase(),
        updatedAt: cover.updatedAt
      }
    })
    data.images = item.covers.map(cover => {
      return `https://${config.params.cacheDomain}/${cover.file.key}/${Math.round(Date.parse(cover.updatedAt) / 1000)}/w_768,h_768/${cover.slug.toLowerCase()}.jpg`
    })
  }
  if (item.id === 'root') {
    data.linkTitle = 'Home'
  }
  clean(data)
  return JSON.stringify(data, null, 2)
}

const storeContent = (item, config) => {
  const fm = frontMatter(item, config)
  const baseDir = [contentPath, ...item.path]
  const fileName = (item.id === 'root') ? '_index.md' : (item.type === 'collection') ? join(item.slug.toLowerCase(), '_index.md') : `${item.slug.toLowerCase()}.md`
  const filePath = join(...baseDir, fileName).toLowerCase()
  mkdirSync(dirname(filePath), { recursive: true })

  writeFileSync(filePath, fm)
}

const clean = obj => {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName]
    }
  }
}

(async () => {
  const config = parseConfig()
  const list = await getData(config.params.api)
  clearContent(contentPath)
  for (const item of list) {
    storeContent(item, config)
  }
})()

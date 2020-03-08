'use strict'

const got = require('got')
const fs = require('fs')
const path = require('path')
const contentPath = 'content'
const toml = require('toml')

const parseConfig = () => {
  return toml.parse(fs.readFileSync('./config.toml'))
}

const getData = async (api) => {
  const response = await got(`${api}albums/list`).json()
  return response
}

const clearContent = (path) => {
  fs.rmdirSync(path, { recursive: true })
  fs.mkdirSync(path, { recursive: true })
}

const frontMatter = (item, config) => {
  const data = {
    title: item.name,
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
    covers: []
  }
  if (item.covers) {
    data.covers = item.covers.map(cover => {
      return {
        file: {
          key: cover.file.key
        },
        width: cover.width,
        height: cover.height,
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
  const fileName = (item.id === 'root') ? '_index.md' : (item.type === 'collection') ? path.join(item.slug.toLowerCase(), '_index.md') : `${item.slug.toLowerCase()}.md`
  const filePath = path.join(...baseDir, fileName).toLowerCase()
  fs.mkdirSync(path.dirname(filePath), { recursive: true })

  fs.writeFileSync(filePath, fm)
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

const express = require('express')
const axios = require('axios')
const cherrio = require('cheerio')
const { Validator, ValidationError } = require("express-json-validator-middleware")
const { Sequelize } = require('sequelize')
const basicAuth = require('./middlewares/basic-auth')
const cors = require('cors')
const logger = require('./middlewares/logger')
const errorHandler = require('./middlewares/error-handler')

const { validate } = new Validator()
const sequelize = new Sequelize('assignment', 'root', 'root', {
    host: '0.0.0.0',
    port: 3306,
    dialect: 'mariadb'
})
const app = express()

const models = require('./models')(sequelize)
models.syncAll()
app.use(cors());
app.use(express.json());
app.use(basicAuth)
app.use(logger)

const PORT = process.env.port || 3000

const scrapRequestSchema = {
    type: "object",
    required: ["urls"],
    properties: {
        urls: {
            type: "array",
            items: {
                type: "string",
                format: "uri"
            }
        }
    }
}

const processImg = ($) => {
    const imgList = []
    $('img').each(function (i, e) {
        imgList.push($(this).attr('src'))
        if ($(this).attr('data-src')) {
            imgList.push($(this).attr('data-src'))
        }
    });
    const filtered = imgList.filter(img => img.startsWith('http') || img.startsWith('https'))
    return filtered
}

const processVideo = ($) => {
    const videoList = []
    $('video').each(function (i, e) {
        if ($(this).attr('src') && ($(this).attr('src').startsWith('http') || $(this).attr('src').startsWith('https'))) {
            videoList.push($(this).attr('src'))
        } else if ($(this).attr('data-src') && ($(this).attr('data-src').startsWith('http') || $(this).attr('data-src').startsWith('https'))) {
            videoList.push($(this).attr('data-src'))
        }
    })
    return videoList
}

const persistData = async (data) => {
    try {
        await sequelize.transaction(async t => {
            // persist execution
            const execution = await models.Execution.create({}, { transaction: t });

            const { videos, images } = data
            videoModelList = []
            await Promise.all(Object.keys(videos).map(async siteUrl => {
                const [site, created] = await models.Site.findOrCreate({ where: { url: siteUrl, executionId: execution.id }, transaction: t })
                const videosInSite = videos[siteUrl].map(videoUrl => ({
                    url: videoUrl,
                    siteId: site.id,
                    executionId: execution.id
                }))
                videoModelList = videoModelList.concat(videosInSite)
                console.log(videoModelList)
            }))

            await models.Video.bulkCreate(videoModelList, { transaction: t })

            imageModelList = []
            await Promise.all(Object.keys(images).map(async siteUrl => {
                const [site, created] = await models.Site.findOrCreate({ where: { url: siteUrl, executionId: execution.id }, transaction: t })
                const imagesInSite = images[siteUrl].map(imageUrl => ({
                    url: imageUrl,
                    siteId: site.id,
                    executionId: execution.id
                }))
                imageModelList = imageModelList.concat(imagesInSite)
            }))
            await models.Image.bulkCreate(imageModelList, { transaction: t })
        })
    } catch (error) {
        throw new Error('Error persisting data.')
    }
}

app.post(
    "/scrap",
    validate({ body: scrapRequestSchema }),
    async function (request, response, next) {
        const urls = request.body.urls;
        let result = {
            videos: {},
            images: {}
        }
        await Promise.all(urls.map(async (url) => {
            try {
                const res = await axios(url)
                const data = res.data
                const $ = cherrio.load(data)
                result.images[url] = processImg($)
                result.videos[url] = processVideo($)
            } catch (error) {
                console.log(error, error.message)
            }
        }))
        try {
            await persistData(result)
            response.json({ status: 'OK' })
            next()
        } catch (error) {
            next(error)
        }
    }
);

app.get(
    "/executions",
    async function (request, response, next) {
        const pageIndex = request.query.pageIndex ? parseInt(request.query.pageIndex) : 1
        const pageSize = request.query.pageSize ? parseInt(request.query.pageSize) : 10
        try {
            const result = await models.Execution.findAndCountAll({
                order: [
                    ['id', 'DESC']
                ],
                limit: pageSize,
                offset: (pageIndex - 1) * pageSize
            })
            response.json(result)
            next()
        } catch (error) {
            next(error)
        }

    }
)

app.get(
    "/images",
    async function (request, response, next) {
        if (!request.query.executionId) {
            response.status(400).send('executionId is required!')
            next()
        }
        const pageIndex = request.query.pageIndex ? parseInt(request.query.pageIndex) : 1
        const pageSize = request.query.pageSize ? parseInt(request.query.pageSize) : 10
        try {
            const result = await models.Image.findAndCountAll({
                where: {
                    executionId: parseInt(request.query.executionId)
                },
                order: [
                    ['id', 'DESC']
                ],
                limit: pageSize,
                offset: (pageIndex - 1) * pageSize
            })
            response.json(result)
            next()
        } catch (error) {
            next(error)
        }

    }
)

app.get(
    "/videos",
    async function (request, response, next) {
        if (!request.query.executionId) {
            response.status(400).send('executionId is required!')
            next()
        }
        const pageIndex = request.query.pageIndex ? parseInt(request.query.pageIndex) : 1
        const pageSize = request.query.pageSize ? parseInt(request.query.pageSize) : 10
        try {
            const result = await models.Video.findAndCountAll({
                where: {
                    executionId: parseInt(request.query.executionId)
                },
                order: [
                    ['id', 'DESC']
                ],
                limit: pageSize,
                offset: (pageIndex - 1) * pageSize
            })
            response.json(result)
            next()
        } catch (error) {
            next(error)
        }

    }
)

app.use(errorHandler)

app.use('/', require('./controller/user.controller'))

app.listen(PORT, () => {
    console.log(`server is running on PORT:${PORT}`)
})
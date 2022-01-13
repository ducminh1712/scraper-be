// Global model loader
module.exports = (sequelize) => {
    let models = {
        Execution: require('./execution')(sequelize),
        Site: require('./site')(sequelize),
        Image: require('./image')(sequelize),
        Video: require('./video')(sequelize),
    }

    // setup relationship
    models.Site.belongsTo(models.Execution)
    models.Image.belongsTo(models.Site)
    models.Image.belongsTo(models.Execution)
    models.Video.belongsTo(models.Site)
    models.Video.belongsTo(models.Execution)

    models.syncAll = async (options) => {
        for (let key in models) {
            if (models[key].sync) {
                await models[key].sync(options)
            }
        }
    }
    return models
}
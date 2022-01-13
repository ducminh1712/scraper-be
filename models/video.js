const Sequelize = require('sequelize')


module.exports = (sequelize) => {
    const Video = sequelize.define('videos',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            url: {
                type: Sequelize.STRING,
                allowNull: false
            }
        },
        {
            freezeTableName: true
        })
    return Video
}
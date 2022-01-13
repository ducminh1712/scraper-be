const Sequelize = require('sequelize')


module.exports = (sequelize) => {
    const Site = sequelize.define('sites',
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
    return Site
}
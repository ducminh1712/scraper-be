const Sequelize = require('sequelize')


module.exports = (sequelize) => {
    const Image = sequelize.define('executions',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            notes: {
                type: Sequelize.TEXT
            }
        },
        {
            freezeTableName: true
        })
    return Image
}
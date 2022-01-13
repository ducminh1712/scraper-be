const Sequelize = require('sequelize')


module.exports = (sequelize) => {
    const Image = sequelize.define('images',
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
    return Image
}
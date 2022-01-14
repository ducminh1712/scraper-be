## Features

- Authorize API requests using Basic Auth.
- Produce formatted log for every requests.
- Store data in MariaDB

## Install dependencies

```sh
npm install
```

## How to run

- Setup database connection in app.js:
```js
const sequelize = new Sequelize('{DB_NAME}', '{DB_USER}', '{DB_PASSWORD}', {
    host: '{DB_HOST}',
    port: {DB_PORT},
    dialect: 'mariadb'
})
```

- Start server:
```sh
npm start
```

- Run with nodemon:
```sh
npm start-nodemon
```


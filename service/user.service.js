const users = [{
    id: 1,
    username: 'minh',
    password: 'minh'
}]

const authenticate = async ({username, password}) => {
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
        const {password, ...userWithoutPassword} = user;
        return userWithoutPassword;
    }
}

module.exports = {
    authenticate
}
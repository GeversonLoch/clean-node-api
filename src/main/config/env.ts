export default {
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/',
    dbName: process.env.DB_NAME || 'clean-node-api',
    port: process.env.PORT || 5050,
}
module.exports = {
    secretKey: "[B@c7e553bygframework",
    development: {
        ip: "192.168.1.2",
        port: 3035,
        db: {
            host: "localhost",
            port: 37017,
            protocol: "mongodb",
            user: "",
            password: "",
            database: "lotusknits",
            connectionLimit: 100
        },
        applink: "http://localhost:3035/",
        mailer: {
            host: "ssl://smtp.googlemail.com",
            port: 465,
            auth: {
                user: "test@gmail.com",
                pass: "test"
            },
            defaultFromAddress: "testing@gmail.com"
        }
    },
    production: {
        ip: "192.168.1.2",
        port: 3030,
        db: {
            host: "localhost",
            port: 27017,
            protocol: "mongodb",
            user: "",
            password: "",
            database: "lotusknits",
            connectionLimit: 100
        },
        applink: "http://localhost:3035/",
        mailer: {
            host: "ssl://smtp.googlemail.com",
            port: 465,
            auth: {
                user: "test@gmail.com",
                pass: "test"
            },
            defaultFromAddress: "testing@gmail.com"
        }
    },
    preview: {
        ip: "74.208.81.83",
        port: process.env.PORT, //3031,
        db: {
            host: "localhost",
            port: 37017,
            protocol: "mongodb",
            user: "",
            password: "",
            database: "lotusknits",
            connectionLimit: 100
        },
        applink: "http://lotusknits.myprojectpreview.space:3031/",
        mailer: {
            host: "ssl://smtp.googlemail.com",
            port: 465,
            auth: {
                user: "test@gmail.com",
                pass: "test"
            },
            defaultFromAddress: "testing@gmail.com"
        }
    }
};
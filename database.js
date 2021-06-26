const mysql = require('mysql');


const con = mysql.createConnection({
	host: "nunops.com",
	user: 'nunops_specialsal',
	password: 'XLd-F!w@$qtq',
    charset: 'utf8mb4'
});

module.exports = {
    con
}
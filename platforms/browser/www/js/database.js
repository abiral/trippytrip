window.db = null;
store = {
    install : (successCB, errorCB) => {
        db.transaction(function(tx){
            tx.executeSql( 'CREATE TABLE IF NOT EXISTS users ( \
                email TEXT NOT NULL, \
                password TEXT NOT NULL, \
                first_name TEXT NOT NULL, \
                last_name TEXT NOT NULL, \
                mobile TEXT, \
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
            );' );
            
            tx.executeSql( 'CREATE TABLE IF NOT EXISTS ads ( \
                title TEXT NOT NULL, \
                price TEXT, \
                travellers TEXT, \
                category TEXT, \
                photo TEXT, \
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
            );' );
        }, errorCB, successCB);
    },

    verifyUser: (email, password, successCB, errorCB) => {
        db.transaction(function(tx){
            let sql = `SELECT rowid, * FROM users WHERE email = "${email}" AND password = "${password}"`;
            tx.executeSql( sql, [], successCB, errorCB );
        });
    },

    createUser: (payload, successCB, errorCB) => {
        db.transaction(function(tx){
            let sql = `INSERT INTO users 
            (email, password, first_name, last_name, mobile)
            VALUES (
                "${payload.email}",
                "${payload.password}",
                "${payload.first_name}",
                "${payload.last_name}",
                "${payload.mobile}"
            )`;
            tx.executeSql(sql, [], successCB, errorCB);
        });
    },
    
    getAds: (successCB, errorCB) => {
        db.transaction(function(tx){
            tx.executeSql( 'SELECT rowid, * FROM ads', [], successCB, errorCB );
        });
    },

    getAdsByID: (id, successCB, errorCB) => {
        db.transaction(function(tx){
            let sql = `SELECT rowid, * FROM ads WHERE rowid = ${id}`;
            tx.executeSql(sql, [], successCB, errorCB );
        });
    },

    searchAds: (text, successCB, errorCB) => {
        db.transaction(function(tx){
            let sql = `SELECT rowid, * FROM ads WHERE title LIKE '%${text}%' OR category LIKE '%${text}%'`;
            tx.executeSql(sql, [], successCB, errorCB );
        });
    },

    createAds: (payload, successCB, errorCB ) => {
        db.transaction(function(tx){
            let sql = `INSERT INTO ads 
            (title, price, travellers, category, photo ) 
            VALUES (
                '${payload.title}', 
                '${payload.price}', 
                ${payload.travellers}, 
                '${payload.category}', 
                '${payload.photo}'
                )`;


            tx.executeSql(sql,[], successCB, errorCB);
        });
    },

    deleteAds: ( ID, successCB, errorCB ) => {
        db.transaction(function(tx){
            tx.executeSql( `DELETE FROM ads WHERE rowid = ${ID}`, [], successCB, errorCB );
        });
    },
}

document.addEventListener("deviceready", () => {
    window.db = window.openDatabase("trippytrip", "1.0", "Trippy Trip", 1000000);
    let storage = window.localStorage;
    let IsDbInstalled = storage.getItem("IsTrippyInstalled");
    db.transaction(function(tx){
        /*tx.executeSql( 'DROP TABLE users' );
        tx.executeSql( 'DROP TABLE ads' );
        storage.removeItem("IsDbInstalled");
        storage.removeItem("user");*/

        if(IsDbInstalled == null || IsDbInstalled == 0){  
            store.install(() => {
                storage.setItem("IsTrippyInstalled", 1);
            }, err => { console.error(err); });
        }
    });
}, false);
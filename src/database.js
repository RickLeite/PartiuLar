import oracledb from 'oracledb';
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


export async function run() {

    const connection = await oracledb.getConnection ({
        user          : "BOOTCAMP",
        password      : "102030ian",
        connectString : "localhost/XEPDB1"
    });

    return connection
}


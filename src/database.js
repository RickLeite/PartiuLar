import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'partiular',
    password: 'Adm1nPassw0rd',
    port: 5432,
});

export async function run() {
    const client = await pool.connect();
    return client;
}

export async function query(text, params) {
    const client = await pool.connect();
    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
}
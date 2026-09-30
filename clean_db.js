const fs = require('fs');
let env = '';
try {
  env = fs.readFileSync('c:/Users/Fabrizio/Desktop/app/smart/v14/.env.development', 'utf8');
} catch(e) {
  env = fs.readFileSync('c:/Users/Fabrizio/Desktop/app/smart/v14/.env', 'utf8');
}
const dbUrl = env.split('\n').find(l => l.startsWith('DATABASE_URL')).split('=')[1].trim();

const { Client } = require('pg');
const client = new Client({ connectionString: dbUrl });
client.connect().then(async () => {
    console.log('Connected to DB!');
    
    const res = await client.query(`
        SELECT tmdb_id FROM tmdb_series s
        WHERE NOT EXISTS (
            SELECT 1 FROM tmdb_episodes e WHERE e.series_tmdb_id = s.tmdb_id
        )
    `);
    
    console.log('Corrupted series:', res.rows);
    
    if (res.rows.length > 0) {
        const ids = res.rows.map(r => r.tmdb_id);
        await client.query('DELETE FROM tmdb_series WHERE tmdb_id = ANY($1)', [ids]);
        console.log('Deleted corrupted series:', ids);
    }
    
    client.end();
}).catch(console.error);

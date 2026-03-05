import fetch from 'node-fetch';

async function run() {
    const [a, s] = await Promise.all([
        fetch("http://localhost:3000/api/admin/attempts").then(r => r.text()),
        fetch("http://localhost:3000/api/admin/submissions").then(r => r.text())
    ]);
    console.log('ATTEMPTS:', a);
    console.log('SUBMISSIONS:', s);
}
run();

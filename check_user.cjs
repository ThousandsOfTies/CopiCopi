const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0809048670/databases/(default)/documents/users/JSdcyM1WycXGYiySHgz91z4G3a22';
const token = process.argv[2];
fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(console.error);

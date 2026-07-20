const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0809048670/databases/(default)/documents/users/JSdcyM1WycXGYiySHgz91z4G3a22?updateMask.fieldPaths=cancelAtPeriodEnd&updateMask.fieldPaths=currentPeriodEnd';
const token = process.argv[2];
const body = {
  fields: {
    cancelAtPeriodEnd: { booleanValue: true },
    currentPeriodEnd: { integerValue: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }
  }
};
fetch(url, { 
  method: 'PATCH', 
  headers: { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
})
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(console.error);

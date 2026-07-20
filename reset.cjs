const token = process.argv[2];
const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0809048670/databases/(default)/documents/users';

async function reset() {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await r.json();
  if (!data.documents) {
    console.log('No documents found or error:', data);
    return;
  }
  for (const doc of data.documents) {
    // Delete stripe fields and set isPremium to false
    const updateUrl = `https://firestore.googleapis.com/v1/${doc.name}?updateMask.fieldPaths=isPremium&updateMask.fieldPaths=entitlements`;
    const payload = {
      fields: {
        isPremium: { booleanValue: false }
        // omitting stripe fields so they are effectively deleted (actually we need to use updateMask to delete them)
      }
    };
    
    // To actually DELETE fields using updateMask without providing them in fields object, we just list them in updateMask and omit them in payload.
    const fullUpdateUrl = `https://firestore.googleapis.com/v1/${doc.name}?updateMask.fieldPaths=isPremium&updateMask.fieldPaths=stripeCustomerId&updateMask.fieldPaths=stripeSubscriptionId&updateMask.fieldPaths=entitlements`;
    
    const patchRes = await fetch(fullUpdateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log(`Reset ${doc.name}:`, await patchRes.json());
  }
}
reset().catch(console.error);

const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0809048670/databases/(default)/documents/users';
const token = '<REMOVED_TOKEN>.a0ARGnu0bpLWAouk-JER91mxdSYpxzWNp1SPaZxccKlQd_v0RyK11UPzJeXIzA1-k31pv3wljnEoGficp-3b-K40ikah6YRbDY9CkXHYvyOoHT_Iy5mkThZXmlYptHnhfpLR9cPbNyQUQx1-JtrgkE-F0h5OpmJ01PGGxeSK5kAKCxCvM1Z_MSuJEgrT9j8HMX7BPFC5rwDq2k-ZQaCgYKAfgSARcSFQHGX2MisrYBl1yVQAfGDvm2P3z5Fw0214';
async function fix() {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await r.json();
  for (const doc of data.documents) {
    if (doc.fields.isPremium && doc.fields.isPremium.booleanValue) {
      const updateUrl = `https://firestore.googleapis.com/v1/${doc.name}?updateMask.fieldPaths=entitlements.copicopi.isPremium&updateMask.fieldPaths=entitlements.copicopi.stripeCustomerId&updateMask.fieldPaths=entitlements.copicopi.stripeSubscriptionId`;
      const payload = {
        fields: {
          entitlements: {
            mapValue: {
              fields: {
                copicopi: {
                  mapValue: {
                    fields: {
                      isPremium: { booleanValue: true },
                      stripeCustomerId: doc.fields.stripeCustomerId,
                      stripeSubscriptionId: doc.fields.stripeSubscriptionId
                    }
                  }
                }
              }
            }
          }
        }
      };
      await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log('Fixed', doc.name);
    }
  }
}
fix().catch(console.error);

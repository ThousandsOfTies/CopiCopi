const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'gen-lang-client-0809048670' });
async function fix() {
  const users = await admin.firestore().collection('users').get();
  for (const doc of users.docs) {
    const data = doc.data();
    if (data.isPremium) {
      await doc.ref.update({
        'entitlements.copicopi.isPremium': true,
        'entitlements.copicopi.stripeCustomerId': data.stripeCustomerId,
        'entitlements.copicopi.stripeSubscriptionId': data.stripeSubscriptionId,
      });
      console.log(`Fixed user ${doc.id}`);
    }
  }
}
fix().catch(console.error);

const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0809048670/databases/(default)/documents/users';
const token = '<REMOVED_TOKEN>.a0ARGnu0bpLWAouk-JER91mxdSYpxzWNp1SPaZxccKlQd_v0RyK11UPzJeXIzA1-k31pv3wljnEoGficp-3b-K40ikah6YRbDY9CkXHYvyOoHT_Iy5mkThZXmlYptHnhfpLR9cPbNyQUQx1-JtrgkE-F0h5OpmJ01PGGxeSK5kAKCxCvM1Z_MSuJEgrT9j8HMX7BPFC5rwDq2k-ZQaCgYKAfgSARcSFQHGX2MisrYBl1yVQAfGDvm2P3z5Fw0214';
fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);

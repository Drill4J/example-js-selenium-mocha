import dns from 'dns';
export async function dnsLookup(host: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(host, (err, address) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(address);
    });
  });
}

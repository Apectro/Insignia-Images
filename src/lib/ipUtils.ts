import { Address4, Address6 } from 'ip-address';

export function normalizeIP(ip: string): string {
  // Special handling for localhost
  if (ip === '::1' || ip === '127.0.0.1') {
    return 'localhost';
  }

  try {
    // Try parsing as IPv6
    const ipv6 = new Address6(ip);
    if (Address6.isValid(ip)) {
      return ipv6.correctForm();
    }
  } catch {
    // If it's not a valid IPv6, it might be IPv4
  }

  try {
    // Try parsing as IPv4
    const ipv4 = new Address4(ip);
    if (Address4.isValid(ip)) {
      // Convert IPv4 to IPv6 mapped address for consistent comparison
      return `::ffff:${ipv4.correctForm()}`;
    }
  } catch {
    // If it's not a valid IPv4 either, return the original string
  }

  return ip;
}

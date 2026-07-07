/** Loads Cloudflare Web Analytics when NEXT_PUBLIC_CF_BEACON_TOKEN is set. */
export default function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN?.trim();
  if (!token) return null;

  let beaconConfig: string;
  try {
    beaconConfig = JSON.stringify({ token });
    JSON.parse(beaconConfig);
  } catch {
    return null;
  }

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={beaconConfig}
    />
  );
}

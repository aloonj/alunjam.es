# Sky FTTP with OPNsense

Getting Sky FTTP working with OPNsense is straightforward once you know the correct settings. Sky uses DHCP Option 61 for authentication instead of PPPoE, and you'll need both IPv4 and IPv6 configured.

## Requirements

- OPNsense firewall
- Sky FTTP connection
- Direct connection from OPNsense WAN port to Openreach ONT

**Note: Sky Voice/VoIP will not work without the Sky router.**

## IPv4 Configuration

Navigate to `Interfaces → WAN` and ensure DHCP is selected as the IPv4 Configuration Type.

Scroll down to `Lease Requirements` and enter the following in the `Send Options` field:

```
dhcp-client-identifier "anything@skydsl|anything"
```

You can use any text before and after the `@skydsl|` separator. Sky only checks for that specific string. For example:

```
dhcp-client-identifier "myrouter@skydsl|mypassword"
```

[Screenshot: DHCPv4 Lease Requirements section with Send Options filled in]

Leave the `Hostname` field blank or enter a hostname of your choice. Keep other settings at their defaults.

## IPv6 Configuration

On the same WAN interface, enable DHCPv6 as the IPv6 Configuration Type.

Configure the following settings:

- **Prefix delegation size**: 56
- **Request prefix only**: Checked

[Screenshot: DHCPv6 configuration showing prefix size 56 and Request prefix only checked]

Sky provides a /56 IPv6 prefix but does not provide a global IPv6 address on the WAN interface (link-local only).

## Prevent Release Setting

This step is critical to prevent Sky from changing your IPv6 prefix allocation.

Go to `Interfaces → Settings` and find the `IPv6 DHCP` section. Enable the `Prevent Release` option.

[Screenshot: Interfaces Settings page showing Prevent Release option enabled]

Sky's DHCPv6 servers use sticky addresses. If OPNsense sends a release signal, your allocated prefix will likely change.

## Apply and Test

Save all settings and apply the configuration. Your OPNsense firewall should now connect directly to the Openreach ONT and obtain both IPv4 and IPv6 connectivity.

Check `Interfaces → Overview` to verify you have:

- An IPv4 address assigned to WAN
- An IPv6 prefix delegated (you won't see a global IPv6 address on WAN, only link-local)

[Screenshot: Interface overview showing active WAN connection with IPv4 and IPv6]

## Troubleshooting

If the connection fails:

- Verify the Option 61 string includes `@skydsl|` exactly as shown
- Ensure both IPv4 and IPv6 are enabled on the WAN interface
- Check that prefix delegation size is set to 56, not 64
- If switching from a Sky router, wait 5-10 minutes before attempting to connect with OPNsense
- Confirm the cable is connected directly from OPNsense WAN to the Openreach ONT

## Reference

Based on the official [OPNsense documentation](https://docs.opnsense.org/manual/how-tos/SkyUK.html)

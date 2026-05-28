# Installing Bun on RHEL 8 in Air-Gapped Environments

This guide explains how to install [Bun](https://bun.sh) (including `bunx`) on Red Hat Enterprise Linux 8 in a fully air-gapped (offline) environment.

## Overview

Bun is distributed as a single pre-built binary. In air-gapped environments you cannot use the standard one-liner installer, so you must download the binary on a machine with internet access and transfer it manually.

## Recommended Approach (System-Wide)

### 1. Download on a Machine with Internet

On a machine that has internet access, run the following commands:

```bash
# Pin a specific version (recommended)
BUN_VERSION="1.2.2"

# For x86_64 (most common on RHEL)
curl -L "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-x64.zip" \
  -o bun-linux-x64.zip

# For aarch64 (ARM64)
# curl -L "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-aarch64.zip" \
#   -o bun-linux-aarch64.zip
```

Transfer the `.zip` file to the air-gapped RHEL 8 machine (USB drive, secure copy from a jump host, etc.).

### 2. Install on the Air-Gapped RHEL 8 System

Run the following commands on the target RHEL 8 server:

```bash
# Install unzip if it is not already present (common on minimal RHEL installs)
sudo dnf install -y unzip

# Extract the binary
unzip bun-linux-x64.zip

# Install the Bun binary system-wide
sudo mv bun /usr/local/bin/bun
sudo chmod +x /usr/local/bin/bun

# Create the `bunx` wrapper script
sudo tee /usr/local/bin/bunx > /dev/null << 'EOF'
#!/usr/bin/env bash
exec /usr/local/bin/bun x "$@"
EOF
sudo chmod +x /usr/local/bin/bunx
```

### 3. Verify the Installation

```bash
bun --version
bunx --version
```

### 4. (Optional) Ensure `/usr/local/bin` is in PATH

On most RHEL 8 systems this is already the case. If needed, you can make it persistent:

```bash
echo 'export PATH="/usr/local/bin:$PATH"' | sudo tee /etc/profile.d/bun.sh
source /etc/profile.d/bun.sh
```

## Alternative: Per-User Installation

If you prefer not to install system-wide:

```bash
mkdir -p ~/.bun/bin
unzip bun-linux-x64.zip -d ~/.bun/bin
chmod +x ~/.bun/bin/bun

# Create bunx wrapper
cat > ~/.bun/bin/bunx << 'EOF'
#!/usr/bin/env bash
exec ~/.bun/bin/bun x "$@"
EOF
chmod +x ~/.bun/bin/bunx

# Add to PATH (add to ~/.bashrc or ~/.bash_profile for persistence)
export PATH="$HOME/.bun/bin:$PATH"
```

## Important Notes for RHEL 8 Air-Gapped Environments

- **Unzip package**: Minimal RHEL 8 installations often do not include `unzip`. You will need to obtain the RPM and its dependencies from your RHEL 8 ISO, Satellite, or internal package repository.
- **Version pinning**: Always download a specific release rather than using `latest`. This makes future upgrades deliberate and auditable.
- **Architecture**: Be sure to download the correct binary (`x64` vs `aarch64`).
- **glibc compatibility**: RHEL 8 ships with glibc 2.28. Recent Bun releases are generally compatible, but you should test in your environment.
- **SELinux**: If SELinux is enforcing, you may need to run:
  ```bash
  sudo restorecon -v /usr/local/bin/bun
  sudo restorecon -v /usr/local/bin/bunx
  ```
- **Updates**: Because the environment is air-gapped, upgrading Bun will require repeating the download + transfer process.

## References

- Official Bun releases: https://github.com/oven-sh/bun/releases
- Bun documentation: https://bun.sh/docs

---

**Last updated**: 2026-05-27
**Applies to**: RHEL 8 (x86_64 / aarch64) in air-gapped networks

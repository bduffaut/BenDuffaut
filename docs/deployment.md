# Deployment

The site runs as a Docker container on the home server. Cloudflare Tunnel connects it to the internet with nothing open on the router. Every push to `main` that passes CI publishes a new image to GitHub Container Registry, and the server pulls it within about two minutes.

Everything here is free: GitHub Actions and GHCR for a public repo, Cloudflare Tunnel, Email Routing and Turnstile, and Gmail SMTP.

## 1. GitHub

1. The public repo is `bduffaut/BenDuffaut`. Every push to `main` runs CI.
2. The first push to `main` runs CI and publishes `ghcr.io/bduffaut/benduffaut` (the repo name, lowercased). Then open **Packages → benduffaut → Package settings**, set visibility to **Public**, and check that the package is linked to the repo. A public image lets the server pull without credentials.
3. Optional build settings live under **Settings → Secrets and variables → Actions → Variables**. These are public values baked into the HTML:
   - `SITE_URL`: defaults to `https://benduffaut.com`
   - `UMAMI_WEBSITE_ID`: after step 6
   - `TURNSTILE_SITE_KEY`: if you turn on Turnstile (step 7)

## 2. The server

On the Linux laptop, with Docker and Compose already installed:

```sh
git clone https://github.com/bduffaut/BenDuffaut.git ~/benduffaut.com
cd ~/benduffaut.com
cp .env.example .env    # then fill it in, see below
docker compose pull
docker compose up -d
curl localhost:3000/healthz     # {"ok":true,...}
```

The server only needs `compose.yaml`, `deploy/` and `.env` from the repo. The site itself comes from the image.

Since it's a laptop, make sure it survives a closed lid and a reboot:

```sh
sudo sed -i 's/^#\?HandleLidSwitch=.*/HandleLidSwitch=ignore/' /etc/systemd/logind.conf
sudo systemctl restart systemd-logind
sudo systemctl enable docker
```

## 3. Cloudflare Tunnel

`mysite.benduffaut.com` already runs through a tunnel. The cleanest move is to run the tunnel inside this compose stack, so the whole site is one `docker compose up`.

1. Cloudflare dashboard → **Zero Trust → Networks → Tunnels**. Open the existing tunnel, or create one named `benduffaut` (type Cloudflared).
2. Copy its token (the long string after `--token` in the install command) into `.env` as `CLOUDFLARE_TUNNEL_TOKEN`.
3. Under **Public hostnames**, add:
   - `benduffaut.com` → `HTTP` → `site:3000`
   - `www.benduffaut.com` → `HTTP` → `site:3000` (the app redirects www to the bare domain)
   - Remove `mysite.benduffaut.com` once the new site is up.
4. If the old tunnel runs elsewhere (a systemd `cloudflared` service or another container), stop it so it isn't serving the same tunnel: `sudo systemctl disable --now cloudflared`.
5. Start it all: `docker compose --profile tunnel up -d`

Cloudflare creates the DNS records for those hostnames automatically.

**Keeping the host's existing cloudflared instead?** Skip the `tunnel` profile and point the public hostnames at `http://localhost:3000`. The site port is published on localhost for exactly this.

## 4. Automatic deploys

A systemd timer runs `deploy/auto-update.sh` every 2 minutes. It pulls the latest image and recreates the container only if the image changed.

```sh
chmod +x ~/benduffaut.com/deploy/auto-update.sh
# Edit User= and the ExecStart path in the .service file to match your user and home folder
sudo cp ~/benduffaut.com/deploy/benduffaut-update.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now benduffaut-update.timer
journalctl -u benduffaut-update -f      # watch deploys
```

Your user needs to be in the `docker` group (`sudo usermod -aG docker $USER`, then log in again).

To roll back, pin an older build in `.env` (`SITE_IMAGE=ghcr.io/bduffaut/benduffaut:sha-abc1234`) and run `docker compose up -d`. Remove the line to follow `latest` again.

## 5. Email

**Receiving at ben@benduffaut.com.** In Cloudflare, go to **benduffaut.com → Email → Email Routing**, enable it (it adds the MX records), and create `ben@benduffaut.com` forwarding to `ben.duffaut@gmail.com`. Confirm the verification email.

**Sending from the contact form.** The form sends through Gmail SMTP using an app password:

1. Turn on 2-step verification for the Google account.
2. Create an app password at <https://myaccount.google.com/apppasswords>.
3. Put it in `.env` as `NUXT_CONTACT_SMTP_PASS`. The other `NUXT_CONTACT_*` defaults in `.env.example` are already set for Gmail.
4. `docker compose up -d`, then send yourself a test message from the site.

Messages arrive from your Gmail address with Reply-To set to the visitor, so hitting reply answers them.

## 6. Analytics (Umami)

Umami and its Postgres database run in the `analytics` profile. At portfolio traffic levels they use about 250 to 400 MB of RAM and almost no CPU, so the laptop won't notice. Memory limits in `compose.yaml` cap them anyway.

```sh
# in .env
UMAMI_DB_PASSWORD=$(openssl rand -hex 32)
UMAMI_APP_SECRET=$(openssl rand -hex 32)

docker compose --profile tunnel --profile analytics up -d
```

1. Open the dashboard. It's only published on the server's localhost, so from your Mac run `ssh -L 3001:localhost:3001 <server>` and open <http://localhost:3001>.
2. Log in as `admin` / `umami` and **change the password right away**.
3. Add a website for `benduffaut.com` and copy its Website ID.
4. Set it as the `UMAMI_WEBSITE_ID` repository variable (step 1.3) and re-run CI, or push anything.

The tracker loads from `/stats/script.js` on the site itself and the site proxies it to Umami, so Umami needs no public hostname. If you'd like the dashboard reachable from anywhere, add a tunnel hostname such as `stats.benduffaut.com` → `umami:3000` and protect it with a free Cloudflare Access policy limited to your email.

**Backups to the external drive.** For example, nightly from root's crontab:

```cron
15 3 * * * docker compose -f /home/ben/benduffaut.com/compose.yaml exec -T umami-db pg_dump -U umami umami | gzip > /mnt/external/backups/umami-$(date +\%F).sql.gz
```

## 7. Turnstile (optional)

If the contact form starts getting spam: Cloudflare → **Turnstile → Add widget** for `benduffaut.com`. Put the site key in the `TURNSTILE_SITE_KEY` repository variable and the secret key in `.env` as `NUXT_CONTACT_TURNSTILE_SECRET`. The form shows the check only when the site key is set.

## Troubleshooting

| Symptom                       | Check                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Site down                     | `docker compose ps`, `docker compose logs site`, `curl localhost:3000/healthz`                             |
| Cloudflare 502/1033           | `docker compose logs cloudflared`; are the public hostnames pointed at `site:3000`?                        |
| Deploys not happening         | `systemctl list-timers benduffaut-update*`, `journalctl -u benduffaut-update`; is the GHCR package public? |
| Contact form says unavailable | SMTP variables in `.env`; `docker compose logs site \| grep contact`                                       |
| No analytics                  | Is `UMAMI_WEBSITE_ID` set and the image rebuilt? Is the `analytics` profile running?                       |

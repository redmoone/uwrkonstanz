# Production deployment

Push to `main` builds the Linux standalone application in GitHub Actions and deploys it to http://78.141.212.242:3000. The Blazor application on port 80 remains independently managed.

Repository Actions secrets:

- `UWR_DEPLOY_SSH_KEY`: private key of the dedicated `uwrdeploy` account.
- `UWR_DEPLOY_KNOWN_HOSTS`: verified SSH host-key entry for the server.

Optional Actions variables: `UWR_SERVER_URL`, `UWR_DEPLOY_HOST`, `UWR_DEPLOY_USER`. If the public URL changes, update both `UWR_SERVER_URL` and `/srv/uwrkonstanz/shared/app.env`, then rebuild.

Server paths:

- `/opt/uwr-node`: Node.js 22 runtime.
- `/srv/uwrkonstanz/current`: active standalone release.
- `/srv/uwrkonstanz/shared/app.env`: production secret and environment, outside Git.
- `/srv/uwrkonstanz/shared/data/uwr.db`: production SQLite database.
- `/srv/uwrkonstanz/shared/media`: persistent CMS uploads.
- `/srv/uwrkonstanz/backups`: seven latest pre-deployment database backups.
- `/usr/local/bin/uwrkonstanz-deploy`: release activation and health check.

Inspect: `systemctl status uwrkonstanz` and `journalctl -u uwrkonstanz -n 100`.

For contact-form email delivery, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM_ADDRESS` and, where needed, `SMTP_USER` / `SMTP_PASSWORD` in `shared/app.env`, then restart the service. Port 465 uses implicit TLS; port 587 requires STARTTLS. `SMTP_SECURE` can override implicit TLS. Set the shared recipient in CMS **Website-Einstellungen → Kontakt-E-Mail / Verteiler**, or use `CONTACT_TO_EMAIL` in the environment. Without a configured recipient, active trainer email addresses receive the message together. Keep SMTP credentials out of Git. The form only confirms success after SMTP accepts delivery; check the mailbox and provider logs when activating the production configuration.

Payload runs committed production migrations on initialization. After changing collections or fields, run `pnpm migrate:create meaningful-name`, review and commit the generated migration files. Never run development schema push against production. A failed health check restores the previous application release; schema changes require separate recovery from the saved SQLite backup.

The first deployment starts with a new production database and listens on loopback until its owner registers the initial administrator. Use `ssh -L 3301:127.0.0.1:3000 root@78.141.212.242`, open `http://localhost:3301/admin`, and create the administrator yourself. Deploy again to publish on port 3000. Local development data and logins are not automatically published.

This IP/port endpoint uses HTTP. Use a domain and HTTPS before using the CMS for normal administration. The existing Ubuntu 20.10 installation also needs a separately planned upgrade to a supported release.

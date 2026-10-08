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

Payload runs committed production migrations on initialization. After changing collections or fields, run `pnpm migrate:create meaningful-name`, review and commit the generated migration files. Never run development schema push against production. A failed health check restores the previous application release; schema changes require separate recovery from the saved SQLite backup.

The first deployment starts with a new production database. The setup creates random credentials in `/srv/uwrkonstanz/shared/initial-admin.txt`; the application listens on loopback until the deployment registers this first administrator. Local development data and logins are not automatically published. Change the temporary administrator email and password after signing in.

This IP/port endpoint uses HTTP. Use a domain and HTTPS before using the CMS for normal administration. The existing Ubuntu 20.10 installation also needs a separately planned upgrade to a supported release.

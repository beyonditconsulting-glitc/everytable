# Deploying to Namecheap Stellar Plus (cPanel)

This guide walks through getting this app running on a Namecheap **Stellar
Plus** shared hosting plan, using cPanel's **Setup Node.js App** feature and
**Git™ Version Control** for one-click updates.

The GitHub repo (`beyonditconsulting-glitc/everytable`) is public, so cPanel
doesn't need any credentials to clone it.

> **Merge the PR into `main` first.** These steps deploy whatever is on the
> `main` branch, so merge [PR #1](https://github.com/beyonditconsulting-glitc/everytable/pull/1)
> before step 3.

## 1. Create the Node.js app

In cPanel, go to **Software → Setup Node.js App → Create Application**, and
fill in:

| Field | Value |
|---|---|
| Node.js version | 20.x or newer (the app requires Node ≥ 20.9) |
| Application mode | Production |
| Application root | `nodeapp` (or any folder name — just remember it) |
| Application URL | the domain or subdomain you want the app on |
| Application startup file | `server.js` |

Click **Create**. cPanel will show you something like:

```
To run commands in the virtual environment, run the command:
source /home/YOURUSERNAME/nodevenv/nodeapp/20/bin/activate && cd /home/YOURUSERNAME/nodeapp
```

**Write down your actual username, the app folder name, and the Node version
number shown here** — you'll need them in step 4.

### Optional: Google Places API key

If you have a `GOOGLE_PLACES_API_KEY`, add it now on this same page under
**Environment variables**: name `GOOGLE_PLACES_API_KEY`, value your key. If
you skip this, the app automatically uses OpenStreetMap instead (free, no
key needed).

## 2. Set up Git Version Control

Go to **Files → Git™ Version Control → Create**:

| Field | Value |
|---|---|
| Clone a Repository | ✅ enabled |
| Clone URL | `https://github.com/beyonditconsulting-glitc/everytable.git` |
| Repository Path | `repos/everytable` (a **different** folder than your Application root from step 1) |
| Branch | `main` |

Click **Create**. cPanel clones the repo into that path.

## 3. Edit `.cpanel.yml` for your account

The repo includes a `.cpanel.yml` deploy script, but it has placeholder
values that only work once you fill in what step 1 gave you. On your server
(via cPanel's **Terminal**, or File Manager's built-in editor), open:

```
/home/YOURUSERNAME/repos/everytable/.cpanel.yml
```

and replace:

- `CPANEL_USERNAME` → your actual cPanel username (shown in step 1)
- `nodeapp` (both places) → the Application root folder name you chose in step 1
- `20` → the Node version number cPanel showed you in step 1

Save it. (This step is a one-time setup — after this, deploys are just one
click.)

## 4. Deploy

Back in **Git™ Version Control**, click **Manage** on your repository, then
the **Pull or Deploy** tab, then **Deploy HEAD Commit**.

This runs the tasks in `.cpanel.yml`: copies the code into your Application
root, installs dependencies, runs the production build, and restarts the
app.

## 5. Visit your site

Open the Application URL you set in step 1. You should see the store setup
screen.

To deploy future updates (after merging more changes into `main` on
GitHub): **Git™ Version Control → Manage → Pull or Deploy → Update from
Remote**, then **Deploy HEAD Commit** again.

## Troubleshooting

- **Blank page / error page**: check **Setup Node.js App → your app → the
  log file path shown there** (stderr log) for the actual error.
- **"Cannot find module" errors**: the `npm install` step in `.cpanel.yml`
  may not have run with the right Node version — double check the
  `source .../nodevenv/...` path you set in step 3 matches exactly what
  cPanel showed in step 1.
- **Changes not showing up**: after any deploy, cPanel needs to restart the
  app — `.cpanel.yml` does this automatically by touching `tmp/restart.txt`,
  but you can also click **Restart** on the Setup Node.js App page manually.
- **Nothing to do with Overpass/OpenStreetMap being unreachable**: shared
  hosting generally allows normal outbound internet access (unlike some
  sandboxed dev environments), so live lead search should work out of the
  box. If it doesn't, the app automatically falls back to clearly-labeled
  demo data rather than failing.

## Data storage note

Store profiles and promo codes are stored in a local file,
`<Application root>/data/db.json`. This persists across deploys (it isn't
part of the Git repo), but it's a single file with no redundancy — it's
worth occasionally downloading a copy via File Manager as a backup.

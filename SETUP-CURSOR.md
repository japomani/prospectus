# Open prospectus as its own Cursor repository

Cursor sidebar **Repositories** = workspace folders tied to a **git remote**.  
You do not create them in GitHub settings â€” you **Open Workspace** on a cloned repo.

## 1. Install Git (one time)

https://git-scm.com/download/win

Restart Cursor after install.

## 2. Clone prospectus (prospectus-only â€” not vibecode)

In PowerShell:

```powershell
cd C:\Users\10618071\Projects
# optional: rename old folder if you created files there manually
Rename-Item prospectus prospectus-backup -ErrorAction SilentlyContinue
git clone https://github.com/japomani/prospectus.git prospectus
```

Now `prospectus` has `.git` and `origin` â†’ `japomani/prospectus`.

## 3. Add it in Cursor (Glass / Agents window)

1. Left sidebar â†’ **Open Workspace** (under Repositories)
2. Select: `C:\Users\10618071\Projects\prospectus`
3. Click **New Agent** (or start a chat in that folder)

Sidebar should show **prospectus** as its own repository block â€” separate from **vibecode**.

## 4. Cloud agents (optional)

- Breadcrumb should be **prospectus â†’ main â†’ Cloud** (not vibecode)
- GitHub â†’ Settings â†’ Applications â†’ **Cursor** â†’ grant access to **prospectus** only

## 5. Sidebar grouping tip

If entries look confusing: sidebar **Customize â†’ Group by â†’ Workspace** (shows folder names).

## Do not

- Open `vibecode` when you only want prospectus (pulls submodule + Cloud auth issues)
- Expect a separate â€œCreate Cursor repoâ€ button â€” **Open Workspace + git clone** is the flow

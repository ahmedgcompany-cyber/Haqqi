# Google OAuth Setup — Click-by-Click Guide

## Part A: Create OAuth Credentials in Google Cloud Console

1. Open browser tab: https://console.cloud.google.com/
2. Sign in with your Google account
3. If a "Welcome" popup appears, click **Maybe later**
4. If asked to "Select or create a project", click the project dropdown at top of page
   - If no project exists, click **New Project**
   - Name it `haqqi-oauth` (or anything)
   - Click **Create**
   - Wait 5 seconds, then refresh the page if the project does not auto-select
5. In left sidebar, hover **APIs & Services**, then click **Credentials**
6. At top of page, click **+ Create Credentials** → **OAuth client ID**
7. If you see "To create an OAuth client ID, you must first configure your consent screen":
   - Click **Configure consent screen**
   - Select **External** → click **Create**
   - **App name**: type `Haqqi`
   - **User support email**: select your email from dropdown
   - **Developer contact email**: type your email address
   - Click **Save and Continue** (top right)
   - On Scopes page, click **Save and Continue**
   - On Test users page, click **Save and Continue**
   - On Summary page, click **Back to Dashboard**
   - Click **Publish App** at top (not "Testing") → confirm **Confirm**
8. Now back at Credentials page. Click **+ Create Credentials** → **OAuth client ID** again
9. **Application type**: select **Web application**
10. **Name**: type `Haqqi Web Client`
11. **Authorized JavaScript origins**:
    - Click **+ Add URI**
    - Type `http://localhost:3000`
    - Click **+ Add URI**
    - Type `https://your-domain.com` (your future Netlify URL)
12. **Authorized redirect URIs**:
    - Click **+ Add URI**
    - Type `https://xrzpumjjiwsvddrabaps.supabase.co/auth/v1/callback`
    - Click **+ Add URI**
    - Type `http://localhost:3000/api/auth/callback`
    - Click **+ Add URI**
    - Type `https://your-domain.com/api/auth/callback` (your future Netlify URL)
13. Click **Create**
14. A popup shows **Your Client ID** and **Your Client Secret**
15. Click the copy icon next to **Client ID** and paste it somewhere safe (Notepad)
16. Click **Download JSON** and save the file — this has both keys inside

---

## Part B: Enable Google Provider in Supabase

1. Open browser tab: https://supabase.com/dashboard/project/xrzpumjjiwsvddrabaps
2. In left sidebar, click **Authentication** (shield icon)
3. Click **Providers** in the submenu
4. Find **Google** in the list
5. Click the **Enable** toggle to turn it **ON**
6. **Client ID**: paste the Client ID you copied from Google Cloud Console
7. **Secret**: paste the Client Secret from the JSON file you downloaded (open it in Notepad, find `client_secret` value)
8. Click **Save**

---

## Part C: Add Redirect URLs in Supabase

1. In the same Supabase dashboard, still under **Authentication**, click **URL Configuration**
2. **Site URL**: type `http://localhost:3000`
3. **Redirect URLs** section:
   - Click **+ Add URL**
   - Type `http://localhost:3000/api/auth/callback`
   - Click **+ Add URL**
   - Type `https://your-domain.com/api/auth/callback` (replace with your real Netlify URL later)
4. Click **Save**

---

## Part D: Test Locally

1. In terminal: `npm run dev`
2. Open browser: http://localhost:3000/en/auth/login
3. Click **Continue with Google**
4. If it works, you will be redirected to the dashboard

---

# GitHub OAuth Setup — Click-by-Click Guide

## Part A: Create OAuth App in GitHub

1. Open: https://github.com/settings/developers
2. Click **OAuth Apps** tab
3. Click **New OAuth App**
4. **Application name**: type `Haqqi`
5. **Homepage URL**: type `http://localhost:3000`
6. **Authorization callback URL**: type `https://xrzpumjjiwsvddrabaps.supabase.co/auth/v1/callback`
7. Click **Register application**
8. On the next page, click **Generate a new client secret**
9. Copy the **Client ID** and **Client Secret** into Notepad

## Part B: Enable in Supabase

1. Supabase dashboard → Authentication → Providers
2. Find **GitHub** in the list
3. Toggle **Enable** to ON
4. Paste **Client ID** and **Secret**
5. Click **Save**

---

# Microsoft (Azure) OAuth Setup — Click-by-Click Guide

## Part A: Create App in Azure Portal

1. Open: https://portal.azure.com/
2. Sign in with Microsoft account
3. In top search bar, type `app registrations` and click it
4. Click **+ New registration**
5. **Name**: type `Haqqi`
6. **Supported account types**: select **Accounts in any organizational directory and personal Microsoft accounts**
7. **Redirect URI**:
   - Platform: select **Web**
   - URI: type `https://xrzpumjjiwsvddrabaps.supabase.co/auth/v1/callback`
8. Click **Register**
9. On the app page, copy **Application (client) ID** to Notepad
10. Click **Certificates & secrets** in left sidebar
11. Click **+ New client secret**
12. **Description**: type `haqqi-secret`
13. **Expires**: select **24 months**
14. Click **Add**
15. Copy the **Value** (not the Secret ID) immediately — it disappears if you leave the page

## Part B: Enable in Supabase

1. Supabase → Authentication → Providers
2. Find **Azure** in the list
3. Toggle **Enable** to ON
4. **Client ID**: paste the Application ID from Azure
5. **Secret**: paste the client secret value you copied
6. **Tenant URL**: leave blank or type `common`
7. Click **Save**

---

# Apple OAuth Setup — Click-by-Click Guide

This is the hardest one. Skip it if you are new — the other three providers cover 99% of users.

If you still want it, I can write a separate guide. Let me know.

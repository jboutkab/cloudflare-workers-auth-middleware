# Cloudflare Worker Authentication with Hono & Okta

This is a **Cloudflare Worker** built with **Hono** that handles authentication using **Okta OAuth2**. It serves login pages, manages session tokens via cookies, and protects backend routes.

## ✨ Features
- ✅ **Authentication with Okta** (`client_id` & `client_secret`)
- ✅ **Session-based authentication using secure cookies**
- ✅ **Protected `/backend` route (requires login)**
- ✅ **Custom 404 handler for unhandled routes**
- ✅ **Uses [Hono](https://hono.dev/) for routing**
- ✅ **Environment variables managed securely with `wrangler secret`**

---

## 📦 **Installation**

### **1. Clone the Repository**
```sh
git clone https://github.com/your-repo/cloudflare-auth-worker.git
cd cloudflare-auth-worker
```

### **2. Install Dependencies**
```sh
npm install hono
```

---

## ⚙️ **Configuration**

### **Set Up Environment Variables**
Cloudflare Workers support **two ways** to set environment variables:

#### **Option 1: Use `wrangler secret` (Recommended for Security)**
Store secrets securely in Cloudflare using **`wrangler secret put`**:

```sh
wrangler secret put OKTA_ISSUER
wrangler secret put OKTA_CLIENT_ID
wrangler secret put OKTA_CLIENT_SECRET
```

You'll be prompted to enter values for each secret.

#### **Option 2: Use `.dev.vars` (For Local Development Only)**
For local development, create a `.dev.vars` file in the root:

```
OKTA_ISSUER="https://your-okta-domain/oauth2/default"
OKTA_CLIENT_ID="your-okta-client-id"
OKTA_CLIENT_SECRET="your-okta-client-secret"
```

---

## 🚀 **Deploy the Worker**

### **1. Run Locally (For Testing)**
```sh
wrangler dev
```
Visit:
```
http://127.0.0.1:8787/login
```

### **2. Deploy to Cloudflare**
```sh
wrangler deploy
```
Once deployed, access:
- **Login Page:** `https://auth-worker.YOUR_SUBDOMAIN.workers.dev/login`
- **Backend (Protected):** `https://auth-worker.YOUR_SUBDOMAIN.workers.dev/backend`

---

## 🌍 **Project Structure**
```plaintext
cloudflare-auth-worker/
│── wrangler.toml      # Cloudflare Worker config
│── src/
│   ├── index.js       # Hono Worker API
│── .dev.vars          # Local Environment Variables
│── README.md          # Deployment Guide
│── package.json       # Project Dependencies
│── node_modules/      # Installed npm packages
```

---

## 🛠 **Endpoints**
| Route          | Description |
|---------------|-------------|
| `/`           | **Redirects to `/login`** |
| `/login`      | **Serves login page (HTML inside worker)** |
| `/auth`       | **Handles authentication via Okta** |
| `/backend`    | **Protected page (requires login)** |
| `/logout`     | **Clears session and redirects to `/login`** |
| `*` (catch-all) | **Protected page (requires login)**|

---


---

## 💡 **Future Improvements**
Break this into microservices and use Cloudflare workers binding with a middleware fronting the other services (auth, session handling, proxy backend...)


---



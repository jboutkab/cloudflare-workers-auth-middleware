import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

const app = new Hono();

const SESSION_COOKIE = "session_token";

//Check if user is authenticated
const authMiddleware = async (c, next) => {
  const session = getCookie(c, SESSION_COOKIE);

  if (!session) {
    return c.redirect("/login");
  }

  await next();
};

// Login Page
app.get("/login", (c) => {
  return c.html(`
     <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          text-align: center;
          background: #fff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          width: 400px;
        }
        .logo {
          width: 200px;
          margin-bottom: 20px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        input {
          padding: 15px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: calc(100% - 32px);
          box-sizing: border-box;
        }
        button {
          padding: 15px;
          font-size: 16px;
          color: #fff;
          background-color: #007bff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://portal.cloudflarepartners.com/images/logos/Cloudflare-logo2.png" alt="Cloudflare Logo" class="logo">
        <h1>Login</h1>
        <form method="POST" action="/auth">
          <input type="text" id="username" name="username" placeholder="Username" required>
          <input type="password" id="password" name="password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

//  Handle Authentication Okta
app.post("/auth", async (c) => {
    try {
      const body = await c.req.parseBody();
      const username = body.username;
      const password = body.password;
  
      if (!username || !password) {
        console.error("Missing credentials");
        return c.text("Missing credentials", 400);
      }
  
      console.log("Authenticating user:", username);
  
      // Authenticate with Okta OAuth2
      const response = await fetch(`${c.env.OKTA_ISSUER}/v1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "password",
          client_id: c.env.OKTA_CLIENT_ID,
          client_secret: c.env.OKTA_CLIENT_SECRET,
          username,
          password,
          scope: "openid profile email",
        }),
      });
  
      console.log("Okta Response Status:", response.status);
      const tokenData = await response.json();
      console.log("Okta Response Data:", tokenData);
  
      if (!response.ok || !tokenData.access_token) {
        console.error("Authentication failed:", tokenData);
        //return c.text("Invalid login", 401);
        return c.redirect("/");
      }
  
      // Issue a session cookie with the Okta access token
      setCookie(c, "session_token", tokenData.access_token, {
        httpOnly: true,
        secure: true,
        path: "/",
      });
  
      return c.redirect("/");
    } catch (error) {
      console.error("Internal Error in /auth:", error);
      return c.text("Internal Server Error", 500);
    }
  });
  
  

//Logout
app.get("/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE);
  return c.redirect("/login");
});

// Mock  the backend
app.all("*", authMiddleware, (c) => {
  const session = getCookie(c, SESSION_COOKIE);
  return c.html(`
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backend Access</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      background: #fff;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      width: 400px;
    }
    .logo {
      width: 200px;
      margin-bottom: 20px;
    }
    .token-box {
      background: #e9ecef;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      word-break: break-word;
      font-size: 14px;
      margin-top: 10px;
    }
    .btn {
      display: block;
      padding: 15px;
      font-size: 16px;
      color: #fff;
      background-color: #007bff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      margin-top: 20px;
    }
    .btn:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://portal.cloudflarepartners.com/images/logos/Cloudflare-logo2.png" alt="Cloudflare Logo" class="logo">
    <h1>Backend Access</h1>
    <p>✅ You have successfully accessed the backend.</p>
    <p><strong>Session Token:</strong></p>
    <div class="token-box">${session}</div>
    <a href="/logout" class="btn">Logout</a>
  </div>
</body>
</html>
  `);
});

export default app;

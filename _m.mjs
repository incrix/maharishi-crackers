import { SignJWT } from "jose"; import fs from "fs";
const e={}; for(const l of fs.readFileSync(".env.local","utf8").split("\n")){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)e[m[1]]=m[2];}
const now=Math.floor(Date.now()/1000);
console.log(await new SignJWT({role:"admin"}).setProtectedHeader({alg:"HS256",typ:"JWT"}).setSubject("ui").setIssuer("maharishi-admin").setAudience("maharishi-panel").setIssuedAt(now).setNotBefore(now).setExpirationTime(now+3600).setJti(crypto.randomUUID()).sign(new TextEncoder().encode(e.ADMIN_JWT_SECRET)));

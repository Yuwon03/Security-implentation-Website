// lib/pinnedClient.ts
import https from "https";
import axios from "axios";
import fs   from "fs";
import { createHash } from "crypto";
import path from "path";

const DEV_MODE = false;
const KNOWN_FINGERPRINTS = "w9N51ntJHhB3IOd+UwI6mb1cXklPncFPAX1U+C2GCHQ=";

const MKCERT_DIR = path.join(
  process.env.HOME || "", 
  "Library", 
  "Application Support", 
  "mkcert"
);

const CA_PATH = path.join(MKCERT_DIR, "rootCA.pem");
const ROOT_CA = fs.readFileSync(CA_PATH, "utf8");

export const pinnedApi = axios.create({
  baseURL: "https://localhost:8000",
  httpsAgent: new https.Agent({
    rejectUnauthorized: true,
    ca: ROOT_CA,
    checkServerIdentity(hostname, cert) {
      const actual = createHash("sha256").update(cert.raw).digest("base64");
      if (DEV_MODE) {
        console.log("Certificate Fingerprint:", actual);
        
        if (!KNOWN_FINGERPRINTS.includes(actual)) {
          console.warn(
            "Certificate pinning mismatch: got ${actual}\n" +
            "Expected one of: ${KNOWN_FINGERPRINTS}"
          );
        }
        
        return undefined; 
      }

      if (!KNOWN_FINGERPRINTS.includes(actual)) {
        return new Error(
          "Certificate pinning mismatch: got ${actual}"
        );
      }
      return undefined;
    },
  }) as any,
});

pinnedApi.interceptors.response.use(
    response => response, 
    error => {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message;
      
      return Promise.reject(new Error(errorMessage));
    }
  );
  
  
  pinnedApi.interceptors.response.use(
    response => response, 
    error => {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message;
      
      return Promise.reject(new Error(errorMessage));
    }
  );
# CyberShield Threat Test Links

Use these links to test the detection capabilities of the project. None of these use the word "example".

| URL | Detection Score | Reason |
| :--- | :--- | :--- |
| `http://secure-bank-verify.icu` | 100/100 | Insecure protocol, Risky TLD (.icu), Keywords (secure, bank, verify) |
| `http://account-login-update.top` | 100/100 | Insecure protocol, Risky TLD (.top), Keywords (account, login, update) |
| `http://paypal-security-check.xyz` | 80/100 | Risky TLD (.xyz), ML sensitive word (paypal) |
| `http://official-verification-portal.monster` | 70/100 | Risky TLD (.monster), Keyword (verify) |

## How to Test
1. Start the server: `cd server && npm start`
2. Start the ML service: `cd ml_service && python train_and_eval.py` (to ensure model exists) then `python server.py` (if it exists)
3. Open the Dashboard and use the **AI Threat Intelligence Scan** tool with any of the links above.
4. Or run the verification script: `node server/final_verify.js`

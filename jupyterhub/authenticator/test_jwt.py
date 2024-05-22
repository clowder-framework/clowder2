import json
import urllib.request

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError, JWTError

response = urllib.request.urlopen("")

if response.code >= 200 or response <= 299:
    encoding = response.info().get_content_charset("utf-8")
    result = json.loads(response.read().decode(encoding))
    public_key = (
        f"-----BEGIN PUBLIC KEY-----\n"
        f"{result['public_key']}\n"
        f"-----END PUBLIC KEY-----"
    )
else:
    print("Could not get key from keycloak.")


access_token = ""

# make sure it is a valid token
if len(access_token.split(" ")) != 2 or access_token.split(" ")[0] != "Bearer":
    print("Token format not valid, it has to be bearer xxxx!")

# decode jwt token instead of sending it to userinfo endpoint:
access_token = access_token.split(" ")[1]

try:
    decoded = jwt.decode(access_token, public_key, audience="clowder")
    print(decoded)

except ExpiredSignatureError:
    print("JWT Expired Signature Error: token signature has expired")
except JWTClaimsError:
    print("JWT Claims Error: token signature is invalid")
except JWTError:
    print("JWT Error: token signature is invalid")
except Exception:
    print("Not a valid jwt token!")

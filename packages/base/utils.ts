import proto from 'https://esm.sh/@replit/protocol?target=deno';
import { createRequire } from "https://deno.land/std@0.119.0/node/module.ts";
const require = createRequire(import.meta.url);
const { Buffer } = require("buffer");

export function parseToken(token: string): proto.api.ReplToken {
  // We cannot use the paseto libraries since they only work in Node. We only
  // need to extract the information, not verify it.
  const parts = token.split('.');
  if (parts.length !== 4) {
    throw new Error('Invalid token: should have exactly 4 parts: ' + token);
  }

  // PASETO are encoded with URL-safe base64 encoding. Undo that
  // transformation so that our trusty friend window.atob() can understand
  // it.
  let encoded = parts[2].replace(/-/g, '+').replace(/_/g, '/');
  while (encoded.length % 4) {
    encoded += '=';
  }

  const decoded = atob(encoded);
  const SODIUM_CRYPTO_SIGN_BYTES = 64;
  if (decoded.length < SODIUM_CRYPTO_SIGN_BYTES) {
    throw new Error(
      'Invalid token: signed part is too short: ' + decoded.length,
    );
  }

  const tokenPayload = decoded.substring(
    0,
    decoded.length - SODIUM_CRYPTO_SIGN_BYTES,
  );
  console.log(tokenPayload);
  try {
    return proto.api.ReplToken.decode(new Buffer(tokenPayload, 'base64'));
  } catch (e) {
    console.error(e);
    return <proto.api.ReplToken>{};
  }
}
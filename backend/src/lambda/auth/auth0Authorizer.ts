import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'
const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJSAdPAcia0sY7MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFm1ybmdvY2h1dS51cy5hdXRoMC5jb20wHhcNMjIwNzI1MTUzNTEwWhcNMzYw
NDAyMTUzNTEwWjAhMR8wHQYDVQQDExZtcm5nb2NodXUudXMuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2UpwmMlZ9z1I2WcORCMe3EeT
Lwqvl3poGPD+80TCpXf/nzOtutTRO8Pd1yrPQE4g9KSOXc3AnArGYt1FA2Yu4HdP
xWFjODVxh4Dt1sizuG4lMDRu/HWZ8o10QnwanLDCyRiLC8OwfGIsfv4K6HH9NV0p
Q3g+2jFvJkyUCrHe3PyOmPrTg8OgI3UPqEq3/VaBGHbOoW9aIaPFWB3nBU51HN41
FjsompPtZ4tPqvjd/NRdQeOro5tpczvDIvYSJaHlib+xLn0szK9UzeohgciXQJCr
GXzFCjz5oYC1aOxJTca4y6QL2KsiZGgyGh5HGfn0NYA1BFKJRJfemNBfO+tgywID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTo3uXQmc+9ozW64ZAc
iRErjyKngzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAHomX9q8
6t9Faw4lwfg3puW5c/uN9tMgt9q7vmr6T8QbDsipqAx3Eh4WQ25x56i4jMitWPLJ
0yOGBuSkDCHUugoS5wKFKZe9sw9jK6alyuHPghYfSL6CR2Wxg4uBbNfM0GOLEcHu
j8nlVQAuCM+XeR/K+BgjbMOvMbhSshuoe9/EfaF8jX2LFRuwiokpYokU19v0eIuM
6Oq6KegsxYb5o6rZliUKs7xBgRXsGpPnpAv2vdRVcLADAptMMgejhYh7V6yTpjRN
ynLME51inYm4Ys+NoipFytubF+b8N0EvEMg09UR0nbKEw5sG5LMOVyG1CBDx7q+V
/Sectadop4/uSt8=
-----END CERTIFICATE-----` 

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

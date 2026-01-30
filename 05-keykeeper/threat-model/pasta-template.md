# PASTA Template (lightweight)

## 1. Objectives

The primary objective of this application is to allow teams to store and retreive secrets. From a security perspective, these secrets
must be only viewable to authorized users, and the secrets vault should only be able to be modified by users with edit/admin priveleges. As such, strong user verification is required, to prevent malicious actors from vieweing these secrets. Secrets access must also be properly monitored; there must be a history of users' secrets access to enforce non-repudiation. This application should be available constantly to support development, and therefore measures should be put in place for steps to be taken in case of application breach/shutdown.

## 2. Technical scope

The application uses a frontend React application with a localStorage, an Express.js API Server, JWT authentication middleware, and a MongoDB server containing the users' information and secrets storage. The user logs in with their email and password, with the password being compared to a stored hash, a JWT token is stored client side, and an API request is made to compare the JWT; if a match is found, the login occurs and the client will display the plaintest secrets from the MongoDB server.

## 3. Decomposition

Currently there are three roles: read, manage, and admin, but in the current implementation all roles basically have admin privelege. Entry points are during user registration, login authentication, secret retreival(currently retreives all), secret creation, and deleting secrets (currently available to all users). The application's external dependencies are MongoDB, bcryptjs, JWT, and Node.js for the runtime.

## 4. Threat analysis

The application is currently vulnerable to network attacks (HTTP, traffic unencrypted), authentication attacks (no MFA, brute force possible, no JWT token expiration), insider attacks (all users have admin access), and data attacks (all secrets unencrypted, no DB authentication, audit logs manually adjustable). For example, a disgruntled employee could access any key in the storage and then proceed to gain access to company information that they otherwise would not have access to, while manually changing audit logs to hide his tracks. This would compromise the company's production infrastructure. An external attacker could scan for an exposed MongoDB instance and proceed to encrypt the secrets themselves, essentially making them all unusable unless a ransom is paid.

## 5. Vulnerability analysis

The application is facing broken access control (user access priveleges not really implemented), cryptographic failures (plaintext secret storage, HTTP and no TLS), authentication failure(local JWT, no session expiration, no brute force protection), security logging and monitoring issues (no session attribution, log issues), and security misconfiguration (no database authentication).

## 6. Attack modeling (narratives)

An attacker with could get access to the MongoDB server (which is not protected by auth) and run something like this: 
mongosh mongodb://localhost:27017/keykeeper

show collections
db.secrets.find({})

db.users.updateOne(
  {email: "attacker@example.com"},
  {$set: {role: "admin"}}
)
The attacker now has an account with admin priveleges, and can access everything in the application. They could also just edit/delete secrets from the db directly. 

## 7. Risk & impact + mitigations
The highest impact fixes are encrypting secrets, fixing access controls, adding MongoDB authentication, and implementing TLS/HTTPS. These are by far the most dangerous vulnerabilities currently present in the application due to their ease of exploitability and high possibility of damage, and these fixes would each provide an additional layer of security to the application. Some more minor fixes would be adding rate limiting, JWT expiration, and comprehensive audit logging; these are issues that aren't hugely problematic by themselves but rather are exacerbated by the highest impact issues, and thus these fixes can come after.
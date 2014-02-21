# Berkeleydir

http://berkeleydir.herokuapp.com/
Easily search through the Berkeley Directory.

## Start server

```
node fileserver.js
```
And go to [http://localhost:3000/](http://localhost:3000/)

## Start crawling

```
node ldap.js
```

## Add heroku as a remote

```
git remote add heroku git@heroku.com:berkeleydir.git
```

## Push to Heroku

```
git push heroku gh-pages:master
```

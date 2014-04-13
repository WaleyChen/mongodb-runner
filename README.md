# mongoscope

![mongoscope-demo-v0.0.3](https://cloud.githubusercontent.com/assets/23074/2688434/2d1f3b5a-c29e-11e3-969a-367020b729b6.gif)


```
> ./bin/mongoscope.js
```

## settings

- `listen`: what the http interface should listen on. default `127.0.0.1:29017`
- `seed`: url of an initial deployment to discover on startup. default `mongodb://localhost:27017`
- `token:lifetime`: minutes to allow tokens to be used before requiring a new one. default `60`
- `token:secret`: string used to sign and verify tokens.

## dev

### install

```
npm install
```

### test

```
npm test
```

### bake binary

```
npm run-script dist
```


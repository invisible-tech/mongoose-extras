# @invisible/mongoose

[![CircleCI](https://circleci.com/gh/invisible-tech/mongoose-extras/tree/master.svg?style=svg)](https://circleci.com/gh/invisible-tech/mongoose-extras/tree/master)

This module wraps `mongoose` and expose auxiliary methods.

## Install

```bash
yarn add @invisible/mongoose
# or
npm install @invisible/mongoose
```

## Usage
```js
const { 
  mongoose,
  initConnection,
} = require('@invisible/mongoose')

initConnection('mongodb://localhost/test') // initialize a mongoose connection.

const { Schema } = mongoose // you can use mongoose normally.

const schema = new Schema({})
const Model = mongoose.model('Model', schema)
```

## For more information

- Documentation is available at [@invisible/mongoose](https://invisible-tech.github.io/mongoose-extras/)!

## License
MIT

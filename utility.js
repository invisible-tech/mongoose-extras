'use strict'

const exportForTest = (module, obj) => {
  if (isTestEnv()) {
    module.exports._test = obj
  }
}

const isTestEnv = () => Boolean(process.env.NODE_ENV === 'test')

module.exports = {
  exportForTest,
  isTestEnv,
}

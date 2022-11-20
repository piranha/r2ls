module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "globals": {
    "twinspark": "readonly",
    "bootstrap": "readonly",
  },
  "extends": "eslint:recommended",
  "overrides": [
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_",
                                 "args": "none" }],
    "no-unreachable": ["warn"],
  }
}

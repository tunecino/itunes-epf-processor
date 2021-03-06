import * as Joi from 'joi'

export enum Environments {
  Test = 'test',
  Development = 'development',
  Production = 'production'
}

export interface IEnvironmentVariables {
  NODE_ENV?: string
  DEBUG?: boolean
  MONGO_HOST?: string

  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_REGION?: string

  AWS_LOG_GROUP?: string
  SENTRY_URL?: string

  EPF_USERNAME?: string
  EPF_PASSWORD?: string

  Environments: typeof Environments
}

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config()

// define validation for all the env vars
const allowedEnvKeys: Joi.SchemaMap = {
  NODE_ENV: Joi.string()
    .valid([Environments.Test, Environments.Development, Environments.Production])
    .required(),
  DEBUG: Joi.boolean().optional(),
  MONGO_HOST: Joi.string().required(),
  SENTRY_URL: Joi.string().uri().allow('').optional(),
  AWS_LOG_GROUP: Joi.string().allow('').optional(),
  EPF_USERNAME: Joi.string().required(),
  EPF_PASSWORD: Joi.string().required()
}

let envVarsSchema = Joi.object(allowedEnvKeys).unknown().required()

if (process.env.NODE_ENV === Environments.Production) {
  const envVarsProduction = Joi.object({

  })

  envVarsSchema = envVarsSchema.concat(envVarsProduction)
}

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envKeys = Object.keys(allowedEnvKeys)

const config: IEnvironmentVariables = {
  Environments: Environments
}

for (const key of envKeys) {
  config[key] = envVars[key]
}

export default config

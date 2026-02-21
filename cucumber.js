const tags = process.env.TAGS || '';

module.exports = {
  default: {
    paths: ['src/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: [
      'src/support/env.ts',
      'src/support/world.ts',
      'src/support/hooks.ts',
      'src/steps/**/*.ts'
    ],
    format: [
      'progress-bar',
      'json:reports/cucumber-report.json'
    ],
    tags,
    parallel: Number(process.env.PARALLEL || 1),
    retry: Number(process.env.RETRY || 1),
    failFast: false
  }
};

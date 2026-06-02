const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Fix for Expo SDK 53 + Gradle 8.13: kotlinVersion not available in dependencies block.
 * See: https://github.com/expo/expo/issues/36461
 *
 * The generated build.gradle is missing kotlinVersion in the buildscript ext{} block.
 * This plugin patches it in after prebuild generates the file.
 */
const withKotlinVersionFix = (config, { kotlinVersion = '2.0.21' } = {}) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const buildGradlePath = path.join(
        config.modRequest.platformProjectRoot,
        'build.gradle'
      );

      if (!fs.existsSync(buildGradlePath)) {
        console.warn('[withKotlinVersionFix] build.gradle not found at:', buildGradlePath);
        return config;
      }

      let contents = fs.readFileSync(buildGradlePath, 'utf8');

      // Idempotent check
      if (contents.includes('// @generated withKotlinVersionFix')) {
        console.log('[withKotlinVersionFix] Already applied, skipping.');
        return config;
      }

      const kotlinLine = `    kotlinVersion = findProperty('android.kotlinVersion') ?: '${kotlinVersion}'`;
      const marker = '// @generated withKotlinVersionFix';

      // Strategy 1: Insert into existing buildscript { ext { ... } } block
      // Match the ext block inside buildscript
      const extBlockRegex = /(buildscript\s*\{[^}]*ext\s*\{)([^}]*?)(\})/s;
      if (extBlockRegex.test(contents)) {
        contents = contents.replace(extBlockRegex, (match, open, body, close) => {
          // Only add if not already present
          if (body.includes('kotlinVersion')) {
            return match;
          }
          return `${open}${body}${kotlinLine}\n${close}`;
        });
        contents = `${marker}\n` + contents;
        fs.writeFileSync(buildGradlePath, contents);
        console.log('[withKotlinVersionFix] Inserted kotlinVersion into existing ext{} block.');
        return config;
      }

      // Strategy 2: Insert ext{} block inside buildscript{}
      const buildscriptRegex = /(buildscript\s*\{)/;
      if (buildscriptRegex.test(contents)) {
        const extBlock = `\n    ext {\n${kotlinLine}\n    }\n`;
        contents = contents.replace(buildscriptRegex, `$1${extBlock}`);
        contents = `${marker}\n` + contents;
        fs.writeFileSync(buildGradlePath, contents);
        console.log('[withKotlinVersionFix] Added ext{} block inside buildscript{}.');
        return config;
      }

      // Strategy 3: Prepend entire buildscript with ext block at top of file
      const fullBlock = `${marker}\nbuildscript {\n    ext {\n${kotlinLine}\n    }\n}\n\n`;
      contents = fullBlock + contents;
      fs.writeFileSync(buildGradlePath, contents);
      console.log('[withKotlinVersionFix] Prepended buildscript ext{} block at top of file.');

      return config;
    },
  ]);
};

module.exports = withKotlinVersionFix;

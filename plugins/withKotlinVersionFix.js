const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Custom Expo config plugin to fix Gradle 8.13 kotlinVersion resolution.
 * 
 * Problem: expo-build-properties sets kotlinVersion in gradle.properties but
 * Gradle 8.13 does not expose gradle.properties values as ext properties in
 * the dependencies{} block. The generated root build.gradle references
 * $kotlinVersion in the Kotlin classpath dependency, causing:
 * "Could not get unknown property 'kotlinVersion'"
 * 
 * Fix: Prepend ext { kotlinVersion = "..." } to the root build.gradle BEFORE
 * the dependencies block so it's available as a project ext property.
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
        console.warn('[withKotlinVersionFix] build.gradle not found, skipping.');
        return config;
      }

      let contents = fs.readFileSync(buildGradlePath, 'utf8');

      const extBlock = `ext {\n    kotlinVersion = "${kotlinVersion}"\n}\n\n`;
      const marker = '// @generated begin withKotlinVersionFix';

      // Idempotent: don't apply twice
      if (contents.includes(marker)) {
        return config;
      }

      // Prepend ext block at the very top (before buildscript or allprojects)
      contents = `${marker}\n${extBlock}// @generated end withKotlinVersionFix\n` + contents;

      fs.writeFileSync(buildGradlePath, contents);
      console.log('[withKotlinVersionFix] Prepended ext { kotlinVersion } to build.gradle');

      return config;
    },
  ]);
};

module.exports = withKotlinVersionFix;

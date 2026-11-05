const { withXcodeProject } = require('expo/config-plugins');

const PHASE_NAME = 'Bundle React Native code and images';
const SCRIPT_MARKER = 'react-native-xcode.sh';
const SAFE_INVOCATION = [
  'SCRIPT_PATH=\\"$(\\"$NODE_BINARY\\" --print \\"require(\'path\').dirname(require.resolve(\'react-native/package.json\')) + \'/scripts/react-native-xcode.sh\'\\")\\"',
  '\\"$SCRIPT_PATH\\"',
].join('\\n');

module.exports = function withPathSafeIosBundle(config) {
  return withXcodeProject(config, (modConfig) => {
    const phases = modConfig.modResults.hash.project.objects.PBXShellScriptBuildPhase ?? {};

    for (const phase of Object.values(phases)) {
      if (
        !phase ||
        typeof phase !== 'object' ||
        !String(phase.name).includes(PHASE_NAME) ||
        typeof phase.shellScript !== 'string'
      ) {
        continue;
      }

      const lines = phase.shellScript.split('\\n');
      const invocationIndex = lines.findIndex((line) => line.includes(SCRIPT_MARKER));

      if (invocationIndex >= 0) {
        lines.splice(invocationIndex, 1, SAFE_INVOCATION);
        phase.shellScript = lines.join('\\n');
      }
    }

    return modConfig;
  });
};

const yacTrack = require('@yac/track');
const yacAutostart = require('@yac/autostart');

module.exports = async (projName, projPath, yacfile, options) => {
  yacTrack.setFileLocation(yacfile, options);
  const info = await yacTrack.getInfo();
  const project = yacAutostart.getProject(info, projName, projPath);
  project.autostart = false;
  await yacTrack.writeInfo(info);
}

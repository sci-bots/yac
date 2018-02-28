const yacTrack = require('@yac/track');
const yacAutostart = require('@yac/autostart');

module.exports = (projName, projPath) => {
  const info = yacTrack.getInfo();
  const project = yacAutostart.getProject(info, projName, projPath);
  project.autostart = false;
  yacTrack.writeInfo(info);
  console.log("Project removed from autostart");
}

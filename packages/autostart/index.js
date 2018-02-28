const _ = require('lodash');
const yacTrack = require('@yac/track');

const getProject = (info, projName, projPath) => {
  let projects = _.filter(info.yacProjects, {name: projName});
  let project;
  if (projects.length > 1) {
    if (projPath == undefined) throw `
      More then one project exist with this name. Please pass
      the project path as an argument
    `;
    projects = _.filter(info.yacProjects, {name: projName, path: projPath});
  }
  project = projects[0];
  if (project == undefined) throw `
    Could not find project:
    name: ${projName} , path: ${projPath}
  `;
  return project;
}

module.exports = (projName, projPath) => {
  const info = yacTrack.getInfo();
  const project = getProject(info, projName, projPath);
  project.autostart = true;
  yacTrack.writeInfo(info);
}

module.exports.getProject = getProject

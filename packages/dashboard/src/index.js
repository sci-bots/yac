require('bootstrap/dist/css/bootstrap.min.css');

const request = require('browser-request');
const yo = require('yo-yo');
const _ = require('lodash');

const DashboardColumn = (content, colPos='mid', rowPos='mid') => {
  const Styles = {
    item: `
      border-radius: 0px;
      ${colPos == 'first' ? "border-right: none" : ""};
      ${rowPos == 'first' ? "border-bottom: none" : ""};
    `,
    col: `
      padding: 0px;
    `
  }
  return yo`
  <div class="col-sm" style="${Styles.col}">
    <ul class="list-group">
      <li class="list-group-item" style="${Styles.item}">${content}</li>
    </ul>
  </div>
  `
}

class YacDashboard {
  constructor(container) {
    document.body.style.background = Styles.body.background;
    this.container = container;
    this.render();
  }
  render() {
    request('/yacInfo.json', (err, res, body) => {
      let yacInfo = JSON.parse(body);
      let projects = yacInfo.yacProjects;
      this.container.innerHTML = "";
      this.container.appendChild(yo`
        <div class="container-fluid" style="${Styles.container}" >
          <nav class="navbar navbar-light">
            <a class="navbar-brand" href="#">
              <img src="/logo.png" width="100" alt="">
            </a>
          </nav>

          <div class="row">
            ${DashboardColumn('Project Name', 'first', 'first')}
            ${DashboardColumn('Project Path', 'last', 'first')}
          </div>
            ${_.map(projects, (p)=> yo`
              <div class="row">
                ${DashboardColumn(p.name, 'first')}
                ${DashboardColumn(p.path, 'last')}
              </div>
            `
            )}
        </div>
      `);
    });
  }
}

const Styles = {
  body: {
    background: "#f5f5f5"
  },
  container: `
  `
}

module.exports = YacDashboard;
module.exports.init = (container) => { new YacDashboard(container)};

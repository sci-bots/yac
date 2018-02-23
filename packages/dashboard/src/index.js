require('bootstrap/dist/css/bootstrap.min.css');

const request = require('browser-request');
const yo = require('yo-yo');
const _ = require('lodash');

const START_MSG = 'Start';
const STOP_MSG = 'Stop';

let prevHash = "";

const DashboardColumn = (content, colPos='mid', rowPos='mid') => {
  const Styles = {
    col: `
      border-radius: 0px;
      border: 1px solid #d2d2d2;
      padding:10px;
      ${colPos == 'first' ? "border-right: none" : ""};
      ${colPos == 'last' ?  "border-left: none" : ""};
      ${rowPos == 'first' ? "border-bottom: none" : ""};
      background: none;
      ${rowPos == 'first' ? "background: #f1f1f1" : ""};
    `
  }
  return yo`
  <div class="col-sm" style="${Styles.col}">
    ${content}
  </div>
  `
}

const DashboardButton = (p, callback) => {
  let msg;
  if (p.pid != undefined) msg = STOP_MSG;
  if (p.pid == undefined) msg = START_MSG;

  return yo`
    <button type="button"
      class="btn btn-${p.pid == undefined ? 'success' : 'danger'}"
      onclick=${callback.bind(this, p, msg)}>
      ${msg}
    </button>
  `
}

class YacDashboard {
  constructor(container) {
    _.extend(document.body.style, Styles.body);
    this.container = container;
    this.render();
    setInterval(() => {
      this.render()
    }, 500);
  }

  startPlugin(p, msg, e){
    if (msg == START_MSG) console.log("Starting!");
    if (msg == STOP_MSG)  console.log("Stopping!");

    const body = JSON.stringify(p);
    const req = {method:'POST', url:'/start', body: body, json:true};
    request(req, (err, res, body) => {
      this.render();
    });
  }

  render() {
    request('/yacInfo.json', (err, res, body) => {
      let {projects, hash} = JSON.parse(body);
      if (hash == prevHash) return;
      prevHash = hash;

      this.container.innerHTML = "";
      this.container.appendChild(yo`
        <div class="container" style="${Styles.container}" >
          <nav class="navbar navbar-light">
            <a class="navbar-brand" href="#">
              <img src="/logo.png" width="100" alt="">
            </a>
          </nav>

          <div class="row">
            ${DashboardColumn('Project Name', 'first', 'first')}
            ${DashboardColumn('Project Path', 'mid', 'first')}
            ${DashboardColumn('Process ID', 'mid', 'first')}
            ${DashboardColumn('Start/Stop', 'last', 'first')}
          </div>
            ${_.map(projects, (p) => yo`
              <div class="row">
                ${DashboardColumn(p.name, 'first')}
                ${DashboardColumn(p.path, 'mid')}
                ${DashboardColumn(p.pid || 'not running', 'mid')}
                ${DashboardColumn(
                    DashboardButton(p, this.startPlugin.bind(this)),
                  'last')}
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
    background: "#212529",
    paddingTop: "16px"
  },
  container: `
    background: white;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.65), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  `
}

module.exports = YacDashboard;
module.exports.init = (container) => { new YacDashboard(container)};
